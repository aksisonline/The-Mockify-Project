import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { updateRealTransactionStatus, getTransactionById } from "@/lib/transaction-service"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    const transactionId = id
    const body = await request.json()
    const { status, note } = body

    // Get user from session
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Validate required fields
    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    // Get transaction to verify ownership
    const transaction = await getTransactionById(transactionId)

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Verify transaction type
    if (transaction.transaction_type !== "real") {
      return NextResponse.json({ error: "Only real transactions can have their status updated" }, { status: 400 })
    }

    // Verify ownership (or admin status in a real app)
    if (transaction.user_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update status
    const result = await updateRealTransactionStatus(transactionId, status, note)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      transaction: result.transaction,
    })
  } catch (error) {
    console.error("Error updating transaction status:", error)
    return NextResponse.json({ error: "Failed to update transaction status" }, { status: 500 })
  }
}
