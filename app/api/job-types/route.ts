import { NextResponse } from "next/server"
import { getJobTypes } from "@/lib/job-service-client"

export async function GET() {
  const jobTypes = getJobTypes()
  return NextResponse.json(jobTypes)
}
