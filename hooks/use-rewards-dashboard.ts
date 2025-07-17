"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import type { Reward, RewardPurchaseDetail } from "@/types/supabase"

interface RewardsDashboardData {
  rewards: Reward[]
  featuredRewards: Reward[]
  userPoints: number
  purchasedRewards: RewardPurchaseDetail[]
  count: number
}

export function useRewardsDashboard() {
  const [data, setData] = useState<RewardsDashboardData>({
    rewards: [],
    featuredRewards: [],
    userPoints: 0,
    purchasedRewards: [],
    count: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const isMounted = useRef(true)
  const hasLoaded = useRef(false)

  // Fetch all rewards dashboard data
  const fetchDashboardData = useCallback(async () => {
    if (!isMounted.current) return
    
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/rewards/dashboard")
      if (!response.ok) {
        throw new Error("Failed to fetch rewards data")
      }

      const responseData = await response.json()
      
      if (isMounted.current) {
        setData(responseData)
      }
    } catch (err: any) {
      console.error("Error fetching rewards dashboard data:", err)
      if (isMounted.current) {
        setError(err.message || "An error occurred while fetching rewards data")
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false)
      }
    }
  }, [])

  // Purchase a reward
  const purchaseReward = useCallback(
    async (rewardId: string, quantity = 1) => {
      if (!isMounted.current || isPurchasing) return
      
      try {
        setIsPurchasing(true)

        const response = await fetch(`/api/rewards/${rewardId}/purchase`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity }),
          credentials: "include",
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to purchase reward")
        }

        const responseData = await response.json()

        // Refresh dashboard data
        await fetchDashboardData()

        toast("Purchase Successful! You have successfully purchased the reward.")

        return responseData
      } catch (err: any) {
        console.error("Error purchasing reward:", err)
        toast(`Purchase Failed: ${err.message || "An error occurred while purchasing the reward."}`)
        throw err
      } finally {
        if (isMounted.current) {
          setIsPurchasing(false)
        }
      }
    },
    [fetchDashboardData, isPurchasing],
  )

  // Refresh data
  const refreshData = useCallback(async () => {
    await fetchDashboardData()
  }, [fetchDashboardData])

  // Load data on mount
  useEffect(() => {
    if (hasLoaded.current) return
    
    const loadData = async () => {
      try {
        await fetchDashboardData()
        hasLoaded.current = true
      } catch (err) {
        console.error("Error loading rewards dashboard data:", err)
      }
    }

    loadData()

    return () => {
      isMounted.current = false
    }
  }, [fetchDashboardData])

  return {
    rewards: data.rewards,
    featuredRewards: data.featuredRewards,
    userPoints: data.userPoints,
    purchasedRewards: data.purchasedRewards,
    count: data.count,
    isLoading,
    error,
    isPurchasing,
    purchaseReward,
    refreshData,
  }
} 