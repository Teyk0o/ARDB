'use client';

/**
 * Edit Polling Hook
 * Polls for edit proposals at a regular interval
 */

import { useState, useEffect, useCallback } from 'react';

interface User {
  id: number;
  discordId: string;
  discordUsername: string;
  discordAvatar: string | null;
  isModerator: boolean;
}

interface EditProposal {
  id: number;
  item_id: string;
  user_id: number | null;
  status: 'pending' | 'approved' | 'rejected';
  edit_data: Record<string, unknown>;
  original_data: Record<string, unknown>;
  reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  user: User | null;
  reviewer: User | null;
}

interface UseEditPollingOptions {
  status?: 'pending' | 'approved' | 'rejected';
  itemId?: string;
  userId?: number;
  interval?: number; // in milliseconds
  enabled?: boolean;
}

interface UseEditPollingReturn {
  edits: EditProposal[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useEditPolling({
  status,
  itemId,
  userId,
  interval = 5000, // 5 seconds
  enabled = true,
}: UseEditPollingOptions = {}): UseEditPollingReturn {
  const [edits, setEdits] = useState<EditProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEdits = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (itemId) params.append('itemId', itemId);
      if (userId) params.append('userId', userId.toString());

      const response = await fetch(`/api/edits?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setEdits(data.edits);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch edits');
      }
    } catch (err) {
      console.error('Failed to fetch edits:', err);
      setError('Failed to fetch edits');
    } finally {
      setLoading(false);
    }
  }, [status, itemId, userId]);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    // Initial fetch
    fetchEdits();

    // Set up polling
    const timer = setInterval(fetchEdits, interval);

    return () => clearInterval(timer);
  }, [fetchEdits, interval, enabled]);

  return {
    edits,
    loading,
    error,
    refetch: fetchEdits,
  };
}
