/**
 * API Route: /api/progress/share
 * Creates a shareable link for progress state
 */

import { NextRequest, NextResponse } from 'next/server';
import { createSharedProgress } from '@/lib/db/db';
import { getSessionFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quests, projects, workshops } = body;

    // Validate data
    if (!Array.isArray(quests) || !Array.isArray(projects) || !Array.isArray(workshops)) {
      return NextResponse.json(
        { error: 'Invalid progress data format' },
        { status: 400 }
      );
    }

    // Get user ID if authenticated (optional)
    let userId: number | null = null;
    try {
      const session = await getSessionFromRequest(request);
      if (session?.userId) {
        userId = session.userId;
      }
    } catch (error) {
      // Not authenticated, continue without user ID
    }

    // Create share link
    const shareId = await createSharedProgress(
      { quests, projects, workshops },
      userId,
      30 // expires in 30 days
    );

    return NextResponse.json({
      shareId,
      url: `/progress/share/${shareId}`,
      fullUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://arcraidersdatabase.com'}/progress/share/${shareId}`,
    });
  } catch (error) {
    console.error('Error creating share link:', error);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }
}
