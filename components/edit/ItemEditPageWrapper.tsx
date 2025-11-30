'use client';

/**
 * Item Edit Page Wrapper
 * Handles language detection from localStorage for edit page
 */

import { useState, useEffect } from 'react';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import type { SessionData } from '@/lib/auth';
import type { Quest, Project } from '@/lib/questsAndProjectsLoader';
import ItemEditPageContent from './ItemEditPageContent';

interface ItemEditPageWrapperProps {
  item: Item;
  language: Language;
  user: SessionData;
  allItems: Item[];
  quests: Quest[];
  projects: Project[];
}

export default function ItemEditPageWrapper({
  item: initialItem,
  language: initialLanguage,
  user,
  allItems: initialAllItems,
  quests,
  projects,
}: ItemEditPageWrapperProps) {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const [item, setItem] = useState<Item>(initialItem);
  const [allItems, setAllItems] = useState<Item[]>(initialAllItems);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load language from localStorage on mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('arc-db-language') as Language;
      if (savedLang && ['en', 'fr', 'es', 'de', 'zh-CN'].includes(savedLang)) {
        setLanguage(savedLang);
        // Always load items in the saved language to ensure proper translation
        loadItems(savedLang);
      }
    }
  }, []);

  const loadItems = async (lang: Language) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/items?lang=${lang}`);
      if (response.ok) {
        const data = await response.json();
        setAllItems(data);
        // Find the current item in the new language
        const translatedItem = data.find((i: Item) => i.id === initialItem.id);
        if (translatedItem) {
          setItem(translatedItem);
        }
      }
    } catch (error) {
      console.error('Error loading items in new language:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <ItemEditPageContent
      item={item}
      language={language}
      user={user}
      allItems={allItems}
      quests={quests}
      projects={projects}
    />
  );
}
