import { redirect } from "next/navigation"
import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { withAuth, UserRole } from "@/lib/auth-utils"
import TrainingAdminClient from "@/app/admin/training/TrainingAdminClient"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Training Management | Admin Dashboard",
  description: "Manage training programs and enrollments",
}

export default async function TrainingAdminPage() {
  try {
    // Check if user has admin access
    await withAuth(UserRole.Admin)()
  } catch (error) {
    // Redirect to login if not authorized
    redirect("/login")
  }

  return <TrainingAdminClient />
} 