import { createServiceRoleClient } from "./supabase/server"
import { getAuthenticatedUser, checkUserRole, UserRole } from "./auth-utils"

export interface AdminJob {
  id: string
  title: string
  description: string
  company: string
  location: string
  salary_range: string
  job_type: string
  experience_level: string
  requirements: string[]
  benefits: string[]
  posted_by: string
  created_at: string
  updated_at: string
  application_deadline: string
  is_active: boolean
  category: string
  company_logo: string
  approval_status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  rejection_reason?: string
  poster_profile?: {
    full_name: string
    email: string
    avatar_url?: string
  }
}

export interface JobApplication {
  id: string
  job_id: string
  applicant_id: string
  status: 'pending' | 'accepted' | 'rejected' | 'reviewing' | 'interviewed'
  applied_at: string
  job?: {
    id: string
    title: string
    company: string
  }
  applicant?: {
    id: string
    full_name: string
    email: string
  }
}

export interface JobsStats {
  totalJobs: number
  activeJobs: number
  pendingApproval: number
  approvedJobs: number
  rejectedJobs: number
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
}

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

// Fetch all jobs with approval status for admin
export async function fetchAdminJobs(filters?: {
  search?: string
  approvalStatus?: string
  category?: string
  jobType?: string
}) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    // First get all jobs
    let query = supabase
      .from("jobs")
      .select("*")

    // Apply filters
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,company.ilike.%${filters.search}%`)
    }
    if (filters?.category && filters.category !== 'all') {
      query = query.eq("category", filters.category)
    }
    if (filters?.jobType && filters.jobType !== 'all') {
      query = query.eq("job_type", filters.jobType)
    }

    const { data: jobs, error } = await query
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Error fetching admin jobs:', error)
      throw new Error('Failed to fetch jobs')
    }

    if (!jobs || jobs.length === 0) {
      return []
    }

    // Get poster profiles for all jobs
    const posterIds = jobs.map(job => job.posted_by)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url")
      .in("id", posterIds)

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
    }

    // Create a map of user ID to profile
    const profileMap = new Map()
    if (profiles) {
      profiles.forEach(profile => {
        profileMap.set(profile.id, profile)
      })
    }

    // Get approval queue data
    const jobIds = jobs.map(job => job.id)
    const { data: approvalQueue, error: approvalError } = await supabase
      .from("job_approval_queue")
      .select("*")
      .in("job_id", jobIds)

    if (approvalError) {
      console.error('Error fetching approval queue:', approvalError)
    }

    // Create a map of job ID to approval status
    const approvalMap = new Map()
    if (approvalQueue) {
      approvalQueue.forEach(approval => {
        approvalMap.set(approval.job_id, approval)
      })
    }

    // Transform the data to include poster profile and approval status
    const transformedJobs: AdminJob[] = jobs.map(job => {
      const profile = profileMap.get(job.posted_by)
      const approval = approvalMap.get(job.id)
      
      return {
        ...job,
        poster_profile: profile || { full_name: 'Unknown', email: 'Unknown', avatar_url: null },
        approval_status: approval?.status || 'pending',
        approved_by: approval?.approved_by,
        approved_at: approval?.approved_at,
        rejection_reason: approval?.rejection_reason
      }
    })

    // Apply approval status filter after fetching data
    if (filters?.approvalStatus && filters.approvalStatus !== 'all') {
      return transformedJobs.filter(job => job.approval_status === filters.approvalStatus)
    }

    return transformedJobs
  } catch (error) {
    console.error('Error in fetchAdminJobs:', error)
    throw error
  }
}

// Approve or reject a job
export async function updateJobApprovalStatus(
  jobId: string, 
  action: 'approve' | 'reject', 
  rejectionReason?: string
) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    const user = await checkAdminAccess()

    if (action === 'reject' && !rejectionReason) {
      throw new Error('Rejection reason is required when rejecting a job')
    }

    // Get job details for email notification
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*")
      .eq("id", jobId)
      .single()

    if (jobError || !job) {
      throw new Error('Job not found')
    }

    // Get poster profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", job.posted_by)
      .single()

    if (profileError) {
      console.error('Error fetching poster profile:', profileError)
    }

    // Update approval status in the approval queue
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: user.id,
      approved_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    if (action === 'reject' && rejectionReason) {
      updateData.rejection_reason = rejectionReason
    }

    const { error: updateError } = await supabase
      .from("job_approval_queue")
      .update(updateData)
      .eq("job_id", jobId)

    if (updateError) {
      console.error('Error updating job approval status:', updateError)
      throw new Error('Failed to update job approval status')
    }

    return {
      success: true,
      message: `Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
      job: { ...job, profiles: profile }
    }
  } catch (error) {
    console.error('Error in updateJobApprovalStatus:', error)
    throw error
  }
}

