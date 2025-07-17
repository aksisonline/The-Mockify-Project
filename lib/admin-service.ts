// Admin service for managing points and transactions

import { createServiceRoleClient } from "./supabase/server"
import { toast } from "@/hooks/use-toast"
import { createTransaction } from "./transaction-service"
import type { Profile } from "@/types/supabase"
import type { PointsTransaction } from "./points-service"
import type { Database } from "@/types/supabase"

// Admin security
const ADMIN_SECRET = process.env.ADMIN_API_KEY || "default-admin-key"

// Types for admin functionality
export interface UserPointsData {
  userId: string
  displayName: string
  email?: string
  avatarUrl?: string
  points: number
  totalEarned: number
  totalSpent: number
  lastTransaction: string
}

export interface TransactionStats {
  totalTransactions: number
  totalPointsEarned: number
  totalPointsSpent: number
  activeUsers: number
  averagePointsPerUser: number
}

// USERS
export async function fetchAllUsers() {
  return await getCompleteUserData()
}

// REWARDS
export async function fetchAllRewards() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function fetchRewardPurchases() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from("reward_purchases")
    .select("*, profiles: user_id(*), rewards: reward_id(*)")
    .order("purchased_at", { ascending: false })
  if (error) throw error
  return data
}

// TRAINING
export async function fetchAllTrainingPrograms() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from("training_programs")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function fetchAllTrainingEnrollments() {
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
  
  const { data, error } = await supabase
    .from("training_enrollments")
    .select("*, program: program_id(*)")
    .order("enrolled_at", { ascending: false })
  if (error) throw error
  return data
}

