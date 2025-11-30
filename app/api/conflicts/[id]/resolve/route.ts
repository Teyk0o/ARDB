/**
 * Resolve Sync Conflict Endpoint
 * POST /api/conflicts/:id/resolve
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireModerator } from '@/lib/auth';
import { sql } from '@vercel/postgres';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireModerator();
    const { id } = await params;
    const { resolution } = await request.json();

    if (!resolution || !['keep_community', 'keep_upstream'].includes(resolution)) {
      return NextResponse.json(
        { error: 'Invalid resolution type' },
        { status: 400 }
      );
    }

    // Get conflict details
    const conflict = await sql`
      SELECT * FROM sync_conflicts
      WHERE id = ${parseInt(id)} AND resolved = FALSE
    `;

    if (conflict.rows.length === 0) {
      return NextResponse.json(
        { error: 'Conflict not found or already resolved' },
        { status: 404 }
      );
    }

    if (resolution === 'keep_upstream') {
      // Remove community override to use upstream data
      await sql`
        DELETE FROM item_overrides
        WHERE item_id = ${conflict.rows[0].item_id}
      `;
    }
    // If keep_community, do nothing - the override stays in place

    // Mark conflict as resolved
    await sql`
      UPDATE sync_conflicts
      SET resolved = TRUE, resolved_at = NOW(), resolved_by = ${session.userId}
      WHERE id = ${parseInt(id)}
    `;

    return NextResponse.json({
      success: true,
      resolution,
    });
  } catch (error) {
    console.error('Resolve conflict error:', error);

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json(
        { error: 'Forbidden: Moderator role required' },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to resolve conflict' },
      { status: 500 }
    );
  }
}
