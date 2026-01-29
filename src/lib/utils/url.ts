import { Culture } from "@/types/enums";
import type { Product } from "@/types/product";
import { createSlug } from "./helpers";

function getLocalePrefix(locale: Culture | string | undefined): string {
    if (!locale) return "";
    // Ondersteun zowel 'nl', 'en' als 'nl-NL', 'en-US', etc.
    const value =
        typeof locale === "string"
            ? locale
            : (locale as Culture | string).toString();
    const short = value.split("-")[0];
    return short === "nl" ? "" : `/${short}`;
}

export function getHomeUrl(locale: Culture | string): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const localePath = getLocalePrefix(locale);

    return `${baseUrl}${localePath}`;
}

export function getLocalizedPath(
    locale: Culture | string,
    path: string,
): string {
    const localePrefix = getLocalePrefix(locale);
    return `${localePrefix}${path}`;
}

export function buildProductUrl(product: Product, locale: Culture): string {
    const id = product.product.summary.id;
    const name = product.product.summary.name.value;
    const slug = createSlug(id, name);

    // Laat locale-aware routing (next-intl Link) de locale prefix afhandelen
    return `/product/${slug}`;
}

export function buildProductSheetUrl(id: string, name: string): string {
    const slug = createSlug(id, name);
    // Locale prefix wordt afgehandeld door routing/middleware
    return `/productsheet/${slug}`;
}

export function buildBrandUrl(brandId: string, brandName: string): string {
    const slug = createSlug(brandId, brandName);
    // Locale prefix wordt afgehandeld door routing/middleware
    return `/brand/${slug}`;
}