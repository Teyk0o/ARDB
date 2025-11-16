'use client';

import React from 'react';
import { FaFlask, FaHammer, FaScroll } from 'react-icons/fa';
import { HiMiniArrowPath } from 'react-icons/hi2';
import type { ItemTagReasons } from '@/lib/tagReasoning';
import type { Language } from '@/lib/translations';
import TagBadge from './TagBadge';
import { getTagLabel } from '@/lib/tagTranslations';

interface TagReasonDisplayProps {
  itemId: string;
  reasons: ItemTagReasons;
  language: Language;
  allItems: any[];
}

// Workshop station translations
const workshopNames: Record<string, Record<Language, string>> = {
  gunsmith: {
    en: 'Gunsmith', fr: 'Armurier', de: 'Waffenschmied', es: 'Armero', pt: 'Armeiro',
    pl: 'Rusznikarz', no: 'Våpensmed', da: 'Våbensmed', it: 'Armaiolo', ru: 'Оружейник',
    ja: '武器職人', 'zh-TW': '槍匠', uk: 'Зброяр', 'zh-CN': '枪匠', kr: '총기 제작자',
    tr: 'Silahçı', hr: 'Oružar', sr: 'Oružar'
  },
  gear_bench: {
    en: 'Gear Bench', fr: 'Établi d\'équipement', de: 'Ausrüstungswerkbank', es: 'Banco de equipo',
    pt: 'Bancada de equipamento', pl: 'Stół wyposażenia', no: 'Utstyrsbenk', da: 'Udstyrsbænk',
    it: 'Banco dell\'equipaggiamento', ru: 'Верстак снаряжения', ja: '装備ベンチ',
    'zh-TW': '裝備工作台', uk: 'Верстак спорядження', 'zh-CN': '装备工作台',
    kr: '장비 작업대', tr: 'Ekipman Tezgahı', hr: 'Radni stol za opremu', sr: 'Radni sto za opremu'
  },
  medical_lab: {
    en: 'Medical Lab', fr: 'Laboratoire médical', de: 'Medizinisches Labor', es: 'Laboratorio médico',
    pt: 'Laboratório médico', pl: 'Laboratorium medyczne', no: 'Medisinsk lab', da: 'Medicinsk laboratorium',
    it: 'Laboratorio medico', ru: 'Медицинская лаборатория', ja: '医療ラボ',
    'zh-TW': '醫療實驗室', uk: 'Медична лабораторія', 'zh-CN': '医疗实验室',
    kr: '의료 연구소', tr: 'Tıbbi Laboratuvar', hr: 'Medicinski laboratorij', sr: 'Medicinski laboratorijum'
  },
  explosives_station: {
    en: 'Explosives Station', fr: 'Station d\'explosifs', de: 'Sprengstoffstation', es: 'Estación de explosivos',
    pt: 'Estação de explosivos', pl: 'Stacja wybuchowa', no: 'Eksplosivstasjon', da: 'Eksplosivstation',
    it: 'Stazione esplosivi', ru: 'Станция взрывчатки', ja: '爆発物ステーション',
    'zh-TW': '爆炸物站', uk: 'Станція вибухівки', 'zh-CN': '爆炸物站',
    kr: '폭발물 스테이션', tr: 'Patlayıcı İstasyonu', hr: 'Stanica eksploziva', sr: 'Stanica eksploziva'
  },
  utility_station: {
    en: 'Utility Station', fr: 'Station utilitaire', de: 'Versorgungsstation', es: 'Estación de utilidad',
    pt: 'Estação utilitária', pl: 'Stacja użytkowa', no: 'Bruksstasjon', da: 'Forsyningsstation',
    it: 'Stazione di utilità', ru: 'Служебная станция', ja: 'ユーティリティステーション',
    'zh-TW': '實用站', uk: 'Службова станція', 'zh-CN': '实用站',
    kr: '유틸리티 스테이션', tr: 'Yardımcı İstasyon', hr: 'Stanica za usluge', sr: 'Stanica za usluge'
  },
  refiner: {
    en: 'Refiner', fr: 'Raffinerie', de: 'Raffinerie', es: 'Refinador', pt: 'Refinador',
    pl: 'Rafineria', no: 'Raffineri', da: 'Raffinaderi', it: 'Raffineria', ru: 'Очиститель',
    ja: '精製所', 'zh-TW': '精煉廠', uk: 'Очищувач', 'zh-CN': '精炼厂',
    kr: '정제소', tr: 'Rafineri', hr: 'Rafinerija', sr: 'Rafinerija'
  },
  scrappy: {
    en: 'Scrappy', fr: 'Scrappy', de: 'Scrappy', es: 'Scrappy', pt: 'Scrappy',
    pl: 'Scrappy', no: 'Scrappy', da: 'Scrappy', it: 'Scrappy', ru: 'Scrappy',
    ja: 'Scrappy', 'zh-TW': 'Scrappy', uk: 'Scrappy', 'zh-CN': 'Scrappy',
    kr: 'Scrappy', tr: 'Scrappy', hr: 'Scrappy', sr: 'Scrappy'
  }
};

