'use client';

import { useState, useMemo, useEffect, memo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Item, FilterOptions } from '@/types/item';
import ItemCard from './ItemCard';
import MainHeader from './MainHeader';
import MultiSelect from './MultiSelect';
import LoadingSpinner from './LoadingSpinner';
import SearchWithHistory from './SearchWithHistory';
import { Language, getTranslation, getItemTypeLabel, getRarityLabel, getTagLabel } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import { useItems } from '@/lib/useItems';
import { matchesSearchMultiLang } from '@/lib/searchUtils';
import { useFilteredTags, applyFilteredTags } from '@/hooks/useFilteredTags';
import { useCompletions } from '@/contexts/CompletionsContext';

interface ItemsPageProps {
  initialFilters?: { [key: string]: string | string[] | undefined };
}

// Memoized ItemCard wrapper to prevent unnecessary re-renders
const MemoizedItemCard = memo(({ item, onClick, language }: { item: Item; onClick: () => void; language: Language }) => (
  <ItemCard item={item} onClick={onClick} language={language} />
));

export default function ItemsPage({ initialFilters = {} }: ItemsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showFilters, setShowFilters] = useState(false);

  const [language, setLanguage] = useState<Language>(() => {
    // Load language from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(saved)) {
        return saved;
      }
    }
    return 'en';
  });
  const { items: rawItems, loading: itemsLoading } = useItems(language);

  // Apply filtered tags based on user completions
  const { filteredTags, isLoading: tagsLoading } = useFilteredTags();
  const completionsContext = useCompletions();
  const completionsStats = completionsContext?.getStats() || { total: 0, quests: 0, projects: 0, workshops: 0 };

  // Apply filtered tags to items
  const displayItems = useMemo(() => {
    return applyFilteredTags(rawItems, filteredTags);
  }, [rawItems, filteredTags]);

  const getInitialTypes = () => {
    if (initialFilters.type) {
      const type = Array.isArray(initialFilters.type) ? initialFilters.type[0] : initialFilters.type;
      return [type];
    }
    if (initialFilters.types) {
      const types = typeof initialFilters.types === 'string' ? initialFilters.types.split(',') : initialFilters.types;
      return Array.isArray(types) ? types : [types];
    }
    return [];
  };

  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    types: getInitialTypes(),
    rarities: [],
    tags: [],
  });

  // Sync language to localStorage for ContributionBanner
  useEffect(() => {
    localStorage.setItem('arc-db-language', language);
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('storage'));
  }, [language]);

  // Sync filters with URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) {
      params.set('search', filters.search);
    }
    if (filters.types.length > 0) {
      params.set('types', filters.types.join(','));
    }
    if (filters.rarities.length > 0) {
      params.set('rarities', filters.rarities.join(','));
    }
    if (filters.tags.length > 0) {
      params.set('tags', filters.tags.join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : '/';
    router.push(newUrl, { scroll: false } as any);
  }, [filters, router]);

  const resetFilters = () => {
    setFilters({
      search: '',
      types: [],
      rarities: [],
      tags: [],
    });
  };

  const t = getTranslation(language);

  // Extract unique types, rarities, and tags
  const { types, rarities, tags } = useMemo(() => {
    const typesSet = new Set<string>();
    const raritiesSet = new Set<string>();
    const tagsSet = new Set<string>();

    displayItems.forEach((item) => {
      if (item.item_type) typesSet.add(item.item_type);
      if (item.rarity) raritiesSet.add(item.rarity);
      if (item.tag) tagsSet.add(item.tag);
    });

    return {
      types: Array.from(typesSet).sort(),
      rarities: Array.from(raritiesSet).sort(),
      tags: Array.from(tagsSet).sort(),
    };
  }, [displayItems]);

  // Filter items (already translated from API)
  const filteredItems = useMemo(() => {
    let filtered = displayItems.filter((item) => {
      // Type filter (multiple selection)
      if (filters.types.length > 0 && !filters.types.includes(item.item_type)) {
        return false;
      }

      // Rarity filter (multiple selection)
      if (filters.rarities.length > 0 && !filters.rarities.includes(item.rarity || '')) {
        return false;
      }

      // Tag filter (multiple selection)
      if (filters.tags.length > 0 && !filters.tags.includes(item.tag || '')) {
        return false;
      }

      return true;
    });

    // Search filter with multi-language support
    // Searches across all available language translations, not just the current UI language
    if (filters.search) {
      filtered = filtered.filter((item) => {
        return matchesSearchMultiLang(
          item.nameTranslations || item.name,
          item.descriptionTranslations || item.description,
          filters.search
        );
      });
    }

    return filtered;
  }, [displayItems, filters]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      {/* Header */}
      <MainHeader language={language} setLanguage={setLanguage} />

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 backdrop-blur-md shadow-lg" style={{ backgroundColor: 'rgba(26, 17, 32, 0.95)', borderBottom: '1px solid #2d1f38' }}>
        <div className="container mx-auto px-4 py-3 lg:py-4">
          {/* Search bar with toggle button */}
          <div className="flex gap-3 lg:gap-4 mb-0 lg:mb-4">
            {/* Search - Full width on mobile/tablet, flexible on desktop */}
            <SearchWithHistory
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
              placeholder={t.searchPlaceholder}
              language={language}
            />

            {/* Filter toggle button - Only visible on mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden rounded-lg px-4 py-3 font-medium transition-all cursor-pointer whitespace-nowrap"
              style={{
                backgroundColor: showFilters ? '#f1aa1c' : '#2d1f38',
                color: showFilters ? '#130918' : '#ffffff',
                border: `1px solid ${showFilters ? '#f1aa1c' : '#2d1f38'}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = showFilters ? '#f1aa1c' : '#2d1f38';
                e.currentTarget.style.opacity = '1';
              }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
          </div>

          {/* Filters section - Collapsible on mobile, always visible on desktop */}
          <div className={`flex flex-col lg:flex-row gap-3 lg:gap-4 mt-3 lg:mt-0 transition-all ${!showFilters ? 'hidden lg:flex' : ''}`}>
            {/* Type Filter */}
            <div className="w-full lg:w-auto">
              <MultiSelect
                values={filters.types}
                onChange={(selectedTypes) => setFilters({ ...filters, types: selectedTypes })}
                options={types.map(type => ({ value: type, label: getItemTypeLabel(type, language) }))}
                placeholder={t.allTypes}
              />
            </div>

            {/* Rarity Filter */}
            <div className="w-full lg:w-auto">
              <MultiSelect
                values={filters.rarities}
                onChange={(selectedRarities) => setFilters({ ...filters, rarities: selectedRarities })}
                options={rarities.map(rarity => ({ value: rarity, label: rarity ? getRarityLabel(rarity, language) : 'Unknown' }))}
                placeholder={t.allRarities}
              />
            </div>

            {/* Tag Filter */}
            <div className="w-full lg:w-auto">
              <MultiSelect
                values={filters.tags}
                onChange={(selectedTags) => setFilters({ ...filters, tags: selectedTags })}
                options={tags.map(tag => ({ value: tag, label: getTagLabel(tag as 'keep' | 'sell' | 'recycle', language) }))}
                placeholder={t.allTags}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              disabled={filters.search === '' && filters.types.length === 0 && filters.rarities.length === 0 && filters.tags.length === 0}
              className="w-full lg:w-auto rounded-lg px-4 py-3 font-medium transition-all whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#2d1f38',
                color: '#ffffff',
                border: '1px solid #2d1f38'
              }}
              onMouseEnter={(e) => {
                if (filters.search !== '' || filters.types.length > 0 || filters.rarities.length > 0 || filters.tags.length > 0) {
                  e.currentTarget.style.borderColor = '#f1aa1c';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
              }}
            >
              Reset
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 text-sm">
            <div>
              <span className="text-white/50">{t.showing}</span>{' '}
              <span className="font-bold" style={{ color: '#f1aa1c' }}>{filteredItems.length}</span>{' '}
              <span className="text-white/70">{t.items}</span>
            </div>

            {/* Completions Indicator */}
            {completionsStats.total > 0 && (
              <Link href="/progress" className="transition-opacity hover:opacity-80">
                <span className="text-white/50">{t.completions || 'Completions'}:</span>{' '}
                <span className="font-bold" style={{ color: '#22c55e' }}>{completionsStats.total}</span>{' '}
                <span className="text-white/70">{t.active || 'active'}</span>
              </Link>
            )}

            <div>
              <span className="text-white/50">{t.total}</span>{' '}
              <span className="font-bold" style={{ color: '#f1aa1c' }}>{displayItems.length}</span>{' '}
              <span className="text-white/70">{t.items}</span>
            </div>
            <div>
              <span className="text-white/50">{t.types}</span>{' '}
              <span className="font-bold" style={{ color: '#f1aa1c' }}>{types.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="sr-only">Arc Raiders Item Database - Complete Guide and Crafting Recipes</h1>
        {itemsLoading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 rounded-lg" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-white mb-2">{t.noItemsFound}</h2>
            <p className="text-white/60">{t.tryAdjusting}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <MemoizedItemCard
                key={item.id}
                item={item}
                onClick={() => router.push(`/items/${generateSlug(item.nameEn || item.name)}`)}
                language={language}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8" style={{ borderTop: '1px solid #2d1f38' }}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/70 text-base font-medium mb-3">{t.disclaimer}</p>
          <p className="text-white/50 text-sm mb-2">{t.credits}</p>
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            <span className="text-white/60 text-sm">{t.openSource}</span>
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-sm transition-colors underline cursor-pointer"
              style={{ color: '#f1aa1c' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t.github}
            </a>
          </div>
          {language === 'fr' && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-white/60 text-sm">Rejoignez l&apos;équipe francophone</span>
              <a
                href="https://discord.gg/54EQD8fpky"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm transition-colors underline cursor-pointer"
                style={{ color: '#f1aa1c' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                The Vanguard Protocol
              </a>
            </div>
          )}
          <p className="text-white/50 text-xs mb-2">{t.license}</p>
          <p className="text-white/40 text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
