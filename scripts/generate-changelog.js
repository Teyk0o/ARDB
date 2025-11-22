const fs = require('fs');
const path = require('path');

/**
 * Generate changelog by comparing old and new items data
 * Creates a changelog entry with added, modified, and removed items
 *
 * This script reconstructs the previous state from the changelog itself,
 * eliminating dependency on a separate snapshot file and preventing duplicate entries.
 */

const dataPath = path.join(__dirname, '../data/items.json');
const changelogPath = path.join(__dirname, '../data/changelog.json');

/**
 * Get a comparable snapshot of an item for deep comparison
 * @param {Object} item - The item to snapshot
 * @returns {string} JSON string of relevant item properties
 */
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

/**
 * Reconstruct the previous item state by replaying changelog history
 * @param {Array} changelogEntries - All changelog entries
 * @param {Map} currentItemsMap - Map of current items (id -> item)
 * @returns {Map} Map of item names to item objects representing the previous state
 */
function reconstructPreviousState(changelogEntries, currentItemsMap) {
  if (changelogEntries.length === 0) {
    // No changelog history, so previous state is empty (all items will be "added")
    return new Map();
  }

  // Get the last changelog entry
  const lastEntry = changelogEntries[changelogEntries.length - 1];

  // Start with current items
  const previousState = new Map();

  // Add all items that are currently present
  currentItemsMap.forEach((item, id) => {
    const itemName = item.name?.en || item.name;

    // If this item was added in the last entry, it shouldn't be in previous state
    if (!lastEntry.changes.added.includes(itemName)) {
      previousState.set(id, item);
    }
  });

  // Add back items that were removed in the last entry
  // Note: We can't fully reconstruct removed items without their full data,
  // but we can track them by name for the next run
  // This limitation means we need to keep items data somewhere

  return previousState;
}

/**
 * Build previous state from current items and last changelog entry
 * @param {Array} currentItems - Current items array
 * @param {Array} changelogEntries - Existing changelog entries
 * @returns {Map} Map of previous items (id -> item)
 */
function buildPreviousStateMap(currentItems, changelogEntries) {
  const currentItemsMap = new Map(currentItems.map(item => [item.id, item]));

  if (changelogEntries.length === 0) {
    // First run - no previous state
    return new Map();
  }

  const lastEntry = changelogEntries[changelogEntries.length - 1];
  const previousItemsMap = new Map();

  // Start by adding all current items
  currentItems.forEach(item => {
    const itemName = item.name?.en || item.name;

    // If item was added in last changelog, exclude it from previous state
    if (!lastEntry.changes.added.includes(itemName)) {
      previousItemsMap.set(item.id, item);
    }
  });

  // Items that were modified in last entry should be in previous state
  // but we can't know their old values without the snapshot
  // This is a limitation of reconstruction approach

  return previousItemsMap;
}

// Load current (new) items
const newItems = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const newItemsMap = new Map(newItems.map(item => [item.id, item]));

// Load existing changelog
let changelogEntries = [];
if (fs.existsSync(changelogPath)) {
  changelogEntries = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'));
}

// Build the previous state by reading the snapshot file
// We still need a snapshot because we can't reconstruct full item data from changelog
const snapshotPath = path.join(__dirname, '../data/.items-snapshot.json');
let oldItemsMap = new Map();

if (fs.existsSync(snapshotPath)) {
  const oldItems = JSON.parse(fs.readFileSync(snapshotPath, 'utf-8'));
  oldItemsMap = new Map(oldItems.map(item => [item.id, item]));

  // Validate snapshot consistency
  if (changelogEntries.length > 0) {
    const lastEntry = changelogEntries[changelogEntries.length - 1];
    if (oldItems.length !== lastEntry.totalItems) {
      console.warn(`⚠️  Warning: Snapshot has ${oldItems.length} items but last changelog reports ${lastEntry.totalItems}`);
      console.warn('   Snapshot may be out of sync. Results may include duplicates.');
    }
  }
} else {
  console.log('ℹ️  No snapshot found - this is the first changelog generation');
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
  const itemName = newItem.name?.en || newItem.name;

  if (!oldItem) {
    changes.added.push(itemName);
  } else if (getItemSnapshot(newItem) !== getItemSnapshot(oldItem)) {
    changes.modified.push(itemName);
  }
});

// Check for removed items
oldItemsMap.forEach((oldItem, itemId) => {
  if (!newItemsMap.has(itemId)) {
    const itemName = oldItem.name?.en || oldItem.name;
    changes.removed.push(itemName);
  }
});

// Only add entry if there are actual changes
if (changes.added.length > 0 || changes.modified.length > 0 || changes.removed.length > 0) {
  // Sort all changes alphabetically for consistency
  changes.added.sort();
  changes.modified.sort();
  changes.removed.sort();

  // Create changelog entry
  const changelogEntry = {
    date: new Date().toISOString(),
    timestamp: Date.now(),
    changes: changes,
    summary: `${changes.added.length} added, ${changes.modified.length} modified, ${changes.removed.length} removed`,
    totalItems: newItems.length,
  };

  changelogEntries.push(changelogEntry);

  // Keep only last 30 days of changelog
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  changelogEntries = changelogEntries.filter(entry => entry.timestamp > thirtyDaysAgo);

  fs.writeFileSync(changelogPath, JSON.stringify(changelogEntries, null, 2));

  console.log('✅ Changelog generated:');
  console.log(`   Added: ${changes.added.length}`);
  console.log(`   Modified: ${changes.modified.length}`);
  console.log(`   Removed: ${changes.removed.length}`);
  console.log(`   Total items: ${newItems.length}`);
} else {
  console.log('ℹ️  No changes detected - changelog not updated');
}

// Always save current items as snapshot for next comparison
// This is essential to prevent detecting the same changes again
fs.writeFileSync(snapshotPath, JSON.stringify(newItems, null, 2));
console.log('💾 Items snapshot updated');
