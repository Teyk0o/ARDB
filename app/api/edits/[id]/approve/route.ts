/**
 * Approve edit proposal endpoint
 * POST /api/edits/[id]/approve
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  getItemEditById,
  updateItemEditStatus,
  createOrUpdateItemOverride,
  createHistoryEntry,
  getItemOverride,
} from '@/lib/db/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/edits/[id]/approve
 * Approve an edit proposal (moderators only)
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

    // Only moderators can approve
    if (!session.isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const editId = parseInt(id);

    if (isNaN(editId)) {
      return NextResponse.json({ error: 'Invalid edit ID' }, { status: 400 });
    }

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

    // Update edit status to approved
    const approvedEdit = await updateItemEditStatus(
      editId,
      'approved',
      session.userId
    );

    // Extract modified fields
    const modifiedFields = Object.keys(edit.edit_data);

    // Get existing override to merge with new data
    const existingOverride = await getItemOverride(edit.item_id);

    // Merge existing override data with new edit data
    // This preserves fields like nameTranslations and descriptionTranslations
    const mergedOverrideData = existingOverride
      ? { ...existingOverride.override_data, ...edit.edit_data }
      : edit.edit_data;

    // Create or update item override
    await createOrUpdateItemOverride({
      item_id: edit.item_id,
      override_data: mergedOverrideData,
      modified_fields: modifiedFields,
      last_edit_id: editId,
    });

    // Create history entry
    await createHistoryEntry({
      item_id: edit.item_id,
      edit_id: editId,
      user_id: session.userId,
      changes: {
        from: edit.original_data,
        to: edit.edit_data,
        approved_by: session.discordUsername,
      },
      action: 'approve',
    });

    return NextResponse.json({
      success: true,
      edit: approvedEdit,
    });
  } catch (error) {
    console.error('Approve edit error:', error);
    return NextResponse.json(
      { error: 'Failed to approve edit proposal' },
      { status: 500 }
    );
  }
}
