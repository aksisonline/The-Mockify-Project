import { type NextRequest, NextResponse } from "next/server"
import { getDiscussionComments, createComment } from "@/lib/discussions-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: discussionId } = await params
    const searchParams = request.nextUrl.searchParams
    const parentId = searchParams.has("parentId") ? searchParams.get("parentId") || null : undefined
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")
    const sort_by = (searchParams.get("sort_by") as "newest" | "oldest" | "popular") || "newest"

    const comments = await getDiscussionComments(discussionId, {
      parentId,
      limit,
      offset,
      sort_by,
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const { id: discussionId } = await params
    const data = await request.json()

    // Validate required fields
    if (!data.content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await createComment({
      ...data,
      discussion_id: discussionId,
      author_id: userId,
    })

    // Award points for commenting on a discussion
    try {
      await supabase.rpc('award_points_with_category', {
        p_user_id: userId,
        p_amount: 10,
        p_category_name: 'community',
        p_reason: 'Commenting on a discussion',
        p_metadata: { comment_id: comment.id, discussion_id: discussionId }
      })
    } catch (pointsError) {
      console.error('Error awarding points for comment:', pointsError)
      // Don't fail the comment creation if points awarding fails
    }

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
  }
}
