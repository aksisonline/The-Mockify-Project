import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    // Build the main query
    let query = supabase
    .from("events")
    .select("*")
    .eq("status", "approved")

    if (featured === "true") {
      query = query.eq("is_featured", true)
    }
    if (category && category !== "all") {
      query = query.eq("category", category)
    }
    query = query.order("start_date", { ascending: true })

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ success: false, error: "Query failed", details: error.message }, { status: 500 })
    }

    // Always return an array (empty if no events)
    return NextResponse.json(Array.isArray(data) ? data : [], { headers: { "Content-Type": "application/json" } })
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unexpected error", details: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
