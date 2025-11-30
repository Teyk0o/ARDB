/**
 * Edit proposals endpoints
 * GET /api/edits - List edit proposals
 * POST /api/edits - Create new edit proposal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  createItemEdit,
  getItemEdits,
  getUserById,
  checkUserCooldown,
} from '@/lib/db/db';
import { notifyNewEditProposal } from '@/lib/discord';
import { createHistoryEntry } from '@/lib/db/db';

/**
 * GET /api/edits
 * List edit proposals with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as
      | 'pending'
      | 'approved'
      | 'rejected'
      | null;
    const itemId = searchParams.get('itemId');
    const userId = searchParams.get('userId');
    const limit = searchParams.get('limit')
      ? parseInt(searchParams.get('limit')!)
      : 50;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!)
      : 0;

    const edits = await getItemEdits({
      status: status || undefined,
      item_id: itemId || undefined,
      user_id: userId ? parseInt(userId) : undefined,
      limit,
      offset,
    });

    // Get user information for each edit
    const editsWithUsers = await Promise.all(
      edits.map(async (edit) => {
        const user = edit.user_id ? await getUserById(edit.user_id) : null;
        const reviewer = edit.reviewed_by
          ? await getUserById(edit.reviewed_by)
          : null;

        return {
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
        };
      })
    );

    return NextResponse.json({
      edits: editsWithUsers,
      pagination: {
        limit,
        offset,
        total: editsWithUsers.length,
      },
    });
  } catch (error) {
    console.error('Get edits error:', error);
    return NextResponse.json(
      { error: 'Failed to get edit proposals' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/edits
 * Create new edit proposal
 */
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is banned
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_banned) {
      return NextResponse.json(
        {
          error: 'You are banned from making contributions',
          banReason: user.ban_reason,
          bannedAt: user.banned_at,
        },
        { status: 403 }
      );
    }

    // Check cooldown (moderators bypass cooldown)
    if (!user.is_moderator) {
      const cooldown = await checkUserCooldown(session.userId);
      if (!cooldown.canSubmit) {
        return NextResponse.json(
          {
            error: 'Please wait before submitting another edit',
            remainingTime: cooldown.remainingTime,
          },
          { status: 429 }
        );
      }
    }

    const body = await request.json();
    const { itemId, editData, originalData, reason } = body;

    // Validate request
    if (!itemId || !editData || !originalData) {
      return NextResponse.json(
        { error: 'Missing required fields: itemId, editData, originalData' },
        { status: 400 }
      );
    }

    // Create edit proposal
    const edit = await createItemEdit({
      item_id: itemId,
      user_id: session.userId,
      edit_data: editData,
      original_data: originalData,
      reason,
    });

    // If user is a moderator, auto-approve and apply the edit
    if (user.is_moderator) {
      const { updateItemEditStatus, createOrUpdateItemOverride } = await import('@/lib/db/db');

      // Approve the edit
      await updateItemEditStatus(edit.id, 'approved', session.userId);

      // Get all modified fields
      const modifiedFields: string[] = [];
      for (const key in editData) {
        if (JSON.stringify(editData[key]) !== JSON.stringify(originalData[key])) {
          modifiedFields.push(key);
        }
      }

      // Apply changes to item_overrides
      await createOrUpdateItemOverride({
        item_id: itemId,
        override_data: editData,
        modified_fields: modifiedFields,
        last_edit_id: edit.id,
      });

      // Create approval history entry
      await createHistoryEntry({
        item_id: itemId,
        edit_id: edit.id,
        user_id: session.userId,
        changes: {
          from: originalData,
          to: editData,
        },
        action: 'approve',
      });

      return NextResponse.json(
        {
          edit: { ...edit, status: 'approved' },
          message: 'Edit auto-approved and applied (moderator)',
        },
        { status: 201 }
      );
    }

    // For non-moderators, create normal edit proposal
    // Create history entry
    await createHistoryEntry({
      item_id: itemId,
      edit_id: edit.id,
      user_id: session.userId,
      changes: {
        from: originalData,
        to: editData,
      },
      action: 'create',
    });

    // Send Discord notification
    try {
      await notifyNewEditProposal({
        editId: edit.id,
        itemId,
        itemName: (editData as { name?: string }).name || itemId,
        username: session.discordUsername,
        reason,
      });
    } catch (webhookError) {
      console.error('Failed to send Discord notification:', webhookError);
      // Don't fail the request if webhook fails
    }

    return NextResponse.json({ edit }, { status: 201 });
  } catch (error) {
    console.error('Create edit error:', error);
    return NextResponse.json(
      { error: 'Failed to create edit proposal' },
      { status: 500 }
    );
  }
}
