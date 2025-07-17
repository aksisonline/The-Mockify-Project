import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get points
    const { data: points, error: pointsError } = await supabase
      .from('points')
      .select('total_points, total_earned, total_spent')
      .eq('user_id', user.id)
      .single()

    if (pointsError) {
      if (pointsError.code === 'PGRST116') {
        // Create default points if none exist
        const { data: newPoints, error: createError } = await supabase
          .from('points')
          .insert({
            user_id: user.id,
            total_points: 0,
            total_earned: 0,
            total_spent: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('total_points, total_earned, total_spent')
          .single()

        if (createError) {
          console.error('Error creating points:', createError)
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json(newPoints)
      }
      console.error('Error fetching points:', pointsError)
      return NextResponse.json({ error: pointsError.message }, { status: 500 })
    }

    // If points is null, return default values
    if (!points) {
      return NextResponse.json({
        total_points: 0,
        total_earned: 0,
        total_spent: 0
      })
    }

    return NextResponse.json(points)
  } catch (error) {
    console.error('Error in GET /api/profile/points:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the updated points from the request body
    const updatedPoints = await request.json()

    // Update points
    const { data: points, error: updateError } = await supabase
      .from('points')
      .update({
        ...updatedPoints,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating points:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(points)
  } catch (error) {
    console.error('Error in PUT /api/profile/points:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 