'use client';

/**
 * Tag Editor
 * Edits item tags (keep, sell, recycle) with structured reason builders
 */

import { useState, useEffect } from 'react';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import type { Quest, Project } from '@/lib/questsAndProjectsLoader';
import { getTranslation } from '@/lib/translations';
import { FaLock, FaDollarSign, FaPlus, FaTrash } from 'react-icons/fa';
import { HiMiniArrowPath } from 'react-icons/hi2';
import tagReasonsData from '@/data/item-tag-reasons.json';
import CustomSelect from '@/components/CustomSelect';
import ItemAutocomplete from './ItemAutocomplete';
import TextAutocomplete from './TextAutocomplete';

interface TagEditorProps {
  item: Item;
  onChange: (item: Item) => void;
  language: Language;
  allItems?: Item[];
  quests?: Quest[];
  projects?: Project[];
}

interface ActionStep {
  action: 'recycle' | 'use_in_workshop' | 'craft' | 'use_in';
  itemId?: string;
  itemName?: string;
  targetId?: string;
  targetName?: string;
  workshopStation?: string;
  workshopLevel?: string;
}

interface ActionChain {
  id: string;
  steps: ActionStep[];
}

interface KeepReason {
  id: string;
  type: 'workshop' | 'project' | 'quest';
  workshopStation?: string;
  workshopLevel?: string;
  projectId?: string;
  projectName?: string;
  projectPhase?: number;
  questId?: string;
  questName?: string;
}

const getTagOptions = (t: ReturnType<typeof getTranslation>) => [
  {
    value: '',
    label: t.noTag,
    description: t.tagNoneReason,
    icon: null,
    color: '#ffffff40',
  },
  {
    value: 'keep',
    label: t.keep,
    description: t.tagKeepReason,
    icon: FaLock,
    color: '#10b981',
  },
  {
    value: 'sell',
    label: t.sell,
    description: t.tagSellReason,
    icon: FaDollarSign,
    color: '#f59e0b',
  },
  {
    value: 'recycle',
    label: t.recycle,
    description: t.tagRecycleReason,
    icon: HiMiniArrowPath,
    color: '#3b82f6',
  },
];

