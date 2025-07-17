"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { getUserToolPurchases } from "@/lib/transaction-service-client"
import { createTransaction } from "@/lib/transaction-service-client"
import type { ToolPurchase } from "@/types/supabase"
import { getCached, setCached } from "@/utils/userCache"
import { fetchUserPurchasedToolsFromDB } from "@/lib/job-service-client"

export function useToolPurchases() {
  const { user, isLoading: authLoading, session } = useAuth()
  const userId = user?.id
  const [purchasedTools, setPurchasedTools] = useState<ToolPurchase[]>([])
  const [purchasedToolIds, setPurchasedToolIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch purchased tools
  const fetchPurchasedTools = useCallback(async () => {
    if (!userId) return
    setIsLoading(true)
    try {
      const purchases = await getUserToolPurchases(userId)
      setPurchasedTools(purchases)
      setPurchasedToolIds(purchases.filter((purchase) => purchase.tool_id).map((purchase) => purchase.tool_id as string))
    } catch (error) {
      console.error("Error fetching purchased tools:", error)
      toast({
        title: "Error",
        description: "Failed to load your purchased tools",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  // Check if a tool is purchased
  const isToolPurchased = useCallback(
    (toolId: string): boolean => {
      return purchasedToolIds.includes(toolId)
    },
    [purchasedToolIds],
  )

  // Buy a tool
  const buyTool = async (tool: any) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to purchase tools",
        variant: "destructive",
      })
      return false
    }

    if (isToolPurchased(tool.id)) {
      toast({
        title: "Already Purchased",
        description: "You already own this tool",
      })
      return true
    }

    try {
      // Hardcode the 'tools' and 'profile' category UUIDs from schema.sql
      const TOOLS_CATEGORY_ID = '6ee40c3d-2b61-4956-9f04-c9f33a716464';
      const PROFILE_CATEGORY_ID = '808dd817-033c-45ad-b959-c83dd28fc884';
      // Use 'profile' category for business card, otherwise 'tools'
      const isBusinessCard = tool.id === 'business_card';
      const categoryId = isBusinessCard ? PROFILE_CATEGORY_ID : TOOLS_CATEGORY_ID;
      const result = await createTransaction({
        transactionType: "points",
        amount: tool.pointsRequired || 0,
        type: "spend",
        reason: `Purchased tool: ${tool.name}`,
        metadata: {
          toolId: tool.id,
          toolName: tool.name,
          isPremium: tool.isPremium || false,
        },
        categoryId,
      })

      if (!result.success) {
        if (result.errorCode === "INSUFFICIENT_POINTS") {
          toast({
            title: "Insufficient Points",
            description: `You need more points to purchase this tool`,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Purchase Failed",
            description: result.error || "Failed to purchase tool",
            variant: "destructive",
          })
        }
        return false
      }

      // Refresh purchased tools
      await fetchPurchasedTools()

      toast({
        title: "Tool Purchased",
        description: `You have successfully purchased ${tool.name}`,
      })

      return true
    } catch (error) {
      toast({
        title: "Purchase Failed",
        description: "An error occurred while purchasing the tool",
        variant: "destructive",
      })
      return false
    }
  }

  // Fetch purchased tools when userId is available and changes
  useEffect(() => {
    if (userId) {
      fetchPurchasedTools()
    }
  }, [userId, fetchPurchasedTools])

  return {
    purchasedTools,
    purchasedToolIds,
    isLoading: isLoading || authLoading,
    isToolPurchased,
    buyTool,
    refreshPurchases: fetchPurchasedTools,
  }
}
