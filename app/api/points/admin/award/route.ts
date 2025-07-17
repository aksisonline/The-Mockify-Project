import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"
import { awardCategoryPoints } from "@/lib/points-category-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Check admin access
    await withAuth(UserRole.Admin)()

    const { userId, amount, reason, category } = await request.json()

    if (!userId || !amount || !reason || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await awardCategoryPoints(
      userId,
      category,
      parseInt(amount),
      reason,
      { adminAwarded: true }
    )

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to award points' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      transactionId: result.transactionId,
      message: 'Points awarded successfully' 
    })

  } catch (error) {
    console.error('Error in POST /api/points/admin/award:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 