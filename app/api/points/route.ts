import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getUserPoints } from "@/lib/points-service"
import { getUserTransactions, createTransaction } from "@/lib/transaction-service"

// GET /api/points - Get current user's points
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse query parameters
    const url = new URL(request.url)
    const includeTransactions = url.searchParams.get("transactions") === "true"
    const limit = Number.parseInt(url.searchParams.get("limit") || "10", 10)
    const page = Number.parseInt(url.searchParams.get("page") || "1", 10)
    const offset = (page - 1) * limit
    const type = url.searchParams.get("type") as "earn" | "spend" | null

    // Get points
    const points = await getUserPoints(user.id)

    // Get transactions if requested
    let transactions = null
    let totalTransactions = 0

    if (includeTransactions) {
      const result = await getUserTransactions({
        userId: user.id,
        limit,
        offset,
        type: type || undefined,
      })

      transactions = result.transactions
      totalTransactions = result.count
    }

    return NextResponse.json({
      points,
      transactions,
      pagination: includeTransactions
        ? {
            total: totalTransactions,
            page,
            limit,
            totalPages: Math.ceil(totalTransactions / limit),
          }
        : null,
    })
  } catch (error) {
    console.error("Points API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/points - Create a new transaction
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()

    // Validate request
    if (!body.type || !["earn", "spend"].includes(body.type)) {
      return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 })
    }

    if (!body.amount || typeof body.amount !== "number" || body.amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    if (!body.reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 })
    }

    // Create transaction
    const result = await createTransaction({
      userId: user.id,
      transactionType: "points",
      amount: body.amount,
      type: body.type,
      reason: body.reason,
      categoryName: body.categoryName || "achievements",
      metadata: body.metadata,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Failed to create transaction" }, { status: 400 })
    }

    // Get updated points
    const points = await getUserPoints(user.id)

    return NextResponse.json({ transaction: result.transaction, points })
  } catch (error: any) {
    console.error("Transaction API error:", error)

    if (error.message === "Insufficient points") {
      return NextResponse.json({ error: "Insufficient points" }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to process transaction" }, { status: 500 })
  }
}
