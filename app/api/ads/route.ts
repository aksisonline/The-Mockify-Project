import { NextResponse } from "next/server"
import { getActiveAdvertisements } from "@/lib/advertisements-service"

export async function GET() {
  try {
    const ads = await getActiveAdvertisements()
    return NextResponse.json(ads)
  } catch (error) {
    console.error("Error fetching ads:", error)
    return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 })
  }
} 