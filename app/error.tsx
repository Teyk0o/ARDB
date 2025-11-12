'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Language, getTranslation } from '@/lib/translations';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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

  const errorTexts = {
    en: {
      title: 'Something Went Wrong',
      subtitle: 'An unexpected error has occurred.',
      code: '500',
      message: 'Our team has been notified and we\'re working to fix the issue. Please try again later.',
      retry: 'Try Again',
      home: 'Back to Home',
    },
    fr: {
      title: 'Une Erreur s\'est Produite',
      subtitle: 'Une erreur inattendue s\'est produite.',
      code: '500',
      message: 'Notre équipe a été notifiée et nous travaillons pour résoudre le problème. Veuillez réessayer plus tard.',
      retry: 'Réessayer',
      home: 'Retour à l\'Accueil',
    },
    de: {
      title: 'Ein Fehler ist Aufgetreten',
      subtitle: 'Ein unerwarteter Fehler ist aufgetreten.',
      code: '500',
      message: 'Unser Team wurde benachrichtigt und wir arbeiten an der Behebung des Problems. Bitte versuchen Sie es später erneut.',
      retry: 'Erneut Versuchen',
      home: 'Zur Startseite',
    },
    es: {
      title: 'Algo Salió Mal',
      subtitle: 'Ha ocurrido un error inesperado.',
      code: '500',
      message: 'Nuestro equipo ha sido notificado y estamos trabajando para resolver el problema. Por favor, inténtelo más tarde.',
      retry: 'Reintentar',
      home: 'Volver al Inicio',
    },
    pt: {
      title: 'Algo Deu Errado',
      subtitle: 'Ocorreu um erro inesperado.',
      code: '500',
      message: 'Nossa equipe foi notificada e estamos trabalhando para resolver o problema. Tente novamente mais tarde.',
      retry: 'Tentar Novamente',
      home: 'Voltar para Início',
    },
    pl: {
      title: 'Coś Poszło Nie Tak',
      subtitle: 'Wystąpił nieoczekiwany błąd.',
      code: '500',
      message: 'Nasz zespół został powiadomiony i pracujemy nad rozwiązaniem problemu. Spróbuj ponownie później.',
      retry: 'Spróbuj Ponownie',
      home: 'Powrót do Strony Głównej',
    },
    no: {
      title: 'Noe Gikk Galt',
      subtitle: 'En uventet feil har oppstått.',
      code: '500',
      message: 'Teamet vårt har blitt varslet og vi arbeider med å fikse problemet. Vennligst prøv igjen senere.',
      retry: 'Prøv Igjen',
      home: 'Tilbake til Forsiden',
    },
    da: {
      title: 'Noget Gik Galt',
      subtitle: 'Der er opstået en uventet fejl.',
      code: '500',
      message: 'Vores team er blevet underrettet og vi arbejder på at løse problemet. Prøv venligst igen senere.',
      retry: 'Prøv Igen',
      home: 'Tilbage til Forsiden',
    },
    it: {
      title: 'Qualcosa è Andato Male',
      subtitle: 'Si è verificato un errore inaspettato.',
      code: '500',
      message: 'Il nostro team è stato notificato e stiamo lavorando per risolvere il problema. Per favore, riprova più tardi.',
      retry: 'Riprova',
      home: 'Torna alla Home',
    },
    ru: {
      title: 'Что-то Пошло Не Так',
      subtitle: 'Произошла непредвиденная ошибка.',
      code: '500',
      message: 'Наша команда была уведомлена и мы работаем над исправлением проблемы. Пожалуйста, попробуйте позже.',
      retry: 'Попробовать Снова',
      home: 'Вернуться на Главную',
    },
    ja: {
      title: '予期しないエラーが発生しました',
      subtitle: '予期しないエラーが発生しました。',
      code: '500',
      message: '当チームに通知されており、問題の修正に取り組んでいます。後でもう一度お試しください。',
      retry: '再度試す',
      home: 'ホームに戻る',
    },
    'zh-TW': {
      title: '出現錯誤',
      subtitle: '發生了未預期的錯誤。',
      code: '500',
      message: '我們的團隊已被通知，我們正在努力解決此問題。請稍後再試。',
      retry: '重試',
      home: '返回首頁',
    },
    uk: {
      title: 'Щось Пішло Не Так',
      subtitle: 'Сталася непередбачена помилка.',
      code: '500',
      message: 'Наша команда була сповіщена і ми працюємо над розв\'язанням проблеми. Будь ласка, спробуйте пізніше.',
      retry: 'Спробувати Знову',
      home: 'Повернутися на Головну',
    },
    'zh-CN': {
      title: '出现错误',
      subtitle: '发生了未预期的错误。',
      code: '500',
      message: '我们的团队已被通知，我们正在努力解决此问题。请稍后再试。',
      retry: '重试',
      home: '返回首页',
    },
    kr: {
      title: '오류가 발생했습니다',
      subtitle: '예기치 않은 오류가 발생했습니다.',
      code: '500',
      message: '당사 팀에 알렸으며 문제 해결을 위해 노력하고 있습니다. 나중에 다시 시도해주세요.',
      retry: '다시 시도',
      home: '홈으로 돌아가기',
    },
    tr: {
      title: 'Bir Şey Ters Gitti',
      subtitle: 'Beklenmeyen bir hata oluştu.',
      code: '500',
      message: 'Ekibimiz bilgilendirildi ve sorunu çözmek için çalışıyoruz. Lütfen daha sonra tekrar deneyin.',
      retry: 'Tekrar Dene',
      home: 'Anasayfaya Dön',
    },
    hr: {
      title: 'Nešto je Pošlo Po Zlu',
      subtitle: 'Došlo je do neočekivane greške.',
      code: '500',
      message: 'Naš tim je obaviješten i radimo na rješavanju problema. Molimo pokušajte kasnije.',
      retry: 'Pokušaj Ponovno',
      home: 'Povratak na Početak',
    },
    sr: {
      title: 'Nešto je Pošlo Po Zlu',
      subtitle: 'Došlo je do neočekivane greške.',
      code: '500',
      message: 'Naš tim je obaviješten i radimo na rješavanju problema. Molimo pokušajte kasnije.',
      retry: 'Pokušaj Ponovno',
      home: 'Povratak na Početak',
    },
  };

  const text = errorTexts[language] || errorTexts.en;

  return (
    <div className="min-h-screen bg-gradient-to-b from-arc-blue to-arc-blue-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grain texture */}
      <div className="grain-texture absolute inset-0 pointer-events-none" />

      <div className="relative z-10 text-center max-w-2xl">
        {/* Large 500 Code */}
        <div className="mb-8">
          <div className="text-red-500 text-8xl md:text-[140px] font-black">
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
          <button
            onClick={reset}
            className="font-bold py-3 px-8 rounded transition-all text-base border-2 inline-block text-center cursor-pointer"
            style={{
              backgroundColor: '#f1aa1c',
              borderColor: '#f1aa1c',
              color: '#130918',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            {text.retry}
          </button>
          <Link
            href="/"
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
            {text.home}
          </Link>
        </div>

        {/* Error Details (optional, can be hidden in production) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-12 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-left">
            <p className="text-red-400 text-sm font-mono break-words">
              {error.message}
            </p>
          </div>
        )}

        {/* Decorative Elements */}
        <div className="mt-20 flex justify-center gap-8">
          <div className="w-16 h-16 border-2 border-red-500/30 rounded-full animate-pulse" />
          <div className="w-16 h-16 border-2 border-red-500/20 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-16 h-16 border-2 border-red-500/10 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
        </div>
      </div>
    </div>
  );
}
