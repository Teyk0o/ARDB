'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Item, FilterOptions } from '@/types/item';
import ItemCard from './ItemCard';
import CustomSelect from './CustomSelect';
import MultiSelect from './MultiSelect';
import LoadingSpinner from './LoadingSpinner';
import SearchWithHistory from './SearchWithHistory';
import { Language, getTranslation, getItemTypeLabel, getRarityLabel, getTagLabel } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import { useItems } from '@/lib/useItems';
import { useHasNewChanges, markChangelogAsViewed } from '@/lib/useHasNewChanges';
import { matchesSearch } from '@/lib/searchUtils';

interface ItemsPageProps {
  initialFilters?: { [key: string]: string | string[] | undefined };
}

export default function ItemsPage({ initialFilters = {} }: ItemsPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasNewChanges, loading } = useHasNewChanges();

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
  const { items: displayItems, loading: itemsLoading } = useItems(language);

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

    // Search filter (on already translated items) with accent and plural support
    if (filters.search) {
      filtered = filtered.filter((item) => {
        return (
          matchesSearch(item.name, filters.search) ||
          matchesSearch(item.description || '', filters.search)
        );
      });
    }

    return filtered;
  }, [displayItems, filters]);

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="relative bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="relative z-10 container mx-auto px-4 py-4 md:py-8">
          {/* Logo and Title - Full width on mobile */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-4 sm:mb-0">
            <div className="flex-shrink-0">
              <img
                src="/ARC_Raider_Stacked_White_Color.png"
                alt="Arc Raiders"
                className="h-20 sm:h-24 md:h-28 w-auto mb-2"
              />
              <p className="text-base sm:text-lg md:text-xl text-arc-white/70 hidden sm:block">{t.subtitle}</p>
            </div>

            {/* Navigation - Stacked on mobile, horizontal on larger screens */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                <Link
                  href="/changelog"
                  onClick={() => markChangelogAsViewed()}
                  className={`inline-flex items-center gap-2 text-sm sm:text-base font-medium transition-colors ${hasNewChanges ? '' : 'text-arc-white/70'}`}
                  title="View recent updates"
                  style={hasNewChanges ? { color: '#f1aa1c' } : {}}
                >
                  {t.changelog || 'Changelog'}
                  {hasNewChanges && (
                    <span
                      className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
                      style={{ backgroundColor: '#f1aa1c', marginTop: '2px' }}
                    />
                  )}
                </Link>
                <Link
                  href="/projects"
                  className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
                >
                  {t.projects || 'Projects'}
                </Link>
                <Link
                  href="/workshop-upgrades"
                  className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
                >
                  {t.workshopUpgrades || 'Workshop Upgrades'}
                </Link>
                <a
                  href="/categories"
                  className="text-arc-yellow hover:text-arc-yellow/80 text-sm sm:text-base font-medium transition-colors"
                >
                  {t.categories}
                </a>
              </div>

              {/* Language Selector */}
              <div className="w-full sm:w-auto">
                <CustomSelect
                  value={language}
                  onChange={(value) => setLanguage(value as Language)}
                  options={[
                    { value: 'en', label: '🇬🇧 English' },
                    { value: 'fr', label: '🇫🇷 Français' },
                    { value: 'de', label: '🇩🇪 Deutsch' },
                    { value: 'es', label: '🇪🇸 Español' },
                    { value: 'pt', label: '🇵🇹 Português' },
                    { value: 'pl', label: '🇵🇱 Polski' },
                    { value: 'no', label: '🇳🇴 Norsk' },
                    { value: 'da', label: '🇩🇰 Dansk' },
                    { value: 'it', label: '🇮🇹 Italiano' },
                    { value: 'ru', label: '🇷🇺 Русский' },
                    { value: 'ja', label: '🇯🇵 日本語' },
                    { value: 'zh-TW', label: '🇹🇼 繁體中文' },
                    { value: 'uk', label: '🇺🇦Українська' },
                    { value: 'zh-CN', label: '🇨🇳 简体中文' },
                    { value: 'kr', label: '🇰🇷 한국어' },
                    { value: 'tr', label: '🇹🇷 Türkçe' },
                    { value: 'hr', label: '🇭🇷 Hrvatski' },
                    { value: 'sr', label: '🇷🇸 Српски' },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="sticky top-0 z-30 bg-arc-blue-light/95 backdrop-blur-md border-b border-arc-blue-lighter shadow-lg">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
            {/* Search - Full width on mobile/tablet, flexible on desktop */}
            <SearchWithHistory
              value={filters.search}
              onChange={(value) => setFilters({ ...filters, search: value })}
              placeholder={t.searchPlaceholder}
              language={language}
            />

            {/* Type Filter */}
            <div className="w-full sm:w-auto">
              <MultiSelect
                values={filters.types}
                onChange={(selectedTypes) => setFilters({ ...filters, types: selectedTypes })}
                options={types.map(type => ({ value: type, label: getItemTypeLabel(type, language) }))}
                placeholder={t.allTypes}
              />
            </div>

            {/* Rarity Filter */}
            <div className="w-full sm:w-auto">
              <MultiSelect
                values={filters.rarities}
                onChange={(selectedRarities) => setFilters({ ...filters, rarities: selectedRarities })}
                options={rarities.map(rarity => ({ value: rarity, label: rarity ? getRarityLabel(rarity, language) : 'Unknown' }))}
                placeholder={t.allRarities}
              />
            </div>

            {/* Tag Filter */}
            <div className="w-full sm:w-auto">
              <MultiSelect
                values={filters.tags}
                onChange={(selectedTags) => setFilters({ ...filters, tags: selectedTags })}
                options={tags.map(tag => ({ value: tag, label: getTagLabel(tag, language) }))}
                placeholder={t.allTags}
              />
            </div>

            {/* Reset Button */}
            <button
              onClick={resetFilters}
              disabled={filters.search === '' && filters.types.length === 0 && filters.rarities.length === 0 && filters.tags.length === 0}
              className="w-full sm:w-auto bg-arc-blue border-2 border-arc-blue-lighter hover:border-arc-yellow disabled:opacity-50 disabled:cursor-not-allowed rounded-lg px-4 py-3 text-arc-white font-medium transition-colors whitespace-nowrap cursor-pointer"
            >
              Reset
            </button>
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
              <span className="text-arc-yellow font-bold">{displayItems.length}</span>{' '}
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
        <h1 className="sr-only">Arc Raiders Item Database - Complete Guide and Crafting Recipes</h1>
        {itemsLoading ? (
          <LoadingSpinner />
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-arc-white mb-2">{t.noItemsFound}</h2>
            <p className="text-arc-white/60">{t.tryAdjusting}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <ItemCard
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
      <footer className="border-t border-arc-blue-lighter mt-12 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-arc-white/70 text-base font-medium mb-3">{t.disclaimer}</p>
          <p className="text-arc-white/50 text-sm mb-2">{t.credits}</p>
          <div className="flex items-center justify-center gap-2 mb-2 flex-wrap">
            <span className="text-arc-white/60 text-sm">{t.openSource}</span>
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="text-arc-yellow hover:text-arc-yellow/80 font-bold text-sm transition-colors underline"
            >
              {t.github}
            </a>
            <span className="text-arc-white/60 text-sm">|</span>
            <a
              href="/translate"
              className="text-arc-yellow hover:text-arc-yellow/80 font-bold text-sm transition-colors underline"
            >
              {t.helpTranslate}
            </a>
          </div>
          {language === 'fr' && (
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-arc-white/60 text-sm">Rejoignez l&apos;équipe francophone</span>
              <a
                href="https://discord.gg/54EQD8fpky"
                target="_blank"
                rel="noopener noreferrer"
                className="text-arc-yellow hover:text-arc-yellow/80 font-bold text-sm transition-colors underline"
              >
                The Vanguard Protocol
              </a>
            </div>
          )}
          <p className="text-arc-white/50 text-xs mb-2">{t.license}</p>
          <p className="text-arc-white/40 text-sm">{t.footer}</p>
        </div>
      </footer>
    </div>
  );
}
