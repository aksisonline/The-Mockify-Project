import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Check if user is authenticated
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin or owns the purchase
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.is_admin || false

    // Get the reward purchase to check ownership
    const { data: purchase, error: purchaseError } = await supabase
      .from("reward_purchases")
      .select("user_id")
      .eq("id", id)
      .single()

    if (purchaseError) {
      return NextResponse.json({ error: "Reward purchase not found" }, { status: 404 })
    }

    // Check if user owns the purchase or is admin
    if (!isAdmin && purchase.user_id !== user.id) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    // Get status history
    const { data: statusHistory, error: historyError } = await supabase
      .from("reward_purchase_status_history")
      .select(`
        *,
        changed_by_user:profiles!reward_purchase_status_history_changed_by_fkey (
          full_name,
          email
        )
      `)
      .eq("reward_purchase_id", id)
      .order("changed_at", { ascending: true })

    if (historyError) {
      console.error("Error fetching status history:", historyError)
      return NextResponse.json(
        { error: "Failed to fetch status history" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      statusHistory: statusHistory || [],
    })
  } catch (error) {
    console.error("Error fetching reward purchase status history:", error)
    return NextResponse.json(
      { error: "Failed to fetch status history" },
      { status: 500 }
    )
  }
} 