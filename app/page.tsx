import ItemsPage from '@/components/ItemsPage';

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  return <ItemsPage initialFilters={params} />;
}
