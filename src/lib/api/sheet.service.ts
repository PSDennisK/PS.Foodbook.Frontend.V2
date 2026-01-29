import { env } from '@/config/env';
import { apiFetch } from '@/lib/api/base';
import { parseProductFromSearchResult } from '@/lib/api/product.service';
import { Culture } from '@/types/enums';
import type { Product } from '@/types/product';

const BASE_URL = env.api.foodbook;

export const sheetService = {
  async getById(id: string, token?: string): Promise<Product | null> {
    const url = `${BASE_URL}/v2/Product/GetProductSheet/${id}`;
    const result = await apiFetch<unknown>(url, { token });

    if (!result.success) {
      return null;
    }

    return parseProductFromSearchResult(result.data);
  },
};
