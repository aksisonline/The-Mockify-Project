"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function useProfile() {
  const { user, session, isLoading: authLoading } = useAuth()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)
  const lastUserId = useRef<string | null>(null)

  // Cache for profile data
  const profileCache = useRef<Map<string, any>>(new Map())

  // Clear cache when user changes
  useEffect(() => {
    if (lastUserId.current && lastUserId.current !== user?.id) {
      // console.log("🔄 [useProfile] User changed, clearing cache")
      profileCache.current.clear()
      hasFetched.current = false
      setProfile(null)
      setError(null)
    }
    lastUserId.current = user?.id || null
  }, [user?.id])

  // Fetch profile data - memoized to prevent unnecessary re-renders
  const fetchProfile = useCallback(async (forceRefresh = false) => {
    if (!user || !session) {
      // console.log("🔄 [useProfile] No user or session, skipping fetch")
      setProfile(null)
      setIsLoading(false)
      return
    }

    // If we've already fetched for this user and not forcing refresh, return cached data
    if (!forceRefresh && profileCache.current.has(user.id)) {
      // console.log("✅ [useProfile] Using cached profile data")
      setProfile(profileCache.current.get(user.id))
      setIsLoading(false)
      return
    }

    // console.log("🔄 [useProfile] Fetching profile data")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/profile', { 
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized - please sign in again')
        }
        throw new Error(`Failed to fetch profile: ${response.status}`)
      }
      
      const data = await response.json()

      // Cache the fetched profile
      const profileData = { 
        ...(data.profile || {}), 
        pointsByCategory: data.pointsByCategory || [] 
      }
      profileCache.current.set(user.id, profileData)
      setProfile(profileData)
      hasFetched.current = true
      
      // console.log("✅ [useProfile] Profile data fetched successfully")
    } catch (err: any) {
      console.error("❌ [useProfile] Error fetching profile:", err)
      setError(err.message || "Failed to load profile data")
      
      // Show toast for user-facing errors
      if (err.message !== 'Unauthorized - please sign in again') {
        toast.error("Failed to load profile data. Please refresh the page.")
      }
    } finally {
      setIsLoading(false)
    }
  }, [user, session])

  // Fetch profile when auth state changes
  useEffect(() => {
    if (authLoading) {
      // console.log("🔄 [useProfile] Auth still loading, waiting...")
      return
    }
    
    if (!user || !session) {
      // console.log("🔄 [useProfile] No user or session, clearing profile")
      setProfile(null)
      setIsLoading(false)
      hasFetched.current = false
      return
    }
    
    // Only fetch if we haven't fetched before or if the user has changed
    if (!hasFetched.current || profileCache.current.get(user.id) === undefined) {
      // console.log("�� [useProfile] Fetching profile for user:", user.id)
      fetchProfile()
    } else {
      // console.log("✅ [useProfile] Using existing profile data")
      setProfile(profileCache.current.get(user.id))
      setIsLoading(false)
    }
  }, [user?.id, session?.access_token, authLoading, fetchProfile])

  // Clear profile when user signs out
  useEffect(() => {
    if (!user && !authLoading) {
      // console.log("🔄 [useProfile] User signed out, clearing profile")
      setProfile(null)
      setIsLoading(false)
      hasFetched.current = false
      profileCache.current.clear()
    }
  }, [user, authLoading])

  return {
    profile,
    isLoading: isLoading || authLoading,
    error,
    fetchProfile,
    clearCache: () => {
      profileCache.current.clear()
      hasFetched.current = false
    }
  }
}
