'use client';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import type { BrandAll } from '@/lib/api/brand.service';
import { useFilterStore } from '@/stores/filter.store';
import { FilterType } from '@/types/enums';
import type { Filter, FilterValue, SearchResults } from '@/types/filter';
import { useQuery } from '@tanstack/react-query';

interface FilterSidebarProps {
  filters: Filter[];
}

export function FilterSidebar({ filters }: FilterSidebarProps) {
  const { filters: activeFilters, clearFilters } = useFilterStore();
  const activeFilterCount = Object.keys(activeFilters).length;

  const uniqueFilters = useMemo(() => {
    const seen = new Set<string>();
    return filters.filter((filter) => {
      // Skip filters zonder key
      if (!filter.key) {
        return false;
      }

      // Verberg filters zonder opties (bijv. ProductGroepen zonder waarden)
      if (
        (filter.type === FilterType.CHECKBOX || filter.type === FilterType.SELECT) &&
        (!filter.options || filter.options.length === 0)
      ) {
        return false;
      }

      if (seen.has(filter.key)) {
        return false;
      }
      seen.add(filter.key);
      return true;
    });
  }, [filters]);

  return (
    // biome-ignore lint/a11y/useSemanticElements: Region role is appropriate for filter sidebar landmark
    <aside className="space-y-6" aria-label="Product filters" role="region">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-lg" id="filter-heading">
          Filters
        </h2>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            aria-label={`Wis alle filters (${activeFilterCount} actief)`}
          >
            <X className="h-4 w-4 mr-1" aria-hidden="true" />
            Wis alles ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* biome-ignore lint/a11y/useSemanticElements: Group role is appropriate for filter collection */}
      <div className="space-y-4" role="group" aria-labelledby="filter-heading">
        {/* Brand Filter - bovenaan */}
        <BrandFilter />

        {/* Overige filters (exclusief Range filters die voedingswaardes zijn en Brand filter) */}
        {uniqueFilters
          .filter(
            (filter) =>
              filter.type !== FilterType.RANGE && filter.key !== 'Brand' && filter.key !== 'brand'
          )
          .map((filter, index) => (
            <FilterSection key={filter.key || `filter-${index}`} filter={filter} />
          ))}

        {/* Voedingswaarden Filter - helemaal onderaan */}
        <VoedingswaardenFilter filters={filters} />
      </div>
    </aside>
  );
}

interface FilterSectionProps {
  filter: Filter;
}

function FilterSection({ filter }: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { filters: activeFilters } = useFilterStore();
  const activeValue = activeFilters[filter.key];

  return (
    <div className="border-b pb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        aria-expanded={isExpanded}
        aria-controls={`filter-${filter.key}`}
        id={`filter-${filter.key}-button`}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <span className="font-medium text-sm">{filter.label}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div
          className="space-y-2"
          id={`filter-${filter.key}`}
          // biome-ignore lint/a11y/useSemanticElements: Region role is appropriate for expandable filter section
          role="region"
          aria-labelledby={`filter-${filter.key}-button`}
        >
          {filter.type === FilterType.CHECKBOX && (
            <CheckboxFilter filter={filter} activeValue={activeValue} />
          )}
          {filter.type === FilterType.RANGE && (
            <RangeFilter filter={filter} activeValue={activeValue} />
          )}
          {filter.type === FilterType.SELECT && (
            <SelectFilter filter={filter} activeValue={activeValue} />
          )}
        </div>
      )}
    </div>
  );
}

interface FilterComponentProps {
  filter: Filter;
  activeValue: FilterValue | undefined;
}

function CheckboxFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const [showAll, setShowAll] = useState(false);
  const selectedValues = Array.isArray(activeValue) ? activeValue.map(String) : [];

  // Sorteer options op count (hoog naar laag), dan op label
  const sortedOptions = useMemo(() => {
    if (!filter.options) return [];
    return [...filter.options].sort((a, b) => {
      const countA = a.count ?? 0;
      const countB = b.count ?? 0;
      if (countB !== countA) {
        return countB - countA; // Hoog naar laag
      }
      return String(a.label).localeCompare(String(b.label));
    });
  }, [filter.options]);

  // Toon alleen eerste 5 standaard, tenzij showAll true is
  const displayedOptions = showAll ? sortedOptions : sortedOptions.slice(0, 5);
  const hasMoreOptions = sortedOptions.length > 5;

  const handleToggle = (optionId: string | number) => {
    const currentValues = [...selectedValues];
    const stringId = String(optionId);

    if (currentValues.includes(stringId)) {
      const newValues = currentValues.filter((v) => v !== stringId);
      if (newValues.length === 0) {
        removeFilter(filter.key);
      } else {
        addFilter(filter.key, newValues as FilterValue);
      }
    } else {
      addFilter(filter.key, [...currentValues, stringId] as FilterValue);
    }
  };

  return (
    <div className="space-y-2">
      <div className="max-h-60 overflow-y-auto">
        {displayedOptions.map((option) => {
          const isChecked = selectedValues.includes(String(option.id));
          return (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={`${filter.key}-${option.id}`}
                checked={isChecked}
                onCheckedChange={() => handleToggle(option.id)}
              />
              <Label
                htmlFor={`${filter.key}-${option.id}`}
                className="text-sm cursor-pointer flex-1"
              >
                {option.label}
                {option.count !== undefined && option.count !== null && (
                  <span className="text-muted-foreground ml-1">({option.count})</span>
                )}
              </Label>
            </div>
          );
        })}
      </div>
      {hasMoreOptions && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {showAll ? 'Toon minder' : `Toon meer (${sortedOptions.length - 5} meer)`}
        </Button>
      )}
    </div>
  );
}

function RangeFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const min = filter.min ?? 0;
  const max = filter.max ?? 100;

  const currentRange =
    activeValue && typeof activeValue === 'object' && 'min' in activeValue && 'max' in activeValue
      ? { min: activeValue.min, max: activeValue.max }
      : { min, max };

  const handleChange = (values: number[]) => {
    const [newMin = min, newMax = max] = values;
    if (newMin === min && newMax === max) {
      removeFilter(filter.key);
    } else {
      addFilter(filter.key, { min: newMin, max: newMax } as FilterValue);
    }
  };

  const handleReset = () => {
    removeFilter(filter.key);
  };

  return (
    <div className="space-y-4 px-2">
      <Slider
        min={min}
        max={max}
        step={1}
        value={[currentRange.min, currentRange.max]}
        onValueChange={handleChange}
        aria-label={`${filter.label} bereik`}
      />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground" aria-live="polite">
          {currentRange.min} - {currentRange.max}
        </span>
        {(currentRange.min !== min || currentRange.max !== max) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            aria-label={`Reset ${filter.label} filter`}
          >
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}

function SelectFilter({ filter, activeValue }: FilterComponentProps) {
  const { addFilter, removeFilter } = useFilterStore();
  const [showAll, setShowAll] = useState(false);
  const selectedValue: string | undefined =
    typeof activeValue === 'string' ? activeValue : undefined;

  // Sorteer options op count (hoog naar laag), dan op label
  const sortedOptions = useMemo(() => {
    if (!filter.options) return [];
    return [...filter.options].sort((a, b) => {
      const countA = a.count ?? 0;
      const countB = b.count ?? 0;
      if (countB !== countA) {
        return countB - countA; // Hoog naar laag
      }
      return String(a.label).localeCompare(String(b.label));
    });
  }, [filter.options]);

  // Toon alleen eerste 5 standaard, tenzij showAll true is
  const displayedOptions = showAll ? sortedOptions : sortedOptions.slice(0, 5);
  const hasMoreOptions = sortedOptions.length > 5;

  const handleSelect = (optionId: string | number) => {
    const stringId = String(optionId);
    if (selectedValue === stringId) {
      removeFilter(filter.key);
    } else {
      addFilter(filter.key, stringId);
    }
  };

  return (
    <div className="space-y-1" role="radiogroup" aria-label={filter.label}>
      {displayedOptions.map((option) => {
        const isSelected = selectedValue === String(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => handleSelect(option.id)}
            className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
              isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
            }`}
            // biome-ignore lint/a11y/useSemanticElements: Radio role is appropriate for custom radio button in radiogroup
            role="radio"
            aria-checked={isSelected}
            aria-label={`${option.label}${option.count !== undefined ? ` (${option.count} producten)` : ''}`}
          >
            {option.label}
            {option.count !== undefined && option.count !== null && (
              <span
                className={isSelected ? 'opacity-80 ml-1' : 'text-muted-foreground ml-1'}
                aria-hidden="true"
              >
                ({option.count})
              </span>
            )}
          </button>
        );
      })}
      {hasMoreOptions && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAll(!showAll)}
          className="w-full text-sm text-muted-foreground hover:text-foreground mt-2"
        >
          {showAll ? 'Toon minder' : `Toon meer (${sortedOptions.length - 5} meer)`}
        </Button>
      )}
    </div>
  );
}

function VoedingswaardenFilter({ filters }: { filters: Filter[] }) {
  const { filters: activeFilters } = useFilterStore();

  // Filter alle Range filters (voedingswaardes)
  const voedingswaardenFilters = useMemo(() => {
    return filters.filter((filter) => filter.type === FilterType.RANGE);
  }, [filters]);

  // Als er geen voedingswaardes zijn, toon niets
  if (voedingswaardenFilters.length === 0) {
    return null;
  }

  return (
    <div className="border-b pb-4">
      <h3 className="font-medium text-sm mb-4">Voedingswaarden</h3>
      <div className="space-y-6">
        {voedingswaardenFilters.map((filter) => {
          const activeValue = activeFilters[filter.key];
          return (
            <div key={filter.key} className="space-y-2">
              <div className="text-sm font-medium block">{filter.label}</div>
              <RangeFilter filter={filter} activeValue={activeValue} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BrandFilter() {
  const {
    filters: activeFilters,
    addFilter,
    removeFilter,
    keyword,
    pageIndex,
    pageSize,
  } = useFilterStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  // Haal alle brands op via API route
  const { data: brands = [], isLoading } = useQuery<BrandAll[]>({
    queryKey: ['brands', 'all'],
    queryFn: async () => {
      const response = await fetch('/api/brands');
      if (!response.ok) {
        throw new Error('Failed to fetch brands');
      }
      return (await response.json()) as BrandAll[];
    },
    staleTime: 10 * 60 * 1000, // 10 minuten cache
  });

  // Haal SearchResult op om counts te krijgen voor brands
  const hasSearchQuery = Boolean(keyword?.trim()) || Object.keys(activeFilters).length > 0;
  const { data: searchResults } = useQuery<SearchResults>({
    queryKey: ['products', 'search', keyword, activeFilters, pageIndex, pageSize],
    queryFn: async () => {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: keyword || undefined,
          filters: Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
          page: pageIndex,
          pageSize,
        }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      return (await response.json()) as SearchResults;
    },
    enabled: hasSearchQuery,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Maak een Map van brand ID naar count uit SearchResult
  // En een Set van beschikbare brand IDs (alleen deze moeten worden getoond)
  const { brandCountsMap, availableBrandIds } = useMemo(() => {
    const countsMap = new Map<number, number>();
    const availableIds = new Set<number>();

    if (searchResults?.filters) {
      // Zoek brand filter (kan key 'Brand' of 'brand' zijn)
      const brandFilter = searchResults.filters.find((f) => f.key === 'Brand' || f.key === 'brand');

      if (brandFilter?.options) {
        // Filter heeft options array (nieuwe structuur)
        for (const option of brandFilter.options) {
          const brandId =
            typeof option.id === 'number' ? option.id : Number.parseInt(String(option.id), 10);
          if (!Number.isNaN(brandId)) {
            availableIds.add(brandId);
            if (option.count !== undefined && option.count !== null) {
              countsMap.set(brandId, option.count);
            }
          }
        }
      }
    }

    return { brandCountsMap: countsMap, availableBrandIds: availableIds };
  }, [searchResults]);

  // Filter brands op basis van zoekquery EN beschikbare brands uit SearchResult
  const filteredBrands = useMemo(() => {
    // Zorg ervoor dat brands altijd een array is
    if (!Array.isArray(brands)) {
      return [];
    }

    let result = brands;

    // Als er SearchResult filters zijn met brands, toon alleen die brands
    if (hasSearchQuery && availableBrandIds.size > 0) {
      result = brands.filter((brand) => {
        // Brand moet minstens één ID hebben die voorkomt in SearchResult
        return brand.id.some((id) => availableBrandIds.has(id));
      });
    }

    // Filter op zoekquery
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((brand) => {
        const brandName = brand.name.toLowerCase();
        return brandName.includes(query);
      });
    }

    return result;
  }, [brands, searchQuery, hasSearchQuery, availableBrandIds]);

  // Haal actieve brand filters op (alleen IDs)
  const selectedBrandIds = Array.isArray(activeFilters.brand)
    ? new Set(activeFilters.brand.map(String))
    : activeFilters.brand
      ? new Set([String(activeFilters.brand)])
      : new Set<string>();

  // Check of een brand geselecteerd is (als een van de IDs in de selectedBrandIds zit)
  const isBrandSelected = (brand: BrandAll): boolean => {
    return brand.id.some((id) => selectedBrandIds.has(String(id)));
  };

  const handleToggle = (brand: BrandAll) => {
    const brandIds = brand.id.map(String);
    const currentSelectedIds = new Set(selectedBrandIds);
    const isSelected = isBrandSelected(brand);

    if (isSelected) {
      // Verwijder alle IDs van dit brand
      for (const id of brandIds) {
        currentSelectedIds.delete(id);
      }
    } else {
      // Voeg alle IDs van dit brand toe
      for (const id of brandIds) {
        currentSelectedIds.add(id);
      }
    }

    const newValues = Array.from(currentSelectedIds);
    if (newValues.length === 0) {
      removeFilter('brand');
    } else {
      addFilter('brand', newValues as FilterValue);
    }
  };

  return (
    <div className="border-b pb-4">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full mb-3 hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
        aria-expanded={isExpanded}
        aria-controls="filter-brand"
        id="filter-brand-button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
      >
        <span className="font-medium text-sm">Merk</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        ) : (
          <ChevronDown className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <section className="space-y-3" id="filter-brand" aria-labelledby="filter-brand-button">
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Laden...</div>
          ) : (
            <>
              {/* Zoekveld */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Zoek merk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  aria-label="Zoek in merken"
                />
              </div>

              {/* Scrollbare brand lijst */}
              <div className="max-h-56 overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-muted-foreground/30">
                <div className="space-y-2">
                  {filteredBrands.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      {searchQuery ? 'Geen merken gevonden' : 'Geen merken beschikbaar'}
                    </div>
                  ) : (
                    filteredBrands.map((brand) => {
                      // Gebruik eerste ID als key (of naam als fallback)
                      const brandKey = brand.id[0]?.toString() || brand.name;
                      const brandName = brand.name;
                      const isChecked = isBrandSelected(brand);

                      // Haal count op voor dit brand (gebruik eerste ID als lookup)
                      // Als brand meerdere IDs heeft, tel de counts op
                      const brandCount = brand.id.reduce((total, id) => {
                        const count = brandCountsMap.get(id);
                        return total + (count ?? 0);
                      }, 0);

                      return (
                        <div key={brandKey} className="flex items-center space-x-2">
                          <Checkbox
                            id={`brand-${brandKey}`}
                            checked={isChecked}
                            onCheckedChange={() => handleToggle(brand)}
                          />
                          <Label
                            htmlFor={`brand-${brandKey}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {brandName}
                            {brandCount > 0 && (
                              <span className="text-muted-foreground ml-1">({brandCount})</span>
                            )}
                          </Label>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
