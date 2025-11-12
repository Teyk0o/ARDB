'use client';

import Image from 'next/image';
import { Item, ItemComponent } from '@/types/item';
import { Language, getTranslation, getStatLabel, getRarityLabel, getItemTypeLabel, getLootAreaLabel } from '@/lib/translations';

interface ItemDetailModalProps {
  item: Item;
  onClose: () => void;
  onItemClick: (item: Item) => void;
  language: Language;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  Uncommon: 'bg-green-500/20 text-green-300 border-green-500/30',
  Rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Legendary: 'bg-arc-yellow/20 text-arc-yellow border-arc-yellow/30',
};

function ComponentList({
  components,
  title,
  color,
  bgColor,
  onItemClick
}: {
  components: ItemComponent[];
  title: string;
  color: string;
  bgColor: string;
  onItemClick: (item: Item) => void;
}) {
  return (
    <div className={`${bgColor} border border-${color}/30 rounded-lg p-4`}>
      <h3 className={`text-${color} font-bold mb-3 flex items-center gap-2`}>
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {components.map((comp, idx) => {
          const compItem = comp.item || comp.component;
          if (!compItem) return null;
          return (
            <div
              key={idx}
              onClick={() => compItem.id && onItemClick(compItem as Item)}
              className="flex items-center gap-2 bg-arc-blue-lighter px-3 py-2 rounded border border-arc-white/10 hover:border-arc-yellow/50 cursor-pointer transition-all group"
            >
              {compItem.icon && (compItem.icon.startsWith('http://') || compItem.icon.startsWith('https://')) && (
                <Image
                  src={compItem.icon}
                  alt={compItem.name || 'Item'}
                  width={24}
                  height={24}
                  className="object-contain"
                />
              )}
              <span className="text-arc-white group-hover:text-arc-yellow transition-colors">
                {compItem.name || 'Unknown'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ItemDetailModal({ item, onClose, onItemClick, language }: ItemDetailModalProps) {
  const t = getTranslation(language);
  const rarityClass = item.rarity ? rarityColors[item.rarity] || rarityColors.Common : rarityColors.Common;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-arc-blue border-2 border-arc-yellow/30 rounded-xl max-w-4xl max-h-[90vh] overflow-y-auto relative grain-texture"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 w-10 h-10 bg-arc-blue-light hover:bg-red-500/20 rounded-full flex items-center justify-center text-arc-white text-2xl hover:text-red-400 transition-all z-50"
        >
          ✕
        </button>

        <div className="relative z-10 p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start gap-6 mb-6">
            <div className="flex-shrink-0 w-20 h-20 bg-arc-blue-lighter rounded-xl flex items-center justify-center overflow-hidden border-2 border-arc-yellow/30">
              {item.icon && (item.icon.startsWith('http://') || item.icon.startsWith('https://')) ? (
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <span className="text-4xl">📦</span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-arc-yellow mb-2">{item.name}</h2>
              <p className="text-arc-white/70 text-lg">{getItemTypeLabel(item.item_type, language)}</p>
              {item.rarity && (
                <span className={`inline-block mt-2 text-sm px-3 py-1 rounded border ${rarityClass}`}>
                  {getRarityLabel(item.rarity, language)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <div className="mb-6">
              <h3 className="text-arc-yellow font-bold mb-3 text-lg">{t.description}</h3>
              <p className="text-arc-white/90 leading-relaxed text-base">{item.description}</p>
            </div>
          )}

          {/* Stats */}
          {item.stat_block && Object.keys(item.stat_block).length > 0 && (
            <div className="mb-6">
              <h3 className="text-arc-yellow font-bold mb-4 text-lg">{t.statistics}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(item.stat_block)
                  .filter(([_, value]) => value != null && value !== 0 && value !== undefined)
                  .map(([key, value]) => (
                    <div key={key} className="bg-arc-blue-lighter px-4 py-3 rounded border-2 border-arc-white/15">
                      <div className="text-arc-white/60 text-sm font-medium">{getStatLabel(key, language)}</div>
                      <div className="text-arc-yellow font-bold text-xl mt-1">{value}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Recycle From */}
          {item.recycle_from && item.recycle_from.length > 0 && (
            <div className="mb-6">
              <ComponentList
                components={item.recycle_from}
                title={t.recycleThese}
                color="blue-400"
                bgColor="bg-blue-500/5"
                onItemClick={onItemClick}
              />
            </div>
          )}

          {/* Used In */}
          {item.used_in && item.used_in.length > 0 && (
            <div className="mb-6">
              <ComponentList
                components={item.used_in}
                title={t.requiredToCraft}
                color="arc-yellow"
                bgColor="bg-arc-yellow/5"
                onItemClick={onItemClick}
              />
            </div>
          )}

          {/* Crafting Components */}
          {(item.crafting_components || item.recipe) &&
           (item.crafting_components?.length || item.recipe?.length) && (
            <div className="mb-6">
              <ComponentList
                components={item.crafting_components || item.recipe || []}
                title={t.craftingRecipe}
                color="green-400"
                bgColor="bg-green-500/5"
                onItemClick={onItemClick}
              />
            </div>
          )}

          {/* Additional Info */}
          <div className="grid md:grid-cols-2 gap-4">
            {item.loot_area && (
              <div>
                <h3 className="text-arc-yellow font-bold mb-2">{t.lootAreas}</h3>
                <p className="text-arc-white bg-arc-blue-lighter px-4 py-2 rounded border border-arc-white/10">
                  {item.loot_area
                    .split(',')
                    .map((area) => getLootAreaLabel(area.trim(), language))
                    .join(', ')}
                </p>
              </div>
            )}

            {item.sold_by && item.sold_by.length > 0 && (
              <div>
                <h3 className="text-arc-yellow font-bold mb-2">{t.soldBy}</h3>
                <div className="space-y-2">
                  {item.sold_by.map((vendor, idx) => (
                    <div key={idx} className="text-arc-white bg-arc-blue-lighter px-4 py-2 rounded border border-arc-white/10">
                      {typeof vendor === 'string'
                        ? vendor
                        : `${vendor.trader_name || vendor.name || 'Vendor'}${vendor.price ? ` - ${vendor.price}💎` : ''}`
                      }
                    </div>
                  ))}
                </div>
              </div>
            )}

            {item.workbench && (
              <div>
                <h3 className="text-arc-yellow font-bold mb-2">{t.workbench}</h3>
                <p className="text-arc-white bg-arc-blue-lighter px-4 py-2 rounded border border-arc-white/10">
                  {item.workbench}
                </p>
              </div>
            )}

            {item.value && item.value > 0 && (
              <div>
                <h3 className="text-arc-yellow font-bold mb-2">{t.value}</h3>
                <p className="text-arc-white bg-arc-blue-lighter px-4 py-2 rounded border border-arc-white/10">
                  {item.value}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
