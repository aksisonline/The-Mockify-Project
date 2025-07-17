"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { fetchUserApplicationsFromDB } from "@/lib/job-service-client"
import { setCached } from "@/utils/userCache"

export default function UserCachePreloader() {
  const { user, session } = useAuth()

  useEffect(() => {
    if (!user || !user.id) return
    const fetchAndCacheUserApplications = async () => {
      const apps = await fetchUserApplicationsFromDB(user.id, session?.access_token)
      setCached("jobApplications", user.id, apps)
      // Notify app of cache update
      window.dispatchEvent(new Event("jobApplicationsUpdated"))
    }
    fetchAndCacheUserApplications()
    // Optionally, listen for login/logout and refetch
  }, [user?.id, session?.access_token])

  return null
} 