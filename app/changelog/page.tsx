'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';
import { getTranslation, Language } from '@/lib/translations';

interface ChangelogEntry {
  date: string;
  timestamp: number;
  changes: {
    added: Array<{
      id: string;
      name: string;
      type: string;
      rarity: string;
    }>;
    modified: Array<{
      id: string;
      name: string;
      type: string;
      rarity: string;
      changes: string[];
    }>;
    removed: Array<{
      id: string;
      name: string;
      type: string;
      rarity: string;
    }>;
  };
  summary: string;
  totalItems: number;
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved) setLanguage(saved);
    }
  }, []);

  useEffect(() => {
    async function fetchChangelog() {
      try {
        const res = await fetch('/api/changelog?limit=50&days=90');
        const data = await res.json();
        if (data.success) {
          setEntries(data.entries);
        }
      } catch (error) {
        console.error('Error fetching changelog:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, []);

  const t = getTranslation(language);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'en' ? 'en-US' : language === 'fr' ? 'fr-FR' : 'de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/ARC_Raider_Stacked_White_Color.png"
                alt="Arc Raiders"
                className="h-24 md:h-28 w-auto"
              />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-arc-yellow hover:text-arc-yellow/80 font-medium transition-colors"
              >
                {t.home}
              </Link>
              <CustomSelect
                value={language}
                onChange={(value) => setLanguage(value as Language)}
                options={[
                  { value: 'en', label: '🇬🇧 English' },
                  { value: 'fr', label: '🇫🇷 Français' },
                  { value: 'de', label: '🇩🇪 Deutsch' },
                  { value: 'es', label: '🇪🇸 Español' },
                  { value: 'pt', label: '🇵🇹 Português' },
                  { value: 'pl', label: '🇵🇱 Polski' },
                  { value: 'no', label: '🇳🇴 Norsk' },
                  { value: 'da', label: '🇩🇰 Dansk' },
                  { value: 'it', label: '🇮🇹 Italiano' },
                  { value: 'ru', label: '🇷🇺 Русский' },
                  { value: 'ja', label: '🇯🇵 日本語' },
                  { value: 'zh-TW', label: '🇹🇼 繁體中文' },
                  { value: 'uk', label: '🇺🇦Українська' },
                  { value: 'zh-CN', label: '🇨🇳 简体中文' },
                  { value: 'kr', label: '🇰🇷 한국어' },
                  { value: 'tr', label: '🇹🇷 Türkçe' },
                  { value: 'hr', label: '🇭🇷 Hrvatski' },
                  { value: 'sr', label: '🇷🇸 Српски' },
                ]}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arc-yellow"></div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-arc-white mb-2">{t.noChangesYet}</h2>
            <p className="text-arc-white/60">{t.databaseUpdatedAutomatically}</p>
            <p className="text-arc-white/50 text-sm mt-4 italic">{t.changelogOnlyInEnglish}</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-arc-blue-light border border-arc-yellow/30 rounded-lg p-4 mb-6">
              <p className="text-arc-white/70 text-sm">{t.changelogOnlyInEnglish}</p>
            </div>
            {entries.map((entry) => (
              <div
                key={entry.timestamp}
                className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-6 hover:border-arc-yellow/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-arc-yellow">
                      {formatDate(entry.date)}
                    </h3>
                    <p className="text-arc-white/70 text-sm mt-1">{entry.summary}</p>
                  </div>
                  <div className="text-right text-sm text-arc-white/60">
                    <div>{entry.totalItems} items total</div>
                  </div>
                </div>

                {/* Changes Grid */}
                <div className="grid md:grid-cols-3 gap-4 mt-4">
                  {/* Added Items */}
                  {entry.changes.added.length > 0 && (
                    <div className="bg-arc-blue rounded-lg p-4 border border-green-500/30">
                      <h4 className="font-bold text-green-400 mb-2">
                        {t.added} ({entry.changes.added.length})
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {entry.changes.added.slice(0, 5).map((item) => (
                          <li key={item.id} className="text-arc-white/70 truncate" title={item.name}>
                            {item.name}
                          </li>
                        ))}
                        {entry.changes.added.length > 5 && (
                          <li className="text-arc-white/50 italic">
                            +{entry.changes.added.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Modified Items */}
                  {entry.changes.modified.length > 0 && (
                    <div className="bg-arc-blue rounded-lg p-4 border border-blue-500/30">
                      <h4 className="font-bold text-blue-400 mb-2">
                        {t.modified} ({entry.changes.modified.length})
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {entry.changes.modified.slice(0, 5).map((item) => (
                          <li key={item.id} className="text-arc-white/70 truncate" title={item.name}>
                            {item.name}
                          </li>
                        ))}
                        {entry.changes.modified.length > 5 && (
                          <li className="text-arc-white/50 italic">
                            +{entry.changes.modified.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Removed Items */}
                  {entry.changes.removed.length > 0 && (
                    <div className="bg-arc-blue rounded-lg p-4 border border-red-500/30">
                      <h4 className="font-bold text-red-400 mb-2">
                        {t.removed} ({entry.changes.removed.length})
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {entry.changes.removed.slice(0, 5).map((item) => (
                          <li key={item.id} className="text-arc-white/70 truncate" title={item.name}>
                            {item.name}
                          </li>
                        ))}
                        {entry.changes.removed.length > 5 && (
                          <li className="text-arc-white/50 italic">
                            +{entry.changes.removed.length - 5} more
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-20 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/50 text-sm">
            {t.updatesCheckedDaily}
          </p>
        </div>
      </footer>
    </div>
  );
}
