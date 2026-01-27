import { ProductDetail } from '@/components/product/product-detail';
import { productService } from '@/lib/api/product.service';
import { extractIdFromSlug } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ guid: string; id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { guid, id, locale } = await params;
  const productId = extractIdFromSlug(id);
  const product = await productService.getById(productId, guid);

  if (!product) {
    return {
      title: 'Product niet gevonden',
    };
  }

  const name = getTranslation(product.product.summary.name, locale as Culture);
  const brandName = product.product.summary.brandname;

  return {
    title: `${name} - ${brandName}`,
    description: `Product informatie voor ${name} van ${brandName}`,
  };
}

export default async function CatalogProductPage({ params }: Props) {
  const { guid, id, locale } = await params;
  const productId = extractIdFromSlug(id);
  const product = await productService.getById(productId, guid);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} locale={locale as Culture} />;
}
