import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { awardCategoryPoints } from "@/lib/points-category-service"

const POINTS_FOR_PRODUCT_POST = 50; // Points awarded for posting a product

// GET /api/products - Get products with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const search = searchParams.get("search")
    const featured = searchParams.get("featured") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const conditions = searchParams.get("conditions")?.split(",").filter(Boolean)

    const supabase = await createServerClient()

    let query = supabase
      .from("products")
      .select(`
        *,
        seller:seller_profiles (
          user_id,
          name,
          avatar_url
        )
      `, { count: "exact" })
      .eq("is_active", true)

    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    if (featured) {
      query = query.eq("is_featured", true)
    }

    if (minPrice) {
      query = query.gte("price", parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte("price", parseFloat(maxPrice))
    }

    if (conditions && conditions.length > 0) {
      query = query.in("condition", conditions)
    }

    const { data: products, error, count } = await query
      .order("posted_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products,
      count: count || 0
    })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/products - Create a new product
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Validate required fields
    const requiredFields = ["title", "description", "price", "condition", "location"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Validate price
    const price = Number(body.price)
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    // Validate condition
    const validConditions = ["New", "Like New", "Good", "Fair", "For Parts"]
    if (!validConditions.includes(body.condition)) {
      return NextResponse.json({ error: "Invalid condition" }, { status: 400 })
    }

    // Create the product
    const { data: product, error } = await supabase
      .from("products")
      .insert({
        title: body.title,
        description: body.description,
        price: price,
        condition: body.condition,
        location: body.location,
        seller_id: user.id,
        image_url: body.image_url,
        is_featured: body.is_featured || false,
        is_active: true,
        quantity: body.quantity || 1,
        category: body.category || "general",
        posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
    }

    // Award points for posting a product
    const { error: pointsError } = await supabase.rpc(
      "award_points_with_category",
      {
        p_user_id: user.id,
        p_amount: POINTS_FOR_PRODUCT_POST,
        p_category_name: "ekart",
        p_reason: "Points earned for posting a product",
        p_metadata: {
          product_id: product.id,
          product_title: product.title,
          notification_type: "points_earned"
        }
      }
    );

    if (pointsError) {
      console.warn("Could not award points for product posting:", pointsError)
    }

    // Create notification for points earned
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: user.id,
        notification_type: "announcement",
        title: "New Product Posted",
        message: `A new product has been posted: ${product.title}`,
        data: {
          product_id: product.id,
          seller_id: user.id,
          product_title: product.title
        }
      });

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error("Products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
