import { type NextRequest, NextResponse } from "next/server"
import { recordShare } from "@/lib/discussions-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    
    const userId = user?.id || "anonymous"
    const { id: discussionId } = await params
    const { shareType, platform } = await request.json()

    if (!shareType) {
      return NextResponse.json({ error: "Share type is required" }, { status: 400 })
    }

    await recordShare(userId, shareType, platform, discussionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error recording share:", error)
    return NextResponse.json({ error: "Failed to record share" }, { status: 500 })
  }
}
