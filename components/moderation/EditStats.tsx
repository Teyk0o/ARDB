'use client';

/**
 * Edit Statistics Component
 * Shows statistics about edit proposals
 */

import { useState, useEffect } from 'react';

interface EditStats {
  pending: number;
  approved: number;
  rejected: number;
}

export default function EditStats() {
  const [stats, setStats] = useState<EditStats>({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/edits?status=pending&limit=1000');
        const pendingData = await response.json();

        const approvedResponse = await fetch('/api/edits?status=approved&limit=1000');
        const approvedData = await approvedResponse.json();

        const rejectedResponse = await fetch('/api/edits?status=rejected&limit=1000');
        const rejectedData = await rejectedResponse.json();

        setStats({
          pending: pendingData.edits?.length || 0,
          approved: approvedData.edits?.length || 0,
          rejected: rejectedData.edits?.length || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);

    return () => clearInterval(interval);
  }, []);

  const total = stats.pending + stats.approved + stats.rejected;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
        <p className="text-white/60 text-sm mb-1">Total Edits</p>
        <p className="text-3xl font-bold text-white">
          {loading ? '...' : total}
        </p>
      </div>

      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(234, 179, 8, 0.5)' }}>
        <p className="text-white/60 text-sm mb-1">Pending Review</p>
        <p className="text-3xl font-bold text-yellow-400">
          {loading ? '...' : stats.pending}
        </p>
      </div>

      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(34, 197, 94, 0.5)' }}>
        <p className="text-white/60 text-sm mb-1">Approved</p>
        <p className="text-3xl font-bold text-green-400">
          {loading ? '...' : stats.approved}
        </p>
      </div>

      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(239, 68, 68, 0.5)' }}>
        <p className="text-white/60 text-sm mb-1">Rejected</p>
        <p className="text-3xl font-bold text-red-400">
          {loading ? '...' : stats.rejected}
        </p>
      </div>
    </div>
  );
}
