/**
 * POST /api/completions/bulk - Bulk add completions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { bulkAddCompletions } from '@/lib/db/db';

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
    const { completions } = body;

    // Validate input
    if (!Array.isArray(completions)) {
      return NextResponse.json(
        { success: false, error: 'completions must be an array' },
        { status: 400 }
      );
    }

    // Validate each completion
    for (const completion of completions) {
      if (
        !completion.completion_type ||
        !completion.completion_id ||
        !['quest', 'project', 'workshop'].includes(completion.completion_type)
      ) {
        return NextResponse.json(
          { success: false, error: 'Invalid completion data' },
          { status: 400 }
        );
      }
    }

    // Bulk add
    const result = await bulkAddCompletions(session.userId, completions);

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error) {
    console.error('Error bulk adding completions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