// TRAINING PROGRAMS
export async function addTrainingProgram(program: Partial<Database["public"]["Tables"]["training_programs"]["Insert"]>) {
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
  
  const { data, error } = await supabase
    .from("training_programs")
    .insert({
      ...program,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTrainingProgram(id: string) {
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
  
  const { error } = await supabase
    .from("training_programs")
    .delete()
    .eq("id", id)
  if (error) throw error
  return true
}

// REWARDS
export async function addReward(reward: Partial<Database["public"]["Tables"]["rewards"]["Insert"]>) {
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
  
  const { data, error } = await supabase
    .from("rewards")
    .insert({
      ...reward,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

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
  
  const { error } = await supabase
    .from("rewards")
    .delete()
    .eq("id", id)
  if (error) throw error
  return true
}

// DASHBOARD STATS
export async function fetchDashboardStats() {
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
  
  // Users
  const { count: userCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
  // Rewards
  const { count: rewardCount } = await supabase
    .from("rewards")
    .select("id", { count: "exact", head: true })
  // Training
  const { count: trainingCount } = await supabase
    .from("training_enrollments")
    .select("id", { count: "exact", head: true })
  // Points spent
  const { data: pointsSpentRows } = await supabase
    .from("transactions")
    .select("amount, type")
    .eq("type", "spend")
  const pointsSpent = pointsSpentRows?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0
  return {
    userCount: userCount || 0,
    rewardCount: rewardCount || 0,
    trainingCount: trainingCount || 0,
    pointsSpent,
  }
}

// Get all users with their points data
export async function getAllUsers(): Promise<UserPointsData[]> {
  try {
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
    
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, avatar_url, points, total_earned, total_spent, last_transaction")

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    return data.map((user) => ({
      userId: user.id,
      displayName: user.display_name,
      email: user.email,
      avatarUrl: user.avatar_url,
      points: user.points,
      totalEarned: user.total_earned,
      totalSpent: user.total_spent,
      lastTransaction: user.last_transaction,
    }))
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}

// Utility function to get avatar URL with proper fallback logic
export function getAvatarUrl(user: any, publicProfileData?: any): string | null {
  // 1. First priority: public_profiles avatar_url (from public profiles view)
  if (publicProfileData?.avatar_url) {
    return publicProfileData.avatar_url
  }
  
  // 2. Second priority: Uploaded avatar from profiles table
  if (user.avatar_url) {
    return user.avatar_url
  }
  
  // 3. Last resort: Return null to trigger letters fallback
  return null
}

// Get complete user data for admin users page
export async function getCompleteUserData(search?: string) {
  try {
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
    
    // Build query to get all users with complete data
    let query = supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        avatar_url,
        phone_code,
        phone_number,
        dob,
        gender,
        is_admin,
        is_public,
        avc_id,
        has_business_card,
        last_login,
        created_at,
        updated_at
      `)

    // Apply search filter if provided
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,avc_id.ilike.%${search}%`)
    }

    // Apply ordering
    const { data: users, error } = await query
      .order('created_at', { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return []
    }

    // If we have users, fetch public profile data for public users only
    let enhancedUsers = users || []
    
    if (users && users.length > 0) {
      // Only fetch public profile data for users who are public
      const publicUserIds = users.filter(user => user.is_public).map(user => user.id)
      
      try {
        let publicProfilesMap: Record<string, any> = {}
        
        if (publicUserIds.length > 0) {
          // Fetch public profile data directly from the public_profiles view
          const { data: publicProfiles, error: publicError } = await supabase
            .from("public_profiles")
            .select("*")
            .in("id", publicUserIds)

          if (publicError) {
            console.error('Error fetching public profiles:', publicError)
          } else if (publicProfiles) {
            // Create a map of public profile data
            publicProfilesMap = publicProfiles.reduce((acc, profile) => {
              acc[profile.id] = profile
              return acc
            }, {} as Record<string, any>)
          }
        }

        // Enhance users with public profile data and proper avatar fallback
        enhancedUsers = users.map(user => {
          const publicProfile = publicProfilesMap[user.id]
          
          return {
            ...user,
            // Add public profile data if available (only for public users)
            company: publicProfile?.company_name || null,
            job_title: publicProfile?.designation || null,
            location: publicProfile?.city || null,
            country: publicProfile?.country || null,
            total_points: publicProfile?.total_points || 0,
            certifications: publicProfile?.certifications || [],
            social_links: publicProfile?.social_links || {},
            // Use phone from public_profiles if available, otherwise construct from profiles
            phone: publicProfile?.phone || 
                   (user.phone_code && user.phone_number ? `${user.phone_code}${user.phone_number}` : null),
            // Use proper avatar fallback logic - public profiles first priority
            avatar_url: getAvatarUrl(user, publicProfile)
          }
        })
      } catch (error) {
        console.error('Error fetching public profile data:', error)
        // If public profile fetch fails, still return users with basic avatar logic
        enhancedUsers = users.map(user => ({
          ...user,
          avatar_url: getAvatarUrl(user, null)
        }))
      }
    }

    return enhancedUsers
  } catch (error) {
    console.error("Error fetching complete user data:", error)
    return []
  }
}

// Get user details by ID
export async function getUserById(userId: string): Promise<UserPointsData | null> {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, email, avatar_url, points, total_earned, total_spent, last_transaction, full_name")
      .eq("id", userId)
      .single()

    if (error || !data) {
      console.error(`Error fetching user ${userId}:`, error)
      return null
    }

    return {
      userId: data.id,
      displayName: data.display_name || data.full_name || data.email || "Unknown User",
      email: data.email,
      avatarUrl: data.avatar_url,
      points: data.points,
      totalEarned: data.total_earned,
      totalSpent: data.total_spent,
      lastTransaction: data.last_transaction,
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error)
    return null
  }
}

// Get all transactions
export async function getAllTransactions(
  filters?: {
    userId?: string
    type?: "earn" | "spend"
    startDate?: string
    endDate?: string
    minAmount?: number
    maxAmount?: number
  },
  page = 1,
  limit = 20,
): Promise<{ transactions: PointsTransaction[]; total: number }> {
  try {
    const supabase = await createServiceRoleClient()
    
    // Build query
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("transaction_type", "points")
      .order("created_at", { ascending: false })

    // Apply filters
    if (filters) {
      if (filters.userId) {
        query = query.eq("user_id", filters.userId)
      }
      if (filters.type) {
        query = query.eq("type", filters.type)
      }
      if (filters.startDate) {
        query = query.gte("created_at", filters.startDate)
      }
      if (filters.endDate) {
        query = query.lte("created_at", filters.endDate)
      }
      if (filters.minAmount !== undefined) {
        query = query.gte("amount", filters.minAmount)
      }
      if (filters.maxAmount !== undefined) {
        query = query.lte("amount", filters.maxAmount)
      }
    }

    // Apply pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return { transactions: [], total: 0 }
    }

    // Convert from database format to PointsTransaction format
    const pointsTransactions = data?.map(tx => ({
      id: tx.id,
      userId: tx.user_id,
      amount: tx.amount,
      type: tx.type,
      reason: tx.reason,
      timestamp: tx.created_at,
      status: tx.status,
      verificationToken: tx.reference_id || `txn-verify-${Date.now()}`,
      metadata: tx.metadata,
    })) || []

    return {
      transactions: pointsTransactions,
      total: count || 0,
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return { transactions: [], total: 0 }
  }
}

// Get transaction by ID
export async function getTransactionById(id: string): Promise<PointsTransaction | null> {
  try {
    const supabase = await createServiceRoleClient()
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error(`Error fetching transaction ${id}:`, error)
      return null
    }

    // Convert from database Transaction to PointsTransaction format
    return {
      id: data.id,
      userId: data.user_id,
      amount: data.amount,
      type: data.type,
      reason: data.reason,
      timestamp: data.created_at,
      status: data.status,
      verificationToken: data.reference_id || `txn-verify-${Date.now()}`,
      metadata: data.metadata,
    }
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error)
    return null
  }
}

// Update a user's points (admin action)
export async function adminUpdateUserPoints(
  adminKey: string,
  userId: string,
  amount: number,
  reason: string,
  notes?: string,
): Promise<boolean> {
  try {
    const supabase = await createServiceRoleClient()

    // Verify admin key
    if (adminKey !== ADMIN_SECRET) {
      throw new Error("Unauthorized admin action")
    }

    // Fetch user
    const { data: user, error: userError } = await supabase
      .from("profiles")
      .select("id, points, total_earned, total_spent, display_name")
      .eq("id", userId)
      .single()

    if (userError || !user) {
      throw new Error("User not found")
    }

    const type = amount >= 0 ? "earn" : "spend"
    const absAmount = Math.abs(amount)

    if (type === "spend" && user.points < absAmount) {
      toast({
        title: "Error",
        description: `User only has ${user.points} points, cannot deduct ${absAmount}`,
        variant: "destructive",
      })
      return false
    }

    // Update user points
    const updatedPoints = type === "earn" ? user.points + absAmount : user.points - absAmount
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        points: updatedPoints,
        total_earned: type === "earn" ? user.total_earned + absAmount : user.total_earned,
        total_spent: type === "spend" ? user.total_spent + absAmount : user.total_spent,
        last_transaction: new Date().toISOString(),
      })
      .eq("id", userId)

    if (updateError) {
      throw new Error("Failed to update user points")
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        amount: absAmount,
        type,
        reason,
        status: "completed",
        created_at: new Date().toISOString(),
        metadata: { adminAction: true, notes },
      })

    if (transactionError) {
      console.error("Error creating transaction record:", transactionError)
      // Don't fail the operation if transaction logging fails
    }

    toast({
      title: "Success",
      description: `Points ${type === "earn" ? "added to" : "deducted from"} user ${user.display_name}`,
    })

    return true
  } catch (error) {
    console.error("Error updating user points:", error)
    return false
  }
}

