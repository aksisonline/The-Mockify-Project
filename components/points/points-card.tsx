"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Award, TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { PublicProfile } from "@/lib/directory-service"

export function PointsCard({ profile, isLoading }: { profile?: PublicProfile; isLoading?: boolean }) {
  if (isLoading || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Skeleton className="h-12 w-24" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="bg-[#2563eb] rounded-full flex items-center justify-center py-3 px-6 mb-2 w-fit mx-auto shadow-md">
        <CardTitle className="flex items-center gap-2 text-white text-lg font-semibold">
          <Award className="h-5 w-5 text-white" />
          Your Points
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="text-3xl font-bold">{profile.total_points || 0}</div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total Earned</span>
              <span className="font-medium flex items-center text-green-600">
                <TrendingUp className="h-4 w-4 mr-1" />
                {profile.total_points || 0}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-sm text-gray-500">Total Spent</span>
              <span className="font-medium flex items-center text-amber-600">
                <TrendingDown className="h-4 w-4 mr-1" />
                0
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
