import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { 
  getUserPointsByCategory, 
  getAllCategoriesWithUserPoints,
  getPointsCategories 
} from "@/lib/points-category-service"
import type { UserPointsByCategory, PointsCategory } from "@/types/supabase"

// GET /api/points/categories - Get user points by category or all categories
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const includeAll = searchParams.get('includeAll') === 'true'

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }    let pointsByCategory: UserPointsByCategory[]
    
    if (includeAll) {
      // Get all categories with user points (including categories with 0 points)
      pointsByCategory = await getAllCategoriesWithUserPoints(user.id)
    } else {
      // Get only categories where user has points or transactions
      pointsByCategory = await getUserPointsByCategory(user.id)
    }

    // Also get the list of all available categories
    const allCategories: PointsCategory[] = await getPointsCategories()

    return NextResponse.json({ 
      pointsByCategory,
      allCategories,
      userId: user.id
    })
  } catch (error) {
    console.error("Points categories API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
