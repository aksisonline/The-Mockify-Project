import { createServerClient } from "./supabase/server"
import type { CartItem } from "@/types/supabase"

/**
 * Get cart items for a user
 */
export async function getCartItems(userId: string): Promise<CartItem[]> {
  const supabase = await createServerClient()

  try {
    // Get user's active cart
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()

    if (cartError) {
      console.error("Error fetching cart:", cartError)
      return []
    }

    // Get cart items with product details
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(`
        id,
        cart_id,
        product_id,
        quantity,
        price,
        created_at,
        updated_at,
        product:products (
          id,
          title,
          description,
          price,
          quantity,
          image_url,
          seller_id,
          seller:seller_profiles (
            user_id,
            name,
            avatar_url
          )
        )
      `)
      .eq("cart_id", cart.id)

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError)
      return []
    }

    return items || []
  } catch (error) {
    console.error("Error in getCartItems:", error)
    return []
  }
}

/**
 * Clear the user's cart
 */
export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      }
    }

    // Get user's active cart
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (cartError) {
      console.error("Error fetching cart:", cartError)
      return {
        success: false,
        error: "Failed to fetch cart",
      }
    }

    // Delete all cart items
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cart.id)

    if (deleteError) {
      console.error("Error deleting cart items:", deleteError)
      return {
        success: false,
        error: "Failed to clear cart",
      }
    }

    // Delete the cart instead of marking as abandoned
    const { error: deleteCartError } = await supabase
      .from("cart")
      .delete()
      .eq("id", cart.id)

    if (deleteCartError) {
      console.error("Error deleting cart:", deleteCartError)
      return {
        success: false,
        error: "Failed to delete cart",
      }
    }

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error in clearCart:", error)
    return {
      success: false,
      error: "Failed to clear cart",
    }
  }
} 