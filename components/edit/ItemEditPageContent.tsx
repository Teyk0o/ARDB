'use client';

/**
 * Item Edit Page Content
 * Client component for editing items
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import type { SessionData } from '@/lib/auth';
import type { Quest, Project } from '@/lib/questsAndProjectsLoader';
import ItemEditForm from './ItemEditForm';
import { FaArrowLeft, FaEye } from 'react-icons/fa';
import Link from 'next/link';
import { generateSlug } from '@/lib/slugUtils';
import { getTranslation } from '@/lib/translations';

interface ItemEditPageContentProps {
  item: Item;
  language: Language;
  user: SessionData;
  allItems?: Item[];
  quests?: Quest[];
  projects?: Project[];
}

export default function ItemEditPageContent({
  item,
  language,
  user,
  allItems = [],
  quests = [],
  projects = [],
}: ItemEditPageContentProps) {
  const router = useRouter();
  const t = getTranslation(language);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (editedData: Item, reason?: string) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch('/api/edits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: item.id,
          editData: editedData,
          originalData: item,
          reason,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit edit');
      }

      // Redirect to success page or item page
      router.push(`/items/${generateSlug(item.nameEn || item.name)}?editSubmitted=true`);
    } catch (err) {
      console.error('Failed to submit edit:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit edit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-arc-blue">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/items/${generateSlug(item.nameEn || item.name)}`}
            className="inline-flex items-center gap-2 text-arc-yellow hover:text-arc-yellow/80 mb-4 cursor-pointer"
          >
            <FaArrowLeft />
            <span>{t.backToItem}</span>
          </Link>

          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            {t.editItem}: {item.name}
          </h1>
          <p className="text-arc-white/70">
            {t.proposeChanges}
          </p>

          {item.communityEdited && (
            <div className="mt-4 bg-arc-blue-light border border-arc-yellow/30 rounded-md p-4">
              <p className="text-arc-yellow text-sm">
                ⚠️ {t.communityEditedWarning}
              </p>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-500 rounded-md p-4">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Edit Form */}
        <ItemEditForm
          item={item}
          language={language}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          allItems={allItems}
          quests={quests}
          projects={projects}
        />
      </div>
    </div>
  );
}
