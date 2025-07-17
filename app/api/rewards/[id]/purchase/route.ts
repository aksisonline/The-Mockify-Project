import { NextResponse } from "next/server"
import { purchaseReward } from "@/lib/rewards-service"
import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
    // Check if user is authenticated
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { quantity = 1 } = body

    // Validate quantity
    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    // Purchase the reward
    try {
      const result = await purchaseReward(id, quantity, user.id)
      return NextResponse.json(result)
    } catch (error: any) {
      console.error("Error purchasing reward:", error)
      return NextResponse.json({ error: error.message || "Failed to purchase reward" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in reward purchase API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
