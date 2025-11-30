'use client';

/**
 * Translation Editor
 * Edits name and description in all 18 languages with accordion UI
 */

import { useState } from 'react';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧', priority: true },
  { code: 'fr', label: 'Français', flag: '🇫🇷', priority: false },
  { code: 'es', label: 'Español', flag: '🇪🇸', priority: false },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', priority: false },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳', priority: false },
];

interface TranslationEditorProps {
  item: Item;
  onChange: (item: Item) => void;
  language: Language;
}

export default function TranslationEditor({ item, onChange, language }: TranslationEditorProps) {
  const t = getTranslation(language);
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(
    new Set(['en']) // English expanded by default
  );

  const handleNameChange = (lang: string, value: string) => {
    onChange({
      ...item,
      nameTranslations: {
        ...item.nameTranslations,
        [lang]: value,
      },
    });
  };

  const handleDescriptionChange = (lang: string, value: string) => {
    onChange({
      ...item,
      descriptionTranslations: {
        ...item.descriptionTranslations,
        [lang]: value,
      },
    });
  };

  const toggleLanguage = (langCode: string) => {
    const newExpanded = new Set(expandedLanguages);
    if (newExpanded.has(langCode)) {
      newExpanded.delete(langCode);
    } else {
      newExpanded.add(langCode);
    }
    setExpandedLanguages(newExpanded);
  };

  const hasContent = (langCode: string) => {
    return (
      (item.nameTranslations?.[langCode] && item.nameTranslations[langCode].trim() !== '') ||
      (item.descriptionTranslations?.[langCode] && item.descriptionTranslations[langCode].trim() !== '')
    );
  };

  const priorityLanguages = LANGUAGES.filter(lang => lang.priority);
  const otherLanguages = LANGUAGES.filter(lang => !lang.priority);

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <p className="text-white text-sm">
          💡 <strong>Tip:</strong> {t.translationTip}
        </p>
      </div>

      {/* Priority Languages (always visible) */}
      <div className="space-y-4">
        {priorityLanguages.map((lang) => {
          const isExpanded = expandedLanguages.has(lang.code);
          const filled = hasContent(lang.code);

          return (
            <div
              key={lang.code}
              className="rounded-lg overflow-hidden transition-all"
              style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}
            >
              {/* Language header */}
              <button
                type="button"
                onClick={() => toggleLanguage(lang.code)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="text-white font-medium">{lang.label}</span>
                  {filled && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f1aa1c', color: '#130918' }}>
                      {t.filled}
                    </span>
                  )}
                </div>
                {isExpanded ? (
                  <FaChevronDown className="text-white/60" />
                ) : (
                  <FaChevronRight className="text-white/60" />
                )}
              </button>

              {/* Language content */}
              {isExpanded && (
                <div className="px-6 pb-6 space-y-4" style={{ borderTop: '1px solid #2d1f38' }}>
                  <div className="pt-4">
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      {t.itemName}
                    </label>
                    <input
                      type="text"
                      value={item.nameTranslations?.[lang.code] || ''}
                      onChange={(e) => handleNameChange(lang.code, e.target.value)}
                      placeholder={t.enterName.replace('{language}', lang.label)}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none transition-all"
                      style={{
                        backgroundColor: '#130918',
                        border: '2px solid #2d1f38'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                      onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                    />
                  </div>

                  <div>
                    <label className="block text-white/70 text-sm mb-2 font-medium">
                      {t.description}
                    </label>
                    <textarea
                      value={item.descriptionTranslations?.[lang.code] || ''}
                      onChange={(e) => handleDescriptionChange(lang.code, e.target.value)}
                      placeholder={t.enterDescription.replace('{language}', lang.label)}
                      rows={3}
                      className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none resize-y transition-all"
                      style={{
                        backgroundColor: '#130918',
                        border: '2px solid #2d1f38'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                      onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Other Languages */}
      <div>
        <h3 className="text-white/80 font-semibold mb-3 text-sm uppercase tracking-wide">
          {t.otherLanguages} ({otherLanguages.filter(l => hasContent(l.code)).length}/{otherLanguages.length} {t.filled.toLowerCase()})
        </h3>
        <div className="space-y-2">
          {otherLanguages.map((lang) => {
            const isExpanded = expandedLanguages.has(lang.code);
            const filled = hasContent(lang.code);

            return (
              <div
                key={lang.code}
                className="rounded-lg overflow-hidden transition-all"
                style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}
              >
                {/* Language header */}
                <button
                  type="button"
                  onClick={() => toggleLanguage(lang.code)}
                  className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-white text-sm">{lang.label}</span>
                    {filled && (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f1aa1c', color: '#130918' }}>
                        ✓
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <FaChevronDown className="text-white/60 text-sm" />
                  ) : (
                    <FaChevronRight className="text-white/60 text-sm" />
                  )}
                </button>

                {/* Language content */}
                {isExpanded && (
                  <div className="px-5 pb-4 space-y-3" style={{ borderTop: '1px solid #2d1f38' }}>
                    <div className="pt-3">
                      <label className="block text-white/70 text-xs mb-2 font-medium">
                        {t.itemName}
                      </label>
                      <input
                        type="text"
                        value={item.nameTranslations?.[lang.code] || ''}
                        onChange={(e) => handleNameChange(lang.code, e.target.value)}
                        placeholder={t.enterName.replace('{language}', lang.label)}
                        className="w-full px-3 py-2 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none transition-all"
                        style={{
                          backgroundColor: '#130918',
                          border: '2px solid #2d1f38'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                        onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                      />
                    </div>

                    <div>
                      <label className="block text-white/70 text-xs mb-2 font-medium">
                        {t.description}
                      </label>
                      <textarea
                        value={item.descriptionTranslations?.[lang.code] || ''}
                        onChange={(e) => handleDescriptionChange(lang.code, e.target.value)}
                        placeholder={t.enterDescription.replace('{language}', lang.label)}
                        rows={2}
                        className="w-full px-3 py-2 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none resize-y transition-all"
                        style={{
                          backgroundColor: '#130918',
                          border: '2px solid #2d1f38'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                        onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
