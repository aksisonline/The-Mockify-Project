// Utility functions for fetching events data from the API

export interface Event {
  id: string
  title: string
  description: string
  content: string
  image_url: string
  start_date: string
  end_date: string
  location: string
  category: string
  registration_url: string
  is_featured: boolean
}

export async function fetchEvents(category?: string, limit?: number): Promise<Event[]> {
  let url = "/api/events"
  const params = []
  if (category) params.push(`category=${encodeURIComponent(category)}`)
  if (limit) params.push(`limit=${limit}`)
  if (params.length > 0) url += `?${params.join("&")}`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    try {
      const errorJson = JSON.parse(errorText)
      throw new Error(errorJson.error || errorJson.details || `HTTP ${response.status}`)
    } catch {
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }
  }

  const data = await response.json()
  if (!Array.isArray(data)) {
    throw new Error("Invalid data format received")
  }
  return data
}

export async function fetchEventById(id: string): Promise<Event> {
  const response = await fetch(`/api/events/${id}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    const contentType = response.headers.get("content-type")
    const errorText = await response.text()
    if (contentType && contentType.includes("application/json")) {
      try {
        const errorJson = JSON.parse(errorText)
        throw new Error(errorJson.error || errorJson.details || `HTTP ${response.status}`)
      } catch {
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } else {
      // It's probably an HTML error page
      throw new Error(`HTTP ${response.status}: ${errorText.slice(0, 200)}...`)
    }
  }

  const data = await response.json()
  // Optionally validate shape here
  return data
} 