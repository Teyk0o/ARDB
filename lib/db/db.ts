/**
 * Database connection and query utilities
 * Uses Vercel Postgres (@vercel/postgres)
 */

import { sql } from '@vercel/postgres';

/**
 * Database types
 */

export interface User {
  id: number;
  discord_id: string;
  discord_username: string;
  discord_avatar: string | null;
  discord_discriminator: string | null;
  is_moderator: boolean;
  is_banned: boolean;
  ban_reason: string | null;
  banned_at: Date | null;
  banned_by: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ItemEdit {
  id: number;
  item_id: string;
  user_id: number | null;
  status: 'pending' | 'approved' | 'rejected';
  edit_data: Record<string, unknown>;
  original_data: Record<string, unknown>;
  reason: string | null;
  created_at: Date;
  reviewed_at: Date | null;
  reviewed_by: number | null;
}

export interface EditComment {
  id: number;
  edit_id: number;
  user_id: number | null;
  comment: string;
  created_at: Date;
}

export interface ItemOverride {
  id: number;
  item_id: string;
  override_data: Record<string, unknown>;
  modified_fields: string[];
  last_edit_id: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface ItemHistory {
  id: number;
  item_id: string;
  edit_id: number | null;
  user_id: number | null;
  changes: Record<string, unknown>;
  action: 'create' | 'update' | 'approve' | 'reject' | 'edit';
  created_at: Date;
}

export interface SyncConflict {
  id: number;
  item_id: string;
  conflict_data: Record<string, unknown>;
  resolved: boolean;
  resolved_by: number | null;
  resolution_type: 'keep_community' | 'keep_raidtheory' | 'merge' | null;
  resolved_at: Date | null;
  created_at: Date;
}

export interface UserCompletion {
  id: number;
  user_id: number;
  completion_type: 'quest' | 'project' | 'workshop';
  completion_id: string;
  metadata: Record<string, unknown>;
  completed_at: Date;
  created_at: Date;
}

/**
 * User queries
 */

export async function getUserByDiscordId(discordId: string): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE discord_id = ${discordId}
  `;
  return result.rows[0] || null;
}

export async function getUserById(id: number): Promise<User | null> {
  const result = await sql<User>`
    SELECT * FROM users WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function createUser(data: {
  discord_id: string;
  discord_username: string;
  discord_avatar?: string;
  discord_discriminator?: string;
  is_moderator: boolean;
}): Promise<User> {
  const result = await sql<User>`
    INSERT INTO users (discord_id, discord_username, discord_avatar, discord_discriminator, is_moderator)
    VALUES (${data.discord_id}, ${data.discord_username}, ${data.discord_avatar || null}, ${data.discord_discriminator || null}, ${data.is_moderator})
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateUser(
  discordId: string,
  data: {
    discord_username?: string;
    discord_avatar?: string;
    discord_discriminator?: string;
    is_moderator?: boolean;
  }
): Promise<User> {
  const updates: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.discord_username !== undefined) {
    updates.push(`discord_username = $${paramIndex++}`);
    values.push(data.discord_username);
  }
  if (data.discord_avatar !== undefined) {
    updates.push(`discord_avatar = $${paramIndex++}`);
    values.push(data.discord_avatar);
  }
  if (data.discord_discriminator !== undefined) {
    updates.push(`discord_discriminator = $${paramIndex++}`);
    values.push(data.discord_discriminator);
  }
  if (data.is_moderator !== undefined) {
    updates.push(`is_moderator = $${paramIndex++}`);
    values.push(data.is_moderator);
  }

  // Use sql.query() for dynamic UPDATE with raw SQL
  const query = `
    UPDATE users
    SET ${updates.join(', ')}
    WHERE discord_id = $${paramIndex}
    RETURNING *
  `;
  values.push(discordId);

  const result = await sql.query<User>(query, values);
  return result.rows[0];
}

/**
 * Item Edit queries
 */

export async function createItemEdit(data: {
  item_id: string;
  user_id: number;
  edit_data: Record<string, unknown>;
  original_data: Record<string, unknown>;
  reason?: string;
}): Promise<ItemEdit> {
  const result = await sql<ItemEdit>`
    INSERT INTO item_edits (item_id, user_id, edit_data, original_data, reason)
    VALUES (${data.item_id}, ${data.user_id}, ${JSON.stringify(data.edit_data)}, ${JSON.stringify(data.original_data)}, ${data.reason || null})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getItemEdits(filters?: {
  status?: 'pending' | 'approved' | 'rejected';
  item_id?: string;
  user_id?: number;
  limit?: number;
  offset?: number;
}): Promise<ItemEdit[]> {
  let query = 'SELECT * FROM item_edits WHERE 1=1';
  const values: unknown[] = [];
  let paramIndex = 1;

  if (filters?.status) {
    query += ` AND status = $${paramIndex++}`;
    values.push(filters.status);
  }
  if (filters?.item_id) {
    query += ` AND item_id = $${paramIndex++}`;
    values.push(filters.item_id);
  }
  if (filters?.user_id) {
    query += ` AND user_id = $${paramIndex++}`;
    values.push(filters.user_id);
  }

  query += ' ORDER BY created_at DESC';

  if (filters?.limit) {
    query += ` LIMIT $${paramIndex++}`;
    values.push(filters.limit);
  }
  if (filters?.offset) {
    query += ` OFFSET $${paramIndex++}`;
    values.push(filters.offset);
  }

  const result = await sql.query<ItemEdit>(query, values);
  return result.rows;
}

export async function getItemEditById(id: number): Promise<ItemEdit | null> {
  const result = await sql<ItemEdit>`
    SELECT * FROM item_edits WHERE id = ${id}
  `;
  return result.rows[0] || null;
}

export async function getItemEditsByUser(userId: number): Promise<ItemEdit[]> {
  return getItemEdits({ user_id: userId });
}

export async function updateItemEditStatus(
  id: number,
  status: 'approved' | 'rejected',
  reviewedBy: number
): Promise<ItemEdit> {
  const result = await sql<ItemEdit>`
    UPDATE item_edits
    SET status = ${status}, reviewed_at = NOW(), reviewed_by = ${reviewedBy}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function updateItemEditData(
  id: number,
  editData: Record<string, unknown>
): Promise<ItemEdit> {
  const result = await sql<ItemEdit>`
    UPDATE item_edits
    SET edit_data = ${JSON.stringify(editData)}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Edit Comment queries
 */

export async function createEditComment(data: {
  edit_id: number;
  user_id: number;
  comment: string;
}): Promise<EditComment> {
  const result = await sql<EditComment>`
    INSERT INTO edit_comments (edit_id, user_id, comment)
    VALUES (${data.edit_id}, ${data.user_id}, ${data.comment})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getEditComments(editId: number): Promise<EditComment[]> {
  const result = await sql<EditComment>`
    SELECT * FROM edit_comments
    WHERE edit_id = ${editId}
    ORDER BY created_at ASC
  `;
  return result.rows;
}

/**
 * Item Override queries
 */

export async function getItemOverride(itemId: string): Promise<ItemOverride | null> {
  const result = await sql<ItemOverride>`
    SELECT * FROM item_overrides WHERE item_id = ${itemId}
  `;
  return result.rows[0] || null;
}

export async function createOrUpdateItemOverride(data: {
  item_id: string;
  override_data: Record<string, unknown>;
  modified_fields: string[];
  last_edit_id: number;
}): Promise<ItemOverride> {
  const result = await sql<ItemOverride>`
    INSERT INTO item_overrides (item_id, override_data, modified_fields, last_edit_id)
    VALUES (${data.item_id}, ${JSON.stringify(data.override_data)}, ${JSON.stringify(data.modified_fields)}, ${data.last_edit_id})
    ON CONFLICT (item_id)
    DO UPDATE SET
      override_data = ${JSON.stringify(data.override_data)},
      modified_fields = ${JSON.stringify(data.modified_fields)},
      last_edit_id = ${data.last_edit_id}
    RETURNING *
  `;
  return result.rows[0];
}

export async function getAllItemOverrides(): Promise<ItemOverride[]> {
  const result = await sql<ItemOverride>`
    SELECT * FROM item_overrides
  `;
  return result.rows;
}

/**
 * Item History queries
 */

export async function createHistoryEntry(data: {
  item_id: string;
  edit_id?: number;
  user_id?: number;
  changes: Record<string, unknown>;
  action: 'create' | 'update' | 'approve' | 'reject' | 'edit';
}): Promise<ItemHistory> {
  const result = await sql<ItemHistory>`
    INSERT INTO item_history (item_id, edit_id, user_id, changes, action)
    VALUES (${data.item_id}, ${data.edit_id || null}, ${data.user_id || null}, ${JSON.stringify(data.changes)}, ${data.action})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getItemHistory(itemId?: string, limit = 100): Promise<ItemHistory[]> {
  const result = itemId
    ? await sql<ItemHistory>`
        SELECT * FROM item_history
        WHERE item_id = ${itemId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `
    : await sql<ItemHistory>`
        SELECT * FROM item_history
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
  return result.rows;
}

/**
 * Sync Conflict queries
 */

export async function createSyncConflict(data: {
  item_id: string;
  conflict_data: Record<string, unknown>;
}): Promise<SyncConflict> {
  const result = await sql<SyncConflict>`
    INSERT INTO sync_conflicts (item_id, conflict_data)
    VALUES (${data.item_id}, ${JSON.stringify(data.conflict_data)})
    RETURNING *
  `;
  return result.rows[0];
}

export async function getUnresolvedConflicts(): Promise<SyncConflict[]> {
  const result = await sql<SyncConflict>`
    SELECT * FROM sync_conflicts
    WHERE resolved = FALSE
    ORDER BY created_at DESC
  `;
  return result.rows;
}

export async function resolveSyncConflict(
  id: number,
  resolutionType: 'keep_community' | 'keep_raidtheory' | 'merge',
  resolvedBy: number
): Promise<SyncConflict> {
  const result = await sql<SyncConflict>`
    UPDATE sync_conflicts
    SET resolved = TRUE, resolution_type = ${resolutionType}, resolved_at = NOW(), resolved_by = ${resolvedBy}
    WHERE id = ${id}
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Statistics queries
 */

export async function getEditStatistics(userId?: number) {
  const userFilter = userId ? sql`AND user_id = ${userId}` : sql``;

  const result = await sql`
    SELECT
      status,
      COUNT(*) as count
    FROM item_edits
    WHERE 1=1 ${
      // @ts-expect-error - Dynamic SQL fragment is valid in @vercel/postgres
      userFilter
    }
    GROUP BY status
  `;

  return {
    pending: result.rows.find((r) => r.status === 'pending')?.count || 0,
    approved: result.rows.find((r) => r.status === 'approved')?.count || 0,
    rejected: result.rows.find((r) => r.status === 'rejected')?.count || 0,
  };
}

export async function getTopContributors(limit = 10) {
  const result = await sql`
    SELECT
      u.id,
      u.discord_username,
      u.discord_avatar,
      COUNT(e.id) as total_edits,
      COUNT(CASE WHEN e.status = 'approved' THEN 1 END) as approved_edits
    FROM users u
    LEFT JOIN item_edits e ON u.id = e.user_id
    GROUP BY u.id, u.discord_username, u.discord_avatar
    HAVING COUNT(e.id) > 0
    ORDER BY approved_edits DESC, total_edits DESC
    LIMIT ${limit}
  `;

  return result.rows;
}

/**
 * User Ban Management
 */

export async function banUser(
  userId: number,
  bannedBy: number,
  reason?: string
): Promise<User> {
  const result = await sql<User>`
    UPDATE users
    SET is_banned = TRUE, ban_reason = ${reason || null}, banned_at = NOW(), banned_by = ${bannedBy}
    WHERE id = ${userId}
    RETURNING *
  `;
  return result.rows[0];
}

export async function unbanUser(userId: number): Promise<User> {
  const result = await sql<User>`
    UPDATE users
    SET is_banned = FALSE, ban_reason = NULL, banned_at = NULL, banned_by = NULL
    WHERE id = ${userId}
    RETURNING *
  `;
  return result.rows[0];
}

/**
 * Cooldown Management
 * Cooldown: 5 minutes between edit submissions
 */

const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function getUserLastEditTime(userId: number): Promise<Date | null> {
  const result = await sql<{ created_at: Date }>`
    SELECT created_at
    FROM item_edits
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return result.rows[0]?.created_at || null;
}

export async function checkUserCooldown(userId: number): Promise<{
  canSubmit: boolean;
  remainingTime: number;
}> {
  const lastEditTime = await getUserLastEditTime(userId);

  if (!lastEditTime) {
    return { canSubmit: true, remainingTime: 0 };
  }

  const timeSinceLastEdit = Date.now() - new Date(lastEditTime).getTime();
  const remainingTime = Math.max(0, COOLDOWN_MS - timeSinceLastEdit);

  return {
    canSubmit: remainingTime === 0,
    remainingTime: Math.ceil(remainingTime / 1000), // Return in seconds
  };
}

/**
 * User Completions Management
 * Track completed quests, projects, and workshop upgrades
 */

export async function getUserCompletions(userId: number): Promise<UserCompletion[]> {
  const result = await sql<UserCompletion>`
    SELECT * FROM user_completions
    WHERE user_id = ${userId}
    ORDER BY completed_at DESC
  `;
  return result.rows;
}

export async function getUserCompletionsByType(
  userId: number,
  type: 'quest' | 'project' | 'workshop'
): Promise<UserCompletion[]> {
  const result = await sql<UserCompletion>`
    SELECT * FROM user_completions
    WHERE user_id = ${userId} AND completion_type = ${type}
    ORDER BY completed_at DESC
  `;
  return result.rows;
}

export async function addCompletion(
  userId: number,
  completionType: 'quest' | 'project' | 'workshop',
  completionId: string,
  metadata?: Record<string, unknown>
): Promise<UserCompletion> {
  const result = await sql<UserCompletion>`
    INSERT INTO user_completions (user_id, completion_type, completion_id, metadata)
    VALUES (${userId}, ${completionType}, ${completionId}, ${JSON.stringify(metadata || {})})
    ON CONFLICT (user_id, completion_type, completion_id)
    DO UPDATE SET completed_at = NOW(), metadata = ${JSON.stringify(metadata || {})}
    RETURNING *
  `;
  return result.rows[0];
}

export async function removeCompletion(
  userId: number,
  completionType: 'quest' | 'project' | 'workshop',
  completionId: string
): Promise<boolean> {
  const result = await sql`
    DELETE FROM user_completions
    WHERE user_id = ${userId}
      AND completion_type = ${completionType}
      AND completion_id = ${completionId}
  `;
  return result.rowCount !== null && result.rowCount > 0;
}

export async function bulkAddCompletions(
  userId: number,
  completions: Array<{
    completion_type: 'quest' | 'project' | 'workshop';
    completion_id: string;
    metadata?: Record<string, unknown>;
  }>
): Promise<UserCompletion[]> {
  if (completions.length === 0) {
    return [];
  }

  // Build VALUES clause for bulk insert
  const values = completions
    .map(
      (_, index) =>
        `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`
    )
    .join(', ');

  const params = completions.flatMap((c) => [
    userId,
    c.completion_type,
    c.completion_id,
    JSON.stringify(c.metadata || {}),
  ]);

  const query = `
    INSERT INTO user_completions (user_id, completion_type, completion_id, metadata)
    VALUES ${values}
    ON CONFLICT (user_id, completion_type, completion_id)
    DO UPDATE SET completed_at = NOW(), metadata = EXCLUDED.metadata
    RETURNING *
  `;

  const result = await sql.query<UserCompletion>(query, params);
  return result.rows;
}

export async function clearUserCompletions(userId: number): Promise<boolean> {
  const result = await sql`
    DELETE FROM user_completions
    WHERE user_id = ${userId}
  `;
  return result.rowCount !== null && result.rowCount > 0;
}

export async function getUserCompletionsCount(
  userId: number
): Promise<{
  quests: number;
  projects: number;
  workshops: number;
  total: number;
}> {
  const result = await sql`
    SELECT
      completion_type,
      COUNT(*) as count
    FROM user_completions
    WHERE user_id = ${userId}
    GROUP BY completion_type
  `;

  const counts = {
    quests: 0,
    projects: 0,
    workshops: 0,
    total: 0,
  };

  result.rows.forEach((row) => {
    const typedRow = row as { completion_type: string; count: string };
    const count = parseInt(typedRow.count, 10);
    if (typedRow.completion_type === 'quest') counts.quests = count;
    if (typedRow.completion_type === 'project') counts.projects = count;
    if (typedRow.completion_type === 'workshop') counts.workshops = count;
    counts.total += count;
  });

  return counts;
}
