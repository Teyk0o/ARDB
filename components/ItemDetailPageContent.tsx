'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Item } from '@/types/item';
import { Language, getTranslation, getStatLabel, getRarityLabel, getItemTypeLabel, getLootAreaLabel } from '@/lib/translations';
import { generateSlug } from '@/lib/slugUtils';
import CraftRelationshipsAccordion from './CraftRelationshipsAccordion';
import MainHeader from './MainHeader';
import TagReasonDisplay from './TagReasonDisplay';
import tagReasons from '@/data/item-tag-reasons.json';
import type { ItemTagReasons } from '@/lib/tagReasoning';
import type { Quest } from '@/types/tags';

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
    en: 'Gunsmith', fr: 'Armurier', de: 'Waffenschmied', es: 'Armero', pt: 'Armeiro',
    pl: 'Rusznikarz', no: 'Våpensmed', da: 'Våbensmed', it: 'Armaiolo', ru: 'Оружейник',
    ja: '武器職人', 'zh-TW': '槍匠', uk: 'Зброяр', 'zh-CN': '枪匠', kr: '총기 제작자',
    tr: 'Silahçı', hr: 'Oružar', sr: 'Oružar'
  },
  gear_bench: {
    en: 'Gear Bench', fr: 'Établi d\'équipement', de: 'Ausrüstungswerkbank', es: 'Banco de equipo',
    pt: 'Bancada de equipamento', pl: 'Stół wyposażenia', no: 'Utstyrsbenk', da: 'Udstyrsbænk',
    it: 'Banco dell\'equipaggiamento', ru: 'Верстак снаряжения', ja: '装備ベンチ',
    'zh-TW': '裝備工作台', uk: 'Верстак спорядження', 'zh-CN': '装备工作台',
    kr: '장비 작업대', tr: 'Ekipman Tezgahı', hr: 'Radni stol za opremu', sr: 'Radni sto za opremu'
  },
  medical_lab: {
    en: 'Medical Lab', fr: 'Laboratoire médical', de: 'Medizinisches Labor', es: 'Laboratorio médico',
    pt: 'Laboratório médico', pl: 'Laboratorium medyczne', no: 'Medisinsk lab', da: 'Medicinsk laboratorium',
    it: 'Laboratorio medico', ru: 'Медицинская лаборатория', ja: '医療ラボ',
    'zh-TW': '醫療實驗室', uk: 'Медична лабораторія', 'zh-CN': '医疗实验室',
    kr: '의료 연구소', tr: 'Tıbbi Laboratuvar', hr: 'Medicinski laboratorij', sr: 'Medicinski laboratorijum'
  },
  explosives_station: {
    en: 'Explosives Station', fr: 'Station d\'explosifs', de: 'Sprengstoffstation', es: 'Estación de explosivos',
    pt: 'Estação de explosivos', pl: 'Stacja wybuchowa', no: 'Eksplosivstasjon', da: 'Eksplosivstation',
    it: 'Stazione esplosivi', ru: 'Станция взрывчатки', ja: '爆発物ステーション',
    'zh-TW': '爆炸物站', uk: 'Станція вибухівки', 'zh-CN': '爆炸物站',
    kr: '폭발물 스테이션', tr: 'Patlayıcı İstasyonu', hr: 'Stanica eksploziva', sr: 'Stanica eksploziva'
  },
  utility_station: {
    en: 'Utility Station', fr: 'Station utilitaire', de: 'Versorgungsstation', es: 'Estación de utilidad',
    pt: 'Estação utilitária', pl: 'Stacja użytkowa', no: 'Bruksstasjon', da: 'Forsyningsstation',
    it: 'Stazione di utilità', ru: 'Служебная станция', ja: 'ユーティリティステーション',
    'zh-TW': '實用站', uk: 'Службова станція', 'zh-CN': '实用站',
    kr: '유틸리티 스테이션', tr: 'Yardımcı İstasyon', hr: 'Stanica za usluge', sr: 'Stanica za usluge'
  },
  refiner: {
    en: 'Refiner', fr: 'Raffinerie', de: 'Raffinerie', es: 'Refinador', pt: 'Refinador',
    pl: 'Rafineria', no: 'Raffineri', da: 'Raffinaderi', it: 'Raffineria', ru: 'Очиститель',
    ja: '精製所', 'zh-TW': '精煉廠', uk: 'Очищувач', 'zh-CN': '精炼厂',
    kr: '정제소', tr: 'Rafineri', hr: 'Rafinerija', sr: 'Rafinerija'
  },
  scrappy: {
    en: 'Scrappy', fr: 'Scrappy', de: 'Scrappy', es: 'Scrappy', pt: 'Scrappy',
    pl: 'Scrappy', no: 'Scrappy', da: 'Scrappy', it: 'Scrappy', ru: 'Scrappy',
    ja: 'Scrappy', 'zh-TW': 'Scrappy', uk: 'Scrappy', 'zh-CN': 'Scrappy',
    kr: 'Scrappy', tr: 'Scrappy', hr: 'Scrappy', sr: 'Scrappy'
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
    <div className="min-h-screen bg-arc-blue text-arc-white">
      {/* Header */}
      <MainHeader language={language} setLanguage={handleLanguageChange} />


      {/* Hero Section with Item Image */}
      <div
        className={`border-b-2 border-arc-yellow/30 ${
          item.rarity === 'Common' ? 'bg-gradient-to-b from-gray-600/20 to-gray-700/10' :
          item.rarity === 'Uncommon' ? 'bg-gradient-to-b from-green-600/20 to-green-700/10' :
          item.rarity === 'Rare' ? 'bg-gradient-to-b from-blue-600/20 to-blue-700/10' :
          item.rarity === 'Epic' ? 'bg-gradient-to-b from-purple-600/20 to-purple-700/10' :
          'bg-gradient-to-b'
        }`}
        style={isLegendary ? {
          backgroundImage: 'linear-gradient(to bottom, rgba(241, 170, 28, 0.3), rgba(241, 170, 28, 0.1))'
        } : undefined}
      >
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Image */}
            <div className="flex justify-center md:col-span-1">
              <div className={`w-40 h-40 md:w-56 md:h-56 rounded-2xl flex items-center justify-center overflow-hidden border-4 ${rarityClass} bg-arc-blue-darker shadow-2xl`}>
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

              <h1 className="text-4xl md:text-5xl font-bold text-arc-yellow mb-3 break-words">
                {item.name}
              </h1>

              <p className="text-arc-white/80 text-lg mb-6">
                {getItemTypeLabel(item.item_type, language)}
              </p>

              {item.description && (
                <p className="text-arc-white/90 text-base leading-relaxed mb-6 max-w-xl">
                  {item.description}
                </p>
              )}

              {/* Share Button */}
              <div className="flex gap-3 flex-wrap">
                {canShare && (
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-2 bg-arc-yellow/20 hover:bg-arc-yellow/30 text-arc-yellow border-2 border-arc-yellow/50 px-4 py-2 rounded-lg transition-all font-semibold"
                  >
                    Share
                  </button>
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
                <h2 className="text-2xl font-bold text-arc-yellow mb-6">
                  {t.statistics}
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(item.stat_block)
                    .filter(([_, value]) => value != null && value !== 0 && value !== undefined)
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gradient-to-br from-arc-blue-lighter/50 to-arc-blue-darker/50 px-4 py-4 rounded-lg border-2 border-arc-white/10 hover:border-arc-yellow/50 transition-all"
                      >
                        <div className="text-arc-white/60 text-sm font-semibold mb-2">
                          {getStatLabel(key, language)}
                        </div>
                        <div className="text-arc-yellow font-bold text-2xl">{value}</div>
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
              <h2 className="text-2xl font-bold text-arc-yellow mb-6">
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
              <div className="bg-arc-blue-lighter/30 border-2 border-arc-yellow/30 rounded-lg p-6">
                <h3 className="text-arc-yellow font-bold mb-3 text-lg">
                  {t.value}
                </h3>
                <div className="flex items-center gap-3">
                  <p className="text-2xl font-bold text-arc-white">{item.value}</p>
                  <img src="/assets/coins.png" alt="Coins" className="w-8 h-8" />
                </div>
              </div>
            )}

            {/* Workbench */}
            {item.workbench && (
              <div className="bg-arc-blue-lighter/30 border-2 border-green-500/30 rounded-lg p-6">
                <h3 className="text-green-400 font-bold mb-3 text-lg">
                  {t.workbench}
                </h3>
                <p className="text-arc-white">{getWorkbenchName(item.workbench, language)}</p>
              </div>
            )}

            {/* Loot Areas */}
            {item.loot_area && (
              <div className="bg-arc-blue-lighter/30 border-2 border-blue-500/30 rounded-lg p-6">
                <h3 className="text-blue-400 font-bold mb-3 text-lg">
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