// Fetch all job applications for admin
export async function fetchAdminJobApplications() {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    const { data: applications, error } = await supabase
      .from("job_applications")
      .select(`
        *,
        job:jobs!job_applications_job_id_fkey (id, title, company)
      `)
      .order("applied_at", { ascending: false })

    if (error) {
      console.error("Error fetching all job applications:", error)
      throw new Error("Failed to fetch applications")
    }

    // Fetch applicant profiles separately
    const applicantIds = applications?.map(app => app.applicant_id) || []
    let applicantProfiles: Record<string, any> = {}
    
    if (applicantIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", applicantIds)

      if (profilesError) {
        console.error("Error fetching applicant profiles:", profilesError)
      } else if (profiles) {
        applicantProfiles = profiles.reduce((acc, profile) => {
          acc[profile.id] = profile
          return acc
        }, {} as Record<string, any>)
      }
    }

    // Combine applications with applicant data
    const applicationsWithApplicants: JobApplication[] = applications?.map(app => ({
      ...app,
      applicant: applicantProfiles[app.applicant_id] || { id: app.applicant_id, full_name: 'Unknown', email: 'Unknown' }
    })) || []

    return applicationsWithApplicants
  } catch (error) {
    console.error('Error in fetchAdminJobApplications:', error)
    throw error
  }
}

// Update application status
export async function updateApplicationStatus(applicationId: string, status: string) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    const { error } = await supabase
      .from("job_applications")
      .update({ status })
      .eq("id", applicationId)

    if (error) {
      console.error('Error updating application status:', error)
      throw new Error('Failed to update application status')
    }

    return { success: true, message: 'Application status updated successfully' }
  } catch (error) {
    console.error('Error in updateApplicationStatus:', error)
    throw error
  }
}

// Delete a job
export async function deleteJob(jobId: string) {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    // First delete from approval queue
    const { error: queueError } = await supabase
      .from("job_approval_queue")
      .delete()
      .eq("job_id", jobId)

    if (queueError) {
      console.error('Error deleting from approval queue:', queueError)
    }

    // Then delete the job
    const { error } = await supabase
      .from("jobs")
      .delete()
      .eq("id", jobId)

    if (error) {
      console.error('Error deleting job:', error)
      throw new Error('Failed to delete job')
    }

    return { success: true, message: 'Job deleted successfully' }
  } catch (error) {
    console.error('Error in deleteJob:', error)
    throw error
  }
}

// Get jobs statistics
export async function getJobsStats(): Promise<JobsStats> {
  try {
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()

    // Get all jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("jobs")
      .select("*")

    if (jobsError) {
      console.error('Error fetching jobs for stats:', jobsError)
      throw new Error('Failed to fetch jobs statistics')
    }

    // Get approval queue data
    const { data: approvalQueue, error: approvalError } = await supabase
      .from("job_approval_queue")
      .select("*")

    if (approvalError) {
      console.error('Error fetching approval queue for stats:', approvalError)
      throw new Error('Failed to fetch approval statistics')
    }

    // Get applications
    const { data: applications, error: applicationsError } = await supabase
      .from("job_applications")
      .select("*")

    if (applicationsError) {
      console.error('Error fetching applications for stats:', applicationsError)
      throw new Error('Failed to fetch application statistics')
    }

    const totalJobs = jobs?.length || 0
    const activeJobs = jobs?.filter(job => job.is_active).length || 0
    
    const pendingApproval = approvalQueue?.filter(aq => aq.status === 'pending').length || 0
    const approvedJobs = approvalQueue?.filter(aq => aq.status === 'approved').length || 0
    const rejectedJobs = approvalQueue?.filter(aq => aq.status === 'rejected').length || 0
    
    const totalApplications = applications?.length || 0
    const pendingApplications = applications?.filter(app => app.status === 'pending').length || 0
    const acceptedApplications = applications?.filter(app => app.status === 'accepted').length || 0

    return {
      totalJobs,
      activeJobs,
      pendingApproval,
      approvedJobs,
      rejectedJobs,
      totalApplications,
      pendingApplications,
      acceptedApplications
    }
  } catch (error) {
    console.error('Error in getJobsStats:', error)
    throw error
  }
} 