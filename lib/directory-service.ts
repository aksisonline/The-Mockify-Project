import { createBrowserClient } from "@/lib/supabase/client"

export type PublicProfile = {
  id: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  company_name: string | null
  designation: string | null
  city: string | null
  country: string | null
  certifications: string[] | null
  certifications_count: number
  social_links: Record<string, string> | null
  total_points: number | null
  completion_percentage: number | null
  created_at: string
  updated_at: string
  phone: string | null
}

export async function getPublicProfiles(
  search?: string,
  filter?: string,
  page = 1,
  pageSize = 10,
): Promise<{ data: PublicProfile[]; count: number }> {
  const supabase = createBrowserClient()

  let query = supabase.from("public_profiles").select("*", { count: "exact" })

  // Apply search if provided
  if (search) {
    query = query.or(`full_name.ilike.%${search}%,designation.ilike.%${search}%,company_name.ilike.%${search}%`)
  }

  // Apply filter if provided
  if (filter && filter !== "all") {
    // Handle different filter types
    const roleFilters: Record<string, string[]> = {
      "media-eng": ["Media Engineer", "Media Systems Engineer"],
      "cad-eng": ["CAD Engineer", "CAD Specialist"],
      "project-eng": ["Media Project Manager", "Project Engineer"],
      "design-eng": ["Media Systems Designer", "Design Engineer"],
      "tech-support": ["Media Support Engineer", "Technical Support"],
      manager: ["Lead Media Engineer", "Manager", "Senior"],
      vip: ["VIP", "Director", "Head"],
    }

    const filterTerms = roleFilters[filter] || []
    if (filterTerms.length > 0) {
      const filterConditions = filterTerms.map((term) => `designation.ilike.%${term}%`).join(",")
      query = query.or(filterConditions)
    }
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, error, count } = await query.order("total_points", { ascending: false }).range(from, to)

  if (error) {
    console.error("Error fetching public profiles:", error)
    throw error
  }

  return {
    data: data as PublicProfile[],
    count: count || 0,
  }
}

export async function getPublicProfileById(id: string): Promise<PublicProfile | null> {
  try {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.from("public_profiles").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") {
        // No profile found or profile is not public
        return null
      }
      console.error("Error fetching public profile:", error)
      throw error
    }

    return data as PublicProfile
  } catch (error) {
    console.error("Unexpected error in getPublicProfileById:", error)
    // Return null instead of throwing to prevent the page from crashing
    return null
  }
}
