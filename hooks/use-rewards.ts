"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { toast } from "@/hooks/use-toast"
import type { Reward, RewardPurchaseDetail } from "@/types/supabase"

export function useRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [featuredRewards, setFeaturedRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchasedRewards, setPurchasedRewards] = useState<RewardPurchaseDetail[]>([])
  const [isPurchasing, setIsPurchasing] = useState(false)
  const isMounted = useRef(true)
  const hasLoaded = useRef(false)

  // Fetch rewards
  const fetchRewards = useCallback(
    async (options?: {
      category?: "merchandise" | "digital" | "experiences"
      featured?: boolean
    }) => {
      if (!isMounted.current) return []
      
      try {
        setIsLoading(true)
        setError(null)

        let url = "/api/rewards"
        const params = new URLSearchParams()

        if (options?.category) {
          params.append("category", options.category)
        }

        if (options?.featured) {
          params.append("featured", "true")
        }

        if (params.toString()) {
          url += `?${params.toString()}`
        }

        const response = await fetch(url)
        if (!response.ok) {
          throw new Error("Failed to fetch rewards")
        }

        const data = await response.json()
        return data.rewards || []
      } catch (err: any) {
        console.error("Error fetching rewards:", err)
        setError(err.message || "An error occurred while fetching rewards")
        return []
      } finally {
        if (isMounted.current) {
          setIsLoading(false)
        }
      }
    },
    [],
  )

  // Fetch all rewards
  const fetchAllRewards = useCallback(async () => {
    if (!isMounted.current) return
    const rewards = await fetchRewards()
    if (isMounted.current) {
      setRewards(rewards)
    }
  }, [fetchRewards])

  // Fetch featured rewards
  const fetchFeaturedRewards = useCallback(async () => {
    if (!isMounted.current) return
    const featured = await fetchRewards({ featured: true })
    if (isMounted.current) {
      setFeaturedRewards(featured)
    }
  }, [fetchRewards])

  // Fetch user's purchased rewards
  const fetchPurchasedRewards = useCallback(async () => {
    if (!isMounted.current) return
    
    try {
      const response = await fetch("/api/rewards/purchases")

      // If not authenticated, silently return empty array
      if (response.status === 401) {
        if (isMounted.current) {
          setPurchasedRewards([])
        }
        return
      }

      if (!response.ok) {
        throw new Error("Failed to fetch purchased rewards")
      }

      const data = await response.json()
      if (isMounted.current) {
        setPurchasedRewards(data.purchases || [])
      }
    } catch (err: any) {
      console.error("Error fetching purchased rewards:", err)
      // Don't set error state here to avoid disrupting the main UI
      // Just set empty array for purchased rewards
      if (isMounted.current) {
        setPurchasedRewards([])
      }
    }
  }, [])

  // Purchase a reward
  const purchaseReward = useCallback(
    async (rewardId: string, quantity = 1) => {
      if (!isMounted.current) return
      
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

        const data = await response.json()

        // Refresh rewards and purchased rewards
        await Promise.all([fetchAllRewards(), fetchFeaturedRewards(), fetchPurchasedRewards()])

        toast("Purchase Successful! You have successfully purchased the reward.")

        return data
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
    [fetchAllRewards, fetchFeaturedRewards, fetchPurchasedRewards],
  )

  // Load rewards on mount
  useEffect(() => {
    if (hasLoaded.current) return
    
    const loadData = async () => {
      try {
        // Load rewards first
        await fetchAllRewards()
        await fetchFeaturedRewards()

        // Then try to load purchased rewards, but don't block UI if it fails
        try {
          await fetchPurchasedRewards()
        } catch (err) {
          console.error("Error loading purchased rewards:", err)
          // Silently fail - user might not be logged in or have no purchases
        }
        
        hasLoaded.current = true
      } catch (err) {
        console.error("Error loading rewards data:", err)
      }
    }

    loadData()

    return () => {
      isMounted.current = false
    }
  }, [fetchAllRewards, fetchFeaturedRewards, fetchPurchasedRewards])

  return {
    rewards,
    featuredRewards,
    purchasedRewards,
    isLoading,
    error,
    isPurchasing,
    fetchRewards,
    fetchAllRewards,
    fetchFeaturedRewards,
    fetchPurchasedRewards,
    purchaseReward,
  }
}
