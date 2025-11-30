'use client';

import Link from 'next/link';
import LanguagePicker from '@/components/LanguagePicker';
import { getTranslation, Language } from '@/lib/translations';
import { useHasNewChanges, markChangelogAsViewed } from '@/lib/useHasNewChanges';
import { useAuth } from '@/hooks/useAuth';
import DiscordLoginButton from '@/components/auth/DiscordLoginButton';
import UserMenu from '@/components/auth/UserMenu';

/**
 * MainHeader component
 * Main header with logo, full navigation menu, and language selector
 * Used across all pages for consistent navigation
 *
 * @param language - Current language
 * @param setLanguage - Function to update language
 * @param hideLanguagePicker - Optional: Hide the language picker (e.g., for moderation pages)
 */
interface MainHeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  hideLanguagePicker?: boolean;
}

export default function MainHeader({ language, setLanguage, hideLanguagePicker = false }: MainHeaderProps) {
  const t = getTranslation(language);
  const { hasNewChanges } = useHasNewChanges();
  const { user, loading: authLoading } = useAuth();

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
                className="text-sm sm:text-base font-medium transition-colors cursor-pointer"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.itemsNav || 'Items'}
              </Link>
              <Link
                href="/categories"
                className="text-sm sm:text-base font-medium transition-colors cursor-pointer"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.categories}
              </Link>
              <Link
                href="/projects"
                className="text-sm sm:text-base font-medium transition-colors cursor-pointer"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.projects || 'Projects'}
              </Link>
              <Link
                href="/workshop-upgrades"
                className="text-sm sm:text-base font-medium transition-colors cursor-pointer"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.workshopUpgrades || 'Workshop Upgrades'}
              </Link>
              <Link
                href="/changelog"
                onClick={() => markChangelogAsViewed()}
                className="inline-flex items-center gap-2 text-sm sm:text-base font-medium transition-colors cursor-pointer"
                title="View recent updates"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
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
            {!hideLanguagePicker && (
              <LanguagePicker language={language} setLanguage={setLanguage} />
            )}

            {/* Auth Section */}
            {!authLoading && (
              <div className="w-full sm:w-auto">
                {user ? (
                  <UserMenu user={user} language={language} />
                ) : (
                  <DiscordLoginButton returnTo="/" className="w-full sm:w-auto" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
