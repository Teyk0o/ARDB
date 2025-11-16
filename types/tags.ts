/**
 * Item tag types for player guidance
 */
export type ItemTag = 'keep' | 'sell' | 'recycle';

/**
 * Computed tags data structure
 * Maps item IDs to their determined tag
 */
export interface ComputedTags {
  [itemId: string]: ItemTag;
}

/**
 * Quest data structure from RaidTheory
 */
export interface Quest {
  id: string;
  updatedAt: string;
  name: Record<string, string>;
  trader: string;
  description?: Record<string, string>;
  objectives: Array<Record<string, string>>;
  requiredItemIds?: Array<{
    itemId: string;
    quantity: number;
  }>;
  rewardItemIds?: Array<{
    itemId: string;
    quantity: number;
  }>;
  xp: number;
  previousQuestIds?: string[];
  nextQuestIds?: string[];
}

/**
 * Workshop upgrade data structure
 */
export interface WorkshopUpgrades {
  [stationId: string]: {
    [level: string]: Array<{
      itemId: string;
      quantity: number;
    }>;
  };
}

/**
 * Tag generation context
 */
export interface TagGenerationContext {
  quests: Quest[];
  workshopUpgrades: WorkshopUpgrades;
  items: any[]; // Raw items from items.json
}

/**
 * Dependency graph node for recursive analysis
 */
export interface DependencyNode {
  itemId: string;
  reason: 'quest' | 'workshop' | 'crafting';
  depth: number;
  source?: string; // quest ID or workshop station
}
