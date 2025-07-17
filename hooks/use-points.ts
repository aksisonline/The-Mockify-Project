"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

export function usePoints() {
  const { user, isLoading: authLoading } = useAuth()
  const [points, setPoints] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  })

  // Fetch points data - memoized to prevent unnecessary re-renders
  const fetchPoints = useCallback(async (includeTransactions = true, page = 1, limit = 10, type?: "earn" | "spend") => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        transactions: includeTransactions.toString(),
        page: page.toString(),
        limit: limit.toString(),
      })

      if (type) {
        queryParams.append("type", type)
      }

      const response = await fetch(`/api/points?${queryParams.toString()}`, {
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error("Failed to fetch points")
      }

      const data = await response.json()
      setPoints(data.points)

      if (includeTransactions) {
        setTransactions(data.transactions || [])
        setPagination(
          data.pagination || {
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        )
      }
    } catch (err) {
      console.error("Error fetching points:", err)
      setError("Failed to load points data")
      toast({
        title: "Error",
        description: "Failed to load points data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Create a transaction
  const createTransaction = useCallback(async (type: "earn" | "spend", amount: number, reason: string, metadata?: any) => {
    if (!user) return null

    try {
      const response = await fetch("/api/points", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          amount,
          reason,
          metadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process transaction")
      }

      const data = await response.json()
      setPoints(data.points)

      // Refresh transactions
      fetchPoints()

      toast({
        title: type === "earn" ? "Points Earned" : "Points Spent",
        description: `${amount} points ${type === "earn" ? "earned" : "spent"} for ${reason}`,
      })

      return data.transaction
    } catch (err: any) {
      console.error("Error creating transaction:", err)

      toast({
        title: "Transaction Failed",
        description: err.message || "Failed to process transaction",
        variant: "destructive",
      })

      return null
    }
  }, [user, fetchPoints])

  // Fetch points when user changes - optimized to prevent unnecessary calls
  useEffect(() => {
    if (!authLoading && user) {
      fetchPoints()
    } else if (!authLoading && !user) {
      setPoints(null)
      setTransactions([])
      setIsLoading(false)
    }
  }, [user?.id, authLoading, fetchPoints])

  return {
    points,
    transactions,
    pagination,
    isLoading: isLoading || authLoading,
    error,
    fetchPoints,
    createTransaction,
  }
}
