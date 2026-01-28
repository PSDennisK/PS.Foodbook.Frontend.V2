import { Culture } from '@/types/enums';
import type { Product } from '@/types/product';
import { createSlug } from './helpers';

export function getHomeUrl(locale: Culture): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const localePath = locale === Culture.NL ? '' : `/${locale.split('-')[0]}`;

  return `${baseUrl}${localePath}`;
}

export function getLocalizedPath(locale: Culture, path: string): string {
  const localePrefix = locale === Culture.NL ? '' : `/${locale.split('-')[0]}`;
  return `${localePrefix}${path}`;
}

export function buildProductUrl(product: Product, locale: Culture): string {
  const id = product.product.summary.id;
  const name = product.product.summary.name.value;
  const slug = createSlug(id, name);

  return getLocalizedPath(locale, `/product/${slug}`);
}

export function buildProductSheetUrl(id: string, name: string): string {
  const slug = createSlug(id, name);
  return `/productsheet/${slug}`;
}

export function buildBrandUrl(brandId: string, brandName: string, locale: Culture): string {
  const slug = createSlug(brandId, brandName);
  return getLocalizedPath(locale, `/brand/${slug}`);
}
