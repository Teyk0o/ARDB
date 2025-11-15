const fs = require('fs');
const path = require('path');

/**
 * Generate changelog by comparing old and new items data
 * Creates a changelog entry with added, modified, and removed items
 */

const dataPath = path.join(__dirname, '../data/items.json');
const changelogPath = path.join(__dirname, '../data/changelog.json');

// Load current (new) items
const newItems = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const newItemsMap = new Map(newItems.map(item => [item.id, item]));

// Load old items changelog to get previous state
let oldItemsMap = new Map();
let changelogEntries = [];

if (fs.existsSync(changelogPath)) {
  changelogEntries = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));

  // Reconstruct old items map from last changelog entry
  if (changelogEntries.length > 0) {
    const lastEntry = changelogEntries[changelogEntries.length - 1];
    oldItemsMap = new Map(lastEntry.previousState || []);
  }
}

// Helper function to get a comparable value (for deep comparison)
function getItemSnapshot(item) {
  return JSON.stringify({
    name: item.name,
    description: item.description,
    type: item.type,
    rarity: item.rarity,
    value: item.value,
    recipe: item.recipe,
    recyclesInto: item.recyclesInto,
    loot_area: item.loot_area,
  });
}

// Detect changes
const changes = {
  added: [],
  modified: [],
  removed: [],
};

// Check for new and modified items
newItems.forEach(newItem => {
  const oldItem = oldItemsMap.get(newItem.id);

  if (!oldItem) {
    changes.added.push({
      id: newItem.id,
      name: newItem.name?.en || newItem.name,
      type: newItem.type,
      rarity: newItem.rarity,
    });
  } else if (getItemSnapshot(newItem) !== getItemSnapshot(oldItem)) {
    changes.modified.push({
      id: newItem.id,
      name: newItem.name?.en || newItem.name,
      type: newItem.type,
      rarity: newItem.rarity,
      changes: detectSpecificChanges(oldItem, newItem),
    });
  }
});

// Check for removed items
oldItemsMap.forEach((oldItem, itemId) => {
  if (!newItemsMap.has(itemId)) {
    changes.removed.push({
      id: itemId,
      name: oldItem.name?.en || oldItem.name,
      type: oldItem.type,
      rarity: oldItem.rarity,
    });
  }
});

// Create changelog entry
const changelogEntry = {
  date: new Date().toISOString(),
  timestamp: Date.now(),
  changes: changes,
  summary: `${changes.added.length} added, ${changes.modified.length} modified, ${changes.removed.length} removed`,
  totalItems: newItems.length,
  previousState: Array.from(newItemsMap.entries()),
};

// Only add entry if there are actual changes
if (changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0) {
  changelogEntries.push(changelogEntry);

  // Keep only last 30 days of changelog
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  changelogEntries = changelogEntries.filter(entry => entry.timestamp > thirtyDaysAgo);

  fs.writeFileSync(changelogPath, JSON.stringify(changelogEntries, null, 2));

  console.log('Changelog generated:');
  console.log(`  Added: ${changes.added.length}`);
  console.log(`  Modified: ${changes.modified.length}`);
  console.log(`  Removed: ${changes.removed.length}`);
} else {
  console.log('No changes detected - changelog not updated');
}

function detectSpecificChanges(oldItem, newItem) {
  const changes = [];

  if (JSON.stringify(oldItem.recipe) !== JSON.stringify(newItem.recipe)) {
    changes.push('recipe');
  }
  if (JSON.stringify(oldItem.recyclesInto) !== JSON.stringify(newItem.recyclesInto)) {
    changes.push('recycling');
  }
  if (oldItem.value !== newItem.value) {
    changes.push('value');
  }
  if (oldItem.type !== newItem.type) {
    changes.push('type');
  }
  if (oldItem.rarity !== newItem.rarity) {
    changes.push('rarity');
  }
  if (JSON.stringify(oldItem.name) !== JSON.stringify(newItem.name)) {
    changes.push('name');
  }
  if (JSON.stringify(oldItem.description) !== JSON.stringify(newItem.description)) {
    changes.push('description');
  }

  return changes;
}
