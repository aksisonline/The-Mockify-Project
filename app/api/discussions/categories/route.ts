import { NextResponse } from "next/server"
import { getDiscussionCategories } from "@/lib/discussions-service"

export async function GET() {
  try {
    const categories = await getDiscussionCategories()
    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching discussion categories:", error)
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 })
  }
}
