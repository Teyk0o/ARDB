import { NextResponse } from 'next/server';
import itemsData from '@/data/items.json';

export async function GET(request: Request) {
  try {
    return NextResponse.json(itemsData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to load items' },
      { status: 500 }
    );
  }
}
