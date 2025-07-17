import { type NextRequest, NextResponse } from "next/server"
import { getProductsByBrand } from "@/lib/reviews-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const supabase = await createServerClient()

    // First get the brand details
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('*')
      .eq('id', id)
      .single()

    if (brandError || !brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 })
    }

    // Get products for this brand with review statistics
    const { data: products, error: productsError } = await supabase
      .from('review_products')
      .select(`
        *,
        category:review_categories(*)
      `)
      .eq('brand_id', id)
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1)

    if (productsError) {
      console.error('Error fetching products:', error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    // Calculate review statistics for each product
    const productsWithStats = await Promise.all(
      (products || []).map(async (product) => {
        // Get reviews for this product
        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id)

        if (reviewsError) {
          console.error('Error fetching reviews for product:', product.id, reviewsError)
          return {
            ...product,
            review_count: 0,
            average_rating: 0
          }
        }

        const reviewCount = reviews?.length || 0
        const averageRating = reviewCount > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount 
          : 0

        return {
          ...product,
          review_count: reviewCount,
          average_rating: Math.round(averageRating * 10) / 10
        }
      })
    )

    // Calculate brand statistics
    const { data: allBrandReviews, error: brandReviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .in('product_id', productsWithStats.map(p => p.id))

    let brandRating = 0
    let brandReviewCount = 0

    if (!brandReviewsError && allBrandReviews) {
      brandReviewCount = allBrandReviews.length
      brandRating = brandReviewCount > 0 
        ? allBrandReviews.reduce((sum, review) => sum + review.rating, 0) / brandReviewCount 
        : 0
    }

    // Update brand with calculated statistics
    const brandWithStats = {
      ...brand,
      rating: Math.round(brandRating * 10) / 10,
      review_count: brandReviewCount
    }

    return NextResponse.json({ 
      brand: brandWithStats, 
      products: productsWithStats 
    })
  } catch (error) {
    console.error("Error fetching brand:", error)
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 })
  }
} 