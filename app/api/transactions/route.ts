import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createTransaction, getUserTransactions } from "@/lib/transaction-service"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const transactionType = searchParams.get("transactionType") as "points" | "real" | undefined
    const type = searchParams.get("type") as "earn" | "spend" | undefined
    const status = searchParams.get("status") as string | undefined
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const offset = (page - 1) * limit

    // Get user from session (secure)
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get transactions
    const { transactions, count } = await getUserTransactions({
      userId: user.id,
      transactionType,
      type,
      status: status as any,
      limit,
      offset,
    })

    return NextResponse.json({
      transactions,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { transactionType, amount, type, reason, metadata, currency, paymentMethod, referenceId, initialStatus } =
      body

    // Get user from session (secure)
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Validate required fields
    if (!amount || !type || !reason || !transactionType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create transaction options
    const options: any = {
      userId: user.id,
      transactionType,
      amount: Number(amount),
      type,
      reason,
      metadata,
    }

    // Add real transaction fields if needed
    if (transactionType === "real") {
      if (!currency || !paymentMethod) {
        return NextResponse.json(
          { error: "Currency and payment method are required for real transactions" },
          { status: 400 },
        )
      }

      options.currency = currency
      options.paymentMethod = paymentMethod
      options.referenceId = referenceId
      options.initialStatus = initialStatus
    }

    // Create transaction
    const result = await createTransaction(options)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
    })
  } catch (error) {
    console.error("Error creating transaction:", error)
    return NextResponse.json({ error: "Failed to create transaction" }, { status: 500 })
  }
}
