const fs = require('fs');
const path = require('path');

// Allow custom path as command line argument, default to data/items.json
const customPath = process.argv[2];
const itemsPath = customPath
  ? path.resolve(customPath)
  : path.join(__dirname, '../data/items.json');

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
