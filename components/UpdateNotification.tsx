'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getTranslation, Language } from '@/lib/translations';

interface Notification {
  id: string;
  title: string;
  message: string;
  changes: {
    added: number;
    modified: number;
    removed: number;
  };
  summary: string;
  timestamp: string;
}

export default function UpdateNotification() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved) setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    // Check if there's a notification in localStorage (set by the API)
    const lastNotificationTime = localStorage.getItem('arc-db-last-notification-time');
    const today = new Date().toDateString();

    // Fetch the latest changelog entry
    async function checkForUpdates() {
      try {
        const res = await fetch('/api/changelog?limit=1');
        const data = await res.json();

        if (data.success && data.entries.length > 0) {
          const latestEntry = data.entries[0];
          const entryDate = new Date(latestEntry.date).toDateString();

          // Show notification only once per day
          if (
            entryDate === today &&
            lastNotificationTime !== today &&
            (latestEntry.changes.added.length > 0 ||
              latestEntry.changes.modified.length > 0 ||
              latestEntry.changes.removed.length > 0)
          ) {
            setNotification({
              id: `notif-${latestEntry.timestamp}`,
              title: latestEntry.summary,
              message: buildMessage(latestEntry.changes),
              changes: {
                added: latestEntry.changes.added.length,
                modified: latestEntry.changes.modified.length,
                removed: latestEntry.changes.removed.length,
              },
              summary: latestEntry.summary,
              timestamp: latestEntry.date,
            });

            localStorage.setItem('arc-db-last-notification-time', today);
          }
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    }

    checkForUpdates();
  }, []);

  if (!notification || dismissed) {
    return null;
  }

  const t = getTranslation(language);

  return (
    <div className="fixed bottom-4 right-4 max-w-sm z-50 animate-slide-up">
      <div className="bg-arc-blue-light border-2 border-arc-yellow rounded-lg p-4 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-arc-yellow mb-1">{t.databaseUpdated}</h3>
            <p className="text-arc-white/80 text-sm mb-3">{notification.message}</p>
            <Link
              href="/changelog"
              className="inline-block text-arc-yellow hover:text-arc-yellow/80 font-medium text-sm underline transition-colors"
            >
              {t.viewChangelog}
            </Link>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-arc-white/50 hover:text-arc-white transition-colors flex-shrink-0"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

function buildMessage(changes: any): string {
  const parts = [];

  if (changes.added.length > 0) {
    parts.push(`${changes.added.length} new`);
  }
  if (changes.modified.length > 0) {
    parts.push(`${changes.modified.length} updated`);
  }
  if (changes.removed.length > 0) {
    parts.push(`${changes.removed.length} removed`);
  }

  return parts.join(' • ');
}
