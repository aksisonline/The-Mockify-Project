import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"

// GET - Get job applications for specific job IDs or all applications for admin
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const jobIds = searchParams.get('jobIds')
    const isAdmin = searchParams.get('admin') === 'true'

    if (isAdmin) {
      // Admin can see all applications
      try {
        await withAuth(UserRole.Admin)()
        
        const { data: applications, error } = await supabase
          .from("job_applications")
          .select(`
            *,
            job:jobs!job_applications_job_id_fkey (id, title, company)
          `)
          .order("applied_at", { ascending: false })

        if (error) {
          console.error("Error fetching all job applications:", error)
          return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
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
        const applicationsWithApplicants = applications?.map(app => ({
          ...app,
          applicant: applicantProfiles[app.applicant_id] || { id: app.applicant_id, full_name: 'Unknown', email: 'Unknown' }
        })) || []

        return NextResponse.json({ 
          applications: applicationsWithApplicants,
          count: applicationsWithApplicants.length
        })
      } catch (error) {
        return NextResponse.json({ error: "Admin access required" }, { status: 403 })
      }
    } else {
      // Regular user can only see applications for their jobs
      if (!jobIds) {
        return NextResponse.json({ error: "Job IDs are required" }, { status: 400 })
      }

      const jobIdsArray = jobIds.split(',')

      // Verify that the user owns these jobs
      const { data: userJobs, error: userJobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("posted_by", user.id)
        .in("id", jobIdsArray)

      if (userJobsError) {
        console.error("Error verifying job ownership:", userJobsError)
        return NextResponse.json({ error: "Failed to verify job ownership" }, { status: 500 })
      }

      const userJobIds = userJobs.map(job => job.id)
      const validJobIds = jobIdsArray.filter(id => userJobIds.includes(id))

      if (validJobIds.length === 0) {
        return NextResponse.json({ applications: [] })
      }

      // Fetch applications for the valid job IDs
      const { data: applications, error } = await supabase
        .from("job_applications")
        .select(`
          *,
          job:jobs!job_applications_job_id_fkey (id, title, company)
        `)
        .in("job_id", validJobIds)
        .order("applied_at", { ascending: false })

      if (error) {
        console.error("Error fetching job applications:", error)
        return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 })
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
      const applicationsWithApplicants = applications?.map(app => ({
        ...app,
        applicant: applicantProfiles[app.applicant_id] || { id: app.applicant_id, full_name: 'Unknown', email: 'Unknown' }
      })) || []

      return NextResponse.json({ 
        applications: applicationsWithApplicants,
        count: applicationsWithApplicants.length
      })
    }
  } catch (error) {
    console.error("Error in GET /api/jobs/applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { job_id, applicant_id, status = 'pending' } = body

    if (!job_id || !applicant_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createServerClient()

    const { data: application, error } = await supabase
      .from('job_applications')
      .insert({
        job_id,
        applicant_id,
        status,
        applied_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job application:', error)
      return NextResponse.json(
        { error: 'Failed to create job application' },
        { status: 500 }
      )
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error('Error in job application API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 