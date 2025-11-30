'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Item, ItemComponent } from '@/types/item';
import { Language } from '@/lib/translations';
import { useCraftRelationships } from '@/lib/useCraftRelationships';

interface CraftRelationshipsAccordionProps {
  item: Item;
  onItemClick: (item: Item) => void;
  language: Language;
  allItems?: Item[];
}

interface AccordionSection {
  id: string;
  title: string;
  icon: string;
  components: ItemComponent[];
  color: string;
  bgColor: string;
  borderColor: string;
}

function ItemChip({
  item,
  onClick,
  quantity,
}: {
  item: Item | undefined;
  onClick: () => void;
  quantity?: number;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  if (!item) return null;

  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all group"
      style={{
        backgroundColor: '#130918',
        border: '1px solid #2d1f38'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#f1aa1c';
        e.currentTarget.style.backgroundColor = '#1a1120';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#2d1f38';
        e.currentTarget.style.backgroundColor = '#130918';
      }}
    >
      {item.icon && (item.icon.startsWith('http://') || item.icon.startsWith('https://')) && !imageFailed ? (
        <Image
          src={item.icon}
          alt={item.name || 'Item'}
          width={24}
          height={24}
          className="object-contain"
          onError={() => setImageFailed(true)}
        />
      ) : item.icon && (item.icon.startsWith('http://') || item.icon.startsWith('https://')) ? (
        <span className="text-sm">❌</span>
      ) : null}
      <span className="text-white transition-colors">
        {item.name || 'Unknown'}
      </span>
      {quantity && quantity > 1 && (
        <span className="ml-1 text-sm font-semibold" style={{ color: 'rgba(241, 170, 28, 0.7)' }}>
          x{quantity}
        </span>
      )}
    </button>
  );
}

function AccordionItem({
  section,
  isOpen,
  onToggle,
  onItemClick,
}: {
  section: AccordionSection;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: (item: Item) => void;
}) {
  return (
    <div
      className="rounded-lg overflow-hidden transition-all"
      style={{ border: '1px solid #2d1f38' }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between transition-all cursor-pointer"
        style={{
          backgroundColor: '#1a1120',
          border: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(26, 17, 32, 0.7)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#1a1120';
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className="font-bold" style={{ color: section.color }}>
            {section.title}
          </span>
          <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            ({section.components.length})
          </span>
        </div>
        <span
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          style={{ color: 'rgba(255, 255, 255, 0.6)' }}
        >
          ▼
        </span>
      </button>

      {/* Content */}
      {isOpen && section.components.length > 0 && (
        <div
          className="p-4"
          style={{
            backgroundColor: 'rgba(26, 17, 32, 0.5)',
            borderTop: '1px solid #2d1f38'
          }}
        >
          <div className="flex flex-wrap gap-2">
            {section.components.map((comp, idx) => {
              const compItem = comp.item || comp.component;
              return (
                <ItemChip
                  key={idx}
                  item={compItem as Item | undefined}
                  onClick={() => {
                    if (compItem?.id) {
                      onItemClick(compItem as Item);
                    }
                  }}
                  quantity={comp.quantity}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {isOpen && section.components.length === 0 && (
        <div
          className="p-4 text-sm"
          style={{
            backgroundColor: 'rgba(26, 17, 32, 0.5)',
            borderTop: '1px solid #2d1f38',
            color: 'rgba(255, 255, 255, 0.5)'
          }}
        >
          Aucun item
        </div>
      )}
    </div>
  );
}

export default function CraftRelationshipsAccordion({
  item,
  onItemClick,
  language,
  allItems = [],
}: CraftRelationshipsAccordionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Calculate bidirectional craft relationships
  const relationships = useCraftRelationships(item, allItems);

  // Translate craft relation titles based on language
  const getTitles = () => {
    const titles: Record<Language, Record<string, string>> = {
      en: {
        recycle_components: 'Items Obtained from Recycling',
        used_in: 'Component Used For',
        recipe: 'Required Ingredients',
        recycle_from: 'Recycle These to Get It',
      },
      fr: {
        recycle_components: 'Items obtenus par recyclage',
        used_in: 'Composant utilisé pour',
        recipe: 'Ingrédients nécessaires',
        recycle_from: 'À recycler pour l\'obtenir',
      },
      de: {
        recycle_components: 'Aus Recycling erhalten',
        used_in: 'Komponente verwendet für',
        recipe: 'Erforderliche Zutaten',
        recycle_from: 'Dies recyceln um es zu bekommen',
      },
      es: {
        recycle_components: 'Objetos obtenidos al reciclar',
        used_in: 'Componente utilizado para',
        recipe: 'Ingredientes requeridos',
        recycle_from: 'Recicla esto para obtenerlo',
      },
      'zh-CN': {
        recycle_components: '回收获得的物品',
        used_in: '组件用于',
        recipe: '所需材料',
        recycle_from: '回收此物品来获得',
      },
    };
    return titles[language] || titles.en;
  };

  const titles = getTitles();

  // Build accordion sections using calculated relationships
  const sections: AccordionSection[] = [
    {
      id: 'recycle_components',
      title: titles.recycle_components,
      icon: '',
      components: relationships.recycle_components,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/5',
      borderColor: 'border-blue-500/30',
    },
    {
      id: 'used_in',
      title: titles.used_in,
      icon: '',
      components: relationships.used_in,
      color: 'text-arc-yellow',
      bgColor: 'bg-arc-yellow/5',
      borderColor: 'border-arc-yellow/30',
    },
    {
      id: 'recipe',
      title: titles.recipe,
      icon: '',
      components: relationships.recipe,
      color: 'text-green-400',
      bgColor: 'bg-green-500/5',
      borderColor: 'border-green-500/30',
    },
    {
      id: 'recycle_from',
      title: titles.recycle_from,
      icon: '',
      components: relationships.recycle_from,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/5',
      borderColor: 'border-purple-500/30',
    },
  ];

  // Filter out empty sections
  const visibleSections = sections.filter((s) => s.components.length > 0);

  // If no craft relations, show a message
  if (visibleSections.length === 0) {
    return (
      <div
        className="rounded-lg p-4 text-center"
        style={{
          backgroundColor: 'rgba(26, 17, 32, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'rgba(255, 255, 255, 0.6)'
        }}
      >
        {language === 'fr' ? 'Aucune relation de craft' : 'No craft relationships'}
      </div>
    );
  }

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <div className="space-y-3">
      {visibleSections.map((section) => (
        <AccordionItem
          key={section.id}
          section={section}
          isOpen={expandedSections.has(section.id)}
          onToggle={() => toggleSection(section.id)}
          onItemClick={onItemClick}
        />
      ))}
    </div>
  );
}
