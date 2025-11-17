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
      className="flex items-center gap-2 bg-arc-blue-lighter px-3 py-2 rounded border border-arc-white/10 hover:border-arc-yellow/50 cursor-pointer transition-all group hover:bg-arc-blue"
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
      <span className="text-arc-white group-hover:text-arc-yellow transition-colors">
        {item.name || 'Unknown'}
      </span>
      {quantity && quantity > 1 && (
        <span className="ml-1 text-arc-yellow/70 text-sm font-semibold">
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
    <div className={`border rounded-lg overflow-hidden transition-all ${section.borderColor}`}>
      {/* Header */}
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 flex items-center justify-between ${section.bgColor} hover:${section.bgColor.replace('/', '/60')} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className={`font-bold ${section.color}`}>{section.title}</span>
          <span className={`text-sm ${section.color}/70`}>
            ({section.components.length})
          </span>
        </div>
        <span
          className={`text-arc-white/60 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Content */}
      {isOpen && section.components.length > 0 && (
        <div className={`p-4 bg-arc-blue-lighter/50 border-t ${section.borderColor}`}>
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
        <div className={`p-4 bg-arc-blue-lighter/50 border-t ${section.borderColor} text-arc-white/50 text-sm`}>
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
      pt: {
        recycle_components: 'Itens obtidos pela reciclagem',
        used_in: 'Componente utilizado para',
        recipe: 'Ingredientes necessários',
        recycle_from: 'Recicle isto para obtê-lo',
      },
      pl: {
        recycle_components: 'Przedmioty uzyskane z recyklingu',
        used_in: 'Komponent użyty do',
        recipe: 'Wymagane składniki',
        recycle_from: 'Przetwórz to aby to uzyskać',
      },
      no: {
        recycle_components: 'Gjenstander oppnådd fra gjenvinning',
        used_in: 'Komponent brukt til',
        recipe: 'Nødvendige ingredienser',
        recycle_from: 'Gjenvin dette for å få det',
      },
      da: {
        recycle_components: 'Genstande opnået fra genbrug',
        used_in: 'Komponent brugt til',
        recipe: 'Påkrævede ingredienser',
        recycle_from: 'Genbrug dette for at få det',
      },
      it: {
        recycle_components: 'Oggetti ottenuti dal riciclaggio',
        used_in: 'Componente utilizzato per',
        recipe: 'Ingredienti richiesti',
        recycle_from: 'Ricicla questo per ottenerlo',
      },
      ru: {
        recycle_components: 'Предметы, полученные из переработки',
        used_in: 'Компонент используется для',
        recipe: 'Требуемые ингредиенты',
        recycle_from: 'Переработайте это чтобы получить',
      },
      ja: {
        recycle_components: 'リサイクルで入手できるアイテム',
        used_in: 'コンポーネント使用用途',
        recipe: '必要な材料',
        recycle_from: 'これをリサイクルして入手',
      },
      'zh-TW': {
        recycle_components: '回收獲得的物品',
        used_in: '組件用於',
        recipe: '所需材料',
        recycle_from: '回收此物品來獲得',
      },
      uk: {
        recycle_components: 'Предмети отримані з переробки',
        used_in: 'Компонент використовується для',
        recipe: 'Необхідні інгредієнти',
        recycle_from: 'Переробіть це щоб отримати',
      },
      'zh-CN': {
        recycle_components: '回收获得的物品',
        used_in: '组件用于',
        recipe: '所需材料',
        recycle_from: '回收此物品来获得',
      },
      kr: {
        recycle_components: '재활용으로 획득한 항목',
        used_in: '구성 요소 사용 대상',
        recipe: '필요한 재료',
        recycle_from: '이를 재활용하여 획득',
      },
      tr: {
        recycle_components: 'Geri dönüşümden elde edilen öğeler',
        used_in: 'Bileşen kullanıldığı yer',
        recipe: 'Gerekli malzemeler',
        recycle_from: 'Bunu elde etmek için geri dönüştür',
      },
      hr: {
        recycle_components: 'Stavke dobivene recikliranjem',
        used_in: 'Komponenta korištena za',
        recipe: 'Potrebni sastojci',
        recycle_from: 'Reciklirajte ovo da biste ga dobili',
      },
      sr: {
        recycle_components: 'Ставке добијене рециклирањем',
        used_in: 'Компонента коришћена за',
        recipe: 'Потребни састојци',
        recycle_from: 'Рециклирајте ово да бисте га добили',
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
      <div className="bg-arc-blue-lighter/30 border border-arc-white/10 rounded-lg p-4 text-center text-arc-white/60">
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
