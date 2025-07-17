import { createBrowserClient } from "./supabase/client"
import { createServerClient } from "./supabase/server"
import { createTransaction } from "./transaction-service"
import type { Reward } from "@/types/supabase"
import { sendRewardPurchaseEmail } from "./email-service"

// Get all rewards
export async function getRewards(options?: {
  category?: "merchandise" | "digital" | "experiences"
  featured?: boolean
  activeOnly?: boolean
  limit?: number
  offset?: number
}) {
  const supabase = createBrowserClient()

  let query = supabase.from("rewards").select("*", { count: "exact" })

  // Apply filters
  if (options?.category) {
    query = query.eq("category", options.category)
  }

  if (options?.featured) {
    query = query.eq("is_featured", true)
  }

  if (options?.activeOnly !== false) {
    query = query.eq("is_active", true)
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  // Order by featured first, then by price
  query = query.order("is_featured", { ascending: false }).order("price", { ascending: true })

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching rewards:", error)
    throw error
  }

  return {
    rewards: data || [],
    count: count || 0,
  }
}

// Get reward by ID
export async function getRewardById(id: string) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase.from("rewards").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching reward:", error)
    throw error
  }

  return data
}

// Get featured rewards
export async function getFeaturedRewards(limit = 5) {
  const { rewards } = await getRewards({ featured: true, limit })
  return rewards
}

// Purchase a reward
export async function purchaseReward(rewardId: string, quantity = 1, userId?: string) {
  const supabase = createBrowserClient()

  // Get the current user if userId is not provided
  let user;
  if (!userId) {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser;
  } else {
    // If userId is provided, we'll use it directly
    user = { id: userId };
  }

  if (!user) {
    throw new Error("User not authenticated")
  }

  // Get the reward
  const reward = await getRewardById(rewardId)

  if (!reward) {
    throw new Error("Reward not found")
  }

  // Check if reward is active
  if (!reward.is_active) {
    throw new Error("This reward is no longer available")
  }

  // Check if enough quantity is available
  if (reward.quantity < quantity) {
    throw new Error("Not enough quantity available")
  }

  // Check if user has already purchased this reward (ever)
  const { data: existingPurchase, error: existingCheckError } = await supabase
    .from("reward_purchases")
    .select("id, purchased_at")
    .eq("user_id", user.id)
    .eq("reward_id", rewardId)
    .single()

  if (existingCheckError && existingCheckError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error("Error checking existing purchases:", existingCheckError)
    throw new Error("Failed to verify purchase eligibility")
  }

  if (existingPurchase) {
    throw new Error("You have already redeemed this reward. Each reward can only be redeemed once per user.")
  }

  // Check if user has already purchased this reward recently (within the last 5 minutes) - additional protection
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const { data: recentPurchase, error: checkError } = await supabase
    .from("reward_purchases")
    .select("id, purchased_at")
    .eq("user_id", user.id)
    .eq("reward_id", rewardId)
    .gte("purchased_at", fiveMinutesAgo)
    .single()

  if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
    console.error("Error checking recent purchases:", checkError)
    throw new Error("Failed to verify purchase eligibility")
  }

  if (recentPurchase) {
    throw new Error("You have already purchased this reward recently. Please wait a few minutes before trying again.")
  }

  // Calculate total cost
  const totalCost = reward.price * quantity

  // Create points transaction (spend points)
  const transactionResult = await createTransaction({
    userId: user.id,
    transactionType: "points",
    amount: totalCost,
    type: "spend",
    reason: `Reward purchase: ${reward.title}`,
    categoryName: "rewards",
  })

  if (!transactionResult.success || !transactionResult.transaction) {
    throw new Error(transactionResult.error || "Failed to create transaction")
  }

  // Create reward purchase record
  const { error: purchaseError } = await supabase
    .from("reward_purchases")
    .insert({
      user_id: user.id,
      reward_id: rewardId,
      quantity: quantity,
      points_spent: totalCost,
      transaction_id: transactionResult.transaction.id,
      status: 'pending', // Use the status field properly
      metadata: {
        seller_name: 'MOCKIFY LLC',
        seller_email: 'hello@mockify.vercel.app',
        seller_address: 'H.No- 362, 12th Main Road, Sector 5, HSR Layout, Bangalore-560102',
        seller_phone: '+91 9966416417',
        order_type: 'reward_redemption',
        reward_title: reward.title,
        reward_category: reward.category
      }
    })

  if (purchaseError) {
    throw purchaseError
  }

  // Update reward quantity using service role client to bypass RLS policies
  const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
  const serviceSupabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { error: updateError } = await serviceSupabase
    .from("rewards")
    .update({
      quantity: reward.quantity - quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", rewardId)

  if (updateError) {
    console.error("Error updating reward quantity:", updateError)
    throw updateError
  }

  // console.log(`✅ Successfully decreased quantity for reward ${rewardId} from ${reward.quantity} to ${reward.quantity - quantity}`)

  // Clear points cache to ensure UI shows updated balance
  try {
    const { clearPointsCache } = await import("./points-service")
    clearPointsCache(user.id)
  } catch (cacheError) {
    console.warn("Failed to clear points cache:", cacheError)
    // Don't fail the purchase if cache clearing fails
  }

  // Clear profile cache to ensure profile data (including points) is refreshed
  try {
    const { invalidateUserCache } = await import("./profile-service")
    invalidateUserCache(user.id)
  } catch (cacheError) {
    console.warn("Failed to clear profile cache:", cacheError)
    // Don't fail the purchase if cache clearing fails
  }

  // Send confirmation email
  try {
    // Get user profile for email
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .single()

    if (profile?.email) {
      await sendRewardPurchaseEmail(
        profile.email,
        profile.full_name || "User",
        reward.title,
        quantity,
        totalCost,
        transactionResult.transaction.id,
        new Date().toLocaleDateString()
      )
      // console.log(`✅ Reward purchase confirmation email sent to ${profile.email}`)
    }
  } catch (emailError) {
    console.error("Failed to send reward purchase email:", emailError)
    // Don't throw error - email failure shouldn't break the purchase
  }

  return {
    success: true,
    transaction: transactionResult.transaction,
  }
}

// Get user's reward purchases
export async function getUserRewardPurchases(userId?: string) {
  const supabase = createBrowserClient()

  // If userId is not provided, get the current user
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []
    userId = user.id
  }

  try {
    // Try to use the view first
    const { data, error } = await supabase
      .from("reward_purchase_details")
      .select("*")
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })

    if (error) {
      console.error("Error fetching user reward purchases from view:", error)
      // Fallback to direct query if view doesn't exist
      return await getUserRewardPurchasesFallback(userId)
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserRewardPurchases:", error)
    // Fallback to direct query
    return await getUserRewardPurchasesFallback(userId)
  }
}

