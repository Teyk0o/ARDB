import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const revalidate = 60; // Revalidate every minute

export async function GET(request: NextRequest) {
  try {
    const changelogPath = path.join(process.cwd(), 'data', 'changelog.json');

    if (!fs.existsSync(changelogPath)) {
      return NextResponse.json(
        { success: true, entries: [], message: 'No changelog available yet' },
        { status: 200 }
      );
    }

    const changelogData = fs.readFileSync(changelogPath, 'utf-8');
    const entries = JSON.parse(changelogData);

    // Get query parameters
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10', 10);
    const days = parseInt(request.nextUrl.searchParams.get('days') || '30', 10);

    // Filter by days if specified
    const now = Date.now();
    const daysInMs = days * 24 * 60 * 60 * 1000;
    const filtered = entries.filter((entry: any) => now - entry.timestamp < daysInMs);

    // Return limited results
    const limited = filtered.slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        entries: limited,
        total: filtered.length,
        limit,
        days,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reading changelog:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read changelog' },
      { status: 500 }
    );
  }
}
