import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    // console.log('Report API: Starting request');
    
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // console.log('Report API: User authenticated:', user?.email);

    if (!user) {
      // console.log('Report API: Unauthorized - no user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { reason, description, discussionId, commentId } = body;

    // console.log('Report API: Request body:', { reason, description, discussionId, commentId });

    // Validate required fields
    if (!reason) {
      // console.log('Report API: Missing reason');
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      );
    }

    // Validate reason is one of the allowed values
    const allowedReasons = ['spam', 'harassment', 'inappropriate', 'misinformation', 'other'];
    if (!allowedReasons.includes(reason)) {
      // console.log('Report API: Invalid reason:', reason);
      return NextResponse.json(
        { error: 'Invalid reason' },
        { status: 400 }
      );
    }

    // At least one of discussionId or commentId must be provided
    if (!discussionId && !commentId) {
      // console.log('Report API: Missing both discussionId and commentId');
      return NextResponse.json(
        { error: 'Either discussionId or commentId is required' },
        { status: 400 }
      );
    }

    // console.log('Report API: Inserting report into database');

    // Insert the report
    const { error } = await supabase.from("discussion_reports").insert({
      reporter_id: user.id,
      discussion_id: discussionId || null,
      comment_id: commentId || null,
      reason,
      description: description?.trim() || null,
    });

    if (error) {
      console.error('Report API: Database error:', error);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    // console.log('Report API: Report created successfully');

    return NextResponse.json(
      { message: 'Report submitted successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Report API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 