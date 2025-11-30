/**
 * User ban management endpoints
 * POST /api/moderation/users/[userId]/ban - Ban user
 * DELETE /api/moderation/users/[userId]/ban - Unban user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { banUser, unbanUser, getUserById } from '@/lib/db/db';

/**
 * POST /api/moderation/users/[userId]/ban
 * Ban a user from making contributions
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Require moderator authentication
    const session = await getSessionFromRequest(request);
    if (!session || !session.isModerator) {
      return NextResponse.json(
        { error: 'Moderator access required' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const { reason } = body;

    // Check if user exists
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent banning moderators
    if (targetUser.is_moderator) {
      return NextResponse.json(
        { error: 'Cannot ban moderators' },
        { status: 403 }
      );
    }

    // Prevent banning yourself
    if (userId === session.userId) {
      return NextResponse.json(
        { error: 'Cannot ban yourself' },
        { status: 403 }
      );
    }

    // Ban the user
    const bannedUser = await banUser(userId, session.userId, reason);

    return NextResponse.json({
      success: true,
      user: {
        id: bannedUser.id,
        discordUsername: bannedUser.discord_username,
        isBanned: bannedUser.is_banned,
        banReason: bannedUser.ban_reason,
        bannedAt: bannedUser.banned_at,
      },
    });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/moderation/users/[userId]/ban
 * Unban a user
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Require moderator authentication
    const session = await getSessionFromRequest(request);
    if (!session || !session.isModerator) {
      return NextResponse.json(
        { error: 'Moderator access required' },
        { status: 403 }
      );
    }

    const userId = parseInt(params.userId);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Check if user exists
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Unban the user
    const unbannedUser = await unbanUser(userId);

    return NextResponse.json({
      success: true,
      user: {
        id: unbannedUser.id,
        discordUsername: unbannedUser.discord_username,
        isBanned: unbannedUser.is_banned,
      },
    });
  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}
