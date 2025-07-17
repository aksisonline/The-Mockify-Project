import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { addJobApplication, getJobApplicationForUser } from "@/lib/job-service-client"

// POST - Apply for a job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { job_id, cover_letter } = await request.json()

    if (!job_id) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 })
    }

    // Check if job exists, is active, and is approved
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        job_approval_queue!inner(status)
      `)
      .eq("id", job_id)
      .eq("is_active", true)
      .eq("job_approval_queue.status", "approved")
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found, not active, or not approved" }, { status: 404 })
    }

    // Check if user has already applied for this job
    const existingApplication = await getJobApplicationForUser(job_id, user.id)
    if (existingApplication) {
      return NextResponse.json({ error: "You have already applied for this job" }, { status: 400 })
    }

    // Create the application
    const applicationData = {
      job_id,
      applicant_id: user.id,
      cover_letter: cover_letter || null,
      status: "pending"
    }

    const result = await addJobApplication(applicationData)

    if (!result) {
      return NextResponse.json({ error: "Failed to submit application" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      application: result,
      message: "Application submitted successfully" 
    })
  } catch (error) {
    console.error("Error in POST /api/jobs/apply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// GET - Get user's job applications
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: applications, error } = await supabase
      .from("job_applications")
      .select(`
        *,
        jobs (
          id,
          title,
          company,
          location,
          job_type,
          experience_level,
          category,
          company_logo
        )
      `)
      .eq("applicant_id", user.id)
      .order("applied_at", { ascending: false })

    if (error) {
      console.error("Error fetching applications:", error)
      return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
    }

    return NextResponse.json({ 
      applications: applications || [],
      count: applications?.length || 0
    })
  } catch (error) {
    console.error("Error in GET /api/jobs/apply:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 