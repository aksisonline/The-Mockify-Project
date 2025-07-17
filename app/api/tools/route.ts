import { NextResponse } from "next/server"
import { getAllTools, getToolById, getToolsByCategory } from "@/lib/tools"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const category = searchParams.get("category")
  const premium = searchParams.get("premium")

  try {
    if (id) {
      const tool = await getToolById(id)
      if (!tool) {
        return NextResponse.json({ error: "Tool not found" }, { status: 404 })
      }
      return NextResponse.json(tool)
    }

    if (category) {
      const tools = await getToolsByCategory(category)
      // Apply premium filter if specified
      if (premium !== null) {
        const isPremium = premium === "true"
        return NextResponse.json(tools.filter(tool => tool.isPremium === isPremium))
      }
      return NextResponse.json(tools)
    }

    const tools = await getAllTools()
    // Apply premium filter if specified
    if (premium !== null) {
      const isPremium = premium === "true"
      return NextResponse.json(tools.filter(tool => tool.isPremium === isPremium))
    }
    return NextResponse.json(tools)
  } catch (error) {
    console.error("Error fetching tools:", error)
    return NextResponse.json({ error: "Failed to fetch tools" }, { status: 500 })
  }
}
