import { type NextRequest, NextResponse } from "next/server"
import { voteDiscussion } from "@/lib/discussions-service"
import { createServerClient } from "@/lib/supabase/server"

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
    const { voteType } = await request.json()

    if (!voteType || !["up", "down"].includes(voteType)) {
      return NextResponse.json({ error: "Valid vote type is required" }, { status: 400 })
    }

    await voteDiscussion(discussionId, userId, voteType as "up" | "down")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error voting on discussion:", error)
    return NextResponse.json({ error: "Failed to vote on discussion" }, { status: 500 })
  }
}
