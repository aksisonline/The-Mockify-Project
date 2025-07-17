import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { notificationService } from "@/lib/notification-service"

export async function POST(req: NextRequest) {
  try {
    const { event_id } = await req.json()
    if (!event_id) {
      return NextResponse.json({ success: false, error: "Missing event_id" }, { status: 400 })
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 })
    }

    // Check if user is already registered for this event
    const { data: existingRegistration, error: checkError } = await supabase
      .from("event_logs")
      .select("id")
      .eq("event_id", event_id)
      .eq("user_id", user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: checkError.message }, { status: 500 })
    }

    // If user is already registered, return success with alreadyRegistered flag
    if (existingRegistration) {
      return NextResponse.json({ 
        success: true, 
        alreadyRegistered: true,
        message: "You are already registered for this event"
      })
    }

    // Insert new registration
    const { error: insertError } = await supabase.from("event_logs").insert({
      event_id,
      user_id: user.id,
    })

    if (insertError) {
      // Check if this is a unique constraint violation (user already registered)
      if (insertError.code === '23505' && insertError.message.includes('event_logs_user_event_unique')) {
        return NextResponse.json({ 
          success: true, 
          alreadyRegistered: true,
          message: "You are already registered for this event"
        })
      }
      return NextResponse.json({ success: false, error: insertError.message }, { status: 500 })
    }

    // Fetch event details for notification
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title")
      .eq("id", event_id)
      .single()

    let notificationError = null
    if (event && event.title) {
      try {
        await notificationService.createNotification({
          userId: user.id,
          title: "Event Registration Successful",
          message: `You have registered for the event: ${event.title}`,
          type: "event_reminder",
          referenceId: event_id,
          referenceType: "event",
        })
      } catch (err) {
        notificationError = err
        // Log but don't fail the request
        console.error("Failed to send notification:", err)
      }
    }

    return NextResponse.json({ 
      success: true, 
      alreadyRegistered: false,
      notificationError: notificationError ? String(notificationError) : undefined 
    })
  } catch (err) {
    return NextResponse.json({ success: false, error: (err as Error).message }, { status: 500 })
  }
} 