const reasonLabels: Record<Language, {
  usedInQuest: string;
  usedForWorkshop: string;
  level: string;
  usedToCraft: string;
  recyclesToUseful: string;
  whyKeep: string;
  whyRecycle: string;
  whySell: string;
  recycle: string;
  craft: string;
}> = {
  en: { usedInQuest: 'Used in quest', usedForWorkshop: 'Used for workshop upgrade', level: 'Level', usedToCraft: 'Used to craft', recyclesToUseful: 'Recycles to useful material', whyKeep: 'Why Keep?', whyRecycle: 'Why Recycle?', whySell: 'Why Sell?', recycle: 'recycle', craft: 'craft' },
  fr: { usedInQuest: 'Utilisé pour quête', usedForWorkshop: 'Pour amélioration atelier', level: 'Niveau', usedToCraft: 'Pour fabriquer', recyclesToUseful: 'Recycle en matériau utile', whyKeep: 'Pourquoi garder ?', whyRecycle: 'Pourquoi recycler ?', whySell: 'Pourquoi vendre ?', recycle: 'recycler', craft: 'fabriquer' },
  de: { usedInQuest: 'Für Quest verwendet', usedForWorkshop: 'Für Werkstatt-Upgrade', level: 'Stufe', usedToCraft: 'Zum Herstellen', recyclesToUseful: 'Recycelt zu nützlichem Material', whyKeep: 'Warum behalten?', whyRecycle: 'Warum recyceln?', whySell: 'Warum verkaufen?', recycle: 'recyceln', craft: 'herstellen' },
  es: { usedInQuest: 'Usado en misión', usedForWorkshop: 'Para mejora de taller', level: 'Nivel', usedToCraft: 'Para fabricar', recyclesToUseful: 'Recicla a material útil', whyKeep: '¿Por qué guardar?', whyRecycle: '¿Por qué reciclar?', whySell: '¿Por qué vender?', recycle: 'reciclar', craft: 'fabricar' },
  pt: { usedInQuest: 'Usado em missão', usedForWorkshop: 'Para melhoria de oficina', level: 'Nível', usedToCraft: 'Para fabricar', recyclesToUseful: 'Recicla em material útil', whyKeep: 'Por que guardar?', whyRecycle: 'Por que reciclar?', whySell: 'Por que vender?', recycle: 'reciclar', craft: 'fabricar' },
  pl: { usedInQuest: 'Używany w queście', usedForWorkshop: 'Do ulepszenia warsztatu', level: 'Poziom', usedToCraft: 'Do wytworzenia', recyclesToUseful: 'Przetwarza na przydatny materiał', whyKeep: 'Dlaczego zachować?', whyRecycle: 'Dlaczego przetworzyć?', whySell: 'Dlaczego sprzedać?', recycle: 'przetworzyć', craft: 'wytworzyć' },
  no: { usedInQuest: 'Brukt i oppdrag', usedForWorkshop: 'For verkstedoppgradering', level: 'Nivå', usedToCraft: 'For å lage', recyclesToUseful: 'Resirkulerer til nyttig materiale', whyKeep: 'Hvorfor beholde?', whyRecycle: 'Hvorfor resirkulere?', whySell: 'Hvorfor selge?', recycle: 'resirkulere', craft: 'lage' },
  da: { usedInQuest: 'Brugt i mission', usedForWorkshop: 'Til værkstedsopgradering', level: 'Niveau', usedToCraft: 'Til fremstilling', recyclesToUseful: 'Genbruger til nyttigt materiale', whyKeep: 'Hvorfor beholde?', whyRecycle: 'Hvorfor genbruge?', whySell: 'Hvorfor sælge?', recycle: 'genbruge', craft: 'fremstille' },
  it: { usedInQuest: 'Usato in missione', usedForWorkshop: 'Per aggiornamento laboratorio', level: 'Livello', usedToCraft: 'Per fabbricare', recyclesToUseful: 'Ricicla in materiale utile', whyKeep: 'Perché conservare?', whyRecycle: 'Perché riciclare?', whySell: 'Perché vendere?', recycle: 'riciclare', craft: 'fabbricare' },
  ru: { usedInQuest: 'Для квеста', usedForWorkshop: 'Для улучшения мастерской', level: 'Уровень', usedToCraft: 'Для создания', recyclesToUseful: 'Перерабатывается в полезный материал', whyKeep: 'Зачем сохранять?', whyRecycle: 'Зачем перерабатывать?', whySell: 'Зачем продавать?', recycle: 'переработать', craft: 'создать' },
  ja: { usedInQuest: 'クエストで使用', usedForWorkshop: 'ワークショップアップグレード用', level: 'レベル', usedToCraft: 'クラフト用', recyclesToUseful: '有用な材料にリサイクル', whyKeep: 'なぜ保管？', whyRecycle: 'なぜリサイクル？', whySell: 'なぜ売却？', recycle: 'リサイクル', craft: 'クラフト' },
  'zh-TW': { usedInQuest: '用於任務', usedForWorkshop: '用於工作坊升級', level: '等級', usedToCraft: '用於製作', recyclesToUseful: '回收為有用材料', whyKeep: '為什麼保留？', whyRecycle: '為什麼回收？', whySell: '為什麼出售？', recycle: '回收', craft: '製作' },
  uk: { usedInQuest: 'Для квесту', usedForWorkshop: 'Для покращення майстерні', level: 'Рівень', usedToCraft: 'Для створення', recyclesToUseful: 'Переробляється в корисний матеріал', whyKeep: 'Навіщо зберігати?', whyRecycle: 'Навіщо переробляти?', whySell: 'Навіщо продавати?', recycle: 'переробити', craft: 'створити' },
  'zh-CN': { usedInQuest: '用于任务', usedForWorkshop: '用于工作坊升级', level: '等级', usedToCraft: '用于制作', recyclesToUseful: '回收为有用材料', whyKeep: '为什么保留？', whyRecycle: '为什么回收？', whySell: '为什么出售？', recycle: '回收', craft: '制作' },
  kr: { usedInQuest: '퀘스트에 사용', usedForWorkshop: '작업장 업그레이드용', level: '레벨', usedToCraft: '제작용', recyclesToUseful: '유용한 재료로 재활용', whyKeep: '왜 보관？', whyRecycle: '왜 재활용？', whySell: '왜 판매？', recycle: '재활용', craft: '제작' },
  tr: { usedInQuest: 'Görevde kullanılır', usedForWorkshop: 'Atölye yükseltmesi için', level: 'Seviye', usedToCraft: 'Üretmek için', recyclesToUseful: 'Faydalı malzemeye geri dönüştürür', whyKeep: 'Neden sakla?', whyRecycle: 'Neden geri dönüştür?', whySell: 'Neden sat?', recycle: 'geri dönüştür', craft: 'üret' },
  hr: { usedInQuest: 'Koristi se u zadatku', usedForWorkshop: 'Za nadogradnju radionice', level: 'Razina', usedToCraft: 'Za izradu', recyclesToUseful: 'Reciklira u koristan materijal', whyKeep: 'Zašto zadržati?', whyRecycle: 'Zašto reciklirati?', whySell: 'Zašto prodati?', recycle: 'reciklirati', craft: 'izraditi' },
  sr: { usedInQuest: 'Koristi se u zadatku', usedForWorkshop: 'Za nadogradnju radionice', level: 'Nivo', usedToCraft: 'Za izradu', recyclesToUseful: 'Reciklira u koristan materijal', whyKeep: 'Zašto zadržati?', whyRecycle: 'Zašto reciklirati?', whySell: 'Zašto prodati?', recycle: 'reciklirati', craft: 'izraditi' }
};

