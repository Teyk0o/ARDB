'use client';

/**
 * Authentication hook
 * Fetches and manages current user state
 */

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  isModerator: boolean;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/me', {
        credentials: 'include', // Ensure cookies are sent
        cache: 'no-store', // Don't cache auth requests
      });
      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
      } else {
        setError(data.error || 'Failed to fetch user');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      setError('Failed to fetch user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    // Listen for auth refresh events (after login/logout)
    const handleAuthRefresh = () => {
      console.log('Auth refresh event triggered');
      fetchUser();
    };

    window.addEventListener('authRefresh', handleAuthRefresh);

    return () => {
      window.removeEventListener('authRefresh', handleAuthRefresh);
    };
  }, [fetchUser]);

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
  };
}
