import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { withAuth, UserRole } from "@/lib/auth-utils"
import JobsAdminClient from "./JobsAdminClient"

export const metadata: Metadata = {
  title: "Jobs Management | Admin Dashboard",
  description: "Manage job postings and applications",
}

export const dynamic = 'force-dynamic'

export default async function JobsAdminPage() {
  try {
    // Check if user has admin access
    await withAuth(UserRole.Admin)()
  } catch (error) {
    // Redirect to login if not authorized
    redirect("/login")
  }

  return <JobsAdminClient />
} 