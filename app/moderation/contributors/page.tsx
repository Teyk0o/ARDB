/**
 * Top Contributors Page
 * Shows leaderboard of most active contributors (Moderators only)
 */

import { redirect } from 'next/navigation';
import { requireModerator } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import ContributorsContent from '@/components/moderation/ContributorsContent';

export default async function ContributorsPage() {
  const session = await requireModerator().catch(() => null);

  if (!session) {
    redirect('/');
  }

  // Get top contributors with their stats
  const result = await sql`
    SELECT
      u.id,
      u.discord_id,
      u.discord_username,
      u.discord_avatar,
      u.is_moderator,
      u.is_banned,
      u.ban_reason,
      u.banned_at,
      COUNT(e.id) as total_edits,
      COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_edits,
      COUNT(CASE WHEN e.status = 'pending' THEN 1 END) as pending_edits,
      COUNT(CASE WHEN e.status = 'rejected' THEN 1 END) as rejected_edits
    FROM users u
    LEFT JOIN item_edits e ON u.id = e.user_id
    GROUP BY u.id, u.discord_id, u.discord_username, u.discord_avatar, u.is_moderator, u.is_banned, u.ban_reason, u.banned_at
    HAVING COUNT(e.id) > 0
    ORDER BY total_edits DESC
    LIMIT 50
  `;

  return <ContributorsContent contributors={result.rows as never} user={session} />;
}

export const dynamic = 'force-dynamic';
