import { Metadata, ResolvingMetadata } from 'next';
import itemsData from '@/data/items.json';
import { transformItems } from '@/lib/itemTransformer';
import { parseItemSlug, isValidItemSlug } from '@/lib/slugUtils';
import { Item } from '@/types/item';
import ItemDetailPageWrapper from '@/components/ItemDetailPageWrapper';
import { notFound } from 'next/navigation';

type Language = 'en' | 'fr' | 'de' | 'es' | 'pt' | 'pl' | 'no' | 'da' | 'it' | 'ru' | 'ja' | 'zh-TW' | 'uk' | 'zh-CN' | 'kr' | 'tr' | 'hr' | 'sr';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/**
 * Generate static parameters for all items
 * This enables static generation for item pages
 */
export async function generateStaticParams() {
  const transformedItems = transformItems(itemsData as any, 'en');
  const { generateSlug } = await import('@/lib/slugUtils');

  return transformedItems.map((item: Item) => ({
    slug: generateSlug(item.nameEn || item.name),
  }));
}

/**
 * Generate metadata for each item page
 * Optimized for SEO with Open Graph and Twitter cards
 */
export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const lang = (searchParamsResolved.lang as Language) || 'en';

  // Find item by slug name (using English name)
  const { generateSlug } = await import('@/lib/slugUtils');
  const transformedItems = transformItems(itemsData as any, lang);
  const item = transformedItems.find((i: Item) => generateSlug(i.nameEn || i.name) === slug);

  if (!item) {
    return {};
  }

  // Generate canonical URL (without language parameter since it's auto-detected)
  const baseUrl = 'https://www.arcraidersdatabase.com';
  const itemUrl = `${baseUrl}/items/${slug}`;

  // Create SEO-friendly title and description
  const title = `${item.name} - Arc Raiders Database`;
  const description = item.description || `Complete guide for ${item.name} in Arc Raiders`;

  // Create image URL for Open Graph
  const imageUrl = item.icon || '/metapreview.png';

  return {
    title,
    description,
    alternates: {
      canonical: itemUrl,
      languages: {
        'en': itemUrl,
        'fr': itemUrl,
        'de': itemUrl,
        'es': itemUrl,
        'pt': itemUrl,
        'pl': itemUrl,
        'no': itemUrl,
        'da': itemUrl,
        'it': itemUrl,
        'ru': itemUrl,
        'ja': itemUrl,
        'zh-TW': itemUrl,
        'uk': itemUrl,
        'zh-CN': itemUrl,
        'kr': itemUrl,
        'tr': itemUrl,
        'hr': itemUrl,
        'sr': itemUrl,
        'x-default': itemUrl,
      },
    },
    keywords: [
      item.name,
      'Arc Raiders',
      'Database',
      item.item_type,
      'Crafting',
      'Guide',
    ],
    openGraph: {
      title,
      description,
      url: itemUrl,
      type: 'website',
      images: [
        {
          url: imageUrl,
          width: 512,
          height: 512,
          alt: item.name,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  };
}

/**
 * Item detail page
 * Server component that fetches and renders item details
 */
export default async function ItemDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const searchParamsResolved = await searchParams;
  const lang = (searchParamsResolved.lang as Language) || 'en';

  // Find item by slug name (using English name) - always fetch in English first
  const { generateSlug } = await import('@/lib/slugUtils');
  const transformedItems = transformItems(itemsData as any, 'en');
  const item = transformedItems.find((i: Item) => generateSlug(i.nameEn || i.name) === slug) as Item | undefined;

  if (!item) {
    notFound();
  }

  // Get all items for craft relationships - in English
  // The wrapper will handle language switching on the client
  const allItems = transformItems(itemsData as any, 'en');

  return (
    <ItemDetailPageWrapper
      item={item}
      language='en'
      allItems={allItems}
    />
  );
}
