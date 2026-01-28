import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

import { BrandHeader } from '@/components/brand/brand-header';
import { BrandProductSearchClient } from '@/components/brand/brand-product-search-client';
import { ProductGridSkeleton } from '@/components/search/product-grid-skeleton';
import { brandService } from '@/lib/api/brand.service';
import { productService } from '@/lib/api/product.service';
import { extractIdFromSlug } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Filter } from '@/types/filter';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

// Zorg dat we altijd dynamisch renderen (zoals bij de product-zoekpagina)
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const numericId = extractIdFromSlug(id);
  const brand = await brandService.getById(numericId);

  if (!brand) {
    return {
      title: 'Merk niet gevonden',
    };
  }

  const name = getTranslation(brand.name, locale as Culture);

  return {
    title: `${name} - Merken`,
    description: getTranslation(brand.description, locale as Culture) || `Producten van ${name}`,
  };
}

export default async function BrandDetailPage({ params }: Props) {
  const { id, locale } = await params;

  const numericId = extractIdFromSlug(id);

  const [brand, filters] = await Promise.all([
    brandService.getById(numericId),
    productService.getFilters().catch((error): Filter[] => {
      console.error('Failed to load filters:', error);
      return [];
    }),
  ]);

  if (!brand) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <BrandHeader brand={brand} locale={locale as Culture} />

      <div className="mt-8">
        <Suspense fallback={<ProductGridSkeleton />}>
          <BrandProductSearchClient initialFilters={filters} brandId={numericId} />
        </Suspense>
      </div>
    </div>
  );
}
