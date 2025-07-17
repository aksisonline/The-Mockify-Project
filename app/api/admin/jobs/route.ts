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
    // console.log('Admin jobs API called')
    
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    
    if (!supabaseUrl) {
      console.error('NEXT_PUBLIC_SUPABASE_URL is not set')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    if (!serviceRoleKey) {
      console.error('SUPABASE_SERVICE_ROLE_KEY is not set')
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 })
    }
    
    // console.log('Environment variables check passed')
    
    const supabase = await createServiceRoleClient()
    
    // Check admin access
    await checkAdminAccess()
    // console.log('Admin access verified')

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const approvalStatus = searchParams.get('approvalStatus') || ''
    const category = searchParams.get('category') || ''
    const jobType = searchParams.get('jobType') || ''

    // console.log('Filters:', { search, approvalStatus, category, jobType })

    // First get all jobs
    let query = supabase
      .from("jobs")
      .select("*")

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,company.ilike.%${search}%`)
    }
    if (category && category !== 'all') {
      query = query.eq("category", category)
    }
    if (jobType && jobType !== 'all') {
      query = query.eq("job_type", jobType)
    }

    const { data: jobs, error } = await query
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    // console.log(`Found ${jobs?.length || 0} jobs`)

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ jobs: [] })
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

    // console.log(`Found ${profiles?.length || 0} profiles`)

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

    // console.log(`Found ${approvalQueue?.length || 0} approval queue entries`)

    // Create a map of job ID to approval status
    const approvalMap = new Map()
    if (approvalQueue) {
      approvalQueue.forEach(approval => {
        approvalMap.set(approval.job_id, approval)
      })
    }

    // Transform the data to include poster profile and approval status
    const transformedJobs = jobs.map(job => {
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
    let finalJobs = transformedJobs
    if (approvalStatus && approvalStatus !== 'all') {
      finalJobs = transformedJobs.filter(job => job.approval_status === approvalStatus)
    }

    // console.log(`Returning ${finalJobs.length} jobs`)
    return NextResponse.json({ jobs: finalJobs })
  } catch (error) {
    console.error('Error in GET /api/admin/jobs:', error)
    if (error instanceof Error && error.message.includes('Authentication required')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (error instanceof Error && error.message.includes('Admin access required')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 