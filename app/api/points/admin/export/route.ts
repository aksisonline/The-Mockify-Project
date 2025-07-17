import { NextRequest, NextResponse } from "next/server"
import { createServerClient, createServiceRoleClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"

export async function GET(request: NextRequest) {
  try {
    // Check admin access first
    await withAuth(UserRole.Admin)()
    
    // Use service role client to bypass RLS policies
    const supabase = createServiceRoleClient()

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'
    const search = searchParams.get('search') || ''
    const filterType = searchParams.get('filterType') || 'all'
    const filterCategory = searchParams.get('filterCategory') || 'all'
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const rowCount = parseInt(searchParams.get('rowCount') || '1000')

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
      `)

    // Apply filters
    if (search) {
      // If searching, first get user IDs that match the search criteria
      const { data: matchingUsers } = await supabase
        .from('profiles')
        .select('id')
        .or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
      
      if (matchingUsers && matchingUsers.length > 0) {
        const userIds = matchingUsers.map(user => user.id)
        query = query.in('user_id', userIds)
      } else {
        // If search term provided but no matching users found, return empty result
        return new NextResponse('User,Amount,Type,Category,Reason,Date\n', {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="points-transactions-${new Date().toISOString().split('T')[0]}.csv"`
          }
        })
      }
    }

    if (filterType !== 'all') {
      query = query.eq('type', filterType)
    }

    if (filterCategory !== 'all') {
      query = query.eq('category.name', filterCategory)
    }

    // Only get points transactions
    query = query.eq('transaction_type', 'points')

    // Apply date filters if custom range is selected
    if (type === 'custom') {
      if (startDate) {
        query = query.gte('created_at', `${startDate}T00:00:00`)
      }
      if (endDate) {
        query = query.lte('created_at', `${endDate}T23:59:59`)
      }
    }

    // Apply row limit
    if (type === 'custom' && rowCount > 0) {
      query = query.limit(rowCount)
    }

    // Apply ordering
    const { data: transactions, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching transactions for export:', error)
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
    }

    // Convert to CSV
    const csvContent = [
      ['User', 'Amount', 'Type', 'Category', 'Reason', 'Date'],
      ...(transactions || []).map((tx: any) => [
        tx.user?.full_name || tx.user?.email || tx.user_id || 'Unknown User',
        tx.amount,
        tx.type,
        tx.category?.display_name || tx.category?.name || 'General',
        tx.reason,
        new Date(tx.created_at).toLocaleString()
      ])
    ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="points-transactions-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error in GET /api/points/admin/export:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 