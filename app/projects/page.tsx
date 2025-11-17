'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FaClipboardList, FaCheckCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MainHeader from '@/components/MainHeader';
import { getTranslation, Language } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import type { Project } from '@/types/tags';
import projectsData from '@/data/projects.json';

export default function ProjectsPage() {
  // Initialize language from localStorage immediately
  const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('arc-db-language') as Language;
      if (saved && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(saved)) {
        return saved;
      }
    }
    return 'en';
  };

  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 420; // width of card + gap
      const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      // Update buttons after animation
      setTimeout(updateScrollButtons, 300);
    }
  };

  useEffect(() => {
    // Fetch items data
    async function fetchItems() {
      try {
        const res = await fetch(`/api/items?lang=${language}`);
        const data = await res.json();
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, [language]);

  useEffect(() => {
    // Update scroll buttons on mount and resize
    updateScrollButtons();

    const handleResize = () => updateScrollButtons();
    window.addEventListener('resize', handleResize);

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', updateScrollButtons);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', updateScrollButtons);
      }
    };
  }, [items]);

  useEffect(() => {
    // Sync language to localStorage
    localStorage.setItem('arc-db-language', language);
    window.dispatchEvent(new Event('storage'));
  }, [language]);

  const t = getTranslation(language);
  const projects = projectsData as Project[];

  // Helper to get item by ID
  const getItem = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  // Helper to get item name
  const getItemName = (itemId: string): string => {
    const item = getItem(itemId);
    return item?.name || itemId;
  };

  // Helper to get project name
  const getProjectName = (project: Project): string => {
    return project.name[language] || project.name.en;
  };

  // Helper to get project description
  const getProjectDescription = (project: Project): string => {
    return project.description[language] || project.description.en;
  };

  // Helper to get phase name
  const getPhaseName = (phase: any): string => {
    return phase.name[language] || phase.name.en;
  };

  // Helper to get phase description
  const getPhaseDescription = (phase: any): string | undefined => {
    if (!phase.description) return undefined;
    return phase.description[language] || phase.description.en;
  };

  // Helper to get rarity color
  const getRarityColor = (rarity: string): string => {
    const colors: Record<string, string> = {
      'Common': '#9ca3af',
      'Uncommon': '#22c55e',
      'Rare': '#3b82f6',
      'Epic': '#a855f7',
      'Legendary': '#f59e0b',
      'Artifact': '#ef4444'
    };
    return colors[rarity] || '#9ca3af';
  };

  // Helper to get rarity label
  const getRarityLabel = (rarity: string): string => {
    const labels: Record<Language, Record<string, string>> = {
      en: { Common: 'Common', Uncommon: 'Uncommon', Rare: 'Rare', Epic: 'Epic', Legendary: 'Legendary', Artifact: 'Artifact' },
      fr: { Common: 'Commun', Uncommon: 'Peu commun', Rare: 'Rare', Epic: 'Épique', Legendary: 'Légendaire', Artifact: 'Artefact' },
      de: { Common: 'Gewöhnlich', Uncommon: 'Ungewöhnlich', Rare: 'Selten', Epic: 'Episch', Legendary: 'Legendär', Artifact: 'Artefakt' },
      es: { Common: 'Común', Uncommon: 'Poco común', Rare: 'Raro', Epic: 'Épico', Legendary: 'Legendario', Artifact: 'Artefacto' },
      pt: { Common: 'Comum', Uncommon: 'Incomum', Rare: 'Raro', Epic: 'Épico', Legendary: 'Lendário', Artifact: 'Artefato' },
      pl: { Common: 'Pospolity', Uncommon: 'Niepospolity', Rare: 'Rzadki', Epic: 'Epicki', Legendary: 'Legendarny', Artifact: 'Artefakt' },
      no: { Common: 'Vanlig', Uncommon: 'Uvanlig', Rare: 'Sjelden', Epic: 'Episk', Legendary: 'Legendarisk', Artifact: 'Artefakt' },
      da: { Common: 'Almindelig', Uncommon: 'Ualmindelig', Rare: 'Sjælden', Epic: 'Episk', Legendary: 'Legendarisk', Artifact: 'Artefakt' },
      it: { Common: 'Comune', Uncommon: 'Non comune', Rare: 'Raro', Epic: 'Epico', Legendary: 'Leggendario', Artifact: 'Artefatto' },
      ru: { Common: 'Обычный', Uncommon: 'Необычный', Rare: 'Редкий', Epic: 'Эпический', Legendary: 'Легендарный', Artifact: 'Артефакт' },
      ja: { Common: 'コモン', Uncommon: 'アンコモン', Rare: 'レア', Epic: 'エピック', Legendary: 'レジェンダリー', Artifact: 'アーティファクト' },
      'zh-TW': { Common: '普通', Uncommon: '不常見', Rare: '稀有', Epic: '史詩', Legendary: '傳說', Artifact: '神器' },
      uk: { Common: 'Звичайний', Uncommon: 'Незвичайний', Rare: 'Рідкісний', Epic: 'Епічний', Legendary: 'Легендарний', Artifact: 'Артефакт' },
      'zh-CN': { Common: '普通', Uncommon: '不常见', Rare: '稀有', Epic: '史诗', Legendary: '传说', Artifact: '神器' },
      kr: { Common: '일반', Uncommon: '고급', Rare: '희귀', Epic: '영웅', Legendary: '전설', Artifact: '유물' },
      tr: { Common: 'Sıradan', Uncommon: 'Nadir', Rare: 'Ender', Epic: 'Destansı', Legendary: 'Efsanevi', Artifact: 'Eser' },
      hr: { Common: 'Uobičajeno', Uncommon: 'Neuobičajeno', Rare: 'Rijetko', Epic: 'Epsko', Legendary: 'Legendarno', Artifact: 'Artefakt' },
      sr: { Common: 'Uobičajeno', Uncommon: 'Neuobičajeno', Rare: 'Retko', Epic: 'Epsko', Legendary: 'Legendarno', Artifact: 'Artefakt' }
    };
    return labels[language]?.[rarity] || rarity;
  };

  // Phase colors
  const getPhaseColor = (phaseNum: number): { bg: string; border: string; badge: string } => {
    const colors = [
      { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', badge: '#22c55e' },   // Phase 1 - Green
      { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', badge: '#3b82f6' },  // Phase 2 - Blue
      { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', badge: '#a855f7' },  // Phase 3 - Purple
      { bg: 'rgba(245, 158, 11, 0.1)', border: '#f59e0b', badge: '#f59e0b' },  // Phase 4 - Orange
      { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', badge: '#ef4444' },   // Phase 5 - Red
      { bg: 'rgba(156, 163, 175, 0.1)', border: '#9ca3af', badge: '#9ca3af' }  // Phase 6 - Gray
    ];
    return colors[phaseNum - 1] || colors[0];
  };

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <MainHeader language={language} setLanguage={setLanguage} />

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arc-yellow"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {projects.map((project) => (
              <div key={project.id}>
                {/* Project Header - No box */}
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-arc-yellow mb-3">
                    {getProjectName(project)}
                  </h2>
                  <p className="text-arc-white/70 leading-relaxed max-w-4xl">
                    {getProjectDescription(project)}
                  </p>
                </div>

                {/* Phases - Horizontal Slider with arrows */}
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft && (
                    <button
                      onClick={() => scroll('left')}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 border-2 border-arc-yellow hover:bg-arc-yellow hover:text-arc-blue text-arc-yellow rounded-full p-3 shadow-lg transition-all cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(19, 9, 24, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                      aria-label="Scroll left"
                    >
                      <FaChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  {/* Right Arrow */}
                  {canScrollRight && (
                    <button
                      onClick={() => scroll('right')}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 border-2 border-arc-yellow hover:bg-arc-yellow hover:text-arc-blue text-arc-yellow rounded-full p-3 shadow-lg transition-all cursor-pointer"
                      style={{
                        backgroundColor: 'rgba(19, 9, 24, 0.8)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)'
                      }}
                      aria-label="Scroll right"
                    >
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  )}

                  {/* Scrollable container */}
                  <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto scrollbar-hide px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex gap-6 pb-4" style={{ minWidth: 'min-content' }}>
                    {project.phases.map((phase) => {
                      const phaseDescription = getPhaseDescription(phase);
                      const hasItems = phase.requirementItemIds && phase.requirementItemIds.length > 0;
                      const hasCategories = phase.requirementCategories && phase.requirementCategories.length > 0;
                      const phaseColors = getPhaseColor(phase.phase);

                      return (
                        <div key={phase.phase} className="rounded-lg overflow-hidden flex-shrink-0 border-2" style={{ width: '400px', backgroundColor: phaseColors.bg, borderColor: phaseColors.border }}>
                          {/* Phase Header */}
                          <div className="border-b px-5 py-4" style={{ borderColor: phaseColors.border + '40' }}>
                            <div className="flex items-center gap-3 mb-2">
                              <div className="text-arc-blue font-bold px-3 py-1 rounded" style={{ backgroundColor: phaseColors.badge }}>
                                {t.phase || 'Phase'} {phase.phase}
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-arc-white">
                              {getPhaseName(phase)}
                            </h3>
                          </div>

                          {/* Phase Requirements */}
                          <div className="p-5">
                            {!hasItems && !hasCategories ? (
                              <p className="text-arc-white/50 italic text-center py-4">
                                {t.noRequirements || 'No requirements specified'}
                              </p>
                            ) : (
                              <>
                                {/* Item Requirements */}
                                {hasItems && (
                                  <div className="mb-4">
                                    <h4 className="text-arc-yellow font-semibold mb-3 flex items-center gap-2">
                                      <FaCheckCircle className="text-sm" />
                                      {t.requiredItems || 'Required Items'}
                                    </h4>
                                    <div className="grid gap-3 grid-cols-1">
                                      {phase.requirementItemIds!.map((req) => {
                                        const item = getItem(req.itemId);
                                        const rarityColor = item?.rarity ? getRarityColor(item.rarity) : '#9ca3af';
                                        return (
                                          <Link
                                            key={req.itemId}
                                            href={`/items/${generateSlug(item?.nameEn || req.itemId)}`}
                                            className="flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer border-2"
                                            style={{
                                              backgroundColor: 'rgba(19, 9, 24, 0.6)',
                                              borderColor: 'rgba(26, 17, 32, 0.8)'
                                            }}
                                            onMouseEnter={(e) => {
                                              e.currentTarget.style.borderColor = rarityColor;
                                              e.currentTarget.style.backgroundColor = rarityColor + '15';
                                            }}
                                            onMouseLeave={(e) => {
                                              e.currentTarget.style.borderColor = 'rgba(26, 17, 32, 0.8)';
                                              e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.6)';
                                            }}
                                          >
                                            {/* Item Image with border */}
                                            <div className="relative flex-shrink-0">
                                              <div
                                                className="w-14 h-14 rounded flex items-center justify-center border-2"
                                                style={{
                                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                  borderColor: rarityColor
                                                }}
                                              >
                                                {item?.icon && (
                                                  <img
                                                    src={item.icon}
                                                    alt={getItemName(req.itemId)}
                                                    className="w-12 h-12 object-contain"
                                                  />
                                                )}
                                              </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <div className="text-arc-white font-medium truncate mb-1">
                                                {getItemName(req.itemId)}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {item?.rarity && (
                                                  <span
                                                    className="text-xs font-semibold px-2 py-0.5 rounded"
                                                    style={{
                                                      backgroundColor: rarityColor + '20',
                                                      color: rarityColor,
                                                      border: `1px solid ${rarityColor}40`
                                                    }}
                                                  >
                                                    {getRarityLabel(item.rarity)}
                                                  </span>
                                                )}
                                                <div className="text-arc-yellow text-sm font-bold">
                                                  ×{req.quantity}
                                                </div>
                                              </div>
                                            </div>
                                          </Link>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {/* Category Requirements */}
                                {hasCategories && (
                                  <div>
                                    <h4 className="text-arc-yellow font-semibold mb-3 flex items-center gap-2">
                                      <FaCheckCircle className="text-sm" />
                                      {t.categoryRequirements || 'Category Requirements'}
                                    </h4>
                                    <div className="grid gap-3 grid-cols-1">
                                      {phase.requirementCategories!.map((cat, idx) => {
                                        const coinColor = '#f59e0b'; // Orange/Gold color for coins
                                        return (
                                          <div
                                            key={idx}
                                            className="flex items-center gap-3 p-3 rounded-lg transition-all border-2"
                                            style={{
                                              backgroundColor: 'rgba(19, 9, 24, 0.6)',
                                              borderColor: 'rgba(26, 17, 32, 0.8)'
                                            }}
                                          >
                                            {/* Coin Image with border */}
                                            <div className="relative flex-shrink-0">
                                              <div
                                                className="w-14 h-14 rounded flex items-center justify-center border-2"
                                                style={{
                                                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                                  borderColor: coinColor
                                                }}
                                              >
                                                <img
                                                  src="/assets/coins.png"
                                                  alt="Coins"
                                                  className="w-12 h-12 object-contain"
                                                />
                                              </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                              <div className="text-arc-white font-medium truncate mb-1">
                                                {cat.name}
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span
                                                  className="text-xs font-semibold px-2 py-0.5 rounded"
                                                  style={{
                                                    backgroundColor: coinColor + '20',
                                                    color: coinColor,
                                                    border: `1px solid ${coinColor}40`
                                                  }}
                                                >
                                                  {t.coins || 'Coins'}
                                                </span>
                                                <div className="text-arc-yellow text-sm font-bold">
                                                  {cat.valueRequired.toLocaleString()}
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    </div>
                  </div>

                  {/* Add CSS to hide scrollbar */}
                  <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-20 py-8">
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
