'use client';

import Link from 'next/link';
import { FaDiscord } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { getTranslation, Language } from '@/lib/translations';

export default function DiscordButton() {
  const [bottomPosition, setBottomPosition] = useState('2rem');
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

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

  useEffect(() => {
    const checkBannerPosition = () => {
      const banner = document.querySelector('[data-contribution-banner]') as HTMLElement | null;
      if (banner) {
        const bannerRect = banner.getBoundingClientRect();
        // Si la banner est visible (en bas de l'écran), monter le bouton
        if (bannerRect.top < window.innerHeight && banner.style.display !== 'none') {
          const bannerHeight = bannerRect.height;
          const gap = 16; // 1rem
          setBottomPosition(`${bannerHeight + gap + 32}px`);
        } else {
          setBottomPosition('2rem');
        }
      } else {
        setBottomPosition('2rem');
      }
    };

    checkBannerPosition();
    window.addEventListener('resize', checkBannerPosition);
    window.addEventListener('scroll', checkBannerPosition);
    // Also check when localStorage changes (banner dismissed)
    window.addEventListener('storage', checkBannerPosition);

    return () => {
      window.removeEventListener('resize', checkBannerPosition);
      window.removeEventListener('scroll', checkBannerPosition);
      window.removeEventListener('storage', checkBannerPosition);
    };
  }, []);

  // Only show button if mounted and language is French
  if (!isMounted || language !== 'fr') {
    return null;
  }

  const t = getTranslation(language);
  const joinDiscordText = t.joinDiscord || 'Join Discord';
  const joinDiscordCommunity = t.joinDiscordCommunity || 'Join our Discord community';

  return (
    <Link
      href="https://discord.gg/arc-raiders-fr"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-8 z-40 flex items-center justify-center transition-all duration-300"
      style={{ bottom: bottomPosition }}
      title={joinDiscordCommunity}
    >
      <div className="relative group">
        {/* Bouton principal */}
        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 cursor-pointer" style={{ backgroundColor: '#f1aa1c' }}>
          {/* Icône Discord */}
          <FaDiscord className="w-8 h-8" style={{ color: '#130918' }} />
        </div>

        {/* Tooltip */}
        <div className="absolute right-full mr-3 bottom-1/2 translate-y-1/2 font-bold px-3 py-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: '#f1aa1c', color: '#130918' }}>
          {joinDiscordText}
          <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent" style={{ borderLeftColor: '#f1aa1c' }}></div>
        </div>
      </div>
    </Link>
  );
}
