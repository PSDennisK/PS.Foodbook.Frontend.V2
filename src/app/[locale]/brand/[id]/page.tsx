import { BrandHeader } from '@/components/brand/brand-header';
import { ProductGrid } from '@/components/search/product-grid';
import { ProductGridSkeleton } from '@/components/search/product-grid-skeleton';
import { brandService } from '@/lib/api/brand.service';
import { productService } from '@/lib/api/product.service';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const brand = await brandService.getById(id);

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

  const [brand, searchResults] = await Promise.all([
    brandService.getById(id),
    productService.search({ filters: { brand: id } }),
  ]);

  if (!brand) {
    notFound();
  }

  const products = searchResults?.products || [];

  return (
    <div className="container mx-auto py-8 px-4">
      <BrandHeader brand={brand} locale={locale as Culture} />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Producten ({products.length})</h2>
        </div>

        {products.length > 0 ? (
          <ProductGrid products={products} />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">Geen producten gevonden voor dit merk</p>
          </div>
        )}
      </div>
    </div>
  );
}
