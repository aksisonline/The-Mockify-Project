import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET - Get a specific job by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    const supabase = await createServerClient()
    
    // First, get the job without approval queue restriction
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Check approval queue status separately
    const { data: approvalQueue, error: approvalError } = await supabase
      .from("job_approval_queue")
      .select("status")
      .eq("job_id", id)
      .single()

    // If there's no approval queue entry, treat as approved (for backward compatibility)
    // If there is an entry, only show approved jobs
    const approvalStatus = approvalQueue?.status || 'approved'
    
    if (approvalStatus !== 'approved') {
      return NextResponse.json({ error: "Job not available" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error in GET /api/jobs/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT - Update a job
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Check if user owns this job
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("posted_by", user.id)
      .single()

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 })
    }

    // Update the job
    const { data: updatedJob, error: updateError } = await supabase
      .from("jobs")
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .eq("posted_by", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating job:", updateError)
      return NextResponse.json({ error: "Failed to update job" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      job: updatedJob,
      message: "Job updated successfully" 
    })
  } catch (error) {
    console.error("Error in PUT /api/jobs/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a job
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if user owns this job
    const { data: existingJob, error: fetchError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", id)
      .eq("posted_by", user.id)
      .single()

    if (fetchError || !existingJob) {
      return NextResponse.json({ error: "Job not found or access denied" }, { status: 404 })
    }

    // Hard delete the job
    const { error: deleteError } = await supabase
      .from("jobs")
      .delete()
      .eq("id", id)
      .eq("posted_by", user.id)

    if (deleteError) {
      console.error("Error deleting job:", deleteError)
      return NextResponse.json({ error: "Failed to delete job" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: "Job deleted successfully" 
    })
  } catch (error) {
    console.error("Error in DELETE /api/jobs/[id]:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 