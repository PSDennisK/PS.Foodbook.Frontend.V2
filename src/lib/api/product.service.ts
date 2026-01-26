import { env } from '@/config/env';
import type { Culture } from '@/types/enums';
import type { Filter, SearchParams, SearchResults } from '@/types/filter';
import { type Product, ProductSchema } from '@/types/product';
import { apiFetch } from './base';

const BASE_URL = env.api.foodbook;

export const productService = {
  async getById(id: string, token?: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
    const result = await apiFetch<unknown>(url, { token });

    if (!result.success) {
      return null;
    }

    // Validate with Zod
    const parsed = ProductSchema.safeParse(result.data);
    if (!parsed.success) {
      console.error('Product validation failed:', parsed.error);
      return null;
    }

    return parsed.data;
  },

  async getByEan(gtin: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductByEAN/${gtin}`;
    const result = await apiFetch<unknown>(url);

    if (!result.success) {
      return null;
    }

    const parsed = ProductSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async search(params: SearchParams): Promise<SearchResults | null> {
    const url = `${BASE_URL}/v2/Product/GetSearchResult`;
    const result = await apiFetch<unknown>(url, {
      method: 'POST',
      body: JSON.stringify(params),
    });

    if (!result.success) {
      return null;
    }

    // TODO: Parse with Zod schema
    return result.data as SearchResults;
  },

  async autocomplete(keyword: string, locale: Culture): Promise<string[]> {
    const url = `${BASE_URL}/v2/Product/GetAutocomplete/${locale}/${encodeURIComponent(keyword)}`;
    const result = await apiFetch<string[]>(url);

    return result.success ? result.data : [];
  },

  async getFilters(): Promise<Filter[]> {
    const url = `${BASE_URL}/v2/Product/GetFilters`;
    const result = await apiFetch<Filter[]>(url);

    return result.success ? result.data : [];
  },

  async getImpactScore(mongoId: string, type: 'farm' | 'gate'): Promise<unknown | null> {
    const endpoint = type === 'farm' ? 'GetImpactScoreFarm' : 'GetImpactScoreGate';
    const url = `${BASE_URL}/v2/Product/${endpoint}/${mongoId}`;
    const result = await apiFetch<unknown>(url);

    return result.success ? result.data : null;
  },
};
