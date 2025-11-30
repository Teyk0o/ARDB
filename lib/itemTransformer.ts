import { Item } from '@/types/item';
import computedTags from '@/data/item-tags-computed.json';

type Language = 'en' | 'fr' | 'es' | 'de' | 'zh-CN';

interface MultilingualField {
  [key: string]: string;
}

export interface ExternalItem {
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

export function transformItem(item: ExternalItem, language: Language): Item {
  const transformed: any = {
    id: item.id,
    name: getTranslation(item.name, language),
    nameEn: getTranslation(item.name, 'en'), // Store English name for URL slugs
    nameTranslations: item.name, // Store all translations for multi-language search
    description: getTranslation(item.description, language),
    descriptionTranslations: item.description, // Store all description translations
    item_type: item.type,
    icon: (item as any).imageFilename || (item as any).icon,
  };

  // Add computed tag if available
  const tags = computedTags as Record<string, 'keep' | 'sell' | 'recycle'>;
  if (tags[item.id]) {
    transformed.tag = tags[item.id];
  }

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
        // Use the translated name if available, otherwise use the effect key
        const displayName = typeof effect === 'object' && effect[language]
          ? effect[language]
          : effectKey;
        // Translate the value if it's an enum value
        const displayValue = translateEnumValue(effect.value, language);
        transformed.stat_block[displayName] = displayValue;
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

function translateEnumValue(value: string | number, language: Language): string | number {
  if (typeof value !== 'string') {
    return value;
  }

  // Map of enum values to their translations
  const enumTranslations: Record<string, Record<Language, string>> = {
    // Ammo Types
    'Heavy Ammo': {
      en: 'Heavy Ammo',
      fr: 'Munitions Lourdes',
      de: 'Schwere Munition',
      es: 'Munición Pesada',
      'zh-CN': '重型弹药'
    },
    'Light Ammo': {
      en: 'Light Ammo',
      fr: 'Munitions Légères',
      de: 'Leichte Munition',
      es: 'Munición Ligera',
      'zh-CN': '轻型弹药'
    },
    'Medium Ammo': {
      en: 'Medium Ammo',
      fr: 'Munitions Moyennes',
      de: 'Mittlere Munition',
      es: 'Munición Media',
      'zh-CN': '中型弹药'
    },
    'Shotgun Ammo': {
      en: 'Shotgun Ammo',
      fr: 'Munitions de Fusil de Chasse',
      de: 'Schrotflintenmunition',
      es: 'Munición de Escopeta',
      'zh-CN': '霰弹枪弹药'
    },
    'Launcher Ammo': {
      en: 'Launcher Ammo',
      fr: 'Munitions de Lanceur',
      de: 'Werfer-Munition',
      es: 'Munición de Lanzador',
      'zh-CN': '发射器弹药'
    },
    'Energy Clip': {
      en: 'Energy Clip',
      fr: 'Chargeur Énergie',
      de: 'Energieclip',
      es: 'Clip de Energía',
      'zh-CN': '能量夹'
    },
    // Firing Modes
    'Single-Action': {
      en: 'Single-Action',
      fr: 'Tir Simple',
      de: 'Einzelschuss',
      es: 'Tiro Simple',
      'zh-CN': '单发'
    },
    'Semi-Automatic': {
      en: 'Semi-Automatic',
      fr: 'Semi-Automatique',
      de: 'Halbautomatisch',
      es: 'Semiautomático',
      'zh-CN': '半自动'
    },
    'Fully-Automatic': {
      en: 'Fully-Automatic',
      fr: 'Entièrement Automatique',
      de: 'Vollautomatisch',
      es: 'Completamente Automático',
      'zh-CN': '全自动'
    },
    '3-Round Burst': {
      en: '3-Round Burst',
      fr: 'Rafales de 3 Coups',
      de: '3er-Salve',
      es: 'Ráfagas de 3 Disparos',
      'zh-CN': '3发点射'
    },
    'Bolt-Action': {
      en: 'Bolt-Action',
      fr: 'Verrou Manuel',
      de: 'Bolzenaktion',
      es: 'Acción de Perno',
      'zh-CN': '栓动式'
    },
    'Break-Action': {
      en: 'Break-Action',
      fr: 'Culasse Basculante',
      de: 'Kipplauf',
      es: 'Acción Abatible',
      'zh-CN': '侧开式'
    },
    'Pump-Action': {
      en: 'Pump-Action',
      fr: 'Pompage',
      de: 'Pumpaktion',
      es: 'Acción de Bomba',
      'zh-CN': '泵动式'
    },
    'Lever-Action': {
      en: 'Lever-Action',
      fr: 'Levier de Chargement',
      de: 'Hebelaktion',
      es: 'Acción de Palanca',
      'zh-CN': '杠杆式'
    },
    'Slide-Action': {
      en: 'Slide-Action',
      fr: 'Glissement',
      de: 'Schieberaktion',
      es: 'Acción Deslizante',
      'zh-CN': '滑动式'
    },
    'Twin Shot': {
      en: 'Twin Shot',
      fr: 'Double Coup',
      de: 'Doppelschuss',
      es: 'Doble Disparo',
      'zh-CN': '双发'
    },
    // Strength levels
    'Weak': {
      en: 'Weak',
      fr: 'Faible',
      de: 'Schwach',
      es: 'Débil',
      'zh-CN': '弱'
    },
    'Very Weak': {
      en: 'Very Weak',
      fr: 'Très Faible',
      de: 'Sehr Schwach',
      es: 'Muy Débil',
      'zh-CN': '非常弱'
    },
    'Moderate': {
      en: 'Moderate',
      fr: 'Modéré',
      de: 'Moderat',
      es: 'Moderado',
      'zh-CN': '中等'
    },
    'Strong': {
      en: 'Strong',
      fr: 'Fort',
      de: 'Stark',
      es: 'Fuerte',
      'zh-CN': '强'
    },
    'Very Strong': {
      en: 'Very Strong',
      fr: 'Très Fort',
      de: 'Sehr Stark',
      es: 'Muy Fuerte',
      'zh-CN': '非常强'
    },
    // Scopes/Sight types
    'Scoped': {
      en: 'Scoped',
      fr: 'Avec Lunette',
      de: 'Mit Zielfernrohr',
      es: 'Con Mira',
      'zh-CN': '配备瞄准镜'
    },
    // Special features
    'Integrated Silencer': {
      en: 'Integrated Silencer',
      fr: 'Silencieux Intégré',
      de: 'Integrierter Schalldämpfer',
      es: 'Silenciador Integrado',
      'zh-CN': '内置消音器'
    },
    'Light': {
      en: 'Light',
      fr: 'Léger',
      de: 'Leicht',
      es: 'Ligero',
      'zh-CN': '轻'
    },
    'Experimental': {
      en: 'Experimental',
      fr: 'Expérimental',
      de: 'Experimentell',
      es: 'Experimental',
      'zh-CN': '实验性'
    },
  };

  if (enumTranslations[value] && enumTranslations[value][language]) {
    return enumTranslations[value][language];
  }

  return value;
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
