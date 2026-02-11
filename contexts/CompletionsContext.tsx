'use client';

/**
 * Completions Context Provider
 * Manages global state for user completions with hybrid storage (local + cloud)
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  getCompletions,
  setCompletions,
  addCompletion as addLocalCompletion,
  removeCompletion as removeLocalCompletion,
  clearCompletions as clearLocalCompletions,
  importCompletions,
  exportCompletions,
  getCompletionsCount,
  type CompletionsData,
} from '@/lib/storage/completionsStorage';

/**
 * Completions state with Sets for efficient lookups
 */
export interface CompletionsState {
  quests: Set<string>;
  projects: Set<string>;
  workshops: Set<string>;
  isLoading: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  isAuthenticated: boolean;
}

/**
 * Context value with state and actions
 */
interface CompletionsContextValue extends CompletionsState {
  addCompletion: (type: 'quests' | 'projects' | 'workshops', id: string) => Promise<void>;
  removeCompletion: (type: 'quests' | 'projects' | 'workshops', id: string) => Promise<void>;
  toggleCompletion: (type: 'quests' | 'projects' | 'workshops', id: string) => Promise<void>;
  isCompleted: (type: 'quests' | 'projects' | 'workshops', id: string) => boolean;
  getCompletionsByType: (type: 'quests' | 'projects' | 'workshops') => Set<string>;
  syncWithServer: () => Promise<void>;
  clearAll: () => Promise<void>;
  getStats: () => { quests: number; projects: number; workshops: number; total: number };
  exportData: () => CompletionsData;
  importData: (data: Partial<CompletionsData>, mode?: 'merge' | 'replace') => Promise<void>;
}

const CompletionsContext = createContext<CompletionsContextValue | undefined>(undefined);

/**
 * Props for CompletionsProvider
 */
interface CompletionsProviderProps {
  children: React.ReactNode;
  isAuthenticated?: boolean;
}

