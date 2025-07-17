"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import type { Transaction } from "@/types/supabase"
import {
  createTransaction,
  getUserTransactions,
  updateRealTransactionStatus,
  type TransactionType,
  type RealTransactionStatus,
} from "@/lib/transaction-service-client"

// Define types for client-side use
type TransactionType = "points" | "real"
type RealTransactionStatus = "pending" | "completed" | "failed" | "cancelled"

export function useTransactions() {
  const { user, isLoading: authLoading } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // Fetch transactions
  const fetchTransactions = async (
    page = 1,
    limit = 10,
    transactionType?: TransactionType,
    type?: "earn" | "spend",
    status?: string,
    fetchAll?: boolean,
  ) => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const offset = (page - 1) * limit

      const { transactions, count } = await getUserTransactions({
        limit: fetchAll ? undefined : limit,
        offset: fetchAll ? undefined : offset,
        transactionType,
        type,
        status: status as any,
      })

      setTransactions(transactions)
      setPagination({
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      })
    } catch (err) {
      console.error("Error fetching transactions:", err)
      setError("Failed to load transactions")
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a points transaction
  const createPointsTransaction = async (amount: number, type: "earn" | "spend", reason: string, metadata?: any, categoryName?: string) => {
    if (!user) return null

    try {
      const result = await createTransaction({
        transactionType: "points",
        amount,
        type,
        reason,
        categoryName: categoryName || "achievements",
        metadata,
      })

      if (!result.success) {
        throw new Error(result.error || "Transaction failed")
      }

      // Refresh transactions
      fetchTransactions(pagination.page, pagination.limit)

      toast({
        title: type === "earn" ? "Points Earned" : "Points Spent",
        description: `${amount} points ${type === "earn" ? "earned" : "spent"} for ${reason}`,
      })

      return result.transaction
    } catch (err: any) {
      console.error("Error creating points transaction:", err)

      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to process transaction",
        variant: "destructive",
      })

      return null
    }
  }

  // Create a real money transaction
  const createRealTransaction = async (
    amount: number,
    currency: string,
    paymentMethod: string,
    reason: string,
    metadata?: any,
    initialStatus?: RealTransactionStatus,
    referenceId?: string,
  ) => {
    if (!user) return null

    try {
      const result = await createTransaction({
        transactionType: "real",
        amount,
        type: "spend", // Real transactions are always spend
        reason,
        currency,
        paymentMethod,
        referenceId,
        initialStatus,
        metadata,
      })

      if (!result.success) {
        throw new Error(result.error || "Transaction failed")
      }

      // Refresh transactions
      fetchTransactions(pagination.page, pagination.limit)

      toast({
        title: "Transaction Initiated",
        description: `${amount} ${currency} transaction initiated for ${reason}`,
      })

      return result.transaction
    } catch (err: any) {
      console.error("Error creating real transaction:", err)

      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to process transaction",
        variant: "destructive",
      })

      return null
    }
  }

  // Update a real transaction status
  const updateTransactionStatus = async (transactionId: string, newStatus: RealTransactionStatus, note?: string) => {
    if (!user) return false

    try {
      const result = await updateRealTransactionStatus(transactionId, newStatus, note)

      if (!result.success) {
        throw new Error(result.error || "Status update failed")
      }

      // Refresh transactions
      fetchTransactions(pagination.page, pagination.limit)

      toast({
        title: "Status Updated",
        description: `Transaction status updated to ${newStatus}`,
      })

      return true
    } catch (err: any) {
      console.error("Error updating transaction status:", err)

      toast({
        title: "Status Update Failed",
        description: err.message || "Failed to update transaction status",
        variant: "destructive",
      })

      return false
    }
  }

  // Fetch transactions when user changes
  useEffect(() => {
    if (!authLoading && user) {
      fetchTransactions()
    } else if (!authLoading && !user) {
      setTransactions([])
      setIsLoading(false)
    }
  }, [user, authLoading])

  return {
    transactions,
    pagination,
    isLoading: isLoading || authLoading,
    error,
    fetchTransactions,
    createPointsTransaction,
    createRealTransaction,
    updateTransactionStatus,
  }
}
