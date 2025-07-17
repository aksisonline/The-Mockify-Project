import { NextResponse } from "next/server"
import { getCommonSkills } from "@/lib/job-service-client"

export async function GET() {
  const skills = getCommonSkills()
  return NextResponse.json(skills)
}
