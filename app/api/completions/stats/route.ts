/**
 * GET /api/completions/stats - Get completion statistics
 */

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getUserCompletionsCount } from '@/lib/db/db';

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

    // Get completion counts
    const stats = await getUserCompletionsCount(session.userId);

    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    console.error('Error fetching completion stats:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
