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
    en: 'Gunsmith', fr: 'Armurier', es: 'Armero', de: 'Waffenschmied', 'zh-CN': '枪匠'
  },
  gear_bench: {
    en: 'Gear Bench', fr: 'Établi d\'équipement', es: 'Banco de equipo', de: 'Ausrüstungswerkbank', 'zh-CN': '装备工作台'
  },
  medical_lab: {
    en: 'Medical Lab', fr: 'Laboratoire médical', es: 'Laboratorio médico', de: 'Medizinisches Labor', 'zh-CN': '医疗实验室'
  },
  explosives_station: {
    en: 'Explosives Station', fr: 'Station d\'explosifs', es: 'Estación de explosivos', de: 'Sprengstoffstation', 'zh-CN': '爆炸物站'
  },
  utility_station: {
    en: 'Utility Station', fr: 'Station utilitaire', es: 'Estación de utilidad', de: 'Versorgungsstation', 'zh-CN': '实用站'
  },
  refiner: {
    en: 'Refiner', fr: 'Raffinerie', es: 'Refinador', de: 'Raffinerie', 'zh-CN': '精炼厂'
  },
  scrappy: {
    en: 'Scrappy', fr: 'Scrappy', es: 'Scrappy', de: 'Scrappy', 'zh-CN': 'Scrappy'
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
  es: { usedInQuest: 'Misión(es)', usedForWorkshop: 'Mejora de taller', usedForProject: 'Proyecto', phase: 'Fase', level: 'Nivel', usedToCraft: 'Fabricación', recyclesToUseful: 'Recicla a material útil', whyKeep: '¿Por qué guardar?', whyRecycle: '¿Por qué reciclar?', whySell: '¿Por qué vender?', recycle: 'reciclar', craft: 'fabricar' },
  de: { usedInQuest: 'Quest(s)', usedForWorkshop: 'Werkstatt-Upgrade', usedForProject: 'Projekt', phase: 'Phase', level: 'Stufe', usedToCraft: 'Herstellung', recyclesToUseful: 'Recycelt zu nützlichem Material', whyKeep: 'Warum behalten?', whyRecycle: 'Warum recyceln?', whySell: 'Warum verkaufen?', recycle: 'recyceln', craft: 'herstellen' },
  'zh-CN': { usedInQuest: '任务', usedForWorkshop: '工作坊升级', usedForProject: '项目', phase: '阶段', level: '等级', usedToCraft: '制作', recyclesToUseful: '回收为有用材料', whyKeep: '为什么保留？', whyRecycle: '为什么回收？', whySell: '为什么出售？', recycle: '回收', craft: '制作' }
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
    <div
      className="rounded-lg p-6 mt-6"
      style={{
        backgroundColor: '#1a1120',
        border: '1px solid #2d1f38'
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <TagBadge tag={reasons.tag} label={getTagLabel(reasons.tag, language)} />
        <h3 className="font-bold text-lg" style={{ color: '#ffffff' }}>
          {reasons.tag === 'keep' ? labels.whyKeep : reasons.tag === 'recycle' ? labels.whyRecycle : labels.whySell}
        </h3>
      </div>

      <ul className="space-y-3">
        {/* Quest reasons - grouped together */}
        {questReasons.length > 0 && (
          <li style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="flex items-start gap-3">
              <FaScroll className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
              <div className="flex-1">
                <strong style={{ color: '#ffffff' }}>{labels.usedInQuest}:</strong>
                <ul className="mt-1 space-y-1">
                  {questReasons.map((reason, idx) => (
                    <li key={`quest-${idx}`}>
                      <span style={{ color: '#f1aa1c' }}>
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
          <li style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="flex items-start gap-3">
              <FaHammer className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
              <div className="flex-1">
                <strong style={{ color: '#ffffff' }}>{labels.usedForWorkshop}:</strong>
                <ul className="mt-1 space-y-1">
                  {groupedWorkshops.map((workshop, idx) => (
                    <li key={`workshop-${idx}`}>
                      <span style={{ color: '#f1aa1c' }}>
                        • {workshopNames[workshop.station]?.[language] || workshop.station}
                      </span>
                      {' '}
                      <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>({labels.level} {workshop.levels.join(', ')})</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Project reasons - grouped together */}
        {projectReasons.length > 0 && (
          <li style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="flex items-start gap-3">
              <FaClipboardList className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
              <div className="flex-1">
                <strong style={{ color: '#ffffff' }}>{labels.usedForProject}:</strong>
                <ul className="mt-1 space-y-1">
                  {projectReasons.map((reason, idx) => (
                    <li key={`project-${idx}`}>
                      <span style={{ color: '#f1aa1c' }}>
                        • {reason.projectId ? getProjectName(reason.projectId, language) : reason.projectName}
                      </span>
                      {reason.projectPhase !== undefined && (
                        <>
                          {' '}
                          <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>({labels.phase} {reason.projectPhase})</span>
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
          <li style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <div className="flex items-start gap-3">
              <FaFlask className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
              <div className="flex-1">
                <strong style={{ color: '#ffffff' }}>{labels.usedToCraft}:</strong>
                <ul className="mt-1 space-y-1">
                  {craftingReasons.map((reason, idx) => (
                    <li key={`crafting-${idx}`}>
                      <span style={{ color: '#f1aa1c' }}>• {getItemName(reason.craftedItemId!)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        )}

        {/* Recycle reasons */}
        {recycleReasons.map((reason, idx) => (
          <li key={`recycle-${idx}`} style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            {reason.type === 'recycle' && (
              <div>
                {/* Show full chain if available */}
                {reason.chain && reason.chain.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <HiMiniArrowPath className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {reason.chain.map((step, stepIdx) => (
                          <React.Fragment key={stepIdx}>
                            {step.action === 'recycle' && (
                              <>
                                <span className="font-semibold" style={{ color: '#ffffff' }}>{getItemName(step.itemId)}</span>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>→ {capitalize(labels.recycle)} →</span>
                                <span style={{ color: '#f1aa1c' }}>{getItemName(step.targetId!)}</span>
                              </>
                            )}
                            {step.action === 'craft' && stepIdx > 0 && (
                              <>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>→ {capitalize(labels.craft)} →</span>
                                <span style={{ color: '#f1aa1c' }}>{getItemName(step.targetId!)}</span>
                              </>
                            )}
                            {step.action === 'use_in_quest' && stepIdx > 0 && (
                              <>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>→</span>
                                <span className="font-semibold" style={{ color: 'rgb(74, 222, 128)' }}>{step.questName}</span>
                              </>
                            )}
                            {step.action === 'use_in_workshop' && stepIdx > 0 && (
                              <>
                                <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>→</span>
                                <span className="font-semibold" style={{ color: 'rgb(74, 222, 128)' }}>
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
                    <HiMiniArrowPath className="mt-1 flex-shrink-0" style={{ color: '#f1aa1c' }} />
                    <span>
                      <strong style={{ color: '#ffffff' }}>{labels.recyclesToUseful}:</strong>{' '}
                      <span style={{ color: '#f1aa1c' }}>{getItemName(reason.recycleComponentId!)}</span>
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
