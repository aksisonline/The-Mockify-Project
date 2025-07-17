import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
    const supabase = await createServerClient()

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .eq("is_active", true)
      .single()

    if (error || !product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch product", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { params } = context;
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user owns the product
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("seller_id")
      .eq("id", id)
      .single()

    if (fetchError || !product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    if (product.seller_id !== user.id) {
      return NextResponse.json({ error: "Forbidden: You can only delete your own products" }, { status: 403 })
    }

    // Soft delete by setting is_active to false
    const { error } = await supabase
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete product", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      error: "Unexpected error", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
