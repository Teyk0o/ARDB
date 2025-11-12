const fs = require('fs');
const path = require('path');

/**
 * Merge items from RaidTheory with data from Metaforge
 * RaidTheory provides: translations, recipes, recycling, stats
 * Metaforge provides: used_in, recycle_from relationships
 */

const raidTheoryPath = path.join(__dirname, '../data/items.json');
const itemsData = JSON.parse(fs.readFileSync(raidTheoryPath, 'utf-8'));

// Create a map for easy lookup and for building relationships
const itemsMap = new Map();
itemsData.forEach(item => {
  itemsMap.set(item.id, item);
});

// Build used_in relationships from recipe data
const usedInMap = new Map();
itemsData.forEach(item => {
  if (item.recipe && typeof item.recipe === 'object') {
    // For each component in the recipe
    Object.keys(item.recipe).forEach(componentId => {
      if (!usedInMap.has(componentId)) {
        usedInMap.set(componentId, []);
      }
      usedInMap.get(componentId).push({
        item: item,
        component: { id: componentId }
      });
    });
  }
});

// Build recycle_from relationships from recyclesInto data
const recycleFromMap = new Map();
itemsData.forEach(item => {
  if (item.recyclesInto && typeof item.recyclesInto === 'object') {
    Object.keys(item.recyclesInto).forEach(resultId => {
      if (!recycleFromMap.has(resultId)) {
        recycleFromMap.set(resultId, []);
      }
      recycleFromMap.get(resultId).push({
        item: item,
        component: { id: item.id }
      });
    });
  }
});

// Merge the relationship data back into items
let itemsWithRelationships = itemsData.map(item => {
  const merged = { ...item };

  // Add used_in (items that can be crafted with this item)
  if (usedInMap.has(item.id)) {
    merged.used_in = usedInMap.get(item.id);
  }

  // Add recycle_from (items that recycle into this item)
  if (recycleFromMap.has(item.id)) {
    merged.recycle_from = recycleFromMap.get(item.id);
  }

  // Rename craftingComponents to match our internal format
  if (merged.recipe) {
    merged.crafting_components = Object.keys(merged.recipe).map(componentId => {
      const component = itemsMap.get(componentId);
      return {
        item: component || { id: componentId },
        component: { id: componentId }
      };
    });
  }

  // Standardize icon field
  if (merged.imageFilename) {
    merged.icon = merged.imageFilename;
  }

  // Standardize workbench
  if (merged.craftBench) {
    merged.workbench = merged.craftBench;
  }

  // Standardize item_type
  if (merged.type) {
    merged.item_type = merged.type;
  }

  // Handle loot areas
  if (merged.foundIn) {
    merged.loot_area = merged.foundIn;
  }

  // Extract stat_block from effects
  if (merged.effects && typeof merged.effects === 'object') {
    merged.stat_block = {};
    Object.keys(merged.effects).forEach(effectKey => {
      const effect = merged.effects[effectKey];
      if (effect.value) {
        merged.stat_block[effectKey] = effect.value;
      }
    });
  }

  return merged;
});

// Remove duplicates
const ids = new Set();
const uniqueItems = [];
itemsWithRelationships.forEach(item => {
  if (!ids.has(item.id)) {
    uniqueItems.push(item);
    ids.add(item.id);
  }
});

console.log(`Total items: ${uniqueItems.length}`);
console.log(`Items with crafting recipes: ${uniqueItems.filter(i => i.crafting_components).length}`);
console.log(`Items with recycling info: ${uniqueItems.filter(i => i.recycle_from).length}`);
console.log(`Items with used_in info: ${uniqueItems.filter(i => i.used_in).length}`);

// Write merged data
fs.writeFileSync(raidTheoryPath, JSON.stringify(uniqueItems, null, 2));
console.log('Merge completed successfully');
