import { env } from '@/config/env';
import { type Brand, BrandSchema } from '@/types/brand';
import { apiFetch } from './base';

const BASE_URL = env.api.foodbook;

export const brandService = {
  async getById(id: string, token?: string): Promise<Brand | null> {
    const url = `${BASE_URL}/v2/Brand/GetBrand/${id}`;
    const result = await apiFetch<unknown>(url, { token });

    if (!result.success) {
      return null;
    }

    const parsed = BrandSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async getAll(token?: string): Promise<Brand[]> {
    const url = `${BASE_URL}/v2/Brand/GetBrands`;
    const result = await apiFetch<unknown[]>(url, { token });

    if (!result.success) {
      return [];
    }

    return result.data
      .map((item) => BrandSchema.safeParse(item))
      .filter((parsed): parsed is { success: true; data: Brand } => parsed.success)
      .map((parsed) => parsed.data);
  },

  async getFilters(token?: string): Promise<unknown> {
    const url = `${BASE_URL}/v2/Brand/GetBrandFilters`;
    const result = await apiFetch<unknown>(url, { token });

    return result.success ? result.data : null;
  },
};
