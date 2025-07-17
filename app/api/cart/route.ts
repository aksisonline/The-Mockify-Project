import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get or create cart
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (cartError && cartError.code !== "PGRST116") {
      console.error("Error fetching cart:", cartError)
      return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
    }

    if (!cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating cart:", createError)
        return NextResponse.json({ error: "Failed to create cart" }, { status: 500 })
      }

      return NextResponse.json({ cart: newCart, items: [] })
    }

    // Get cart items
    const { data: items, error: itemsError } = await supabase
      .from("cart_items")
      .select(`
        *,
        product:products (
          id,
          title,
          description,
          price,
          image_url,
          category,
          brand_id,
          quantity
        )
      `)
      .eq("cart_id", cart.id)
      .order("created_at", { ascending: true })

    if (itemsError) {
      console.error("Error fetching cart items:", itemsError)
      return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 })
    }

    return NextResponse.json({ cart, items: items || [] })
  } catch (error) {
    console.error("Error in GET /api/cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { product_id, quantity = 1 } = body

    if (!product_id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 })
    }

    // Get or create cart
    let { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (cartError && cartError.code !== "PGRST116") {
      console.error("Error fetching cart:", cartError)
      return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 })
    }

    if (!cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabase
        .from("cart")
        .insert({
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating cart:", createError)
        return NextResponse.json({ error: "Failed to create cart" }, { status: 500 })
      }

      cart = newCart
    }

    // Check if item already exists in cart
    const { data: existingItem, error: existingError } = await supabase
      .from("cart_items")
      .select("*")
      .eq("cart_id", cart.id)
      .eq("product_id", product_id)
      .single()

    if (existingError && existingError.code !== "PGRST116") {
      console.error("Error checking existing item:", existingError)
      return NextResponse.json({ error: "Failed to check existing item" }, { status: 500 })
    }

    if (existingItem) {
      // Get product details to check maximum quantity
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", product_id)
        .single()

      if (productError || !product) {
        console.error("Error fetching product:", productError)
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      const newQuantity = existingItem.quantity + quantity
      
      // Check if new quantity exceeds product's available quantity
      if (newQuantity > product.quantity) {
        return NextResponse.json({ 
          error: `Cannot add more items. Maximum available quantity is ${product.quantity}`,
          maxQuantity: product.quantity,
          currentQuantity: existingItem.quantity
        }, { status: 400 })
      }

      // Update quantity
      const { data: updatedItem, error: updateError } = await supabase
        .from("cart_items")
        .update({
          quantity: newQuantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (updateError) {
        console.error("Error updating cart item:", updateError)
        return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
      }

      return NextResponse.json({ success: true, item: updatedItem })
    } else {
      // Get product details before adding to cart
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("price, quantity")
        .eq("id", product_id)
        .single()

      if (productError || !product) {
        console.error("Error fetching product:", productError)
        return NextResponse.json({ error: "Product not found" }, { status: 404 })
      }

      // Check if requested quantity exceeds product's available quantity
      if (quantity > product.quantity) {
        return NextResponse.json({ 
          error: `Cannot add ${quantity} items. Maximum available quantity is ${product.quantity}`,
          maxQuantity: product.quantity
        }, { status: 400 })
      }

      // Add new item
      const { data: newItem, error: insertError } = await supabase
        .from("cart_items")
        .insert({
          cart_id: cart.id,
          product_id,
          quantity,
          price: product.price,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (insertError) {
        console.error("Error adding cart item:", insertError)
        return NextResponse.json({ error: "Failed to add cart item" }, { status: 500 })
      }

      return NextResponse.json({ success: true, item: newItem })
    }
  } catch (error) {
    console.error("Error in POST /api/cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const item_id = searchParams.get("item_id")

    if (!item_id) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 })
    }

    // Get cart
    const { data: cart, error: cartError } = await supabase
      .from("cart")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (cartError || !cart) {
      return NextResponse.json({ error: "Cart not found" }, { status: 404 })
    }

    // Delete item
    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", item_id)
      .eq("cart_id", cart.id)

    if (deleteError) {
      console.error("Error deleting cart item:", deleteError)
      return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE /api/cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { item_id, quantity } = body

    if (!item_id || quantity === undefined) {
      return NextResponse.json({ error: "Item ID and quantity are required" }, { status: 400 })
    }

    if (quantity <= 0) {
      // Delete item if quantity is 0 or negative
      const { error: deleteError } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", item_id)

      if (deleteError) {
        console.error("Error deleting cart item:", deleteError)
        return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    // Get cart item to find product_id
    const { data: cartItem, error: cartItemError } = await supabase
      .from("cart_items")
      .select("product_id")
      .eq("id", item_id)
      .single()

    if (cartItemError || !cartItem) {
      console.error("Error fetching cart item:", cartItemError)
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 })
    }

    // Get product details to check maximum quantity
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("quantity")
      .eq("id", cartItem.product_id)
      .single()

    if (productError || !product) {
      console.error("Error fetching product:", productError)
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if requested quantity exceeds product's available quantity
    if (quantity > product.quantity) {
      return NextResponse.json({ 
        error: `Cannot set quantity to ${quantity}. Maximum available quantity is ${product.quantity}`,
        maxQuantity: product.quantity
      }, { status: 400 })
    }

    // Update quantity
    const { data: updatedItem, error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item_id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating cart item:", updateError)
      return NextResponse.json({ error: "Failed to update cart item" }, { status: 500 })
    }

    return NextResponse.json({ success: true, item: updatedItem })
  } catch (error) {
    console.error("Error in PATCH /api/cart:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
