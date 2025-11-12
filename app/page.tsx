import ItemsPage from '@/components/ItemsPage';
import itemsData from '@/data/items.json';
import { Item } from '@/types/item';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const items = itemsData as Item[];
  const params = await searchParams;

  return <ItemsPage items={items} initialFilters={params} />;
}
