import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from 'next/server'

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  marketing_emails: true,
  receive_newsletters: true,
  get_ekart_notifications: true,
  stay_updated_on_jobs: true,
  receive_daily_event_updates: false,
  get_trending_community_posts: true,
}

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get notification settings
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      if (settingsError.code === 'PGRST116') {
        // Create default settings if none exist
        const { data: newSettings, error: createError } = await supabase
          .from('notification_settings')
          .insert({
            user_id: user.id,
            ...DEFAULT_NOTIFICATION_SETTINGS,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (createError) {
          console.error('Error creating notification settings:', createError)
          return NextResponse.json({ error: createError.message }, { status: 500 })
        }

        return NextResponse.json(newSettings)
      }
      console.error('Error fetching notification settings:', settingsError)
      return NextResponse.json({ error: settingsError.message }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in GET /api/profile/notification-settings:', error)
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

    // Get the updated settings from the request body
    const updatedSettings = await request.json()

    // Update notification settings
    const { data: settings, error: updateError } = await supabase
      .from('notification_settings')
      .update({
        ...updatedSettings,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating notification settings:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error in PUT /api/profile/notification-settings:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 