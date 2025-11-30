'use client';

import { useState, useEffect } from 'react';
import MainHeader from '@/components/MainHeader';
import { categoryTranslations } from '@/lib/translations';
import { Language } from '@/lib/translations';

export default function CategoriesPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Get language from localStorage
    const saved = localStorage.getItem('arc-db-language') as Language;
    if (saved && ['en', 'fr', 'es', 'de', 'zh-CN'].includes(saved)) {
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
    <div className="min-h-screen" style={{ backgroundColor: '#130918' }}>
      {/* Header */}
      <MainHeader language={language} setLanguage={setLanguage} />

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
              className="group rounded-lg p-6 transition-all duration-300 hover:shadow-lg cursor-pointer block"
              style={{
                backgroundColor: '#1a1120',
                border: '1px solid #2d1f38'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#f1aa1c';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(241, 170, 28, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#2d1f38';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <h2
                className="text-xl font-bold mb-2 transition-colors"
                style={{ color: '#ffffff' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#f1aa1c'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#ffffff'}
              >
                {categoryName}
              </h2>
              <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {categoryDesc}
              </p>
              <div className="text-sm font-semibold" style={{ color: '#f1aa1c' }}>
                {t.exploreItems}
              </div>
            </a>
            );
          })}
        </div>

        {/* Crafting Tips Section */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#ffffff' }}>{t.gettingStarted}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
              className="rounded-lg p-6"
              style={{
                backgroundColor: '#1a1120',
                border: '1px solid rgba(241, 170, 28, 0.3)'
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: '#f1aa1c' }}>{t.basics}</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                <li>• {t.basicsTip1}</li>
                <li>• {t.basicsTip2}</li>
                <li>• {t.basicsTip3}</li>
                <li>• {t.basicsTip4}</li>
              </ul>
            </div>
            <div
              className="rounded-lg p-6"
              style={{
                backgroundColor: '#1a1120',
                border: '1px solid rgba(241, 170, 28, 0.3)'
              }}
            >
              <h3 className="text-lg font-bold mb-3" style={{ color: '#f1aa1c' }}>{t.tips}</h3>
              <ul className="space-y-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
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
      <footer className="mt-12 py-8" style={{ borderTop: '1px solid #2d1f38' }}>
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            <a
              href="/"
              className="font-medium transition-colors cursor-pointer"
              style={{ color: '#f1aa1c' }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
              {t.backToDatabase}
            </a>
          </p>
          {language === 'fr' && (
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Rejoignez l&apos;équipe francophone</span>
              <a
                href="https://discord.gg/54EQD8fpky"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-sm transition-colors cursor-pointer"
                style={{ color: '#f1aa1c' }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
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
