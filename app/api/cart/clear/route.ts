import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user's active cart
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    // If cart doesn't exist, return success since the goal is to have no cart
    if (cartError?.code === 'PGRST116') {
      return NextResponse.json({
        success: true,
        message: "Cart already cleared",
      })
    }

    if (cartError) {
      console.error("Error fetching cart:", cartError)
      return NextResponse.json({ success: false, error: "Cart not found" }, { status: 404 })
    }

    // Delete all cart items for the cart
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)

    if (deleteError) {
      console.error("Error clearing cart items:", deleteError)
      return NextResponse.json({ success: false, error: "Failed to clear cart items" }, { status: 500 })
    }

    // Delete the cart instead of marking it as abandoned
    const { error: deleteCartError } = await supabase
      .from("cart")
      .delete()
      .eq("id", cart.id)

    if (deleteCartError) {
      console.error("Error deleting cart:", deleteCartError)
      return NextResponse.json({ success: false, error: "Failed to delete cart" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Cart cleared successfully",
    })
  } catch (error: any) {
    console.error("Error in DELETE /api/cart/clear:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to clear cart",
      },
      { status: 500 }
    )
  }
}
