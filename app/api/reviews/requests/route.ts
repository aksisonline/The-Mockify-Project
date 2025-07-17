import { type NextRequest, NextResponse } from "next/server"
import { createReviewRequest, getReviewRequests } from "@/lib/reviews-service"
import { createServerClient } from "@/lib/supabase/server"

// GET: List review requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status") || undefined

    const requests = await getReviewRequests(status)
    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching review requests:", error)
    return NextResponse.json({ error: "Failed to fetch review requests" }, { status: 500 })
  }
}

// POST: Create a new review request
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const reviewRequest = await createReviewRequest({
      user_id: user.id,
      product_id: data.product_id,
      content: data.content
    })

    return NextResponse.json({ request: reviewRequest }, { status: 201 })
  } catch (error) {
    console.error("Error creating review request:", error)
    return NextResponse.json({ error: "Failed to create review request" }, { status: 500 })
  }
}

// PATCH: Update request status (admin only)
export async function PATCH(req: NextRequest) {
  const supabase = await createServerClient()
  const body = await req.json()
  const { id, status } = body
  // TODO: Check admin
  if (!id || !status) return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  const { data, error } = await supabase.from("review_requests").update({ status }).eq("id", id).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ request: data })
} 