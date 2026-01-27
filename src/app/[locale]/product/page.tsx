import { Suspense } from 'react';

import { ProductGridSkeleton } from '@/components/search/product-grid-skeleton';
import { ProductSearchClient } from '@/components/search/product-search-client';
import { productService } from '@/lib/api/product.service';
import type { Filter } from '@/types/filter';

export const metadata = {
  title: 'Producten zoeken',
  description: 'Zoek en filter producten in de PS Foodbook catalogus',
};

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

export default async function ProductSearchPage() {
  // Handle API failures gracefully during build/runtime
  let filters: Filter[] = [];
  try {
    filters = await productService.getFilters();
  } catch (error) {
    console.error('Failed to load filters:', error);
    filters = [];
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Producten zoeken</h1>
        <p className="text-muted-foreground">Doorzoek onze catalogus met duizenden producten</p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductSearchClient initialFilters={filters} />
      </Suspense>
    </div>
  );
}
