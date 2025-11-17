'use client';

import { useState, useEffect } from 'react';
import { categoryTranslations } from '@/lib/translations';
import { Language } from '@/lib/translations';

export default function CategoriesPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Get language from localStorage
    const saved = localStorage.getItem('arc-db-language') as Language;
    if (saved && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(saved)) {
      setLanguage(saved);
    }
  }, []);

  if (!isMounted) {
    return null;
  }

  const t = categoryTranslations[language] || categoryTranslations.en;

  const categories = [
    {
      key: 'weapons',
      types: ['Weapon']
    },
    {
      key: 'materials',
      types: ['Basic Material', 'Refined Material', 'Advanced Material', 'Topside Material']
    },
    {
      key: 'medical',
      types: ['Medical', 'Quick Use', 'Quick use', 'Consumable']
    },
    {
      key: 'shields',
      types: ['Shield', 'Augment']
    },
    {
      key: 'ammunition',
      types: ['Ammunition']
    },
    {
      key: 'explosives',
      types: ['Explosives', 'Gadget', 'Throwable']
    },
    {
      key: 'keys',
      types: ['Key', 'Quest Item', 'Misc']
    },
    {
      key: 'cosmetics',
      types: ['Cosmetic', 'Modification', 'Mods']
    }
  ];

  return (
    <div className="min-h-screen bg-arc-blue">
      {/* Header */}
      <header className="bg-arc-blue-light border-b-2 border-arc-yellow/30 grain-texture">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-arc-white mb-2">
            {t.categoriesTitle}
          </h1>
          <p className="text-arc-white/70">
            {t.categoriesSubtitle}
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const filterQuery = category.types.length === 1
              ? `?type=${encodeURIComponent(category.types[0])}`
              : `?types=${encodeURIComponent(category.types.join(','))}`;

            const categoryName = t[`${category.key}` as keyof typeof t];
            const categoryDesc = t[`${category.key}Desc` as keyof typeof t];

            return (
            <a
              key={category.key}
              href={`/${filterQuery}`}
              className="group bg-arc-blue-light border-2 border-arc-blue-lighter hover:border-arc-yellow rounded-lg p-6 transition-all duration-300 hover:shadow-lg"
            >
              <h2 className="text-xl font-bold text-arc-white mb-2 group-hover:text-arc-yellow transition-colors">
                {categoryName}
              </h2>
              <p className="text-arc-white/70 text-sm mb-4">
                {categoryDesc}
              </p>
              <div className="text-arc-yellow text-sm font-semibold">
                {t.exploreItems}
              </div>
            </a>
            );
          })}
        </div>

        {/* Crafting Tips Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-arc-white mb-6">{t.gettingStarted}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-arc-yellow mb-3">{t.basics}</h3>
              <ul className="text-arc-white/70 space-y-2 text-sm">
                <li>• {t.basicsTip1}</li>
                <li>• {t.basicsTip2}</li>
                <li>• {t.basicsTip3}</li>
                <li>• {t.basicsTip4}</li>
              </ul>
            </div>
            <div className="bg-arc-blue-light border-2 border-arc-yellow/30 rounded-lg p-6">
              <h3 className="text-lg font-bold text-arc-yellow mb-3">{t.tips}</h3>
              <ul className="text-arc-white/70 space-y-2 text-sm">
                <li>• {t.tipsTip1}</li>
                <li>• {t.tipsTip2}</li>
                <li>• {t.tipsTip3}</li>
                <li>• {t.tipsTip4}</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-arc-blue-lighter mt-12 py-8">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-arc-white/70 text-sm">
            <a href="/" className="text-arc-yellow hover:underline">
              {t.backToDatabase}
            </a>
          </p>
          <p className="text-arc-white/70 text-sm">
            <a href="/translate" className="text-arc-yellow hover:underline">
              {t.categoriesTitle} - Help Translate
            </a>
          </p>
          {language === 'fr' && (
            <div className="flex items-center justify-center gap-2">
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
        </div>
      </footer>
    </div>
  );
}
