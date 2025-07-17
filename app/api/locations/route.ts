import { NextResponse } from "next/server"
import { getLocations } from "@/lib/job-service-client"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("query") || ""

  const locations = getLocations(query)
  return NextResponse.json(locations)
}
