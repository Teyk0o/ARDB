'use client';

/**
 * Components Editor
 * Edits crafting recipes, recycling components, etc.
 */

import { useState } from 'react';
import type { Item, ItemComponent } from '@/types/item';
import type { Language } from '@/lib/translations';
import { getTranslation } from '@/lib/translations';
import { FaPlus, FaTrash, FaBoxOpen } from 'react-icons/fa';
import ItemAutocomplete from './ItemAutocomplete';

interface ComponentsEditorProps {
  item: Item;
  onChange: (item: Item) => void;
  language: Language;
  allItems?: Item[];
}

export default function ComponentsEditor({ item, onChange, language, allItems = [] }: ComponentsEditorProps) {
  const t = getTranslation(language);
  const [newComponentId, setNewComponentId] = useState('');
  const [newComponentName, setNewComponentName] = useState('');
  const [newComponentQuantity, setNewComponentQuantity] = useState('1');
  const [activeSection, setActiveSection] = useState<'crafting_components' | 'recycle_components' | 'recycle_from' | 'used_in' | null>(null);

  const handleAddComponent = (field: 'recycle_components' | 'crafting_components' | 'recycle_from' | 'used_in') => {
    if (!newComponentId.trim() || !newComponentName.trim()) {
      alert('Please enter component ID and name');
      return;
    }

    const newComponent: ItemComponent = {
      component: {
        id: newComponentId,
        name: newComponentName,
      },
      quantity: parseInt(newComponentQuantity) || 1,
    };

    const currentComponents = item[field] || [];

    onChange({
      ...item,
      [field]: [...currentComponents, newComponent],
    });

    setNewComponentId('');
    setNewComponentName('');
    setNewComponentQuantity('1');
    setActiveSection(null);
  };

  const handleDeleteComponent = (
    field: 'recycle_components' | 'crafting_components' | 'recycle_from' | 'used_in',
    index: number
  ) => {
    const currentComponents = item[field] || [];
    const newComponents = currentComponents.filter((_, i) => i !== index);

    onChange({
      ...item,
      [field]: newComponents,
    });
  };

  const handleUpdateQuantity = (
    field: 'recycle_components' | 'crafting_components' | 'recycle_from' | 'used_in',
    index: number,
    quantity: number
  ) => {
    const currentComponents = item[field] || [];
    const newComponents = currentComponents.map((comp, i) =>
      i === index ? { ...comp, quantity } : comp
    );

    onChange({
      ...item,
      [field]: newComponents,
    });
  };

  const inputStyles = {
    backgroundColor: '#130918',
    border: '2px solid #2d1f38',
    color: '#ffffff'
  };

  const sections = [
    {
      field: 'crafting_components' as const,
      titleKey: 'craftingRecipeTitle' as const,
      descKey: 'craftingRecipeDesc' as const,
      icon: '🔨',
      emptyKey: 'emptyNoCraftingRecipe' as const
    },
    {
      field: 'recycle_components' as const,
      titleKey: 'recycleOutputTitle' as const,
      descKey: 'recycleOutputDesc' as const,
      icon: '♻️',
      emptyKey: 'emptyNoRecycleOutput' as const
    },
    {
      field: 'recycle_from' as const,
      titleKey: 'canBeObtainedTitle' as const,
      descKey: 'canBeObtainedDesc' as const,
      icon: '📦',
      emptyKey: 'emptyNotObtainable' as const
    },
    {
      field: 'used_in' as const,
      titleKey: 'usedInCraftingTitle' as const,
      descKey: 'usedInCraftingDesc' as const,
      icon: '🛠️',
      emptyKey: 'emptyNotUsedInRecipes' as const
    },
  ];

  const renderSection = (section: typeof sections[0]) => {
    const components = item[section.field] || [];
    const isActive = activeSection === section.field;

    return (
      <div key={section.field} className="rounded-lg p-6" style={{ backgroundColor: '#1a1120' }}>
        {/* Section Header */}
        <div className="flex items-start justify-between mb-6 pb-4" style={{ borderBottom: '2px solid #2d1f38' }}>
          <div className="flex-1">
            <h3 className="text-white font-bold text-lg mb-2 flex items-center gap-2">
              <span className="text-2xl">{section.icon}</span>
              {t[section.titleKey]}
            </h3>
            <p className="text-white/60 text-sm">{t[section.descKey]}</p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection(isActive ? null : section.field)}
            className="px-4 py-2 rounded-lg font-bold text-sm transition-all cursor-pointer flex items-center gap-2"
            style={{
              backgroundColor: isActive ? '#2d1f38' : '#f1aa1c',
              color: isActive ? '#ffffff' : '#130918'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#d99a19';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = '#f1aa1c';
              }
            }}
          >
            {isActive ? <FaTrash /> : <FaPlus />}
            {isActive ? t.cancelButton : t.addButton}
          </button>
        </div>

        {/* Existing Components */}
        {components.length > 0 ? (
          <div className="space-y-3 mb-6">
            {components.map((comp, index) => {
              const compData = comp.component || comp.item;
              const quantity = comp.quantity ?? 1;
              const componentId = compData?.id || 'Unknown';

              // Try to find the item in allItems to get the full item data
              const fullItem = allItems.find(item => item.id === componentId);

              const componentName = fullItem?.name ||
                                   compData?.name ||
                                   (fullItem?.nameTranslations && typeof fullItem.nameTranslations === 'object'
                                     ? (fullItem.nameTranslations as Record<string, string>).en || Object.values(fullItem.nameTranslations as Record<string, string>)[0]
                                     : null) ||
                                   (compData?.nameTranslations && typeof compData.nameTranslations === 'object'
                                     ? (compData.nameTranslations as Record<string, string>).en || Object.values(compData.nameTranslations as Record<string, string>)[0]
                                     : null) ||
                                   'Unknown';

              return (
                <div
                  key={index}
                  className="flex gap-3 items-center p-4 rounded-lg transition-all hover:bg-white/5"
                  style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}
                >
                  <div className="flex-1">
                    <p className="text-white font-medium text-sm mb-1">
                      {componentName}
                    </p>
                    <p className="text-white/50 text-xs font-mono">
                      {componentId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-20">
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          handleUpdateQuantity(section.field, index, parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="w-full px-3 py-2 rounded-lg text-white text-center focus:outline-none transition-all"
                        style={inputStyles}
                        onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                        onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteComponent(section.field, index)}
                      className="p-3 rounded-lg transition-all hover:bg-red-500/20 cursor-pointer"
                      style={{ color: '#ef4444' }}
                      title="Remove component"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg p-8 text-center mb-6" style={{ backgroundColor: '#130918', border: '2px dashed #2d1f38' }}>
            <div className="text-3xl mb-2">
              <FaBoxOpen className="inline-block" style={{ color: '#ffffff40' }} />
            </div>
            <p className="text-white/50 text-sm">{t[section.emptyKey]}</p>
          </div>
        )}

        {/* Add Component Form */}
        {isActive && (
          <div className="rounded-lg p-5" style={{ backgroundColor: '#130918', border: '1px solid #2d1f38' }}>
            <p className="text-white font-bold mb-4 text-sm">{t.addComponent}</p>
            <div className="space-y-3">
              <div>
                <label className="block text-white/80 text-xs mb-2 font-medium">{t.itemLabel}</label>
                <ItemAutocomplete
                  items={allItems}
                  value={newComponentId}
                  onChange={(id) => {
                    setNewComponentId(id);
                    const foundItem = allItems.find(i => i.id === id);
                    if (foundItem) {
                      setNewComponentName(foundItem.name);
                    }
                  }}
                  placeholder={t.searchItems}
                />
              </div>
              <div>
                <label className="block text-white/80 text-xs mb-2 font-medium">{t.quantity}</label>
                <input
                  type="number"
                  value={newComponentQuantity}
                  onChange={(e) => setNewComponentQuantity(e.target.value)}
                  placeholder="Qty"
                  min="1"
                  className="w-full px-3 py-2 rounded-lg text-white text-sm focus:outline-none transition-all"
                  style={inputStyles}
                  onFocus={(e) => e.target.style.borderColor = '#f1aa1c'}
                  onBlur={(e) => e.target.style.borderColor = '#2d1f38'}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComponent(section.field)}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleAddComponent(section.field)}
              className="w-full mt-3 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer flex items-center justify-center gap-2"
              style={{ backgroundColor: '#f1aa1c', color: '#130918' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d99a19'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f1aa1c'}
            >
              <FaPlus />
              {t.addComponent}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {sections.map(section => renderSection(section))}

      {/* Info Note */}
      <div className="rounded-lg p-4" style={{ backgroundColor: 'rgba(241, 170, 28, 0.1)', borderLeft: '4px solid #f1aa1c' }}>
        <p className="text-white/80 text-sm">
          💡 <strong>Tip:</strong> {t.componentIdsTip}
        </p>
      </div>
    </div>
  );
}
