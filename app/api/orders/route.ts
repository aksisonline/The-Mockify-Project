import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { createOrderFromCart } from "@/lib/order-service"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()
    const { shipping_address, contact_number, payment_method, notes } = body

    // Validate required fields
    if (!shipping_address || !contact_number || !payment_method) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields: shipping_address, contact_number, and payment_method are required" 
      }, { status: 400 })
    }

    try {
      // Create order using the order service
      const order = await createOrderFromCart(
        user.id,
        shipping_address,
        contact_number,
        payment_method
      )

      return NextResponse.json({
        success: true,
        order
      })
    } catch (error: any) {
      console.error("Error creating order:", error)
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Failed to create order" 
      }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Error in POST /api/orders:", error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Failed to create order" 
    }, { status: 500 })
  }
} 