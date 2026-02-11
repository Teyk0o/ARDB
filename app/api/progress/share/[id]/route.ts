/**
 * API Route: /api/progress/share/[id]
 * Retrieves shared progress state by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSharedProgress, incrementShareViewCount } from '@/lib/db/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid share ID' },
        { status: 400 }
      );
    }

    // Get shared progress
    const sharedProgress = await getSharedProgress(id);

    if (!sharedProgress) {
      return NextResponse.json(
        { error: 'Share link not found or expired' },
        { status: 404 }
      );
    }

    // Return current view count, then increment for next time
    const currentViewCount = sharedProgress.viewCount;

    // Increment view count asynchronously (don't wait)
    incrementShareViewCount(id).catch(err => console.error('Failed to increment view count:', err));

    return NextResponse.json({
      id: sharedProgress.id,
      progressData: sharedProgress.progressData,
      viewCount: currentViewCount + 1, // Show incremented count including this view
      createdAt: sharedProgress.createdAt,
    });
  } catch (error) {
    console.error('Error retrieving share link:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve share link' },
      { status: 500 }
    );
  }
}
