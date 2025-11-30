/**
 * Sync Conflicts Page
 * Shows conflicts between RaidTheory data and community edits (Moderators only)
 */

import { redirect } from 'next/navigation';
import { requireModerator } from '@/lib/auth';
import { getUnresolvedConflicts } from '@/lib/db/db';
import ConflictsContent from '@/components/conflicts/ConflictsContent';

export default async function ConflictsPage() {
  const session = await requireModerator().catch(() => null);

  if (!session) {
    redirect('/');
  }

  const conflicts = await getUnresolvedConflicts();

  // Serialize dates for client component
  const serializedConflicts = conflicts.map(conflict => ({
    ...conflict,
    created_at: conflict.created_at.toISOString(),
    resolved_at: conflict.resolved_at?.toISOString() || null,
  }));

  return <ConflictsContent conflicts={serializedConflicts} user={session} />;
}

export const dynamic = 'force-dynamic';
