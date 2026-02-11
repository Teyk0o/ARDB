/**
 * Client-side Tag Generator
 * Wrapper to use TagGenerator with user completions for dynamic filtering
 */

import { TagGenerator, type CompletionsFilter } from './tagGenerator';
import { TagReasonAnalyzer, type ItemTagReasons } from './tagReasoning';
import type { Quest, WorkshopUpgrades, Project, ItemTag } from '../types/tags';

// Re-export CompletionsFilter for consumers
export type { CompletionsFilter };

/**
 * Generate tags with user completions filter
 */
export function generateClientTags(
  quests: Quest[],
  workshopUpgrades: WorkshopUpgrades,
  projects: Project[],
  items: any[],
  completions?: CompletionsFilter
): Record<string, ItemTag> {
  const generator = new TagGenerator(
    quests,
    workshopUpgrades,
    projects,
    items,
    completions
  );

  return generator.generateTags();
}

/**
 * Get tag reasons with completion status
 */
export function getClientTagReasons(
  itemId: string,
  quests: Quest[],
  workshopUpgrades: WorkshopUpgrades,
  projects: Project[],
  items: any[],
  itemTags: Record<string, ItemTag>,
  completions?: CompletionsFilter
): ItemTagReasons | null {
  const analyzer = new TagReasonAnalyzer(
    quests,
    workshopUpgrades,
    projects,
    items,
    itemTags,
    completions
  );

  return analyzer.getReasons(itemId);
}

/**
 * Generate all tag reasons with completion status
 */
export function generateAllClientReasons(
  quests: Quest[],
  workshopUpgrades: WorkshopUpgrades,
  projects: Project[],
  items: any[],
  itemTags: Record<string, ItemTag>,
  completions?: CompletionsFilter
): Record<string, ItemTagReasons> {
  const analyzer = new TagReasonAnalyzer(
    quests,
    workshopUpgrades,
    projects,
    items,
    itemTags,
    completions
  );

  return analyzer.generateAllReasons();
}

/**
 * Check if any reasons are not completed
 */
export function hasActiveReasons(reasons: ItemTagReasons): boolean {
  return reasons.reasons.some(reason => !reason.completed);
}

/**
 * Filter out completed reasons
 */
export function getActiveReasons(reasons: ItemTagReasons): ItemTagReasons {
  return {
    ...reasons,
    reasons: reasons.reasons.filter(reason => !reason.completed)
  };
}

/**
 * Get completion statistics from reasons
 */
export function getReasonCompletionStats(reasons: ItemTagReasons): {
  total: number;
  completed: number;
  active: number;
  percentage: number;
} {
  const total = reasons.reasons.length;
  const completed = reasons.reasons.filter(r => r.completed).length;
  const active = total - completed;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, active, percentage };
}
