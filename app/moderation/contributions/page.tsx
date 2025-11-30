/**
 * All Contributors Page (Moderators only)
 * Shows all user contributions for moderation
 */

import { redirect } from 'next/navigation';
import { requireModerator } from '@/lib/auth';
import { sql } from '@vercel/postgres';
import AllContributionsContent from '@/components/moderation/AllContributionsContent';

export default async function AllContributionsPage() {
  const session = await requireModerator().catch(() => null);

  if (!session) {
    redirect('/');
  }

  // Get all edits with user information
  const result = await sql`
    SELECT
      e.*,
      u.discord_id,
      u.discord_username,
      u.discord_avatar,
      u.is_moderator
    FROM item_edits e
    LEFT JOIN users u ON e.user_id = u.id
    ORDER BY e.created_at DESC
    LIMIT 100
  `;

  // Serialize dates for client component
  const serializedEdits = result.rows.map(row => ({
    ...row,
    created_at: new Date(row.created_at as string).toISOString(),
    reviewed_at: row.reviewed_at ? new Date(row.reviewed_at as string).toISOString() : null,
  }));

  return <AllContributionsContent edits={serializedEdits as never} user={session} />;
}

export const dynamic = 'force-dynamic';
