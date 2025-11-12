const fs = require('fs');
const path = require('path');

// Read all category files
const itemsDir = path.join(__dirname, '../data/items');
const categories = fs.readdirSync(itemsDir);

// Create translation structure
const translationStructure = {
  en: {},
  fr: {}
};

// Process each category
categories.forEach(file => {
  if (!file.endsWith('.json')) return;

  const categoryPath = path.join(itemsDir, file);
  const items = JSON.parse(fs.readFileSync(categoryPath, 'utf-8'));

  items.forEach(item => {
    // English - just use original data
    translationStructure.en[item.id] = {
      name: item.name,
      description: item.description || ''
    };

    // French - placeholder (to be filled manually or with API)
    translationStructure.fr[item.id] = {
      name: item.name, // Will be replaced with translation
      description: item.description || ''
    };
  });
});

// Create translations directory
const translationsDir = path.join(__dirname, '../data/translations');
if (!fs.existsSync(translationsDir)) {
  fs.mkdirSync(translationsDir, { recursive: true });
}

// Create en and fr subdirectories
['en', 'fr'].forEach(lang => {
  const langDir = path.join(translationsDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  // Write the items translation file
  const filePath = path.join(langDir, 'items.json');
  fs.writeFileSync(filePath, JSON.stringify(translationStructure[lang], null, 2));
  console.log(`Created ${lang}/items.json with ${Object.keys(translationStructure[lang]).length} items`);
});

console.log('\nTranslation structure created!');
console.log('Next step: Translate the French items in data/translations/fr/items.json');
