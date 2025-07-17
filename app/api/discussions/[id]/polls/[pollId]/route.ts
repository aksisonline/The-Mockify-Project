import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getPollWithVotes, deletePoll, updatePoll } from "@/lib/discussions-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Await params before using its properties
    const { pollId } = await params
    const poll = await getPollWithVotes(pollId, user?.id)
    
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before using its properties
    const { pollId, id: discussionId } = await params
    const updates = await request.json()

    // Check if user owns the discussion (only discussion author can update poll)
    const { data: discussion, error: discussionError } = await supabase
      .from("discussions")
      .select("author_id")
      .eq("id", discussionId)
      .single()

    if (discussionError || !discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    if (discussion.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden - Only discussion author can update poll" }, { status: 403 })
    }

    // Only allow updating certain fields
    const allowedUpdates = {
      question: updates.question,
      description: updates.description,
      expires_at: updates.expires_at,
    }

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    )

    const poll = await updatePoll(pollId, filteredUpdates)

    return NextResponse.json({ poll })
  } catch (error) {
    console.error("Error updating poll:", error)
    return NextResponse.json({ error: "Failed to update poll" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; pollId: string }> }
) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Await params before using its properties
    const { pollId, id: discussionId } = await params

    // Check if user owns the discussion (only discussion author can delete poll)
    const { data: discussion, error: discussionError } = await supabase
      .from("discussions")
      .select("author_id")
      .eq("id", discussionId)
      .single()

    if (discussionError || !discussion) {
      return NextResponse.json({ error: "Discussion not found" }, { status: 404 })
    }

    if (discussion.author_id !== user.id) {
      return NextResponse.json({ error: "Forbidden - Only discussion author can delete poll" }, { status: 403 })
    }

    await deletePoll(pollId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting poll:", error)
    return NextResponse.json({ error: "Failed to delete poll" }, { status: 500 })
  }
}
