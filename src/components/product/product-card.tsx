import Image from 'next/image';

import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { createSlug } from '@/lib/utils/helpers';
import { getLocalizedPath } from '@/lib/utils/url';
import type { Culture } from '@/types/enums';
import type { SearchProduct } from '@/types/filter';

interface ProductCardProps {
  product: SearchProduct;
  locale: Culture;
  priority?: boolean;
}

const NO_IMAGE = '/images/no-image.png';

export function ProductCard({ product, locale, priority = false }: ProductCardProps) {
  const name = product.name;
  const slug = createSlug(String(product.id), name);
  const url = getLocalizedPath(locale, `/product/${slug}`);
  const imageUrl = product.image || NO_IMAGE;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
      <Link
        href={url}
        className="block focus:outline-none"
        aria-label={`View details for ${name}${product.brand ? ` by ${product.brand}` : ''}`}
      >
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={`Product image of ${name}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-1">{name}</h3>
          {product.brand && (
            <p
              className="text-sm text-muted-foreground line-clamp-1"
              aria-label={`Brand: ${product.brand}`}
            >
              {product.brand}
            </p>
          )}
          {product.gtin && (
            <p
              className="text-xs text-muted-foreground mt-2"
              aria-label={`EAN code: ${product.gtin}`}
            >
              EAN: {product.gtin}
            </p>
          )}
        </div>
      </Link>
    </Card>
  );
}
