'use client';

/**
 * Item Edit Form
 * Comprehensive form for editing all item fields
 */

import { useState, useEffect } from 'react';
import type { Item } from '@/types/item';
import type { Language } from '@/lib/translations';
import type { Quest, Project } from '@/lib/questsAndProjectsLoader';
import { getTranslation } from '@/lib/translations';
import TranslationEditor from './TranslationEditor';
import MetadataEditor from './MetadataEditor';
import StatsEditor from './StatsEditor';
import ComponentsEditor from './ComponentsEditor';
import TagEditor from './TagEditor';
import { FaSave, FaUndo, FaGlobe, FaClipboardList, FaChartBar, FaHammer, FaTag } from 'react-icons/fa';

interface ItemEditFormProps {
  item: Item;
  language: Language;
  onSubmit: (editedData: Item, reason?: string) => void;
  isSubmitting: boolean;
  allItems?: Item[];
  quests?: Quest[];
  projects?: Project[];
}

export default function ItemEditForm({
  item,
  language,
  onSubmit,
  isSubmitting,
  allItems = [],
  quests = [],
  projects = [],
}: ItemEditFormProps) {
  const t = getTranslation(language);
  const [editedItem, setEditedItem] = useState<Item>(item);
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<'translations' | 'metadata' | 'stats' | 'crafting' | 'tags'>('translations');

  // Reset form when item changes
  useEffect(() => {
    setEditedItem(item);
  }, [item]);

  const handleReset = () => {
    setEditedItem(item);
    setReason('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if anything changed
    let hasChanges = false;
    for (const key in editedItem) {
      const itemKey = key as keyof Item;
      if (JSON.stringify(editedItem[itemKey]) !== JSON.stringify(item[itemKey])) {
        hasChanges = true;
        break;
      }
    }

    // Don't submit if nothing changed
    if (!hasChanges) {
      alert(t.noChangesDetected);
      return;
    }

    // Submit the entire edited item, not just changed fields
    onSubmit(editedItem, reason || undefined);
  };

  const tabs = [
    { id: 'translations' as const, label: t.tabTranslations, Icon: FaGlobe, description: t.tabDescTranslations },
    { id: 'metadata' as const, label: t.tabMetadata, Icon: FaClipboardList, description: t.tabDescMetadata },
    { id: 'stats' as const, label: t.tabStats, Icon: FaChartBar, description: t.tabDescStats },
    { id: 'crafting' as const, label: t.tabCrafting, Icon: FaHammer, description: t.tabDescCrafting },
    { id: 'tags' as const, label: t.tabTags, Icon: FaTag, description: t.tabDescTags },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tabs Navigation */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
        <div className="grid grid-cols-2 md:grid-cols-5">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative p-4 md:p-6 text-left transition-all cursor-pointer"
              style={{
                backgroundColor: activeTab === tab.id ? '#130918' : 'transparent',
                borderRight: index < tabs.length - 1 ? '1px solid #2d1f38' : 'none',
                borderBottom: activeTab === tab.id ? '3px solid #f1aa1c' : '3px solid transparent',
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <tab.Icon
                  className="text-xl"
                  style={{ color: activeTab === tab.id ? '#f1aa1c' : '#ffffff60' }}
                />
                <span
                  className="font-bold text-sm md:text-base"
                  style={{ color: activeTab === tab.id ? '#ffffff' : '#ffffff80' }}
                >
                  {tab.label}
                </span>
              </div>
              <p
                className="text-xs hidden md:block"
                style={{ color: activeTab === tab.id ? '#ffffff60' : '#ffffff40' }}
              >
                {tab.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'translations' && (
          <TranslationEditor
            item={editedItem}
            onChange={setEditedItem}
            language={language}
          />
        )}

        {activeTab === 'metadata' && (
          <MetadataEditor
            item={editedItem}
            onChange={setEditedItem}
            language={language}
          />
        )}

        {activeTab === 'stats' && (
          <StatsEditor
            item={editedItem}
            onChange={setEditedItem}
            language={language}
          />
        )}

        {activeTab === 'crafting' && (
          <ComponentsEditor
            item={editedItem}
            onChange={setEditedItem}
            language={language}
            allItems={allItems}
          />
        )}

        {activeTab === 'tags' && (
          <TagEditor
            item={editedItem}
            onChange={setEditedItem}
            language={language}
            allItems={allItems}
            quests={quests}
            projects={projects}
          />
        )}
      </div>

      {/* Reason for Edit */}
      <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        <label className="block text-white font-bold text-lg mb-4">
          {t.reasonForChanges}
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t.reasonPlaceholder}
          rows={4}
          className="w-full px-4 py-3 rounded-lg text-white placeholder-white/30 focus:outline-none resize-y transition-all"
          style={{
            backgroundColor: '#130918',
            border: '2px solid #2d1f38'
          }}
          onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
          onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
        />
        <p className="text-white/50 text-sm mt-3">
          {t.reasonHelp}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold text-lg transition-all disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: isSubmitting ? '#2d1f38' : '#f1aa1c',
            color: '#130918'
          }}
          onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#d99a19')}
          onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.backgroundColor = '#f1aa1c')}
        >
          <FaSave />
          <span>{isSubmitting ? t.submitting : t.submitForReview}</span>
        </button>

        <button
          type="button"
          onClick={handleReset}
          disabled={isSubmitting}
          className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
          style={{
            backgroundColor: '#2d1f38',
            color: '#ffffff',
            border: '2px solid #2d1f38'
          }}
          onMouseEnter={(e) => !isSubmitting && (e.currentTarget.style.borderColor = '#f1aa1c')}
          onMouseLeave={(e) => !isSubmitting && (e.currentTarget.style.borderColor = '#2d1f38')}
        >
          <FaUndo />
          <span>{t.resetChanges}</span>
        </button>
      </div>

      {/* Submission Guidelines */}
      <div className="rounded-lg p-6" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <h3 className="text-white font-bold mb-3 text-lg">📋 {t.submissionGuidelines}</h3>
        <ul className="text-white/80 space-y-2">
          <li className="flex items-start gap-2">
            <span style={{ color: '#f1aa1c' }}>•</span>
            <span>{t.guidelineAccurate}</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#f1aa1c' }}>•</span>
            <span>{t.guidelineSpelling}</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#f1aa1c' }}>•</span>
            <span>{t.guidelineReview}</span>
          </li>
          <li className="flex items-start gap-2">
            <span style={{ color: '#f1aa1c' }}>•</span>
            <span>{t.guidelineTrack}</span>
          </li>
        </ul>
      </div>
    </form>
  );
}