// Fallback function for when the view doesn't exist
async function getUserRewardPurchasesFallback(userId: string) {
  const supabase = createBrowserClient()

  try {
    // Use direct join query instead of view
    const { data, error } = await supabase
      .from("reward_purchases")
      .select(`
        *,
        rewards!reward_purchases_reward_id_fkey (
          title,
          description,
          category
        ),
        transactions!reward_purchases_transaction_id_fkey (
          status
        )
      `)
      .eq("user_id", userId)
      .order("purchased_at", { ascending: false })

    if (error) {
      console.error("Error in getUserRewardPurchasesFallback:", error)
      return []
    }

    // Transform the data to match the view structure
    const transformedData = (data || []).map((purchase: any) => ({
      id: purchase.id,
      user_id: purchase.user_id,
      user_name: "Current User", // We know this is the current user
      user_email: "", // Will be filled by the calling function if needed
      user_avatar_url: null,
      reward_id: purchase.reward_id,
      reward_title: purchase.rewards?.title || "Unknown Reward",
      reward_description: purchase.rewards?.description || "",
      reward_category: purchase.rewards?.category || "",
      quantity: purchase.quantity,
      points_spent: purchase.points_spent,
      purchased_at: purchase.purchased_at,
      transaction_id: purchase.transaction_id,
      transaction_status: purchase.transactions?.status || "pending",
      purchase_status: purchase.status || "pending"
    }))

    return transformedData
  } catch (error) {
    console.error("Error in getUserRewardPurchasesFallback:", error)
    return []
  }
}

