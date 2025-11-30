/**
 * Translation System - Loads translations from JSON files
 * Supports 5 languages: English, French, Spanish, German, Simplified Chinese
 */

export type Language = 'en' | 'fr' | 'es' | 'de' | 'zh-CN';

// Import all language JSON files
import enTranslations from './locales/en.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import deTranslations from './locales/de.json';
import zhCnTranslations from './locales/zh-CN.json';

export const translations: Record<Language, Record<string, string>> = {
  en: enTranslations,
  fr: frTranslations,
  es: esTranslations,
  de: deTranslations,
  'zh-CN': zhCnTranslations,
};

/**
 * Get translation object for a specific language
 * @param language - Language code (en, fr, es, de, zh-CN)
 * @returns Translation object with all keys for that language
 */
export function getTranslation(language: Language): Record<string, string> {
  return translations[language] || translations.en;
}

/**
 * Get translated text for a specific key
 * @param language - Language code
 * @param key - Translation key
 * @returns Translated text or key name if not found
 */
export function t(language: Language, key: string): string {
  const translation = translations[language] || translations.en;
  return translation[key] || key;
}

/**
 * Item type labels for display
 */
const ITEM_TYPE_LABELS: Record<string, Record<Language, string>> = {
  Weapon: { en: 'Weapon', fr: 'Arme', es: 'Arma', de: 'Waffe', 'zh-CN': '武器' },
  Armor: { en: 'Armor', fr: 'Armure', es: 'Armadura', de: 'Rüstung', 'zh-CN': '装甲' },
  Helmet: { en: 'Helmet', fr: 'Casque', es: 'Casco', de: 'Helm', 'zh-CN': '头盔' },
  'Quick Use': { en: 'Quick Use', fr: 'Utilisation rapide', es: 'Uso rápido', de: 'Schnellverwendung', 'zh-CN': '快速使用' },
  Material: { en: 'Material', fr: 'Matériau', es: 'Material', de: 'Material', 'zh-CN': '材料' },
  Component: { en: 'Component', fr: 'Composant', es: 'Componente', de: 'Komponente', 'zh-CN': '组件' },
  Ammo: { en: 'Ammo', fr: 'Munitions', es: 'Munición', de: 'Munition', 'zh-CN': '弹药' },
  Throwable: { en: 'Throwable', fr: 'Jetable', es: 'Lanzable', de: 'Werfbar', 'zh-CN': '可投掷' },
  Tool: { en: 'Tool', fr: 'Outil', es: 'Herramienta', de: 'Werkzeug', 'zh-CN': '工具' },
  Consumable: { en: 'Consumable', fr: 'Consommable', es: 'Consumible', de: 'Verbrauchsgegenstand', 'zh-CN': '消耗品' },
};

/**
 * Get translated item type label
 * @param itemType - Item type code
 * @param language - Language code
 * @returns Translated label or original itemType if not found
 */
export function getItemTypeLabel(itemType: string | null | undefined, language: Language): string {
  if (!itemType) return '';
  return ITEM_TYPE_LABELS[itemType]?.[language] || itemType;
}

/**
 * Rarity labels for display
 */
const RARITY_LABELS: Record<string, Record<Language, string>> = {
  Common: { en: 'Common', fr: 'Commun', es: 'Común', de: 'Häufig', 'zh-CN': '普通' },
  Uncommon: { en: 'Uncommon', fr: 'Peu courant', es: 'Poco común', de: 'Selten', 'zh-CN': '不常见' },
  Rare: { en: 'Rare', fr: 'Rare', es: 'Raro', de: 'Selten', 'zh-CN': '稀有' },
  Epic: { en: 'Epic', fr: 'Épique', es: 'Épico', de: 'Episch', 'zh-CN': '史诗' },
  Legendary: { en: 'Legendary', fr: 'Légendaire', es: 'Legendario', de: 'Legendär', 'zh-CN': '传奇' },
  Artifact: { en: 'Artifact', fr: 'Artefact', es: 'Artefacto', de: 'Artefakt', 'zh-CN': '圣物' },
};

/**
 * Get translated rarity label
 * @param rarity - Rarity code
 * @param language - Language code
 * @returns Translated label or original rarity if not found
 */
export function getRarityLabel(rarity: string | null | undefined, language: Language): string {
  if (!rarity) return '';
  return RARITY_LABELS[rarity]?.[language] || rarity;
}

/**
 * Stat labels for display
 */
