# FASE 3: PRODUCT SEARCH & CATALOG - Claude Code Prompt

**Project:** PS.Foodbook.Frontend Modernisering  
**Fase:** 3 - Product Search & Catalog  
**Duur:** 3 weken  
**Doel:** Core product functionaliteit  

---

## CONTEXT

PS.Foodbook.Frontend modernisering - Fase 3: Product Search & Catalog.
Core architectuur en auth zijn compleet. Nu bouwen we de hoofdfunctionaliteit.

## DOEL

Implementeer product search met filters, product detail pagina's, brand pagina's, en autocomplete.
Dit is de kern van de applicatie.

---

## DEEL 1: PRODUCT SEARCH (Week 1)

### 1. SEARCH PAGE COMPONENT

**src/app/[locale]/product/page.tsx:**
```typescript
import { Suspense } from 'next';
import { ProductSearchClient } from '@/components/search/product-search-client';
import { productService } from '@/lib/api/product.service';

export default async function ProductSearchPage() {
  const filters = await productService.getFilters();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Product zoeken</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductSearchClient initialFilters={filters} />
      </Suspense>
    </div>
  );
}
```

### 2. SEARCH CLIENT COMPONENT

**src/components/search/product-search-client.tsx:**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useFilterStore } from '@/stores/filter.store';
import { productService } from '@/lib/api/product.service';
import { ProductGrid } from './product-grid';
import { FilterSidebar } from './filter-sidebar';
import { SearchBar } from './search-bar';
import { Pagination } from './pagination';

