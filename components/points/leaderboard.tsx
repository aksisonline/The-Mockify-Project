"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, User } from "lucide-react"
import type { PublicProfile } from "@/lib/directory-service"

export function PointsLeaderboard({ profiles, isLoading }: { profiles?: PublicProfile[]; isLoading?: boolean }) {
  if (isLoading || !profiles) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Points Leaderboard
        </CardTitle>
        <CardDescription>Top point earners in the community</CardDescription>
      </CardHeader>
      <CardContent>
        {profiles.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <h3 className="text-lg font-medium">No data yet</h3>
            <p className="text-sm text-gray-500 mt-1">Be the first to earn points and top the leaderboard</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map((profile, index) => (
              <div key={profile.id} className="flex items-center gap-3">
                {index === 0 ? (
                  <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                  </div>
                ) : index === 1 ? (
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <Medal className="h-4 w-4 text-gray-600" />
                  </div>
                ) : index === 2 ? (
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Medal className="h-4 w-4 text-amber-600" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                  </div>
                )}

                <Avatar className="h-8 w-8">
                  {profile.avatar_url ? (
                    <AvatarImage
                      src={profile.avatar_url || "/placeholder.svg"}
                      alt={profile.full_name || "User"}
                    />
                  ) : (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="flex-1 font-medium truncate">{profile.full_name || "Anonymous User"}</div>

                <div className="font-bold">{profile.total_points || 0}</div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
