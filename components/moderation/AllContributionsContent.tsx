'use client';

/**
 * All Contributions Content Component
 * Shows all user contributions for moderators
 */

import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaClock, FaCheck, FaTimes, FaSearch, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatDistanceToNow } from '@/lib/dateUtils';
import type { SessionData } from '@/lib/auth';

interface ItemEdit {
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
  discord_id: string | null;
  discord_username: string | null;
  discord_avatar: string | null;
  is_moderator: boolean | null;
}

interface AllContributionsContentProps {
  edits: ItemEdit[];
  user: SessionData;
}

export default function AllContributionsContent({ edits: initialEdits, user }: AllContributionsContentProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEdits = initialEdits.filter((edit) => {
    const matchesStatus = statusFilter === 'all' || edit.status === statusFilter;
    const matchesSearch =
      edit.item_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edit.discord_username?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: initialEdits.length,
    pending: initialEdits.filter((e) => e.status === 'pending').length,
    approved: initialEdits.filter((e) => e.status === 'approved').length,
    rejected: initialEdits.filter((e) => e.status === 'rejected').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <FaClock className="text-yellow-400" />;
      case 'approved':
        return <FaCheck className="text-green-400" />;
      case 'rejected':
        return <FaTimes className="text-red-400" />;
      default:
        return null;
    }
  };

  const getItemName = (editData: Record<string, unknown>) => {
    if (typeof editData.name === 'string') {
      return editData.name;
    }
    if (editData.nameTranslations && typeof editData.nameTranslations === 'object') {
      const translations = editData.nameTranslations as Record<string, string>;
      return translations.en || Object.values(translations)[0] || 'Unknown Item';
    }
    return 'Unknown Item';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            All Contributions
          </h1>
          <p className="text-white/70">
            Review all community contributions across all users
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
            <p className="text-3xl font-bold" style={{ color: '#f1aa1c' }}>{stats.total}</p>
            <p className="text-white/60 text-sm">Total Edits</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-white/60 text-sm">Pending</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
            <p className="text-white/60 text-sm">Approved</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-white/60 text-sm">Rejected</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative mb-4">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by item ID or username..."
              className="w-full rounded-lg pl-12 pr-4 py-3 text-white placeholder-white/40 focus:outline-none transition-all"
              style={{ backgroundColor: '#130918', border: '2px solid #2d1f38' }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid #2d1f38' }}>
            {[
              { value: 'all' as const, label: 'All', Icon: FaClipboardList },
              { value: 'pending' as const, label: 'Pending', Icon: FaHourglassHalf },
              { value: 'approved' as const, label: 'Approved', Icon: FaCheckCircle },
              { value: 'rejected' as const, label: 'Rejected', Icon: FaTimesCircle },
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

        {/* Edits List */}
        {filteredEdits.length === 0 ? (
          <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120' }}>
            <p className="text-white/60 text-lg mb-2">No contributions found</p>
            <p className="text-white/40 text-sm">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEdits.map((edit) => {
              const itemName = getItemName(edit.edit_data);
              const avatarUrl = edit.discord_avatar
                ? `https://cdn.discordapp.com/avatars/${edit.discord_id}/${edit.discord_avatar}.png?size=64`
                : edit.discord_id
                ? `https://cdn.discordapp.com/embed/avatars/${parseInt(edit.discord_id) % 5}.png`
                : null;

              return (
                <div
                  key={edit.id}
                  className="rounded-lg p-6 transition-all"
                  style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(241, 170, 28, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    {avatarUrl && (
                      <img
                        src={avatarUrl}
                        alt={edit.discord_username || 'User'}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-white font-bold text-lg mb-1">
                            {itemName}
                          </h3>
                          <p className="text-white/60 text-sm">
                            ID: {edit.item_id} • Edit #{edit.id}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                            edit.status === 'pending'
                              ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50'
                              : edit.status === 'approved'
                              ? 'bg-green-900/30 text-green-300 border border-green-500/50'
                              : 'bg-red-900/30 text-red-300 border border-red-500/50'
                          }`}
                        >
                          {getStatusIcon(edit.status)}
                          {edit.status.charAt(0).toUpperCase() + edit.status.slice(1)}
                        </span>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                        <span>
                          By{' '}
                          <strong className="text-white">
                            {edit.discord_username || 'Unknown'}
                          </strong>
                          {edit.is_moderator && (
                            <span
                              className="ml-2 px-2 py-0.5 rounded text-xs font-bold"
                              style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
                            >
                              MOD
                            </span>
                          )}
                        </span>
                        <span>•</span>
                        <span>{formatDistanceToNow(new Date(edit.created_at))}</span>
                        <span>•</span>
                        <span>
                          {(() => {
                            let changedCount = 0;
                            for (const key in edit.edit_data) {
                              if (JSON.stringify(edit.edit_data[key]) !== JSON.stringify(edit.original_data[key])) {
                                changedCount++;
                              }
                            }
                            return changedCount;
                          })()} field(s) modified
                        </span>
                      </div>

                      {/* Reason */}
                      {edit.reason && (
                        <p className="text-white/80 text-sm mb-4 italic">
                          "{edit.reason}"
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          href={`/moderation/edit/${edit.id}`}
                          className="flex items-center gap-2 px-4 py-2 font-bold rounded-lg transition-all text-sm cursor-pointer"
                          style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d99a19';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f1aa1c';
                          }}
                        >
                          <FaEye />
                          <span>Review</span>
                        </Link>
                      </div>
                    </div>
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
