/**
 * User Profile Page
 * Shows user's contribution history and statistics
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getUserByDiscordId, getItemEditsByUser } from '@/lib/db/db';
import ProfilePageContent from '@/components/profile/ProfilePageContent';

interface PageProps {
  params: Promise<{ discordId: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const session = await getSession();
  const { discordId } = await params;

  // Check if viewing own profile or if moderator
  if (!session || (session.discordId !== discordId && !session.isModerator)) {
    redirect('/');
  }

  const user = await getUserByDiscordId(discordId);

  if (!user) {
    redirect('/');
  }

  const edits = await getItemEditsByUser(user.id);

  return <ProfilePageContent user={user} edits={edits} />;
}

export const dynamic = 'force-dynamic';
