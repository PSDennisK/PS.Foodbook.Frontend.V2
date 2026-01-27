'use client';

import { ProductCard } from '@/components/product/product-card';
import type { Culture } from '@/types/enums';
import type { SearchProduct } from '@/types/filter';
import { useLocale } from 'next-intl';

interface ProductGridProps {
  products: SearchProduct[];
}

export function ProductGrid({ products }: ProductGridProps) {
  const locale = useLocale() as Culture;

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground text-lg">Geen producten gevonden</p>
        <p className="text-muted-foreground text-sm mt-2">
          Probeer een andere zoekopdracht of pas de filters aan
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );
}
