import { ProductAllergens } from '@/components/product/product-allergens';
import { ProductImage } from '@/components/product/product-image';
import { ProductInfo } from '@/components/product/product-info';
import { ProductIngredients } from '@/components/product/product-ingredients';
import { ProductNutrients } from '@/components/product/product-nutrients';
import { Card } from '@/components/ui/card';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';
import { DownloadPdfButton } from './download-pdf-button';
import { ShareButton } from './share-button';

interface ProductSheetProps {
  product: Product;
  locale: Culture;
}

export function ProductSheet({ product, locale }: ProductSheetProps) {
  const productId = product.product.summary.id;
  const productName = getTranslation(product.product.summary.name, locale);

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Productsheet</h1>
        <div className="flex gap-2">
          <ShareButton productId={productId} productName={productName} />
          <DownloadPdfButton productId={productId} productName={productName} locale={locale} />
        </div>
      </div>

      {/* Product Image and Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductImage product={product} />
        <ProductInfo product={product} locale={locale} />
      </div>

      {/* Product Details Sections */}
      <div className="space-y-6">
        {/* Allergens */}
        {product.product.specificationinfolist?.specificationinfo?.allergenset?.allergen && (
          <ProductAllergens product={product} locale={locale} />
        )}

        {/* Nutrients */}
        {product.product.specificationinfolist?.specificationinfo?.nutrientset?.nutrient && (
          <ProductNutrients product={product} locale={locale} />
        )}

        {/* Ingredients */}
        {product.product.specificationinfolist?.specificationinfo?.ingredientset?.ingredient && (
          <ProductIngredients product={product} locale={locale} />
        )}
      </div>

      {/* Footer */}
      <Card className="mt-8 p-4 bg-muted">
        <p className="text-sm text-muted-foreground text-center">
          Deze productsheet is automatisch gegenereerd door PS Foodbook. De informatie kan per
          partij variëren.
        </p>
      </Card>
    </div>
  );
}