// Get transaction statistics
export async function getTransactionStats(
  timeframe: "day" | "week" | "month" | "year" | "all" = "all",
): Promise<TransactionStats> {
  try {
    const supabase = await createServiceRoleClient()
    const now = new Date()
    let startDate: string | undefined

    if (timeframe !== "all") {
      const cutoff = new Date()

      switch (timeframe) {
        case "day":
          cutoff.setDate(now.getDate() - 1)
          break
        case "week":
          cutoff.setDate(now.getDate() - 7)
          break
        case "month":
          cutoff.setMonth(now.getMonth() - 1)
          break
        case "year":
          cutoff.setFullYear(now.getFullYear() - 1)
          break
      }

      startDate = cutoff.toISOString()
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .gte("created_at", startDate || "1970-01-01T00:00:00.000Z")

    if (error) {
      console.error("Error fetching transactions:", error)
      return {
        totalTransactions: 0,
        totalPointsEarned: 0,
        totalPointsSpent: 0,
        activeUsers: 0,
        averagePointsPerUser: 0,
      }
    }

    const totalTransactions = data.length
    const totalPointsEarned = data.filter((t) => t.type === "earn").reduce((sum, t) => sum + t.amount, 0)
    const totalPointsSpent = data.filter((t) => t.type === "spend").reduce((sum, t) => sum + t.amount, 0)

    const uniqueUsers = new Set(data.map((t) => t.user_id))
    const activeUsers = uniqueUsers.size
    const averagePointsPerUser = activeUsers > 0 ? Math.round((totalPointsEarned - totalPointsSpent) / activeUsers) : 0

    return {
      totalTransactions,
      totalPointsEarned,
      totalPointsSpent,
      activeUsers,
      averagePointsPerUser,
    }
  } catch (error) {
    console.error("Error calculating transaction stats:", error)
    return {
      totalTransactions: 0,
      totalPointsEarned: 0,
      totalPointsSpent: 0,
      activeUsers: 0,
      averagePointsPerUser: 0,
    }
  }
}

// Check if a user has admin rights
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createServiceRoleClient()
    
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single()
    
    if (error) {
      console.error("Error checking admin status:", error)
      return false
    }
    
    return profile?.is_admin || false
  } catch (error) {
    console.error("Error checking admin status:", error)
    return false
  }
}

