import { useState, useEffect } from 'react';
import { Item } from '@/types/item';

type Language = 'en' | 'fr';

export function useItems(language: Language) {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/items?lang=${language}`);
        if (!response.ok) throw new Error('Failed to load items');
        const data = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        console.error('Error loading items:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [language]);

  return {
    items,
    loading,
    error
  };
}
