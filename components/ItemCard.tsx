import Image from 'next/image';
import { Item } from '@/types/item';
import { Language, getStatLabel, getRarityLabel, getItemTypeLabel } from '@/lib/translations';

interface ItemCardProps {
  item: Item;
  onClick: () => void;
  language: Language;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  Uncommon: 'bg-green-500/20 text-green-300 border-green-500/30',
  Rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Legendary: 'border-2',
};

export default function ItemCard({ item, onClick, language }: ItemCardProps) {
  const rarityClass = item.rarity ? rarityColors[item.rarity] || rarityColors.Common : rarityColors.Common;
  const isLegendary = item.rarity === 'Legendary';

  return (
    <div
      onClick={onClick}
      className="group relative bg-arc-blue-light border-2 border-arc-blue-lighter rounded-lg p-5 cursor-pointer transition-all duration-300 hover:border-arc-yellow hover:shadow-lg hover:shadow-arc-yellow/20 hover:-translate-y-1 animate-fadeIn overflow-hidden"
    >
      {/* Grain texture */}
      <div className="grain-texture absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-20 h-20 bg-arc-blue-lighter rounded-lg flex items-center justify-center overflow-hidden border-2 border-arc-white/20 group-hover:border-arc-yellow/60 transition-colors">
          {item.icon && (item.icon.startsWith('http://') || item.icon.startsWith('https://')) ? (
            <Image
              src={item.icon}
              alt={item.name}
              width={80}
              height={80}
              className="object-contain"
            />
          ) : (
            <span className="text-3xl">📦</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-arc-white text-xl leading-tight group-hover:text-arc-yellow transition-colors">
              {item.name}
            </h3>
            {item.rarity && (
              <span
                className={`text-sm px-3 py-1 rounded border whitespace-nowrap font-medium ${rarityClass}`}
                style={isLegendary ? {
                  backgroundColor: 'rgba(241, 170, 28, 0.2)',
                  color: '#f1aa1c',
                  borderColor: 'rgba(241, 170, 28, 0.4)',
                  borderWidth: '2px'
                } : undefined}
              >
                {getRarityLabel(item.rarity, language)}
              </span>
            )}
          </div>
          <p className="text-arc-white/70 text-base mt-1 font-medium">{getItemTypeLabel(item.item_type, language)}</p>

          {item.description && (
            <p className="text-arc-white/60 text-sm mt-3 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}

          {/* Stats preview */}
          {item.stat_block && Object.keys(item.stat_block).length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {Object.entries(item.stat_block)
                .filter(([_, value]) => value != null && value !== 0 && value !== undefined)
                .slice(0, 3)
                .map(([key, value]) => (
                  <div key={key} className="text-sm bg-arc-blue-lighter px-3 py-1.5 rounded border border-arc-white/20">
                    <span className="text-arc-white/60">{getStatLabel(key, language)}:</span>{' '}
                    <span className="text-arc-yellow font-bold">{value}</span>
                  </div>
                ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
