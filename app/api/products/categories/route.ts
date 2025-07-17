import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createServerClient()

    // Get categories from database
    const { data, error } = await supabase.from("product_categories").select("*").eq("is_active", true).order("name")

    if (error) {
      console.error("Error fetching product categories:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch product categories" }, { status: 500 })
    }

    // Make sure we have an "All" category
    let categories = data || []

    if (!categories.some((c) => c.name === "All")) {
      categories = [
        {
          id: "all",
          name: "All",
          icon: "ShoppingBag",
          description: "All products",
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...categories,
      ]
    }

    return NextResponse.json({
      success: true,
      categories,
    })
  } catch (error: any) {
    console.error("Error in GET /api/products/categories:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch product categories",
      },
      { status: 500 },
    )
  }
}