export default function TagEditor({
  item,
  onChange,
  language,
  allItems = [],
  quests = [],
  projects = []
}: TagEditorProps) {
  const t = getTranslation(language);

  // Extract quest and project names for autocomplete
  const [projectSuggestions, setProjectSuggestions] = useState<string[]>([]);
  const [questSuggestions, setQuestSuggestions] = useState<string[]>([]);

  useEffect(() => {
    const projectNames = projects
      .map(project => project.name.en)
      .filter(Boolean)
      .sort();

    const questNames = quests
      .map(quest => quest.name.en)
      .filter(Boolean)
      .sort();

    setProjectSuggestions(projectNames);
    setQuestSuggestions(questNames);
  }, [projects, quests]);

  // Recycle tag state
  const [actionChains, setActionChains] = useState<ActionChain[]>([]);
  const [currentChainId, setCurrentChainId] = useState('');
  const [showAddChain, setShowAddChain] = useState(false);
  const [currentStepAction, setCurrentStepAction] = useState<'recycle' | 'use_in_workshop'>('recycle');
  const [currentTargetId, setCurrentTargetId] = useState('');
  const [currentWorkshopStation, setCurrentWorkshopStation] = useState('');
  const [currentWorkshopLevel, setCurrentWorkshopLevel] = useState('1');

  // Keep tag state
  const [keepReasons, setKeepReasons] = useState<KeepReason[]>([]);
  const [showAddKeepReason, setShowAddKeepReason] = useState(false);
  const [newKeepReasonType, setNewKeepReasonType] = useState<'workshop' | 'project' | 'quest'>('workshop');
  const [newWorkshopStation, setNewWorkshopStation] = useState('');
  const [newWorkshopLevel, setNewWorkshopLevel] = useState('1');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPhase, setNewProjectPhase] = useState('1');
  const [newQuestName, setNewQuestName] = useState('');

  // Load existing tag reasons on mount
  useEffect(() => {
    const tagReasons = (tagReasonsData as any)[item.id];

    if (tagReasons) {
      // Load recycle chains
      if (tagReasons.tag === 'recycle' && tagReasons.reasons) {
        const loadedChains: ActionChain[] = tagReasons.reasons
          .filter((reason: any) => reason.chain && Array.isArray(reason.chain))
          .map((reason: any, index: number) => ({
            id: `existing-${index}`,
            steps: reason.chain,
          }));

        if (loadedChains.length > 0) {
          setActionChains(loadedChains);
          setCurrentChainId(loadedChains[0].id);
        }
      }

      // Load keep reasons
      if (tagReasons.tag === 'keep' && tagReasons.reasons) {
        const loadedReasons: KeepReason[] = tagReasons.reasons.map((reason: any, index: number) => ({
          id: `existing-${index}`,
          type: reason.type,
          workshopStation: reason.workshopStation,
          workshopLevel: reason.workshopLevel,
          projectId: reason.projectId,
          projectName: reason.projectName,
          projectPhase: reason.projectPhase,
          questId: reason.questId,
          questName: reason.questName,
        }));

        setKeepReasons(loadedReasons);
      }
    }
  }, [item.id]);

  const handleTagChange = (tag: '' | 'keep' | 'sell' | 'recycle') => {
    onChange({
      ...item,
      tag: tag || undefined,
    });
  };

  // ============ RECYCLE HANDLERS ============
  const handleAddNewChain = () => {
    const newChainId = `chain-${Date.now()}`;
    const newChain: ActionChain = {
      id: newChainId,
      steps: [],
    };
    setActionChains([...actionChains, newChain]);
    setCurrentChainId(newChainId);
    setShowAddChain(false);
  };

  const handleRemoveChain = (chainId: string) => {
    const newChains = actionChains.filter(c => c.id !== chainId);
    setActionChains(newChains);
    if (currentChainId === chainId && newChains.length > 0) {
      setCurrentChainId(newChains[0].id);
    } else if (newChains.length === 0) {
      setCurrentChainId('');
    }
  };

  const handleAddStep = () => {
    if (!currentChainId) {
      alert(t.selectOrCreateChain);
      return;
    }

    const currentChain = actionChains.find(c => c.id === currentChainId);
    if (!currentChain) return;

    let newStep: ActionStep;

    if (currentStepAction === 'recycle') {
      if (!currentTargetId) {
        alert(t.selectTargetItem);
        return;
      }
      const targetItem = allItems.find(i => i.id === currentTargetId);
      if (!targetItem) {
        alert(t.targetItemNotFound);
        return;
      }

      const lastStep = currentChain.steps[currentChain.steps.length - 1];
      const sourceId = lastStep?.targetId || lastStep?.itemId || item.id;
      const sourceItem = allItems.find(i => i.id === sourceId) || item;

      newStep = {
        action: 'recycle',
        itemId: sourceId,
        itemName: sourceItem.name,
        targetId: targetItem.id,
        targetName: targetItem.name,
      };
    } else if (currentStepAction === 'use_in_workshop') {
      if (!currentWorkshopStation) {
        alert(t.selectWorkshopStation);
        return;
      }

      const lastStep = currentChain.steps[currentChain.steps.length - 1];
      const sourceId = lastStep?.targetId || lastStep?.itemId || item.id;
      const sourceItem = allItems.find(i => i.id === sourceId) || item;

      newStep = {
        action: 'use_in_workshop',
        itemId: sourceId,
        itemName: sourceItem.name,
        workshopStation: currentWorkshopStation,
        workshopLevel: currentWorkshopLevel,
      };
    } else {
      alert(t.actionTypeNotImplemented);
      return;
    }

    const updatedChains = actionChains.map(chain => {
      if (chain.id === currentChainId) {
        return {
          ...chain,
          steps: [...chain.steps, newStep],
        };
      }
      return chain;
    });

    setActionChains(updatedChains);
    setCurrentTargetId('');
    setCurrentWorkshopStation('');
  };

  const handleRemoveStep = (chainId: string, stepIndex: number) => {
    const updatedChains = actionChains.map(chain => {
      if (chain.id === chainId) {
        return {
          ...chain,
          steps: chain.steps.filter((_, i) => i !== stepIndex),
        };
      }
      return chain;
    });
    setActionChains(updatedChains);
  };

  // ============ KEEP HANDLERS ============
  const handleAddKeepReason = () => {
    let newReason: KeepReason;

    if (newKeepReasonType === 'workshop') {
      if (!newWorkshopStation) {
        alert(t.selectWorkshopStation);
        return;
      }
      newReason = {
        id: `reason-${Date.now()}`,
        type: 'workshop',
        workshopStation: newWorkshopStation,
        workshopLevel: newWorkshopLevel,
      };
      setNewWorkshopStation('');
    } else if (newKeepReasonType === 'project') {
      if (!newProjectName) {
        alert(t.enterProjectName);
        return;
      }
      newReason = {
        id: `reason-${Date.now()}`,
        type: 'project',
        projectId: newProjectName.toLowerCase().replace(/\s+/g, '_'),
        projectName: newProjectName,
        projectPhase: parseInt(newProjectPhase) || 1,
      };
      setNewProjectName('');
      setNewProjectPhase('1');
    } else {
      if (!newQuestName) {
        alert(t.enterQuestName);
        return;
      }
      newReason = {
        id: `reason-${Date.now()}`,
        type: 'quest',
        questId: newQuestName.toLowerCase().replace(/\s+/g, '_'),
        questName: newQuestName,
      };
      setNewQuestName('');
    }

    setKeepReasons([...keepReasons, newReason]);
    setShowAddKeepReason(false);
  };

  const handleRemoveKeepReason = (reasonId: string) => {
    setKeepReasons(keepReasons.filter(r => r.id !== reasonId));
  };

  // ============ HELPERS ============
  const getActionLabel = (action: string) => {
    switch (action) {
      case 'recycle': return t.recycle;
      case 'use_in_workshop': return t.useIn;
      default: return action;
    }
  };

  const getWorkshopName = (station: string, level: string) => {
    const stationNames: Record<string, string> = {
      refiner: t.refiner,
      gunsmith: t.gunsmith,
      gear_bench: t.gearBench,
      medical_lab: t.medicalLab,
      explosives_station: t.explosivesStation,
      utility_station: t.utilityStation,
    };
    return `${stationNames[station] || station} ${t.level}${level}`;
  };

  const inputStyles = {
    backgroundColor: '#130918',
    border: '2px solid #2d1f38',
    color: '#ffffff'
  };

  return (
    <div className="space-y-8">
      {/* Info banner */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <p className="text-white text-sm">
          💡 <strong>{t.tip}:</strong> {t.tagsTip}
        </p>
      </div>

      {/* Tag Selection */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <h3 className="text-white font-bold text-lg mb-6 pb-3" style={{ borderBottom: '2px solid #2d1f38' }}>
          {t.selectItemTag}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {getTagOptions(t).map((option) => {
            const isSelected = (item.tag || '') === option.value;
            const Icon = option.icon;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTagChange(option.value as '' | 'keep' | 'sell' | 'recycle')}
                className="p-5 rounded-lg transition-all cursor-pointer text-left"
                style={{
                  backgroundColor: isSelected ? '#130918' : 'transparent',
                  border: `2px solid ${isSelected ? option.color : '#2d1f38'}`,
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = option.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      border: `2px solid ${option.color}`,
                      backgroundColor: isSelected ? option.color : 'transparent'
                    }}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {Icon && <Icon style={{ color: option.color }} />}
                      <p className="font-bold text-white">{option.label}</p>
                    </div>
                    <p className="text-sm text-white/60">{option.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KEEP TAG EDITOR */}
      {item.tag === 'keep' && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '2px solid #10b981' }}>
          <div className="flex items-start justify-between mb-6 pb-4" style={{ borderBottom: '2px solid #2d1f38' }}>
            <div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <FaLock style={{ color: '#10b981' }} />
                {t.whyKeepThisItem}
              </h3>
              <p className="text-white/60 text-sm">{t.addReasonsWhyKeep}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAddKeepReason(!showAddKeepReason)}
              className="px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
              style={{
                backgroundColor: showAddKeepReason ? '#2d1f38' : '#f1aa1c',
                color: showAddKeepReason ? '#ffffff' : '#130918'
              }}
              onMouseEnter={(e) => {
                if (!showAddKeepReason) {
                  e.currentTarget.style.backgroundColor = '#d99a19';
                }
              }}
              onMouseLeave={(e) => {
                if (!showAddKeepReason) {
                  e.currentTarget.style.backgroundColor = '#f1aa1c';
                }
              }}
            >
              {showAddKeepReason ? <FaTrash /> : <FaPlus />}
              {showAddKeepReason ? t.cancel : t.addReason}
            </button>
          </div>

          {/* Display Keep Reasons */}
          {keepReasons.length > 0 && (
            <div className="space-y-3 mb-6">
              {keepReasons.map((reason) => (
                <div
                  key={reason.id}
                  className="flex items-start justify-between p-4 rounded-lg transition-all hover:bg-white/5"
                  style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
                >
                  <div className="flex-1">
                    {reason.type === 'workshop' && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">{t.workshopUpgrade}</p>
                        <p className="text-white font-medium" style={{ color: '#10b981' }}>
                          {getWorkshopName(reason.workshopStation!, reason.workshopLevel!)}
                        </p>
                      </div>
                    )}
                    {reason.type === 'project' && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">{t.project}</p>
                        <p className="text-white font-medium" style={{ color: '#10b981' }}>
                          {reason.projectName} ({t.phase} {reason.projectPhase})
                        </p>
                      </div>
                    )}
                    {reason.type === 'quest' && (
                      <div>
                        <p className="text-white/60 text-xs mb-1">{t.quest}</p>
                        <p className="text-white font-medium" style={{ color: '#10b981' }}>
                          {reason.questName}
                        </p>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveKeepReason(reason.id)}
                    className="ml-2 p-2 rounded-lg transition-all hover:bg-red-500/20 cursor-pointer"
                    style={{ color: '#ef4444' }}
                    title="Remove reason"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Keep Reason Form */}
          {showAddKeepReason && (
            <div className="rounded-lg p-5" style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}>
              <p className="text-white font-bold mb-4 text-sm">{t.addNewReason}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2 font-medium">{t.reasonType}</label>
                  <CustomSelect
                    value={newKeepReasonType}
                    onChange={(val) => setNewKeepReasonType(val as 'workshop' | 'project' | 'quest')}
                    options={[
                      { value: 'workshop', label: t.workshopUpgrade },
                      { value: 'project', label: t.project },
                      { value: 'quest', label: t.quest },
                    ]}
                    placeholder={t.selectReasonType}
                  />
                </div>

                {newKeepReasonType === 'workshop' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.workshopStation}</label>
                      <CustomSelect
                        value={newWorkshopStation}
                        onChange={setNewWorkshopStation}
                        options={[
                          { value: '', label: t.select },
                          { value: 'refiner', label: t.refiner },
                          { value: 'gunsmith', label: t.gunsmith },
                          { value: 'gear_bench', label: t.gearBench },
                          { value: 'medical_lab', label: t.medicalLab },
                          { value: 'explosives_station', label: t.explosivesStation },
                          { value: 'utility_station', label: t.utilityStation },
                        ]}
                        placeholder={t.selectWorkshop}
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.workshopLevel}</label>
                      <CustomSelect
                        value={newWorkshopLevel}
                        onChange={setNewWorkshopLevel}
                        options={[
                          { value: '1', label: `${t.level} 1` },
                          { value: '2', label: `${t.level} 2` },
                          { value: '3', label: `${t.level} 3` },
                        ]}
                        placeholder={t.selectLevel}
                      />
                    </div>
                  </div>
                )}

                {newKeepReasonType === 'project' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.projectName}</label>
                      <TextAutocomplete
                        value={newProjectName}
                        onChange={setNewProjectName}
                        suggestions={projectSuggestions}
                        placeholder={t.exampleProject}
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.projectPhase}</label>
                      <input
                        type="number"
                        value={newProjectPhase}
                        onChange={(e) => setNewProjectPhase(e.target.value)}
                        min="1"
                        className="w-full px-4 py-3 rounded-lg text-white focus:outline-none transition-all"
                        style={inputStyles}
                        onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                        onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                      />
                    </div>
                  </div>
                )}

                {newKeepReasonType === 'quest' && (
                  <div>
                    <label className="block text-white/80 text-sm mb-2 font-medium">{t.questName}</label>
                    <TextAutocomplete
                      value={newQuestName}
                      onChange={setNewQuestName}
                      suggestions={questSuggestions}
                      placeholder={t.exampleQuest}
                    />
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddKeepReason}
                  className="w-full px-4 py-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99a19'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1aa1c'}
                >
                  <FaPlus />
                  {t.addReason}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECYCLE TAG EDITOR */}
      {item.tag === 'recycle' && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '2px solid #3b82f6' }}>
          <div className="flex items-start justify-between mb-6 pb-4" style={{ borderBottom: '2px solid #2d1f38' }}>
            <div>
              <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
                <HiMiniArrowPath style={{ color: '#3b82f6' }} />
                {t.recyclingActionChains}
              </h3>
              <p className="text-white/60 text-sm">{t.buildChainsWhyRecycle}</p>
            </div>
            <button
              type="button"
              onClick={handleAddNewChain}
              className="px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99a19'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1aa1c'}
            >
              <FaPlus />
              {t.newChain}
            </button>
          </div>

          {/* Display All Chains */}
          {actionChains.length > 0 && (
            <div className="space-y-4 mb-6">
              {actionChains.map((chain, chainIndex) => (
                <div
                  key={chain.id}
                  className="p-4 rounded-lg transition-all cursor-pointer"
                  style={{
                    backgroundColor: currentChainId === chain.id ? '#130918' : 'transparent',
                    border: `2px solid ${currentChainId === chain.id ? '#3b82f6' : '#2d1f38'}`
                  }}
                  onClick={() => setCurrentChainId(chain.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-white/80 text-sm font-medium">
                      {t.chain} {chainIndex + 1}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveChain(chain.id);
                      }}
                      className="p-2 rounded-lg transition-all hover:bg-red-500/20 cursor-pointer"
                      style={{ color: '#ef4444' }}
                      title="Remove chain"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>

                  {chain.steps.length > 0 ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-white font-medium text-sm px-3 py-1 rounded" style={{ backgroundColor: '#3b82f6', color: '#130918' }}>
                        {item.name}
                      </span>
                      {chain.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="flex items-center gap-2">
                          <span className="text-white/60">→</span>
                          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded border border-white/10">
                            <span className="text-white/80 text-sm">
                              {getActionLabel(step.action)}
                            </span>
                            {step.action === 'recycle' && (
                              <>
                                <span className="text-white/60">→</span>
                                <span className="text-white text-sm font-medium">{step.targetName}</span>
                              </>
                            )}
                            {step.action === 'use_in_workshop' && step.workshopStation && (
                              <span className="text-white text-sm font-medium">
                                {getWorkshopName(step.workshopStation, step.workshopLevel || '1')}
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStep(chain.id, stepIndex);
                              }}
                              className="ml-1 text-red-400 hover:text-red-300 cursor-pointer"
                              title="Remove step"
                            >
                              <FaTrash className="text-xs" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-sm italic">{t.emptyChainAddSteps}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add Step Form */}
          {currentChainId && (
            <div className="rounded-lg p-5" style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}>
              <p className="text-white font-bold mb-4 text-sm">{t.addStepToChain}</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2 font-medium">{t.actionType}</label>
                  <CustomSelect
                    value={currentStepAction}
                    onChange={(val) => setCurrentStepAction(val as 'recycle' | 'use_in_workshop')}
                    options={[
                      { value: 'recycle', label: t.recycle },
                      { value: 'use_in_workshop', label: t.useInWorkshop },
                    ]}
                    placeholder={t.selectAction}
                  />
                </div>

                {currentStepAction === 'recycle' && (
                  <div>
                    <label className="block text-white/80 text-sm mb-2 font-medium">{t.resultingItem}</label>
                    <ItemAutocomplete
                      items={allItems}
                      value={currentTargetId}
                      onChange={setCurrentTargetId}
                      placeholder={t.searchItem}
                    />
                  </div>
                )}

                {currentStepAction === 'use_in_workshop' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.workshopStation}</label>
                      <CustomSelect
                        value={currentWorkshopStation}
                        onChange={setCurrentWorkshopStation}
                        options={[
                          { value: '', label: t.select },
                          { value: 'refiner', label: t.refiner },
                          { value: 'gunsmith', label: t.gunsmith },
                          { value: 'gear_bench', label: t.gearBench },
                          { value: 'medical_lab', label: t.medicalLab },
                          { value: 'explosives_station', label: t.explosivesStation },
                          { value: 'utility_station', label: t.utilityStation },
                        ]}
                        placeholder={t.selectWorkshop}
                      />
                    </div>
                    <div>
                      <label className="block text-white/80 text-sm mb-2 font-medium">{t.workshopLevel}</label>
                      <CustomSelect
                        value={currentWorkshopLevel}
                        onChange={setCurrentWorkshopLevel}
                        options={[
                          { value: '1', label: `${t.level} 1` },
                          { value: '2', label: `${t.level} 2` },
                          { value: '3', label: `${t.level} 3` },
                        ]}
                        placeholder={t.selectLevel}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleAddStep}
                  className="w-full px-4 py-3 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99a19'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1aa1c'}
                >
                  <FaPlus />
                  {t.addStep}
                </button>
              </div>
            </div>
          )}

          {!currentChainId && actionChains.length === 0 && (
            <div className="rounded-lg p-8 text-center" style={{ backgroundColor: '#130918', border: '2px dashed #2d1f38' }}>
              <div className="text-3xl mb-2">
                <HiMiniArrowPath className="inline-block" style={{ color: '#ffffff40' }} />
              </div>
              <p className="text-white/50 text-sm">{t.noActionChains}</p>
            </div>
          )}
        </div>
      )}

      {/* SELL TAG INFO */}
      {item.tag === 'sell' && (
        <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '2px solid #f59e0b' }}>
          <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
            <FaDollarSign style={{ color: '#f59e0b' }} />
            {t.sellTagActive}
          </h3>
          <p className="text-white/60 text-sm">
            {t.sellTagInfo}
          </p>
        </div>
      )}
    </div>
  );
}
