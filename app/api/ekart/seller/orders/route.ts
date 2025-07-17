import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { sendOrderStatusUpdateEmail } from "@/lib/email-service"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // First get all products where the current user is the seller
    const { data: sellerProducts, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", user.id)

    if (productsError) {
      throw productsError
    }

    if (!sellerProducts?.length) {
      return NextResponse.json({ success: true, orders: [] })
    }

    // Then get all order items for these products
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(`
        *,
        order:orders (
          id,
          order_number,
          status,
          total_amount,
          shipping_address,
          contact_number,
          payment_method,
          created_at,
          user_id
        ),
        product:products (
          id,
          title,
          description,
          image_url
        )
      `)
      .in("product_id", sellerProducts.map(p => p.id))
      .order("created_at", { ascending: false })

    if (itemsError) {
      throw itemsError
    }

    // Get user data for all orders
    const userIds = [...new Set(orderItems?.map(item => item.order.user_id) || [])]
    // Fetch both auth user and profile info
    const userData = await Promise.all(
      userIds.map(async (userId) => {
        const { data: profile, error: profileError } = await supabase.from("public_profiles").select("full_name,email,avatar_url,phone").eq("id", userId).single()
        if (profileError) {
          console.error(`Error fetching profile ${userId}:`, profileError)
        }
        return {
          id: userId,
          email: profile?.email || null,
          name: profile?.full_name || "Unknown",
          phone: profile?.phone || null,
          avatar_url: profile?.avatar_url || null
        }
      })
    )

    // Create a map of user data
    const userMap = new Map(
      userData
        .filter((user): user is NonNullable<typeof user> => user !== null)
        .map(user => [user.id, user])
    )

    // Group order items by order
    const ordersMap = new Map()
    orderItems?.forEach(item => {
      if (!ordersMap.has(item.order.id)) {
        const user = userMap.get(item.order.user_id)
        ordersMap.set(item.order.id, {
          ...item.order,
          items: [],
          buyer: {
            id: user?.id,
            email: user?.email,
            name: user?.name,
            phone: user?.phone,
            avatar_url: user?.avatar_url
          }
        })
      }
      ordersMap.get(item.order.id).items.push({
        id: item.id,
        quantity: item.quantity,
        price: item.unit_price,
        product: item.product
      })
    })

    return NextResponse.json({
      success: true,
      orders: Array.from(ordersMap.values())
    })
  } catch (error) {
    console.error("Error fetching seller orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { orderId, status, updateTransaction } = await request.json()

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify that the order contains items from the seller's products
    const { data: sellerProducts, error: productsError } = await supabase
      .from("products")
      .select("id")
      .eq("seller_id", user.id)

    if (productsError) {
      throw productsError
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id")
      .eq("order_id", orderId)
      .in("product_id", sellerProducts.map(p => p.id))

    if (itemsError) {
      throw itemsError
    }

    if (!orderItems?.length) {
      return NextResponse.json(
        { success: false, error: "Order not found or unauthorized" },
        { status: 404 }
      )
    }

    // Get the order to find its transaction ID
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("transaction_id")
      .eq("id", orderId)
      .single()

    if (orderError) {
      throw orderError
    }

    // Update the order status
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)

    if (updateError) {
      throw updateError
    }

    // Send email notification for status updates
    try {
      // console.log(`🔍 Starting email notification process for order ${orderId} with status ${status}`)
      
      // Get complete order details for email
      const { data: orderDetails, error: orderDetailsError } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            *,
            product:products (
              title,
              description,
              image_url
            )
          )
        `)
        .eq("id", orderId)
        .single()

      if (orderDetailsError) {
        console.error("❌ Error fetching order details:", orderDetailsError)
        throw orderDetailsError
      }

      // console.log(`📦 Order details fetched:`, { 
        // orderNumber: orderDetails?.order_number, 
        // totalAmount: orderDetails?.total_amount,
        // orderItemsCount: orderDetails?.order_items?.length 
      // })

      // Get buyer profile information separately
      const { data: buyerProfile, error: buyerError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", orderDetails.user_id)
        .single()

      if (buyerError) {
        console.error("❌ Error fetching buyer profile:", buyerError)
        throw buyerError
      }

      // console.log(`👤 Buyer profile fetched:`, { 
      //   email: buyerProfile?.email, 
      //   name: buyerProfile?.full_name 
      // })

      if (buyerProfile?.email) {
        // Prepare order items for email
        const emailOrderItems = orderDetails.order_items?.map(item => ({
          productName: item.product?.title || item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })) || []

        // console.log(`📧 Sending email to ${buyerProfile.email} with ${emailOrderItems.length} items`)

        // Send email notification
        await sendOrderStatusUpdateEmail(
          buyerProfile.email,
          buyerProfile.full_name || "User",
          orderDetails.order_number,
          status as 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'processing',
          emailOrderItems,
          orderDetails.total_amount,
          undefined, // trackingNumber
          undefined  // estimatedDelivery
        )
        
        // console.log(`✅ Order status update email sent to ${buyerProfile.email} for order ${orderDetails.order_number}`)
      } else {
        console.log(`⚠️ No buyer email found for order ${orderDetails.order_number}`)
      }
    } catch (emailError) {
      console.error("❌ Failed to send order status update email:", emailError)
      // Don't throw error - email failure shouldn't break the order status update
    }

    // If order is marked as delivered or cancelled and has a transaction ID, update the transaction status
    if ((status === "delivered" || status === "cancelled") && updateTransaction && order?.transaction_id) {
      // First get the current transaction to access its status history
      const { data: transaction, error: getTxError } = await supabase
        .from("transactions")
        .select("status_history")
        .eq("id", order.transaction_id)
        .single()

      if (getTxError) {
        console.error("Error getting transaction:", getTxError)
      } else {
        // Determine the new transaction status and note based on order status
        const newTxStatus = status === "delivered" ? "completed" : "failed"
        const statusNote = status === "delivered" ? "Order delivered" : "Order cancelled"

        // Update the transaction with the new status and append to history
        const { error: txError } = await supabase
          .from("transactions")
          .update({ 
            status: newTxStatus,
            status_history: [
              ...(transaction?.status_history || []),
              {
                status: newTxStatus,
                timestamp: new Date().toISOString(),
                note: statusNote
              }
            ]
          })
          .eq("id", order.transaction_id)
          .eq("transaction_type", "real")

        if (txError) {
          console.error("Error updating transaction status:", txError)
          // Don't throw here, as the order status was already updated
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
} 