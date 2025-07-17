import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      transactionType,
      amount,
      type,
      reason,
      metadata,
      categoryId,
      userId
    } = body

    if (!transactionType || !amount || !type || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get the current user if userId is not provided
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json(
          { error: 'User not authenticated' },
          { status: 401 }
        )
      }
      currentUserId = user.id
    }

    // Check if user has sufficient points for spending transactions
    if (type === 'spend' && transactionType === 'points') {
      const { data: pointsData, error: pointsError } = await supabase
        .from('points')
        .select('total_points')
        .eq('user_id', currentUserId)
        .single()

      if (pointsError) {
        console.error('Error fetching user points:', pointsError)
        return NextResponse.json(
          { error: 'Failed to check user points' },
          { status: 500 }
        )
      }

      const currentPoints = pointsData?.total_points || 0
      if (currentPoints < amount) {
        return NextResponse.json(
          { 
            error: 'Insufficient points',
            errorCode: 'INSUFFICIENT_POINTS',
            currentPoints,
            requiredPoints: amount
          },
          { status: 400 }
        )
      }
    }

    // Create the transaction
    const transactionData = {
      user_id: currentUserId,
      transaction_type: transactionType,
      amount,
      type,
      reason,
      metadata,
      category_id: categoryId,
      status: 'completed',
      created_at: new Date().toISOString()
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert(transactionData)
      .select()
      .single()

    if (error) {
      console.error('Error creating transaction:', error)
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      )
    }

    // Update user points if this is a points transaction
    if (transactionType === 'points') {
      // First get current points
      const { data: currentPointsData, error: currentPointsError } = await supabase
        .from('points')
        .select('total_points, total_earned, total_spent')
        .eq('user_id', currentUserId)
        .single()

      if (currentPointsError && currentPointsError.code !== 'PGRST116') {
        console.error('Error fetching current points:', currentPointsError)
      } else {
        const currentPoints = currentPointsData?.total_points || 0
        const currentEarned = currentPointsData?.total_earned || 0
        const currentSpent = currentPointsData?.total_spent || 0

        const newPoints = type === 'earn' ? currentPoints + amount : currentPoints - amount
        const newEarned = type === 'earn' ? currentEarned + amount : currentEarned
        const newSpent = type === 'spend' ? currentSpent + amount : currentSpent

        const { error: updateError } = await supabase
          .from('points')
          .upsert({
            user_id: currentUserId,
            total_points: newPoints,
            total_earned: newEarned,
            total_spent: newSpent,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })

        if (updateError) {
          console.error('Error updating user points:', updateError)
          // Don't fail the transaction, just log the error
        }
      }
    }

    return NextResponse.json({
      success: true,
      transaction
    })
  } catch (error) {
    console.error('Error in create transaction API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 