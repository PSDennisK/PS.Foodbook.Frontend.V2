import { env } from '@/config/env';
import { apiFetch } from '@/lib/api/base';
import type { Culture } from '@/types/enums';
import { type Product, ProductSchema } from '@/types/product';

const BASE_URL = env.api.foodbook;

export const sheetService = {
  async getById(id: string, token?: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
    const result = await apiFetch<unknown>(url, { token });

    if (!result.success) {
      return null;
    }

    const parsed = ProductSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async generatePdf(id: string, locale: Culture): Promise<Blob | null> {
    const url = `${BASE_URL}/v2/Product/GeneratePDF/${locale}/${id}`;
    const result = await apiFetch<Blob>(url);

    return result.success ? result.data : null;
  },
};
