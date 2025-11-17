'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { FaTools, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import MainHeader from '@/components/MainHeader';
import { getTranslation, Language } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import workshopUpgradesData from '@/data/workshop_upgrades.json';

/**
 * WorkshopUpgradesPage component
 * Displays all workshop/workbench upgrades with their requirements
 */
export default function WorkshopUpgradesPage() {
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
  const [canScrollLeft, setCanScrollLeft] = useState<{[key: string]: boolean}>({});
  const [canScrollRight, setCanScrollRight] = useState<{[key: string]: boolean}>({});
  const scrollContainerRefs = useRef<{[key: string]: HTMLDivElement | null}>({});

  const updateScrollButtons = (workbenchId: string) => {
    const container = scrollContainerRefs.current[workbenchId];
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(prev => ({ ...prev, [workbenchId]: scrollLeft > 0 }));
      setCanScrollRight(prev => ({ ...prev, [workbenchId]: scrollLeft < scrollWidth - clientWidth - 1 }));
    }
  };

  const scroll = (workbenchId: string, direction: 'left' | 'right') => {
    const container = scrollContainerRefs.current[workbenchId];
    if (container) {
      const scrollAmount = 420; // width of card + gap
      const newScrollLeft = container.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      container.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });
      // Update buttons after animation
      setTimeout(() => updateScrollButtons(workbenchId), 300);
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
    Object.keys(workshopUpgradesData).forEach(workbenchId => {
      updateScrollButtons(workbenchId);
    });

    const handleResize = () => {
      Object.keys(workshopUpgradesData).forEach(workbenchId => {
        updateScrollButtons(workbenchId);
      });
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [items]);

  useEffect(() => {
    // Sync language to localStorage
    localStorage.setItem('arc-db-language', language);
    window.dispatchEvent(new Event('storage'));
  }, [language]);

  const t = getTranslation(language);

  // Helper to get item by ID
  const getItem = (itemId: string) => {
    return items.find(item => item.id === itemId);
  };

  // Helper to get item name
  const getItemName = (itemId: string): string => {
    const item = getItem(itemId);
    return item?.name || itemId;
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

  // Helper to get workbench name translation
  const getWorkbenchName = (workbenchId: string): string => {
    const names: Record<Language, Record<string, string>> = {
      en: {
        gunsmith: 'Gunsmith',
        gear_bench: 'Gear Bench',
        medical_lab: 'Medical Lab',
        explosives_station: 'Explosives Station',
        utility_station: 'Utility Station',
        refiner: 'Refiner',
        scrappy: 'Scrappy'
      },
      fr: {
        gunsmith: 'Atelier d\'armurerie',
        gear_bench: 'Établi d\'équipement',
        medical_lab: 'Laboratoire médical',
        explosives_station: 'Station d\'explosifs',
        utility_station: 'Station utilitaire',
        refiner: 'Raffinerie',
        scrappy: 'Scrappy'
      },
      de: {
        gunsmith: 'Waffenschmied',
        gear_bench: 'Ausrüstungsbank',
        medical_lab: 'Medizinisches Labor',
        explosives_station: 'Sprengstoffstation',
        utility_station: 'Versorgungsstation',
        refiner: 'Raffinerie',
        scrappy: 'Scrappy'
      },
      es: {
        gunsmith: 'Armero',
        gear_bench: 'Banco de equipo',
        medical_lab: 'Laboratorio médico',
        explosives_station: 'Estación de explosivos',
        utility_station: 'Estación de utilidades',
        refiner: 'Refinería',
        scrappy: 'Scrappy'
      },
      pt: {
        gunsmith: 'Armeiro',
        gear_bench: 'Bancada de equipamento',
        medical_lab: 'Laboratório médico',
        explosives_station: 'Estação de explosivos',
        utility_station: 'Estação de utilidades',
        refiner: 'Refinaria',
        scrappy: 'Scrappy'
      },
      pl: {
        gunsmith: 'Kowal',
        gear_bench: 'Warsztat wyposażenia',
        medical_lab: 'Laboratorium medyczne',
        explosives_station: 'Stacja materiałów wybuchowych',
        utility_station: 'Stacja narzędziowa',
        refiner: 'Rafineria',
        scrappy: 'Scrappy'
      },
      no: {
        gunsmith: 'Våpensmed',
        gear_bench: 'Utstyrsbenk',
        medical_lab: 'Medisinsk laboratorium',
        explosives_station: 'Sprengstoffstasjon',
        utility_station: 'Verktøystasjon',
        refiner: 'Raffineri',
        scrappy: 'Scrappy'
      },
      da: {
        gunsmith: 'Våbensmed',
        gear_bench: 'Udstyrsbænk',
        medical_lab: 'Medicinsk laboratorium',
        explosives_station: 'Sprængstofstation',
        utility_station: 'Værktøjsstation',
        refiner: 'Raffinaderi',
        scrappy: 'Scrappy'
      },
      it: {
        gunsmith: 'Armaiolo',
        gear_bench: 'Banco attrezzatura',
        medical_lab: 'Laboratorio medico',
        explosives_station: 'Stazione esplosivi',
        utility_station: 'Stazione utilità',
        refiner: 'Raffineria',
        scrappy: 'Scrappy'
      },
      ru: {
        gunsmith: 'Оружейник',
        gear_bench: 'Верстак снаряжения',
        medical_lab: 'Медицинская лаборатория',
        explosives_station: 'Станция взрывчатки',
        utility_station: 'Станция инструментов',
        refiner: 'Нефтеперерабатывающий завод',
        scrappy: 'Scrappy'
      },
      ja: {
        gunsmith: '武器職人',
        gear_bench: '装備作業台',
        medical_lab: '医療研究所',
        explosives_station: '爆発物ステーション',
        utility_station: 'ユーティリティステーション',
        refiner: '精製所',
        scrappy: 'Scrappy'
      },
      'zh-TW': {
        gunsmith: '槍械工坊',
        gear_bench: '裝備工作台',
        medical_lab: '醫療實驗室',
        explosives_station: '爆破物站',
        utility_station: '工具站',
        refiner: '精煉廠',
        scrappy: 'Scrappy'
      },
      uk: {
        gunsmith: 'Зброяр',
        gear_bench: 'Верстак спорядження',
        medical_lab: 'Медична лабораторія',
        explosives_station: 'Станція вибухівки',
        utility_station: 'Станція інструментів',
        refiner: 'Нафтопереробний завод',
        scrappy: 'Scrappy'
      },
      'zh-CN': {
        gunsmith: '枪械工坊',
        gear_bench: '装备工作台',
        medical_lab: '医疗实验室',
        explosives_station: '爆破物站',
        utility_station: '工具站',
        refiner: '精炼厂',
        scrappy: 'Scrappy'
      },
      kr: {
        gunsmith: '총기공',
        gear_bench: '장비 작업대',
        medical_lab: '의료 연구소',
        explosives_station: '폭발물 스테이션',
        utility_station: '유틸리티 스테이션',
        refiner: '정제소',
        scrappy: 'Scrappy'
      },
      tr: {
        gunsmith: 'Silahçı',
        gear_bench: 'Ekipman Tezgahı',
        medical_lab: 'Tıbbi Laboratuvar',
        explosives_station: 'Patlayıcı İstasyonu',
        utility_station: 'Araç İstasyonu',
        refiner: 'Rafineri',
        scrappy: 'Scrappy'
      },
      hr: {
        gunsmith: 'Oružar',
        gear_bench: 'Klupa za opremu',
        medical_lab: 'Medicinski laboratorij',
        explosives_station: 'Stanica eksploziva',
        utility_station: 'Stanica alata',
        refiner: 'Rafinerija',
        scrappy: 'Scrappy'
      },
      sr: {
        gunsmith: 'Oružar',
        gear_bench: 'Klupa za opremu',
        medical_lab: 'Medicinski laboratorij',
        explosives_station: 'Stanica eksploziva',
        utility_station: 'Stanica alata',
        refiner: 'Rafinerija',
        scrappy: 'Scrappy'
      }
    };
    return names[language]?.[workbenchId] || workbenchId;
  };

  // Tier colors
  const getTierColor = (tier: number): { bg: string; border: string; badge: string } => {
    const colors = [
      { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', badge: '#22c55e' },   // Tier 1 - Green
      { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', badge: '#3b82f6' },  // Tier 2 - Blue
      { bg: 'rgba(168, 85, 247, 0.1)', border: '#a855f7', badge: '#a855f7' }   // Tier 3 - Purple
    ];
    return colors[tier - 1] || colors[0];
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
            {Object.entries(workshopUpgradesData).map(([workbenchId, tiers]) => (
              <div key={workbenchId}>
                {/* Workbench Header */}
                <div className="mb-8">
                  <h2 className="text-2xl md:text-3xl font-bold text-arc-yellow mb-2 flex items-center gap-3">
                    <FaTools />
                    {getWorkbenchName(workbenchId)}
                  </h2>
                </div>

                {/* Tiers - Horizontal Slider with arrows */}
                <div className="relative">
                  {/* Left Arrow */}
                  {canScrollLeft[workbenchId] && (
                    <button
                      onClick={() => scroll(workbenchId, 'left')}
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
                  {canScrollRight[workbenchId] && (
                    <button
                      onClick={() => scroll(workbenchId, 'right')}
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
                    ref={(el) => { scrollContainerRefs.current[workbenchId] = el; }}
                    onScroll={() => updateScrollButtons(workbenchId)}
                    className="overflow-x-auto scrollbar-hide px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <div className="flex gap-6 pb-4" style={{ minWidth: 'min-content' }}>
                      {Object.entries(tiers as Record<string, any[]>).map(([tier, requirements]) => {
                        const tierNum = parseInt(tier);
                        const tierColors = getTierColor(tierNum);

                        return (
                          <div key={tier} className="rounded-lg overflow-hidden flex-shrink-0 border-2" style={{ width: '400px', backgroundColor: tierColors.bg, borderColor: tierColors.border }}>
                            {/* Tier Header */}
                            <div className="border-b px-5 py-4" style={{ borderColor: tierColors.border + '40' }}>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="text-arc-blue font-bold px-3 py-1 rounded" style={{ backgroundColor: tierColors.badge }}>
                                  {t.tier || 'Tier'} {tier}
                                </div>
                              </div>
                            </div>

                            {/* Tier Requirements */}
                            <div className="p-5">
                              <h4 className="text-arc-yellow font-semibold mb-3">
                                {t.requiredItems || 'Required Items'}
                              </h4>
                              <div className="grid gap-3 grid-cols-1">
                                {requirements.map((req, idx) => {
                                  const item = getItem(req.itemId);
                                  const rarityColor = item?.rarity ? getRarityColor(item.rarity) : '#9ca3af';
                                  return (
                                    <Link
                                      key={idx}
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
