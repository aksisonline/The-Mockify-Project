import { createBrowserClient } from "./supabase/client"
import { createServerClient } from "./supabase/server"
import { createTransaction } from "./transaction-service"
import { spendCategoryPoints } from "./points-category-service"
import type { ToolPurchase } from "@/types/supabase"
import type { ToolMetadata } from "./tools"

// Get all tools purchased by the current user
export async function getUserPurchasedTools(): Promise<ToolPurchase[]> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("tool_purchases")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "completed")

  if (error) {
    console.error("Error fetching purchased tools:", error)
    throw error
  }

  return data || []
}

// Check if a specific tool has been purchased by the current user
export async function hasUserPurchasedTool(toolId: string): Promise<boolean> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data, error } = await supabase
    .from("tool_purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("tool_id", toolId)
    .eq("status", "completed")
    .maybeSingle()

  if (error) {
    console.error("Error checking tool purchase:", error)
    throw error
  }

  return !!data
}

// Purchase a tool using points
export async function purchaseTool(tool: ToolMetadata): Promise<boolean> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Check if the tool is already purchased
  const alreadyPurchased = await hasUserPurchasedTool(tool.id)
  if (alreadyPurchased) {
    return true // Tool already purchased, no need to purchase again
  }

  // Check if the tool requires points
  if (!tool.pointsRequired || tool.pointsRequired <= 0) {
    throw new Error("This tool doesn't require points to unlock")
  }

  try {
    // Create a transaction for the tool purchase (handles points deduction and transaction creation)
    const transactionResult = await createTransaction({
      transactionType: "points",
      userId: user.id,
      amount: tool.pointsRequired,
      type: "spend",
      reason: `Purchased tool: ${tool.name}`,
      categoryName: "tools",
      metadata: {
        toolId: tool.id,
        toolName: tool.name,
        isPremium: tool.isPremium || false,
      },
    })

    if (!transactionResult.success || !transactionResult.transaction) {
      throw new Error(transactionResult.error || "Failed to create transaction")
    }

    const transaction = transactionResult.transaction

    // Get current points
    const { data: pointsData, error: pointsError } = await supabase
      .from("points")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (pointsError && pointsError.code !== "PGRST116") throw pointsError

    // No need to update points here, handled by createTransaction

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

    // Mark transaction as completed (already handled by createTransaction)

    return true
  } catch (error) {
    console.error("Error purchasing tool:", error)
    throw error
  }
}

// Get purchase history for the current user
export async function getUserPurchaseHistory(
  limit = 10,
  offset = 0,
): Promise<{
  purchases: ToolPurchase[]
  count: number
}> {
  const supabase = createBrowserClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { purchases: [], count: 0 }

  const { data, error, count } = await supabase
    .from("tool_purchases")
    .select("*", { count: "exact" })
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching purchase history:", error)
    throw error
  }

  return {
    purchases: data || [],
    count: count || 0,
  }
}

// Admin function to get all tool purchases
export async function getAllToolPurchases(
  adminKey: string,
  options?: {
    limit?: number
    offset?: number
    userId?: string
    toolId?: string
  },
): Promise<{
  purchases: ToolPurchase[]
  count: number
}> {
  // Verify admin key
  if (adminKey !== process.env.ADMIN_API_KEY) {
    throw new Error("Unauthorized")
  }

  const supabase = await createServerClient()

  let query = supabase
    .from("tool_purchases")
    .select("*", { count: "exact" })
    .eq("status", "completed")
    .order("purchased_at", { ascending: false })

  // Apply filters
  if (options?.userId) {
    query = query.eq("user_id", options.userId)
  }

  if (options?.toolId) {
    query = query.eq("tool_id", options.toolId)
  }

  // Apply pagination
  if (options?.limit) {
    const offset = options.offset || 0
    query = query.range(offset, offset + options.limit - 1)
  }

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching all tool purchases:", error)
    throw error
  }

  return {
    purchases: data || [],
    count: count || 0,
  }
}
