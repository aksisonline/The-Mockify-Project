import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      templateName,
      userId, 
      variables,
      options = {}
    } = body

    if (!templateName || !userId || !variables) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    // Get template
    const { data: template, error: templateError } = await supabase
      .from('notification_templates')
      .select('*')
      .eq('name', templateName)
      .eq('is_active', true)
      .single()

    if (templateError || !template) {
      console.error('Template not found:', templateName)
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    // Replace template variables
    let title = template.title_template
    let message = template.message_template

    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      title = title.replace(new RegExp(placeholder, 'g'), value)
      message = message.replace(new RegExp(placeholder, 'g'), value)
    })

    // Create notification
    const notificationData = {
      user_id: userId,
      title,
      message,
      notification_type: String(template.notification_type),
      priority: template.default_priority,
      data: options.data,
      reference_id: options.referenceId,
      reference_type: options.referenceType,
      triggered_by: options.triggeredBy,
      action_url: options.actionUrl,
      action_text: options.actionText,
      expires_at: options.expiresAt
    }

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification from template:', error)
      return NextResponse.json(
        { error: 'Failed to create notification' },
        { status: 500 }
      )
    }

    return NextResponse.json(notification)
  } catch (error) {
    console.error('Error in create notification from template API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 