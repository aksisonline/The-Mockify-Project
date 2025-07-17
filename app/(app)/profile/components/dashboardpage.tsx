import type { Metadata } from "next"
import { ProfileCompletionCard } from "@/components/profile/profile-completion-card"
import { PointsLeaderboard } from "@/components/points/leaderboard"
import UnifiedJobManagementCard from "./UnifiedJobManagementCard"
import { useDirectory } from "@/hooks/use-directory"
import EkartOrdersManagementCard from "./EkartOrdersManagementCard"
import PostedProductsCard from "./PostedProductsCard"

export default function DashboardPage() {
  const { profiles, loading } = useDirectory(undefined, undefined, 1, 5)
  const leaderboardProfiles = profiles.slice(0, 5)

  return (
    <div className="">
      <h1 className="text-2xl font-bold mb-6 pt-6">Points & Transactions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <ProfileCompletionCard />
          </div>
        </div>

        <div>
          <PointsLeaderboard profiles={leaderboardProfiles} isLoading={loading} />
        </div>
      </div>

      {/* Unified Job Management Section */}
      <div className="mt-10">
        <UnifiedJobManagementCard />
      </div>

      {/* Ekart Orders Management Section */}
      <div className="mt-10">
        <EkartOrdersManagementCard />
      </div>

      {/* Posted Products Management Section */}
      <div className="mt-10">
        <PostedProductsCard />
      </div>

    </div>
  )
}
