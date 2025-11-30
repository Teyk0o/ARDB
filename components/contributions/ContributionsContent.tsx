'use client';

/**
 * Contributions Content Component
 * Client component for displaying user's contributions
 */

import { useState } from 'react';
import Link from 'next/link';
import { FaEye, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
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
}

interface ContributionsContentProps {
  edits: ItemEdit[];
  user: SessionData;
}

export default function ContributionsContent({ edits, user }: ContributionsContentProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredEdits = statusFilter === 'all'
    ? edits
    : edits.filter((e) => e.status === statusFilter);

  const stats = {
    total: edits.length,
    pending: edits.filter((e) => e.status === 'pending').length,
    approved: edits.filter((e) => e.status === 'approved').length,
    rejected: edits.filter((e) => e.status === 'rejected').length,
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
    <div className="min-h-screen bg-arc-blue">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            My Contributions
          </h1>
          <p className="text-arc-white/70">
            Track your edit proposals and contribution history
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-arc-blue-light border border-arc-blue-lighter rounded-md p-6 text-center">
            <p className="text-3xl font-bold text-arc-yellow">{stats.total}</p>
            <p className="text-arc-white/60 text-sm">Total Edits</p>
          </div>
          <div className="bg-arc-blue-light border border-yellow-500/30 rounded-md p-6 text-center">
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-arc-white/60 text-sm">Pending</p>
          </div>
          <div className="bg-arc-blue-light border border-green-500/30 rounded-md p-6 text-center">
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
            <p className="text-arc-white/60 text-sm">Approved</p>
          </div>
          <div className="bg-arc-blue-light border border-red-500/30 rounded-md p-6 text-center">
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-arc-white/60 text-sm">Rejected</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-arc-blue-lighter overflow-x-auto">
            {[
              { value: 'all' as const, label: 'All', icon: '📋' },
              { value: 'pending' as const, label: 'Pending', icon: '⏳' },
              { value: 'approved' as const, label: 'Approved', icon: '✓' },
              { value: 'rejected' as const, label: 'Rejected', icon: '✗' },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`
                  px-4 py-3 font-medium transition-colors whitespace-nowrap cursor-pointer
                  ${
                    statusFilter === tab.value
                      ? 'text-arc-yellow border-b-2 border-arc-yellow'
                      : 'text-arc-white/70 hover:text-arc-white'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Edits List */}
        {filteredEdits.length === 0 ? (
          <div className="bg-arc-blue-light rounded-md p-12 text-center">
            <p className="text-arc-white/60 text-lg mb-2">No contributions found</p>
            <p className="text-arc-white/40 text-sm">
              Start contributing by editing items in the database!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEdits.map((edit) => {
              const itemName = getItemName(edit.edit_data);

              return (
                <div
                  key={edit.id}
                  className="bg-arc-blue-light border border-arc-blue-lighter rounded-md p-6 hover:border-arc-yellow/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-arc-white font-bold text-lg mb-1">
                        {itemName}
                      </h3>
                      <p className="text-arc-white/60 text-sm">
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

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-arc-white/60 mb-3">
                    <span>{formatDistanceToNow(new Date(edit.created_at))}</span>
                    <span>•</span>
                    <span>{Object.keys(edit.edit_data).length} field(s) modified</span>
                  </div>

                  {/* Reason */}
                  {edit.reason && (
                    <p className="text-arc-white/80 text-sm mb-4 italic">
                      "{edit.reason}"
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/moderation/edit/${edit.id}`}
                      className="flex items-center gap-2 px-4 py-2 bg-arc-yellow text-arc-blue font-bold rounded-md hover:bg-arc-yellow/90 transition-colors text-sm cursor-pointer"
                    >
                      <FaEye />
                      <span>View Details</span>
                    </Link>
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
