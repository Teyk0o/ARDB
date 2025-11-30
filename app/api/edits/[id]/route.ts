/**
 * Single edit proposal endpoints
 * GET /api/edits/[id] - Get edit proposal by ID
 * PUT /api/edits/[id] - Update edit proposal (moderators can edit before approval)
 * DELETE /api/edits/[id] - Delete edit proposal (user own edits only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  getItemEditById,
  updateItemEditData,
  getUserById,
} from '@/lib/db/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/edits/[id]
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const editId = parseInt(id);

    if (isNaN(editId)) {
      return NextResponse.json({ error: 'Invalid edit ID' }, { status: 400 });
    }

    const edit = await getItemEditById(editId);

    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    // Get user information
    const user = edit.user_id ? await getUserById(edit.user_id) : null;
    const reviewer = edit.reviewed_by
      ? await getUserById(edit.reviewed_by)
      : null;

    return NextResponse.json({
      edit: {
        ...edit,
        user: user
          ? {
              id: user.id,
              discordId: user.discord_id,
              discordUsername: user.discord_username,
              discordAvatar: user.discord_avatar,
              isModerator: user.is_moderator,
            }
          : null,
        reviewer: reviewer
          ? {
              id: reviewer.id,
              discordId: reviewer.discord_id,
              discordUsername: reviewer.discord_username,
              discordAvatar: reviewer.discord_avatar,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Get edit error:', error);
    return NextResponse.json(
      { error: 'Failed to get edit proposal' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/edits/[id]
 * Update edit data (moderators only, before approval)
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only moderators can edit proposals
    if (!session.isModerator) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const editId = parseInt(id);

    if (isNaN(editId)) {
      return NextResponse.json({ error: 'Invalid edit ID' }, { status: 400 });
    }

    const body = await request.json();
    const { editData } = body;

    if (!editData) {
      return NextResponse.json(
        { error: 'Missing editData field' },
        { status: 400 }
      );
    }

    // Check if edit exists and is still pending
    const edit = await getItemEditById(editId);
    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    if (edit.status !== 'pending') {
      return NextResponse.json(
        { error: 'Can only edit pending proposals' },
        { status: 400 }
      );
    }

    // Update edit data
    const updatedEdit = await updateItemEditData(editId, editData);

    return NextResponse.json({ edit: updatedEdit });
  } catch (error) {
    console.error('Update edit error:', error);
    return NextResponse.json(
      { error: 'Failed to update edit proposal' },
      { status: 500 }
    );
  }
}
