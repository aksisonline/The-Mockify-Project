import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// PUT - Update job application status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Validate status
    const validStatuses = ['pending', 'reviewing', 'interviewed', 'rejected', 'accepted']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` 
      }, { status: 400 })
    }

    // First, get the application to verify ownership
    const { data: application, error: fetchError } = await supabase
      .from("job_applications")
      .select(`
        *,
        jobs (
          id,
          posted_by
        )
      `)
      .eq("id", id)
      .single()

    if (fetchError || !application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    // Check if the user owns the job
    if (application.jobs.posted_by !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Update the application status
    const { data: updatedApplication, error: updateError } = await supabase
      .from("job_applications")
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating job application status:", updateError)
      return NextResponse.json({ error: "Failed to update application status" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      application: updatedApplication,
      message: "Application status updated successfully" 
    })
  } catch (error) {
    console.error("Error in PUT /api/jobs/applications/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 