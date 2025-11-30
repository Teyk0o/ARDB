'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Item } from '@/types/item';
import { Language, getTranslation, getStatLabel, getRarityLabel, getItemTypeLabel, getLootAreaLabel } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import CraftRelationshipsAccordion from './CraftRelationshipsAccordion';
import MainHeader from './MainHeader';
import TagReasonDisplay from './TagReasonDisplay';
import tagReasons from '@/data/item-tag-reasons.json';
import type { ItemTagReasons } from '@/lib/tagReasoning';
import type { Quest } from '@/types/tags';
import { FaEdit } from 'react-icons/fa';

interface ItemDetailPageContentProps {
  item: Item;
  language: Language;
  allItems: Item[];
  onLanguageChange?: (lang: Language) => void;
}

const rarityColors: Record<string, string> = {
  Common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  Uncommon: 'bg-green-500/20 text-green-300 border-green-500/30',
  Rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Legendary: 'bg-arc-yellow/20 text-arc-yellow border-arc-yellow/30',
};

const rarityGradients: Record<string, string> = {
  Common: 'from-gray-600/20 to-gray-700/10',
  Uncommon: 'from-green-600/20 to-green-700/10',
  Rare: 'from-blue-600/20 to-blue-700/10',
  Epic: 'from-purple-600/20 to-purple-700/10',
  Legendary: 'from-arc-yellow/30 to-arc-yellow/10',
};

// Workshop/Workbench name translations
const workshopNames: Record<string, Record<Language, string>> = {
  gunsmith: {
    en: 'Gunsmith', fr: 'Armurier', es: 'Armero', de: 'Waffenschmied', 'zh-CN': '枪匠'
  },
  gear_bench: {
    en: 'Gear Bench', fr: 'Établi d\'équipement', es: 'Banco de equipo', de: 'Ausrüstungswerkbank', 'zh-CN': '装备工作台'
  },
  medical_lab: {
    en: 'Medical Lab', fr: 'Laboratoire médical', es: 'Laboratorio médico', de: 'Medizinisches Labor', 'zh-CN': '医疗实验室'
  },
  explosives_station: {
    en: 'Explosives Station', fr: 'Station d\'explosifs', es: 'Estación de explosivos', de: 'Sprengstoffstation', 'zh-CN': '爆炸物站'
  },
  utility_station: {
    en: 'Utility Station', fr: 'Station utilitaire', es: 'Estación de utilidad', de: 'Versorgungsstation', 'zh-CN': '实用站'
  },
  refiner: {
    en: 'Refiner', fr: 'Raffinerie', es: 'Refinador', de: 'Raffinerie', 'zh-CN': '精炼厂'
  },
  scrappy: {
    en: 'Scrappy', fr: 'Scrappy', es: 'Scrappy', de: 'Scrappy', 'zh-CN': 'Scrappy'
  }
};

// Helper function to get translated workbench name
function getWorkbenchName(workbenchId: string, language: Language): string {
  return workshopNames[workbenchId]?.[language] || workshopNames[workbenchId]?.en || workbenchId;
}

