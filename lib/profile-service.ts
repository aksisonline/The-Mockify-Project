import { createBrowserClient } from "./supabase/client"
import { createServerClient } from "./supabase/server"
import type { Database } from "@/types/supabase"
import { awardCategoryPoints } from "./points-category-service"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { apiCache } from "./api-cache"

// Type definitions
export type Profile = Database["public"]["Tables"]["profiles"]["Row"] & {
  is_public?: boolean
}
export type Employment = Database["public"]["Tables"]["employment"]["Row"]
export type Education = Database["public"]["Tables"]["education"]["Row"]
export type Certification = Database["public"]["Tables"]["certifications"]["Row"]
export type Address = Database["public"]["Tables"]["addresses"]["Row"]
export type SocialLink = Database["public"]["Tables"]["social_links"]["Row"]
export type ProfileCompletion = Database["public"]["Tables"]["profile_completion"]["Row"]
export type NotificationSettings = {
  id?: string
  user_id: string
  email_notifications?: boolean
  push_notifications?: boolean
  sms_notifications?: boolean
  marketing_emails?: boolean
  receive_newsletters?: boolean
  get_ekart_notifications?: boolean
  stay_updated_on_jobs?: boolean
  receive_daily_event_updates?: boolean
  get_trending_community_posts?: boolean
  created_at?: string
  updated_at?: string
}

// ================================================================
// CORE PROFILE FUNCTIONS
// ================================================================

/**
 * Create or update a user profile (basic profile data only)
 * For comprehensive profile data, use the /api/profile endpoint
 */

// Create or update a user profile
export async function upsertProfile(profile: Partial<Profile>) {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    throw error
  }

  // Update profile completion
  await updateProfileCompletion(user.id)

  return data
}

// Get employment information
export async function getEmployment(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("employment").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching employment:", error)
    throw error
  }

  return data || null
}

// Update employment information
export async function upsertEmployment(employment: Partial<Employment>) {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const existing = await getEmployment(user.id)

  const { data, error } = await supabase
    .from("employment")
    .upsert({
      id: existing?.id,
      user_id: user.id,
      ...employment,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating employment:", error)
    throw error
  }

  // Update profile completion (ensure employment boolean is set to true)
  await updateProfileCompletion(user.id)

  return data
}

// Get education information
export async function getEducation(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching education:", error)
    throw error
  }

  return data || []
}

