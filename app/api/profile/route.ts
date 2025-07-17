import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { updateProfileCompletion, updateComprehensiveProfile } from "@/lib/profile-service"
import { awardCategoryPoints, getAllCategoriesWithUserPoints } from "@/lib/points-category-service"
import type { UserPointsByCategory } from "@/types/supabase"
import { isAuthError } from "@supabase/supabase-js"

// GET /api/profile - Get current user's profile
export async function GET() {
  let responseReturned = false;

  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      responseReturned = true;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        employment (*),
        education (*),
        certifications (*),
        addresses (*),
        social_links (*),
        points (*),
        profile_completion (*),
        notification_settings (*)
      `)
      .eq("id", user.id)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error)
      responseReturned = true;
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // If no profile exists yet, create a basic one with empty linked records
    if (!data) {
      try {
        // Create a basic profile
        const { data: newProfile, error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            email: user.email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (profileError) {
          console.error("Error creating profile:", profileError)
          responseReturned = true;
          return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
        }

        // Create related records in parallel to improve performance
        await Promise.allSettled([
          // Create empty employment record
          supabase.from("employment").insert({
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),

          // Create empty address record
          supabase.from("addresses").insert({
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),

          // Create empty education record
          supabase.from("education").insert({
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),

          // Initialize notification settings
          supabase.from("notification_settings").insert({
            user_id: user.id,
            email_notifications: true,
            push_notifications: true,
            sms_notifications: false,
            marketing_emails: false,
            receive_newsletters: true,
            get_ekart_notifications: true,
            stay_updated_on_jobs: true,
            receive_daily_event_updates: true,
            get_trending_community_posts: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }),

          // Initialize points
          supabase.from("points").insert({
            user_id: user.id,
            total_points: 0,
            total_earned: 0,
            total_spent: 0,
            last_updated: new Date().toISOString(),
          }),
        ]);

        // Award welcome points (non-blocking)
        awardCategoryPoints(
          user.id,
          "general",
          10,
          "Welcome bonus for creating profile",
          { action: "profile_created" }
        ).catch(pointsError => {
          console.warn("Could not award welcome points:", pointsError)
        });

        // Initialize profile completion (non-blocking)
        updateProfileCompletion(user.id).catch(completionError => {
          console.warn("Could not update profile completion:", completionError)
        });

        // Fetch the complete profile with all linked data
        const { data: completeProfile } = await supabase
          .from("profiles")
          .select(`
            *,
            employment (*),
            education (*),
            certifications (*),
            addresses (*),
            social_links (*),
            points (*),
            profile_completion (*),
            notification_settings (*)
          `)
          .eq("id", user.id)
          .single()

        // Normalize address fields for UI
        if (completeProfile && Array.isArray(completeProfile.addresses) && completeProfile.addresses.length > 0) {
          completeProfile.addresses = completeProfile.addresses.map((addr: any) => ({
            ...addr,
            addressline1: addr.addressline1,
            addressline2: addr.addressline2,
            zip_code: addr.zip_code,
            country: addr.country,
            city: addr.city,
            state: addr.state,
            is_indian: addr.is_indian,
            location: addr.location,
          }));
        }

        // Get user points by category (non-blocking)
        let pointsByCategory: UserPointsByCategory[] = []
        try {
          pointsByCategory = await getAllCategoriesWithUserPoints(user.id)
        } catch (categoryError) {
          console.warn("Could not fetch points by category:", categoryError)
        }

        if (!responseReturned) {
          responseReturned = true;
          return NextResponse.json({
            profile: completeProfile,
            pointsByCategory,
            isNew: true
          })
        }
      } catch (creationError) {
        console.error("Error during profile creation:", creationError)
        if (!responseReturned) {
          responseReturned = true;
          return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
        }
      }
    }

    // Normalize address fields for UI (existing user branch)
    if (data && Array.isArray(data.addresses) && data.addresses.length > 0) {
      data.addresses = data.addresses.map((addr: any) => ({
        ...addr,
        addressline1: addr.addressline1,
        addressline2: addr.addressline2,
        zip_code: addr.zip_code,
        country: addr.country,
        city: addr.city,
        state: addr.state,
        is_indian: addr.is_indian,
        location: addr.location,
      }));
    }

    // Get user points by category for existing users
    let pointsByCategory: UserPointsByCategory[] = []
    try {
      pointsByCategory = await getAllCategoriesWithUserPoints(user.id)
    } catch (categoryError) {
      console.warn("Could not fetch points by category:", categoryError)
    }

    if (!responseReturned) {
      responseReturned = true;
      return NextResponse.json({
        profile: data,
        pointsByCategory,
        isNew: false
      })
    }
  } catch (error) {
    console.error("Profile API error:", error)
    if (!responseReturned) {
      responseReturned = true;
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: Request) {
  let responseReturned = false;

  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      responseReturned = true;
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    const { type, data } = body;

    if (!type || !data) {
      responseReturned = true;
      return NextResponse.json({ error: "Missing type or data in request" }, { status: 400 })
    }

    let updatedProfile;
    let error;

    switch (type) {
      case 'basic_details':
        // Update basic profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: data.full_name,
            email: data.email,
            phone_code: data.phone_code,
            phone_number: data.phone_number,
            gender: data.gender,
            dob: data.dob,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .select()
          .single();

        updatedProfile = profileData;
        error = profileError;
        break;

      case 'address':
        // Update address by user_id only
        const { data: addressData, error: addressError } = await supabase
          .from('addresses')
          .update({
            addressline1: data.addressline1,
            addressline2: data.addressline2,
            city: data.city,
            state: data.state,
            country: data.country,
            zip_code: data.zip_code,
            is_indian: data.is_indian,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .select()
          .single();
        updatedProfile = addressData;
        error = addressError;
        break;

      case 'education':
        // Upsert education
        const { data: educationData, error: educationError } = await supabase
          .from('education')
          .upsert({
            user_id: user.id,
            level: data.level,
            university: data.university,
            course: data.course,
            specialization: data.specialization,
            course_type: data.course_type,
            start_date: data.start_date,
            end_date: data.end_date,
            grading_system: data.grading_system,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        updatedProfile = educationData;
        error = educationError;
        break;

      case 'employment':
        // Update employment by user_id only
        const { error: employmentError } = await supabase
          .from('employment')
          .update({
            is_current_employment: data.is_current_employment,
            employment_type: data.employment_type,
            work_status: data.work_status,
            total_experience_years: data.total_experience_years,
            total_experience_months: data.total_experience_months,
            company_name: data.company_name,
            designation: data.designation,
            joining_year: data.joining_year,
            joining_month: data.joining_month,
            current_salary: data.current_salary,
            notice_period: data.notice_period,
            expected_salary: data.expected_salary,
            salary_frequency: data.salary_frequency,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
        if (employmentError) {
          error = employmentError;
        } else {
          updatedProfile = { message: 'Employment updated successfully' };
        }
        break;

      case 'certification':
        // Handle certification update or deletion
        if (data.delete) {
          // Handle deletion
          const { error: deleteError } = await supabase
            .from('certifications')
            .delete()
            .eq('user_id', user.id)
            .eq('completion_id', data.completion_id);

          if (deleteError) {
            error = deleteError;
          } else {
            updatedProfile = { message: 'Certification deleted successfully' };
          }
        } else {
          // Handle update/insert
          const validity = data.doesNotExpire ? 'No Expiry' : `${data.startMonth}/${data.startYear} - ${data.endMonth}/${data.endYear}`;
          
          const { data: certificationData, error: certificationError } = await supabase
            .from('certifications')
            .upsert({
              user_id: user.id,
              name: data.certificationName,
              completion_id: data.completionId,
              url: data.url,
              validity: validity,
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          updatedProfile = certificationData;
          error = certificationError;
        }
        break;

      default:
        responseReturned = true;
        return NextResponse.json({ error: "Invalid update type" }, { status: 400 })
    }

    if (error) {
      console.error(`Error updating ${type}:`, error);
      responseReturned = true;
      return NextResponse.json({ error: `Failed to update ${type}` }, { status: 500 })
    }

    // Update profile completion (non-blocking)
    updateProfileCompletion(user.id).catch(completionError => {
      console.warn("Could not update profile completion:", completionError)
    });

    // Get user points by category (non-blocking for performance)
    let pointsByCategory: UserPointsByCategory[] = []
    try {
      pointsByCategory = await getAllCategoriesWithUserPoints(user.id)
    } catch (categoryError) {
      console.warn("Could not fetch points by category after update:", categoryError)
    }

    // Fetch the complete updated profile
    const { data: completeProfile } = await supabase
      .from("profiles")
      .select(`
        *,
        employment (*),
        education (*),
        certifications (*),
        addresses (*),
        social_links (*),
        points (*),
        profile_completion (*),
        notification_settings (*)
      `)
      .eq("id", user.id)
      .single()

    if (!responseReturned) {
      responseReturned = true;
      return NextResponse.json({
        profile: completeProfile,
        pointsByCategory,
        updatedData: updatedProfile
      })
    }
  } catch (error: any) {
    console.error("Profile update error:", error)

    if (!responseReturned) {
      // Determine specific error types
      const isAuthError = error.message && error.message.toLowerCase().includes('not authenticated');
      const isDateError = error.message && error.message.toLowerCase().includes('invalid input syntax for type date');

      let statusCode = isAuthError ? 401 : (isDateError ? 400 : 500);
      let errorType = isAuthError ? "AUTH_ERROR" : (isDateError ? "DATE_FORMAT_ERROR" : "UPDATE_ERROR");
      let errorMessage = isAuthError
        ? "Authentication Error"
        : (isDateError
          ? "Invalid date format. Please use a valid date or leave the field empty."
          : "Failed to update profile");

      responseReturned = true;
      return NextResponse.json({
        error: errorMessage,
        message: error.message || "Unknown error",
        code: errorType
      }, { status: statusCode })
    }
  }
}
