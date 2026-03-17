/**
 * Item loader with database override support
 * Merges JSON data with community-edited data from database
 */

import itemsData from '@/data/items.json';
import { transformItem, transformItems, type ExternalItem } from './itemTransformer';
import { getItemOverride, getAllItemOverrides } from './db/db';
import type { Item } from '@/types/item';
import type { Language } from './translations';

/**
 * Deep merge two objects
 */
export function deepMerge<T extends Record<string, unknown>>(
  base: T,
  override: Partial<T>
): T {
  const result = { ...base };

  for (const key in override) {
    const overrideValue = override[key];
    const baseValue = result[key];

    if (overrideValue === undefined) {
      continue;
    }

    // For objects, merge recursively (except for null)
    if (
      typeof overrideValue === 'object' &&
      overrideValue !== null &&
      !Array.isArray(overrideValue) &&
      typeof baseValue === 'object' &&
      baseValue !== null &&
      !Array.isArray(baseValue)
    ) {
      result[key] = deepMerge(
        baseValue as Record<string, unknown>,
        overrideValue as Record<string, unknown>
      ) as T[Extract<keyof T, string>];
    } else {
      // For primitives and arrays, override completely
      result[key] = overrideValue as T[Extract<keyof T, string>];
    }
  }

  return result;
}

/**
 * Get a single item by ID with database overrides
 */
export async function getItemWithOverride(
  itemId: string,
  language: Language = 'en'
): Promise<Item | null> {
  // Find base item in JSON
  const baseItemData = (itemsData as unknown as ExternalItem[]).find(
    (item) => item.id === itemId
  );

  if (!baseItemData) {
    return null;
  }

  // Transform base item
  let item = transformItem(baseItemData, language);

  // Check for database override
  try {
    const override = await getItemOverride(itemId);

    if (override) {
      // Merge override data with base item
      item = deepMerge(item as Record<string, unknown>, override.override_data as Partial<Item>) as Item;

      // Add metadata about override
      item.communityEdited = true;
      item.lastEditId = override.last_edit_id || undefined;
    }
  } catch (error) {
    console.error(`Failed to load override for item ${itemId}:`, error);
    // Return base item if override fails
  }

  return item;
}

/**
 * Get all items with database overrides
 */
export async function getAllItemsWithOverrides(
  language: Language = 'en'
): Promise<Item[]> {
  // Transform all base items
  const baseItems = transformItems(itemsData as unknown as ExternalItem[], language);

  try {
    // Get all overrides from database
    const overrides = await getAllItemOverrides();

    // Create a map of overrides by item_id
    const overrideMap = new Map(
      overrides.map((override) => [override.item_id, override])
    );

    // Merge overrides with base items
    const items = baseItems.map((baseItem) => {
      const override = overrideMap.get(baseItem.id);

      if (override) {
        const mergedItem = deepMerge(
          baseItem as Record<string, unknown>,
          override.override_data as Partial<Item>
        ) as Item;

        // Add metadata
        mergedItem.communityEdited = true;
        mergedItem.lastEditId = override.last_edit_id || undefined;

        return mergedItem;
      }

      return baseItem;
    });

    return items;
  } catch (error) {
    console.error('Failed to load overrides:', error);
    // Return base items if override loading fails
    return baseItems;
  }
}

/**
 * Check if an item has community edits
 */
export async function hasItemOverride(itemId: string): Promise<boolean> {
  try {
    const override = await getItemOverride(itemId);
    return override !== null;
  } catch (error) {
    console.error(`Failed to check override for item ${itemId}:`, error);
    return false;
  }
}

/**
 * Get modified fields for an item
 */
export async function getModifiedFields(itemId: string): Promise<string[]> {
  try {
    const override = await getItemOverride(itemId);
    return override?.modified_fields || [];
  } catch (error) {
    console.error(`Failed to get modified fields for item ${itemId}:`, error);
    return [];
  }
}
