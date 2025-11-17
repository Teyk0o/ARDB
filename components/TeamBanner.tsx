'use client';

import { useState, useEffect } from 'react';
import { Language } from '@/lib/translations';

/**
 * TeamBanner component that displays a promotional banner for "The Vanguard Protocol" team
 * Only visible when the French language is selected
 */
export default function TeamBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    setIsMounted(true);

    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('team-banner-dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }

    // Get language from localStorage
    const savedLanguage = localStorage.getItem('arc-db-language') as Language;
    if (savedLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // Listen for language changes
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('arc-db-language') as Language;
      if (newLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(newLanguage)) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('team-banner-dismissed', 'true');
  };

  // Only show banner if mounted, visible, and language is French
  if (!isMounted || !isVisible || language !== 'fr') {
    return null;
  }

  return (
    <>
      <style jsx>{`
        @keyframes slideDown {
          from {
            transform: translateY(-100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(241, 170, 28, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(241, 170, 28, 0);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        [data-team-banner] {
          animation: slideDown 0.5s ease-out;
        }

        [data-discord-button] {
          animation: pulse-glow 3s ease-in-out infinite;
          background: linear-gradient(
            90deg,
            #130918 0%,
            #130918 40%,
            rgba(241, 170, 28, 0.3) 50%,
            #130918 60%,
            #130918 100%
          );
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite, pulse-glow 3s ease-in-out infinite;
        }

        [data-discord-button]:hover {
          animation: none;
        }
      `}</style>
      <div
        data-team-banner
        className="sticky top-0 left-0 right-0 shadow-lg z-50"
        style={{ backgroundColor: '#f1aa1c' }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="font-bold text-sm sm:text-base" style={{ color: '#130918' }}>
                The Vanguard Protocol – Équipe francophone
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'rgba(19, 9, 24, 0.8)' }}>
                Jouez en équipe, progressez ensemble • PVE, PVP, Loot • Structure organisée et mature
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <a
                data-discord-button
                href="https://discord.gg/54EQD8fpky"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold py-2 px-4 rounded transition-colors text-xs sm:text-sm whitespace-nowrap border-2"
                style={{
                  borderColor: '#130918',
                  color: '#f1aa1c'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.8)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#130918')}
              >
                Rejoindre Discord
              </a>
              <button
                onClick={handleDismiss}
                className="font-bold py-2 px-3 rounded transition-colors text-xs sm:text-sm border-2 cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#130918',
                  color: '#130918'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
                aria-label="Fermer la bannière"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