// Add education record
export async function addEducation(education: Partial<Education>) {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("education")
    .insert({
      user_id: user.id,
      ...education,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding education:", error)
    throw error
  }

  // Update profile completion
  await updateProfileCompletion(user.id)

  return data
}

// Update education record
export async function updateEducation(id: string, education: Partial<Education>) {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("education")
    .update({
      ...education,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id) // Security check
    .select()
    .single()

  if (error) {
    console.error("Error updating education:", error)
    throw error
  }

  return data
}

// Get certifications
export async function getCertifications(userId: string) {
  const supabase = createBrowserClient()
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", userId)
    .not("name", "is", null)
    .not("completion_id", "is", null)
    .not("url", "is", null)
    .not("validity", "is", null)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching certifications:", error)
    throw error
  }
  return data || []
}

// Add certification
export async function addCertification(certification: Partial<Certification>) {
  const supabase = createBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("certifications")
    .insert({
      user_id: user.id,
      ...certification,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error adding certification:", error)
    throw error
  }

  // Update profile completion
  await updateProfileCompletion(user.id)

  return data
}

// Get addresses
export async function getAddresses(userId: string) {
  const latest = await getLatestAddressRecord(userId);
  return latest ? [latest] : [];
}

// Get most recent address record
export async function getLatestAddressRecord(userId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

// Add or update address
// Accepts a generic address object matching the addresses table schema (not Partial<Address>),
// with addressline1, addressline2, country, state, city, zip_code, location, and is_indian.
export async function upsertAddress(address: any, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");

  // Map location to is_indian
  let is_indian = undefined;
  if (typeof address.location === "string") {
    is_indian = address.location === "india";
  }

  const { data, error } = await supabase
    .from("addresses")
    .upsert({
      id: address.id,
      user_id,
      addressline1: address.addressline1,
      addressline2: address.addressline2,
      country: address.country,
      state: address.state,
      city: address.city,
      zip_code: address.zip_code,
      is_indian,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error updating address:", error);
    throw error;
  }

  // Update profile completion
  await updateProfileCompletion(user_id);

  return data;
}

// Get social links
export async function getSocialLinks(userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");

  const { data, error } = await supabase.from("social_links").select("*").eq("user_id", user_id);
  if (error) {
    console.error("Error fetching social links:", error);
    throw error;
  }
  return data || [];
}

// Add or update social link
export async function upsertSocialLink(socialLink: Partial<SocialLink>, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");

  // Check if a link for this platform already exists
  const { data: existingLinks } = await supabase
    .from("social_links")
    .select("id")
    .eq("user_id", user_id)
    .eq("platform", socialLink.platform as string);

  const existingId = existingLinks && existingLinks.length > 0 ? existingLinks[0].id : null;

  let data, error;
  if (existingId) {
    // Update the existing record
    ({ data, error } = await supabase
    .from("social_links")
      .update({
      ...socialLink,
      updated_at: new Date().toISOString(),
    })
      .eq("id", existingId)
    .select()
      .single());
  } else {
    // Insert a new record
    ({ data, error } = await supabase
      .from("social_links")
      .insert({
        user_id,
        ...socialLink,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single());
  }

  if (error) {
    console.error("Error updating social link:", error);
    throw error;
  }

  // Update profile completion
  await updateProfileCompletion(user_id);

  return data;
}

// Default notification settings
const DEFAULT_NOTIFICATION_SETTINGS = {
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  marketing_emails: true,
  receive_newsletters: true,
  get_ekart_notifications: true,
  stay_updated_on_jobs: true,
  receive_daily_event_updates: false,
  get_trending_community_posts: true,
}

export async function getNotificationSettings(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("notification_settings")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching notification settings:", error)
    throw error
  }

  return data || null
}

export async function updateNotificationSettings(userId: string, settings: any) {
  try {
    // First ensure notification settings exist
    const currentSettings = await getNotificationSettings(userId)

    // Update the settings
    const { data, error } = await supabase
      .from("notification_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    // Invalidate notification settings cache
    apiCache.invalidate(`notification_settings:${userId}`)
    return data
  } catch (error) {
    console.error("Error updating notification settings:", error)
    throw error
  }
}

// Get profile completion
export async function getProfileCompletion(userId?: string) {
  const supabase = createBrowserClient();
  let id = userId;
  if (!id) {
    const { data: { user } } = await supabase.auth.getUser();
    id = user?.id;
  }
  if (!id) throw new Error("User not authenticated");

  const { data, error } = await supabase.from("profile_completion").select("*").eq("user_id", id).single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching profile completion:", error);
    throw error;
  }

  return (
    data || {
      user_id: id,
      basic_details: false,
      employment: false,
      certifications: false,
      address: false,
      social_links: false,
      completion_percentage: 0,
    }
  );
}

// Update profile completion
export async function updateProfileCompletion(userId: string) {
  const supabase = createBrowserClient()

  // Check each section for completion
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  const { data: employment } = await supabase.from("employment").select("*").eq("user_id", userId)

  const { data: certifications } = await supabase.from("certifications").select("*").eq("user_id", userId)

  const { data: addresses } = await supabase.from("addresses").select("*").eq("user_id", userId)

  const { data: socialLinks } = await supabase.from("social_links").select("*").eq("user_id", userId)

  // Log the data for debugging
  console.log("[Profile Completion] Data:", {
    profile: !!profile,
    employment: employment?.length,
    certifications: certifications?.length,
    addresses: addresses?.length,
    socialLinks: socialLinks?.length
  })

  // Determine completion status for each section (20% each)
  const basicDetailsComplete = !!(profile && profile.full_name && profile.email)
  const employmentComplete = !!(employment && employment.length > 0)
  const certificationsComplete = !!(certifications && certifications.length > 0)
  const addressComplete = !!(addresses && addresses.length > 0)
  
  // Updated social links check - only verify that there is at least one valid social link
  const socialLinksComplete = !!(socialLinks && socialLinks.length > 0)

  // Log completion status for debugging
  // console.log("[Profile Completion] Status:", {
  //   basicDetailsComplete,
  //   employmentComplete,
  //   certificationsComplete,
  //   addressComplete,
  //   socialLinksComplete
  // })

  // Calculate completion percentage (each section is worth 20%)
  const completedSections = [
    basicDetailsComplete,
    employmentComplete,
    certificationsComplete,
    addressComplete,
    socialLinksComplete,
  ].filter(Boolean).length

  const completionPercentage = Math.round((completedSections / 5) * 100)

  // Log final percentage
  // console.log("[Profile Completion] Percentage:", completionPercentage)

  // Update the profile_completion record
  const { data, error } = await supabase
    .from("profile_completion")
    .upsert({
      user_id: userId,
      basic_details: basicDetailsComplete,
      employment: employmentComplete,
      certifications: certificationsComplete,
      address: addressComplete,
      social_links: socialLinksComplete,
      completion_percentage: completionPercentage,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error updating profile completion:", error)
    throw error
  }

  // If profile is now complete, award points
  if (completionPercentage === 100) {
    try {
      // Check if we've already awarded points for profile completion
      const { data: transactions } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .eq("reason", "Profile completion bonus")
        .eq("status", "completed")

      if (!transactions || transactions.length === 0) {
        // Award points for completing profile in 'profile' category
        await awardCategoryPoints(userId, "profile", 100, "Profile completion bonus")
      }
    } catch (err) {
      console.error("Error awarding profile completion points:", err)
    }
  }

  return data
}

// Helper function to award points (used internally)
async function awardPoints(userId: string, amount: number, reason: string, metadata?: any) {
  const supabase = createBrowserClient()

  // Create a transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      amount,
      type: "earn",
      reason,
      status: "completed",
      metadata,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (transactionError) {
    console.error("Error creating transaction:", transactionError)
    throw transactionError
  }

  // Update points balance
  const { data: currentPoints } = await supabase.from("points").select("*").eq("user_id", userId).single()

  const { error: pointsError } = await supabase.from("points").upsert({
    user_id: userId,
    total_points: (currentPoints?.total_points as number || 0) + amount,
    total_earned: (currentPoints?.total_earned as number || 0) + amount,
    last_updated: new Date().toISOString(),
  })

  if (pointsError) {
    console.error("Error updating points:", pointsError)

    // Mark transaction as failed
    await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id as string)

    throw pointsError
  }

  return transaction
}

// Add a function to update the public status of a profile
export async function updateProfilePublicStatus(isPublic: boolean, userId?: string) {
  const supabase = createBrowserClient();
  let id = userId;
  if (!id) {
    const { data: { user } } = await supabase.auth.getUser();
    id = user?.id;
  }
  if (!id) throw new Error("User not authenticated");

  const { data, error } = await supabase
    .from("profiles")
    .update({ is_public: isPublic, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating profile public status:", error);
    throw error;
  }

  return data;
}

// Create a new profile for a user
export async function createProfileForUser(userId: string, email: string, metadata?: any) {
  const supabase = createBrowserClient()
  
  const fullName = metadata?.full_name || metadata?.name || email.split('@')[0]
  
  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      full_name: fullName,
      email: email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating profile:", error)
    throw error
  }

  // Create points entry
  try {
    await supabase.from("points").insert({
      user_id: userId,
      total_points: 0,
      total_earned: 0,
      total_spent: 0,
      last_updated: new Date().toISOString(),
    })
  } catch (pointsError) {
    console.warn("Error creating points entry:", pointsError)
  }

  // Initialize profile completion
  try {
    await updateProfileCompletion(userId)
  } catch (completionError) {
    console.warn("Error updating profile completion:", completionError)
  }

  return data
}

// ================================================================
// COMPREHENSIVE PROFILE UPDATE FUNCTION
// ================================================================

/**
 * Comprehensive profile update that handles all profile-related data
 * This function updates the main profile and all related tables
 */
export async function updateComprehensiveProfile(
  profileData: any, 
  supabaseClient?: any
) {
  const supabase = supabaseClient || createBrowserClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("Authentication error: No user found in session");
      throw new Error("User not authenticated. Please ensure you are logged in and try again.");
    }

    const updatePromises = [];

    // Helper to get latest employment record
    async function getLatestEmployment(userId: string) {
      const { data, error } = await supabase
        .from("employment")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      return error ? null : data;
    }
    // Helper to get latest certification record
    async function getLatestCertification(userId: string) {
      const { data, error } = await supabase
        .from("certifications")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      return error ? null : data;
    }
    // Helper to get latest address record
    async function getLatestAddress(userId: string) {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single();
      return error ? null : data;
    }

    // 1. Basic Details ("basic" section)
    if (profileData.basic) {
      const basic = profileData.basic;
      updatePromises.push(
        supabase.from("profiles").upsert({
          id: user.id,
          full_name: basic.fullName,
          email: basic.email,
          phone_code: basic.phoneCode,
          phone_number: basic.phoneNumber,
          dob: basic.dob,
          gender: basic.gender,
          is_public: basic.is_public,
          updated_at: new Date().toISOString(),
        }).select().single()
      );
    }

    // 2. Employment (update latest record if exists, else insert)
    const employmentFields = {
      ...(profileData.employment || {}),
      ...(profileData.basic || {}),
    };
    const employmentRelevantFields = [
      'companyName', 'designation', 'companyEmail', 'location', 'work_status',
      'totalExperienceYears', 'totalExperienceMonths', 'currentSalary', 'skills', 'noticePeriod'
    ];
    const employmentPayload: Record<string, any> = {};
    for (const key of employmentRelevantFields) {
      if (employmentFields[key] !== undefined) employmentPayload[key] = employmentFields[key];
    }
    const hasEmploymentData = Object.keys(employmentPayload).length > 0;
    if (hasEmploymentData) {
      const prevEmployment = await getLatestEmployment(user.id);
      const keyMap: Record<string, string> = {
        companyName: 'company_name',
        designation: 'designation',
        companyEmail: 'company_email',
        location: 'location',
        work_status: 'work_status',
        totalExperienceYears: 'total_experience_years',
        totalExperienceMonths: 'total_experience_months',
        currentSalary: 'current_salary',
        skills: 'skills',
        noticePeriod: 'notice_period',
      };
      const mergedEmployment: Record<string, any> = {
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };
      if (prevEmployment && prevEmployment.id) {
        mergedEmployment.id = prevEmployment.id;
      }
      for (const key in employmentPayload) {
        mergedEmployment[keyMap[key]] = employmentPayload[key];
      }
      updatePromises.push(
        supabase.from("employment").upsert(mergedEmployment).select().single()
      );
    }

    // 3. Education (keep as is)
    if (profileData.education) {
      const edu = profileData.education;
      updatePromises.push(
        supabase.from("education").upsert({
          user_id: user.id,
          education_level: edu.education,
          university: edu.university,
          course: edu.course,
          specialization: edu.specialization,
          course_type: edu.courseType,
          updated_at: new Date().toISOString(),
        }).select().single()
      );
    }

    // 4. Address (update latest record if exists, else insert)
    if (profileData.addresses) {
      const addr = profileData.addresses;
      const prevAddress = await getLatestAddress(user.id);
      const mergedAddress: Record<string, any> = {
        user_id: user.id,
        addressline1: addr.addressline1 || addr.addressLine1 || addr.address_line1 || addr.address_line_1 || "",
        addressline2: addr.addressline2 || addr.addressLine2 || addr.address_line2 || addr.address_line_2 || "",
        country: addr.country,
        location: addr.location,
        state: addr.state,
        city: addr.city,
        zip_code: addr.zip_code || addr.zipCode || "",
        updated_at: new Date().toISOString(),
      };
      if (prevAddress && prevAddress.id) {
        mergedAddress.id = prevAddress.id;
      }
      updatePromises.push(
        supabase.from("addresses").upsert(mergedAddress).select().single()
      );
    }

    // 5. Certifications (update latest record if exists, else insert)
    if (profileData.certifications) {
      const cert = profileData.certifications;
      const prevCert = await getLatestCertification(user.id);
      const mergedCert: Record<string, any> = {
        user_id: user.id,
        certification_name: cert.certificationName,
        completion_id: cert.completionId,
        start_month: cert.startMonth,
        start_year: cert.startYear,
        end_month: cert.endMonth,
        end_year: cert.endYear,
        does_not_expire: cert.doesNotExpire,
        updated_at: new Date().toISOString(),
      };
      if (prevCert && prevCert.id) {
        mergedCert.id = prevCert.id;
      }
      updatePromises.push(
        supabase.from("certifications").upsert(mergedCert).select().single()
      );
    }

    // Wait for all updates
    const results = await Promise.allSettled(updatePromises);
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.warn(`Section update ${idx} failed:`, result.reason);
      }
    });

    // Optionally, return the updated profile
    const { data: updatedProfile } = await supabase
      .from("profiles")
      .select(`
        *,
        employment (*),
        education (*),
        certifications (*),
        addresses (*)
      `)
      .eq("id", user.id)
      .single();

    return updatedProfile;
  } catch (error: any) {
    console.error("Comprehensive profile update error:", error);
    throw error;
  }
}

