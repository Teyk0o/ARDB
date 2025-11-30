'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import MainHeader from '@/components/MainHeader';
import { getTranslation, Language } from '@/lib/translations';

interface ChangelogEntry {
  date: string;
  timestamp: number;
  changes: {
    added: string[];
    modified: string[];
    removed: string[];
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
      'es': 'es-ES',
      'de': 'de-DE',
      'zh-CN': 'zh-CN',
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
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      {/* Header */}
      <MainHeader language={language} setLanguage={setLanguage} />

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#f1aa1c' }}></div>
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#ffffff' }}>{t.noChangesYet}</h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{t.databaseUpdatedAutomatically}</p>
            <p className="text-sm mt-4 italic" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>{t.changelogOnlyInEnglish}</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <div
              className="rounded-lg p-4 mb-8"
              style={{
                backgroundColor: '#1a1120',
                border: '1px solid rgba(241, 170, 28, 0.3)'
              }}
            >
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{t.changelogOnlyInEnglish}</p>
            </div>
            <div className="space-y-6">
              {[...entries].reverse().map((entry) => (
                <div
                  key={entry.timestamp}
                  className="rounded-lg overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: '#1a1120',
                    border: '1px solid #2d1f38'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(241, 170, 28, 0.5)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(241, 170, 28, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2d1f38';
                    e.currentTarget.style.boxShadow = '';
                  }}
                >
                  {/* Header */}
                  <div
                    className="p-6"
                    style={{
                      background: 'linear-gradient(to right, #1a1120, #130918)',
                      borderBottom: '1px solid rgba(241, 170, 28, 0.2)'
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: '#f1aa1c' }}>
                          {formatDate(entry.date)}
                        </h3>
                        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{entry.summary}</p>
                      </div>
                      <div className="text-right ml-4">
                        <div
                          className="rounded-lg px-4 py-2"
                          style={{
                            backgroundColor: '#130918',
                            border: '1px solid rgba(241, 170, 28, 0.4)'
                          }}
                        >
                          <div className="font-bold text-lg" style={{ color: '#f1aa1c' }}>{entry.totalItems}</div>
                          <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>items total</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Changes Grid */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Added Items */}
                      {entry.changes.added.length > 0 && (
                        <div
                          className="rounded-lg overflow-hidden transition-colors"
                          style={{
                            backgroundColor: '#130918',
                            border: '2px solid rgba(34, 197, 94, 0.4)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(34, 197, 94, 0.4)'}
                        >
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full px-4 py-3 transition-colors text-left cursor-pointer"
                            style={{
                              backgroundColor: 'rgba(34, 197, 94, 0.1)',
                              borderBottom: '1px solid rgba(34, 197, 94, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'}
                          >
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'rgb(74, 222, 128)' }}>
                              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(74, 222, 128)' }}></span>
                              {t.added}
                              <span className="px-2 py-0.5 rounded text-xs ml-auto" style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}>{entry.changes.added.length}</span>
                              <span className="text-xs ml-2 cursor-pointer" style={{ color: 'rgba(74, 222, 128, 0.6)' }}>{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.added.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((itemName, idx) => (
                              <div
                                key={idx}
                                className="text-sm hover:pl-2 transition-all truncate"
                                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                                title={itemName}
                              >
                                + {itemName}
                              </div>
                            ))}
                            {entry.changes.added.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div
                                className="text-xs italic pt-2 cursor-pointer transition-colors"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  borderTop: '1px solid #2d1f38'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                              >
                                +{entry.changes.added.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Modified Items */}
                      {entry.changes.modified.length > 0 && (
                        <div
                          className="rounded-lg overflow-hidden transition-colors"
                          style={{
                            backgroundColor: '#130918',
                            border: '2px solid rgba(59, 130, 246, 0.4)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'}
                        >
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full px-4 py-3 transition-colors text-left cursor-pointer"
                            style={{
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'}
                          >
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'rgb(96, 165, 250)' }}>
                              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(96, 165, 250)' }}></span>
                              {t.modified}
                              <span className="px-2 py-0.5 rounded text-xs ml-auto" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)' }}>{entry.changes.modified.length}</span>
                              <span className="text-xs ml-2 cursor-pointer" style={{ color: 'rgba(96, 165, 250, 0.6)' }}>{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.modified.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((itemName, idx) => (
                              <div
                                key={idx}
                                className="text-sm hover:pl-2 transition-all truncate"
                                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                                title={itemName}
                              >
                                ~ {itemName}
                              </div>
                            ))}
                            {entry.changes.modified.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div
                                className="text-xs italic pt-2 cursor-pointer transition-colors"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  borderTop: '1px solid #2d1f38'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                              >
                                +{entry.changes.modified.length - 5} more items
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Removed Items */}
                      {entry.changes.removed.length > 0 && (
                        <div
                          className="rounded-lg overflow-hidden transition-colors"
                          style={{
                            backgroundColor: '#130918',
                            border: '2px solid rgba(239, 68, 68, 0.4)'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)'}
                          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)'}
                        >
                          <button
                            onClick={() => toggleExpandEntry(entry.timestamp)}
                            className="w-full px-4 py-3 transition-colors text-left cursor-pointer"
                            style={{
                              backgroundColor: 'rgba(239, 68, 68, 0.1)',
                              borderBottom: '1px solid rgba(239, 68, 68, 0.2)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'}
                          >
                            <h4 className="font-bold flex items-center gap-2" style={{ color: 'rgb(248, 113, 113)' }}>
                              <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: 'rgb(248, 113, 113)' }}></span>
                              {t.removed}
                              <span className="px-2 py-0.5 rounded text-xs ml-auto" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}>{entry.changes.removed.length}</span>
                              <span className="text-xs ml-2 cursor-pointer" style={{ color: 'rgba(248, 113, 113, 0.6)' }}>{expandedEntries.has(entry.timestamp) ? '▼' : '▶'}</span>
                            </h4>
                          </button>
                          <div className={`p-4 space-y-2 ${expandedEntries.has(entry.timestamp) ? 'max-h-none' : 'max-h-48 overflow-y-auto'}`}>
                            {entry.changes.removed.slice(0, expandedEntries.has(entry.timestamp) ? undefined : 5).map((itemName, idx) => (
                              <div
                                key={idx}
                                className="text-sm hover:pl-2 transition-all truncate"
                                style={{ color: 'rgba(255, 255, 255, 0.7)' }}
                                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
                                title={itemName}
                              >
                                - {itemName}
                              </div>
                            ))}
                            {entry.changes.removed.length > 5 && !expandedEntries.has(entry.timestamp) && (
                              <div
                                className="text-xs italic pt-2 cursor-pointer transition-colors"
                                style={{
                                  color: 'rgba(255, 255, 255, 0.4)',
                                  borderTop: '1px solid #2d1f38'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)'}
                                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.4)'}
                              >
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
      <footer className="mt-20 py-8" style={{ borderTop: '1px solid #2d1f38' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm mb-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {t.updatesCheckedDaily}
          </p>
          {language === 'fr' && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Rejoignez l&apos;équipe francophone</span>
              <a
                href="https://discord.gg/54EQD8fpky"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm transition-colors cursor-pointer"
                style={{ color: '#f1aa1c' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                The Vanguard Protocol
              </a>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
