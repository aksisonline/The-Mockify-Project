import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { fetchDashboardStats, fetchAllUsers, fetchRewardPurchases, fetchAllTrainingEnrollments } from "@/lib/admin-service"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Admin Dashboard | Mockify",
  description: "Admin dashboard for Mockify platform",
}

export default async function AdminDashboardPage() {
  const stats = await fetchDashboardStats()
  const users = await fetchAllUsers()
  const purchases = await fetchRewardPurchases()
  // const enrollments = await fetchAllTrainingEnrollments()

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Total Users</div>
          <div className="text-3xl font-bold">{stats.userCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Total Rewards</div>
          <div className="text-3xl font-bold">{stats.rewardCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Training Enrollments</div>
          <div className="text-3xl font-bold">{stats.trainingCount}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-gray-500 text-sm">Points Spent</div>
          <div className="text-3xl font-bold">{stats.pointsSpent}</div>
        </div>
      </div>
      <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">Recent Users</h3>
          <ul className="bg-white rounded-lg shadow divide-y">
            {users.slice(0, 5).map((user: any) => (
              <li key={user.id} className="p-4">
                <div className="font-semibold">{user.full_name}</div>
                <div className="text-xs text-gray-500">{user.email}</div>
                <div className="text-xs text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleString() : ""}</div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">Recent Reward Purchases</h3>
          <ul className="bg-white rounded-lg shadow divide-y">
            {purchases.slice(0, 5).map((purchase: any) => (
              <li key={purchase.id} className="p-4">
                <div className="font-semibold">{purchase.profiles?.full_name || purchase.user_id}</div>
                <div className="text-xs text-gray-500">{purchase.rewards?.title || purchase.reward_id}</div>
                <div className="text-xs text-gray-400">{purchase.purchased_at ? new Date(purchase.purchased_at).toLocaleString() : ""}</div>
              </li>
            ))}
          </ul>
        </div>
        {/* <div>
          <h3 className="font-medium mb-2">Recent Enrollments</h3>
          <ul className="bg-white rounded-lg shadow divide-y">
            {enrollments.slice(0, 5).map((enrollment: any) => (
              <li key={enrollment.id} className="p-4">
                <div className="font-semibold">{enrollment.profiles?.full_name || enrollment.user_id}</div>
                <div className="text-xs text-gray-500">{enrollment.program?.title || enrollment.program_id}</div>
                <div className="text-xs text-gray-400">{enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleString() : ""}</div>
              </li>
            ))}
          </ul>
        </div> */}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Link href="/admin/reviews" className="block p-4 border rounded shadow hover:bg-muted transition">
          <div className="font-bold text-lg">Manage Reviews</div>
          <div className="text-muted-foreground text-sm">Add, edit, or delete product reviews and moderate comments.</div>
        </Link>
      </div>
    </div>
  )
}
