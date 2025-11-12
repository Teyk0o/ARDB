const data = require('../data/items.json');

const ids = new Map();
const duplicates = [];

data.forEach((item, index) => {
  if (ids.has(item.id)) {
    duplicates.push({
      id: item.id,
      firstIndex: ids.get(item.id),
      secondIndex: index
    });
  } else {
    ids.set(item.id, index);
  }
});

console.log('Total items:', data.length);
console.log('Unique IDs:', ids.size);
console.log('\nDuplicates found:', duplicates.length);

duplicates.forEach(dup => {
  console.log(`\nID: ${dup.id}`);
  console.log(`  First at index: ${dup.firstIndex}`);
  console.log(`  Second at index: ${dup.secondIndex}`);
  console.log(`  First item:`, data[dup.firstIndex].name);
  console.log(`  Second item:`, data[dup.secondIndex].name);
});
