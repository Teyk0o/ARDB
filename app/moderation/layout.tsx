/**
 * Moderation Layout
 * Wraps all moderation pages with MainHeader
 */

'use client';

import { useState } from 'react';
import MainHeader from '@/components/MainHeader';
import { Language } from '@/lib/translations';

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <>
      <MainHeader language={language} setLanguage={setLanguage} hideLanguagePicker />
      {children}
    </>
  );
}
