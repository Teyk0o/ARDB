import { useMemo } from 'react';
import { Item, ItemComponent } from '@/types/item';

export interface CalculatedCraftRelationships {
  recycle_components: ItemComponent[];      // Items obtained by recycling THIS item
  used_in: ItemComponent[];                 // Items that can be crafted with THIS item
  recipe: ItemComponent[];                  // Ingredients needed to craft THIS item
  recycle_from: ItemComponent[];            // Items that can be recycled to get THIS item
}

/**
 * Hook that calculates bidirectional craft relationships for an item
 * by searching through all available items
 */
export function useCraftRelationships(
  currentItem: Item,
  allItems: Item[]
): CalculatedCraftRelationships {
  return useMemo(() => {
    const relationships: CalculatedCraftRelationships = {
      recycle_components: [],
      used_in: [],
      recipe: [],
      recycle_from: [],
    };

    if (!currentItem || !allItems.length) {
      return relationships;
    }

    const currentItemId = currentItem.id;

    // Search through all items to find relationships
    for (const item of allItems) {
      if (!item.id) continue;

      // 1. Find items where THIS item is used in their recipe
      // (These items can be crafted WITH this item)
      if (item.crafting_components || item.recipe) {
        const components = item.crafting_components || item.recipe || [];
        const isUsedIn = components.some(comp => {
          const compItem = comp.item || comp.component;
          return compItem?.id === currentItemId;
        });

        if (isUsedIn) {
          // Add this item to our used_in if not already there
          if (!relationships.used_in.some(rel => (rel.item || rel.component)?.id === item.id)) {
            relationships.used_in.push({
              item: {
                id: item.id,
                name: item.name,
                icon: item.icon,
                item_type: item.item_type,
                rarity: item.rarity,
                description: item.description,
              },
              component: {
                id: currentItemId,
                name: currentItem.name,
                icon: currentItem.icon,
                item_type: currentItem.item_type,
                rarity: currentItem.rarity,
                description: currentItem.description,
              },
              quantity: 1,
            });
          }
        }
      }

      // 2. Find items whose components THIS item is
      // (Items from which THIS item can be obtained by recycling)
      if (item.recycle_from) {
        const isRecycledFrom = item.recycle_from.some(comp => {
          const compItem = comp.item || comp.component;
          return compItem?.id === currentItemId;
        });

        if (isRecycledFrom) {
          // Add to recycle_components (THIS item is obtained from THEM)
          if (!relationships.recycle_components.some(rel => (rel.item || rel.component)?.id === item.id)) {
            relationships.recycle_components.push({
              item: {
                id: item.id,
                name: item.name,
                icon: item.icon,
                item_type: item.item_type,
                rarity: item.rarity,
                description: item.description,
              },
              component: {
                id: currentItemId,
                name: currentItem.name,
                icon: currentItem.icon,
                item_type: currentItem.item_type,
                rarity: currentItem.rarity,
                description: currentItem.description,
              },
              quantity: 1,
            });
          }
        }
      }

      // 3. Find items where THIS item can be recycled to get THEM
      // (Searching in recycle_components of other items)
      // This would be if THIS item appears in some item's recycle_components
      // But since recycle_components is empty in the data, we look at the inverse:
      // If THIS item appears in recycle_from of another item, then that item is in our recycle_components

      // 4. Find items where THIS item is in their recipe
      // (Items that THIS item is needed to craft)
      // This is already handled in step 1 (used_in)
    }

    // Keep existing relationships from the item data
    // These override/complement the calculated ones
    if (currentItem.recycle_components?.length) {
      relationships.recycle_components = [
        ...relationships.recycle_components,
        ...currentItem.recycle_components,
      ];
    }

    if (currentItem.used_in?.length) {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(relationships.used_in.map(rel => (rel.item || rel.component)?.id));
      const newOnes = currentItem.used_in.filter(
        rel => !existingIds.has((rel.item || rel.component)?.id)
      );
      relationships.used_in = [...relationships.used_in, ...newOnes];
    }

    if (currentItem.recipe?.length || currentItem.crafting_components?.length) {
      relationships.recipe = currentItem.recipe || currentItem.crafting_components || [];
    }

    if (currentItem.recycle_from?.length) {
      // Merge with existing, avoiding duplicates
      const existingIds = new Set(relationships.recycle_from.map(rel => (rel.item || rel.component)?.id));
      const newOnes = currentItem.recycle_from.filter(
        rel => !existingIds.has((rel.item || rel.component)?.id)
      );
      relationships.recycle_from = [...relationships.recycle_from, ...newOnes];
    }

    return relationships;
  }, [currentItem, allItems]);
}
