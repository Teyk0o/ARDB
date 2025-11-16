import type { ItemTag, Quest, WorkshopUpgrades, DependencyNode } from '../types/tags';

/**
 * Tag Generator - Recursive utility detection algorithm
 *
 * Determines if items are useful for quests/workshops by traversing
 * the entire crafting dependency chain recursively.
 */

export class TagGenerator {
  private quests: Quest[];
  private workshopUpgrades: WorkshopUpgrades;
  private items: Map<string, any>;
  private utilityCache: Map<string, boolean>;
  private recyclableCache: Map<string, boolean>;

  constructor(quests: Quest[], workshopUpgrades: WorkshopUpgrades, items: any[]) {
    this.quests = quests;
    this.workshopUpgrades = workshopUpgrades;
    this.items = new Map(items.map(item => [item.id, item]));
    this.utilityCache = new Map();
    this.recyclableCache = new Map();
  }

  /**
   * Generate tags for all items
   */
  generateTags(): Record<string, ItemTag> {
    const tags: Record<string, ItemTag> = {};

    // Types to exclude (weapons, equipment, cosmetics, consumables, etc.)
    const excludedTypes = [
      // Weapons
      'Assault Rifle',
      'Battle Rifle',
      'Hand Cannon',
      'LMG',
      'Pistol',
      'Shotgun',
      'Sniper Rifle',
      'Weapon',
      'Ammunition',
      // Equipment
      'Shield',
      'Augment',
      'Backpack Attachment',
      'Backpack Charm',
      // Consumables (already crafted, ready to use)
      'Quick Use',
      'Consumable',
      'Medical',
      // Utilities
      'Explosives', // Grenades, etc. - already crafted
      // Cosmetics & Misc
      'Cosmetic',
      'Outfit',
      'Emote',
      'Blueprint',
      'Modification',
      'Trinket',
      'Special',
      'Key',
      'Misc'
    ];

    this.items.forEach((item, itemId) => {
      // Skip excluded types (weapons, equipment, cosmetics)
      const itemType = item.item_type;
      if (excludedTypes.includes(itemType)) {
        return;
      }

      // Determine tag
      const isUseful = this.isItemUseful(itemId);
      const isRecyclable = this.isItemRecyclable(itemId);

      if (isUseful) {
        tags[itemId] = 'keep';
      } else if (isRecyclable) {
        tags[itemId] = 'recycle';
      } else {
        tags[itemId] = 'sell';
      }
    });

    return tags;
  }

  /**
   * Check if item is useful (directly or indirectly for quests/workshops)
   * Uses recursive dependency traversal with memoization
   */
  private isItemUseful(itemId: string, visited: Set<string> = new Set()): boolean {
    // Check cache
    if (this.utilityCache.has(itemId)) {
      return this.utilityCache.get(itemId)!;
    }

    // Prevent infinite loops
    if (visited.has(itemId)) {
      return false;
    }
    visited.add(itemId);

    let isUseful = false;

    // 1. Check direct quest requirements
    if (this.isRequiredForQuest(itemId)) {
      isUseful = true;
    }

    // 2. Check direct workshop upgrade requirements
    if (!isUseful && this.isRequiredForWorkshop(itemId)) {
      isUseful = true;
    }

    // 3. Recursive check: is this item used to craft something useful?
    if (!isUseful) {
      const item = this.items.get(itemId);
      if (item) {
        // Check if this item is used as a component in other items
        const usedIn = item.used_in || [];

        for (const component of usedIn) {
          const targetItemId = component.itemId || component.item_id || component.id;
          if (targetItemId && this.isItemUseful(targetItemId, new Set(visited))) {
            isUseful = true;
            break;
          }
        }

        // Also check crafting_components (reverse lookup)
        this.items.forEach((otherItem, otherItemId) => {
          if (isUseful) return;

          const craftingComponents = otherItem.crafting_components || otherItem.recipe || [];
          const usesThisItem = craftingComponents.some((comp: any) => {
            const compId = comp.itemId || comp.item_id || comp.id;
            return compId === itemId;
          });

          if (usesThisItem && this.isItemUseful(otherItemId, new Set(visited))) {
            isUseful = true;
          }
        });
      }
    }

    // Cache result
    this.utilityCache.set(itemId, isUseful);
    return isUseful;
  }

