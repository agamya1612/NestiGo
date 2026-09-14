import { Suspense } from 'react';
import { apiClient } from '@/lib/api-client';
import { VerticalCard } from '@/components/customer/VerticalCard';
import { HeroBanner } from '@/components/customer/HeroBanner';
import { Skeleton } from '@/components/ui/skeleton';

async function fetchVerticals() {
  // Using direct fetch for RSC caching
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/catalog/verticals`, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error('Failed to fetch verticals');
  return res.json();
}

export default async function HomePage() {
  const verticals = await fetchVerticals();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeroBanner />
      
      <section>
        <h2 className="font-heading font-bold text-xl mb-4">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {verticals.map((vert: any) => (
            <VerticalCard key={vert.id} vertical={vert} />
          ))}
        </div>
      </section>
    </div>
  );
}
