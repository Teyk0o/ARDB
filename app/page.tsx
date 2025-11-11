import ItemsPage from '@/components/ItemsPage';
import itemsData from '@/data/items.json';
import { Item } from '@/types/item';

export default function Home() {
  const items = itemsData as Item[];

  return <ItemsPage items={items} />;
}
