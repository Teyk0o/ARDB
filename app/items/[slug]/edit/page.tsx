/**
 * Item Edit Page
 * Allows authenticated users to propose edits to items
 */

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { getItemWithOverride } from '@/lib/itemLoader';
import { getAllItemsWithOverrides } from '@/lib/itemLoader';
import { getAllQuests, getAllProjects } from '@/lib/questsAndProjectsLoader';
import ItemEditPageWrapper from '@/components/edit/ItemEditPageWrapper';
import { generateSlug } from '@/lib/slugUtils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ItemEditPage({ params }: PageProps) {
  // Check authentication
  const session = await getSession();

  if (!session) {
    redirect('/api/auth/discord?returnTo=/items/' + (await params).slug + '/edit');
  }

  const { slug } = await params;

  // Always load items in English - the wrapper will handle language switching on client
  const items = await getAllItemsWithOverrides('en');
  const item = items.find((i) => generateSlug(i.nameEn || i.name) === slug);

  if (!item) {
    redirect('/');
  }

  // Load all quests and projects for autocomplete
  const quests = getAllQuests();
  const projects = getAllProjects();

  // Calculate craft relationships like on detail page

  // 1. Calculate recycle_components: Items obtained by recycling THIS item
  // Convert recyclesInto field to recycle_components format
  const calculatedRecycleComponents: typeof item.recycle_components = [];

  const recyclesInto = (item as any).recyclesInto;
  if (recyclesInto && typeof recyclesInto === 'object') {
    for (const [itemId, quantity] of Object.entries(recyclesInto)) {
      const recycledItem = items.find(i => i.id === itemId);
      if (recycledItem) {
        calculatedRecycleComponents.push({
          component: {
            id: recycledItem.id,
            name: recycledItem.name,
            nameTranslations: recycledItem.nameTranslations,
            icon: recycledItem.icon,
            item_type: recycledItem.item_type,
            rarity: recycledItem.rarity,
          },
          quantity: typeof quantity === 'number' ? quantity : 1,
        });
      }
    }
  }

  // 2. Calculate recycle_from: Items that can be recycled to get THIS item
  // Look for items that have THIS item in their recyclesInto/recycle_components
  // (i.e., recycle those items → get THIS item)
  const calculatedRecycleFrom = items
    .filter((otherItem) => {
      if (otherItem.id === item.id) return false;

      // Check if THIS item appears in otherItem's recycle_components
      const recycleComps = otherItem.recycle_components || [];
      const hasInRecycleComps = recycleComps.some((comp) => {
        const compId = comp.component?.id || comp.item?.id;
        return compId === item.id;
      });

      if (hasInRecycleComps) return true;

      // Also check recyclesInto field
      const recyclesInto = (otherItem as any).recyclesInto;
      if (recyclesInto && typeof recyclesInto === 'object') {
        return Object.keys(recyclesInto).includes(item.id);
      }

      return false;
    })
    .map((otherItem) => {
      const recycleComp = otherItem.recycle_components?.find(
        (comp) => (comp.component?.id || comp.item?.id) === item.id
      );
      return {
        item: {
          id: otherItem.id,
          name: otherItem.name,
          nameTranslations: otherItem.nameTranslations,
          icon: otherItem.icon,
          item_type: otherItem.item_type,
          rarity: otherItem.rarity,
        },
        quantity: recycleComp?.quantity || (otherItem as any).recyclesInto?.[item.id] || 1,
      };
    });

  const itemWithRelations = {
    ...item,
    // Merge existing recycle_components with calculated ones
    recycle_components: [
      ...(item.recycle_components || []),
      ...calculatedRecycleComponents,
    ],
    // Merge existing recycle_from with calculated ones
    recycle_from: [
      ...(item.recycle_from || []),
      ...calculatedRecycleFrom,
    ],
    // Items that use this item in crafting
    used_in: items
      .filter((otherItem) =>
        otherItem.crafting_components?.some(
          (comp) => (comp.component?.id || comp.item?.id) === item.id
        ) ||
        otherItem.components?.some(
          (comp) => (comp.component?.id || comp.item?.id) === item.id
        ) ||
        (Array.isArray(otherItem.recipe) && otherItem.recipe.some(
          (comp) => (comp.component?.id || comp.item?.id) === item.id
        ))
      )
      .map((otherItem) => ({
        item: {
          id: otherItem.id,
          name: otherItem.name,
          nameTranslations: otherItem.nameTranslations,
          icon: otherItem.icon,
          item_type: otherItem.item_type,
          rarity: otherItem.rarity,
        },
        quantity:
          otherItem.crafting_components?.find(
            (comp) => (comp.component?.id || comp.item?.id) === item.id
          )?.quantity ||
          otherItem.components?.find(
            (comp) => (comp.component?.id || comp.item?.id) === item.id
          )?.quantity ||
          (Array.isArray(otherItem.recipe) ? otherItem.recipe.find(
            (comp) => (comp.component?.id || comp.item?.id) === item.id
          )?.quantity : undefined) ||
          1,
      })),
  };

  return (
    <ItemEditPageWrapper
      item={itemWithRelations}
      language='en'
      user={session}
      allItems={items}
      quests={quests}
      projects={projects}
    />
  );
}

export const dynamic = 'force-dynamic';
