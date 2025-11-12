'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Language, getTranslation } from '@/lib/translations';

export default function NotFound() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLanguage = localStorage.getItem('arc-db-language') as Language;
    if (savedLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }

    const handleStorageChange = () => {
      const newLanguage = localStorage.getItem('arc-db-language') as Language;
      if (newLanguage && ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'].includes(newLanguage)) {
        setLanguage(newLanguage);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!isMounted) {
    return null;
  }

  const t = getTranslation(language);

  const notFoundTexts = {
    en: {
      title: 'Page Not Found',
      subtitle: 'The page you are looking for does not exist.',
      code: '404',
      message: 'This might be because the URL is incorrect or the page has been removed.',
      back: 'Back to Home',
      categories: 'Browse Categories',
    },
    fr: {
      title: 'Page Non Trouvée',
      subtitle: 'La page que vous recherchez n\'existe pas.',
      code: '404',
      message: 'Cela peut être parce que l\'URL est incorrecte ou la page a été supprimée.',
      back: 'Retour à l\'Accueil',
      categories: 'Parcourir les Catégories',
    },
    de: {
      title: 'Seite Nicht Gefunden',
      subtitle: 'Die gesuchte Seite existiert nicht.',
      code: '404',
      message: 'Dies kann daran liegen, dass die URL falsch ist oder die Seite gelöscht wurde.',
      back: 'Zur Startseite',
      categories: 'Kategorien Durchsuchen',
    },
    es: {
      title: 'Página No Encontrada',
      subtitle: 'La página que buscas no existe.',
      code: '404',
      message: 'Esto puede deberse a que la URL es incorrecta o la página ha sido eliminada.',
      back: 'Volver al Inicio',
      categories: 'Explorar Categorías',
    },
    pt: {
      title: 'Página Não Encontrada',
      subtitle: 'A página que você procura não existe.',
      code: '404',
      message: 'Isso pode ser porque a URL está incorreta ou a página foi removida.',
      back: 'Voltar para Início',
      categories: 'Explorar Categorias',
    },
    pl: {
      title: 'Strona Nie Znaleziona',
      subtitle: 'Strona, którą szukasz, nie istnieje.',
      code: '404',
      message: 'Może to być spowodowane nieprawidłowym adresem URL lub usunięciem strony.',
      back: 'Powrót do Strony Głównej',
      categories: 'Przeglądaj Kategorie',
    },
    no: {
      title: 'Siden Ble Ikke Funnet',
      subtitle: 'Siden du søker etter finnes ikke.',
      code: '404',
      message: 'Dette kan skyldes at URL-en er feil eller siden har blitt slettet.',
      back: 'Tilbake til Forsiden',
      categories: 'Utforsk Kategorier',
    },
    da: {
      title: 'Siden Blev Ikke Fundet',
      subtitle: 'Den side, du søger efter, findes ikke.',
      code: '404',
      message: 'Dette kan skyldes, at URL\'en er forkert, eller siden er blevet slettet.',
      back: 'Tilbage til Forsiden',
      categories: 'Udforsk Kategorier',
    },
    it: {
      title: 'Pagina Non Trovata',
      subtitle: 'La pagina che cerchi non esiste.',
      code: '404',
      message: 'Questo potrebbe essere perché l\'URL è errato o la pagina è stata eliminata.',
      back: 'Torna alla Home',
      categories: 'Esplora Categorie',
    },
    ru: {
      title: 'Страница Не Найдена',
      subtitle: 'Страница, которую вы ищете, не существует.',
      code: '404',
      message: 'Это может быть потому, что URL неверен или страница была удалена.',
      back: 'Вернуться на Главную',
      categories: 'Просмотреть Категории',
    },
    ja: {
      title: 'ページが見つかりません',
      subtitle: 'お探しのページは存在しません。',
      code: '404',
      message: 'URLが間違っているか、ページが削除されている可能性があります。',
      back: 'ホームに戻る',
      categories: 'カテゴリを探索',
    },
    'zh-TW': {
      title: '找不到頁面',
      subtitle: '您尋找的頁面不存在。',
      code: '404',
      message: '這可能是因為 URL 不正確或頁面已被刪除。',
      back: '返回首頁',
      categories: '瀏覽類別',
    },
    uk: {
      title: 'Сторінку Не Знайдено',
      subtitle: 'Сторінка, яку ви шукаєте, не існує.',
      code: '404',
      message: 'Це може бути тому, що URL невірний або сторінка була видалена.',
      back: 'Повернутися на Головну',
      categories: 'Переглянути Категорії',
    },
    'zh-CN': {
      title: '找不到页面',
      subtitle: '您搜索的页面不存在。',
      code: '404',
      message: '这可能是因为 URL 不正确或页面已被删除。',
      back: '返回首页',
      categories: '浏览类别',
    },
    kr: {
      title: '페이지를 찾을 수 없습니다',
      subtitle: '찾고 있는 페이지가 존재하지 않습니다.',
      code: '404',
      message: '이는 URL이 잘못되었거나 페이지가 삭제되었기 때문일 수 있습니다.',
      back: '홈으로 돌아가기',
      categories: '카테고리 탐색',
    },
    tr: {
      title: 'Sayfa Bulunamadı',
      subtitle: 'Aradığınız sayfa mevcut değil.',
      code: '404',
      message: 'Bu, URL\'nin yanlış olması veya sayfanın silinmiş olması nedeniyle olabilir.',
      back: 'Anasayfaya Dön',
      categories: 'Kategorileri İncele',
    },
    hr: {
      title: 'Stranica Nije Pronađena',
      subtitle: 'Stranica koju tražite ne postoji.',
      code: '404',
      message: 'To može biti jer je URL neispravan ili je stranica obrisana.',
      back: 'Povratak na Početak',
      categories: 'Pregledaj Kategorije',
    },
    sr: {
      title: 'Stranica Nije Pronađena',
      subtitle: 'Stranica koju tražite ne postoji.',
      code: '404',
      message: 'To može biti jer je URL neispravan ili je stranica obrisana.',
      back: 'Povratak na Početak',
      categories: 'Pregledaj Kategorije',
    },
  };

  const text = notFoundTexts[language] || notFoundTexts.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-arc-blue to-arc-blue-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grain texture */}
      <div className="grain-texture absolute inset-0 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Large 404 Code */}
        <div className="mb-8">
          <div className="text-arc-yellow text-8xl md:text-[140px] font-black">
            {text.code}
          </div>
        </div>

        {/* Title and Subtitle */}
        <h1 className="text-4xl md:text-5xl font-bold text-arc-white mb-4">
          {text.title}
        </h1>
        <p className="text-xl text-arc-white/70 mb-8">
          {text.subtitle}
        </p>
        <p className="text-lg text-arc-white/60 mb-12">
          {text.message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="font-bold py-3 px-8 rounded transition-all text-base border-2 inline-block text-center"
            style={{
              backgroundColor: '#f1aa1c',
              borderColor: '#f1aa1c',
              color: '#130918',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {text.back}
          </Link>
          <Link
            href="/categories"
            className="font-bold py-3 px-8 rounded transition-all text-base border-2 inline-block text-center cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              borderColor: '#f1aa1c',
              color: '#f1aa1c',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(241, 170, 28, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            {text.categories}
          </Link>
        </div>

        {/* Decorative Elements */}
        <div className="mt-20 flex justify-center gap-8">
          <div className="w-16 h-16 border-2 border-arc-yellow/30 rounded-full animate-pulse" />
          <div className="w-16 h-16 border-2 border-arc-yellow/20 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-16 h-16 border-2 border-arc-yellow/10 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
