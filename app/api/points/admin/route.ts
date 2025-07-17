import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"
import { awardPoints } from "@/lib/points-service"

// POST /api/points/admin - Award points to a user (admin only)
export async function POST(request: Request) {
  try {
    // Get the request body
    const body = await request.json()

    // Validate request
    if (!body.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!body.reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    if (!body.adminKey) {
      return NextResponse.json({ error: "Admin key is required" }, { status: 401 })
    }

    // Award points
    const transaction = await awardPoints(body.userId, body.amount, body.reason, body.adminKey, body.metadata)

    return NextResponse.json({ transaction })
  } catch (error: any) {
    console.error("Admin points API error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Failed to award points" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check admin access first
    await withAuth(UserRole.Admin)()
    
    // Use service role client to bypass RLS policies
    const supabase = createServiceRoleClient()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'

    const offset = (page - 1) * limit

    // If searching, first get user IDs that match the search criteria
    let userIds: string[] = []
    if (search) {
      const { data: matchingUsers } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      
      if (matchingUsers) {
        userIds = matchingUsers.map(user => user.id)
      }
    }

    // Build query for transactions table
    let query = supabase
      .from('transactions')
      .select(`
        *,
        user:user_id (
          id,
          full_name,
          email,
          avatar_url
        ),
        category:category_id (
          id,
          name,
          display_name
        )
      `, { count: 'exact' })

    // Apply filters
    if (search && userIds.length > 0) {
      query = query.in('user_id', userIds)
    } else if (search && userIds.length === 0) {
      // If search term provided but no matching users found, return empty result
      return NextResponse.json({
        transactions: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      })
    }

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    if (category !== 'all') {
      query = query.eq('category.name', category)
    }

    // Only get points transactions
    query = query.eq('transaction_type', 'points')

    // Apply pagination and ordering
    const { data: transactions, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching points transactions:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    return NextResponse.json({
      transactions: transactions || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    })

  } catch (error) {
    console.error('Error in GET /api/points/admin:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
