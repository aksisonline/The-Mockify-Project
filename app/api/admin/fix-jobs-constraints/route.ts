import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    
    // Execute the SQL directly using the service role client
    const { error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1)
      .then(() => {
        // This is a workaround to execute raw SQL
        return supabase.rpc('exec_sql', {
          sql: `
            -- Drop the conflicting constraints
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS experience_level_check;
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_experience_level_check;
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS job_type_check;
            ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_job_type_check;
            
            -- Add consistent constraints that match the frontend data
            ALTER TABLE public.jobs ADD CONSTRAINT experience_level_check 
            CHECK (experience_level::text = ANY (ARRAY['entry-level'::character varying, 'mid-level'::character varying, 'senior-level'::character varying, 'executive'::character varying]::text[]));
            
            ALTER TABLE public.jobs ADD CONSTRAINT job_type_check 
            CHECK (job_type::text = ANY (ARRAY['full-time'::character varying, 'part-time'::character varying, 'contract'::character varying, 'remote'::character varying, 'internship'::character varying]::text[]));
            
            -- Fix column ambiguity issue in job notification function
            CREATE OR REPLACE FUNCTION notify_admins_on_job_post()
            RETURNS TRIGGER AS $$
            DECLARE
              poster_profile RECORD;
              admin_emails TEXT[];
              email TEXT;
            BEGIN
              -- Get poster profile information
              SELECT full_name, email INTO poster_profile
              FROM public.profiles
              WHERE id = NEW.posted_by;
              
              -- Get all admin emails
              SELECT array_agg(profiles.email) INTO admin_emails
              FROM public.profiles
              WHERE profiles.is_admin = true;
              
              -- Send notification to each admin
              FOREACH email IN ARRAY admin_emails
              LOOP
                INSERT INTO public.notifications (
                  user_id,
                  title,
                  message,
                  notification_type,
                  priority,
                  data,
                  reference_id,
                  reference_type
                )
                SELECT 
                  p.id,
                  'New Job Posting Requires Approval',
                  'A new job posting "' || NEW.title || '" by ' || 
                  COALESCE(poster_profile.full_name, 'Unknown User') || 
                  ' (' || COALESCE(poster_profile.email, 'No email') || ') requires admin approval.',
                  'job_posted',
                  'high',
                  jsonb_build_object(
                    'job_title', NEW.title,
                    'poster_name', COALESCE(poster_profile.full_name, 'Unknown User'),
                    'poster_email', COALESCE(poster_profile.email, 'No email'),
                    'job_id', NEW.id
                  ),
                  NEW.id,
                  'job'
                FROM public.profiles p
                WHERE p.email = email AND p.is_admin = true;
              END LOOP;
              
              RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
          `
        })
      })
    
    if (error) {
      console.error("Error fixing constraints:", error)
      return NextResponse.json({ error: "Failed to fix constraints" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: "Constraints and notification function fixed successfully" })
  } catch (error) {
    console.error("Error fixing constraints:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 