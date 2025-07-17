import { type NextRequest, NextResponse } from "next/server"
import toolsData from "@/data/tools.json"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await params for Next.js 15+
    const { id } = await params
    const toolId = id

    // Find the tool in the tools data
    const tool = toolsData.tools.find((tool) => tool.id === toolId)

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 })
    }

    return NextResponse.json(tool)
  } catch (error) {
    console.error("Error fetching tool:", error)
    return NextResponse.json({ error: "Failed to fetch tool" }, { status: 500 })
  }
}