/**
 * Debounce utility
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function CompletionsProvider({ children, isAuthenticated = false }: CompletionsProviderProps) {
  const [state, setState] = useState<CompletionsState>({
    quests: new Set<string>(),
    projects: new Set<string>(),
    workshops: new Set<string>(),
    isLoading: true,
    isSyncing: false,
    lastSyncTime: null,
    isAuthenticated,
  });

  const syncQueueRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  /**
   * Load completions from local storage on mount
   */
  useEffect(() => {
    const loadCompletions = () => {
      const data = getCompletions();
      setState((prev) => ({
        ...prev,
        quests: new Set(data.quests),
        projects: new Set(data.projects),
        workshops: new Set(data.workshops),
        isLoading: false,
      }));
    };

    loadCompletions();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Sync with server when authenticated
   */
  const syncWithServer = useCallback(async () => {
    if (!state.isAuthenticated || state.isSyncing) {
      return;
    }

    setState((prev) => ({ ...prev, isSyncing: true }));

    try {
      const localData = exportCompletions();
      const response = await fetch('/api/completions/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(localData),
      });

      if (!response.ok) {
        throw new Error('Sync failed');
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Update local storage with server data (server is source of truth)
        importCompletions(result.data, 'replace');

        // Update state
        if (isMountedRef.current) {
          setState((prev) => ({
            ...prev,
            quests: new Set(result.data.quests),
            projects: new Set(result.data.projects),
            workshops: new Set(result.data.workshops),
            lastSyncTime: new Date(),
            isSyncing: false,
          }));
        }
      }
    } catch (error) {
      console.error('Error syncing with server:', error);
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, isSyncing: false }));
      }
    }
  }, [state.isAuthenticated, state.isSyncing]);

  /**
   * Sync on mount if authenticated
   */
  useEffect(() => {
    if (state.isAuthenticated && !state.isLoading) {
      syncWithServer();
    }
  }, [state.isAuthenticated, state.isLoading, syncWithServer]);

  /**
   * Update isAuthenticated when prop changes
   */
  useEffect(() => {
    setState((prev) => ({ ...prev, isAuthenticated }));
  }, [isAuthenticated]);

  /**
   * Debounced sync to server
   */
  const debouncedSync = useCallback(
    debounce(() => {
      if (state.isAuthenticated) {
        syncWithServer();
      }
    }, 2000),
    [state.isAuthenticated, syncWithServer]
  );

  /**
   * Add a completion
   */
  const addCompletion = useCallback(
    async (type: 'quests' | 'projects' | 'workshops', id: string) => {
      // Update local storage
      addLocalCompletion(type, id);

      // Update state
      setState((prev) => {
        const newSet = new Set(prev[type]);
        newSet.add(id);
        return { ...prev, [type]: newSet };
      });

      // Sync with server if authenticated (debounced)
      debouncedSync();
    },
    [debouncedSync]
  );

  /**
   * Remove a completion
   */
  const removeCompletion = useCallback(
    async (type: 'quests' | 'projects' | 'workshops', id: string) => {
      // Update local storage
      removeLocalCompletion(type, id);

      // Update state
      setState((prev) => {
        const newSet = new Set(prev[type]);
        newSet.delete(id);
        return { ...prev, [type]: newSet };
      });

      // Sync with server if authenticated (debounced)
      debouncedSync();
    },
    [debouncedSync]
  );

  /**
   * Toggle completion state
   */
  const toggleCompletion = useCallback(
    async (type: 'quests' | 'projects' | 'workshops', id: string) => {
      if (state[type].has(id)) {
        await removeCompletion(type, id);
      } else {
        await addCompletion(type, id);
      }
    },
    [state, addCompletion, removeCompletion]
  );

  /**
   * Check if completed
   */
  const isCompleted = useCallback(
    (type: 'quests' | 'projects' | 'workshops', id: string): boolean => {
      return state[type].has(id);
    },
    [state]
  );

  /**
   * Get completions by type
   */
  const getCompletionsByType = useCallback(
    (type: 'quests' | 'projects' | 'workshops'): Set<string> => {
      return state[type];
    },
    [state]
  );

  /**
   * Clear all completions
   */
  const clearAll = useCallback(async () => {
    // Clear local storage
    clearLocalCompletions();

    // Clear state
    setState((prev) => ({
      ...prev,
      quests: new Set(),
      projects: new Set(),
      workshops: new Set(),
    }));

    // If authenticated, also clear on server
    if (state.isAuthenticated) {
      try {
        await fetch('/api/completions/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quests: [], projects: [], workshops: [] }),
        });
      } catch (error) {
        console.error('Error clearing server completions:', error);
      }
    }
  }, [state.isAuthenticated]);

  /**
   * Get statistics
   */
  const getStats = useCallback(() => {
    return {
      quests: state.quests.size,
      projects: state.projects.size,
      workshops: state.workshops.size,
      total: state.quests.size + state.projects.size + state.workshops.size,
    };
  }, [state]);

  /**
   * Export completions data
   */
  const exportData = useCallback((): CompletionsData => {
    return exportCompletions();
  }, []);

  /**
   * Import completions data
   */
  const importData = useCallback(
    async (data: Partial<CompletionsData>, mode: 'merge' | 'replace' = 'merge') => {
      // Import to local storage
      importCompletions(data, mode);

      // Update state
      const newData = getCompletions();
      setState((prev) => ({
        ...prev,
        quests: new Set(newData.quests),
        projects: new Set(newData.projects),
        workshops: new Set(newData.workshops),
      }));

      // Sync with server
      if (state.isAuthenticated) {
        await syncWithServer();
      }
    },
    [state.isAuthenticated, syncWithServer]
  );

  const value: CompletionsContextValue = {
    ...state,
    addCompletion,
    removeCompletion,
    toggleCompletion,
    isCompleted,
    getCompletionsByType,
    syncWithServer,
    clearAll,
    getStats,
    exportData,
    importData,
  };

  return (
    <CompletionsContext.Provider value={value}>
      {children}
    </CompletionsContext.Provider>
  );
}

/**
 * Hook to use completions context
 * Returns null if used outside of provider (e.g., during SSR)
 */
export function useCompletions(): CompletionsContextValue | null {
  const context = useContext(CompletionsContext);
  if (context === undefined) {
    // Return null instead of throwing for better SSR compatibility
    return null;
  }
  return context;
}