const STAT_LABELS: Record<string, Record<Language, string>> = {
  damage: { en: 'Damage', fr: 'Dégâts', es: 'Daño', de: 'Schaden', 'zh-CN': '伤害' },
  armor: { en: 'Armor', fr: 'Armure', es: 'Armadura', de: 'Rüstung', 'zh-CN': '护甲' },
  health: { en: 'Health', fr: 'Santé', es: 'Salud', de: 'Gesundheit', 'zh-CN': '生命值' },
  healing: { en: 'Healing', fr: 'Soin', es: 'Curación', de: 'Heilung', 'zh-CN': '治疗' },
  duration: { en: 'Duration', fr: 'Durée', es: 'Duración', de: 'Dauer', 'zh-CN': '持续时间' },
  'use-time': { en: 'Use Time', fr: "Temps d'utilisation", es: 'Tiempo de uso', de: 'Verwendungszeit', 'zh-CN': '使用时间' },
  'attack-speed': { en: 'Attack Speed', fr: 'Vitesse d\'attaque', es: 'Velocidad de ataque', de: 'Angriffsgeschwindigkeit', 'zh-CN': '攻击速度' },
  'fire-rate': { en: 'Fire Rate', fr: 'Cadence de tir', es: 'Cadencia de fuego', de: 'Feuerrate', 'zh-CN': '射击速率' },
  magazine: { en: 'Magazine', fr: 'Magasin', es: 'Revista', de: 'Magazin', 'zh-CN': '弹匣' },
  range: { en: 'Range', fr: 'Portée', es: 'Alcance', de: 'Reichweite', 'zh-CN': '范围' },
};

/**
 * Get translated stat label
 * @param statKey - Stat key (lowercase, hyphenated)
 * @param language - Language code
 * @returns Translated label or original key if not found
 */
export function getStatLabel(statKey: string | null | undefined, language: Language): string {
  if (!statKey) return '';
  const key = statKey.toLowerCase();
  return STAT_LABELS[key]?.[language] || statKey;
}

/**
 * Loot area labels for display
 */
const LOOT_AREA_LABELS: Record<string, Record<Language, string>> = {
  'Outpost Alpha': { en: 'Outpost Alpha', fr: 'Avant-poste Alpha', es: 'Puesto Alfa', de: 'Außenposten Alpha', 'zh-CN': '前哨基地阿尔法' },
  'Research Facility': { en: 'Research Facility', fr: 'Établissement de recherche', es: 'Instalación de investigación', de: 'Forschungseinrichtung', 'zh-CN': '研究设施' },
  'Industrial Zone': { en: 'Industrial Zone', fr: 'Zone industrielle', es: 'Zona industrial', de: 'Industriezone', 'zh-CN': '工业区' },
  'Deep Vault': { en: 'Deep Vault', fr: 'Coffre profond', es: 'Bóveda profunda', de: 'Tiefe Gewölbe', 'zh-CN': '深层金库' },
  'Crashed Ship': { en: 'Crashed Ship', fr: 'Navire échoué', es: 'Nave estrellada', de: 'Abgestürztes Schiff', 'zh-CN': '坠毁的船' },
};

/**
 * Get translated loot area label
 * @param area - Loot area name
 * @param language - Language code
 * @returns Translated label or original area if not found
 */
export function getLootAreaLabel(area: string | null | undefined, language: Language): string {
  if (!area) return '';
  return LOOT_AREA_LABELS[area]?.[language] || area;
}

/**
 * Category translations
 */
export const categoryTranslations: Record<Language, Record<string, string>> = {
  en: {
    weapons: 'Weapons',
    armor: 'Armor',
    tools: 'Tools',
    consumables: 'Consumables',
    components: 'Components',
    materials: 'Materials',
    ammo: 'Ammo',
  },
  fr: {
    weapons: 'Armes',
    armor: 'Armures',
    tools: 'Outils',
    consumables: 'Consommables',
    components: 'Composants',
    materials: 'Matériaux',
    ammo: 'Munitions',
  },
  es: {
    weapons: 'Armas',
    armor: 'Armaduras',
    tools: 'Herramientas',
    consumables: 'Consumibles',
    components: 'Componentes',
    materials: 'Materiales',
    ammo: 'Munición',
  },
  de: {
    weapons: 'Waffen',
    armor: 'Rüstungen',
    tools: 'Werkzeuge',
    consumables: 'Verbrauchsgegenstände',
    components: 'Komponenten',
    materials: 'Materialien',
    ammo: 'Munition',
  },
  'zh-CN': {
    weapons: '武器',
    armor: '装甲',
    tools: '工具',
    consumables: '消耗品',
    components: '组件',
    materials: '材料',
    ammo: '弹药',
  },
};

/**
 * Tag labels for display
 */
const TAG_LABELS: Record<Language, { tagKeep: string; tagSell: string; tagRecycle: string }> = {
  en: { tagKeep: 'Keep', tagSell: 'Sell', tagRecycle: 'Recycle' },
  fr: { tagKeep: 'Garder', tagSell: 'Vendre', tagRecycle: 'Recycler' },
  de: { tagKeep: 'Behalten', tagSell: 'Verkaufen', tagRecycle: 'Recyceln' },
  es: { tagKeep: 'Guardar', tagSell: 'Vender', tagRecycle: 'Reciclar' },
  'zh-CN': { tagKeep: '保留', tagSell: '出售', tagRecycle: '回收' },
};

/**
 * Get translated tag label
 * @param tag - Tag type (keep, sell, recycle)
 * @param language - Language code
 * @returns Translated label
 */
export function getTagLabel(tag: 'keep' | 'sell' | 'recycle', language: Language): string {
  const key = `tag${tag.charAt(0).toUpperCase() + tag.slice(1)}` as 'tagKeep' | 'tagSell' | 'tagRecycle';
  return TAG_LABELS[language]?.[key] || TAG_LABELS.en[key];
}
