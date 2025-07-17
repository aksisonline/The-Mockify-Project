import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerClient();
    
    // Get session
    const { data: { user }, error: sessionError } = await supabase.auth.getUser();
    if (sessionError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin or moderator
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get request body
    const { is_pinned } = await request.json();
    const { id } = await params;

    // Update discussion pin status
    const { data, error } = await supabase
      .from('discussions')
      .update({ 
        is_pinned: is_pinned,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating discussion pin status:', error);
      return NextResponse.json({ error: 'Failed to update discussion' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      discussion: data,
      message: is_pinned ? 'Discussion pinned successfully' : 'Discussion unpinned successfully'
    });

  } catch (error) {
    console.error('Error in pin discussion API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 