import { type NextRequest, NextResponse } from "next/server"
import { getReviews } from "@/lib/reviews-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const sortBy = (searchParams.get("sort_by") as "newest" | "oldest" | "rating" | "popular") || "newest"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    // First get the product details
    const supabase = await createServerClient()
    const { data: product, error: productError } = await supabase
      .from('review_products')
      .select(`
        *,
        brand:brands(*),
        category:review_categories(*)
      `)
      .eq('id', id)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get reviews for this product
    const reviews = await getReviews({
      productId: id,
      sortBy,
      limit,
      offset
    })

    return NextResponse.json({ product, reviews })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
} 