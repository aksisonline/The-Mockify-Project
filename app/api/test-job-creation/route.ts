import { NextRequest, NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceRoleClient()
    
    // Test job data
    const testJob = {
      title: "Test Job - Executive Level",
      description: "This is a test job to verify the executive experience level works",
      company: "Test Company",
      location: "Remote",
      salary_range: JSON.stringify({ minSalary: 10, maxSalary: 20 }),
      job_type: "full-time",
      experience_level: "executive",
      category: "all",
      requirements: ["Test requirement 1", "Test requirement 2"],
      benefits: ["Test benefit 1", "Test benefit 2"],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      is_active: true,
      posted_by: "00000000-0000-0000-0000-000000000000", // Dummy UUID for testing
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Try to create the job
    const { data: job, error } = await supabase
      .from("jobs")
      .insert(testJob)
      .select()
      .single()

    if (error) {
      console.error("Error creating test job:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details
      }, { status: 500 })
    }

    // Clean up - delete the test job
    await supabase
      .from("jobs")
      .delete()
      .eq("id", job.id)

    return NextResponse.json({ 
      success: true, 
      message: "Test job creation successful! The constraints are working correctly.",
      job: job
    })
  } catch (error) {
    console.error("Error in test job creation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 