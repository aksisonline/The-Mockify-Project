import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { status } = await req.json()
  if (!['approved', 'rejected'].includes(status)) {
    return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
  }
  const { error } = await supabase
    .from('events')
    .update({ status })
    .eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  // Fetch the event to get requested_by and title
  const { data: event } = await supabase
    .from('events')
    .select('id, title, requested_by')
    .eq('id', id)
    .single()


  return NextResponse.json({ success: true })
} 