"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToolPurchases } from "@/hooks/use-tool-purchases"
import { useRouter } from "next/navigation"
import { Clock, ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { ToolPurchase } from "@/types/supabase"
import type { ToolMetadata } from "@/lib/tools"

interface PurchasedToolsListProps {
  tools: ToolMetadata[]
  limit?: number
  showViewAll?: boolean
}

export function PurchasedToolsList({ tools, limit = 5, showViewAll = true }: PurchasedToolsListProps) {
  const router = useRouter()
  const { purchasedTools, isLoading } = useToolPurchases()
  const [purchasedToolsWithDetails, setPurchasedToolsWithDetails] = useState<
    (ToolPurchase & { details?: ToolMetadata })[]
  >([])

  useEffect(() => {
    if (!isLoading && purchasedTools.length > 0 && tools.length > 0) {
      // Combine purchase data with tool details
      const toolsWithDetails = purchasedTools
        .map((purchase) => {
          const toolDetails = tools.find((tool) => tool.id === purchase.tool_id)
          return {
            ...purchase,
            details: toolDetails,
          }
        })
        .filter((item) => item.details) // Only include tools that have details

      setPurchasedToolsWithDetails(toolsWithDetails)
    }
  }, [purchasedTools, tools, isLoading])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchased Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (purchasedToolsWithDetails.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchased Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't purchased any tools yet.</p>
            <Button onClick={() => router.push("/tools")}>Browse Tools</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Purchased Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {purchasedToolsWithDetails.slice(0, limit).map((purchase) => (
            <div
              key={purchase.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-medium">{purchase.details?.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    Purchased {formatDistanceToNow(new Date(purchase.purchased_at), { addSuffix: true })}
                  </span>
                  {purchase.details?.isPremium && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 text-xs">
                      Premium
                    </Badge>
                  )}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => router.push(`/tools/${purchase.tool_id}`)}>
                Open Tool
                <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>

        {showViewAll && purchasedToolsWithDetails.length > limit && (
          <div className="mt-4 text-center">
            <Button variant="link" onClick={() => router.push("/profile/purchases")}>
              View All Purchases
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
