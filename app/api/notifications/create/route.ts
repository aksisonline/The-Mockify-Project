import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      userId, 
      title, 
      message, 
      type, 
      priority = 'normal',
      data,
      referenceId,
      referenceType,
      triggeredBy,
      actionUrl,
      actionText,
      expiresAt
    } = body

    if (!userId || !title || !message || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const notificationData = {
      user_id: userId,
      title,
      message,
      notification_type: String(type),
      priority,
      data,
      reference_id: referenceId,
      reference_type: referenceType,
      triggered_by: triggeredBy,
      action_url: actionUrl,
      action_text: actionText,
      expires_at: expiresAt
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error in create notification API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 