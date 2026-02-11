/**
 * Hook to dynamically recalculate item tags based on user completions
 */

import { useMemo } from 'react';
import { useCompletions } from '@/contexts/CompletionsContext';
import { generateClientTags, type CompletionsFilter } from '@/lib/tagGeneratorClient';
import type { Quest, WorkshopUpgrades } from '@/types/tags';

// Import JSON data directly (client-safe)
import workshopUpgradesData from '@/data/workshop_upgrades.json';
import projectsData from '@/data/projects.json';
import questsData from '@/data/quests-all.json';
import itemsRawData from '@/data/items.json';

export function useFilteredTags() {
  const completionsContext = useCompletions();

  // Memoize filtered tags computation
  const filteredTags = useMemo(() => {
    // If context not available or loading, return null
    if (!completionsContext || completionsContext.isLoading) {
      return null;
    }

    const { quests, projects, workshops } = completionsContext;

    try {
      // Cast data to proper types
      const workshopData = workshopUpgradesData as WorkshopUpgrades;

      // Convert quests object to array if needed
      let questsArray: any[] = [];
      if (Array.isArray(questsData)) {
        questsArray = questsData;
      } else if (typeof questsData === 'object' && questsData !== null) {
        questsArray = Object.values(questsData);
      }

      // Transform projects data to match Project type (map category → name)
      const projectsArray = (Array.isArray(projectsData) ? projectsData : []).map((project: any) => ({
        ...project,
        phases: project.phases?.map((phase: any) => ({
          ...phase,
          requirementCategories: phase.requirementCategories?.map((req: any) => ({
            name: req.category || req.name,
            valueRequired: req.valueRequired,
          })),
        })),
      }));

      // Prepare completions filter
      const completions: CompletionsFilter = {
        quests,
        projects,
        workshops,
      };

      // Generate tags with completions filter
      const tags = generateClientTags(
        questsArray,
        workshopData,
        projectsArray,
        itemsRawData,
        completions
      );

      return tags;
    } catch (error) {
      console.error('Error computing filtered tags:', error);
      return null;
    }
  }, [completionsContext]);

  return {
    filteredTags,
    isLoading: completionsContext?.isLoading || false,
  };
}

/**
 * Apply filtered tags to items
 */
export function applyFilteredTags(items: Item[], filteredTags: Record<string, 'keep' | 'sell' | 'recycle'> | null): Item[] {
  if (!filteredTags) {
    return items; // No filtering, return original items
  }

  return items.map(item => ({
    ...item,
    tag: filteredTags[item.id] || item.tag, // Use filtered tag if available, fallback to original
  }));
}
