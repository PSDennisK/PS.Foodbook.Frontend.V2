'use client';

import { useFilterStore } from '@/stores/filter.store';
import type { Filter, SearchResults } from '@/types/filter';
import { useQuery } from '@tanstack/react-query';
import { FilterSidebar } from './filter-sidebar';
import { Pagination } from './pagination';
import { ProductGrid } from './product-grid';
import { ProductGridSkeleton } from './product-grid-skeleton';
import { SearchBar } from './search-bar';

interface ProductSearchClientProps {
  initialFilters: Filter[];
  securityToken?: string;
}

export function ProductSearchClient({ initialFilters, securityToken }: ProductSearchClientProps) {
  const { keyword, filters, pageIndex, pageSize } = useFilterStore();

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['products', 'search', keyword, filters, pageIndex, pageSize, securityToken],
    queryFn: async () => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          page: pageIndex,
          pageSize,
          securityToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      return (await response.json()) as SearchResults;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filter Sidebar */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-4">
          <FilterSidebar filters={initialFilters} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:col-span-3">
        <SearchBar securityToken={securityToken} />

        {/* Results Info */}
        {data?.pagination && !isLoading && (
          <div className="mb-4 text-sm text-muted-foreground">
            {data.pagination.total > 0 ? (
              <>
                <span className="font-medium">{data.pagination.total}</span> producten gevonden
                {keyword && (
                  <>
                    {' '}
                    voor <span className="font-medium">"{keyword}"</span>
                  </>
                )}
              </>
            ) : (
              <>Geen producten gevonden</>
            )}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Er is een fout opgetreden</p>
            <p className="text-sm mt-1">Probeer het later opnieuw of pas je zoekopdracht aan.</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && <ProductGridSkeleton count={pageSize} />}

        {/* Product Grid */}
        {!isLoading && data?.products && (
          <>
            <ProductGrid products={data.products} />
            <Pagination pagination={data.pagination} />
          </>
        )}
      </main>
    </div>
  );
}
