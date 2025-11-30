/**
 * Date utility functions
 */

import type { Language } from './translations';
import { getTranslation } from './translations';

export function formatDistanceToNow(date: Date, language: Language = 'en'): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const t = getTranslation(language);

  if (diffInSeconds < 60) {
    return t.justNow;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    const key = diffInMinutes === 1 ? 'minuteAgo' : 'minutesAgo';
    // For French: "il y a X minute(s)"
    if (language === 'fr') {
      return `il y a ${diffInMinutes} ${t[key]}`;
    }
    // For German: "vor X Minute(n)"
    if (language === 'de') {
      return `vor ${diffInMinutes} ${t[key]}`;
    }
    // For Spanish: "hace X minuto(s)"
    if (language === 'es') {
      return `hace ${diffInMinutes} ${t[key]}`;
    }
    // For Chinese and English: "X minutes ago" / "X 分钟前"
    return `${diffInMinutes} ${t[key]}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    const key = diffInHours === 1 ? 'hourAgo' : 'hoursAgo';
    if (language === 'fr') {
      return `il y a ${diffInHours} ${t[key]}`;
    }
    if (language === 'de') {
      return `vor ${diffInHours} ${t[key]}`;
    }
    if (language === 'es') {
      return `hace ${diffInHours} ${t[key]}`;
    }
    return `${diffInHours} ${t[key]}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    const key = diffInDays === 1 ? 'dayAgo' : 'daysAgo';
    if (language === 'fr') {
      return `il y a ${diffInDays} ${t[key]}`;
    }
    if (language === 'de') {
      return `vor ${diffInDays} ${t[key]}`;
    }
    if (language === 'es') {
      return `hace ${diffInDays} ${t[key]}`;
    }
    return `${diffInDays} ${t[key]}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    const key = diffInMonths === 1 ? 'monthAgo' : 'monthsAgo';
    if (language === 'fr') {
      return `il y a ${diffInMonths} ${t[key]}`;
    }
    if (language === 'de') {
      return `vor ${diffInMonths} ${t[key]}`;
    }
    if (language === 'es') {
      return `hace ${diffInMonths} ${t[key]}`;
    }
    return `${diffInMonths} ${t[key]}`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  const key = diffInYears === 1 ? 'yearAgo' : 'yearsAgo';
  if (language === 'fr') {
    return `il y a ${diffInYears} ${t[key]}`;
  }
  if (language === 'de') {
    return `vor ${diffInYears} ${t[key]}`;
  }
  if (language === 'es') {
    return `hace ${diffInYears} ${t[key]}`;
  }
  return `${diffInYears} ${t[key]}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
