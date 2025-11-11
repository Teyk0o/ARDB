'use client';

import { useState, useMemo } from 'react';
import { Item, FilterOptions } from '@/types/item';
import ItemCard from './ItemCard';
import ItemDetailModal from './ItemDetailModal';
import CustomSelect from './CustomSelect';
import { Language, getTranslation } from '@/lib/translations';

interface ItemsPageProps {
  items: Item[];
}

export default function ItemsPage({ items }: ItemsPageProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    rarity: 'all',
  });
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [language, setLanguage] = useState<Language>('en');

  const t = getTranslation(language);

  // Extract unique types and rarities
  const { types, rarities } = useMemo(() => {
    const typesSet = new Set<string>();
    const raritiesSet = new Set<string>();

    items.forEach((item) => {
      if (item.item_type) typesSet.add(item.item_type);
      if (item.rarity) raritiesSet.add(item.rarity);
    });

    return {
      types: Array.from(typesSet).sort(),
      rarities: Array.from(raritiesSet).sort(),
    };
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        if (
          !item.name.toLowerCase().includes(searchLower) &&
          !item.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== 'all' && item.item_type !== filters.type) {
        return false;
      }

      // Rarity filter
      if (filters.rarity !== 'all' && item.rarity !== filters.rarity) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              <img
                src="/ARC_Raider_Stacked_White_Color.png"
                alt="Arc Raiders"
                className="h-24 md:h-28 w-auto mb-2"
              />
              <p className="text-xl text-arc-white/70">{t.subtitle}</p>
            </div>
            {/* Language Selector */}
            <div className="flex-shrink-0">
              <CustomSelect
                value={language}
                onChange={(value) => setLanguage(value as Language)}
                options={[
                  { value: 'en', label: '🇬🇧 English' },
                  { value: 'fr', label: '🇫🇷 Français' },
                ]}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 bg-arc-blue-light/95 backdrop-blur-md border-b border-arc-blue-lighter shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full bg-arc-blue border-2 border-arc-blue-lighter focus:border-arc-yellow rounded-lg px-4 py-3 text-arc-white placeholder-arc-white/40 outline-none transition-colors"
              />
            </div>

            {/* Type Filter */}
            <CustomSelect
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
              options={[
                { value: 'all', label: t.allTypes },
                ...types.map(type => ({ value: type, label: type }))
              ]}
            />

            {/* Rarity Filter */}
            <CustomSelect
              value={filters.rarity}
              onChange={(value) => setFilters({ ...filters, rarity: value })}
              options={[
                { value: 'all', label: t.allRarities },
                ...rarities.map(rarity => ({ value: rarity, label: rarity }))
              ]}
            />
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="text-arc-white/50">{t.showing}</span>{' '}
              <span className="text-arc-yellow font-bold">{filteredItems.length}</span>{' '}
              <span className="text-arc-white/70">{t.items}</span>
            </div>
            <div>
              <span className="text-arc-white/50">{t.total}</span>{' '}
              <span className="text-arc-yellow font-bold">{items.length}</span>{' '}
              <span className="text-arc-white/70">{t.items}</span>
            </div>
            <div>
              <span className="text-arc-white/50">{t.types}</span>{' '}
              <span className="text-arc-yellow font-bold">{types.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="container mx-auto px-4 py-8">
        {filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-arc-white mb-2">{t.noItemsFound}</h3>
            <p className="text-arc-white/60">{t.tryAdjusting}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onClick={() => setSelectedItem(item)}
                language={language}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/70 text-base font-medium mb-3">{t.disclaimer}</p>
          <p className="text-arc-white/50 text-sm mb-2">{t.credits}</p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-arc-white/60 text-sm">{t.openSource}</span>
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="text-arc-yellow hover:text-arc-yellow/80 font-bold text-sm transition-colors underline"
            >
              {t.github}
            </a>
          </div>
          <p className="text-arc-white/50 text-xs mb-2">{t.license}</p>
          <p className="text-arc-white/40 text-sm">{t.footer}</p>
        </div>
      </footer>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemClick={(item) => setSelectedItem(item)}
          language={language}
        />
      )}
    </div>
  );
}
