import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"
import { getAuthenticatedUser, checkUserRole, UserRole } from "@/lib/auth-utils"

// Helper function to check admin access
async function checkAdminAccess() {
  const user = await getAuthenticatedUser()
  if (!user) {
    throw new Error('Authentication required')
  }
  
  const userRole = await checkUserRole(user.id)
  if (userRole !== UserRole.Admin) {
    throw new Error('Admin access required')
  }
  
  return user
}

export async function GET(request: NextRequest) {
  try {
    // console.log('Admin jobs stats API called')
    
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()
    // console.log('Admin access verified for stats')

    // Get all jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")

    if (jobsError) {
      console.error('Error fetching jobs for stats:', jobsError)
      return NextResponse.json({ error: 'Failed to fetch jobs statistics' }, { status: 500 })
    }

    // console.log(`Found ${jobs?.length || 0} jobs for stats`)

    // Get approval queue data
    const { data: approvalQueue, error: approvalError } = await supabase
      .from("job_approval_queue")
      .select("*")

    if (approvalError) {
      console.error('Error fetching approval queue for stats:', approvalError)
      return NextResponse.json({ error: 'Failed to fetch approval statistics' }, { status: 500 })
    }

    // console.log(`Found ${approvalQueue?.length || 0} approval queue entries for stats`)

    // Get applications
    const { data: applications, error: applicationsError } = await supabase
      .from("job_applications")
      .select("*")

    if (applicationsError) {
      console.error('Error fetching applications for stats:', applicationsError)
      return NextResponse.json({ error: 'Failed to fetch application statistics' }, { status: 500 })
    }

    // console.log(`Found ${applications?.length || 0} applications for stats`)

    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(job => job.is_active).length || 0
    
    const pendingApproval = approvalQueue?.filter(aq => aq.status === 'pending').length || 0
    const approvedJobs = approvalQueue?.filter(aq => aq.status === 'approved').length || 0
    const rejectedJobs = approvalQueue?.filter(aq => aq.status === 'rejected').length || 0
    
    const totalApplications = applications?.length || 0
    const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0
    const acceptedApplications = applications?.filter(app => app.status === 'accepted').length || 0

    const stats = {
      totalJobs,
      activeJobs,
      pendingApproval,
      approvedJobs,
      rejectedJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications
    }

    // console.log('Stats calculated:', stats)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error in GET /api/admin/jobs/stats:', error)
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 