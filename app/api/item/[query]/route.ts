import { NextResponse } from 'next/server';
import itemsData from '@/data/items.json';
import { transformItem } from '@/lib/itemTransformer';
import { normalizeSearchText } from '@/lib/searchUtils';
import { similarityScore } from '@/lib/fuzzySearch';

type Language = 'en' | 'fr' | 'de' | 'es' | 'pt' | 'pl' | 'no' | 'da' | 'it' | 'ru' | 'ja' | 'zh-TW' | 'uk' | 'zh-CN' | 'kr' | 'tr' | 'hr' | 'sr';

const SUPPORTED_LANGUAGES: Language[] = ['en', 'fr', 'de', 'es', 'pt', 'pl', 'no', 'da', 'it', 'ru', 'ja', 'zh-TW', 'uk', 'zh-CN', 'kr', 'tr', 'hr', 'sr'];

interface MultilingualField {
  [key: string]: string;
}

interface ExternalItem {
  id: string;
  name: MultilingualField;
  description: MultilingualField;
  type: string;
  rarity: string;
  value: number;
  [key: string]: any;
}

interface SearchResult {
  item: ExternalItem;
  matchedLanguage: Language;
  matchType: 'exact' | 'fuzzy';
  score: number;
}

/**
 * Searches for an item by name across all supported languages
 * Supports both exact and fuzzy matching
 * @param query The search query (item name in any language)
 * @param items Array of items to search
 * @returns The best matching item result or null
 */
function searchItemByName(query: string, items: ExternalItem[]): SearchResult | null {
  const normalizedQuery = normalizeSearchText(query);
  let bestMatch: SearchResult | null = null;
  let bestScore = 0;

  for (const item of items) {
    // Search through all language names
    for (const lang of SUPPORTED_LANGUAGES) {
      const itemName = item.name[lang];
      if (!itemName) continue;

      const normalizedItemName = normalizeSearchText(itemName);

      // Exact match (highest priority)
      if (normalizedItemName === normalizedQuery) {
        return {
          item,
          matchedLanguage: lang,
          matchType: 'exact',
          score: 1.0,
        };
      }

      // Partial exact match
      if (normalizedItemName.includes(normalizedQuery) || normalizedQuery.includes(normalizedItemName)) {
        const score = normalizedQuery.length / normalizedItemName.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = {
            item,
            matchedLanguage: lang,
            matchType: 'exact',
            score,
          };
        }
      }

      // Fuzzy match (fallback)
      const fuzzyScore = similarityScore(itemName, query);
      if (fuzzyScore > bestScore && fuzzyScore >= 0.6) {
        bestScore = fuzzyScore;
        bestMatch = {
          item,
          matchedLanguage: lang,
          matchType: 'fuzzy',
          score: fuzzyScore,
        };
      }
    }

    // Also check item ID
    if (item.id.toLowerCase() === normalizedQuery) {
      return {
        item,
        matchedLanguage: 'en',
        matchType: 'exact',
        score: 1.0,
      };
    }
  }

  return bestMatch;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ query: string }> }
) {
  try {
    const { query } = await params;
    const { searchParams } = new URL(request.url);
    const langParam = searchParams.get('lang') || 'en';

    // Validate language parameter
    const lang = SUPPORTED_LANGUAGES.includes(langParam as Language)
      ? (langParam as Language)
      : 'en';

    if (!query || query.trim() === '') {
      return NextResponse.json(
        {
          error: 'Query parameter is required',
          message: 'Please provide an item name to search for'
        },
        { status: 400 }
      );
    }

    // Search for the item
    const searchResult = searchItemByName(query, itemsData as ExternalItem[]);

    if (!searchResult) {
      return NextResponse.json(
        {
          error: 'Item not found',
          message: `No item found matching "${query}"`,
          query,
          suggestion: 'Try checking the spelling or use a different language'
        },
        { status: 404 }
      );
    }

    // Transform the item to the requested language
    const transformedItem = transformItem(searchResult.item, lang);

    // Prepare response with metadata
    const response = {
      success: true,
      query,
      matchType: searchResult.matchType,
      matchedLanguage: searchResult.matchedLanguage,
      matchScore: searchResult.score,
      responseLanguage: lang,
      item: transformedItem,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error searching for item:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: 'An error occurred while searching for the item'
      },
      { status: 500 }
    );
  }
}
