import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getToolById } from '@/lib/tools'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Only allow users to fetch their own purchases or admins to fetch any
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin && userId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get tool purchases from the view
    const { data: purchases, error } = await supabase
      .from('tool_purchases')
      .select('*')
      .eq('user_id', userId)
      .order('purchased_at', { ascending: false })

    if (error) {
      console.error('Error fetching tool purchases:', error)
      return NextResponse.json({ error: 'Failed to fetch tool purchases' }, { status: 500 })
    }

    // Enrich purchases with tool data from JSON file
    const enrichedPurchases = (purchases || []).map(purchase => {
      const tool = getToolById(purchase.tool_id)
      return {
        ...purchase,
        tool: tool ? {
          id: tool.id,
          name: tool.name,
          description: tool.description,
          category: tool.category,
          iconName: tool.iconName,
          iconColor: tool.iconColor,
          isPremium: tool.isPremium,
          pointsRequired: tool.pointsRequired
        } : null
      }
    })

    return NextResponse.json({ purchases: enrichedPurchases })
  } catch (error) {
    console.error('Error in tool purchases API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 