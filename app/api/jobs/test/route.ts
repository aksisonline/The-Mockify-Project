import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// POST - Add a test job for debugging
export async function POST() {
  try {
    const supabase = await createServerClient()
    
    // Create a test job
    const testJob = {
      title: "Senior   Engineer",
      description: "Design and implement advanced   solutions for corporate environments.",
      company: "  Solutions Inc",
      location: "New York, NY",
      salary_range: "80000-120000",
      job_type: "full-time",
      experience_level: "senior-level",
      category: " -engineer",
      requirements: ["CTS certification", "5+ years experience", "Strong communication skills"],
      benefits: ["Health insurance", "401(k) matching", "Flexible schedule"],
      application_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      company_logo: "https://ui-avatars.com/api/?name= +Solutions&background=random",
      posted_by: "00000000-0000-0000-0000-000000000000", // Dummy UUID for testing
      is_active: true
    }

    const { data: result, error } = await supabase
      .from("jobs")
      .insert(testJob)
      .select()
      .single()

    if (error) {
      console.error("Error inserting test job:", error)
      return NextResponse.json({ error: "Failed to create test job", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      job: result,
      message: "Test job created successfully" 
    })
  } catch (error) {
    console.error("Error in POST /api/jobs/test:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 