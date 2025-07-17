import { type NextRequest, NextResponse } from "next/server"
import { getReviewComments, createReviewComment } from "@/lib/reviews-service"
import { createServerClient } from "@/lib/supabase/server"

// GET: List comments for a review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const searchParams = request.nextUrl.searchParams
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    const comments = await getReviewComments(id, limit, offset)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching review comments:", error)
    return NextResponse.json({ error: "Failed to fetch review comments" }, { status: 500 })
  }
}

// POST: Add a comment to a review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    const comment = await createReviewComment({
      review_id: id,
      user_id: user.id,
      content: data.content
    })

    return NextResponse.json({ comment }, { status: 201 })
  } catch (error) {
    console.error("Error creating review comment:", error)
    return NextResponse.json({ error: "Failed to create review comment" }, { status: 500 })
  }
} 