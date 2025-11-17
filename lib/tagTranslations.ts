import type { Language } from './translations';

export const tagTranslations: Record<Language, { tagKeep: string; tagSell: string; tagRecycle: string }> = {
  en: { tagKeep: 'Keep', tagSell: 'Sell', tagRecycle: 'Recycle' },
  fr: { tagKeep: 'Garder', tagSell: 'Vendre', tagRecycle: 'Recycler' },
  de: { tagKeep: 'Behalten', tagSell: 'Verkaufen', tagRecycle: 'Recyceln' },
  es: { tagKeep: 'Guardar', tagSell: 'Vender', tagRecycle: 'Reciclar' },
  pt: { tagKeep: 'Guardar', tagSell: 'Vender', tagRecycle: 'Reciclar' },
  pl: { tagKeep: 'Zachować', tagSell: 'Sprzedać', tagRecycle: 'Przetworzyć' },
  no: { tagKeep: 'Behold', tagSell: 'Selg', tagRecycle: 'Resirkuler' },
  da: { tagKeep: 'Behold', tagSell: 'Sælg', tagRecycle: 'Genbrug' },
  it: { tagKeep: 'Conserva', tagSell: 'Vendi', tagRecycle: 'Ricicla' },
  ru: { tagKeep: 'Сохранить', tagSell: 'Продать', tagRecycle: 'Переработать' },
  ja: { tagKeep: '保管', tagSell: '売却', tagRecycle: 'リサイクル' },
  'zh-TW': { tagKeep: '保留', tagSell: '出售', tagRecycle: '回收' },
  uk: { tagKeep: 'Зберегти', tagSell: 'Продати', tagRecycle: 'Переробити' },
  'zh-CN': { tagKeep: '保留', tagSell: '出售', tagRecycle: '回收' },
  kr: { tagKeep: '보관', tagSell: '판매', tagRecycle: '재활용' },
  tr: { tagKeep: 'Sakla', tagSell: 'Sat', tagRecycle: 'Geri Dönüştür' },
  hr: { tagKeep: 'Zadrži', tagSell: 'Prodaj', tagRecycle: 'Recikliraj' },
  sr: { tagKeep: 'Zadrži', tagSell: 'Prodaj', tagRecycle: 'Recikliraj' }
};

export function getTagLabel(tag: 'keep' | 'sell' | 'recycle', language: Language): string {
  const key = `tag${tag.charAt(0).toUpperCase() + tag.slice(1)}` as 'tagKeep' | 'tagSell' | 'tagRecycle';
  return tagTranslations[language]?.[key] || tagTranslations.en[key];
}
