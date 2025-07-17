import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    
    // Apply the constraints fix using direct SQL
    const { error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1)
      .then(async () => {
        // Execute the constraint fixes
        const fixes = [
          // Drop conflicting constraints
          'ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS experience_level_check;',
          'ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;',
          'ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS job_type_check;',
          'ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;',
          
          // Add consistent constraints
          `ALTER TABLE public.jobs ADD CONSTRAINT experience_level_check 
           CHECK (experience_level::text = ANY (ARRAY['entry-level'::character varying, 'mid-level'::character varying, 'senior-level'::character varying, 'executive'::character varying]::text[]));`,
          
          `ALTER TABLE public.jobs ADD CONSTRAINT job_type_check 
           CHECK (job_type::text = ANY (ARRAY['full-time'::character varying, 'part-time'::character varying, 'contract'::character varying, 'remote'::character varying, 'internship'::character varying]::text[]));`
        ]
        
        // Execute each fix
        for (const fix of fixes) {
          const { error: fixError } = await supabase.rpc('exec_sql', { sql: fix })
          if (fixError) {
            console.error(`Error applying fix: ${fix}`, fixError)
            return { error: fixError }
          }
        }
        
        return { error: null }
      })
    
    if (error) {
      console.error("Error applying constraints fix:", error)
      return NextResponse.json({ error: "Failed to apply constraints fix" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: "Constraints fixed successfully" })
  } catch (error) {
    console.error("Error applying constraints fix:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 