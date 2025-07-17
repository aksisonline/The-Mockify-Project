import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET - Get jobs posted by the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get('includeInactive') === 'true'

    let query = supabase
      .from("jobs")
      .select(`
        *,
        job_approval_queue (
          status,
          approved_by,
          approved_at,
          rejection_reason
        )
      `)
      .eq("posted_by", user.id)
      .order("created_at", { ascending: false })

    // Only include active jobs unless specifically requested
    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data: jobs, error } = await query

    if (error) {
      console.error("Error fetching user jobs:", error)
      return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
    }

    // Add approval status as a top-level field for each job
    const jobsWithApprovalStatus = (jobs || []).map((job: any) => {
      let approval_status = 'pending';
      let approved_by = null;
      let approved_at = null;
      let rejection_reason = null;
      
      // Handle both object and array cases for job_approval_queue
      if (job.job_approval_queue) {
        if (Array.isArray(job.job_approval_queue) && job.job_approval_queue.length > 0) {
          // Sort by approved_at or updated_at descending, fallback to created_at
          const sortedQueue = [...job.job_approval_queue].sort((a, b) => {
            const dateA = new Date(a.updated_at || a.approved_at || a.created_at || 0).getTime();
            const dateB = new Date(b.updated_at || b.approved_at || b.created_at || 0).getTime();
            return dateB - dateA;
          });
          const latest = sortedQueue[0];
          approval_status = latest.status || 'pending';
          approved_by = latest.approved_by || null;
          approved_at = latest.approved_at || null;
          rejection_reason = latest.rejection_reason || null;
        } else if (typeof job.job_approval_queue === 'object' && job.job_approval_queue.status) {
          // Handle case where job_approval_queue is a single object
          approval_status = job.job_approval_queue.status || 'pending';
          approved_by = job.job_approval_queue.approved_by || null;
          approved_at = job.job_approval_queue.approved_at || null;
          rejection_reason = job.job_approval_queue.rejection_reason || null;
        }
      }
      
      return {
        ...job,
        approval_status,
        approved_by,
        approved_at,
        rejection_reason,
      };
    });

    // TEMP: Log jobs and jobsWithApprovalStatus for debugging
    // console.log('jobs:', JSON.stringify(jobs, null, 2));
    // console.log('jobsWithApprovalStatus:', JSON.stringify(jobsWithApprovalStatus, null, 2));

    return NextResponse.json({ 
      jobs: jobsWithApprovalStatus,
      count: jobsWithApprovalStatus.length
    })
  } catch (error) {
    console.error("Error in GET /api/jobs/my-jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 