"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient as createClientComponentClient } from "@/lib/supabase/client"

interface PreRenderProviderProps {
  children: React.ReactNode
}

export function PreRenderProvider({ children }: PreRenderProviderProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const preRenderRoutes = async () => {
      // Get pre-render headers from the response
      const preRenderRoutesHeader = document.querySelector('meta[name="x-pre-render-routes"]')?.getAttribute("content")
      const preFetchDataHeader = document.querySelector('meta[name="x-pre-fetch-data"]')?.getAttribute("content")

      if (!preRenderRoutesHeader || !preFetchDataHeader) return

      try {
        const routesToPreRender = JSON.parse(preRenderRoutesHeader) as string[]
        const dataToPreFetch = JSON.parse(preFetchDataHeader) as {
          profile: boolean
          notifications: boolean
          points: boolean
        }

        // Pre-fetch data if needed
        if (dataToPreFetch.profile) {
          await supabase.from("profiles").select("*").limit(1)
        }
        if (dataToPreFetch.notifications) {
          await supabase.from("notification_settings").select("*").limit(1)
        }
        if (dataToPreFetch.points) {
          await supabase.from("points").select("*").limit(1)
        }

        // Pre-render routes
        for (const route of routesToPreRender) {
          // Use router.prefetch for Next.js 13+ App Router
          router.prefetch(route)
        }
      } catch (error) {
        console.error("Error pre-rendering routes:", error)
      }
    }

    preRenderRoutes()
  }, [router, supabase])

  return <>{children}</>
} 