  /**
   * Check if item is directly required for any quest
   */
  private isRequiredForQuest(itemId: string): boolean {
    return this.quests.some(quest => {
      const requiredItems = quest.requiredItemIds || [];
      return requiredItems.some(req => req.itemId === itemId);
    });
  }

  /**
   * Check if item is directly required for any workshop upgrade
   */
  private isRequiredForWorkshop(itemId: string): boolean {
    for (const station of Object.values(this.workshopUpgrades)) {
      for (const levelRequirements of Object.values(station)) {
        if (levelRequirements.some(req => req.itemId === itemId)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Check if item is worth recycling
   * An item is recyclable if it gives useful components when recycled
   */
  private isItemRecyclable(itemId: string): boolean {
    // Check cache
    if (this.recyclableCache.has(itemId)) {
      return this.recyclableCache.get(itemId)!;
    }

    const item = this.items.get(itemId);
    if (!item) {
      this.recyclableCache.set(itemId, false);
      return false;
    }

    let isRecyclable = false;

    // Check recycle_components array (transformed format)
    const recycleComponents = item.recycle_components || [];
    if (recycleComponents.some((comp: any) => {
      const compId = comp.itemId || comp.item_id || comp.id;
      return compId && this.isItemUseful(compId);
    })) {
      isRecyclable = true;
    }

    // Check recyclesInto object (raw format)
    if (!isRecyclable && item.recyclesInto) {
      const recycleItems = Object.keys(item.recyclesInto);
      if (recycleItems.some(compId => this.isItemUseful(compId))) {
        isRecyclable = true;
      }
    }

    // Check salvagesInto object (raw format)
    if (!isRecyclable && item.salvagesInto) {
      const salvageItems = Object.keys(item.salvagesInto);
      if (salvageItems.some(compId => this.isItemUseful(compId))) {
        isRecyclable = true;
      }
    }

    this.recyclableCache.set(itemId, isRecyclable);
    return isRecyclable;
  }

  /**
   * Get dependency tree for debugging
   */
  getDependencyTree(itemId: string, maxDepth: number = 5): DependencyNode[] {
    const tree: DependencyNode[] = [];
    this.buildDependencyTree(itemId, 0, maxDepth, tree, new Set());
    return tree;
  }

  private buildDependencyTree(
    itemId: string,
    depth: number,
    maxDepth: number,
    tree: DependencyNode[],
    visited: Set<string>
  ): void {
    if (depth >= maxDepth || visited.has(itemId)) {
      return;
    }
    visited.add(itemId);

    // Check quest dependency
    const quest = this.quests.find(q =>
      q.requiredItemIds?.some(req => req.itemId === itemId)
    );
    if (quest) {
      tree.push({
        itemId,
        reason: 'quest',
        depth,
        source: quest.id
      });
    }

    // Check workshop dependency
    for (const [stationId, levels] of Object.entries(this.workshopUpgrades)) {
      for (const requirements of Object.values(levels)) {
        if (requirements.some(req => req.itemId === itemId)) {
          tree.push({
            itemId,
            reason: 'workshop',
            depth,
            source: stationId
          });
        }
      }
    }

    // Check crafting dependency
    const item = this.items.get(itemId);
    if (item) {
      const usedIn = item.used_in || [];
      for (const component of usedIn) {
        const targetItemId = component.itemId || component.item_id || component.id;
        if (targetItemId) {
          tree.push({
            itemId: targetItemId,
            reason: 'crafting',
            depth: depth + 1,
            source: itemId
          });
          this.buildDependencyTree(targetItemId, depth + 1, maxDepth, tree, visited);
        }
      }
    }
  }
}
