import { createServerClient } from "@/lib/supabase/server"
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { updateProfileCompletion, updateComprehensiveProfile } from "@/lib/profile-service"
import { awardCategoryPoints, getAllCategoriesWithUserPoints } from "@/lib/points-category-service"
import type { UserPointsByCategory } from "@/types/supabase"
import { isAuthError } from "@supabase/supabase-js"

// GET /api/profile - Get current user's profile
export async function GET() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: any) {
            await cookieStore.set(name, value, options)
          },
          async remove(name: string, options: any) {
            await cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    // Get profile with all related data
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone_code,
        phone_number,
        dob,
        gender,
        avatar_url,
        created_at,
        updated_at,
        is_public,
        is_admin,
        avc_id,
        has_business_card,
        last_login,
        addresses (
          id,
          addressline1,
          addressline2,
          country,
          state,
          city,
          zip_code,
          is_indian,
          created_at,
          updated_at
        ),
        employment (
          id,
          company_name,
          designation,
          company_email,
          location,
          work_status,
          total_experience_years,
          total_experience_months,
          current_salary,
          skills,
          notice_period,
          expected_salary,
          salary_frequency,
          is_current_employment,
          employment_type,
          joining_year,
          joining_month,
          created_at,
          updated_at
        ),
        certifications (
          id,
          name,
          completion_id,
          url,
          validity,
          created_at,
          updated_at
        ),
        social_links (
          id,
          platform,
          url,
          created_at,
          updated_at
        ),
        notification_settings (
          email_notifications,
          push_notifications,
          sms_notifications,
          marketing_emails,
          receive_newsletters,
          get_ekart_notifications,
          stay_updated_on_jobs,
          receive_daily_event_updates,
          get_trending_community_posts
        ),
        points (
          total_points,
          total_earned,
          total_spent,
          last_updated
        )
      `)
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    // If profile doesn't exist, create it
    if (!profile) {
      const { data: newProfile, error: createError } = await supabaseServer
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating profile:', createError)
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
      }

      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const cookieStore = await cookies()
    const supabaseServer = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookie = await cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: any) {
            await cookieStore.set(name, value, options)
          },
          async remove(name: string, options: any) {
            await cookieStore.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )

    const body = await request.json()

    // Update profile
    const { error: updateError } = await supabaseServer
      .from('profiles')
      .update({
        full_name: body.full_name,
        email: body.email,
        phone_code: body.phone_code,
        phone_number: body.phone_number,
        gender: body.gender,
        dob: body.dob,
        work_status: body.work_status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Profile updated successfully' })
  } catch (error) {
    console.error('Error in PUT /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
