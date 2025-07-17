import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendBulkCustomEmails } from "@/lib/email-service"

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

    // Fetch registration details from the database
    const { data: registrations, error: regError } = await supabase
      .from("event_logs")
      .select(`
        id,
        event_id,
        user_id,
        registered_at,
        profiles!event_logs_user_id_fkey (
          full_name,
          email
        ),
        events!event_logs_event_id_fkey (
          title
        )
      `)
      .in("id", registrationIds)

    if (regError || !registrations || registrations.length === 0) {
      return NextResponse.json({ error: "No registrations found for the provided IDs" }, { status: 404 })
    }

    // Use the event title from the first registration (assuming all are for the same event)
    const eventTitle = registrations[0]?.events?.title || "Event"

    // Get the event notification HTML template
    const htmlTemplate = getEventNotificationTemplate()

    // Prepare email data for bulk sending (similar to bulk-email API)
    const emailData = registrations.map((registration: any) => {
      // Process variables for this registration
      let processedBody = htmlTemplate
      
      const variables = {
        '{{name}}': registration.profiles?.full_name || 'Participant',
        '{{participantName}}': registration.profiles?.full_name || 'Participant',
        '{{email}}': registration.profiles?.email || '',
        '{{eventTitle}}': eventTitle,
        '{{eventName}}': eventTitle,
        '{{message}}': message,
        '{{registrationId}}': registration.id,
        '{{eventId}}': eventId || '',
        '{{eventLink}}': eventId ? `https://mockify.vercel.app/events/${eventId}` : 'https://mockify.vercel.app/events'
      }

      // Replace variables in the HTML template
      Object.entries(variables).forEach(([key, value]) => {
        processedBody = processedBody.replace(new RegExp(key, 'g'), value)
      })

      // Process subject line variables
      const processedSubject = subject.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
        return (variables as any)[`{{${key}}}`] || match
      })

      return {
        to: registration.profiles?.email || '',
        variables: {
          name: registration.profiles?.full_name || 'Participant',
          participantName: registration.profiles?.full_name || 'Participant',
          email: registration.profiles?.email || '',
          eventTitle: eventTitle,
          eventName: eventTitle,
          message: message,
          registrationId: registration.id,
          eventId: eventId || '',
          eventLink: eventId ? `https://mockify.vercel.app/events/${eventId}` : 'https://mockify.vercel.app/events'
        },
        htmlContent: processedBody
      }
    }).filter(data => data.to) // Filter out any entries without email addresses

    // Send bulk emails using the same pattern as bulk-email API
    const result = await sendBulkCustomEmails(
      emailData.map(data => ({
        to: data.to,
        variables: data.variables,
        htmlContent: data.htmlContent
      })),
      subject
    )

    return NextResponse.json({
      success: true,
      message: `Successfully sent email notifications to ${result.count} event participants`,
      recipientCount: registrations.length,
      eventTitle,
      recipients: registrations.map(r => ({
        email: r.profiles?.email || '',
        name: r.profiles?.full_name || 'Participant'
      })),
      emailResult: result
    })

  } catch (error: any) {
    console.error("API error in POST /api/events/notifications/send:", error)
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

// Helper function to get the event notification HTML template
function getEventNotificationTemplate(): string {
  return `
<div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
    <!-- Content -->
    <div style="padding: 40px 30px;">
        <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Hello {{participantName}}!</h2>
        
        <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
            You're invited to participate in <strong>{{eventTitle}}</strong>! Here's the important information you need to know:
        </p>
        
        <div style="background-color: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 20px 0;">
            <h3 style="color: #f57c00; margin: 0 0 15px 0; font-size: 18px;">Event Details</h3>
            <ul style="color: #555555; margin: 0; padding-left: 20px; line-height: 1.8;">
                <li><strong>Event:</strong> {{eventTitle}}</li>
                <li><strong>Registration ID:</strong> {{registrationId}}</li>
                <li><strong>Message:</strong> {{message}}</li>
            </ul>
        </div>
        
        <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
            We're looking forward to seeing you at the event. If you have any questions or need assistance, please don't hesitate to contact us.
        </p>
        
        <!-- Call to Action -->
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{eventLink}}" style="display: inline-block; background: linear-gradient(135deg, #ffc107 0%, #fd7e14 100%); color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: bold; font-size: 16px;">View Event Details</a>
        </div>
        
        <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #1976d2; margin: 0; font-size: 14px; text-align: center;">
                💡 <strong>Need Help?</strong> Contact us at support@mockify.vercel.app
            </p>
        </div>
    </div>
</div>`
} 