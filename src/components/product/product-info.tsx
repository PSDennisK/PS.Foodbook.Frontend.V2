import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { formatDate } from '@/lib/utils/date';
import { getTranslation } from '@/lib/utils/translation';
import { buildBrandUrl, buildProductSheetUrl } from '@/lib/utils/url';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';

interface ProductInfoProps {
  product: Product;
  locale: Culture;
}

export function ProductInfo({ product, locale }: ProductInfoProps) {
  const { summary } = product.product;
  const name = getTranslation(summary.name, locale);
  const brandName = summary.brandname;
  const brandId = summary.brandid;
  const ean = summary.ean;
  const lastUpdated = summary.lastupdatedon;
  const isPublic = summary.publiclyvisible === 'true' || summary.publiclyvisible === '1';

  return (
    <div className="space-y-6">
      {/* Product Name & Brand */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-3xl font-bold">{name}</h1>
          <Badge variant={isPublic ? 'default' : 'secondary'}>
            {isPublic ? 'Publiek' : 'Niet publiek'}
          </Badge>
        </div>
        {brandName &&
          (brandId ? (
            <Link
              href={buildBrandUrl(brandId, brandName, locale)}
              className="text-xl text-primary hover:underline"
            >
              {brandName}
            </Link>
          ) : (
            <p className="text-xl text-muted-foreground">{brandName}</p>
          ))}
      </div>

      {/* Product Details */}
      <Card className="p-4">
        <dl className="space-y-3">
          {ean && (
            <div className="flex justify-between">
              <dt className="font-medium text-sm text-muted-foreground">EAN</dt>
              <dd className="text-sm font-mono">{ean}</dd>
            </div>
          )}

          {summary.id && (
            <div className="flex justify-between">
              <dt className="font-medium text-sm text-muted-foreground">Product ID</dt>
              <dd className="text-sm font-mono">{summary.id}</dd>
            </div>
          )}

          {lastUpdated && (
            <div className="flex justify-between">
              <dt className="font-medium text-sm text-muted-foreground">Laatst bijgewerkt</dt>
              <dd className="text-sm">{formatDate(lastUpdated, locale)}</dd>
            </div>
          )}

          {product.product.hasImpactScore && (
            <div className="flex justify-between">
              <dt className="font-medium text-sm text-muted-foreground">Impact Score</dt>
              <dd className="text-sm">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Beschikbaar
                </Badge>
              </dd>
            </div>
          )}
        </dl>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={buildProductSheetUrl(summary.id, name)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Bekijk productsheet
        </Link>
      </div>
    </div>
  );
}
