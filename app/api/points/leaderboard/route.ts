import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET /api/points/leaderboard - Get points leaderboard
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10)

    const supabase = createServerClient()
    // Query the view, group by user, sum net_points, join profiles
    const { data, error } = await supabase
      .from("user_points_by_category")
      .select("user_id, profiles:profiles!inner(full_name, avatar_url), total:net_points")
      .order("total", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Leaderboard API error:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }

    // Group by user and sum net_points
    const leaderboardMap = new Map()
    for (const row of data || []) {
      if (!leaderboardMap.has(row.user_id)) {
        leaderboardMap.set(row.user_id, {
          user_id: row.user_id,
          total_points: 0,
          profiles: row.profiles,
        })
      }
      leaderboardMap.get(row.user_id).total_points += row.total || 0
    }
    const leaderboard = Array.from(leaderboardMap.values())
      .sort((a, b) => b.total_points - a.total_points)
      .slice(0, limit)

    return NextResponse.json({ leaderboard })
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
