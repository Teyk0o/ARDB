'use client';

import { useState } from 'react';
import Link from 'next/link';
import LanguagePicker from '@/components/LanguagePicker';
import { getTranslation, Language } from '@/lib/translations';
import { useHasNewChanges, markChangelogAsViewed } from '@/lib/useHasNewChanges';
import { useAuth } from '@/hooks/useAuth';
import { useCompletions } from '@/contexts/CompletionsContext';
import DiscordLoginButton from '@/components/auth/DiscordLoginButton';
import UserMenu from '@/components/auth/UserMenu';
import { FaBars, FaTimes } from 'react-icons/fa';

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
  const completionsContext = useCompletions();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Get completions stats (with fallback)
  const completionsStats = completionsContext?.getStats() || { total: 0, quests: 0, projects: 0, workshops: 0 };

  return (
    <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
      <div className="relative z-10 container mx-auto px-4 py-3 md:py-6">
        {/* Top bar with logo and burger */}
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <img
              src="/ARC_Raider_Stacked_White_Color.png"
              alt="Arc Raiders"
              className="h-10 md:h-20 lg:h-24 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <nav className="flex items-center gap-4 lg:gap-6">
              <Link
                href="/"
                className="text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.itemsNav || 'Items'}
              </Link>
              <Link
                href="/categories"
                className="text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.categories}
              </Link>
              <Link
                href="/projects"
                className="text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.projects || 'Projects'}
              </Link>
              <Link
                href="/progress"
                className="inline-flex items-center gap-1.5 text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.myProgress || 'Progress'}
                {completionsStats.total > 0 && (
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: '#22c55e',
                      color: '#130918',
                    }}
                  >
                    {completionsStats.total}
                  </span>
                )}
              </Link>
              <Link
                href="/workshop-upgrades"
                className="text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.workshopUpgrades || 'Workshop'}
              </Link>
              <Link
                href="/changelog"
                onClick={() => markChangelogAsViewed()}
                className="inline-flex items-center gap-2 text-sm lg:text-base font-medium transition-colors cursor-pointer whitespace-nowrap"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {t.changelog || 'Changelog'}
                {hasNewChanges && (
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#f1aa1c' }}
                  />
                )}
              </Link>
            </nav>

            {!hideLanguagePicker && (
              <LanguagePicker language={language} setLanguage={setLanguage} />
            )}

            {!authLoading && (
              <div>
                {user ? (
                  <UserMenu user={user} language={language} />
                ) : (
                  <DiscordLoginButton returnTo="/" />
                )}
              </div>
            )}
          </div>

          {/* Mobile burger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-arc-yellow/20">
            <nav className="flex flex-col gap-3 mt-4">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-medium py-2 px-2 rounded transition-colors"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.itemsNav || 'Items'}
              </Link>
              <Link
                href="/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-medium py-2 px-2 rounded transition-colors"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.categories}
              </Link>
              <Link
                href="/projects"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-medium py-2 px-2 rounded transition-colors"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.projects || 'Projects'}
              </Link>
              <Link
                href="/progress"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-medium py-2 px-2 rounded transition-colors inline-flex items-center gap-2"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.myProgress || 'Progress'}
                {completionsStats.total > 0 && (
                  <span
                    className="text-xs font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: '#22c55e',
                      color: '#130918',
                    }}
                  >
                    {completionsStats.total}
                  </span>
                )}
              </Link>
              <Link
                href="/workshop-upgrades"
                onClick={() => setMobileMenuOpen(false)}
                className="text-white font-medium py-2 px-2 rounded transition-colors"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.workshopUpgrades || 'Workshop'}
              </Link>
              <Link
                href="/changelog"
                onClick={() => {
                  markChangelogAsViewed();
                  setMobileMenuOpen(false);
                }}
                className="text-white font-medium py-2 px-2 rounded transition-colors inline-flex items-center gap-2"
                style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)' }}
              >
                {t.changelog || 'Changelog'}
                {hasNewChanges && (
                  <span
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: '#f1aa1c' }}
                  />
                )}
              </Link>

              {!hideLanguagePicker && (
                <div className="pt-3 border-t border-arc-yellow/20">
                  <LanguagePicker language={language} setLanguage={setLanguage} />
                </div>
              )}

              {!authLoading && (
                <div className="pt-3 border-t border-arc-yellow/20">
                  {user ? (
                    <UserMenu user={user} language={language} />
                  ) : (
                    <DiscordLoginButton returnTo="/" className="w-full" />
                  )}
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
