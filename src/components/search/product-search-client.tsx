'use client';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { EmptyState } from '@/components/ui/empty-state';
import { ComponentErrorBoundary } from '@/components/ui/error-boundary';
import { useFilterStore } from '@/stores/filter.store';
import { FilterType } from '@/types/enums';
import type { Filter, FilterOption, SearchResults } from '@/types/filter';
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

function ProductSearchClientInner({ initialFilters, securityToken }: ProductSearchClientProps) {
  const { keyword, filters, pageIndex, pageSize } = useFilterStore();
  const t = useTranslations('common');

  // Check if there's a search query (keyword or filters)
  const hasSearchQuery = Boolean(keyword?.trim()) || Object.keys(filters).length > 0;

  const { data, isLoading, error } = useQuery<SearchResults>({
    queryKey: ['products', 'search', keyword, filters, pageIndex, pageSize, securityToken],
    queryFn: async () => {
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Add security token to Authorization header instead of request body
      if (securityToken) {
        headers.Authorization = `Bearer ${securityToken}`;
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          keyword: keyword || undefined,
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          page: pageIndex,
          pageSize,
        }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      return (await response.json()) as SearchResults;
    },
    enabled: hasSearchQuery, // Only fetch when there's a search query
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Filter initialFilters op basis van filters uit SearchResult
  // Alleen filters tonen die voorkomen in SearchResult, en alleen de opties waarvan de id voorkomt
  const displayFilters = useMemo(() => {
    // Als er geen search query is of geen filters in SearchResult
    if (!hasSearchQuery || !data?.filters || data.filters.length === 0) {
      // Standaard: toon alleen niet-Range filters uit initialFilters
      const baseFilters = initialFilters.filter((f) => f.type !== FilterType.RANGE);

      // Als er toch Range filters in SearchResult zitten, voeg die toe
      if (data?.filters && data.filters.length > 0) {
        const searchResultRangeFilters = data.filters.filter((f) => f.type === FilterType.RANGE);
        if (searchResultRangeFilters.length > 0) {
          return [...searchResultRangeFilters, ...baseFilters];
        }
      }

      // Geen Range filters uit SearchResult -> geen Voedingswaarden slider tonen
      return baseFilters;
    }

    // Maak een Map van SearchResult filters voor snelle lookup op key
    const searchResultFiltersMap = new Map<string, Filter>();
    for (const filter of data.filters) {
      if (filter.key) {
        searchResultFiltersMap.set(filter.key, filter);
      }
    }

    // Maak Maps van option data per filter key voor snelle lookup (inclusief count)
    const searchResultOptionsMap = new Map<string, Map<string | number, FilterOption>>();
    for (const filter of data.filters) {
      if (filter.key && filter.options) {
        const optionMap = new Map<string | number, FilterOption>();
        for (const opt of filter.options) {
          optionMap.set(opt.id, opt);
        }
        searchResultOptionsMap.set(filter.key, optionMap);
      }
    }

    // Haal alle Range filters uit SearchResult (voedingswaardes)
    const searchResultRangeFilters = data.filters.filter((f) => f.type === FilterType.RANGE);

    // Filter initialFilters: alleen filters die voorkomen in SearchResult
    // En gebruik de counts uit SearchResult
    const filteredInitialFilters = initialFilters
      .filter((filter) => {
        // Range filters worden apart behandeld, skip ze hier
        if (filter.type === FilterType.RANGE) {
          return false;
        }
        // Andere filters: alleen tonen als ze voorkomen in SearchResult op basis van key
        return searchResultFiltersMap.has(filter.key);
      })
      .map((filter) => {
        // Haal de SearchResult filter op voor deze key
        const searchResultFilter = searchResultFiltersMap.get(filter.key);
        const searchResultOptions = searchResultOptionsMap.get(filter.key);

        // Voor filters met options
        if (!searchResultFilter || !searchResultOptions || !filter.options) {
          return filter;
        }

        // Maak een Map van alle opties uit SearchResult voor snelle lookup
        const searchResultOptionsById = new Map<string | number, FilterOption>();
        if (searchResultFilter.options) {
          for (const opt of searchResultFilter.options) {
            searchResultOptionsById.set(opt.id, opt);
          }
        }

        // Filter alleen de opties waarvan de id voorkomt in SearchResult
        // En gebruik de count uit SearchResult als die beschikbaar is
        const filteredOptions = filter.options
          .filter((option) => searchResultOptions.has(option.id))
          .map((option) => {
            const searchResultOption = searchResultOptionsById.get(option.id);
            // Gebruik count uit SearchResult als die beschikbaar is, anders behoud de originele count
            // Prioriteit: SearchResult count > originele count
            const count =
              searchResultOption?.count !== undefined && searchResultOption?.count !== null
                ? searchResultOption.count
                : option.count;

            return {
              ...option,
              count,
            };
          });

        return {
          ...filter,
          options: filteredOptions,
        };
      })
      .filter((filter) => {
        // Voor andere filters: verwijder filters zonder opties (na filtering)
        return filter.options && filter.options.length > 0;
      });

    // Combineer: Range filters uit SearchResult + gefilterde initialFilters
    return [...searchResultRangeFilters, ...filteredInitialFilters];
  }, [initialFilters, data?.filters, hasSearchQuery]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filter Sidebar */}
      <aside className="lg:col-span-1">
        <div className="lg:sticky lg:top-4">
          <FilterSidebar filters={displayFilters} />
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

        {/* Initial State - No search query */}
        {!hasSearchQuery && (
          <EmptyState
            title={t('emptyState.startSearching')}
            description={t('emptyState.startSearchingDescription')}
          />
        )}

        {/* Loading State */}
        {hasSearchQuery && isLoading && <ProductGridSkeleton count={pageSize} />}

        {/* Product Grid */}
        {hasSearchQuery && !isLoading && data?.products && data.products.length > 0 && (
          <>
            <ProductGrid products={data.products} />
            <Pagination pagination={data.pagination} />
          </>
        )}

        {/* Empty State - No results found */}
        {hasSearchQuery && !isLoading && data?.products && data.products.length === 0 && (
          <EmptyState
            title={t('emptyState.noResults')}
            description={t('emptyState.noResultsDescription')}
          />
        )}
      </main>
    </div>
  );
}

/**
 * ProductSearchClient with Error Boundary
 * Catches and handles errors gracefully without crashing the entire page
 */
export function ProductSearchClient(props: ProductSearchClientProps) {
  return (
    <ComponentErrorBoundary componentName="Producten zoeken">
      <ProductSearchClientInner {...props} />
    </ComponentErrorBoundary>
  );
}
