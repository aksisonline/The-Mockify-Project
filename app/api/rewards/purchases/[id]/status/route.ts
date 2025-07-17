import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { notificationService } from "@/lib/notification-service"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { status, notes } = await request.json()

    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, processing, shipped, delivered, cancelled" },
        { status: 400 }
      )
    }

    // Check if user is authenticated and is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Get current status before update
    const { data: currentPurchase, error: currentError } = await supabase
      .from("reward_purchases")
      .select("status, user_id, points_spent, transaction_id")
      .eq("id", id)
      .single()

    if (currentError) {
      console.error("Error fetching current purchase:", currentError)
      return NextResponse.json(
        { error: "Reward purchase not found" },
        { status: 404 }
      )
    }

    // Update the reward purchase status
    const { data, error } = await supabase
      .from("reward_purchases")
      .update({ status })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating reward purchase status:", error)
      return NextResponse.json(
        { error: "Failed to update reward purchase status" },
        { status: 500 }
      )
    }

    // Manually add status history entry with notes
    const { error: historyError } = await supabase
      .from("reward_purchase_status_history")
      .insert({
        reward_purchase_id: id,
        status,
        changed_by: user.id,
        notes: notes || `Status updated from ${currentPurchase.status} to ${status} by admin`
      })

    if (historyError) {
      console.error("Error adding status history:", historyError)
      // Don't fail the status update if history fails
    }

    // Send notification to user about status update
    try {
      // Get purchase details for notification
      const { data: purchaseDetails } = await supabase
        .from("reward_purchase_details")
        .select("reward_title, user_id")
        .eq("id", id)
        .single()

      if (purchaseDetails) {
        const statusMessages = {
          pending: "Your reward order is pending and will be processed soon",
          processing: "Your reward order is being processed and prepared for shipping",
          shipped: "Your reward has been shipped and is on its way to you",
          delivered: "Your reward has been delivered successfully",
          cancelled: "Your reward order has been cancelled"
        }

        const statusTitles = {
          pending: "Reward Order Pending",
          processing: "Reward Order Processing", 
          shipped: "Reward Shipped",
          delivered: "Reward Delivered",
          cancelled: "Reward Order Cancelled"
        }

        await notificationService.createNotification({
          userId: purchaseDetails.user_id,
          title: `${statusTitles[status as keyof typeof statusTitles]} - ${purchaseDetails.reward_title}`,
          message: `${statusMessages[status as keyof typeof statusMessages]}. ${notes ? `Note: ${notes}` : ''}`,
          type: "reward_status_update",
          priority: "normal",
          referenceId: id,
          referenceType: "reward_purchase"
        })
      }
    } catch (notificationError) {
      console.error("Error sending notification:", notificationError)
      // Don't fail the status update if notification fails
    }

    // If status is being cancelled, we might want to refund points
    if (status === 'cancelled') {
      // Get the purchase details to refund points
      const { data: purchaseDetails } = await supabase
        .from("reward_purchase_details")
        .select("*")
        .eq("id", id)
        .single()

      if (purchaseDetails) {
        // Create a refund transaction
        const { error: refundError } = await supabase
          .from("transactions")
          .insert({
            user_id: purchaseDetails.user_id,
            transaction_type: "points",
            amount: purchaseDetails.points_spent,
            type: "earn",
            reason: `Refund for cancelled reward: ${purchaseDetails.reward_title}`,
            category_name: "rewards",
            metadata: {
              refund_for_purchase: id,
              original_transaction: purchaseDetails.transaction_id,
              refund_reason: "Reward purchase cancelled by admin"
            }
          })

        if (refundError) {
          console.error("Error creating refund transaction:", refundError)
          // Don't fail the status update if refund fails
        } else {
          console.log(`Points refunded for cancelled reward purchase: ${id}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      purchase: data,
      previousStatus: currentPurchase.status,
      newStatus: status,
    })
  } catch (error) {
    console.error("Error updating reward purchase status:", error)
    return NextResponse.json(
      { error: "Failed to update reward purchase status" },
      { status: 500 }
    )
  }
} 