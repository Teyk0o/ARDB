import type { Quest, WorkshopUpgrades, Project } from '../types/tags';

export interface TagReason {
  type: 'quest' | 'workshop' | 'crafting' | 'recycle' | 'project';
  itemId: string;
  itemName?: string;
  questId?: string;
  questName?: string;
  workshopStation?: string;
  workshopLevel?: string;
  craftedItemId?: string;
  craftedItemName?: string;
  recycleComponentId?: string;
  recycleComponentName?: string;
  projectId?: string;
  projectName?: string;
  projectPhase?: number;
  // Full dependency chain
  chain?: DependencyChainStep[];
}

export interface DependencyChainStep {
  action: 'recycle' | 'craft' | 'use_in_quest' | 'use_in_workshop';
  itemId: string;
  itemName: string;
  targetId?: string;
  targetName?: string;
  questId?: string;
  questName?: string;
  workshopStation?: string;
  workshopLevel?: string;
}

export interface ItemTagReasons {
  tag: 'keep' | 'sell' | 'recycle';
  reasons: TagReason[];
}

/**
 * Analyzes why an item has a specific tag
 */
export class TagReasonAnalyzer {
  private quests: Quest[];
  private workshopUpgrades: WorkshopUpgrades;
  private projects: Project[];
  private items: Map<string, any>;
  private itemTags: Record<string, 'keep' | 'sell' | 'recycle'>;

  constructor(
    quests: Quest[],
    workshopUpgrades: WorkshopUpgrades,
    projects: Project[],
    items: any[],
    itemTags: Record<string, 'keep' | 'sell' | 'recycle'>
  ) {
    this.quests = quests;
    this.workshopUpgrades = workshopUpgrades;
    this.projects = projects;
    this.items = new Map(items.map(item => [item.id, item]));
    this.itemTags = itemTags;
  }

  /**
   * Get all reasons why an item has its tag
   */
  getReasons(itemId: string): ItemTagReasons | null {
    const tag = this.itemTags[itemId];
    if (!tag) return null;

    const reasons: TagReason[] = [];

    if (tag === 'keep') {
      // Check direct quest requirements
      this.quests.forEach(quest => {
        const requiredItems = quest.requiredItemIds || [];
        if (requiredItems.some(req => req.itemId === itemId)) {
          reasons.push({
            type: 'quest',
            itemId,
            questId: quest.id,
            questName: quest.name.en
          });
        }
      });

      // Check workshop upgrades
      Object.entries(this.workshopUpgrades).forEach(([stationId, levels]) => {
        Object.entries(levels).forEach(([levelNum, requirements]) => {
          if (requirements.some(req => req.itemId === itemId)) {
            reasons.push({
              type: 'workshop',
              itemId,
              workshopStation: stationId,
              workshopLevel: levelNum
            });
          }
        });
      });

      // Check project requirements
      this.projects.forEach(project => {
        project.phases.forEach(phase => {
          const requiredItems = phase.requirementItemIds || [];
          if (requiredItems.some(req => req.itemId === itemId)) {
            reasons.push({
              type: 'project',
              itemId,
              projectId: project.id,
              projectName: project.name.en,
              projectPhase: phase.phase
            });
          }
        });
      });

      // Check crafting usage (items that use this as component)
      const item = this.items.get(itemId);
      if (item) {
        const usedIn = item.used_in || [];
        usedIn.forEach((comp: any) => {
          const targetItemId = comp.itemId || comp.item_id || comp.id;
          const targetItem = this.items.get(targetItemId);

          // Only show if the crafted item is also useful
          if (targetItemId && this.itemTags[targetItemId] === 'keep') {
            reasons.push({
              type: 'crafting',
              itemId,
              craftedItemId: targetItemId,
              craftedItemName: targetItem?.name?.en || targetItemId
            });
          }
        });

        // Also check reverse lookup
        this.items.forEach((otherItem, otherItemId) => {
          if (this.itemTags[otherItemId] !== 'keep') return;

          const craftingComponents = otherItem.crafting_components || otherItem.recipe || [];
          const usesThisItem = craftingComponents.some((comp: any) => {
            const compId = comp.itemId || comp.item_id || comp.id;
            return compId === itemId;
          });

          if (usesThisItem && !reasons.some(r => r.craftedItemId === otherItemId)) {
            reasons.push({
              type: 'crafting',
              itemId,
              craftedItemId: otherItemId,
              craftedItemName: otherItem.name?.en || otherItemId
            });
          }
        });
      }
    } else if (tag === 'recycle') {
      // Check recycle components with full chain
      const item = this.items.get(itemId);
      if (item) {
        // Check recyclesInto object
        if (item.recyclesInto) {
          Object.keys(item.recyclesInto).forEach(compId => {
            const component = this.items.get(compId);
            if (this.itemTags[compId] === 'keep') {
              const chain = this.buildRecycleChain(itemId, compId);
              reasons.push({
                type: 'recycle',
                itemId,
                recycleComponentId: compId,
                recycleComponentName: component?.name?.en || compId,
                chain
              });
            }
          });
        }

        // Check salvagesInto object
        if (item.salvagesInto) {
          Object.keys(item.salvagesInto).forEach(compId => {
            const component = this.items.get(compId);
            if (this.itemTags[compId] === 'keep' && !reasons.some(r => r.recycleComponentId === compId)) {
              const chain = this.buildRecycleChain(itemId, compId);
              reasons.push({
                type: 'recycle',
                itemId,
                recycleComponentId: compId,
                recycleComponentName: component?.name?.en || compId,
                chain
              });
            }
          });
        }
      }
    }

    return {
      tag,
      reasons
    };
  }

