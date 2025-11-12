import { Item } from '@/types/item';

type Language = 'en' | 'fr';

interface ItemTranslation {
  name: string;
  description: string;
}

let itemsCache: Item[] = [];
let translationsCache: Record<Language, Record<string, ItemTranslation>> = { en: {}, fr: {} };
let isLoaded = false;

export async function loadItems(): Promise<Item[]> {
  if (isLoaded) return itemsCache;

  try {
    // Load main items data (use original structure for now)
    const response = await fetch('/api/items');
    itemsCache = await response.json();
    isLoaded = true;
    return itemsCache;
  } catch (error) {
    console.error('Error loading items:', error);
    return [];
  }
}

export async function loadTranslations(language: Language): Promise<Record<string, ItemTranslation>> {
  if (translationsCache[language] && Object.keys(translationsCache[language]).length > 0) {
    return translationsCache[language];
  }

  try {
    const response = await fetch(`/data/translations/${language}/items.json`);
    translationsCache[language] = await response.json();
    return translationsCache[language];
  } catch (error) {
    console.error(`Error loading ${language} translations:`, error);
    return {};
  }
}

export function getItemWithTranslation(item: Item, language: Language, translations: Record<string, ItemTranslation>): Item {
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
}

export async function getItemsWithTranslation(language: Language): Promise<Item[]> {
  const items = await loadItems();
  const translations = await loadTranslations(language);

  return items.map(item => getItemWithTranslation(item, language, translations));
}
