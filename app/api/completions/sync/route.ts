/**
 * POST /api/completions/sync - Sync local storage completions to database
 * Merges local and server data, with server taking precedence on conflicts
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import {
  getUserCompletions,
  bulkAddCompletions,
  type UserCompletion,
} from '@/lib/db/db';

interface SyncRequest {
  quests: string[];
  projects: string[];
  workshops: string[];
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body (local completions)
    const body: SyncRequest = await request.json();

    // Validate input
    if (
      !body ||
      !Array.isArray(body.quests) ||
      !Array.isArray(body.projects) ||
      !Array.isArray(body.workshops)
    ) {
      return NextResponse.json(
        { success: false, error: 'Invalid sync data format' },
        { status: 400 }
      );
    }

    // Get existing server completions
    const serverCompletions = await getUserCompletions(session.userId);
    const serverIds = new Set(
      serverCompletions.map(
        (c) => `${c.completion_type}:${c.completion_id}`
      )
    );

    // Prepare new completions to add (local items not on server)
    const toAdd: Array<{
      completion_type: 'quest' | 'project' | 'workshop';
      completion_id: string;
    }> = [];

    body.quests.forEach((id) => {
      if (!serverIds.has(`quest:${id}`)) {
        toAdd.push({ completion_type: 'quest', completion_id: id });
      }
    });

    body.projects.forEach((id) => {
      if (!serverIds.has(`project:${id}`)) {
        toAdd.push({ completion_type: 'project', completion_id: id });
      }
    });

    body.workshops.forEach((id) => {
      if (!serverIds.has(`workshop:${id}`)) {
        toAdd.push({ completion_type: 'workshop', completion_id: id });
      }
    });

    // Bulk add new completions
    let added: UserCompletion[] = [];
    if (toAdd.length > 0) {
      added = await bulkAddCompletions(session.userId, toAdd);
    }

    // Return merged server data (server is source of truth)
    const finalCompletions = await getUserCompletions(session.userId);
    const data = {
      quests: finalCompletions
        .filter((c) => c.completion_type === 'quest')
        .map((c) => c.completion_id),
      projects: finalCompletions
        .filter((c) => c.completion_type === 'project')
        .map((c) => c.completion_id),
      workshops: finalCompletions
        .filter((c) => c.completion_type === 'workshop')
        .map((c) => c.completion_id),
    };

    return NextResponse.json({
      success: true,
      data,
      synced: added.length,
    });
  } catch (error) {
    console.error('Error syncing completions:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
