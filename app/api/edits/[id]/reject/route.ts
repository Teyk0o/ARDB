/**
 * Reject edit proposal endpoint
 * POST /api/edits/[id]/reject
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  getItemEditById,
  updateItemEditStatus,
  createHistoryEntry,
  createEditComment,
} from '@/lib/db/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/edits/[id]/reject
 * Reject an edit proposal (moderators only)
 */
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only moderators can reject
    if (!session.isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const editId = parseInt(id);

    if (isNaN(editId)) {
      return NextResponse.json({ error: 'Invalid edit ID' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // Get edit proposal
    const edit = await getItemEditById(editId);
    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    // Check if already reviewed
    if (edit.status !== 'pending') {
      return NextResponse.json(
        { error: 'Edit already reviewed' },
        { status: 400 }
      );
    }

    // Update edit status to rejected
    const rejectedEdit = await updateItemEditStatus(
      editId,
      'rejected',
      session.userId
    );

    // Add rejection reason as comment if provided
    if (reason) {
      await createEditComment({
        edit_id: editId,
        user_id: session.userId,
        comment: `**Rejection reason:** ${reason}`,
      });
    }

    // Create history entry
    await createHistoryEntry({
      item_id: edit.item_id,
      edit_id: editId,
      user_id: session.userId,
      changes: {
        rejected_by: session.discordUsername,
        reason: reason || null,
      },
      action: 'reject',
    });

    return NextResponse.json({
      success: true,
      edit: rejectedEdit,
    });
  } catch (error) {
    console.error('Reject edit error:', error);
    return NextResponse.json(
      { error: 'Failed to reject edit proposal' },
      { status: 500 }
    );
  }
}
