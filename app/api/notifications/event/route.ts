import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendEventNotification } from "@/lib/notification-service"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile || !profile.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { subject, message, eventId, registrationIds } = await request.json()

    if (!subject || !message) {
      return NextResponse.json({ error: "Subject and message are required" }, { status: 400 })
    }

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json({ error: "Registration IDs are required" }, { status: 400 })
    }

    console.log(`Processing event notification request for ${registrationIds.length} registrations`)

    // Use the notification service to send email notifications
    const result = await sendEventNotification(registrationIds, subject, message, eventId)
    
    return NextResponse.json({ 
      message: `Successfully sent email notifications to ${result.recipients.length} event participants`,
      emailsSent: result.emailsSent,
      eventTitle: result.eventTitle,
      recipients: result.recipients.map(r => ({
        email: r.email,
        name: r.name
      })),
      success: true
    })

  } catch (error: any) {
    console.error("API error in POST /api/notifications/event:", error)
    
    // Provide more specific error messages
    let errorMessage = "Failed to send event notifications"
    if (error.message?.includes("No registrations found")) {
      errorMessage = "No event registrations found for the provided IDs"
    } else if (error.message?.includes("Email API error")) {
      errorMessage = "Failed to send emails. Please check the email service configuration."
    } else if (error.message) {
      errorMessage = error.message
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      success: false 
    }, { status: 500 })
  }
} 