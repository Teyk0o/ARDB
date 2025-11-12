import { NextResponse } from 'next/server';
import itemsData from '@/data/items.json';
import { transformItems } from '@/lib/itemTransformer';

type Language = 'en' | 'fr' | 'de' | 'es' | 'pt' | 'pl' | 'no' | 'da' | 'it' | 'ru' | 'ja' | 'zh-TW' | 'uk' | 'zh-CN' | 'kr' | 'tr' | 'hr' | 'sr';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') || 'en') as Language;

    // Transform items to include language-specific translations
    const transformedItems = transformItems(itemsData as any, lang);

    return NextResponse.json(transformedItems);
  } catch (error) {
    console.error('Error loading items:', error);
    return NextResponse.json(
      { error: 'Failed to load items' },
      { status: 500 }
    );
  }
}
