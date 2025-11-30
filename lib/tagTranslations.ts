import type { Language } from './translations';

export const tagTranslations: Record<Language, { tagKeep: string; tagSell: string; tagRecycle: string }> = {
  en: { tagKeep: 'Keep', tagSell: 'Sell', tagRecycle: 'Recycle' },
  fr: { tagKeep: 'Garder', tagSell: 'Vendre', tagRecycle: 'Recycler' },
  de: { tagKeep: 'Behalten', tagSell: 'Verkaufen', tagRecycle: 'Recyceln' },
  es: { tagKeep: 'Guardar', tagSell: 'Vender', tagRecycle: 'Reciclar' },
  'zh-CN': { tagKeep: '保留', tagSell: '出售', tagRecycle: '回收' },
};

export function getTagLabel(tag: 'keep' | 'sell' | 'recycle', language: Language): string {
  const key = `tag${tag.charAt(0).toUpperCase() + tag.slice(1)}` as 'tagKeep' | 'tagSell' | 'tagRecycle';
  return tagTranslations[language]?.[key] || tagTranslations.en[key];
}
