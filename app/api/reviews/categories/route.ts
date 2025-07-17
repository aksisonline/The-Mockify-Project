import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

// GET: List review categories
export async function GET() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.from("review_categories").select("*").order("name")
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ categories: data })
}

// POST: Add a new category (admin only)
export async function POST(req: NextRequest) {
  const supabase = await createServerClient()
  const body = await req.json()
  const { name } = body
  // TODO: Check admin
  if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 })
  const { data, error } = await supabase.from("review_categories").insert({ name }).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ category: data })
} 