import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getDiscussionPoll } from "@/lib/discussions-service"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params before using its properties
    const { id: discussionId } = await params
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const poll = await getDiscussionPoll(discussionId)
    
    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 })
    }

    // Get user's votes if authenticated
    let userVotes: string[] = []
    if (user) {
      const { data: votes } = await supabase
        .from("discussion_poll_votes")
        .select("option_id")
        .eq("poll_id", poll.id)
        .eq("user_id", user.id)
      
      userVotes = votes?.map(v => v.option_id) || []
    }

    return NextResponse.json({ 
      poll: {
        ...poll,
        userVotes
      }
    })
  } catch (error) {
    console.error("Error fetching poll:", error)
    return NextResponse.json({ error: "Failed to fetch poll" }, { status: 500 })
  }
}
