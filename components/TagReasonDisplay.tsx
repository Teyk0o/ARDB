'use client';

import React from 'react';
import { FaFlask, FaHammer, FaScroll, FaClipboardList } from 'react-icons/fa';
import { HiMiniArrowPath } from 'react-icons/hi2';
import type { ItemTagReasons } from '@/lib/tagReasoning';
import type { Language } from '@/lib/translations';
import type { Project } from '@/types/tags';
import TagBadge from './TagBadge';
import { getTagLabel } from '@/lib/tagTranslations';
import allQuests from '@/data/quests-all.json';
import projectsData from '@/data/projects.json';

interface TagReasonDisplayProps {
  itemId: string;
  reasons: ItemTagReasons;
  language: Language;
  allItems: any[];
}

// Helper to get translated quest name from questId
const getQuestName = (questId: string, language: Language): string => {
  const quest = (allQuests as any)[questId];
  if (quest && quest.name) {
    return quest.name[language] || quest.name.en || questId;
  }
  return questId;
}

// Helper to get translated project name from projectId
const getProjectName = (projectId: string, language: Language): string => {
  const projects = projectsData as Project[];
  const project = projects.find(p => p.id === projectId);
  if (project && project.name) {
    return project.name[language] || project.name.en || projectId;
  }
  return projectId;
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
  usedForProject: string;
  phase: string;
  level: string;
  usedToCraft: string;
  recyclesToUseful: string;
  whyKeep: string;
  whyRecycle: string;
  whySell: string;
  recycle: string;
  craft: string;
}> = {
  en: { usedInQuest: 'Quest(s)', usedForWorkshop: 'Workshop Upgrade', usedForProject: 'Project', phase: 'Phase', level: 'Level', usedToCraft: 'Crafting', recyclesToUseful: 'Recycles to useful material', whyKeep: 'Why Keep?', whyRecycle: 'Why Recycle?', whySell: 'Why Sell?', recycle: 'recycle', craft: 'craft' },
  fr: { usedInQuest: 'Quête(s)', usedForWorkshop: 'Amélioration atelier', usedForProject: 'Projet', phase: 'Phase', level: 'Niveau', usedToCraft: 'Fabrication', recyclesToUseful: 'Recycle en matériau utile', whyKeep: 'Pourquoi garder ?', whyRecycle: 'Pourquoi recycler ?', whySell: 'Pourquoi vendre ?', recycle: 'recycler', craft: 'fabriquer' },
  de: { usedInQuest: 'Quest(s)', usedForWorkshop: 'Werkstatt-Upgrade', usedForProject: 'Projekt', phase: 'Phase', level: 'Stufe', usedToCraft: 'Herstellung', recyclesToUseful: 'Recycelt zu nützlichem Material', whyKeep: 'Warum behalten?', whyRecycle: 'Warum recyceln?', whySell: 'Warum verkaufen?', recycle: 'recyceln', craft: 'herstellen' },
  es: { usedInQuest: 'Misión(es)', usedForWorkshop: 'Mejora de taller', usedForProject: 'Proyecto', phase: 'Fase', level: 'Nivel', usedToCraft: 'Fabricación', recyclesToUseful: 'Recicla a material útil', whyKeep: '¿Por qué guardar?', whyRecycle: '¿Por qué reciclar?', whySell: '¿Por qué vender?', recycle: 'reciclar', craft: 'fabricar' },
  pt: { usedInQuest: 'Missão(ões)', usedForWorkshop: 'Melhoria de oficina', usedForProject: 'Projeto', phase: 'Fase', level: 'Nível', usedToCraft: 'Fabricação', recyclesToUseful: 'Recicla em material útil', whyKeep: 'Por que guardar?', whyRecycle: 'Por que reciclar?', whySell: 'Por que vender?', recycle: 'reciclar', craft: 'fabricar' },
  pl: { usedInQuest: 'Quest(y)', usedForWorkshop: 'Ulepszenie warsztatu', usedForProject: 'Projekt', phase: 'Faza', level: 'Poziom', usedToCraft: 'Wytwarzanie', recyclesToUseful: 'Przetwarza na przydatny materiał', whyKeep: 'Dlaczego zachować?', whyRecycle: 'Dlaczego przetworzyć?', whySell: 'Dlaczego sprzedać?', recycle: 'przetworzyć', craft: 'wytworzyć' },
  no: { usedInQuest: 'Oppdrag', usedForWorkshop: 'Verkstedoppgradering', usedForProject: 'Prosjekt', phase: 'Fase', level: 'Nivå', usedToCraft: 'Laging', recyclesToUseful: 'Resirkulerer til nyttig materiale', whyKeep: 'Hvorfor beholde?', whyRecycle: 'Hvorfor resirkulere?', whySell: 'Hvorfor selge?', recycle: 'resirkulere', craft: 'lage' },
  da: { usedInQuest: 'Mission(er)', usedForWorkshop: 'Værkstedsopgradering', usedForProject: 'Projekt', phase: 'Fase', level: 'Niveau', usedToCraft: 'Fremstilling', recyclesToUseful: 'Genbruger til nyttigt materiale', whyKeep: 'Hvorfor beholde?', whyRecycle: 'Hvorfor genbruge?', whySell: 'Hvorfor sælge?', recycle: 'genbruge', craft: 'fremstille' },
  it: { usedInQuest: 'Missione(i)', usedForWorkshop: 'Aggiornamento laboratorio', usedForProject: 'Progetto', phase: 'Fase', level: 'Livello', usedToCraft: 'Fabbricazione', recyclesToUseful: 'Ricicla in materiale utile', whyKeep: 'Perché conservare?', whyRecycle: 'Perché riciclare?', whySell: 'Perché vendere?', recycle: 'riciclare', craft: 'fabbricare' },
  ru: { usedInQuest: 'Квест(ы)', usedForWorkshop: 'Улучшение мастерской', usedForProject: 'Проект', phase: 'Фаза', level: 'Уровень', usedToCraft: 'Создание', recyclesToUseful: 'Перерабатывается в полезный материал', whyKeep: 'Зачем сохранять?', whyRecycle: 'Зачем перерабатывать?', whySell: 'Зачем продавать?', recycle: 'переработать', craft: 'создать' },
  ja: { usedInQuest: 'クエスト', usedForWorkshop: 'ワークショップアップグレード', usedForProject: 'プロジェクト', phase: 'フェーズ', level: 'レベル', usedToCraft: 'クラフト', recyclesToUseful: '有用な材料にリサイクル', whyKeep: 'なぜ保管？', whyRecycle: 'なぜリサイクル？', whySell: 'なぜ売却？', recycle: 'リサイクル', craft: 'クラフト' },
  'zh-TW': { usedInQuest: '任務', usedForWorkshop: '工作坊升級', usedForProject: '專案', phase: '階段', level: '等級', usedToCraft: '製作', recyclesToUseful: '回收為有用材料', whyKeep: '為什麼保留？', whyRecycle: '為什麼回收？', whySell: '為什麼出售？', recycle: '回收', craft: '製作' },
  uk: { usedInQuest: 'Квест(и)', usedForWorkshop: 'Покращення майстерні', usedForProject: 'Проект', phase: 'Фаза', level: 'Рівень', usedToCraft: 'Створення', recyclesToUseful: 'Переробляється в корисний матеріал', whyKeep: 'Навіщо зберігати?', whyRecycle: 'Навіщо переробляти?', whySell: 'Навіщо продавати?', recycle: 'переробити', craft: 'створити' },
  'zh-CN': { usedInQuest: '任务', usedForWorkshop: '工作坊升级', usedForProject: '项目', phase: '阶段', level: '等级', usedToCraft: '制作', recyclesToUseful: '回收为有用材料', whyKeep: '为什么保留？', whyRecycle: '为什么回收？', whySell: '为什么出售？', recycle: '回收', craft: '制作' },
  kr: { usedInQuest: '퀘스트', usedForWorkshop: '작업장 업그레이드', usedForProject: '프로젝트', phase: '단계', level: '레벨', usedToCraft: '제작', recyclesToUseful: '유용한 재료로 재활용', whyKeep: '왜 보관？', whyRecycle: '왜 재활용？', whySell: '왜 판매？', recycle: '재활용', craft: '제작' },
  tr: { usedInQuest: 'Görev(ler)', usedForWorkshop: 'Atölye yükseltmesi', usedForProject: 'Proje', phase: 'Aşama', level: 'Seviye', usedToCraft: 'Üretim', recyclesToUseful: 'Faydalı malzemeye geri dönüştürür', whyKeep: 'Neden sakla?', whyRecycle: 'Neden geri dönüştür?', whySell: 'Neden sat?', recycle: 'geri dönüştür', craft: 'üret' },
  hr: { usedInQuest: 'Zadatak/zadaci', usedForWorkshop: 'Nadogradnja radionice', usedForProject: 'Projekt', phase: 'Faza', level: 'Razina', usedToCraft: 'Izrada', recyclesToUseful: 'Reciklira u koristan materijal', whyKeep: 'Zašto zadržati?', whyRecycle: 'Zašto reciklirati?', whySell: 'Zašto prodati?', recycle: 'reciklirati', craft: 'izraditi' },
  sr: { usedInQuest: 'Zadatak/zadaci', usedForWorkshop: 'Nadogradnja radionice', usedForProject: 'Projekat', phase: 'Faza', level: 'Nivo', usedToCraft: 'Izrada', recyclesToUseful: 'Reciklira u koristan materijal', whyKeep: 'Zašto zadržati?', whyRecycle: 'Zašto reciklirati?', whySell: 'Zašto prodati?', recycle: 'reciklirati', craft: 'izraditi' }
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

  // Group workshop reasons by station
  const groupWorkshopReasons = (workshopReasons: typeof reasons.reasons) => {
    const grouped = new Map<string, { station: string; levels: string[] }>();

    workshopReasons.forEach(reason => {
      if (reason.type === 'workshop' && reason.workshopStation && reason.workshopLevel) {
        if (!grouped.has(reason.workshopStation)) {
          grouped.set(reason.workshopStation, {
            station: reason.workshopStation,
            levels: []
          });
        }
        grouped.get(reason.workshopStation)!.levels.push(reason.workshopLevel);
      }
    });

    return Array.from(grouped.values()).map(group => ({
      ...group,
      levels: [...new Set(group.levels)].sort((a, b) => parseInt(a) - parseInt(b))
    }));
  };

  // Group reasons by type
  const questReasons = reasons.reasons.filter(r => r.type === 'quest');
  const workshopReasons = reasons.reasons.filter(r => r.type === 'workshop');
  const projectReasons = reasons.reasons.filter(r => r.type === 'project');
  const craftingReasons = reasons.reasons.filter(r => r.type === 'crafting');
  const recycleReasons = reasons.reasons.filter(r => r.type === 'recycle');

  const groupedWorkshops = groupWorkshopReasons(workshopReasons);

  return (
    <div className="bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-6 mt-6">
      <div className="flex items-center gap-3 mb-4">
        <TagBadge tag={reasons.tag} label={getTagLabel(reasons.tag, language)} />
        <h3 className="text-arc-white font-bold text-lg">
          {reasons.tag === 'keep' ? labels.whyKeep : reasons.tag === 'recycle' ? labels.whyRecycle : labels.whySell}
        </h3>
      </div>

      <ul className="space-y-3">
        {/* Quest reasons - grouped together */}
        {questReasons.length > 0 && (
          <li className="text-arc-white/80">
            <div className="flex items-start gap-3">
              <FaScroll className="text-arc-yellow mt-1 flex-shrink-0" />
              <div className="flex-1">
                <strong className="text-arc-white">{labels.usedInQuest}:</strong>
                <ul className="mt-1 space-y-1">
                  {questReasons.map((reason, idx) => (
                    <li key={`quest-${idx}`}>
                      <span className="text-arc-yellow">
                        • {reason.questId ? getQuestName(reason.questId, language) : reason.questName}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Workshop reasons - grouped together by station */}
        {groupedWorkshops.length > 0 && (
          <li className="text-arc-white/80">
            <div className="flex items-start gap-3">
              <FaHammer className="text-arc-yellow mt-1 flex-shrink-0" />
              <div className="flex-1">
                <strong className="text-arc-white">{labels.usedForWorkshop}:</strong>
                <ul className="mt-1 space-y-1">
                  {groupedWorkshops.map((workshop, idx) => (
                    <li key={`workshop-${idx}`}>
                      <span className="text-arc-yellow">
                        • {workshopNames[workshop.station]?.[language] || workshop.station}
                      </span>
                      {' '}
                      <span className="text-arc-white/70">({labels.level} {workshop.levels.join(', ')})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Project reasons - grouped together */}
        {projectReasons.length > 0 && (
          <li className="text-arc-white/80">
            <div className="flex items-start gap-3">
              <FaClipboardList className="text-arc-yellow mt-1 flex-shrink-0" />
              <div className="flex-1">
                <strong className="text-arc-white">{labels.usedForProject}:</strong>
                <ul className="mt-1 space-y-1">
                  {projectReasons.map((reason, idx) => (
                    <li key={`project-${idx}`}>
                      <span className="text-arc-yellow">
                        • {reason.projectId ? getProjectName(reason.projectId, language) : reason.projectName}
                      </span>
                      {reason.projectPhase !== undefined && (
                        <>
                          {' '}
                          <span className="text-arc-white/70">({labels.phase} {reason.projectPhase})</span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Crafting reasons - grouped together */}
        {craftingReasons.length > 0 && (
          <li className="text-arc-white/80">
            <div className="flex items-start gap-3">
              <FaFlask className="text-arc-yellow mt-1 flex-shrink-0" />
              <div className="flex-1">
                <strong className="text-arc-white">{labels.usedToCraft}:</strong>
                <ul className="mt-1 space-y-1">
                  {craftingReasons.map((reason, idx) => (
                    <li key={`crafting-${idx}`}>
                      <span className="text-arc-yellow">• {getItemName(reason.craftedItemId!)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Recycle reasons */}
        {recycleReasons.map((reason, idx) => (
          <li key={`recycle-${idx}`} className="text-arc-white/80">
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
