import { NextResponse } from "next/server"
import { createServiceRoleClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const supabase = createServiceRoleClient()
    
    // First, let's disable the problematic trigger temporarily
    const { error: disableError } = await supabase.rpc('exec_sql', {
      sql: 'DROP TRIGGER IF EXISTS trigger_notify_admins_on_job_post ON jobs;'
    })
    
    if (disableError) {
      console.error("Error disabling trigger:", disableError)
      return NextResponse.json({ error: "Failed to disable trigger" }, { status: 500 })
    }
    
    // Now recreate the function with explicit table references
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
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
    
    if (functionError) {
      console.error("Error recreating function:", functionError)
      return NextResponse.json({ error: "Failed to recreate function" }, { status: 500 })
    }
    
    // Re-enable the trigger
    const { error: enableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TRIGGER trigger_notify_admins_on_job_post
          AFTER INSERT ON jobs
          FOR EACH ROW
          EXECUTE FUNCTION notify_admins_on_job_post();
      `
    })
    
    if (enableError) {
      console.error("Error re-enabling trigger:", enableError)
      return NextResponse.json({ error: "Failed to re-enable trigger" }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: "Job notification function fixed successfully" })
  } catch (error) {
    console.error("Error fixing job notification:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 