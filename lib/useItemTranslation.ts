import { useState, useEffect } from 'react';
import { Item } from '@/types/item';

type Language = 'en' | 'fr';

interface ItemTranslation {
  name: string;
  description: string;
}

export function useItemTranslation(language: Language) {
  const [translations, setTranslations] = useState<Record<string, ItemTranslation>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/data/translations/${language}/items.json`);
        if (!response.ok) throw new Error(`Failed to load ${language} translations`);
        const data = await response.json();
        setTranslations(data);
        setError(null);
      } catch (err) {
        console.error(`Error loading ${language} translations:`, err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setTranslations({});
      } finally {
        setLoading(false);
      }
    };

    loadTranslations();
  }, [language]);

  const translateItem = (item: Item): Item => {
    if (language === 'en') {
      return item;
    }

    const translation = translations[item.id];
    if (translation) {
      return {
        ...item,
        name: translation.name,
        description: translation.description
      };
    }

    return item;
  };

  const translateItems = (items: Item[]): Item[] => {
    return items.map(translateItem);
  };

  return {
    translations,
    loading,
    error,
    translateItem,
    translateItems
  };
}
