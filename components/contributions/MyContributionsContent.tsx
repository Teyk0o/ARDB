'use client';

/**
 * Contributions Content Component
 * Client component for displaying user's contributions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaEye, FaClock, FaCheck, FaTimes, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { formatDistanceToNow } from '@/lib/dateUtils';
import { detectLanguageClient } from '@/lib/languageDetection';
import { getTranslation, type Language } from '@/lib/translations';
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

export default function MyContributionsContent({ edits, user }: ContributionsContentProps) {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  // Language state with localStorage sync
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      return saved || detectLanguageClient();
    }
    return 'en';
  });

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arc-db-language' && e.newValue) {
        setLanguage(e.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const t = getTranslation(language);

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
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t.myContributions}
          </h1>
          <p className="text-white/70">
            {t.trackEditProposals}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
            <p className="text-3xl font-bold" style={{ color: '#f1aa1c' }}>{stats.total}</p>
            <p className="text-white/60 text-sm">{t.totalEdits}</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
            <p className="text-3xl font-bold text-yellow-400">{stats.pending}</p>
            <p className="text-white/60 text-sm">{t.pending}</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(34, 197, 94, 0.3)' }}>
            <p className="text-3xl font-bold text-green-400">{stats.approved}</p>
            <p className="text-white/60 text-sm">{t.approved}</p>
          </div>
          <div className="rounded-lg p-6 text-center" style={{ backgroundColor: '#1a1120', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <p className="text-3xl font-bold text-red-400">{stats.rejected}</p>
            <p className="text-white/60 text-sm">{t.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 overflow-x-auto" style={{ borderBottom: '1px solid #2d1f38' }}>
            {[
              { value: 'all' as const, label: t.all, Icon: FaClipboardList },
              { value: 'pending' as const, label: t.pending, Icon: FaHourglassHalf },
              { value: 'approved' as const, label: t.approved, Icon: FaCheckCircle },
              { value: 'rejected' as const, label: t.rejected, Icon: FaTimesCircle },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className="px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2"
                style={{
                  color: statusFilter === tab.value ? '#f1aa1c' : 'rgba(255, 255, 255, 0.7)',
                  borderBottom: statusFilter === tab.value ? '2px solid #f1aa1c' : '2px solid transparent'
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
          <div className="rounded-lg p-12 text-center" style={{ backgroundColor: '#1a1120', border: '2px dashed #2d1f38' }}>
            <p className="text-white/60 text-lg mb-2">{t.noContributionsFound}</p>
            <p className="text-white/40 text-sm">
              {t.startContributingByEditing}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEdits.map((edit) => {
              const itemName = getItemName(edit.edit_data);

              return (
                <div
                  key={edit.id}
                  className="rounded-lg p-6 transition-all hover:bg-white/5"
                  style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d1f38'}
                >
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
                      {t[edit.status as keyof typeof t] || edit.status}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 text-sm text-white/60 mb-3">
                    <span>{formatDistanceToNow(new Date(edit.created_at), language)}</span>
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
                      })()} {t.fieldsModified}
                    </span>
                  </div>

                  {/* Reason */}
                  {edit.reason && (
                    <p className="text-white/80 text-sm italic mb-4">
                      "{edit.reason}"
                    </p>
                  )}

                  {/* Action Button */}
                  <Link
                    href={`/moderation/edit/${edit.id}`}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
                    style={{ backgroundColor: '#2d1f38', color: '#ffffff' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
                  >
                    <FaEye />
                    {t.viewDetails}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
