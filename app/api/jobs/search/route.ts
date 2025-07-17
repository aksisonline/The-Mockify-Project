import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const jobTypes = searchParams.get('jobTypes')?.split(',')
    const experienceLevels = searchParams.get('experienceLevels')?.split(',')
    const searchTerm = searchParams.get('searchTerm')
    const location = searchParams.get('location')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const supabase = await createServerClient()

    // First, get all active jobs without approval queue restriction
    let query = supabase
      .from('jobs')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (jobTypes && jobTypes.length > 0) {
      query = query.in('job_type', jobTypes)
    }

    if (experienceLevels && experienceLevels.length > 0) {
      query = query.in('experience_level', experienceLevels)
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`)
    }

    if (location) {
      query = query.ilike('location', `%${location}%`)
    }

    const { data: jobs, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching jobs:', error)
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({
        jobs: [],
        count: 0
      })
    }

    // Get approval queue status for all jobs
    const jobIds = jobs.map(job => job.id)
    const { data: approvalQueue, error: approvalError } = await supabase
      .from('job_approval_queue')
      .select('job_id, status')
      .in('job_id', jobIds)

    if (approvalError) {
      console.error('Error fetching approval queue:', approvalError)
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

    return NextResponse.json({
      jobs: approvedJobs,
      count: approvedJobs.length
    })
  } catch (error) {
    console.error('Error in job search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 