// POINTS MANAGEMENT
export async function awardPointsToUser(userId: string, amount: number, reason: string = "Manual award") {
  const supabase = await createServiceRoleClient()
  // Create a transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: userId,
      amount,
      type: "earn",
      reason,
      status: "completed",
      created_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (transactionError) throw transactionError
  // Update points balance
  const { data: currentPoints } = await supabase.from("points").select("*").eq("user_id", userId).single()
  const { error: pointsError } = await supabase.from("points").upsert({
    user_id: userId,
    total_points: (currentPoints?.total_points || 0) + amount,
    total_earned: (currentPoints?.total_earned || 0) + amount,
    last_updated: new Date().toISOString(),
  })
  if (pointsError) throw pointsError
  return transaction
}

// EVENTS
export async function fetchAllEvents() {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
  if (error) throw error
  return data
}

export async function addEvent(event: Partial<Database["public"]["Tables"]["events"]["Insert"]>) {
  const supabase = await createServiceRoleClient()
  
  const { data, error } = await supabase
    .from("events")
    .insert({
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteEvent(id: string) {
  const supabase = await createServiceRoleClient()
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
  if (error) throw error
  return true
}

export async function fetchAllEventLogs() {
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
  
  const { data, error } = await supabase
    .from("event_logs")
    .select(`
      id,
      event_id,
      user_id,
      registered_at,
      profiles!event_logs_user_id_fkey (
        full_name,
        email,
        avatar_url
      ),
      events!event_logs_event_id_fkey (
        title,
        description
      )
    `)
    .order("registered_at", { ascending: false })
  if (error) throw error
  return data
}