  /**
   * Build chain for recycle reasons: itemA → recycles to → itemB → crafts → itemC → used in quest/workshop
   */
  private buildRecycleChain(recycledItemId: string, componentId: string): DependencyChainStep[] {
    const chain: DependencyChainStep[] = [];
    const recycledItem = this.items.get(recycledItemId);
    const component = this.items.get(componentId);

    // Step 1: Recycle action
    chain.push({
      action: 'recycle',
      itemId: recycledItemId,
      itemName: recycledItem?.name?.en || recycledItemId,
      targetId: componentId,
      targetName: component?.name?.en || componentId
    });

    // Step 2: Trace where the component is used
    this.traceComponentUsage(componentId, chain);

    return chain;
  }

  /**
   * Trace where a component is ultimately used (quest, workshop, or further crafting)
   */
  private traceComponentUsage(componentId: string, chain: DependencyChainStep[], visited: Set<string> = new Set()): void {
    if (visited.has(componentId)) return;
    visited.add(componentId);

    const component = this.items.get(componentId);
    if (!component) return;

    // Check if used directly in quest
    const quest = this.quests.find(q =>
      q.requiredItemIds?.some(req => req.itemId === componentId)
    );
    if (quest) {
      chain.push({
        action: 'use_in_quest',
        itemId: componentId,
        itemName: component.name?.en || componentId,
        questId: quest.id,
        questName: quest.name.en
      });
      return; // Stop here, we found the end
    }

    // Check if used directly in workshop
    for (const [stationId, levels] of Object.entries(this.workshopUpgrades)) {
      for (const [levelNum, requirements] of Object.entries(levels)) {
        if (requirements.some(req => req.itemId === componentId)) {
          chain.push({
            action: 'use_in_workshop',
            itemId: componentId,
            itemName: component.name?.en || componentId,
            workshopStation: stationId,
            workshopLevel: levelNum
          });
          return; // Stop here, we found the end
        }
      }
    }

    // Check if used to craft another item
    const usedIn = component.used_in || [];
    for (const comp of usedIn) {
      const targetItemId = comp.itemId || comp.item_id || comp.id;
      if (targetItemId && this.itemTags[targetItemId] === 'keep') {
        const targetItem = this.items.get(targetItemId);
        chain.push({
          action: 'craft',
          itemId: componentId,
          itemName: component.name?.en || componentId,
          targetId: targetItemId,
          targetName: targetItem?.name?.en || targetItemId
        });
        // Recursively trace where THIS crafted item is used
        this.traceComponentUsage(targetItemId, chain, visited);
        return; // Stop after finding first valid path
      }
    }

    // Also check reverse lookup
    for (const [otherItemId, otherItem] of this.items.entries()) {
      if (this.itemTags[otherItemId] !== 'keep') continue;

      const craftingComponents = otherItem.crafting_components || otherItem.recipe || [];
      const usesThisItem = craftingComponents.some((comp: any) => {
        const compId = comp.itemId || comp.item_id || comp.id;
        return compId === componentId;
      });

      if (usesThisItem) {
        chain.push({
          action: 'craft',
          itemId: componentId,
          itemName: component.name?.en || componentId,
          targetId: otherItemId,
          targetName: otherItem.name?.en || otherItemId
        });
        // Recursively trace where THIS crafted item is used
        this.traceComponentUsage(otherItemId, chain, visited);
        return; // Stop after finding first valid path
      }
    }
  }

  /**
   * Generate reasons data for all items and save to JSON
   */
  generateAllReasons(): Record<string, ItemTagReasons> {
    const allReasons: Record<string, ItemTagReasons> = {};

    Object.keys(this.itemTags).forEach(itemId => {
      const reasons = this.getReasons(itemId);
      if (reasons && reasons.reasons.length > 0) {
        allReasons[itemId] = reasons;
      }
    });

    return allReasons;
  }
}
