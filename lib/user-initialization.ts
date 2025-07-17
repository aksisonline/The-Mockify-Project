import { createServiceRoleClient } from "@/lib/supabase/server"
import { awardCategoryPoints } from '@/lib/points-category-service'
import { updateProfileCompletion } from '@/lib/profile-service'
import { ensureAVCIdForUser } from '@/lib/profile-service'

interface InitResult {
  success: boolean
  wasInitialized: boolean
  details: {
    profileCreated?: boolean
    employmentCreated?: boolean
    addressCreated?: boolean
    notificationSettingsCreated?: boolean
    pointsCreated?: boolean
    error?: string
  }
}

export async function initializeUser(
  userId: string,
  email: string,
  metadata: any
): Promise<InitResult> {
  const supabase = createServiceRoleClient()
  const result: InitResult = {
    success: true,
    wasInitialized: false,
    details: {}
  }

  try {
    // First check if profile already exists
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single()

    if (profileCheckError && profileCheckError.code !== "PGRST116") {
      console.error("[User Init] Error checking profile:", profileCheckError)
      throw profileCheckError
    }

    if (existingProfile) {
      // console.log("[User Init] Profile already exists for user:", userId)
      return {
        success: true,
        wasInitialized: false,
        details: {
          profileCreated: false,
          employmentCreated: false,
          addressCreated: false,
          notificationSettingsCreated: false,
          pointsCreated: false
        }
      }
    }

    // Extract name from metadata
    const fullName = metadata.full_name || metadata.name || metadata.user_name || email.split('@')[0]

    // Create profile with retry
    let profileCreated = false
    let retryCount = 0
    const maxRetries = 3

    while (!profileCreated && retryCount < maxRetries) {
      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: userId,
            email: email,
            full_name: fullName,
            avatar_url: metadata.avatar_url || metadata.picture,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          if (profileError.code === "23505") { // Unique violation
            // console.log("[User Init] Profile already exists, skipping creation")
            profileCreated = true
            result.details.profileCreated = false
          } else {
            throw profileError
          }
        } else {
          profileCreated = true
          result.details.profileCreated = true
        }
      } catch (error) {
        retryCount++
        if (retryCount === maxRetries) {
          console.error("[User Init] Failed to create profile after retries:", error)
          throw error
        }
        // Wait with exponential backoff before retrying
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000))
      }
    }

    // Initialize employment record
    try {
      const { error: employmentError } = await supabase
        .from("employment")
        .insert({
          user_id: userId,
          updated_at: new Date().toISOString()
        })

      if (employmentError) {
        console.error("[User Init] Error creating employment record:", employmentError)
        result.success = false
        result.details.error = `Failed to create employment record: ${employmentError.message}`
      } else {
        result.details.employmentCreated = true
      }
    } catch (error) {
      console.error("[User Init] Error creating employment record:", error)
      result.success = false
      result.details.error = `Failed to create employment record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Initialize address record
    try {
      const { error: addressError } = await supabase
        .from("addresses")
        .insert({
          user_id: userId,
          updated_at: new Date().toISOString()
        })

      if (addressError) {
        console.error("[User Init] Error creating address record:", addressError)
        result.success = false
        result.details.error = `Failed to create address record: ${addressError.message}`
      } else {
        result.details.addressCreated = true
      }
    } catch (error) {
      console.error("[User Init] Error creating address record:", error)
      result.success = false
      result.details.error = `Failed to create address record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Initialize notification settings
    try {
      const { error: notificationError } = await supabase
        .from("notification_settings")
        .insert({
          user_id: userId,
          email_notifications: true,
          push_notifications: true,
          updated_at: new Date().toISOString()
        })

      if (notificationError) {
        console.error("[User Init] Error creating notification settings:", notificationError)
        result.success = false
        result.details.error = `Failed to create notification settings: ${notificationError.message}`
      } else {
        result.details.notificationSettingsCreated = true
      }
    } catch (error) {
      console.error("[User Init] Error creating notification settings:", error)
      result.success = false
      result.details.error = `Failed to create notification settings: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // Initialize points with welcome bonus
    try {
      const { error: pointsError } = await supabase
        .from("points")
        .insert({
          user_id: userId,
          points: 100, // Welcome bonus
          source: "welcome_bonus",
          description: "Welcome to Mockify!",
          created_at: new Date().toISOString()
        })

      if (pointsError) {
        console.error("[User Init] Error creating points record:", pointsError)
        result.success = false
        result.details.error = `Failed to create points record: ${pointsError.message}`
      } else {
        result.details.pointsCreated = true
      }
    } catch (error) {
      console.error("[User Init] Error creating points record:", error)
      result.success = false
      result.details.error = `Failed to create points record: ${error instanceof Error ? error.message : 'Unknown error'}`
    }

    // If we got here and created at least the profile, consider it initialized
    if (profileCreated) {
      result.wasInitialized = true
    }

    return result
  } catch (error) {
    console.error("[User Init] Critical error during initialization:", error)
    return {
      success: false,
      wasInitialized: false,
      details: {
        error: error instanceof Error ? error.message : "Unknown error during initialization"
      }
    }
  }
} 