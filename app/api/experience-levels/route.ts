import { NextResponse } from "next/server"
import { getExperienceLevels } from "@/lib/job-service-client"

export async function GET() {
  const experienceLevels = getExperienceLevels()
  return NextResponse.json(experienceLevels)
}
