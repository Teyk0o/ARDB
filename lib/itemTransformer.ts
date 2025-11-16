import { Item } from '@/types/item';
import computedTags from '@/data/item-tags-computed.json';

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
    nameEn: getTranslation(item.name, 'en'), // Store English name for URL slugs
    description: getTranslation(item.description, language),
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
      pt: 'Munição Pesada',
      pl: 'Ciężka Amunicja',
      no: 'Tung Ammunisjon',
      da: 'Tung Ammunition',
      it: 'Munizioni Pesanti',
      ru: 'Тяжелые боеприпасы',
      ja: 'ヘビー弾薬',
      'zh-TW': '重型彈藥',
      uk: 'Важкі боєприпаси',
      'zh-CN': '重型弹药',
      kr: '중형 탄약',
      tr: 'Ağır Mühimmat',
      hr: 'Teška streljiva',
      sr: 'Teška municija',
    },
    'Light Ammo': {
      en: 'Light Ammo',
      fr: 'Munitions Légères',
      de: 'Leichte Munition',
      es: 'Munición Ligera',
      pt: 'Munição Leve',
      pl: 'Lekka Amunicja',
      no: 'Lett Ammunisjon',
      da: 'Let Ammunition',
      it: 'Munizioni Leggere',
      ru: 'Легкие боеприпасы',
      ja: 'ライト弾薬',
      'zh-TW': '輕型彈藥',
      uk: 'Легкі боєприпаси',
      'zh-CN': '轻型弹药',
      kr: '경형 탄약',
      tr: 'Hafif Mühimmat',
      hr: 'Lagana streljiva',
      sr: 'Lagana municija',
    },
    'Medium Ammo': {
      en: 'Medium Ammo',
      fr: 'Munitions Moyennes',
      de: 'Mittlere Munition',
      es: 'Munición Media',
      pt: 'Munição Média',
      pl: 'Amunicja Średnia',
      no: 'Medium Ammunisjon',
      da: 'Medium Ammunition',
      it: 'Munizioni Medie',
      ru: 'Средние боеприпасы',
      ja: 'ミディアム弾薬',
      'zh-TW': '中型彈藥',
      uk: 'Середні боєприпаси',
      'zh-CN': '中型弹药',
      kr: '중형 탄약',
      tr: 'Orta Mühimmat',
      hr: 'Srednja streljiva',
      sr: 'Srednja municija',
    },
    'Shotgun Ammo': {
      en: 'Shotgun Ammo',
      fr: 'Munitions de Fusil de Chasse',
      de: 'Schrotflintenmunition',
      es: 'Munición de Escopeta',
      pt: 'Munição de Espingarda',
      pl: 'Amunicja do Strzelby',
      no: 'Haglammunisjon',
      da: 'Haglammunition',
      it: 'Munizioni da Fucile',
      ru: 'Боеприпасы для дробовика',
      ja: 'ショットガン弾薬',
      'zh-TW': '霰彈槍彈藥',
      uk: 'Патрони для рушниці',
      'zh-CN': '霰弹枪弹药',
      kr: '산탄총 탄약',
      tr: 'Tüfek Mühimmatı',
      hr: 'Lovačka streljiva',
      sr: 'Lovačka municija',
    },
    'Launcher Ammo': {
      en: 'Launcher Ammo',
      fr: 'Munitions de Lanceur',
      de: 'Werfer-Munition',
      es: 'Munición de Lanzador',
      pt: 'Munição de Lançador',
      pl: 'Amunicja Wyrzutnika',
      no: 'Utskytingsmunisjon',
      da: 'Affyringsmunition',
      it: 'Munizioni per Lanciatore',
      ru: 'Боеприпасы для пусковой установки',
      ja: 'ランチャー弾薬',
      'zh-TW': '發射器彈藥',
      uk: 'Боєприпаси для запускача',
      'zh-CN': '发射器弹药',
      kr: '런처 탄약',
      tr: 'Atıcı Mühimmatı',
      hr: 'Lanserska streljiva',
      sr: 'Lanserska municija',
    },
    'Energy Clip': {
      en: 'Energy Clip',
      fr: 'Chargeur Énergie',
      de: 'Energieclip',
      es: 'Clip de Energía',
      pt: 'Cartucho de Energia',
      pl: 'Klip Energii',
      no: 'Energiklipp',
      da: 'Energiclip',
      it: 'Carica Energetica',
      ru: 'Энергетический боеприпас',
      ja: 'エネルギークリップ',
      'zh-TW': '能量夾',
      uk: 'Енергетичний клліп',
      'zh-CN': '能量夹',
      kr: '에너지 클립',
      tr: 'Enerji Klipsi',
      hr: 'Energetski klip',
      sr: 'Energetski klip',
    },
    // Firing Modes
    'Single-Action': {
      en: 'Single-Action',
      fr: 'Tir Simple',
      de: 'Einzelschuss',
      es: 'Tiro Simple',
      pt: 'Disparo Simples',
      pl: 'Tir Pojedynczy',
      no: 'Enkeltskudd',
      da: 'Enkeltskud',
      it: 'Colpo Singolo',
      ru: 'Одиночный выстрел',
      ja: 'シングルショット',
      'zh-TW': '單發',
      uk: 'Одиничний постріл',
      'zh-CN': '单发',
      kr: '단발',
      tr: 'Tek Atış',
      hr: 'Pojedinačni ispaljivač',
      sr: 'Pojedinačni ispaljivač',
    },
    'Semi-Automatic': {
      en: 'Semi-Automatic',
      fr: 'Semi-Automatique',
      de: 'Halbautomatisch',
      es: 'Semiautomático',
      pt: 'Semiautomático',
      pl: 'Półautomatyczny',
      no: 'Halvautomatisk',
      da: 'Halvautomatisk',
      it: 'Semiautomatico',
      ru: 'Полуавтоматический',
      ja: 'セミオートマチック',
      'zh-TW': '半自動',
      uk: 'Напівавтоматичний',
      'zh-CN': '半自动',
      kr: '반자동',
      tr: 'Yarı Otomatik',
      hr: 'Polupouzdana',
      sr: 'Polupouzdana',
    },
    'Fully-Automatic': {
      en: 'Fully-Automatic',
      fr: 'Entièrement Automatique',
      de: 'Vollautomatisch',
      es: 'Completamente Automático',
      pt: 'Totalmente Automático',
      pl: 'W Pełni Automatyczny',
      no: 'Helautomatisk',
      da: 'Fuldt automatisk',
      it: 'Completamente Automatico',
      ru: 'Полностью автоматический',
      ja: 'フルオートマチック',
      'zh-TW': '全自動',
      uk: 'Повністю автоматичний',
      'zh-CN': '全自动',
      kr: '풀 자동',
      tr: 'Tamamen Otomatik',
      hr: 'Potpuno automatski',
      sr: 'Potpuno automatski',
    },
    '3-Round Burst': {
      en: '3-Round Burst',
      fr: 'Rafales de 3 Coups',
      de: '3er-Salve',
      es: 'Ráfagas de 3 Disparos',
      pt: 'Rajadas de 3 Disparos',
      pl: 'Seria 3 Strzałów',
      no: '3-rundersalve',
      da: '3-runders salve',
      it: 'Raffica di 3 Colpi',
      ru: 'Трехрядная очередь',
      ja: '3ラウンドバースト',
      'zh-TW': '3發點射',
      uk: '3-прострільна очередь',
      'zh-CN': '3发点射',
      kr: '3발 버스트',
      tr: '3 Atışlı Patlama',
      hr: '3-Salva',
      sr: '3-Salva',
    },
    'Bolt-Action': {
      en: 'Bolt-Action',
      fr: 'Verrou Manuel',
      de: 'Bolzenaktion',
      es: 'Acción de Perno',
      pt: 'Ação Ferrolho',
      pl: 'Zasuwa Ręczna',
      no: 'Boltkrok',
      da: 'Glideboltil',
      it: 'Azione a Otturatore',
      ru: 'Затворное действие',
      ja: 'ボルトアクション',
      'zh-TW': '栓動式',
      uk: 'Затворна дія',
      'zh-CN': '栓动式',
      kr: '볼트 액션',
      tr: 'Kilitli Eylem',
      hr: 'Zaključna akcija',
      sr: 'Zaključna akcija',
    },
    'Break-Action': {
      en: 'Break-Action',
      fr: 'Culasse Basculante',
      de: 'Kipplauf',
      es: 'Acción Abatible',
      pt: 'Ação Basculante',
      pl: 'Akcja Łamana',
      no: 'Bruddaksjon',
      da: 'Bruddeksjon',
      it: 'Azione Ribaltabile',
      ru: 'Откидное действие',
      ja: 'ブレークアクション',
      'zh-TW': '側開式',
      uk: 'Розкривна дія',
      'zh-CN': '侧开式',
      kr: '브레이크 액션',
      tr: 'Kırma Eylemi',
      hr: 'Akcija prekida',
      sr: 'Akcija prekida',
    },
    'Pump-Action': {
      en: 'Pump-Action',
      fr: 'Pompage',
      de: 'Pumpaktion',
      es: 'Acción de Bomba',
      pt: 'Ação de Bomba',
      pl: 'Akcja Tłokowa',
      no: 'Pumpaksjon',
      da: 'Pumpaksjon',
      it: 'Azione Pompa',
      ru: 'Ручная перезарядка',
      ja: 'ポンプアクション',
      'zh-TW': '泵動式',
      uk: 'Помпова дія',
      'zh-CN': '泵动式',
      kr: '펌프 액션',
      tr: 'Pompa Eylemi',
      hr: 'Pumpa akcija',
      sr: 'Pumpa akcija',
    },
    'Lever-Action': {
      en: 'Lever-Action',
      fr: 'Levier de Chargement',
      de: 'Hebelaktion',
      es: 'Acción de Palanca',
      pt: 'Ação Alavanca',
      pl: 'Akcja Dźwigniowa',
      no: 'Spakaksjon',
      da: 'Spakaksjon',
      it: 'Azione a Leva',
      ru: 'Рычажное действие',
      ja: 'レバーアクション',
      'zh-TW': '槓桿式',
      uk: 'Важільна дія',
      'zh-CN': '杠杆式',
      kr: '레버 액션',
      tr: 'Kaldıraç Eylemi',
      hr: 'Akcija poluge',
      sr: 'Akcija poluge',
    },
    'Slide-Action': {
      en: 'Slide-Action',
      fr: 'Glissement',
      de: 'Schieberaktion',
      es: 'Acción Deslizante',
      pt: 'Ação Deslizante',
      pl: 'Akcja Suwakowa',
      no: 'Glidaksjon',
      da: 'Glidaksjon',
      it: 'Azione Scorrevole',
      ru: 'Скользящее действие',
      ja: 'スライドアクション',
      'zh-TW': '滑動式',
      uk: 'Ковзна дія',
      'zh-CN': '滑动式',
      kr: '슬라이드 액션',
      tr: 'Kaydırma Eylemi',
      hr: 'Akcija klizanja',
      sr: 'Akcija klizanja',
    },
    'Twin Shot': {
      en: 'Twin Shot',
      fr: 'Double Coup',
      de: 'Doppelschuss',
      es: 'Doble Disparo',
      pt: 'Duplo Disparo',
      pl: 'Podwójny Strzał',
      no: 'Dobbeltskudd',
      da: 'Dobbeltkugle',
      it: 'Colpo Doppio',
      ru: 'Двойной выстрел',
      ja: 'ツインショット',
      'zh-TW': '雙發',
      uk: 'Подвійний постріл',
      'zh-CN': '双发',
      kr: '트윈 샷',
      tr: 'İkili Atış',
      hr: 'Dvostruki ispaljivač',
      sr: 'Dvostruki ispaljivač',
    },
    // Strength levels
    'Weak': {
      en: 'Weak',
      fr: 'Faible',
      de: 'Schwach',
      es: 'Débil',
      pt: 'Fraco',
      pl: 'Słaby',
      no: 'Svak',
      da: 'Svag',
      it: 'Debole',
      ru: 'Слабый',
      ja: '弱い',
      'zh-TW': '弱',
      uk: 'Слабий',
      'zh-CN': '弱',
      kr: '약함',
      tr: 'Zayıf',
      hr: 'Slab',
      sr: 'Slab',
    },
    'Very Weak': {
      en: 'Very Weak',
      fr: 'Très Faible',
      de: 'Sehr Schwach',
      es: 'Muy Débil',
      pt: 'Muito Fraco',
      pl: 'Bardzo Słaby',
      no: 'Veldig Svak',
      da: 'Meget Svag',
      it: 'Molto Debole',
      ru: 'Очень слабый',
      ja: 'とても弱い',
      'zh-TW': '非常弱',
      uk: 'Дуже слабий',
      'zh-CN': '非常弱',
      kr: '매우 약함',
      tr: 'Çok Zayıf',
      hr: 'Vrlo slab',
      sr: 'Vrlo slab',
    },
    'Moderate': {
      en: 'Moderate',
      fr: 'Modéré',
      de: 'Moderat',
      es: 'Moderado',
      pt: 'Moderado',
      pl: 'Umiarkowany',
      no: 'Moderat',
      da: 'Moderat',
      it: 'Moderato',
      ru: 'Умеренный',
      ja: '中程度',
      'zh-TW': '中等',
      uk: 'Помірний',
      'zh-CN': '中等',
      kr: '보통',
      tr: 'Orta',
      hr: 'Umjereno',
      sr: 'Umjereno',
    },
    'Strong': {
      en: 'Strong',
      fr: 'Fort',
      de: 'Stark',
      es: 'Fuerte',
      pt: 'Forte',
      pl: 'Silny',
      no: 'Sterk',
      da: 'Stærk',
      it: 'Forte',
      ru: 'Сильный',
      ja: '強い',
      'zh-TW': '強',
      uk: 'Сильний',
      'zh-CN': '强',
      kr: '강함',
      tr: 'Güçlü',
      hr: 'Jak',
      sr: 'Jak',
    },
    'Very Strong': {
      en: 'Very Strong',
      fr: 'Très Fort',
      de: 'Sehr Stark',
      es: 'Muy Fuerte',
      pt: 'Muito Forte',
      pl: 'Bardzo Silny',
      no: 'Veldig Sterk',
      da: 'Meget Stærk',
      it: 'Molto Forte',
      ru: 'Очень сильный',
      ja: 'とても強い',
      'zh-TW': '非常強',
      uk: 'Дуже сильний',
      'zh-CN': '非常强',
      kr: '매우 강함',
      tr: 'Çok Güçlü',
      hr: 'Vrlo jak',
      sr: 'Vrlo jak',
    },
    // Scopes/Sight types
    'Scoped': {
      en: 'Scoped',
      fr: 'Avec Lunette',
      de: 'Mit Zielfernrohr',
      es: 'Con Mira',
      pt: 'Com Mira',
      pl: 'Z Luneta',
      no: 'Med sikte',
      da: 'Med sigte',
      it: 'Con Mirino',
      ru: 'С прицелом',
      ja: 'スコープ付き',
      'zh-TW': '配備瞄準鏡',
      uk: 'З прицілом',
      'zh-CN': '配备瞄准镜',
      kr: '스코프 장착',
      tr: 'Kapsamlı',
      hr: 'Sa ciljanom',
      sr: 'Sa ciljanom',
    },
    // Special features
    'Integrated Silencer': {
      en: 'Integrated Silencer',
      fr: 'Silencieux Intégré',
      de: 'Integrierter Schalldämpfer',
      es: 'Silenciador Integrado',
      pt: 'Silenciador Integrado',
      pl: 'Zintegrowany Tłumik',
      no: 'Integrert demper',
      da: 'Integreret lyddemper',
      it: 'Silenziatore Integrato',
      ru: 'Встроенный глушитель',
      ja: '統合サイレンサー',
      'zh-TW': '內置消音器',
      uk: 'Вбудований глушник',
      'zh-CN': '内置消音器',
      kr: '통합 소음기',
      tr: 'Entegre Susturucu',
      hr: 'Integrirani prigušivač',
      sr: 'Integrirani prigušivač',
    },
    'Light': {
      en: 'Light',
      fr: 'Léger',
      de: 'Leicht',
      es: 'Ligero',
      pt: 'Leve',
      pl: 'Lekki',
      no: 'Lett',
      da: 'Lys',
      it: 'Leggero',
      ru: 'Легкий',
      ja: '軽い',
      'zh-TW': '輕',
      uk: 'Легкий',
      'zh-CN': '轻',
      kr: '가벼움',
      tr: 'Hafif',
      hr: 'Lagan',
      sr: 'Lagan',
    },
    'Experimental': {
      en: 'Experimental',
      fr: 'Expérimental',
      de: 'Experimentell',
      es: 'Experimental',
      pt: 'Experimental',
      pl: 'Eksperymentalny',
      no: 'Eksperimentell',
      da: 'Eksperimental',
      it: 'Sperimentale',
      ru: 'Экспериментальный',
      ja: '試験的',
      'zh-TW': '實驗性',
      uk: 'Експериментальний',
      'zh-CN': '实验性',
      kr: '실험적',
      tr: 'Deneysel',
      hr: 'Eksperimentalan',
      sr: 'Eksperimentalan',
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
