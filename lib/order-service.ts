import { createServerClient } from "./supabase/server"
import { createTransaction, updateRealTransactionStatus } from "./transaction-service"
import { getCartItems, clearCart } from "./cart-service"
import type { Order, OrderItem } from "@/types/supabase"
import { awardCategoryPoints } from "./points-category-service"
import { notificationService } from "./notification-service"
import { generateOrderNumber } from "@/lib/utils"
import { serverNotificationService } from "@/lib/notification-service-client"
import { sendEkartOrderEmail } from "./email-service"
import { sendSellerOrderNotificationEmail } from "./email-service"

/**
 * Create a new order from cart
 */
export async function createOrderFromCart(
  userId: string,
  shippingAddress: string,
  contactNumber: string,
  paymentMethod: string
): Promise<Order> {
  const supabase = await createServerClient()

  try {
    // Get user profile for emails
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", userId)
      .single()

    // Get cart items
    const cartItems = await getCartItems(userId)
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty')
    }

    // Debug: Log cart items and their product/price
    // console.log('Cart items for order:', cartItems.map(item => ({
    //   product_id: item.product_id,
    //   quantity: item.quantity,
    //   product: item.product
    // })))

    // Calculate order amounts
    const subtotal = cartItems.reduce(
      (sum, item) => sum + (item.product ? item.quantity * item.product.price : 0),
      0
    )
    const taxAmount = 0 // Set to 0 for now, or add your logic
    const shippingAmount = 0 // Set to 0 for now, or add your logic
    const discountAmount = 0 // Set to 0 for now, or add your logic
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount

    // Create transaction record
    const transactionResult = await createTransaction({
      userId,
      transactionType: 'real',
      amount: totalAmount,
      type: 'spend',
      reason: 'Order placed',
      currency: 'INR',
      paymentMethod,
      initialStatus: 'pending',
      statusNote: 'Order placed',
      metadata: {
        orderType: 'ekart',
        items: cartItems.length
      }
    })

    if (!transactionResult.success || !transactionResult.transaction) {
      throw new Error(transactionResult.error || 'Failed to create transaction')
    }

    // Generate order number using database function
    const { data: orderNumber, error: orderNumberError } = await supabase
      .rpc('generate_order_number')

    if (orderNumberError) {
      throw new Error(orderNumberError.message)
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        transaction_id: transactionResult.transaction.id,
        status: 'pending',
        shipping_address: shippingAddress,
        contact_number: contactNumber,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_amount: shippingAmount,
        discount_amount: discountAmount,
        order_number: orderNumber
      })
      .select()
      .single()

    if (orderError) {
      throw new Error(orderError.message)
    }

    // Create order items
    const orderItems = cartItems
      .filter(item => item.product)
      .map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.product!.price,
        total_price: item.quantity * item.product!.price,
        product_name: item.product!.title,
        product_description: item.product!.description,
        product_image_url: item.product!.image_url,
        seller_id: item.product!.seller_id
      }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      throw new Error(itemsError.message)
    }

    // Update product quantities and disable products
    for (const item of cartItems) {
      if (!item.product) continue;
      const { error: updateError } = await supabase
        .from('products')
        .update({
          quantity: item.product.quantity - item.quantity,
          is_active: false // Disable the product after purchase
        })
        .eq('id', item.product_id)

      if (updateError) {
        throw new Error(updateError.message)
      }
    }

    // Clear cart
    await clearCart()

    // Note: Transaction status remains 'pending' for ekart orders
    // It will be updated to 'completed' when the seller marks the order as delivered
    // await updateRealTransactionStatus(transactionResult.transaction.id, 'completed')

    // Award points for purchase (1 point per 50 rupees)
    const pointsToAward = Math.floor(totalAmount / 20)
    if (pointsToAward > 0) {
      await createTransaction({
        userId,
        transactionType: 'points',
        amount: pointsToAward,
        type: 'earn',
        reason: 'Points earned from purchase',
        categoryName: 'ekart'
      })
    }

    // Send confirmation email
    try {
      if (profile?.email) {
        // Prepare order items for email
        const emailOrderItems = orderItems.map(item => ({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        }))

        await sendEkartOrderEmail(
          profile.email,
          profile.full_name || "User",
          order.order_number,
          emailOrderItems,
          totalAmount,
          shippingAddress,
          new Date().toLocaleDateString()
        )
        // console.log(`✅ eKart order confirmation email sent to ${profile.email}`)
      }
    } catch (emailError) {
      console.error("Failed to send eKart order email:", emailError)
      // Don't throw error - email failure shouldn't break the order
    }

    // Send seller notifications
    try {
      // Group order items by seller
      const sellerGroups = new Map<string, {
        sellerId: string
        items: Array<{
          productName: string
          quantity: number
          unitPrice: number
          totalPrice: number
        }>
        totalAmount: number
      }>()

      // Group items by seller
      orderItems.forEach(item => {
        if (!sellerGroups.has(item.seller_id)) {
          sellerGroups.set(item.seller_id, {
            sellerId: item.seller_id,
            items: [],
            totalAmount: 0
          })
        }
        const group = sellerGroups.get(item.seller_id)!
        group.items.push({
          productName: item.product_name,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price
        })
        group.totalAmount += item.total_price
      })

      // Send email to each seller
      for (const [sellerId, sellerGroup] of sellerGroups) {
        try {
          // Get seller profile
          const { data: sellerProfile } = await supabase
            .from("profiles")
            .select("email, full_name")
            .eq("id", sellerId)
            .single()

          if (sellerProfile?.email) {
            await sendSellerOrderNotificationEmail(
              sellerProfile.email,
              sellerProfile.full_name || "Seller",
              profile?.full_name || "Customer",
              order.order_number,
              sellerGroup.items,
              sellerGroup.totalAmount,
              new Date().toLocaleDateString()
            )
            // console.log(`✅ Seller notification email sent to ${sellerProfile.email} for order ${order.order_number}`)
          }
        } catch (sellerEmailError) {
          console.error(`Failed to send seller notification email to seller ${sellerId}:`, sellerEmailError)
          // Continue with other sellers even if one fails
        }
      }
    } catch (sellerNotificationError) {
      console.error("Failed to send seller notifications:", sellerNotificationError)
      // Don't throw error - email failure shouldn't break the order
    }

    return order
  } catch (error) {
    console.error('Error in createOrderFromCart:', error)
    throw error
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(options?: {
  userId?: string
  status?: string
  limit?: number
  offset?: number
}): Promise<{ orders: Order[]; count: number }> {
  const supabase = await createServerClient()

  try {
    // Get user ID if not provided
    let userId = options?.userId
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { orders: [], count: 0 }
      }
      userId = user.id
    }

    // Build query
    let query = supabase
      .from("orders")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    // Apply filters
    if (options?.status) {
      query = query.eq("status", options.status)
    }

    // Apply pagination
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching orders:", error)
      return { orders: [], count: 0 }
    }

    return {
      orders: data || [],
      count: count || 0,
    }
  } catch (error) {
    console.error("Error in getUserOrders:", error)
    return { orders: [], count: 0 }
  }
}

/**
 * Get order details
 */
export async function getOrderDetails(orderId: string): Promise<{
  order: Order | null
  items: OrderItem[]
}> {
  const supabase = await createServerClient()

  try {
    // Get order
    const { data: order, error: orderError } = await supabase.from("orders").select("*").eq("id", orderId).single()

    if (orderError) {
      console.error("Error fetching order:", orderError)
      return { order: null, items: [] }
    }

    // Get order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*, product:products(*)")
      .eq("order_id", orderId)

    if (itemsError) {
      console.error("Error fetching order items:", itemsError)
      return { order, items: [] }
    }

    return {
      order,
      items: items || [],
    }
  } catch (error) {
    console.error("Error in getOrderDetails:", error)
    return { order: null, items: [] }
  }
}

