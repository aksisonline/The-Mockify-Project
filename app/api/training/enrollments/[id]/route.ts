import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { emailService } from "@/lib/email-service"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
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

    const { enrollment_status } = await request.json()

    if (!enrollment_status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(enrollment_status)) {
      return NextResponse.json({ error: "Valid enrollment status is required" }, { status: 400 })
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

    // Get current enrollment data to calculate completion time if needed
    const { data: currentEnrollment, error: fetchError } = await serviceClient
      .from("training_enrollments")
      .select("enrolled_at, program_id, email, full_name")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching current enrollment:", fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    // Update the enrollment
    const { data, error } = await serviceClient
      .from("training_enrollments")
      .update({ 
        enrollment_status, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating enrollment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Send email notification for status changes
    try {
      if (enrollment_status !== 'pending') { // Don't send emails for pending status
        // Get program details for email notification
        const { data: program, error: programError } = await serviceClient
          .from("training_programs")
          .select("title")
          .eq("id", data.program_id)
          .single()

        const programTitle = program?.title || "Training Program"

        let subject = ""
        let message = ""

        if (enrollment_status === "confirmed") {
          subject = "Training Enrollment Confirmed - Payment Received"
          message = "Great news! Your training enrollment has been confirmed and payment has been received. We will contact you soon with further details about the program schedule and requirements."
        } else if (enrollment_status === "completed") {
          // Calculate completion time
          const enrollmentDate = new Date(currentEnrollment.enrolled_at)
          const completionDate = new Date()
          const timeDiff = completionDate.getTime() - enrollmentDate.getTime()
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
          
          const completionTime = daysDiff === 1 ? "1 day" : `${daysDiff} days`
          
          subject = "Congratulations! Training Program Completed"
          message = `Congratulations! You have successfully completed the ${programTitle} training program in ${completionTime} from your enrollment date. Your certificate will be issued shortly.`
        } else if (enrollment_status === "cancelled") {
          subject = "Training Enrollment Cancelled"
          message = "Your training enrollment has been cancelled. If you have any questions or would like to re-enroll, please contact our support team."
        }

        if (subject && message) {
          await emailService.sendTrainingNotificationEmails(
            [{
              email: data.email,
              full_name: data.full_name,
              id: data.id
            }],
            subject,
            message,
            programTitle,
            data.program_id
          )
          // console.log(`✅ Sent ${enrollment_status} status email to ${data.email} for ${programTitle}`)
        }
      }
    } catch (notificationError) {
      console.error("Error sending status update notification:", notificationError)
      // Don't throw error here as the status update was successful
    }

    return NextResponse.json({ 
      message: "Enrollment updated successfully",
      enrollment: data 
    })

  } catch (error: any) {
    console.error("API error in PUT /api/training/enrollments/[id]:", error)
    return NextResponse.json({ error: error.message || "Failed to update enrollment" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
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

    // Delete the enrollment
    const { error } = await serviceClient
      .from("training_enrollments")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("Error deleting enrollment:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "Enrollment deleted successfully"
    })

  } catch (error: any) {
    console.error("API error in DELETE /api/training/enrollments/[id]:", error)
    return NextResponse.json({ error: error.message || "Failed to delete enrollment" }, { status: 500 })
  }
}
