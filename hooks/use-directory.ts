"use client"

import { useState, useEffect } from "react"
import type { PublicProfile } from "@/lib/directory-service"

export function useDirectory(search?: string, filter?: string, page = 1, pageSize = 10) {
  const [profiles, setProfiles] = useState<PublicProfile[]>([])
  const [totalProfiles, setTotalProfiles] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true)

        const queryParams = new URLSearchParams()
        if (search) queryParams.set("search", search)
        if (filter && filter !== "all") queryParams.set("filter", filter)
        queryParams.set("page", page.toString())
        queryParams.set("pageSize", pageSize.toString())

        const response = await fetch(`/api/directory?${queryParams.toString()}`)

        if (!response.ok) {
          throw new Error("Failed to fetch directory data")
        }

        const data = await response.json()
        setProfiles(data.profiles)
        setTotalProfiles(data.total)
        setTotalPages(data.totalPages)
        setError(null)
      } catch (err) {
        console.error("Error fetching directory:", err)
        setError("Failed to load directory. Please try again later.")
        setProfiles([])
        setTotalProfiles(0)
        setTotalPages(0)
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [search, filter, page, pageSize])

  return {
    profiles,
    totalProfiles,
    totalPages,
    loading,
    error,
    currentPage: page,
  }
}
