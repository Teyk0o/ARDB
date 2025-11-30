import { NextResponse } from 'next/server';
import { getAllItemsWithOverrides } from '@/lib/itemLoader';

type Language = 'en' | 'fr' | 'es' | 'de' | 'zh-CN';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en') as Language;

    // Get items with community overrides applied
    const items = await getAllItemsWithOverrides(lang);

    return NextResponse.json(items);
  } catch (error) {
    console.error('Error loading items:', error);
    return NextResponse.json(
      { error: 'Failed to load items' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
