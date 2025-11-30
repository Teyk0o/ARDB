/**
 * Contributions Layout
 * Wraps contributions page with MainHeader
 */

'use client';

import { useState, useEffect } from 'react';
import MainHeader from '@/components/MainHeader';
import { Language } from '@/lib/translations';
import { detectLanguageClient } from '@/lib/languageDetection';

export default function ContributionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize language from localStorage
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      return saved || detectLanguageClient();
    }
    return 'en';
  });

  // Sync language to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc-db-language', language);
      // Trigger storage event for other components
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'arc-db-language',
        newValue: language,
      }));
    }
  }, [language]);

  // Listen for language changes from other components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arc-db-language' && e.newValue) {
        setLanguage(e.newValue as Language);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>
      <MainHeader language={language} setLanguage={setLanguage} />
      {children}
    </>
  );
}
