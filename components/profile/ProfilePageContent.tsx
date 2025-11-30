'use client';

/**
 * Profile Page Content Component
 * Client component for displaying user profile with MainHeader
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaClock, FaCheck, FaTimes, FaArrowLeft } from 'react-icons/fa';
import MainHeader from '@/components/MainHeader';
import { Language, getTranslation } from '@/lib/translations';

interface User {
  id: number;
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  is_moderator: boolean;
}

interface ItemEdit {
  id: number;
  item_id: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface ProfilePageContentProps {
  user: User;
  edits: ItemEdit[];
}

export default function ProfilePageContent({ user, edits }: ProfilePageContentProps) {
  const [language, setLanguage] = useState<Language>(() => {
    // Load language from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved && ['en', 'fr', 'es', 'de', 'zh-CN'].includes(saved)) {
        return saved;
      }
    }
    return 'en';
  });

  const t = getTranslation(language);

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('arc-db-language', language);
    window.dispatchEvent(new Event('storage'));
  }, [language]);

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

  const getTranslatedStatus = (status: 'pending' | 'approved' | 'rejected'): string => {
    switch (status) {
      case 'pending':
        return t.pending;
      case 'approved':
        return t.approved;
      case 'rejected':
        return t.rejected;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      {/* Main Header */}
      <MainHeader language={language} setLanguage={setLanguage} />

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg font-medium transition-all cursor-pointer"
          style={{ backgroundColor: '#2d1f38', color: '#ffffff' }}
        >
          <FaArrowLeft />
          {t.backToHome}
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
          <div className="flex items-center gap-4">
            <img
              src={
                user.discord_avatar
                  ? `https://cdn.discordapp.com/avatars/${user.discord_id}/${user.discord_avatar}.png?size=128`
                  : `https://cdn.discordapp.com/embed/avatars/${parseInt(user.discord_id) % 5}.png`
              }
              alt={user.discord_username}
              className="w-20 h-20 rounded-full"
              style={{ border: '3px solid #f1aa1c' }}
            />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {user.discord_username}
              </h1>
              <p className="text-white/70 text-lg">
                {user.is_moderator ? `🛡️ ${t.moderator}` : `✨ ${t.contributor}`}
              </p>
            </div>
          </div>
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

        {/* Recent Edits */}
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
          <h2 className="text-2xl font-bold text-white mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
            {t.recentContributions}
          </h2>

          {edits.length === 0 ? (
            <div className="text-center py-12 rounded-lg" style={{ backgroundColor: '#130918', border: '2px dashed #2d1f38' }}>
              <p className="text-white/60 text-lg mb-2">{t.noContributions}</p>
              <p className="text-white/40 text-sm">{t.startContributing}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {edits.slice(0, 10).map((edit) => (
                <Link
                  key={edit.id}
                  href={`/moderation/edit/${edit.id}`}
                  className="flex items-center justify-between p-4 rounded-lg transition-all cursor-pointer hover:bg-white/5"
                  style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
                >
                  <div>
                    <p className="text-white font-medium">{t.editNumber}{edit.id}</p>
                    <p className="text-white/60 text-sm">{t.item} {edit.item_id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        edit.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/50'
                          : edit.status === 'approved'
                          ? 'bg-green-900/30 text-green-300 border border-green-500/50'
                          : 'bg-red-900/30 text-red-300 border border-red-500/50'
                      }`}
                    >
                      {getStatusIcon(edit.status)}
                      {getTranslatedStatus(edit.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
