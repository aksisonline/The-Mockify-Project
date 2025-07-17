import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { emailService } from "@/lib/email-service"

export async function PUT(request: Request) {
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

    const { enrollmentIds, status } = await request.json()

    if (!enrollmentIds || !Array.isArray(enrollmentIds) || enrollmentIds.length === 0) {
      return NextResponse.json({ error: "Enrollment IDs are required" }, { status: 400 })
    }

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: "Valid status is required" }, { status: 400 })
    }

    // Use service role client to bypass RLS policies
    const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
    const serviceClient = createSupabaseServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get current enrollment data to calculate completion times if needed
    const { data: currentEnrollments, error: fetchError } = await serviceClient
      .from("training_enrollments")
      .select("id, enrolled_at, program_id, email, full_name")
      .in("id", enrollmentIds)

    if (fetchError) {
      console.error("Error fetching current enrollments:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Update all enrollments
    const { data, error } = await serviceClient
      .from("training_enrollments")
      .update({ 
        enrollment_status: status, 
        updated_at: new Date().toISOString() 
      })
      .in("id", enrollmentIds)
      .select()

    if (error) {
      console.error("Error updating enrollments:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email notifications for status changes
    try {
      if (status !== 'pending') { // Don't send emails for pending status in mass update
        const enrollmentsToNotify = currentEnrollments || []
        
        if (enrollmentsToNotify.length > 0) {
          // Get program details for all programs
          const programIds = [...new Set(enrollmentsToNotify.map(e => e.program_id))]
          const { data: programs, error: programsError } = await serviceClient
            .from("training_programs")
            .select("id, title")
            .in("id", programIds)

          if (programsError) {
            console.error("Error fetching program details:", programsError)
          }

          const programsMap = new Map(programs?.map(p => [p.id, p.title]) || [])

          // Prepare all recipients for bulk email
          const allRecipients = enrollmentsToNotify.map(enrollment => {
            const programTitle = programsMap.get(enrollment.program_id) || "Training Program"
            
            let subject = ""
            let message = ""

            if (status === "confirmed") {
              subject = "Training Enrollment Confirmed - Payment Received"
              message = "Great news! Your training enrollment has been confirmed and payment has been received. We will contact you soon with further details about the program schedule and requirements."
            } else if (status === "completed") {
              // Calculate completion time for each individual enrollment
              const enrollmentDate = new Date(enrollment.enrolled_at)
              const completionDate = new Date()
              const timeDiff = completionDate.getTime() - enrollmentDate.getTime()
              const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
              const completionTime = daysDiff === 1 ? "1 day" : `${daysDiff} days`
              
              subject = "Congratulations! Training Program Completed"
              message = `Congratulations! You have successfully completed the ${programTitle} training program in ${completionTime} from your enrollment date. Your certificate will be issued shortly.`
            } else if (status === "cancelled") {
              subject = "Training Enrollment Cancelled"
              message = "Your training enrollment has been cancelled. If you have any questions or would like to re-enroll, please contact our support team."
            }

            return {
              email: enrollment.email,
              full_name: enrollment.full_name,
              id: enrollment.id,
              programTitle,
              programId: enrollment.program_id,
              subject,
              message
            }
          }).filter(recipient => recipient.subject && recipient.message)

          if (allRecipients.length > 0) {
            // console.log(`📧 Sending bulk ${status} status emails to ${allRecipients.length} recipients...`)
            
            // Send all emails in one bulk call
            const emailResult = await emailService.sendTrainingNotificationEmails(
              allRecipients.map(r => ({
                email: r.email,
                full_name: r.full_name,
                id: r.id
              })),
              allRecipients[0].subject, // Use first subject as template
              allRecipients[0].message, // Use first message as template
              "Training Program", // Generic program title for bulk
              undefined // No specific program ID for bulk
            )
            
            // console.log(`✅ Successfully sent bulk ${status} status emails to ${emailResult.count} recipients`)
          }
        }
      }
    } catch (notificationError) {
      console.error("Error sending mass status update notifications:", notificationError)
      // Don't throw error here as the status updates were successful
    }

    return NextResponse.json({ 
      message: `Successfully updated ${data.length} enrollments`,
      updatedEnrollments: data 
    })

  } catch (error: any) {
    console.error("API error in PUT /api/training/enrollments/mass-update:", error)
    return NextResponse.json({ error: error.message || "Failed to update enrollments" }, { status: 500 })
  }
} 