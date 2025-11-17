'use client';

import { useState, useEffect } from 'react';
import { Item } from '@/types/item';
import { Language } from '@/lib/translations';
import ItemDetailPageContent from './ItemDetailPageContent';

interface ItemDetailPageWrapperProps {
  item: Item;
  language: Language;
  allItems: Item[];
}

export default function ItemDetailPageWrapper({
  item: initialItem,
  language: initialLanguage,
  allItems: initialAllItems,
}: ItemDetailPageWrapperProps) {
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
      if (savedLang && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(savedLang)) {
        setLanguage(savedLang);
        // Load items in the saved language
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

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc-db-language', newLang);
    }
    loadItems(newLang);
  };

  if (!mounted) {
    return null;
  }

  return (
    <ItemDetailPageContent
      item={item}
      language={language}
      allItems={allItems}
      onLanguageChange={handleLanguageChange}
    />
  );
}
