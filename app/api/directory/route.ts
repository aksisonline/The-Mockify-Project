import { type NextRequest, NextResponse } from "next/server"
import { getPublicProfiles } from "@/lib/directory-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const filter = searchParams.get("filter") || undefined
    const page = Number.parseInt(searchParams.get("page") || "1")
    const pageSize = Number.parseInt(searchParams.get("pageSize") || "10")

    const { data, count } = await getPublicProfiles(search, filter, page, pageSize)

    return NextResponse.json({
      profiles: data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    })
  } catch (error) {
    console.error("Directory API error:", error)
    return NextResponse.json({ error: "Failed to fetch directory data" }, { status: 500 })
  }
}
