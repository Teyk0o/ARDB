/**
 * Discord OAuth initialization endpoint
 * GET /api/auth/discord
 */

import { NextResponse } from 'next/server';
import { getDiscordAuthUrl } from '@/lib/discord';
import { randomBytes } from 'crypto';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const returnTo = searchParams.get('returnTo') || '/';

    // Generate state for CSRF protection
    const state = randomBytes(32).toString('hex');

    // Store state and returnTo in a temporary way (could use Redis in production)
    // For now, we'll encode returnTo in the state
    const stateData = JSON.stringify({ state, returnTo });
    const encodedState = Buffer.from(stateData).toString('base64url');

    const authUrl = getDiscordAuthUrl(encodedState);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Discord OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Discord OAuth' },
      { status: 500 }
    );
  }
}