// Admin: Create a new reward
export async function createReward(reward: Omit<Reward, "id" | "created_at" | "updated_at">) {
  // Use service role client to bypass RLS policies
  const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
  const supabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create insert object without using spread
  const insertData: Record<string, any> = {
    title: reward.title,
    description: reward.description,
    price: reward.price,
    quantity: reward.quantity,
    delivery_description: reward.delivery_description,
    category: reward.category,
    image_url: reward.image_url,
    is_featured: reward.is_featured,
    is_active: reward.is_active,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("rewards").insert(insertData).select().single()

  if (error) {
    console.error("Error creating reward:", error)
    throw error
  }

  return data
}

// Admin: Update a reward
export async function updateReward(id: string, reward: Partial<Omit<Reward, "id" | "created_at" | "updated_at">>) {
  // Use service role client to bypass RLS policies
  const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
  const supabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // Create update object without using spread
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // Manually copy properties
  if (reward.title !== undefined) updateData.title = reward.title
  if (reward.description !== undefined) updateData.description = reward.description
  if (reward.price !== undefined) updateData.price = reward.price
  if (reward.quantity !== undefined) updateData.quantity = reward.quantity
  if (reward.delivery_description !== undefined) updateData.delivery_description = reward.delivery_description
  if (reward.category !== undefined) updateData.category = reward.category
  if (reward.image_url !== undefined) updateData.image_url = reward.image_url
  if (reward.is_featured !== undefined) updateData.is_featured = reward.is_featured
  if (reward.is_active !== undefined) updateData.is_active = reward.is_active

  const { data, error } = await supabase.from("rewards").update(updateData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating reward:", error)
    throw error
  }

  return data
}

// Admin: Delete a reward
export async function deleteReward(id: string) {
  // Use service role client to bypass RLS policies
  const { createClient: createSupabaseServiceClient } = await import('@supabase/supabase-js')
  const supabase = createSupabaseServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  const { error } = await supabase.from("rewards").delete().eq("id", id)

  if (error) {
    console.error("Error deleting reward:", error)
    throw error
  }

  return true
}

// Admin: Get all reward purchases
export async function getAllRewardPurchases(options?: {
  limit?: number
  offset?: number
  userId?: string
  rewardId?: string
}) {
  const supabase = await createServerClient()

  try {
    // First, get purchases from the existing view
    let query = supabase
      .from("reward_purchase_details")
      .select("*", { count: "exact" })

    // Apply filters
    if (options?.userId) {
      query = query.eq("user_id", options.userId)
    }

    if (options?.rewardId) {
      query = query.eq("reward_id", options.rewardId)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    // Order by purchase date
    query = query.order("purchased_at", { ascending: false })

    const { data: purchases, error, count } = await query

    if (error) {
      console.error("Error fetching reward purchases from view:", error)
      // Fallback to direct query if view doesn't exist
      return await getAllRewardPurchasesFallback(options)
    }

    // If we have purchases, fetch additional user data separately
    let enhancedPurchases = purchases || []
    
    if (purchases && purchases.length > 0) {
      // Get unique user IDs
      const userIds = [...new Set(purchases.map((p: any) => p.user_id))]
      
      try {
        // Fetch user profiles with phone and AVC ID
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select("id, phone_code, phone_number, avc_id")
          .in("id", userIds)

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError)
        }

        // Fetch addresses for these users
        const { data: addresses, error: addressesError } = await supabase
          .from("addresses")
          .select("*")
          .in("user_id", userIds)

        if (addressesError) {
          console.error("Error fetching addresses:", addressesError)
        }

        // Create maps for quick lookup
        const profilesMap = (profiles || []).reduce((acc: any, profile: any) => {
          acc[profile.id] = profile
          return acc
        }, {})

        const addressesMap = (addresses || []).reduce((acc: any, address: any) => {
          if (!acc[address.user_id]) {
            acc[address.user_id] = []
          }
          acc[address.user_id].push(address)
          return acc
        }, {})

        // Enhance purchases with profile and address data
        enhancedPurchases = purchases.map((purchase: any) => {
          const profile = profilesMap[purchase.user_id] || {}
          const userAddresses = addressesMap[purchase.user_id] || []
          const address = userAddresses[0] || {} // Get first address if multiple exist
          
          // Construct full address string
          const addressParts = [
            address.addressline1,
            address.addressline2,
            address.city,
            address.state,
            address.zip_code,
            address.country
          ].filter(Boolean)
          
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : 'No address provided'
          
          // Construct phone number
          const phone = profile.phone_code && profile.phone_number 
            ? `${profile.phone_code}${profile.phone_number}` 
            : null

          return {
            id: purchase.id,
            user_id: purchase.user_id,
            user_name: purchase.user_name || "Unknown User",
            user_email: purchase.user_email || "",
            user_avatar_url: purchase.user_avatar_url || null,
            user_phone: phone,
            user_avc_id: profile.avc_id,
            user_address: fullAddress,
            user_address_details: address,
            reward_id: purchase.reward_id,
            reward_title: purchase.reward_title || "Unknown Reward",
            reward_description: purchase.reward_description || "",
            reward_category: purchase.reward_category || "",
            quantity: purchase.quantity,
            points_spent: purchase.points_spent,
            purchased_at: purchase.purchased_at,
            transaction_id: purchase.transaction_id,
            transaction_status: purchase.transaction_status || "pending",
            purchase_status: purchase.purchase_status || "pending"
          }
        })
      } catch (error) {
        console.error("Error fetching additional user data:", error)
        // If additional data fetch fails, still return basic purchase data
        enhancedPurchases = purchases.map((purchase: any) => ({
          ...purchase,
          user_phone: null,
          user_avc_id: null,
          user_address: 'No address provided',
          user_address_details: {}
        }))
      }
    }

    return {
      purchases: enhancedPurchases,
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getAllRewardPurchases:", error)
    // Fallback to direct query
    return await getAllRewardPurchasesFallback(options)
  }
}

// Fallback function for when the view doesn't exist
async function getAllRewardPurchasesFallback(options?: {
  limit?: number
  offset?: number
  userId?: string
  rewardId?: string
}) {
  const supabase = await createServerClient()

  try {
    // Use direct join query instead of view, but without addresses join
    let query = supabase
      .from("reward_purchases")
      .select(`
        *,
        profiles!reward_purchases_user_id_fkey (
          full_name,
          email,
          avatar_url,
          phone_code,
          phone_number,
          avc_id
        ),
        rewards!reward_purchases_reward_id_fkey (
          title,
          description,
          category
        ),
        transactions!reward_purchases_transaction_id_fkey (
          status
        )
      `, { count: "exact" })

    // Apply filters
    if (options?.userId) {
      query = query.eq("user_id", options.userId)
    }

    if (options?.rewardId) {
      query = query.eq("reward_id", options.rewardId)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    // Order by purchase date
    query = query.order("purchased_at", { ascending: false })

    const { data, error, count } = await query

    if (error) {
      console.error("Error in fallback query:", error)
      return {
        purchases: [],
        count: 0,
      }
    }

    // Transform the data to match the view structure, now including address info
    const transformedData = (data || []).map((purchase: any) => {
      const profile = purchase.profiles || {}
      
      // Construct phone number
      const phone = profile.phone_code && profile.phone_number 
        ? `${profile.phone_code}${profile.phone_number}` 
        : null

      return {
        id: purchase.id,
        user_id: purchase.user_id,
        user_name: profile.full_name || "Unknown User",
        user_email: profile.email || "",
        user_avatar_url: profile.avatar_url || null,
        user_phone: phone,
        user_avc_id: profile.avc_id,
        user_address: 'No address provided', // Will be fetched separately if needed
        user_address_details: {},
        reward_id: purchase.reward_id,
        reward_title: purchase.rewards?.title || "Unknown Reward",
        reward_description: purchase.rewards?.description || "",
        reward_category: purchase.rewards?.category || "",
        quantity: purchase.quantity,
        points_spent: purchase.points_spent,
        purchased_at: purchase.purchased_at,
        transaction_id: purchase.transaction_id,
        transaction_status: purchase.transactions?.status || "pending",
        purchase_status: purchase.status || "pending"
      }
    })

    return {
      purchases: transformedData,
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getAllRewardPurchasesFallback:", error)
    return {
      purchases: [],
      count: 0,
    }
  }
}
