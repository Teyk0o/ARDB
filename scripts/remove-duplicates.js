const fs = require('fs');
const path = require('path');

const itemsPath = path.join(__dirname, '../data/items.json');
const data = JSON.parse(fs.readFileSync(itemsPath, 'utf-8'));

const ids = new Set();
const uniqueItems = [];

data.forEach((item) => {
  if (!ids.has(item.id)) {
    uniqueItems.push(item);
    ids.add(item.id);
  }
});

console.log(`Original items: ${data.length}`);
console.log(`Duplicates removed: ${data.length - uniqueItems.length}`);
console.log(`Unique items: ${uniqueItems.length}`);

fs.writeFileSync(itemsPath, JSON.stringify(uniqueItems, null, 2));
console.log('File updated successfully');
