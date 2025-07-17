import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createTransaction } from "@/lib/transaction-service"
import { getToolById } from "@/lib/tools"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Get purchased tools
    const { data, error, count } = await supabase
      .from("tool_purchases")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .eq("status", "completed")
      .order("purchased_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Error fetching purchased tools:", error)
      return NextResponse.json({ error: "Failed to fetch purchased tools" }, { status: 500 })
    }

    return NextResponse.json({
      purchases: data,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in GET /api/tools/purchases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { toolId } = body

    if (!toolId) {
      return NextResponse.json({ error: "Tool ID is required" }, { status: 400 })
    }

    // Check if the tool exists
    const tool = await getToolById(toolId)
    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    // Check if the tool requires points
    if (!tool.pointsRequired || tool.pointsRequired <= 0) {
      return NextResponse.json({ error: "This tool doesn't require points to unlock" }, { status: 400 })
    }

    // Check if the tool is already purchased
    const { data: existingPurchase } = await supabase
      .from("tool_purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("tool_id", toolId)
      .eq("status", "completed")
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json({
        success: true,
        message: "Tool already purchased",
        alreadyPurchased: true,
      })
    }

    // Get user's points
    const { data: pointsData } = await supabase.from("points").select("*").eq("user_id", user.id).single()

    const currentPoints = pointsData || {
      user_id: user.id,
      total_points: 0,
      total_earned: 0,
      total_spent: 0,
      last_updated: new Date().toISOString(),
    }

    // Check if user has enough points
    if (currentPoints.total_points < tool.pointsRequired) {
      return NextResponse.json(
        {
          error: "Insufficient points",
          pointsRequired: tool.pointsRequired,
          pointsAvailable: currentPoints.total_points,
          pointsNeeded: tool.pointsRequired - currentPoints.total_points,
        },
        { status: 400 },
      )
    }

    // Create a transaction for the tool purchase
    const transactionResult = await createTransaction({
      transactionType: "points",
      userId: user.id,
      amount: tool.pointsRequired,
      type: "spend",
      reason: `Purchased tool: ${tool.name}`,
      categoryName: "tools",
      metadata: {
        toolId: tool.id,
        toolName: tool.name,
        isPremium: tool.isPremium || false,
      },
    })

    if (!transactionResult.success || !transactionResult.transaction) {
      console.error("Error creating transaction:", transactionResult.error)
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
    }

    // No direct insert into tool_purchases; the view will reflect the purchase

    return NextResponse.json({
      success: true,
      message: "Tool purchased successfully",
      transaction: {
        id: transactionResult.transaction.id,
        toolId: tool.id,
        toolName: tool.name,
        pointsSpent: tool.pointsRequired,
        purchasedAt: transactionResult.transaction.created_at,
      },
    })
  } catch (error) {
    console.error("Error in POST /api/tools/purchases:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
