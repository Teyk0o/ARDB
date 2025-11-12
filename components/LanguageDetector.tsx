'use client';

import { useEffect } from 'react';
import { detectLanguageClient } from '@/lib/languageDetection';
import { Language } from '@/lib/translations';

/**
 * Composant qui détecte automatiquement la langue de l'utilisateur
 * et la définit dans localStorage si elle n'est pas déjà définie.
 *
 * RGPD Compliant:
 * - Aucune géolocalisation
 * - Aucune sauvegarde de données personnelles
 * - Utilise seulement les paramètres du navigateur (Accept-Language)
 * - L'utilisateur peut changer la langue à tout moment
 */
export default function LanguageDetector() {
  useEffect(() => {
    // Vérifie si l'utilisateur a déjà défini une langue
    const savedLanguage = localStorage.getItem('arc-db-language');

    if (!savedLanguage) {
      // Détecte la langue automatiquement
      const detectedLanguage = detectLanguageClient();

      // Sauvegarde la langue détectée
      localStorage.setItem('arc-db-language', detectedLanguage);

      // Dispatch un événement pour mettre à jour les autres composants
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: 'arc-db-language',
          newValue: detectedLanguage,
          url: window.location.href,
        })
      );
    }
  }, []);

  // Ce composant ne rend rien
  return null;
}
