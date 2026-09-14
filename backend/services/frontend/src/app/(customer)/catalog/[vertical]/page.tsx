import { CatalogGrid } from '@/components/customer/CatalogGrid';
import { FilterSidebar } from '@/components/customer/FilterSidebar';

export default async function VerticalCatalogPage({ 
  params, 
  searchParams 
}: { 
  params: { vertical: string },
  searchParams: { q?: string, minPrice?: string, maxPrice?: string }
}) {
  const query = new URLSearchParams(searchParams as any).toString();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/catalog/${params.vertical}?${query}`);
  const items = await res.json();

  return (
    <div className="flex gap-6">
      <FilterSidebar vertical={params.vertical} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold font-heading mb-6 capitalize">{params.vertical} Delivery</h1>
        <CatalogGrid items={items} />
      </div>
    </div>
  );
}
