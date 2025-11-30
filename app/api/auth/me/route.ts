/**
 * Get current user session
 * GET /api/auth/me
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { getUserById } from '@/lib/db/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionFromRequest(request);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Get full user data from database
    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Return user data (exclude sensitive fields if any)
    return NextResponse.json({
      user: {
        id: user.id,
        discordId: user.discord_id,
        discordUsername: user.discord_username,
        discordAvatar: user.discord_avatar,
        isModerator: user.is_moderator,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json(
      { error: 'Failed to get user session' },
      { status: 500 }
    );
  }
}
