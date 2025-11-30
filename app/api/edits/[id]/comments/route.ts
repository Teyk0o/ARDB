/**
 * Edit comments endpoints
 * GET /api/edits/[id]/comments - List comments
 * POST /api/edits/[id]/comments - Add comment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  getEditComments,
  createEditComment,
  getItemEditById,
  getUserById,
} from '@/lib/db/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/edits/[id]/comments
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

    const comments = await getEditComments(editId);

    // Get user information for each comment
    const commentsWithUsers = await Promise.all(
      comments.map(async (comment) => {
        const user = comment.user_id ? await getUserById(comment.user_id) : null;

        return {
          ...comment,
          user: user
            ? {
                id: user.id,
                discordUsername: user.discord_username,
                discordAvatar: user.discord_avatar,
                isModerator: user.is_moderator,
              }
            : null,
        };
      })
    );

    return NextResponse.json({ comments: commentsWithUsers });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/edits/[id]/comments
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

    const { id } = await context.params;
    const editId = parseInt(id);

    if (isNaN(editId)) {
      return NextResponse.json({ error: 'Invalid edit ID' }, { status: 400 });
    }

    const body = await request.json();
    const { comment } = body;

    if (!comment || comment.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment cannot be empty' },
        { status: 400 }
      );
    }

    // Check if edit exists
    const edit = await getItemEditById(editId);
    if (!edit) {
      return NextResponse.json({ error: 'Edit not found' }, { status: 404 });
    }

    // Create comment
    const newComment = await createEditComment({
      edit_id: editId,
      user_id: session.userId,
      comment: comment.trim(),
    });

    // Get user information
    const user = await getUserById(session.userId);

    return NextResponse.json({
      comment: {
        ...newComment,
        user: user
          ? {
              id: user.id,
              discordUsername: user.discord_username,
              discordAvatar: user.discord_avatar,
              isModerator: user.is_moderator,
            }
          : null,
      },
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
