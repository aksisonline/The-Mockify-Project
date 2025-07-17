import { createBrowserClient } from "./supabase/client"
import { createTransaction } from "./transaction-service"
import { awardCategoryPoints } from "./points-category-service"
import type { Database } from "@/types/supabase"

export type Points = Database["public"]["Tables"]["points"]["Row"]
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"]

// Legacy interface for admin UI compatibility
export interface PointsTransaction {
  id: string
  userId: string
  amount: number
  type: "earn" | "spend"
  reason: string
  timestamp: string
  status: "pending" | "completed" | "failed"
  verificationToken?: string
  metadata?: any
}

// Cache for user points to prevent unnecessary API calls
const pointsCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 30000 // 30 seconds

// Get user points
export async function getUserPoints(userId?: string) {
  const supabase = createBrowserClient()

  // If userId is not provided, get the current user
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null
    userId = user.id
  }

  // Check cache first
  const cached = pointsCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }

  const { data, error } = await supabase.from("points").select("*").eq("user_id", userId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching points:", error)
    throw error
  }

  // If no points record exists yet, return default values
  const result = data || {
    user_id: userId,
    total_points: 0,
    total_earned: 0,
    total_spent: 0,
    last_updated: new Date().toISOString(),
  }

  // Cache the result
  pointsCache.set(userId, { data: result, timestamp: Date.now() })

  return result
}

// Clear points cache for a user (call this after points updates)
export function clearPointsCache(userId?: string) {
  if (userId) {
    pointsCache.delete(userId)
  } else {
    pointsCache.clear()
  }
}

// Update user points (wrapper for createTransaction for backward compatibility)
export async function updateUserPoints(
  amount: number,
  type: "earn" | "spend",
  reason: string,
  metadata?: any,
  categoryName?: string,
): Promise<boolean> {
  try {
    const result = await createTransaction({
      transactionType: "points",
      amount,
      type,
      reason,
      metadata,
      categoryName,
    })

    return result.success
  } catch (error) {
    console.error("Error updating user points:", error)
    return false
  }
}

// Award points to a user (admin only)
export async function awardPoints(userId: string, amount: number, reason: string, adminKey: string, metadata?: any) {
  // Verify admin key (in a real app, use a more secure method)
  if (adminKey !== process.env.ADMIN_API_KEY) {
    throw new Error("Unauthorized")
  }

  const result = await createTransaction({
    transactionType: "points",
    userId,
    amount,
    type: "earn",
    reason,
    categoryName: "achievements",
    metadata: { ...metadata, adminAwarded: true },
  })

  if (!result.success) {
    throw new Error(result.error || "Failed to award points")
  }

  return result.transaction
}

// Get points leaderboard
export async function getPointsLeaderboard(limit = 10) {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from("points")
    .select(`
      user_id,
      total_points,
      profiles (
        full_name,
        avatar_url
      )
    `)
    .order("total_points", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching leaderboard:", error)
    throw error
  }

  return data || []
}
