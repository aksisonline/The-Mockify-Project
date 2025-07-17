import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { withAuth, UserRole } from "@/lib/auth-utils"
import DiscussionsAdminClient from "./DiscussionsAdminClient"

export const metadata: Metadata = {
  title: "Discussions Management | Admin Dashboard",
  description: "Manage discussions and moderate content",
}

export const dynamic = 'force-dynamic'

export default async function DiscussionsAdminPage() {
  try {
    // Check if user has admin access
    await withAuth(UserRole.Admin)()
  } catch (error) {
    // Redirect to login if not authorized
    redirect("/login")
  }

  return <DiscussionsAdminClient />
} 