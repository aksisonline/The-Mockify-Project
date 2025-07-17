import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    
    // First, let's check if we can access the database
    const { data: testData, error: testError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1)
    
    if (testError) {
      console.error("Error testing database connection:", testError)
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 })
    }

    // Since we can't use exec_sql, let's try a different approach
    // We'll create a simple function to fix the constraints using the Supabase client
    
    // First, let's try to drop the problematic trigger by recreating it with a simpler version
    const { error: triggerError } = await supabase
      .from('jobs')
      .select('id')
      .limit(1)
      .then(() => {
        // We'll handle this differently - let's create a simple notification function
        return supabase.rpc('create_simple_notification_function', {})
      })
    
    if (triggerError) {
      console.log("Could not create simple notification function, continuing...")
    }

    // For now, let's return success and provide manual instructions
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful. Manual fixes required.",
      instructions: [
        "1. The exec_sql function is not available in this database.",
        "2. You need to manually apply the following SQL fixes:",
        "3. Drop conflicting constraints:",
        "   - ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS experience_level_check;",
        "   - ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;",
        "   - ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS job_type_check;",
        "   - ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;",
        "4. Add consistent constraints:",
        "   - ALTER TABLE public.jobs ADD CONSTRAINT experience_level_check CHECK (experience_level::text = ANY (ARRAY['entry-level'::character varying, 'mid-level'::character varying, 'senior-level'::character varying, 'executive'::character varying]::text[]));",
        "   - ALTER TABLE public.jobs ADD CONSTRAINT job_type_check CHECK (job_type::text = ANY (ARRAY['full-time'::character varying, 'part-time'::character varying, 'contract'::character varying, 'remote'::character varying, 'internship'::character varying]::text[]));",
        "5. Fix the notification function column ambiguity issue."
      ]
    })
  } catch (error) {
    console.error("Error in fix-database-issues:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 