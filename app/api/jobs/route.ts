import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendJobApprovalRequestEmail } from "@/lib/email-service"

// GET - Fetch jobs (with optional filtering)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const location = searchParams.get('location') || ''
    const jobType = searchParams.get('jobType') || ''
    const experienceLevel = searchParams.get('experienceLevel') || ''

    // Build query - get all active jobs first
    let query = supabase
      .from("jobs")
      .select(`
        *,
        profiles!jobs_posted_by_fkey (
          full_name,
          email,
          avatar_url
        )
      `)
      .eq("is_active", true)

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`)
    }
    if (category && category !== 'all') {
      query = query.eq("category", category)
    }
    if (location) {
      query = query.ilike("location", `%${location}%`)
    }
    if (jobType) {
      query = query.eq("job_type", jobType)
    }
    if (experienceLevel) {
      query = query.eq("experience_level", experienceLevel)
    }

    const { data: jobs, error } = await query
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching jobs:", error)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    // Get approval queue status for all jobs
    const jobIds = jobs.map(job => job.id)
    const { data: approvalQueue, error: approvalError } = await supabase
      .from("job_approval_queue")
      .select("job_id, status")
      .in("job_id", jobIds)

    if (approvalError) {
      console.error("Error fetching approval queue:", approvalError)
    }

    // Create a map of job ID to approval status
    const approvalMap = new Map()
    if (approvalQueue) {
      approvalQueue.forEach(approval => {
        approvalMap.set(approval.job_id, approval.status)
      })
    }

    // Filter jobs based on approval status
    // If no approval queue entry exists, treat as approved (for backward compatibility)
    const approvedJobs = jobs.filter(job => {
      const approvalStatus = approvalMap.get(job.id) || 'approved'
      return approvalStatus === 'approved'
    })

    return NextResponse.json({ jobs: approvedJobs })
  } catch (error) {
    console.error("Error in GET /api/jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new job
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description || !body.company) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // TEMPORARY WORKAROUND: Disable the problematic trigger
    // This prevents the column ambiguity error until the database is fixed
    // console.log("Creating job with trigger disabled to avoid column ambiguity error")
    
    // Create job without the problematic trigger
    const { data: job, error } = await supabase
      .from("jobs")
      .insert({
        ...body,
        posted_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating job:", error)
      return NextResponse.json({ error: "Failed to create job" }, { status: 500 })
    }

    // Manually add job to approval queue since the trigger is disabled
    try {
      await supabase
        .from("job_approval_queue")
        .insert({
          job_id: job.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
    } catch (queueError) {
      console.error("Failed to add job to approval queue:", queueError)
      // Don't fail the job creation if this fails
    }

    // Send email notification to admins (non-blocking)
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()

      await sendJobApprovalRequestEmail(
        job.title,
        job.company,
        profile?.full_name || "Unknown User",
        profile?.email || "No email",
        job.id
      )
    } catch (emailError) {
      console.error("Failed to send job approval request email:", emailError)
      // Don't fail the job creation if email fails
    }

    return NextResponse.json({ 
      success: true, 
      job,
      message: "Job posted successfully and is pending admin approval" 
    })
  } catch (error) {
    console.error("Error in POST /api/jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
