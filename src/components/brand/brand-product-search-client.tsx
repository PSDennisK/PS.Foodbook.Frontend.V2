'use client';
import { useEffect } from 'react';

import { ProductSearchClient } from '@/components/search/product-search-client';
import { useFilterStore } from '@/stores/filter.store';
import type { Filter } from '@/types/filter';

interface BrandProductSearchClientProps {
  initialFilters: Filter[];
  brandId: string;
}

export function BrandProductSearchClient({
  initialFilters,
  brandId,
}: BrandProductSearchClientProps) {
  const { addFilter } = useFilterStore();

  // Stel de merkfilter in zodra de pagina geladen is
  useEffect(() => {
    if (brandId) {
      addFilter('brand', [brandId]);
    }
  }, [brandId, addFilter]);

  return <ProductSearchClient initialFilters={initialFilters} />;
}
