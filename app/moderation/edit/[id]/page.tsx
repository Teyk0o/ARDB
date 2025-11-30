/**
 * Edit Review Page
 * Moderators review and approve/reject individual edit proposals
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import EditReviewContent from '@/components/moderation/EditReviewContent';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditReviewPage({ params }: PageProps) {
  const session = await getSession();

  // Require authentication
  if (!session) {
    const { id } = await params;
    redirect(`/api/auth/discord?returnTo=/moderation/edit/${id}`);
  }

  // Require moderator role
  if (!session.isModerator) {
    return (
      <div className="min-h-screen bg-arc-blue flex items-center justify-center p-4">
        <div className="bg-arc-blue-light border border-red-500 rounded-md p-8 max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
          <p className="text-arc-white/80 mb-6">
            You need moderator privileges to review edit proposals.
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

  const { id } = await params;
  const editId = parseInt(id);

  if (isNaN(editId)) {
    redirect('/moderation');
  }

  return <EditReviewContent editId={editId} user={session} />;
}

export const dynamic = 'force-dynamic';
