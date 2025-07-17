import { createServerClient } from "./supabase/server"
import type { Transaction, TransactionStatusHistoryEntry, ToolPurchase } from "@/types/supabase"
import { getPointsCategoryByName } from "./points-category-service"
import { v4 as uuidv4 } from "uuid"

// Transaction types
export type TransactionType = "points" | "real"
export type TransactionStatus = "pending" | "completed" | "failed"
export type RealTransactionStatus =
  | "initiated"
  | "processing"
  | "pending"
  | "completed"
  | "failed"
  | "refunded"
  | "cancelled"

// Base transaction options
interface BaseTransactionOptions {
  userId?: string
  amount: number
  type: "earn" | "spend"
  reason: string
  metadata?: any
}

// Points transaction options
export interface PointsTransactionOptions extends BaseTransactionOptions {
  transactionType: "points"
  categoryId?: string
  categoryName?: string // Alternative to categoryId - will be resolved to ID
}

// Real transaction options
export interface RealTransactionOptions extends BaseTransactionOptions {
  transactionType: "real"
  currency: string
  paymentMethod: string
  referenceId?: string
  initialStatus?: RealTransactionStatus
  statusNote?: string
}

// Transaction result
export interface TransactionResult {
  success: boolean
  transaction?: Transaction
  error?: string
  errorCode?: string
}

/**
 * Create a new transaction
 */
export async function createTransaction(
  options: PointsTransactionOptions | RealTransactionOptions,
  accessToken?: string
): Promise<TransactionResult> {
  const supabase = await createServerClient()

  try {
    // Get user ID
    let userId = options.userId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          error: "User not authenticated",
          errorCode: "UNAUTHENTICATED",
        }
      }
      userId = user.id
    }

    // Common transaction data
    const transactionData: any = {
      user_id: userId,
      amount: options.amount,
      type: options.type,
      reason: options.reason,
      metadata: options.metadata || {},
      created_at: new Date().toISOString(),
      transaction_type: options.transactionType,
    }

    // Handle points transactions
    if (options.transactionType === "points") {
      const pointsOptions = options as PointsTransactionOptions
      
      // For points transactions, we start with pending status
      transactionData.status = "pending"

      // Resolve category if provided
      if (pointsOptions.categoryName) {
        const category = await getPointsCategoryByName(pointsOptions.categoryName)
        if (category) {
          transactionData.category_id = category.id
        } else {
          console.error(`Category not found: ${pointsOptions.categoryName}`)
        }
      } else if (pointsOptions.categoryId) {
        transactionData.category_id = pointsOptions.categoryId
      }

      // Check if user has enough points for spend transactions
      if (options.type === "spend") {
        const { data: pointsData } = await supabase.from("points").select("total_points").eq("user_id", userId).single()

        if (pointsData && pointsData.total_points < options.amount) {
          return {
            success: false,
            error: "Insufficient points",
            errorCode: "INSUFFICIENT_POINTS",
          }
        }
      }
    }
    // Handle real money transactions
    else if (options.transactionType === "real") {
      const realOptions = options as RealTransactionOptions

      // Add real transaction specific fields
      transactionData.currency = realOptions.currency
      transactionData.payment_method = realOptions.paymentMethod
      transactionData.reference_id = realOptions.referenceId || `txn-${uuidv4()}`

      // Initialize status history
      const initialStatus: RealTransactionStatus = realOptions.initialStatus || "initiated"
      transactionData.status = initialStatus
      transactionData.status_history = [
        {
          status: initialStatus,
          timestamp: new Date().toISOString(),
          note: realOptions.statusNote || `Transaction ${initialStatus}`,
        },
      ]
    }

    // Insert transaction
    const { data: transaction, error } = await supabase.from("transactions").insert(transactionData).select().single()

    if (error) {
      console.error("Error creating transaction:", error)
      return {
        success: false,
        error: error.message,
        errorCode: error.code,
      }
    }

    // For points transactions, process immediately
    if (options.transactionType === "points") {
      const result = await processPointsTransaction(transaction.id)
      return result
    }

    return {
      success: true,
      transaction,
    }
  } catch (error: any) {
    console.error("Error in createTransaction:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
      errorCode: "UNKNOWN_ERROR",
    }
  }
}

/**
 * Process a points transaction (update points balance)
 */
