'use client';

/**
 * Moderation Dashboard Content
 * Client component for moderation interface
 */

import { useState } from 'react';
import type { SessionData } from '@/lib/auth';
import { useEditPolling } from '@/hooks/useEditPolling';
import EditList from './EditList';
import EditStats from './EditStats';
import { FaSync, FaExclamationTriangle, FaUsers, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Link from 'next/link';

interface ModerationDashboardContentProps {
  user: SessionData;
}

export default function ModerationDashboardContent({ user }: ModerationDashboardContentProps) {
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');

  const { edits, loading, error, refetch } = useEditPolling({
    status: statusFilter === 'all' ? undefined : statusFilter,
    enabled: true,
    interval: 5000, // 5 seconds
  });

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Moderation Dashboard
              </h1>
              <p className="text-white/70">
                Review and manage community edit proposals
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: '#2d1f38',
                color: '#ffffff',
                border: '1px solid #2d1f38'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.borderColor = '#f1aa1c';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Auto-refreshing every 5 seconds</span>
          </div>
        </div>

        {/* Statistics */}
        <EditStats />

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid #2d1f38' }}>
            {[
              { value: 'pending' as const, label: 'Pending', Icon: FaHourglassHalf },
              { value: 'approved' as const, label: 'Approved', Icon: FaCheckCircle },
              { value: 'rejected' as const, label: 'Rejected', Icon: FaTimesCircle },
              { value: 'all' as const, label: 'All', Icon: FaClipboardList },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                style={{
                  color: statusFilter === tab.value ? '#f1aa1c' : 'rgba(255, 255, 255, 0.7)',
                  borderBottom: statusFilter === tab.value ? '2px solid #f1aa1c' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (statusFilter !== tab.value) {
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (statusFilter !== tab.value) {
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                  }
                }}
              >
                <tab.Icon />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 rounded-lg p-4" style={{ backgroundColor: 'rgba(153, 27, 27, 0.3)', border: '1px solid #ef4444' }}>
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Edit List */}
        <EditList edits={edits} loading={loading} onRefresh={refetch} />

        {/* Quick Links */}
        <div className="mt-8 rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
          <h3 className="font-bold mb-4 text-white text-lg">Quick Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/moderation/conflicts"
              className="p-4 rounded-lg transition-all cursor-pointer"
              style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
            >
              <p className="text-white font-medium mb-1 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-400" />
                Sync Conflicts
              </p>
              <p className="text-white/60 text-sm">
                Resolve conflicts between RaidTheory and community edits
              </p>
            </Link>

            <Link
              href="/moderation/contributors"
              className="p-4 rounded-lg transition-all cursor-pointer"
              style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
            >
              <p className="text-white font-medium mb-1 flex items-center gap-2">
                <FaUsers style={{ color: '#f1aa1c' }} />
                Top Contributors
              </p>
              <p className="text-white/60 text-sm">
                See who's contributing the most
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
