import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { is_featured } = await req.json()
  if (typeof is_featured !== 'boolean') {
    return NextResponse.json({ success: false, error: 'Invalid is_featured value' }, { status: 400 })
  }
  const { error } = await supabase
    .from('events')
    .update({ is_featured })
    .eq('id', id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
} 