const fs = require('fs');
const path = require('path');

// Read the main items file
const itemsPath = path.join(__dirname, '../data/items.json');
const data = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

// Group items by category
const categories = {};
const categoryMapping = {
  'Weapon': 'weapons',
  'Basic Material': 'materials',
  'Refined Material': 'materials',
  'Advanced Material': 'materials',
  'Topside Material': 'materials',
  'Medical': 'medical',
  'Quick Use': 'quick_use',
  'Quick use': 'quick_use',
  'Consumable': 'consumables',
  'Shield': 'shields',
  'Augment': 'augments',
  'Ammunition': 'ammunition',
  'Explosives': 'explosives',
  'Gadget': 'gadgets',
  'Throwable': 'throwables',
  'Key': 'keys',
  'Quest Item': 'quest_items',
  'Misc': 'misc',
  'Blueprint': 'blueprints',
  'Modification': 'modifications',
  'Mods': 'mods',
  'Cosmetic': 'cosmetics',
  'Nature': 'nature',
  'Trinket': 'trinkets',
  'Recyclable': 'recyclables',
  'Refinement': 'refinement',
  'Material': 'materials'
};

// Organize items
data.forEach(item => {
  const type = item.item_type || 'unknown';
  const categoryKey = categoryMapping[type] || 'other';

  if (!categories[categoryKey]) {
    categories[categoryKey] = [];
  }
  categories[categoryKey].push(item);
});

// Create data/items directory if it doesn't exist
const itemsDir = path.join(__dirname, '../data/items');
if (!fs.existsSync(itemsDir)) {
  fs.mkdirSync(itemsDir, { recursive: true });
}

// Write category files
Object.entries(categories).forEach(([category, items]) => {
  const filePath = path.join(itemsDir, `${category}.json`);
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
  console.log(`Created ${category}.json with ${items.length} items`);
});

console.log('\nItems successfully split into categories!');
