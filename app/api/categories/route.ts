import { NextResponse } from "next/server"
import { getCategories } from "@/lib/job-service-client"

export async function GET() {
  const categories = getCategories()
  return NextResponse.json(categories)
}
