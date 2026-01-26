import type { Product } from '@/types/product';
import { normalizeToArray } from './helpers';

const NO_IMAGE = '/images/no-image.png';

export function getProductImage(product: Product, size: 'small' | 'large' = 'small'): string {
  const assetinfo = product.product?.logisticinfolist?.logisticinfo?.assetinfolist?.assetinfo;

  if (!assetinfo) return NO_IMAGE;

  const assets = normalizeToArray(assetinfo);
  const heroImage = assets.find((a) => a.isheroimage === 'true') || assets[0];

  if (!heroImage) return NO_IMAGE;

  if (size === 'large') {
    return heroImage.highresolutionimage?.downloadurl || heroImage.downloadurl || NO_IMAGE;
  }

  return heroImage.lowresolutionimage?.downloadurl || heroImage.downloadurl || NO_IMAGE;
}

export function getOptimizedImageUrl(url: string, width: number): string {
  if (!url || url === NO_IMAGE) return NO_IMAGE;

  // Next.js Image optimization
  return `/_next/image?url=${encodeURIComponent(url)}&w=${width}&q=75`;
}