// Helper: deep equality check
function deepEqual(obj1: any, obj2: any): boolean {
  return JSON.stringify(obj1) === JSON.stringify(obj2);
}

// Get most recent employment record
export async function getLatestEmploymentRecord(userId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("employment")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

// Add new employment record only if changed, else update latest
export async function addEmploymentIfChanged(employment: Partial<Employment>, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");
  const prev = await getLatestEmploymentRecord(user_id);
  const relevant = [
    "company_name", "designation", "company_email", "location", "work_status",
    "total_experience_years", "total_experience_months", "current_salary", "skills", "notice_period",
    "expected_salary", "salary_frequency", "is_current_employment", "employment_type", "joining_year", "joining_month"
  ];
  const prevData = prev ? Object.fromEntries(relevant.map(k => [k, (prev as any)[k]])) : {};
  const newData = Object.fromEntries(relevant.map(k => [k, (employment as any)[k]]));
  if (deepEqual(prevData, newData)) return prev; // No change
  let result;
  if (prev && prev.id) {
    // Update existing
    const { data: updated, error } = await supabase
      .from("employment")
      .update({
        ...employment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prev.id)
      .eq("user_id", user_id)
      .select()
      .single();
    if (error) throw error;
    result = updated;
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from("employment")
      .insert({
        user_id,
        ...employment,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    result = inserted;
  }
  await updateProfileCompletion(user_id);
  return result;
}

// Get most recent certification record
export async function getLatestCertificationRecord(userId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("certifications")
    .select("*")
    .eq("user_id", userId)
    .not("name", "is", null)
    .not("completion_id", "is", null)
    .not("url", "is", null)
    .not("validity", "is", null)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

// Add new certification only if changed, else update latest
export async function addCertificationIfChanged(certification: Partial<Certification>, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");
  // If all 4 fields are blank, do not insert
  if (!certification.name && !certification.completion_id && !certification.url && !certification.validity) {
    return null;
  }
  const prev = await getLatestCertificationRecord(user_id);
  const relevant = [
    "name", "completion_id", "url", "validity", "does_not_expire", "start_month", "start_year", "end_month", "end_year"
  ];
  const prevData = prev ? Object.fromEntries(relevant.map(k => [k, (prev as any)[k]])) : {};
  const newData = Object.fromEntries(relevant.map(k => [k, (certification as any)[k]]));
  if (deepEqual(prevData, newData)) return prev;
  let result;
  if (prev && prev.id) {
    // Update existing
    const { data: updated, error } = await supabase
      .from("certifications")
      .update({
        ...certification,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prev.id)
      .eq("user_id", user_id)
      .select()
      .single();
    if (error) throw error;
    result = updated;
  } else {
    // Insert new
    const { data: inserted, error } = await supabase
      .from("certifications")
      .insert({
        user_id,
        ...certification,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) throw error;
    result = inserted;
  }
  return result;
}

// Get most recent education record
export async function getLatestEducationRecord(userId: string) {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("education")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data || null;
}

// Add new education only if changed
export async function addEducationIfChanged(education: Partial<Education>, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");
  const prev = await getLatestEducationRecord(user_id);
  const relevant = [
    "level", "university", "course", "specialization", "course_type", "start_date", "end_date"
  ];
  const prevData = prev ? Object.fromEntries(relevant.map(k => [k, (prev as any)[k]])) : {};
  const newData = Object.fromEntries(relevant.map(k => [k, (education as any)[k]]));
  if (deepEqual(prevData, newData)) return prev;
  const { data: inserted, error } = await supabase
    .from("education")
    .insert({
      user_id,
      ...education,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

// Update notification settings only if changed
export async function updateNotificationSettingsIfChanged(settings: Partial<NotificationSettings>, userId?: string) {
  const supabase = createBrowserClient();
  let user_id = userId;
  if (!user_id) {
    const { data: { user } } = await supabase.auth.getUser();
    user_id = user?.id;
  }
  if (!user_id) throw new Error("User not authenticated");
  const current = await getNotificationSettings(user_id);
  const relevant = [
    "receive_newsletters", "get_ekart_notifications", "stay_updated_on_jobs", "receive_daily_event_updates", "get_trending_community_posts"
  ];
  const currentData = Object.fromEntries(relevant.map(k => [k, (current as any)[k]]));
  const newData = Object.fromEntries(relevant.map(k => [k, (settings as any)[k]]));
  if (deepEqual(currentData, newData)) return current;
  const { data, error } = await supabase
    .from("notification_settings")
    .upsert({
      user_id,
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

// Delete certification
export async function deleteCertification(id: string, userId?: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}

// Delete blank certifications
export async function deleteBlankCertifications(userId: string) {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("user_id", userId)
    .is("name", null)
    .is("completion_id", null)
    .is("url", null)
    .is("validity", null);
  if (error) throw error;
  return true;
}

// Helper to generate a unique AVC ID (AVC-XXXXXX)
async function generateUniqueAVCId() {
  const supabase = createBrowserClient();
  let avcId;
  let exists = true;
  while (exists) {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    avcId = `AVC-${randomNum}`;
    const { data } = await supabase.from("profiles").select("id").eq("avc_id", avcId).single();
    exists = !!data;
  }
  return avcId;
}

// Ensure AVC ID exists for user, generate and update if missing
export async function ensureAVCIdForUser(userId?: string) {
  const supabase = createBrowserClient();
  let id = userId;
  if (!id) {
    const { data: { user } } = await supabase.auth.getUser();
    id = user?.id;
  }
  if (!id) throw new Error("User not authenticated");
  const { data: profile, error } = await supabase.from("profiles").select("avc_id").eq("id", id).single();
  if (error && error.code !== "PGRST116") throw error;
  if (!profile?.avc_id) {
    const avcId = await generateUniqueAVCId();
    await supabase.from("profiles").update({ avc_id: avcId, updated_at: new Date().toISOString() }).eq("id", id);
    return avcId;
  }
  return profile.avc_id;
}

// Update the avatar_url for a user profile
export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const supabase = await createBrowserClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) {
    console.error("Error updating avatar_url:", error);
    throw error;
  }
  return data;
}

export async function getProfile(userId: string) {
  try {
    const supabase = createBrowserClient()
    
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
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
          total_spent
        )
      `)
      .eq("id", userId)
      .single()

    if (error) {
      console.error("Error fetching profile:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in getProfile:", error)
    throw error
  }
}

export async function updateProfile(userId: string, updates: any) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single()

    if (error) throw error

    // Invalidate profile cache
    apiCache.invalidate(`profile:${userId}`)
    return data
  } catch (error) {
    console.error("Error updating profile:", error)
    throw error
  }
}

export async function getPoints(userId: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("points")
    .select("*")
    .eq("user_id", userId)
    .single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching points:", error)
    throw error
  }

  return data || {
    points: 0,
    total_earned: 0,
    total_spent: 0,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
}

export async function updatePoints(userId: string, points: number) {
  try {
    const { data, error } = await supabase
      .from("points")
      .update({ points, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single()

    if (error) throw error

    // Invalidate points cache
    apiCache.invalidate(`points:${userId}`)
    return data
  } catch (error) {
    console.error("Error updating points:", error)
    throw error
  }
}

// Invalidate all user-related caches
export function invalidateUserCache(userId: string) {
  apiCache.invalidateUserCache(userId)
}

// Get basic details
export async function getBasicDetails(userId: string) {
  const supabase = createBrowserClient()

  // First get the profile data
  const { data: profileData, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    console.error("Error fetching profile:", profileError)
    throw profileError
  }

  // Then get the employment data
  const { data: employmentData, error: employmentError } = await supabase
    .from("employment")
    .select("work_status")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single()

  if (employmentError && employmentError.code !== "PGRST116") {
    console.error("Error fetching employment:", employmentError)
    throw employmentError
  }

  // Combine the data
  return {
    ...profileData,
    employment: employmentData ? [employmentData] : null
  }
}
