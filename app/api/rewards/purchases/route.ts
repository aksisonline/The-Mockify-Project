import { NextResponse } from "next/server"
import { getUserRewardPurchases, getAllRewardPurchases } from "@/lib/rewards-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    // Check if user is authenticated
    const supabase = await createServerClient()
    const { data: { user }, error: sessionError } = await supabase.auth.getUser()

    if (sessionError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.is_admin || false
    // console.log('User is admin:', isAdmin, 'User ID:', user.id)

    try {
      if (isAdmin) {
        // For admin users, get all purchases
        // console.log('Fetching all reward purchases for admin...')
        const { purchases } = await getAllRewardPurchases()
        // console.log('Admin purchases result:', { count: purchases?.length || 0, sample: purchases?.[0] })
        return NextResponse.json({
          purchases: purchases || [],
        })
      } else {
        // For regular users, get only their purchases
        // console.log('Fetching user reward purchases for user:', user.id)
        const purchases = await getUserRewardPurchases(user.id)
        // console.log('User purchases result:', { count: purchases?.length || 0, sample: purchases?.[0] })
        return NextResponse.json({
          purchases: purchases || [],
        })
      }
    } catch (error) {
      console.error("Error in reward purchases query:", error)
      // Return empty array instead of error for new users with no purchases
      return NextResponse.json({
        purchases: [],
      })
    }
  } catch (error) {
    console.error("Error fetching reward purchases:", error)
    return NextResponse.json({ error: "Failed to fetch reward purchases" }, { status: 500 })
  }
}
