'use client';

/**
 * Conflicts Content Component
 * Shows sync conflicts between RaidTheory and community edits
 */

import { useState } from 'react';
import { FaExclamationTriangle, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import { formatDate } from '@/lib/dateUtils';
import type { SessionData } from '@/lib/auth';
import Link from 'next/link';

interface SyncConflict {
  id: number;
  item_id: string;
  conflict_data: Record<string, unknown>;
  resolved: boolean;
  created_at: string;
  resolved_at: string | null;
  resolved_by: number | null;
}

interface ConflictsContentProps {
  conflicts: SyncConflict[];
  user: SessionData;
}

export default function ConflictsContent({ conflicts: initialConflicts, user }: ConflictsContentProps) {
  const [conflicts, setConflicts] = useState(initialConflicts);
  const [resolving, setResolving] = useState<number | null>(null);

  const handleResolve = async (conflictId: number, resolution: 'keep_community' | 'keep_upstream') => {
    try {
      setResolving(conflictId);

      const response = await fetch(`/api/conflicts/${conflictId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resolution }),
      });

      if (!response.ok) {
        throw new Error('Failed to resolve conflict');
      }

      // Remove resolved conflict from list
      setConflicts(conflicts.filter((c) => c.id !== conflictId));
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      alert('Failed to resolve conflict');
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className="min-h-screen bg-arc-blue">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/moderation"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
          style={{ backgroundColor: '#2d1f38', color: '#ffffff' }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
        >
          <FaArrowLeft />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            Sync Conflicts
          </h1>
          <p className="text-arc-white/70">
            Resolve conflicts between RaidTheory data and community edits
          </p>
        </div>

        {/* Statistics */}
        <div className="bg-arc-blue-light border border-red-500/30 rounded-md p-6 mb-8">
          <div className="flex items-center gap-3">
            <FaExclamationTriangle className="text-red-400 text-3xl" />
            <div>
              <p className="text-2xl font-bold text-red-400">{conflicts.length}</p>
              <p className="text-arc-white/60 text-sm">Unresolved Conflicts</p>
            </div>
          </div>
        </div>

        {/* Conflicts List */}
        {conflicts.length === 0 ? (
          <div className="bg-arc-blue-light rounded-md p-12 text-center">
            <FaCheck className="text-green-400 text-5xl mx-auto mb-4" />
            <p className="text-arc-white text-lg mb-2">All Clear!</p>
            <p className="text-arc-white/60">
              No sync conflicts detected. Community edits are in sync with RaidTheory data.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conflicts.map((conflict) => {
              const conflictData = conflict.conflict_data;
              const itemId = conflict.item_id;

              return (
                <div
                  key={conflict.id}
                  className="bg-arc-blue-light border-2 border-red-500/50 rounded-md p-6"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-arc-white font-bold text-lg mb-1">
                        Item Conflict: {itemId}
                      </h3>
                      <p className="text-arc-white/60 text-sm">
                        Detected: {formatDate(new Date(conflict.created_at))}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-500/50 text-sm font-medium">
                      <FaExclamationTriangle />
                      Unresolved
                    </span>
                  </div>

                  {/* Conflict Details */}
                  <div className="mb-6">
                    <h4 className="text-arc-white font-bold mb-3">Conflicting Fields:</h4>
                    <div className="bg-arc-blue border border-arc-blue-lighter rounded-md p-4">
                      <pre className="text-arc-white/80 text-sm overflow-x-auto">
                        {JSON.stringify(conflictData, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {/* Resolution Actions */}
                  <div className="border-t border-arc-blue-lighter pt-4">
                    <p className="text-arc-white font-medium mb-3">
                      Choose which version to keep:
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleResolve(conflict.id, 'keep_community')}
                        disabled={resolving !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <FaCheck />
                        <span>{resolving === conflict.id ? 'Resolving...' : 'Keep Community Edit'}</span>
                      </button>

                      <button
                        onClick={() => handleResolve(conflict.id, 'keep_upstream')}
                        disabled={resolving !== null}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-arc-yellow hover:bg-arc-yellow/90 text-arc-blue font-bold rounded-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
                      >
                        <FaTimes />
                        <span>{resolving === conflict.id ? 'Resolving...' : 'Use RaidTheory Data'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="mt-4 bg-arc-yellow/10 border border-arc-yellow/30 rounded-md p-4">
                    <p className="text-arc-yellow text-sm">
                      <strong>Keep Community Edit:</strong> Preserves the community-contributed data.
                      <br />
                      <strong>Use RaidTheory Data:</strong> Overwrites with the latest official data and removes the community edit.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
