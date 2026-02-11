/**
 * GET /api/completions - Get all user completions
 * POST /api/completions - Add a single completion
 * DELETE /api/completions - Remove a single completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getUserCompletions,
  addCompletion,
  removeCompletion,
  type UserCompletion,
} from '@/lib/db/db';

export async function GET() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user completions
    const completions = await getUserCompletions(session.userId);

    // Transform to client format
    const data = {
      quests: completions
        .filter((c) => c.completion_type === 'quest')
        .map((c) => c.completion_id),
      projects: completions
        .filter((c) => c.completion_type === 'project')
        .map((c) => c.completion_id),
      workshops: completions
        .filter((c) => c.completion_type === 'workshop')
        .map((c) => c.completion_id),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching completions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { completion_type, completion_id, metadata } = body;

    // Validate input
    if (!completion_type || !completion_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['quest', 'project', 'workshop'].includes(completion_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid completion_type' },
        { status: 400 }
      );
    }

    if (typeof completion_id !== 'string' || completion_id.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Invalid completion_id' },
        { status: 400 }
      );
    }

    // Add completion
    const completion = await addCompletion(
      session.userId,
      completion_type,
      completion_id,
      metadata
    );

    return NextResponse.json({ success: true, data: completion });
  } catch (error) {
    console.error('Error adding completion:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { completion_type, completion_id } = body;

    // Validate input
    if (!completion_type || !completion_id) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['quest', 'project', 'workshop'].includes(completion_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid completion_type' },
        { status: 400 }
      );
    }

    // Remove completion
    const success = await removeCompletion(
      session.userId,
      completion_type,
      completion_id
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Completion not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing completion:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
