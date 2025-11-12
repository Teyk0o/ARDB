'use client';

import { useState, useEffect } from 'react';
import { translatePageTranslations, getTranslation } from '@/lib/translations';
import { Language } from '@/lib/translations';
import CustomSelect from '@/components/CustomSelect';

export default function TranslatePage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Get language from localStorage
    const saved = localStorage.getItem('arc-db-language') as Language;
    if (saved && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  const t = translatePageTranslations[language] || translatePageTranslations.en;
  const tMain = getTranslation(language);

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'pl', name: 'Polski' },
    { code: 'no', name: 'Norsk' },
    { code: 'da', name: 'Dansk' },
    { code: 'it', name: 'Italiano' },
    { code: 'ru', name: 'Русский' },
    { code: 'ja', name: '日本語' },
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'uk', name: 'Українська' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'kr', name: '한국어' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'hr', name: 'Hrvatski' },
    { code: 'sr', name: 'Српски' },
  ];

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
                {t.pageTitle}
              </h1>
              <p className="text-arc-white/70">
                {t.pageSubtitle}
              </p>
            </div>
            {/* Navigation Links */}
            <div className="flex items-center gap-4">
              <a
                href="/categories"
                className="text-arc-yellow hover:text-arc-yellow/80 font-medium transition-colors hidden sm:block"
              >
                {tMain.categories}
              </a>
              {/* Language Selector */}
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Info Section */}
          <section className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-4">{t.multiLanguageSupport}</h2>
            <p className="text-arc-white/80 mb-6">
              {t.multiLanguageText1}
            </p>
            <p className="text-arc-white/80 mb-6">
              {t.multiLanguageText2}
            </p>
          </section>

          {/* Supported Languages */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-6">{t.availableLanguages}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {supportedLanguages.map((lang) => (
                <div key={lang.code} className="bg-arc-blue border border-arc-blue-lighter rounded p-4">
                  <div className="font-bold text-arc-white">{lang.name}</div>
                  <div className="text-sm text-arc-yellow">{t.complete}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Data Source */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-arc-white mb-6">{t.dataSource}</h2>
            <div className="space-y-4">
              <p className="text-arc-white/70">
                {t.dataSourceText}
              </p>
              <a
                href="https://github.com/RaidTheory/arcraiders-data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-arc-blue border-2 border-arc-yellow hover:bg-arc-yellow hover:text-arc-blue text-arc-yellow font-bold py-2 px-4 rounded transition-colors"
              >
                {t.dataSourceLink}
              </a>
              <p className="text-arc-white/70 text-sm">
                {t.contributeTranslations}
              </p>
            </div>
          </section>

          {/* GitHub Contribution */}
          <section className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-8">
            <h2 className="text-2xl font-bold text-arc-white mb-6">{t.contributeProject}</h2>
            <p className="text-arc-white/70 mb-4">
              {t.contributeText}
            </p>
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-arc-blue border-2 border-arc-yellow hover:bg-arc-yellow hover:text-arc-blue text-arc-yellow font-bold py-2 px-4 rounded transition-colors"
            >
              {t.githubLink}
            </a>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/70 text-sm">
            <a href="/" className="text-arc-yellow hover:underline">
              {t.backToDatabase}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
