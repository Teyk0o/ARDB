/**
 * Discord OAuth callback endpoint
 * GET /api/auth/discord/callback
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  getDiscordUser,
  checkModeratorRole,
} from '@/lib/discord';
import {
  getUserByDiscordId,
  createUser,
  updateUser,
} from '@/lib/db/db';
import { createSession, setSessionCookie } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Discord OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/?error=discord_oauth_failed`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL(`/?error=missing_code`, request.url)
      );
    }

    // Decode state to get returnTo URL
    let returnTo = '/';
    if (state) {
      try {
        const stateData = JSON.parse(
          Buffer.from(state, 'base64url').toString()
        );
        returnTo = stateData.returnTo || '/';
      } catch (e) {
        console.warn('Failed to decode state:', e);
      }
    }

    // Exchange code for access token
    const tokenData = await exchangeCodeForToken(code);

    // Get Discord user information
    const discordUser = await getDiscordUser(tokenData.access_token);

    // Check if user has moderator role
    const isModerator = await checkModeratorRole(discordUser.id);

    // Check if user exists in database
    let user = await getUserByDiscordId(discordUser.id);

    if (user) {
      // Update existing user
      user = await updateUser(discordUser.id, {
        discord_username: discordUser.username,
        discord_avatar: discordUser.avatar || undefined,
        discord_discriminator: discordUser.discriminator,
        is_moderator: isModerator,
      });
    } else {
      // Create new user
      user = await createUser({
        discord_id: discordUser.id,
        discord_username: discordUser.username,
        discord_avatar: discordUser.avatar || undefined,
        discord_discriminator: discordUser.discriminator,
        is_moderator: isModerator,
      });
    }

    // Create session
    const sessionToken = await createSession(user);
    await setSessionCookie(sessionToken);

    // Redirect to return URL with cache-busting parameter
    // This ensures the client refetches user state
    const redirectUrl = new URL(returnTo, request.url);
    redirectUrl.searchParams.set('authRefresh', Date.now().toString());
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error('Discord OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(`/?error=auth_failed`, request.url)
    );
  }
}
