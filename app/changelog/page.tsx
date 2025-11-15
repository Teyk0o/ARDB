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
  const [expandedEntries, setExpandedEntries] = useState<Set<number>>(new Set());

  const toggleExpandEntry = (timestamp: number) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(timestamp)) {
      newExpanded.delete(timestamp);
    } else {
      newExpanded.add(timestamp);
    }
    setExpandedEntries(newExpanded);
  };

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
      } finally {
        setLoading(false);
      }
    }

    fetchChangelog();
  }, []);

  const t = getTranslation(language);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const localeMap: { [key in Language]: string } = {
      'en': 'en-US',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'es': 'es-ES',
      'pt': 'pt-BR',
      'pl': 'pl-PL',
      'no': 'nb-NO',
      'da': 'da-DK',
      'it': 'it-IT',
      'ru': 'ru-RU',
      'ja': 'ja-JP',
      'zh-TW': 'zh-TW',
      'uk': 'uk-UA',
      'zh-CN': 'zh-CN',
      'kr': 'ko-KR',
      'tr': 'tr-TR',
      'hr': 'hr-HR',
      'sr': 'sr-RS',
    };

    const dateStr = date.toLocaleDateString(localeMap[language] || 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return `${dateStr} (${timeZone})`;
  };

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
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
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-arc-yellow mb-2">{t.changelog || 'Updates'}</h1>
            <p className="text-arc-white/70">{t.databaseUpdatedAutomatically}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
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
          <div className="max-w-4xl mx-auto">
            <div className="bg-arc-blue-light border border-arc-yellow/30 rounded-lg p-4 mb-8">
              <p className="text-arc-white/70 text-sm">{t.changelogOnlyInEnglish}</p>
            </div>
            <div className="space-y-6">
              {entries.map((entry) => (
                <div
                  key={entry.timestamp}
                  className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg overflow-hidden hover:border-arc-yellow/50 transition-all duration-300 hover:shadow-lg hover:shadow-arc-yellow/10"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-arc-blue-light to-arc-blue border-b border-arc-yellow/20 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-arc-yellow mb-2">
                          {formatDate(entry.date)}
                        </h3>
                        <p className="text-arc-white/70">{entry.summary}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div className="bg-arc-blue border border-arc-yellow/40 rounded-lg px-4 py-2">
                          <div className="text-arc-yellow font-bold text-lg">{entry.totalItems}</div>
                          <div className="text-arc-white/60 text-xs">items total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Added Items */}
                      {entry.changes.added.length > 0 && (
                        <div className="bg-arc-blue rounded-lg border-2 border-green-500/40 overflow-hidden hover:border-green-500/60 transition-colors">
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full bg-green-500/10 border-b border-green-500/20 px-4 py-3 hover:bg-green-500/15 transition-colors text-left"
                          >
                            <h4 className="font-bold text-green-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-400"></span>
                              {t.added}
                              <span className="bg-green-500/20 px-2 py-0.5 rounded text-xs ml-auto">{entry.changes.added.length}</span>
                              <span className="text-green-400/60 text-xs ml-2">{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.added.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((item) => (
                              <div
                                key={item.id}
                                className="text-arc-white/70 text-sm hover:text-arc-white hover:pl-2 transition-all truncate"
                                title={item.name}
                              >
                                + {item.name}
                              </div>
                            ))}
                            {entry.changes.added.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div className="text-arc-white/40 text-xs italic pt-2 border-t border-arc-blue-lighter cursor-pointer hover:text-arc-white/60 transition-colors">
                                +{entry.changes.added.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Modified Items */}
                      {entry.changes.modified.length > 0 && (
                        <div className="bg-arc-blue rounded-lg border-2 border-blue-500/40 overflow-hidden hover:border-blue-500/60 transition-colors">
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full bg-blue-500/10 border-b border-blue-500/20 px-4 py-3 hover:bg-blue-500/15 transition-colors text-left"
                          >
                            <h4 className="font-bold text-blue-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                              {t.modified}
                              <span className="bg-blue-500/20 px-2 py-0.5 rounded text-xs ml-auto">{entry.changes.modified.length}</span>
                              <span className="text-blue-400/60 text-xs ml-2">{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.modified.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((item) => (
                              <div
                                key={item.id}
                                className="text-arc-white/70 text-sm hover:text-arc-white hover:pl-2 transition-all truncate"
                                title={item.name}
                              >
                                ~ {item.name}
                              </div>
                            ))}
                            {entry.changes.modified.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div className="text-arc-white/40 text-xs italic pt-2 border-t border-arc-blue-lighter cursor-pointer hover:text-arc-white/60 transition-colors">
                                +{entry.changes.modified.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Removed Items */}
                      {entry.changes.removed.length > 0 && (
                        <div className="bg-arc-blue rounded-lg border-2 border-red-500/40 overflow-hidden hover:border-red-500/60 transition-colors">
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full bg-red-500/10 border-b border-red-500/20 px-4 py-3 hover:bg-red-500/15 transition-colors text-left"
                          >
                            <h4 className="font-bold text-red-400 flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-red-400"></span>
                              {t.removed}
                              <span className="bg-red-500/20 px-2 py-0.5 rounded text-xs ml-auto">{entry.changes.removed.length}</span>
                              <span className="text-red-400/60 text-xs ml-2">{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.removed.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((item) => (
                              <div
                                key={item.id}
                                className="text-arc-white/70 text-sm hover:text-arc-white hover:pl-2 transition-all truncate"
                                title={item.name}
                              >
                                - {item.name}
                              </div>
                            ))}
                            {entry.changes.removed.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div className="text-arc-white/40 text-xs italic pt-2 border-t border-arc-blue-lighter cursor-pointer hover:text-arc-white/60 transition-colors">
                                +{entry.changes.removed.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
