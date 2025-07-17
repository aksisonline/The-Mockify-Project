import { type NextRequest, NextResponse } from "next/server"
import { getReviews, createReview, getBrands, getTrendingBrands, getReviewCategories, getAllProducts } from "@/lib/reviews-service"
import { createServerClient } from "@/lib/supabase/server"
import { getUser } from '@/lib/auth'

// GET: List all reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || undefined

    switch (type) {
      case 'brands':
        const brandsData = await getBrands()
        return NextResponse.json(brandsData)

      case 'trending':
        const trendingBrands = await getTrendingBrands(limit)
        return NextResponse.json(trendingBrands)

      case 'categories':
        const categories = await getReviewCategories()
        return NextResponse.json(categories)

      case 'products':
        const products = await getAllProducts(search, limit, offset)
        return NextResponse.json(products)

      case 'reviews':
        const reviews = await getReviews({ limit, offset, search })
        return NextResponse.json(reviews)

      default:
        // Return all data for the main reviews page
        const [allBrands, trendingBrandsData, allCategories] = await Promise.all([
          getBrands(),
          getTrendingBrands(6),
          getReviewCategories()
        ])

        return NextResponse.json({
          brands: allBrands,
          trendingBrands: trendingBrandsData,
          categories: allCategories
        })
    }
  } catch (error) {
    console.error('Error in reviews API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews data' },
      { status: 500 }
    )
  }
}

// POST: Create a new review
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content || !data.rating) {
      return NextResponse.json({ error: "Title, content, and rating are required" }, { status: 400 })
    }

    if (data.rating < 1 || data.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    const review = await createReview({
      ...data,
      user_id: user.id
    })

    // Award points for posting a review
    try {
      await supabase.rpc('award_points_with_category', {
        p_user_id: user.id,
        p_amount: 10,
        p_category_name: 'reviews',
        p_reason: 'Posting a review',
        p_metadata: { review_id: review.id }
      })
    } catch (pointsError) {
      console.error('Error awarding points for review:', pointsError)
      // Don't fail the review creation if points awarding fails
    }

    return NextResponse.json({ review }, { status: 201 })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
} 