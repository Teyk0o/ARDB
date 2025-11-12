const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../lib/translations.ts');
let content = fs.readFileSync(translationsPath, 'utf-8');

// Map of new labels to add to all languages
const newLabels = {
  en: {
    'Healing': 'Healing',
    'Duration': 'Duration',
    'Use Time': 'Use Time',
    'Used Time': 'Used Time',
  },
  fr: {
    'Healing': 'Soin',
    'Duration': 'Durée',
    'Use Time': 'Temps d\'utilisation',
    'Used Time': 'Temps utilisé',
  },
  de: {
    'Healing': 'Heilung',
    'Duration': 'Dauer',
    'Use Time': 'Nutzungszeit',
    'Used Time': 'Verwendete Zeit',
  },
  es: {
    'Healing': 'Curación',
    'Duration': 'Duración',
    'Use Time': 'Tiempo de uso',
    'Used Time': 'Tiempo usado',
  },
  pt: {
    'Healing': 'Cura',
    'Duration': 'Duração',
    'Use Time': 'Tempo de uso',
    'Used Time': 'Tempo usado',
  },
  pl: {
    'Healing': 'Leczenie',
    'Duration': 'Czas trwania',
    'Use Time': 'Czas użycia',
    'Used Time': 'Czas użyty',
  },
  no: {
    'Healing': 'Helbredelse',
    'Duration': 'Varighet',
    'Use Time': 'Brukstid',
    'Used Time': 'Brukt tid',
  },
  da: {
    'Healing': 'Helbredelse',
    'Duration': 'Varighed',
    'Use Time': 'Brugstid',
    'Used Time': 'Brugt tid',
  },
  it: {
    'Healing': 'Guarigione',
    'Duration': 'Durata',
    'Use Time': 'Tempo d\'uso',
    'Used Time': 'Tempo usato',
  },
  ru: {
    'Healing': 'Лечение',
    'Duration': 'Длительность',
    'Use Time': 'Время использования',
    'Used Time': 'Использованное время',
  },
  ja: {
    'Healing': '回復',
    'Duration': '持続時間',
    'Use Time': '使用時間',
    'Used Time': '使用済み時間',
  },
  'zh-TW': {
    'Healing': '治療',
    'Duration': '持續時間',
    'Use Time': '使用時間',
    'Used Time': '已使用時間',
  },
  uk: {
    'Healing': 'Лікування',
    'Duration': 'Тривалість',
    'Use Time': 'Час використання',
    'Used Time': 'Використаний час',
  },
  'zh-CN': {
    'Healing': '治疗',
    'Duration': '持续时间',
    'Use Time': '使用时间',
    'Used Time': '已使用时间',
  },
  kr: {
    'Healing': '치유',
    'Duration': '지속 시간',
    'Use Time': '사용 시간',
    'Used Time': '사용한 시간',
  },
  tr: {
    'Healing': 'İyileştirme',
    'Duration': 'Süre',
    'Use Time': 'Kullanım Süresi',
    'Used Time': 'Kullanılan Süre',
  },
  hr: {
    'Healing': 'Liječenje',
    'Duration': 'Trajanje',
    'Use Time': 'Vrijeme Korištenja',
    'Used Time': 'Vrijeme Korišćenja',
  },
  sr: {
    'Healing': 'Lečenje',
    'Duration': 'Trajanje',
    'Use Time': 'Vreme Korišćenja',
    'Used Time': 'Korišćeno Vreme',
  },
};

// For each language, add missing labels before the closing brace
const languages = Object.keys(newLabels);

languages.forEach(lang => {
  const regex = new RegExp(`(  ${lang}: \\{[^}]*?)(  \\},?)`, 's');

  content = content.replace(regex, (match, before, after) => {
    // Check if any new labels are already there
    let section = before;

    Object.keys(newLabels[lang]).forEach(key => {
      // Check if this key is NOT already in the section
      const keyPattern = new RegExp(`\\s+'${key.replace(/'/g, "\\'")}':`, 's');
      if (!keyPattern.test(section)) {
        const translation = newLabels[lang][key];
        // Escape single quotes in the translation
        const escapedTranslation = translation.replace(/'/g, "\\'");
        section += `\n    '${key}': '${escapedTranslation}',`;
      }
    });

    return section + after;
  });
});

fs.writeFileSync(translationsPath, content);
console.log('Added missing stat labels to all languages');
