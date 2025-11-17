'use client';

import Link from 'next/link';
import CustomSelect from '@/components/CustomSelect';
import { getTranslation, Language } from '@/lib/translations';
import { useHasNewChanges, markChangelogAsViewed } from '@/lib/useHasNewChanges';

/**
 * MainHeader component
 * Main header with logo, full navigation menu, and language selector
 * Used across all pages for consistent navigation
 *
 * @param language - Current language
 * @param setLanguage - Function to update language
 */
interface MainHeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export default function MainHeader({ language, setLanguage }: MainHeaderProps) {
  const t = getTranslation(language);
  const { hasNewChanges } = useHasNewChanges();

  return (
    <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
      <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
        {/* Logo and Title - Full width on mobile */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-0">
          <div className="flex-shrink-0">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <img
                src="/ARC_Raider_Stacked_White_Color.png"
                alt="Arc Raiders"
                className="h-20 sm:h-24 md:h-28 w-auto mb-2"
              />
            </Link>
            <p className="text-base sm:text-lg md:text-xl text-arc-white/70 hidden sm:block">{t.subtitle}</p>
          </div>

          {/* Navigation - Stacked on mobile, horizontal on larger screens */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <Link
                href="/"
                className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
              >
                {t.itemsNav || 'Items'}
              </Link>
              <Link
                href="/categories"
                className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
              >
                {t.categories}
              </Link>
              <Link
                href="/projects"
                className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
              >
                {t.projects || 'Projects'}
              </Link>
              <Link
                href="/workshop-upgrades"
                className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
              >
                {t.workshopUpgrades || 'Workshop Upgrades'}
              </Link>
              <Link
                href="/changelog"
                onClick={() => markChangelogAsViewed()}
                className={`inline-flex items-center gap-2 text-sm sm:text-base font-medium transition-colors ${hasNewChanges ? '' : 'text-arc-white/70'}`}
                title="View recent updates"
                style={hasNewChanges ? { color: '#f1aa1c' } : {}}
              >
                {t.changelog || 'Changelog'}
                {hasNewChanges && (
                  <span
                    className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                    style={{ backgroundColor: '#f1aa1c', marginTop: '2px' }}
                  />
                )}
              </Link>
            </div>

            {/* Language Selector */}
            <div className="w-full sm:w-auto">
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
      </div>
    </header>
  );
}
