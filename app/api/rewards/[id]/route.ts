import { NextResponse } from "next/server"
import { getRewardById, updateReward, deleteReward } from "@/lib/rewards-service"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    const reward = await getRewardById(id)
    return NextResponse.json(reward)
  } catch (error) {
    console.error("Error fetching reward:", error)
    return NextResponse.json({ error: "Failed to fetch reward" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
    // Check if user is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // In a real app, you would check if the user has admin privileges
    // const isAdmin = await checkIfUserIsAdmin(session.user.id)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    const body = await request.json()
    // Access properties directly from body object

    // Update reward without destructuring
    const reward = await updateReward(id, {
      title: body.title,
      description: body.description,
      price: body.price !== undefined ? Number(body.price) : undefined,
      quantity: body.quantity !== undefined ? Number(body.quantity) : undefined,
      delivery_description: body.delivery_description,
      category: body.category,
      image_url: body.image_url,
      is_featured: body.is_featured,
      is_active: body.is_active,
    })

    return NextResponse.json({
      success: true,
      reward,
    })
  } catch (error) {
    console.error("Error updating reward:", error)
    return NextResponse.json({ error: "Failed to update reward" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    
    // Check if user is admin
    const supabase = await createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // In a real app, you would check if the user has admin privileges
    // const isAdmin = await checkIfUserIsAdmin(session.user.id)
    // if (!isAdmin) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    // }

    await deleteReward(id)

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting reward:", error)
    return NextResponse.json({ error: "Failed to delete reward" }, { status: 500 })
  }
}
