'use client';

import { useState, useEffect } from 'react';
import { getTranslation, Language } from '@/lib/translations';

export default function ContributionBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [showFeatureModal, setShowFeatureModal] = useState(false);

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
      feature: 'Suggest Feature',
      close: 'Close'
    },
    fr: {
      title: 'Aidez la Base de Données Arc Raiders à Grandir',
      description: 'Contribuez du code sur GitHub pour améliorer la base de données',
      github: 'GitHub',
      feature: 'Proposer une Fonctionnalité',
      close: 'Fermer'
    },
    de: {
      title: 'Helfen Sie der Arc Raiders Datenbank zu wachsen',
      description: 'Tragen Sie Code auf GitHub bei, um die Datenbank zu verbessern',
      github: 'GitHub',
      feature: 'Funktion vorschlagen',
      close: 'Schließen'
    },
    es: {
      title: 'Ayude a crecer la base de datos de Arc Raiders',
      description: 'Contribuya código en GitHub para ayudar a mejorar la base de datos',
      github: 'GitHub',
      feature: 'Sugerir Función',
      close: 'Cerrar'
    },
    pt: {
      title: 'Ajude o Banco de Dados do Arc Raiders a Crescer',
      description: 'Contribua com código no GitHub para ajudar a melhorar o banco de dados',
      github: 'GitHub',
      feature: 'Sugerir Recurso',
      close: 'Fechar'
    },
    pl: {
      title: 'Pomóż Bazie Danych Arc Raiders Rosnąć',
      description: 'Wnieś kod na GitHub, aby pomóc ulepszyć bazę danych',
      github: 'GitHub',
      feature: 'Zasugeruj Funkcję',
      close: 'Zamknij'
    },
    no: {
      title: 'Hjelp Arc Raiders Database til å Vokse',
      description: 'Bidra med kode på GitHub for å hjelpe til med å forbedre databasen',
      github: 'GitHub',
      feature: 'Foreslå Funksjon',
      close: 'Lukk'
    },
    da: {
      title: 'Hjælp Arc Raiders Database med at Vokse',
      description: 'Bidrag med kode på GitHub for at hjælpe med at forbedre databasen',
      github: 'GitHub',
      feature: 'Foreslå Funktion',
      close: 'Luk'
    },
    it: {
      title: 'Aiuta Arc Raiders Database a Crescere',
      description: 'Contribuisci codice su GitHub per aiutare a migliorare il database',
      github: 'GitHub',
      feature: 'Suggerisci Funzione',
      close: 'Chiudi'
    },
    ru: {
      title: 'Помогите базе данных Arc Raiders расти',
      description: 'Внесите код на GitHub, чтобы помочь улучшить базу данных',
      github: 'GitHub',
      feature: 'Предложить функцию',
      close: 'Закрыть'
    },
    ja: {
      title: 'Arc Raidersデータベースの成長を支援',
      description: 'GitHubにコードを貢献して、データベースの改善を支援してください',
      github: 'GitHub',
      feature: '機能を提案',
      close: '閉じる'
    },
    'zh-TW': {
      title: '幫助 Arc Raiders 資料庫成長',
      description: '在 GitHub 上貢獻代碼以幫助改進資料庫',
      github: 'GitHub',
      feature: '建議功能',
      close: '關閉'
    },
    uk: {
      title: 'Допоможіть Базі Даних Arc Raiders Зростати',
      description: 'Внесіть код на GitHub, щоб допомогти покращити базу даних',
      github: 'GitHub',
      feature: 'Запропонувати функцію',
      close: 'Закрити'
    },
    'zh-CN': {
      title: '帮助 Arc Raiders 数据库增长',
      description: '在 GitHub 上贡献代码以帮助改进数据库',
      github: 'GitHub',
      feature: '建议功能',
      close: '关闭'
    },
    kr: {
      title: 'Arc Raiders 데이터베이스 성장 지원',
      description: 'GitHub에서 코드를 기여하여 데이터베이스 개선에 도움을 주세요',
      github: 'GitHub',
      feature: '기능 제안',
      close: '닫기'
    },
    tr: {
      title: 'Arc Raiders Veritabanının Büyümesine Yardımcı Olun',
      description: 'Veritabanını geliştirmeye yardımcı olmak için GitHub\'da kod katkısı yapın',
      github: 'GitHub',
      feature: 'Özellik Öner',
      close: 'Kapat'
    },
    hr: {
      title: 'Pomozite Arc Raiders Bazi Podataka da Raste',
      description: 'Doprinite kod na GitHub-u kako biste pomogali u poboljšanju baze podataka',
      github: 'GitHub',
      feature: 'Predloži Značajku',
      close: 'Zatvori'
    },
    sr: {
      title: 'Pomozite Arc Raiders Bazi Podataka da Raste',
      description: 'Doprinite kod na GitHub-u kako biste pomogali u poboljšanju baze podataka',
      github: 'GitHub',
      feature: 'Predloži Funkciju',
      close: 'Zatvori'
    }
  };

  const text = bannerText[language] || bannerText.en;

  // Modal-specific translations
  const modalText = {
    en: {
      title: 'Suggest a Feature',
      step1: 'Go to ',
      step2: 'Click "New issue"',
      step3: 'Select "Feature request" as the issue template',
      step4: 'Describe your feature idea and submit',
      openGitHub: 'Open GitHub Issues',
      close: 'Close'
    },
    fr: {
      title: 'Proposer une Fonctionnalité',
      step1: 'Allez sur ',
      step2: 'Cliquez sur "New issue"',
      step3: 'Sélectionnez "Feature request" comme modèle de problème',
      step4: 'Décrivez votre idée de fonctionnalité et soumettez',
      openGitHub: 'Ouvrir GitHub Issues',
      close: 'Fermer'
    },
    de: {
      title: 'Funktion vorschlagen',
      step1: 'Gehen Sie zu ',
      step2: 'Klicken Sie auf "New issue"',
      step3: 'Wählen Sie "Feature request" als Problemvorlage',
      step4: 'Beschreiben Sie Ihre Funktionsidee und reichen Sie sie ein',
      openGitHub: 'GitHub Issues öffnen',
      close: 'Schließen'
    },
    es: {
      title: 'Sugerir Función',
      step1: 'Vaya a ',
      step2: 'Haga clic en "New issue"',
      step3: 'Seleccione "Feature request" como plantilla de problema',
      step4: 'Describa su idea de función y envíela',
      openGitHub: 'Abrir GitHub Issues',
      close: 'Cerrar'
    },
    pt: {
      title: 'Sugerir Recurso',
      step1: 'Vá para ',
      step2: 'Clique em "New issue"',
      step3: 'Selecione "Feature request" como modelo de problema',
      step4: 'Descreva sua ideia de recurso e envie',
      openGitHub: 'Abrir GitHub Issues',
      close: 'Fechar'
    },
    pl: {
      title: 'Zasugeruj Funkcję',
      step1: 'Przejdź do ',
      step2: 'Kliknij "New issue"',
      step3: 'Wybierz "Feature request" jako szablon problemu',
      step4: 'Opisz swoją ideę funkcji i wyślij',
      openGitHub: 'Otwórz GitHub Issues',
      close: 'Zamknij'
    },
    no: {
      title: 'Foreslå Funksjon',
      step1: 'Gå til ',
      step2: 'Klikk "New issue"',
      step3: 'Velg "Feature request" som problemmal',
      step4: 'Beskriv funksjonsideen din og send inn',
      openGitHub: 'Åpne GitHub Issues',
      close: 'Lukk'
    },
    da: {
      title: 'Foreslå Funktion',
      step1: 'Gå til ',
      step2: 'Klik på "New issue"',
      step3: 'Vælg "Feature request" som problemskabelon',
      step4: 'Beskriv din funktionsidé og indsend',
      openGitHub: 'Åbn GitHub Issues',
      close: 'Luk'
    },
    it: {
      title: 'Suggerisci Funzione',
      step1: 'Vai a ',
      step2: 'Fai clic su "New issue"',
      step3: 'Seleziona "Feature request" come modello di problema',
      step4: 'Descrivi la tua idea di funzione e invia',
      openGitHub: 'Apri GitHub Issues',
      close: 'Chiudi'
    },
    ru: {
      title: 'Предложить функцию',
      step1: 'Перейдите на ',
      step2: 'Нажмите "New issue"',
      step3: 'Выберите "Feature request" в качестве шаблона проблемы',
      step4: 'Опишите свою идею функции и отправьте',
      openGitHub: 'Открыть GitHub Issues',
      close: 'Закрыть'
    },
    ja: {
      title: '機能を提案',
      step1: '次に進みます ',
      step2: '"New issue" をクリック',
      step3: '"Feature request" を問題テンプレートとして選択',
      step4: '機能アイデアを説明して送信',
      openGitHub: 'GitHub Issues を開く',
      close: '閉じる'
    },
    'zh-TW': {
      title: '建議功能',
      step1: '前往 ',
      step2: '點擊 "New issue"',
      step3: '選擇 "Feature request" 作為問題範本',
      step4: '描述您的功能想法並提交',
      openGitHub: '開啟 GitHub Issues',
      close: '關閉'
    },
    uk: {
      title: 'Запропонувати функцію',
      step1: 'Перейдіть на ',
      step2: 'Натисніть "New issue"',
      step3: 'Виберіть "Feature request" як шаблон проблеми',
      step4: 'Опишіть свою ідею функції та відправте',
      openGitHub: 'Відкрити GitHub Issues',
      close: 'Закрити'
    },
    'zh-CN': {
      title: '建议功能',
      step1: '前往 ',
      step2: '点击 "New issue"',
      step3: '选择 "Feature request" 作为问题模板',
      step4: '描述您的功能想法并提交',
      openGitHub: '打开 GitHub Issues',
      close: '关闭'
    },
    kr: {
      title: '기능 제안',
      step1: '다음으로 이동 ',
      step2: '"New issue" 클릭',
      step3: '"Feature request"를 이슈 템플릿으로 선택',
      step4: '기능 아이디어를 설명하고 제출',
      openGitHub: 'GitHub Issues 열기',
      close: '닫기'
    },
    tr: {
      title: 'Özellik Öner',
      step1: 'Şu sayfaya gidin ',
      step2: '"New issue" öğesine tıklayın',
      step3: '"Feature request" öğesini sorun şablonu olarak seçin',
      step4: 'Özellik fikrinizi açıklayın ve gönderin',
      openGitHub: 'GitHub Issues Aç',
      close: 'Kapat'
    },
    hr: {
      title: 'Predloži Značajku',
      step1: 'Idite na ',
      step2: 'Kliknite "New issue"',
      step3: 'Odaberite "Feature request" kao šablonu problema',
      step4: 'Opišite svoju ideju značajke i pošaljite',
      openGitHub: 'Otvorite GitHub Issues',
      close: 'Zatvori'
    },
    sr: {
      title: 'Predloži Funkciju',
      step1: 'Idite na ',
      step2: 'Kliknite "New issue"',
      step3: 'Odaberite "Feature request" kao šablon problema',
      step4: 'Opišite svoju ideju funkcije i pošaljite',
      openGitHub: 'Otvorite GitHub Issues',
      close: 'Zatvori'
    }
  };

  const modal = modalText[language] || modalText.en;

  return (
    <>
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

          <div className="flex gap-3 flex-shrink-0 flex-wrap justify-end">
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
              onClick={() => setShowFeatureModal(true)}
              className="font-bold py-2 px-4 rounded transition-colors text-sm whitespace-nowrap border-2 cursor-pointer"
              style={{
                backgroundColor: 'rgba(19, 9, 24, 0.2)',
                borderColor: '#130918',
                color: '#130918'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.3)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(19, 9, 24, 0.2)')}
            >
              {text.feature}
            </button>
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
    {showFeatureModal && (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => setShowFeatureModal(false)}
      >
        <div
          className="bg-arc-blue border-2 border-arc-yellow/30 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => setShowFeatureModal(false)}
            type="button"
            className="absolute top-4 right-4 w-10 h-10 bg-arc-blue-light hover:bg-red-500/20 rounded-full flex items-center justify-center text-arc-white text-2xl hover:text-red-400 transition-all z-50 cursor-pointer"
          >
            ✕
          </button>

          <div className="p-6 md:p-8">
            <h2 className="text-3xl font-bold text-arc-yellow mb-6">{modal.title}</h2>

            <div className="space-y-4 text-arc-white/90 mb-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-arc-yellow/20 text-arc-yellow rounded-full flex items-center justify-center font-bold">1</div>
                <p>{modal.step1}<span className="font-bold text-arc-yellow">GitHub Issues</span></p>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-arc-yellow/20 text-arc-yellow rounded-full flex items-center justify-center font-bold">2</div>
                <p>{modal.step2}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-arc-yellow/20 text-arc-yellow rounded-full flex items-center justify-center font-bold">3</div>
                <p>{modal.step3}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-arc-yellow/20 text-arc-yellow rounded-full flex items-center justify-center font-bold">4</div>
                <p>{modal.step4}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <a
                href="https://github.com/Teyk0o/ARDB/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold py-3 px-6 rounded transition-colors text-sm border-2 flex-1 text-center"
                style={{
                  backgroundColor: '#f1aa1c',
                  borderColor: '#f1aa1c',
                  color: '#130918'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                {modal.openGitHub}
              </a>
              <button
                onClick={() => setShowFeatureModal(false)}
                className="font-bold py-3 px-6 rounded transition-colors text-sm border-2"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: '#f1aa1c',
                  color: '#f1aa1c'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(241, 170, 28, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {modal.close}
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
