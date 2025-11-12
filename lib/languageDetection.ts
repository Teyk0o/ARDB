import { Language } from '@/lib/translations';

// Mapping des codes de langue du navigateur à nos codes supportés
const LANGUAGE_MAP: Record<string, Language> = {
  'en': 'en',
  'en-US': 'en',
  'en-GB': 'en',
  'fr': 'fr',
  'fr-FR': 'fr',
  'fr-CA': 'fr',
  'de': 'de',
  'de-DE': 'de',
  'de-AT': 'de',
  'de-CH': 'de',
  'es': 'es',
  'es-ES': 'es',
  'es-MX': 'es',
  'pt': 'pt',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'pl': 'pl',
  'pl-PL': 'pl',
  'no': 'no',
  'nb': 'no',
  'nn': 'no',
  'da': 'da',
  'da-DK': 'da',
  'it': 'it',
  'it-IT': 'it',
  'ru': 'ru',
  'ru-RU': 'ru',
  'ja': 'ja',
  'ja-JP': 'ja',
  'zh': 'zh-CN',
  'zh-CN': 'zh-CN',
  'zh-Hans': 'zh-CN',
  'zh-TW': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'uk': 'uk',
  'uk-UA': 'uk',
  'kr': 'kr',
  'ko': 'kr',
  'ko-KR': 'kr',
  'tr': 'tr',
  'tr-TR': 'tr',
  'hr': 'hr',
  'hr-HR': 'hr',
  'sr': 'sr',
  'sr-RS': 'sr',
};

/**
 * Détecte la langue préférée de l'utilisateur basée sur:
 * 1. Le header Accept-Language du navigateur
 * 2. La liste des langues supportées
 *
 * Cette fonction respecte la RGPD en:
 * - N'utilisant que des headers standards HTTP
 * - Ne géolocalisent pas l'utilisateur
 * - Ne sauvegardant rien côté serveur
 * - Utilisant seulement les préférences du navigateur
 *
 * @param acceptLanguageHeader - Le header Accept-Language du navigateur
 * @returns La langue détectée ou 'en' par défaut
 */
export function detectLanguageFromHeader(acceptLanguageHeader?: string): Language {
  if (!acceptLanguageHeader) {
    return 'en';
  }

  // Parse le header Accept-Language
  // Format: "fr-FR,fr;q=0.9,en;q=0.8,en-US;q=0.7"
  const languages = acceptLanguageHeader
    .split(',')
    .map((lang) => {
      const parts = lang.trim().split(';');
      const code = parts[0].trim();
      const quality = parseFloat((parts[1] || 'q=1').split('=')[1] || '1');
      return { code, quality };
    })
    .sort((a, b) => b.quality - a.quality);

  // Cherche la première langue supportée
  for (const { code } of languages) {
    // Try exact match first
    if (LANGUAGE_MAP[code]) {
      return LANGUAGE_MAP[code];
    }

    // Try base language (e.g., "fr" from "fr-FR")
    const baseCode = code.split('-')[0];
    if (LANGUAGE_MAP[baseCode]) {
      return LANGUAGE_MAP[baseCode];
    }
  }

  return 'en';
}

/**
 * Récupère la langue depuis le navigateur côté client
 * Respecte la RGPD en utilisant seulement l'API du navigateur
 */
export function detectLanguageClient(): Language {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const languages = navigator.languages || [navigator.language];

  for (const lang of languages) {
    if (LANGUAGE_MAP[lang]) {
      return LANGUAGE_MAP[lang];
    }

    const baseCode = lang.split('-')[0];
    if (LANGUAGE_MAP[baseCode]) {
      return LANGUAGE_MAP[baseCode];
    }
  }

  return 'en';
}