export function ProductSearchClient({ initialFilters }: { initialFilters: Filter[] }) {
  const { keyword, filters, pageIndex, pageSize } = useFilterStore();

  const { data, isLoading } = useQuery({
    queryKey: ['products', 'search', keyword, filters, pageIndex],
    queryFn: () => productService.search({ keyword, filters, page: pageIndex, pageSize }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <aside className="lg:col-span-1">
        <FilterSidebar filters={initialFilters} />
      </aside>
      <main className="lg:col-span-3">
        <SearchBar />
        {isLoading ? (
          <ProductGridSkeleton />
        ) : (
          <>
            <ProductGrid products={data?.products || []} />
            <Pagination pagination={data?.pagination} />
          </>
        )}
      </main>
    </div>
  );
}
```

### 3. KEY COMPONENTS

Create in **src/components/search/**:
- search-bar.tsx (input met autocomplete)
- filter-sidebar.tsx (filters met checkboxes/ranges)
- product-grid.tsx (grid met ProductCard)
- product-grid-skeleton.tsx (loading state)
- pagination.tsx (page navigation)

### 4. PRODUCT CARD

**src/components/product/product-card.tsx:**
```typescript
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { getProductImage } from '@/lib/utils/image';
import { buildProductUrl } from '@/lib/utils/url';

export function ProductCard({ product, locale }: Props) {
  const image = getProductImage(product, 'small');
  const url = buildProductUrl(product, locale);
  const name = getTranslation(product.product.summary.name, locale);

  return (
    <Card className="overflow-hidden">
      <Link href={url}>
        <Image 
          src={image} 
          alt={name}
          width={300}
          height={300}
          className="w-full aspect-square object-cover"
        />
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2">{name}</h3>
          <p className="text-sm text-muted-foreground">{product.product.summary.brandname}</p>
        </div>
      </Link>
    </Card>
  );
}
```

---

## DEEL 2: PRODUCT DETAIL (Week 2)

### 1. PRODUCT DETAIL PAGE

**src/app/[locale]/product/[id]/page.tsx:**
```typescript
import { notFound } from 'next/navigation';
import { productService } from '@/lib/api/product.service';
import { ProductDetail } from '@/components/product/product-detail';
import { generateProductMetadata } from '@/lib/utils/metadata';

export async function generateMetadata({ params }: Props) {
  const product = await productService.getById(params.id);
  if (!product) return {};
  
  return generateProductMetadata(product, params.locale);
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await productService.getById(params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} locale={params.locale} />;
}
```

### 2. PRODUCT DETAIL COMPONENT

**src/components/product/product-detail.tsx:**
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductImage } from './product-image';
import { ProductInfo } from './product-info';
import { ProductAllergens } from './product-allergens';
import { ProductNutrients } from './product-nutrients';
import { ProductIngredients } from './product-ingredients';
import { ProductLogistics } from './product-logistics';
import { ProductDocuments } from './product-documents';

export function ProductDetail({ product, locale }: Props) {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductImage product={product} />
        <ProductInfo product={product} locale={locale} />
      </div>

      <Tabs defaultValue="allergens">
        <TabsList>
          <TabsTrigger value="allergens">Allergenen</TabsTrigger>
          <TabsTrigger value="nutrients">Voedingswaarden</TabsTrigger>
          <TabsTrigger value="ingredients">Ingrediënten</TabsTrigger>
          <TabsTrigger value="logistics">Logistiek</TabsTrigger>
          <TabsTrigger value="documents">Documenten</TabsTrigger>
        </TabsList>

        <TabsContent value="allergens">
          <ProductAllergens product={product} locale={locale} />
        </TabsContent>

        <TabsContent value="nutrients">
          <ProductNutrients product={product} locale={locale} />
        </TabsContent>

        <TabsContent value="ingredients">
          <ProductIngredients product={product} locale={locale} />
        </TabsContent>

        <TabsContent value="logistics">
          <ProductLogistics product={product} locale={locale} />
        </TabsContent>

        <TabsContent value="documents">
          <ProductDocuments product={product} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### 3. PRODUCT SUB-COMPONENTS

Create in **src/components/product/**:
- product-image.tsx (image gallery)
- product-info.tsx (name, brand, ean, description)
- product-allergens.tsx (allergenen tabel met kleuren)
- product-nutrients.tsx (voedingswaarden tabel)
- product-ingredients.tsx (ingrediënten lijst)
- product-logistics.tsx (logistieke info)
- product-documents.tsx (document downloads)
- product-impact-score.tsx (CO2 score)

---

## DEEL 3: BRAND PAGES (Week 2)

### 1. BRAND PAGE

**src/app/[locale]/brand/[id]/page.tsx:**
```typescript
import { notFound } from 'next/navigation';
import { brandService, productService } from '@/lib/api';
import { BrandHeader } from '@/components/brand/brand-header';
import { ProductGrid } from '@/components/search/product-grid';

export default async function BrandPage({ params }: Props) {
  const [brand, products] = await Promise.all([
    brandService.getById(params.id),
    productService.search({ filters: { brand: params.id } }),
  ]);

  if (!brand) notFound();

  return (
    <div className="container mx-auto py-8">
      <BrandHeader brand={brand} locale={params.locale} />
      <ProductGrid products={products?.products || []} />
    </div>
  );
}
```

### 2. BRAND COMPONENTS

**src/components/brand/brand-header.tsx:**
```typescript
export function BrandHeader({ brand, locale }: Props) {
  const name = getTranslation(brand.name, locale);
  const description = getTranslation(brand.description, locale);

  return (
    <div className="mb-8">
      {brand.logo && (
        <Image src={brand.logo} alt={name} width={200} height={100} />
      )}
      <h1 className="text-4xl font-bold mt-4">{name}</h1>
      {description && <p className="text-muted-foreground mt-2">{description}</p>}
      {brand.website && (
        <a href={brand.website} className="text-primary hover:underline">
          Website →
        </a>
      )}
    </div>
  );
}
```

---

## DEEL 4: AUTOCOMPLETE (Week 3)

### 1. AUTOCOMPLETE HOOK

**src/hooks/use-autocomplete.ts:**
```typescript
'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/lib/api/product.service';
import { useDebouncedValue } from './use-debounced-value';

export function useAutocomplete(locale: Culture) {
  const [keyword, setKeyword] = useState('');
  const debouncedKeyword = useDebouncedValue(keyword, 300);

  const { data: suggestions = [] } = useQuery({
    queryKey: ['autocomplete', debouncedKeyword, locale],
    queryFn: () => productService.autocomplete(debouncedKeyword, locale),
    enabled: debouncedKeyword.length >= 2,
  });

  return {
    keyword,
    setKeyword,
    suggestions,
  };
}
```

### 2. SEARCH BAR WITH AUTOCOMPLETE

**src/components/search/search-bar.tsx:**
```typescript
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { useAutocomplete } from '@/hooks/use-autocomplete';
import { useFilterStore } from '@/stores/filter.store';

export function SearchBar() {
  const { setKeyword: setStoreKeyword } = useFilterStore();
  const { keyword, setKeyword, suggestions } = useAutocomplete('nl-NL');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (suggestion: string) => {
    setKeyword(suggestion);
    setStoreKeyword(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="relative">
      <Input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        placeholder="Zoek producten..."
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-background border rounded-md mt-1">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              onClick={() => handleSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-accent"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## DEEL 5: FILTERS (Week 3)

### 1. FILTER SIDEBAR

**src/components/search/filter-sidebar.tsx:**
```typescript
'use client';

import { useFilterStore } from '@/stores/filter.store';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';

export function FilterSidebar({ filters }: { filters: Filter[] }) {
  const { filters: activeFilters, addFilter, removeFilter, clearFilters } = useFilterStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Wis alles
        </Button>
      </div>

      {filters.map((filter) => (
        <FilterSection
          key={filter.key}
          filter={filter}
          activeValue={activeFilters[filter.key]}
          onAdd={(value) => addFilter(filter.key, value)}
          onRemove={() => removeFilter(filter.key)}
        />
      ))}
    </div>
  );
}

function FilterSection({ filter, activeValue, onAdd, onRemove }: Props) {
  if (filter.type === 'checkbox') {
    return <CheckboxFilter filter={filter} onAdd={onAdd} />;
  }

  if (filter.type === 'range') {
    return <RangeFilter filter={filter} onAdd={onAdd} />;
  }

  return null;
}
```

---

## OUTPUT

- ✅ Product search met filters
- ✅ Product detail pagina's
- ✅ Brand pagina's
- ✅ Autocomplete
- ✅ Pagination
- ✅ Loading states
- ✅ Responsive design
- ✅ TanStack Query caching

---

## VERIFICATION

```bash
npm run dev

# Test:
1. /product - search page loads
2. Type in search bar - autocomplete appears
3. Click filter - products update
4. Click product - detail page loads
5. Check all tabs - allergens, nutrients, etc.
6. Click brand - brand page loads
7. Test pagination - pages work
8. Mobile responsive - all screens
```

**Volgende stap:** Fase 4 - Digitale Catalogi
