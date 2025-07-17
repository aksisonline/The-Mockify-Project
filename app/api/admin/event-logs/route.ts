import { NextResponse } from "next/server";
import { fetchAllEventLogs } from "@/lib/admin-service";

export async function GET() {
  try {
    const logs = await fetchAllEventLogs();
    return NextResponse.json(logs, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch event logs" }, { status: 500 });
  }
} 