export default function ItemDetailPageContent({
  item,
  language,
  allItems,
  onLanguageChange,
}: ItemDetailPageContentProps) {
  const router = useRouter();
  const [imageFailed, setImageFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);

  // Initialize canShare flag when component mounts
  React.useEffect(() => {
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const t = getTranslation(language);
  const rarityClass = item.rarity ? rarityColors[item.rarity] || rarityColors.Common : rarityColors.Common;
  const rarityGradient = item.rarity ? rarityGradients[item.rarity] || rarityGradients.Common : rarityGradients.Common;
  const isLegendary = item.rarity === 'Legendary';

  // Generate shareable URL using English name
  const shareUrl = `${typeof window !== 'undefined' ? window.location.origin : 'https://www.arcraidersdatabase.com'}/items/${generateSlug(item.nameEn || item.name)}`;

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: item.name,
          text: item.description || `Check out ${item.name} on Arc Raiders Database`,
          url: shareUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    }
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    if (onLanguageChange) {
      onLanguageChange(newLang);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('arc-db-language', newLang);
    }
  };

  return (
    <div className="min-h-screen text-white" style={{ backgroundColor: '#130918' }}>
      {/* Header */}
      <MainHeader language={language} setLanguage={handleLanguageChange} />


      {/* Hero Section with Item Image */}
      <div
        className="border-b"
        style={{
          borderColor: '#2d1f38',
          backgroundColor: '#1a1120'
        }}
      >
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Image */}
            <div className="flex justify-center md:col-span-1">
              <div
                className={`w-40 h-40 md:w-56 md:h-56 rounded-2xl flex items-center justify-center overflow-hidden border-4 shadow-2xl ${rarityClass}`}
                style={{ backgroundColor: '#130918' }}
              >
                {item.icon && (item.icon.startsWith('http://') || item.icon.startsWith('https://')) && !imageFailed ? (
                  <Image
                    src={item.icon}
                    alt={item.name}
                    width={224}
                    height={224}
                    className="object-contain w-full h-full"
                    priority
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <span className="text-6xl">X</span>
                )}
              </div>
            </div>

            {/* Header Info */}
            <div className="md:col-span-2">
              <div className="mb-4">
                {item.rarity && (
                  <span
                    className={`inline-block text-sm px-4 py-2 rounded-full border-2 font-bold mb-4 ${rarityClass}`}
                    style={isLegendary ? {
                      backgroundColor: 'rgba(241, 170, 28, 0.2)',
                      color: '#f1aa1c',
                      borderColor: 'rgba(241, 170, 28, 0.6)',
                    } : undefined}
                  >
                    {getRarityLabel(item.rarity, language)}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3 break-words text-white">
                {item.name}
              </h1>

              <p className="text-white/60 text-lg mb-6">
                {getItemTypeLabel(item.item_type, language)}
              </p>

              {item.description && (
                <p className="text-white/90 text-base leading-relaxed mb-6 max-w-xl">
                  {item.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 flex-wrap">
                {canShare && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer"
                    style={{
                      backgroundColor: 'rgba(241, 170, 28, 0.2)',
                      color: '#f1aa1c',
                      border: '2px solid rgba(241, 170, 28, 0.5)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(241, 170, 28, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(241, 170, 28, 0.2)'}
                  >
                    Share
                  </button>
                )}

                <Link
                  href={`/items/${generateSlug(item.nameEn || item.name)}/edit`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-semibold cursor-pointer"
                  style={{
                    backgroundColor: '#2d1f38',
                    color: '#ffffff',
                    border: '2px solid #2d1f38'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#3d2f48';
                    e.currentTarget.style.borderColor = '#f1aa1c';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d1f38';
                    e.currentTarget.style.borderColor = '#2d1f38';
                  }}
                >
                  <FaEdit />
                  <span>{t.editItem}</span>
                </Link>

                {item.communityEdited && (
                  <span className="inline-flex items-center gap-2 bg-green-900/20 text-green-300 border-2 border-green-500/50 px-4 py-2 rounded-lg font-semibold">
                    ✓ {t.communityEdited}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Section */}
            {item.stat_block && Object.keys(item.stat_block).length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 text-white">
                  {t.statistics}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(item.stat_block)
                    .filter(([_, value]) => value != null && value !== 0 && value !== undefined)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="px-4 py-4 rounded-lg transition-all"
                        style={{
                          backgroundColor: '#1a1120',
                          border: '1px solid #2d1f38'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.borderColor = '#f1aa1c'}
                        onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2d1f38'}
                      >
                        <div className="text-white/60 text-sm font-semibold mb-2">
                          {getStatLabel(key, language)}
                        </div>
                        <div className="font-bold text-2xl text-white">{value}</div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tag Reason Display */}
            {item.tag && (tagReasons as Record<string, ItemTagReasons>)[item.id] && (
              <TagReasonDisplay
                itemId={item.id}
                reasons={(tagReasons as Record<string, ItemTagReasons>)[item.id]}
                language={language}
                allItems={allItems}
              />
            )}

            {/* Craft Relationships */}
            <div>
              <h2 className="text-2xl font-bold mb-6 text-white">
                {t.craftingRecipe}
              </h2>
              <CraftRelationshipsAccordion
                item={item}
                onItemClick={(selectedItem) => {
                  router.push(`/items/${generateSlug(selectedItem.nameEn || selectedItem.name)}`);
                }}
                language={language}
                allItems={allItems}
              />
            </div>
          </div>

          {/* Right Column - Sidebar Info */}
          <div className="space-y-6">
            {/* Value */}
            {item.value && item.value > 0 && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
                <h3 className="font-bold mb-3 text-lg text-white/70">
                  {t.value}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-white">{item.value}</p>
                  <img src="/assets/coins.png" alt="Coins" className="w-8 h-8" />
                </div>
              </div>
            )}

            {/* Max Stack */}
            {item.max_stack && item.max_stack > 1 && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
                <h3 className="font-bold mb-3 text-lg text-white/70">
                  Max Stack
                </h3>
                <p className="text-2xl font-bold text-white">{item.max_stack}</p>
              </div>
            )}

            {/* Workbench */}
            {item.workbench && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
                <h3 className="font-bold mb-3 text-lg text-white/70">
                  {t.workbench}
                </h3>
                <p className="text-white">{getWorkbenchName(item.workbench, language)}</p>
              </div>
            )}

            {/* Loot Areas */}
            {item.loot_area && (
              <div className="rounded-lg p-6" style={{ backgroundColor: '#1a1120', border: '1px solid #2d1f38' }}>
                <h3 className="font-bold mb-3 text-lg text-white/70">
                  {t.lootAreas}
                </h3>
                <div className="space-y-2">
                  {item.loot_area
                    .split(',')
                    .map((area, idx) => (
                      <p key={idx} className="text-arc-white">
                        {getLootAreaLabel(area.trim(), language)}
                      </p>
                    ))}
                </div>
              </div>
            )}

            {/* Sold By */}
            {item.sold_by && item.sold_by.length > 0 && (
              <div className="bg-arc-blue-lighter/30 border-2 border-purple-500/30 rounded-lg p-6">
                <h3 className="text-purple-400 font-bold mb-3 text-lg">
                  {t.soldBy}
                </h3>
                <div className="space-y-2">
                  {item.sold_by.map((vendor, idx) => (
                    <p key={idx} className="text-arc-white text-sm">
                      {typeof vendor === 'string'
                        ? vendor
                        : `${vendor.trader_name || vendor.name || 'Vendor'}${vendor.price ? ` - ${vendor.price}` : ''}`
                      }
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: item.name,
            description: item.description,
            image: item.icon || '/metapreview.png',
            brand: {
              '@type': 'Brand',
              name: 'Arc Raiders',
            },
            category: item.item_type,
            offers: item.value
              ? {
                '@type': 'Offer',
                price: item.value,
                priceCurrency: 'USD',
              }
              : undefined,
          }),
        }}
      />
    </div>
  );
}
