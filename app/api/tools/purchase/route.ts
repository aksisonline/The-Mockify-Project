import { NextResponse } from "next/server"
import { getToolById } from "@/lib/tools"
import { createServerClient } from "@/lib/supabase/server"
import { createTransaction } from "@/lib/transaction-service"
import { spendCategoryPoints } from "@/lib/points-category-service"

// Define the request body type
interface PurchaseRequest {
  userId: string
  toolId: string
  pointsSpent: number
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body: PurchaseRequest = await request.json()
    const { userId, toolId, pointsSpent } = body

    // Validate request data
    if (!userId || !toolId || !pointsSpent) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Get the tool to verify points requirement
    const tool = await getToolById(toolId)
    if (!tool) {
      return NextResponse.json({ success: false, error: "Tool not found" }, { status: 404 })
    }

    // Check if the tool is premium and requires points
    if (!tool.isPremium && !tool.pointsRequired) {
      return NextResponse.json({ success: false, error: "Tool is not a premium tool" }, { status: 400 })
    }

    // Verify that the correct number of points was spent
    if (pointsSpent !== tool.pointsRequired) {
      return NextResponse.json(
        {
          success: false,
          error: `Incorrect points amount. Required: ${tool.pointsRequired}, Spent: ${pointsSpent}`,
        },
        { status: 400 },
      )
    }

    // Get Supabase client
    const supabase = await createServerClient()

    // Check if the tool is already purchased
    const { data: existingPurchase } = await supabase
      .from("tool_purchases")
      .select("id")
      .eq("user_id", userId)
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
    const { data: pointsData } = await supabase.from("points").select("*").eq("user_id", userId).single()

    const currentPoints = pointsData || {
      user_id: userId,
      total_points: 0,
      total_earned: 0,
      total_spent: 0,
      last_updated: new Date().toISOString(),
    }

    // Check if user has enough points
    if (currentPoints.total_points < pointsSpent) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient points",
          pointsRequired: pointsSpent,
          pointsAvailable: currentPoints.total_points,
          pointsNeeded: pointsSpent - currentPoints.total_points,
        },
        { status: 400 },
      )
    }

    // Spend points in 'tools' category using the new system
    const spendResult = await spendCategoryPoints(userId, "tools", pointsSpent, `Purchased tool: ${tool.name}`, {
      toolId: tool.id,
      toolName: tool.name,
      isPremium: tool.isPremium || false,
    })
    if (!spendResult.success) {
      return NextResponse.json({ success: false, error: spendResult.error || "Failed to spend points" }, { status: 500 })
    }

    // Create a transaction for the tool purchase
    const transactionResult = await createTransaction({
      transactionType: "points",
      userId: userId,
      amount: pointsSpent,
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
      return NextResponse.json({ success: false, error: "Failed to create transaction" }, { status: 500 })
    }

    const transaction = transactionResult.transaction

    // Create tool purchase record (if needed)
    const { error: purchaseError } = await supabase.from("tool_purchases").insert({
      user_id: userId,
      tool_id: tool.id,
      points_spent: pointsSpent,
      purchased_at: new Date().toISOString(),
      status: "completed",
    })

    if (purchaseError) {
      console.error("Error creating tool purchase record:", purchaseError)
      // Don't fail the request since the transaction already succeeded
    }

    return NextResponse.json({
      success: true,
      message: "Purchase verified successfully",
      transaction: {
        id: transaction.id,
        userId,
        toolId,
        pointsSpent,
        timestamp: transaction.created_at,
      },
    })
  } catch (error) {
    console.error("Error verifying tool purchase:", error)
    return NextResponse.json({ success: false, error: "Failed to verify purchase" }, { status: 500 })
  }
}
