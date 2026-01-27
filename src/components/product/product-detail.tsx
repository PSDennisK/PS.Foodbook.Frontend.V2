import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Culture } from '@/types/enums';
import type { Product } from '@/types/product';
import { ProductAllergens } from './product-allergens';
import { ProductDocuments } from './product-documents';
import { ProductImage } from './product-image';
import { ProductInfo } from './product-info';
import { ProductIngredients } from './product-ingredients';
import { ProductLogistics } from './product-logistics';
import { ProductNutrients } from './product-nutrients';

interface ProductDetailProps {
  product: Product;
  locale: Culture;
}

export function ProductDetail({ product, locale }: ProductDetailProps) {
  // Check if different sections have data
  const hasAllergens =
    product.product.specificationinfolist?.specificationinfo?.allergenset?.allergen;
  const hasNutrients =
    product.product.specificationinfolist?.specificationinfo?.nutrientset?.nutrient;
  const hasIngredients =
    product.product.specificationinfolist?.specificationinfo?.ingredientset?.ingredient;
  const hasLogistics = product.product.logisticinfolist?.logisticinfo;
  const hasDocuments = product.product.logisticinfolist?.logisticinfo?.assetinfolist?.assetinfo;

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ProductImage product={product} />
        <ProductInfo product={product} locale={locale} />
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="allergens" className="mt-8">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          {hasAllergens && <TabsTrigger value="allergens">Allergenen</TabsTrigger>}
          {hasNutrients && <TabsTrigger value="nutrients">Voedingswaarden</TabsTrigger>}
          {hasIngredients && <TabsTrigger value="ingredients">Ingrediënten</TabsTrigger>}
          {hasLogistics && <TabsTrigger value="logistics">Logistiek</TabsTrigger>}
          {hasDocuments && <TabsTrigger value="documents">Documenten</TabsTrigger>}
        </TabsList>

        {hasAllergens && (
          <TabsContent value="allergens">
            <ProductAllergens product={product} locale={locale} />
          </TabsContent>
        )}

        {hasNutrients && (
          <TabsContent value="nutrients">
            <ProductNutrients product={product} locale={locale} />
          </TabsContent>
        )}

        {hasIngredients && (
          <TabsContent value="ingredients">
            <ProductIngredients product={product} locale={locale} />
          </TabsContent>
        )}

        {hasLogistics && (
          <TabsContent value="logistics">
            <ProductLogistics product={product} locale={locale} />
          </TabsContent>
        )}

        {hasDocuments && (
          <TabsContent value="documents">
            <ProductDocuments product={product} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
