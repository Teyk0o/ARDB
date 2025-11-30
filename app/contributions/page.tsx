/**
 * My Contributions Page
 * Shows logged-in user's own contribution history
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getItemEditsByUser } from '@/lib/db/db';
import MyContributionsContent from '@/components/contributions/MyContributionsContent';

export default async function MyContributionsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/discord?returnTo=/contributions');
  }

  const edits = await getItemEditsByUser(session.userId);

  // Serialize dates for client component
  const serializedEdits = edits.map(edit => ({
    ...edit,
    created_at: edit.created_at.toISOString(),
    reviewed_at: edit.reviewed_at?.toISOString() || null,
  }));

  return <MyContributionsContent edits={serializedEdits} user={session} />;
}

export const dynamic = 'force-dynamic';
