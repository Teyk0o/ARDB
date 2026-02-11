'use client';

/**
 * Wrapper component to provide completions context with auth state
 */

import { CompletionsProvider } from '@/contexts/CompletionsContext';
import { useEffect, useState } from 'react';

export default function CompletionsWrapper({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        setIsAuthenticated(data.authenticated || false);
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Don't render until we know auth state to avoid hydration issues
  if (isLoading) {
    return <>{children}</>;
  }

  return (
    <CompletionsProvider isAuthenticated={isAuthenticated}>
      {children}
    </CompletionsProvider>
  );
}
