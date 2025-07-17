import { NextResponse } from "next/server"
import { getRewards } from "@/lib/rewards-service"
import { getUserRewardPurchases } from "@/lib/rewards-service"
import { getUserPoints } from "@/lib/points-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as "merchandise" | "digital" | "experiences" | null
    const featured = searchParams.get("featured") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    // Check if user is authenticated
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get all rewards (public data)
    const options = {
      category: category || undefined,
      featured: featured || undefined,
      limit,
      offset,
    }

    const { rewards, count } = await getRewards(options)

    // Get featured rewards
    const { rewards: featuredRewards } = await getRewards({ featured: true, limit: 5 })

    // Initialize response data
    const responseData: any = {
      rewards,
      featuredRewards,
      count,
      userPoints: 0,
      purchasedRewards: [],
      success: true,
    }

    // If user is authenticated, get additional data
    if (user) {
      try {
        // Get user points
        const points = await getUserPoints(user.id)
        responseData.userPoints = points?.total_points || 0

        // Get user's purchased rewards
        const purchases = await getUserRewardPurchases(user.id)
        responseData.purchasedRewards = purchases || []
      } catch (error) {
        console.error("Error fetching user-specific data:", error)
        // Don't fail the entire request if user data fails
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error fetching rewards dashboard data:", error)
    return NextResponse.json({ error: "Failed to fetch rewards data" }, { status: 500 })
  }
} 