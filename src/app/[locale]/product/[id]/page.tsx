import { ProductDetail } from '@/components/product/product-detail';
import { ProductDetailSkeleton } from '@/components/product/product-detail-skeleton';
import { productService } from '@/lib/api/product.service';
import { extractIdFromSlug } from '@/lib/utils/helpers';
import { getTranslation } from '@/lib/utils/translation';
import type { Culture } from '@/types/enums';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, locale } = await params;
  const productId = extractIdFromSlug(id);
  const product = await productService.getById(productId);

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

export default async function ProductDetailPage({ params }: Props) {
  const { id, locale } = await params;
  const productId = extractIdFromSlug(id);
  const product = await productService.getById(productId);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetail product={product} locale={locale as Culture} />
    </Suspense>
  );
}
