'use client';

/**
 * Auth Refresh Handler
 * Detects auth state changes and triggers user refetch
 */

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthRefreshHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if we just came back from auth callback
    const authRefresh = searchParams.get('authRefresh');

    if (authRefresh) {
      console.log('🔄 Auth refresh detected, dispatching event...');

      // Dispatch custom event to trigger auth refetch
      window.dispatchEvent(new Event('authRefresh'));

      // Clean up URL without page reload
      const url = new URL(window.location.href);
      url.searchParams.delete('authRefresh');
      window.history.replaceState({}, '', url.toString());

      console.log('✅ Auth refresh event dispatched, URL cleaned');
    }
  }, [searchParams]);

  return null; // This component doesn't render anything
}