export default function TagReasonDisplay({ itemId, reasons, language, allItems }: TagReasonDisplayProps) {
  if (!reasons || reasons.reasons.length === 0) return null;

  const labels = reasonLabels[language];

  // Helper to get translated item name
  const getItemName = (itemId: string): string => {
    const item = allItems.find(i => i.id === itemId);
    return item?.name || itemId;
  };

  // Helper to capitalize first letter
  const capitalize = (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <TagBadge tag={reasons.tag} label={getTagLabel(reasons.tag, language)} />
        <h3 className="text-arc-white font-bold text-lg">
          {reasons.tag === 'keep' ? labels.whyKeep : reasons.tag === 'recycle' ? labels.whyRecycle : labels.whySell}
        </h3>
      </div>

      <ul className="space-y-4">
        {reasons.reasons.map((reason, idx) => (
          <li key={idx} className="text-arc-white/80">
            {reason.type === 'quest' && (
              <div className="flex items-start gap-3">
                <FaScroll className="text-arc-yellow mt-1 flex-shrink-0" />
                <span>
                  <strong className="text-arc-white">{labels.usedInQuest}:</strong>{' '}
                  <span className="text-arc-yellow">{reason.questName}</span>
                </span>
              </div>
            )}
            {reason.type === 'workshop' && (
              <div className="flex items-start gap-3">
                <FaHammer className="text-arc-yellow mt-1 flex-shrink-0" />
                <span>
                  <strong className="text-arc-white">{labels.usedForWorkshop}:</strong>{' '}
                  <span className="text-arc-yellow">
                    {workshopNames[reason.workshopStation!]?.[language] || reason.workshopStation}
                  </span>{' '}
                  ({labels.level} {reason.workshopLevel})
                </span>
              </div>
            )}
            {reason.type === 'crafting' && (
              <div className="flex items-start gap-3">
                <FaFlask className="text-arc-yellow mt-1 flex-shrink-0" />
                <span>
                  <strong className="text-arc-white">{labels.usedToCraft}:</strong>{' '}
                  <span className="text-arc-yellow">{getItemName(reason.craftedItemId!)}</span>
                </span>
              </div>
            )}
            {reason.type === 'recycle' && (
              <div>
                {/* Show full chain if available */}
                {reason.chain && reason.chain.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <HiMiniArrowPath className="text-arc-yellow mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {reason.chain.map((step, stepIdx) => (
                          <React.Fragment key={stepIdx}>
                            {step.action === 'recycle' && (
                              <>
                                <span className="text-arc-white font-semibold">{getItemName(step.itemId)}</span>
                                <span className="text-arc-white/60">→ {capitalize(labels.recycle)} →</span>
                                <span className="text-arc-yellow">{getItemName(step.targetId!)}</span>
                              </>
                            )}
                            {step.action === 'craft' && stepIdx > 0 && (
                              <>
                                <span className="text-arc-white/60">→ {capitalize(labels.craft)} →</span>
                                <span className="text-arc-yellow">{getItemName(step.targetId!)}</span>
                              </>
                            )}
                            {step.action === 'use_in_quest' && stepIdx > 0 && (
                              <>
                                <span className="text-arc-white/60">→</span>
                                <span className="text-green-400 font-semibold">{step.questName}</span>
                              </>
                            )}
                            {step.action === 'use_in_workshop' && stepIdx > 0 && (
                              <>
                                <span className="text-arc-white/60">→</span>
                                <span className="text-green-400 font-semibold">
                                  {workshopNames[step.workshopStation!]?.[language] || step.workshopStation} Lv{step.workshopLevel}
                                </span>
                              </>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Fallback to simple display
                  <div className="flex items-start gap-3">
                    <HiMiniArrowPath className="text-arc-yellow mt-1 flex-shrink-0" />
                    <span>
                      <strong className="text-arc-white">{labels.recyclesToUseful}:</strong>{' '}
                      <span className="text-arc-yellow">{getItemName(reason.recycleComponentId!)}</span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
