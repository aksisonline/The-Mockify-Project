import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET - Get public profiles for multiple user IDs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userIds = searchParams.get('userIds')

    if (!userIds) {
      return NextResponse.json({ error: "User IDs are required" }, { status: 400 })
    }

    const userIdsArray = userIds.split(',')

    // Fetch public profiles for the user IDs
    const { data: profiles, error } = await supabase
      .from("public_profiles")
      .select("*")
      .in("id", userIdsArray)

    if (error) {
      console.error("Error fetching public profiles:", error)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    // Convert array to object with user ID as key
    const profilesObject = (profiles || []).reduce((acc, profile) => {
      acc[profile.id] = profile
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({ 
      profiles: profilesObject,
      count: profiles?.length || 0
    })
  } catch (error) {
    console.error("Error in GET /api/profiles/public:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 