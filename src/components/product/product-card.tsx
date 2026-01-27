import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { createSlug } from '@/lib/utils/helpers';
import { getLocalizedPath } from '@/lib/utils/url';
import type { Culture } from '@/types/enums';
import type { SearchProduct } from '@/types/filter';
import Image from 'next/image';

interface ProductCardProps {
  product: SearchProduct;
  locale: Culture;
}

const NO_IMAGE = '/images/no-image.png';

export function ProductCard({ product, locale }: ProductCardProps) {
  const name = product.name;
  const slug = createSlug(String(product.id), name);
  const url = getLocalizedPath(locale, `/product/${slug}`);
  const imageUrl = product.image || NO_IMAGE;

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
      <Link href={url} className="block">
        <div className="relative aspect-square bg-gray-100">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-1">{name}</h3>
          {product.brand && (
            <p className="text-sm text-muted-foreground line-clamp-1">{product.brand}</p>
          )}
          {product.gtin && (
            <p className="text-xs text-muted-foreground mt-2">EAN: {product.gtin}</p>
          )}
        </div>
      </Link>
    </Card>
  );
}
