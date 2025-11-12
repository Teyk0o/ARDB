import { Item } from '@/types/item';

type Language = 'en' | 'fr' | 'de' | 'es' | 'pt' | 'pl' | 'no' | 'da' | 'it' | 'ru' | 'ja' | 'zh-TW' | 'uk' | 'zh-CN' | 'kr' | 'tr' | 'hr' | 'sr';

interface MultilingualField {
  [key: string]: string;
}

interface ExternalItem {
  id: string;
  name: MultilingualField;
  description: MultilingualField;
  type: string;
  rarity: string;
  value: number;
  [key: string]: any;
}

export function transformItems(externalItems: ExternalItem[], language: Language): Item[] {
  return externalItems.map((item) => ({
    ...item,
    id: item.id,
    name: getTranslation(item.name, language),
    description: getTranslation(item.description, language),
    item_type: item.type,
    icon: (item as any).imageFilename || (item as any).icon,
  }));
}

function getTranslation(field: MultilingualField | undefined, language: Language): string {
  if (!field || typeof field !== 'object') {
    return '';
  }

  // Try the requested language first
  if (field[language]) {
    return field[language];
  }

  // Fall back to English
  if (field.en) {
    return field.en;
  }

  // Return first available translation
  const firstKey = Object.keys(field)[0];
  return field[firstKey] || '';
}
