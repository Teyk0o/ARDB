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
  return externalItems.map((item) => transformItem(item, language));
}

function transformItem(item: ExternalItem, language: Language): Item {
  const transformed: any = {
    id: item.id,
    name: getTranslation(item.name, language),
    description: getTranslation(item.description, language),
    item_type: item.type,
    icon: (item as any).imageFilename || (item as any).icon,
  };

  // Map RaidTheory fields to our internal format
  if ((item as any).rarity) transformed.rarity = (item as any).rarity;
  if ((item as any).value) transformed.value = (item as any).value;
  if ((item as any).workbench || (item as any).craftBench) {
    transformed.workbench = (item as any).workbench || (item as any).craftBench;
  }

  // Loot areas
  if ((item as any).foundIn) {
    transformed.loot_area = (item as any).foundIn;
  }

  // Transform effects to stat_block
  if ((item as any).effects && typeof (item as any).effects === 'object') {
    transformed.stat_block = {};
    Object.keys((item as any).effects).forEach((effectKey) => {
      const effect = (item as any).effects[effectKey];
      if (effect && typeof effect === 'object' && effect.value) {
        transformed.stat_block[effectKey] = effect.value;
      }
    });
  }

  // Transform crafting relationships
  if ((item as any).crafting_components) {
    transformed.crafting_components = transformComponents((item as any).crafting_components, language);
  }

  if ((item as any).used_in) {
    transformed.used_in = transformComponents((item as any).used_in, language);
  }

  if ((item as any).recycle_from) {
    transformed.recycle_from = transformComponents((item as any).recycle_from, language);
  }

  // Copy over any other fields that don't need transformation
  Object.keys(item).forEach((key) => {
    if (!transformed.hasOwnProperty(key) && key !== 'type' && key !== 'name' && key !== 'description') {
      transformed[key] = (item as any)[key];
    }
  });

  return transformed as Item;
}

function transformComponents(components: any[], language: Language): any[] {
  if (!Array.isArray(components)) return [];

  return components.map((comp) => {
    const transformed: any = {};

    if (comp.item) {
      transformed.item = transformComponentItem(comp.item, language);
    }

    if (comp.component) {
      transformed.component = transformComponentItem(comp.component, language);
    }

    return transformed;
  });
}

function transformComponentItem(compItem: any, language: Language): any {
  if (!compItem) return undefined;

  return {
    id: compItem.id,
    name: typeof compItem.name === 'string'
      ? compItem.name
      : getTranslation(compItem.name, language),
    icon: compItem.icon || compItem.imageFilename,
    item_type: compItem.item_type || compItem.type,
    rarity: compItem.rarity,
    description: typeof compItem.description === 'string'
      ? compItem.description
      : getTranslation(compItem.description, language),
  };
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
