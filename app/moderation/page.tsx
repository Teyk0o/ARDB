/**
 * Moderation Dashboard Page
 * Moderators-only page for managing edit proposals
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import ModerationDashboardContent from '@/components/moderation/ModerationDashboardContent';

export default async function ModerationPage() {
  const session = await getSession();

  // Require authentication
  if (!session) {
    redirect('/api/auth/discord?returnTo=/moderation');
  }

  // Require moderator role
  if (!session.isModerator) {
    return (
      <div className="min-h-screen bg-arc-blue flex items-center justify-center p-4">
        <div className="bg-arc-blue-light border border-red-500 rounded-md p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-arc-white/80 mb-6">
            You need moderator privileges to access the moderation dashboard.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-arc-yellow text-arc-blue font-bold rounded-md hover:bg-arc-yellow/90 transition-colors"
          >
            Go Back Home
          </a>
        </div>
      </div>
    );
  }

  return <ModerationDashboardContent user={session} />;
}

export const dynamic = 'force-dynamic';
