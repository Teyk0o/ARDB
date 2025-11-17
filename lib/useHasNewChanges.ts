'use client';

import { useEffect, useState } from 'react';

export function useHasNewChanges() {
  const [hasNewChanges, setHasNewChanges] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkForChanges() {
      try {
        // Force cache bypass with timestamp
        const res = await fetch(`/api/changelog?limit=1&t=${Date.now()}`, {
          cache: 'no-store',
        });
        const data = await res.json();

        if (data.success && data.entries.length > 0) {
          const latestEntry = data.entries[0];
          const latestId = `${latestEntry.timestamp}-${latestEntry.changes.added.length}-${latestEntry.changes.modified.length}-${latestEntry.changes.removed.length}`;

          // Get the last viewed changelog ID
          const lastViewedId = localStorage.getItem('arc-db-last-viewed-changelog-id');

          // If IDs don't match, there are new changes
          if (lastViewedId !== latestId) {
            setHasNewChanges(true);
          } else {
            setHasNewChanges(false);
          }
        } else {
          setHasNewChanges(false);
        }
      } catch (error) {
        setHasNewChanges(false);
      } finally {
        setLoading(false);
      }
    }

    checkForChanges();

    // Check again every 30 seconds
    const interval = setInterval(checkForChanges, 30000);

    // Listen for storage changes (when viewed from another tab)
    const handleStorageChange = () => {
      checkForChanges();
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { hasNewChanges, loading };
}

export function markChangelogAsViewed() {
  // Fetch the latest changelog and save its ID
  fetch(`/api/changelog?limit=1&t=${Date.now()}`, {
    cache: 'no-store',
  })
    .then(res => res.json())
    .then(data => {
      if (data.success && data.entries.length > 0) {
        const latestEntry = data.entries[0];
        const latestId = `${latestEntry.timestamp}-${latestEntry.changes.added.length}-${latestEntry.changes.modified.length}-${latestEntry.changes.removed.length}`;
        localStorage.setItem('arc-db-last-viewed-changelog-id', latestId);
        // Dispatch event for other components to listen
        window.dispatchEvent(new Event('storage'));
      }
    })
    .catch(() => {});
}
