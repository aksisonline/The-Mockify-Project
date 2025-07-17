import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET: Get a single review
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params for Next.js 15+
  const { id } = await params
  
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*, category:review_categories(*), user:profiles(id, full_name, avatar_url)")
    .eq("id", id)
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ review: data })
}

// PATCH: Update a review (only by owner or admin)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params for Next.js 15+
  const { id } = await params
  
  const supabase = await createServerClient()
  const body = await req.json()
  // TODO: Check user is owner or admin
  const { data, error } = await supabase
    .from("reviews")
    .update({ ...body, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ review: data })
}

// DELETE: Delete a review (only by owner or admin)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Await params for Next.js 15+
  const { id } = await params
  
  const supabase = await createServerClient()
  // TODO: Check user is owner or admin
  const { error } = await supabase.from("reviews").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
} 