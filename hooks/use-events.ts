"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/lib/events-service"

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)

      // Fetch all events
      const eventsResponse = await fetch("/api/events")
      if (!eventsResponse.ok) throw new Error("Failed to fetch events")
      const eventsData = await eventsResponse.json()
      setEvents(eventsData)

      // Fetch featured events
      const featuredResponse = await fetch("/api/events?featured=true")
      if (!featuredResponse.ok) throw new Error("Failed to fetch featured events")
      const featuredData = await featuredResponse.json()
      setFeaturedEvents(featuredData)

      // Extract unique categories
      const uniqueCategories = [...new Set(eventsData.map((event: Event) => event.category))]
      setCategories(uniqueCategories)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return { events, featuredEvents, categories, loading, error, refetch: fetchEvents }
}
