/**
 * Detect Sync Conflicts Script
 * Compares new RaidTheory data with community-edited items
 * Creates conflict entries for moderator review
 *
 * Usage: npx tsx scripts/detect-sync-conflicts.ts
 */

import { sql } from '@vercel/postgres';
import itemsData from '../data/items.json';
import { notifySyncConflict } from '../lib/discord';

interface ItemOverride {
  id: number;
  item_id: string;
  override_data: Record<string, unknown>;
  modified_fields: string[];
  last_edit_id: number | null;
}

async function detectConflicts() {
  try {
    console.log('🔍 Starting conflict detection...');

    // Get all item overrides from database
    const overridesResult = await sql<ItemOverride>`
      SELECT * FROM item_overrides
    `;

    const overrides = overridesResult.rows;
    console.log(`📊 Found ${overrides.length} community-edited items`);

    const conflicts: Array<{
      item_id: string;
      field: string;
      community_value: unknown;
      raidtheory_value: unknown;
    }> = [];

    // Check each override against new data
    for (const override of overrides) {
      const newItem = (itemsData as any[]).find(
        (item: any) => item.id === override.item_id
      );

      if (!newItem) {
        console.log(`⚠️  Item ${override.item_id} no longer exists in RaidTheory data`);
        continue;
      }

      // Check each modified field
      for (const field of override.modified_fields) {
        const communityValue = (override.override_data as any)[field];
        const raidtheoryValue = (newItem as any)[field];

        // If RaidTheory has updated this field
        if (JSON.stringify(communityValue) !== JSON.stringify(raidtheoryValue)) {
          conflicts.push({
            item_id: override.item_id,
            field,
            community_value: communityValue,
            raidtheory_value: raidtheoryValue,
          });
        }
      }
    }

    console.log(`⚠️  Found ${conflicts.length} conflicts`);

    if (conflicts.length === 0) {
      console.log('✅ No conflicts detected!');
      return;
    }

    // Group conflicts by item
    const conflictsByItem = new Map<string, typeof conflicts>();
    for (const conflict of conflicts) {
      const existing = conflictsByItem.get(conflict.item_id) || [];
      existing.push(conflict);
      conflictsByItem.set(conflict.item_id, existing);
    }

    // Create conflict entries in database
    let createdCount = 0;
    for (const [itemId, itemConflicts] of conflictsByItem) {
      const item = (itemsData as any[]).find((i: any) => i.id === itemId);
      const itemName = item?.name?.en || itemId;

      const conflictData = {
        item_id: itemId,
        item_name: itemName,
        conflicts: itemConflicts.map((c) => ({
          field: c.field,
          community_value: c.community_value,
          raidtheory_value: c.raidtheory_value,
        })),
      };

      // Insert conflict into database
      const result = await sql`
        INSERT INTO sync_conflicts (item_id, conflict_data)
        VALUES (${itemId}, ${JSON.stringify(conflictData)})
        RETURNING id
      `;

      const conflictId = result.rows[0].id;
      createdCount++;

      console.log(`📝 Created conflict #${conflictId} for ${itemName} (${itemConflicts.length} fields)`);

      // Send Discord notification
      try {
        await notifySyncConflict({
          itemId,
          itemName,
          conflictId,
        });
        console.log(`🔔 Sent Discord notification for conflict #${conflictId}`);
      } catch (notifError) {
        console.error(`Failed to send Discord notification:`, notifError);
      }
    }

    console.log(`\n✅ Created ${createdCount} conflict entries`);
    console.log(`🔗 Moderators can review at: /moderation/conflicts`);
  } catch (error) {
    console.error('❌ Conflict detection failed:', error);
    process.exit(1);
  }
}

detectConflicts();
