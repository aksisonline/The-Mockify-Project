import { NextResponse } from "next/server";
import { addEvent, deleteEvent } from "@/lib/admin-service";
import { NextRequest } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log("Adding event with data:", body);
    
    // Convert dates to ISO string format
    const eventData = {
      ...body,
      start_date: new Date(body.start_date).toISOString(),
      end_date: new Date(body.end_date).toISOString(),
    };
    
    // console.log("Processed event data:", eventData);
    const event = await addEvent(eventData);
    // console.log("Event added successfully:", event);
    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error adding event:", error);
    return NextResponse.json({ error: error?.message || "Failed to add event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }
    await deleteEvent(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete event" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createServiceRoleClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
} 