async function processPointsTransaction(transactionId: string): Promise<TransactionResult> {
  const supabase = await createServerClient()

  try {
    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("transaction_type", "points")
      .single()

    if (txError || !transaction) {
      console.error("Error fetching transaction:", txError)
      return {
        success: false,
        error: "Transaction not found",
        errorCode: "TRANSACTION_NOT_FOUND",
      }
    }

    // Get current points
    const { data: pointsData } = await supabase.from("points").select("*").eq("user_id", transaction.user_id).single()

    const currentPoints = pointsData || {
      user_id: transaction.user_id,
      total_points: 0,
      total_earned: 0,
      total_spent: 0,
      last_updated: new Date().toISOString(),
    }

    // Calculate new points
    const newTotalPoints =
      transaction.type === "earn"
        ? currentPoints.total_points + transaction.amount
        : currentPoints.total_points - transaction.amount

    const newTotalEarned =
      transaction.type === "earn" ? currentPoints.total_earned + transaction.amount : currentPoints.total_earned

    const newTotalSpent =
      transaction.type === "spend" ? currentPoints.total_spent + transaction.amount : currentPoints.total_spent

    // Update points balance
    const { error: pointsError } = await supabase.from("points").upsert({
      user_id: transaction.user_id,
      total_points: newTotalPoints,
      total_earned: newTotalEarned,
      total_spent: newTotalSpent,
      last_updated: new Date().toISOString(),
    })

    if (pointsError) {
      // Mark transaction as failed
      await supabase.from("transactions").update({ status: "failed" }).eq("id", transaction.id)

      return {
        success: false,
        error: "Failed to update points balance",
        errorCode: "POINTS_UPDATE_FAILED",
      }
    }

    // Clear points cache to ensure UI shows updated balance
    try {
      const { clearPointsCache } = await import("./points-service")
      clearPointsCache(transaction.user_id)
    } catch (cacheError) {
      console.warn("Failed to clear points cache:", cacheError)
      // Don't fail the transaction if cache clearing fails
    }

    // Clear profile cache to ensure profile data (including points) is refreshed
    try {
      const { invalidateUserCache } = await import("./profile-service")
      invalidateUserCache(transaction.user_id)
    } catch (cacheError) {
      console.warn("Failed to clear profile cache:", cacheError)
      // Don't fail the transaction if cache clearing fails
    }

    // Mark transaction as completed
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update({ status: "completed" })
      .eq("id", transaction.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating transaction status:", updateError)
      return {
        success: false,
        error: "Failed to update transaction status",
        errorCode: "STATUS_UPDATE_FAILED",
      }
    }

    return {
      success: true,
      transaction: updatedTransaction,
    }
  } catch (error: any) {
    console.error("Error in processPointsTransaction:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
      errorCode: "UNKNOWN_ERROR",
    }
  }
}

/**
 * Update a real transaction's status
 */
export async function updateRealTransactionStatus(
  transactionId: string,
  newStatus: RealTransactionStatus,
  note?: string,
): Promise<TransactionResult> {
  const supabase = await createServerClient()

  try {
    // Get transaction
    const { data: transaction, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("id", transactionId)
      .eq("transaction_type", "real")
      .single()

    if (txError || !transaction) {
      console.error("Error fetching transaction:", txError)
      return {
        success: false,
        error: "Transaction not found",
        errorCode: "TRANSACTION_NOT_FOUND",
      }
    }

    // Create new status history entry
    const statusEntry: TransactionStatusHistoryEntry = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      note: note || `Status changed to ${newStatus}`,
    }

    // Get current status history
    const currentHistory = transaction.status_history || []

    // Update transaction
    const { data: updatedTransaction, error: updateError } = await supabase
      .from("transactions")
      .update({
        status: newStatus,
        status_history: [...currentHistory, statusEntry],
      })
      .eq("id", transactionId)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating transaction status:", updateError)
      return {
        success: false,
        error: "Failed to update transaction status",
        errorCode: "STATUS_UPDATE_FAILED",
      }
    }

    return {
      success: true,
      transaction: updatedTransaction,
    }
  } catch (error: any) {
    console.error("Error updating real transaction status:", error)
    return {
      success: false,
      error: error.message || "Unknown error",
      errorCode: "UPDATE_ERROR",
    }
  }
}

/**
 * Get transaction by ID
 */
export async function getTransactionById(transactionId: string): Promise<Transaction | null> {
  const supabase = await createServerClient()

  try {
    const { data, error } = await supabase.from("transactions").select("*").eq("id", transactionId).single()

    if (error) {
      console.error("Error fetching transaction:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getTransactionById:", error)
    return null
  }
}

/**
 * Get user transactions
 */
export async function getUserTransactions(options?: {
  userId?: string
  transactionType?: TransactionType
  type?: "earn" | "spend"
  status?: TransactionStatus | RealTransactionStatus
  limit?: number
  offset?: number
}): Promise<{ transactions: Transaction[]; count: number }> {
  const supabase = await createServerClient()

  try {
    // Get user ID if not provided
    let userId = options?.userId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { transactions: [], count: 0 }
      }
      userId = user.id
    }

    // Build query
    let query = supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Apply filters
    if (options?.transactionType) {
      query = query.eq("transaction_type", options.transactionType)
    }

    if (options?.type) {
      query = query.eq("type", options.type)
    }

    if (options?.status) {
      query = query.eq("status", options.status)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset !== undefined && options?.limit) {
      query = query.range(options.offset, options.offset + options.limit - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching transactions:", error)
      return { transactions: [], count: 0 }
    }

    return {
      transactions: data || [],
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getUserTransactions:", error)
    return { transactions: [], count: 0 }
  }
}

/**
 * Get tool purchases for a user
 */
export async function getUserToolPurchases(userId?: string): Promise<ToolPurchase[]> {
  const supabase = await createServerClient()

  try {
    // Get user ID if not provided
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return []
      }
      userId = user.id
    }

    const { data, error } = await supabase
      .from("tool_purchases")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("purchased_at", { ascending: false })

    if (error) {
      console.error("Error fetching tool purchases:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserToolPurchases:", error)
    return []
  }
}

export async function getLatestUserTransactions(userId?: string, limit: number = 5) {
  const supabase = await createServerClient();
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    userId = user.id;
  }
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("Error fetching latest transactions:", error);
    return [];
  }
  return data || [];
}
