import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { notificationService } from '@/lib/notification-service'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient()
    const body = await req.json()

    // TODO: Replace with real auth
    // For now, mock user id
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id || null
    if (!userId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Insert event with status 'pending' and requested_by
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...body,
        status: 'pending',
        requested_by: userId,
      })
      .select()
      .single()

    if (error || !event) {
      return NextResponse.json({ error: error?.message || 'Failed to create event request' }, { status: 500 })
    }

    // Notify admins (now handled by trigger)

    // Notify user (self)
    await notificationService.createNotification({
      userId: userId,
      title: 'Event Request Submitted',
      message: `Your event request titled "${event.title}" has been submitted and is pending review by admins.`,
      type: 'event_updated',
      priority: 'normal',
      referenceId: event.id,
      referenceType: 'event',
    })

    return NextResponse.json({ success: true, event })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 