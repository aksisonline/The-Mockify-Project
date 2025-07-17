import { NextResponse } from "next/server"
import { getRewards, createReward } from "@/lib/rewards-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as "merchandise" | "digital" | "experiences" | null
    const featured = searchParams.get("featured") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined
    const admin = searchParams.get("admin") === "true"

    const options = {
      category: category || undefined,
      featured: featured || undefined,
      limit,
      offset,
      activeOnly: !admin, // Show all rewards if admin=true, otherwise only active
    }

    const { rewards, count } = await getRewards(options)

    return NextResponse.json({
      rewards,
      count,
      success: true,
    })
  } catch (error) {
    console.error("Error fetching rewards:", error)
    return NextResponse.json({ error: "Failed to fetch rewards" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // In a real app, you would check if the user has admin privileges
    // const isAdmin = await checkIfUserIsAdmin(session.user.id)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    const body = await request.json()
    const { title, description, price, quantity, delivery_description, category, image_url, is_featured, is_active } =
      body

    // Validate required fields
    if (!title || !description || !price || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new reward
    const reward = await createReward({
      title,
      description,
      price: Number(price),
      quantity: Number(quantity) || 10,
      delivery_description,
      category,
      image_url,
      is_featured: Boolean(is_featured),
      is_active: Boolean(is_active),
    })

    return NextResponse.json({
      success: true,
      reward,
    })
  } catch (error) {
    console.error("Error creating reward:", error)
    return NextResponse.json({ error: "Failed to create reward" }, { status: 500 })
  }
}
