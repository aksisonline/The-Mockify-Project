import { type NextRequest, NextResponse } from "next/server"
import {
  getDiscussionById,
  updateDiscussion,
  deleteDiscussion,
  recordView,
} from "@/lib/discussions-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const discussion = await getDiscussionById(id, user?.id)

    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    // Record view
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    await recordView(id, user?.id, ipAddress, userAgent)

    return NextResponse.json(discussion)
  } catch (error) {
    console.error("Error fetching discussion:", error)
    return NextResponse.json({ error: "Failed to fetch discussion" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const { id } = await params
    const data = await request.json()

    // Check if user is the author
    const discussion = await getDiscussionById(id)
    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    // Check if user is admin or moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
    const isAuthor = discussion.author_id === userId

    // Allow admins/moderators to perform moderation actions on any discussion
    const isModerationAction = data.is_pinned !== undefined || data.is_locked !== undefined || data.is_archived !== undefined || data.is_flagged !== undefined

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // If it's a moderation action, only allow admins/moderators
    if (isModerationAction && !isAdmin) {
      return NextResponse.json({ error: "Insufficient permissions for moderation actions" }, { status: 403 })
    }

    const updatedDiscussion = await updateDiscussion(id, data)
    return NextResponse.json(updatedDiscussion)
  } catch (error) {
    console.error("Error updating discussion:", error)
    return NextResponse.json({ error: "Failed to update discussion" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = user.id
    const { id } = await params

    // Check if user is the author
    const discussion = await getDiscussionById(id)
    if (!discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    // Check if user is admin or moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single()

    const isAdmin = profile?.role === 'admin' || profile?.role === 'moderator'
    const isAuthor = discussion.author_id === userId

    if (!isAuthor && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    await deleteDiscussion(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting discussion:", error)
    return NextResponse.json({ error: "Failed to delete discussion" }, { status: 500 })
  }
}
