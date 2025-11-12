'use client';

import { useState, useEffect } from 'react';
import { getTranslation, Language } from '@/lib/translations';

export default function ContributionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    setIsMounted(true);
    // Check if user has dismissed the banner
    const isDismissed = localStorage.getItem('contribution-banner-dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }

    // Get language from localStorage (synced with ItemsPage)
    const savedLanguage = localStorage.getItem('arc-db-language') as Language;
    if (savedLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    // Listen for language changes
    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('arc-db-language') as Language;
      if (newLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(newLanguage)) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('contribution-banner-dismissed', 'true');
  };

  if (!isMounted || !isVisible) {
    return null;
  }

  const t = getTranslation(language);

  // Banner-specific translations
  const bannerText = {
    en: {
      title: 'Help Arc Raiders Database Grow',
      description: 'Contribute code on GitHub to help improve the database',
      github: 'GitHub',
      close: 'Close'
    },
    fr: {
      title: 'Aidez la Base de Données Arc Raiders à Grandir',
      description: 'Contribuez du code sur GitHub pour améliorer la base de données',
      github: 'GitHub',
      close: 'Fermer'
    },
    de: {
      title: 'Helfen Sie der Arc Raiders Datenbank zu wachsen',
      description: 'Tragen Sie Code auf GitHub bei, um die Datenbank zu verbessern',
      github: 'GitHub',
      close: 'Schließen'
    },
    es: {
      title: 'Ayude a crecer la base de datos de Arc Raiders',
      description: 'Contribuya código en GitHub para ayudar a mejorar la base de datos',
      github: 'GitHub',
      close: 'Cerrar'
    },
    pt: {
      title: 'Ajude o Banco de Dados do Arc Raiders a Crescer',
      description: 'Contribua com código no GitHub para ajudar a melhorar o banco de dados',
      github: 'GitHub',
      close: 'Fechar'
    },
    pl: {
      title: 'Pomóż Bazie Danych Arc Raiders Rosnąć',
      description: 'Wnieś kod na GitHub, aby pomóc ulepszyć bazę danych',
      github: 'GitHub',
      close: 'Zamknij'
    },
    no: {
      title: 'Hjelp Arc Raiders Database til å Vokse',
      description: 'Bidra med kode på GitHub for å hjelpe til med å forbedre databasen',
      github: 'GitHub',
      close: 'Lukk'
    },
    da: {
      title: 'Hjælp Arc Raiders Database med at Vokse',
      description: 'Bidrag med kode på GitHub for at hjælpe med at forbedre databasen',
      github: 'GitHub',
      close: 'Luk'
    },
    it: {
      title: 'Aiuta Arc Raiders Database a Crescere',
      description: 'Contribuisci codice su GitHub per aiutare a migliorare il database',
      github: 'GitHub',
      close: 'Chiudi'
    },
    ru: {
      title: 'Помогите базе данных Arc Raiders расти',
      description: 'Внесите код на GitHub, чтобы помочь улучшить базу данных',
      github: 'GitHub',
      close: 'Закрыть'
    },
    ja: {
      title: 'Arc Raidersデータベースの成長を支援',
      description: 'GitHubにコードを貢献して、データベースの改善を支援してください',
      github: 'GitHub',
      close: '閉じる'
    },
    'zh-TW': {
      title: '幫助 Arc Raiders 資料庫成長',
      description: '在 GitHub 上貢獻代碼以幫助改進資料庫',
      github: 'GitHub',
      close: '關閉'
    },
    uk: {
      title: 'Допоможіть Базі Даних Arc Raiders Зростати',
      description: 'Внесіть код на GitHub, щоб допомогти покращити базу даних',
      github: 'GitHub',
      close: 'Закрити'
    },
    'zh-CN': {
      title: '帮助 Arc Raiders 数据库增长',
      description: '在 GitHub 上贡献代码以帮助改进数据库',
      github: 'GitHub',
      close: '关闭'
    },
    kr: {
      title: 'Arc Raiders 데이터베이스 성장 지원',
      description: 'GitHub에서 코드를 기여하여 데이터베이스 개선에 도움을 주세요',
      github: 'GitHub',
      close: '닫기'
    },
    tr: {
      title: 'Arc Raiders Veritabanının Büyümesine Yardımcı Olun',
      description: 'Veritabanını geliştirmeye yardımcı olmak için GitHub\'da kod katkısı yapın',
      github: 'GitHub',
      close: 'Kapat'
    },
    hr: {
      title: 'Pomozite Arc Raiders Bazi Podataka da Raste',
      description: 'Doprinite kod na GitHub-u kako biste pomogali u poboljšanju baze podataka',
      github: 'GitHub',
      close: 'Zatvori'
    },
    sr: {
      title: 'Pomozite Arc Raiders Bazi Podataka da Raste',
      description: 'Doprinite kod na GitHub-u kako biste pomogali u poboljšanju baze podataka',
      github: 'GitHub',
      close: 'Zatvori'
    }
  };

  const text = bannerText[language] || bannerText.en;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 shadow-2xl z-40"
      style={{ backgroundColor: '#f1aa1c' }}
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold mb-1" style={{ color: '#130918' }}>{text.title}</h3>
            <p className="text-sm" style={{ color: 'rgba(19, 9, 24, 0.8)' }}>
              {text.description}
            </p>
          </div>

          <div className="flex gap-3 flex-shrink-0">
            <a
              href="https://github.com/Teyk0o/ARDB"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap border-2"
              style={{
                backgroundColor: '#130918',
                borderColor: '#130918',
                color: '#f1aa1c'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.8)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#130918')}
            >
              {text.github}
            </a>
            <button
              onClick={handleDismiss}
              className="font-bold py-2 px-4 rounded transition-colors text-sm border-2 cursor-pointer"
              style={{
                backgroundColor: 'transparent',
                borderColor: '#130918',
                color: '#130918'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Dismiss banner"
            >
              {text.close}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
