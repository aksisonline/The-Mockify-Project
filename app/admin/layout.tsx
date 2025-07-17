import type React from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  Users,
  Gift,
  CreditCard,
  Settings,
  ArrowLeft,
  BookOpen,
  MonitorPlay,
  Megaphone,
  Calendar,
  Briefcase,
  Wrench,
  MessageSquare,
  Star,
} from "lucide-react"

import { withAuth, UserRole } from "@/lib/auth-utils"

export const metadata: Metadata = {
  title: "Admin Dashboard | Mockify",
  description: "Admin dashboard for Mockify platform",
}

export const dynamic = 'force-dynamic'

const sidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: BarChart3,
  },
  {
    href: "/admin/advertisements",
    label: "Advertisements",
    icon: Megaphone,
  },
  {
    href: "/admin/points",
    label: "Points Management",
    icon: CreditCard,
  },
  {
    href: "/admin/training",
    label: "Training",
    icon: BookOpen,
  },
  {
    href: "/admin/jobs",
    label: "Jobs",
    icon: Briefcase,
  },
  {
    href: "/admin/discussions",
    label: "Discussions",
    icon: MessageSquare,
  },
  {
    href: "/admin/reviews",
    label: "Reviews",
    icon: Star,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/rewards",
    label: "Rewards",
    icon: Gift,
  },
  {
    href: "/admin/events",
    label: "Events",
    icon: Calendar,
  },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Check if user has admin access
    await withAuth(UserRole.Admin)()
  } catch (error) {
    // Redirect to login if not authorized
    redirect("/login")
  }

  // Use a client component for pathname
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const pathname = typeof window !== "undefined" ? window.location.pathname : ""

  // Helper to check if a link is active
  const isActive = (href: string) =>
    pathname === href || (href !== "/admin" && pathname.startsWith(href))

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar - Fixed position */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 hidden md:block overflow-y-auto">
        <div className="p-6">
          <Link href="/">
            <div className="flex items-center">
              <img src="/mockify-logo.png" alt="Mockify Logo" className="h-10 w-auto mr-2" />
            </div>
          </Link>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            {sidebarLinks.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link href={href}>
                  <span
                    className={
                      `flex items-center p-3 rounded-lg ` +
                      (isActive(href)
                        ? "bg-gray-100 text-primary font-medium"
                        : "text-gray-700 hover:bg-gray-100")
                    }
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-4 py-6 mt-8">
          <Link href="/">
            <span className="flex items-center p-3 text-gray-700 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 mr-3" />
              Back to Website
            </span>
          </Link>
        </div>
      </aside>

      {/* Mobile Admin Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/">
            <div className="flex items-center">
              <img src="/logo-fixed.png" alt="Mockify Logo" className="h-8 w-auto mr-2" />
              <span className="font-bold text-lg">Admin</span>
            </div>
          </Link>

          <div className="flex items-center space-x-4">
            {sidebarLinks.map(({ href, icon: Icon }) => (
              <Link href={href} key={href}>
                <Icon
                  className={
                    "w-6 h-6 " +
                    (isActive(href)
                      ? "text-primary"
                      : "text-gray-700")
                  }
                />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content - Adjusted for fixed sidebar */}
      <main className="flex-1 md:ml-64 md:p-8 p-4 mt-16 md:mt-0">{children}</main>
    </div>
  )
}
