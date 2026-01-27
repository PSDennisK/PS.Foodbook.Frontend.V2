import { Suspense } from 'react';

import { ProductGridSkeleton } from '@/components/search/product-grid-skeleton';
import { ProductSearchClient } from '@/components/search/product-search-client';
import { catalogService } from '@/lib/api/catalog.service';
import { productService } from '@/lib/api/product.service';
import type { Filter } from '@/types/filter';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ guid: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guid } = await params;
  const theme = await catalogService.getTheme(guid);

  return {
    title: theme?.title || 'Digitale Catalogus',
    description: `Bekijk producten in de ${theme?.title || 'digitale catalogus'}`,
  };
}

export default async function CatalogPage({ params }: Props) {
  const { guid } = await params;

  let filters: Filter[] = [];
  try {
    filters = await productService.getFilters();
  } catch (error) {
    console.error('Failed to load filters for catalog:', error);
    filters = [];
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Catalogus Producten</h1>
        <p className="text-muted-foreground">
          Zoek en filter producten binnen deze digitale catalogus
        </p>
      </div>

      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductSearchClient initialFilters={filters} securityToken={guid} />
      </Suspense>
    </div>
  );
}
