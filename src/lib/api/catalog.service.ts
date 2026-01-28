import { env } from '@/config/env';
import { type CatalogTheme, CatalogThemeSchema } from '@/types/catalog';
import { apiFetch } from './base';

const BASE_URL = env.api.foodbook;

export const catalogService = {
  async getTheme(guid: string): Promise<CatalogTheme | null> {
    const url = `${BASE_URL}/Theme/DigitalCatelog/${guid}`;
    const result = await apiFetch<unknown>(url);

    if (!result.success) {
      return null;
    }

    const parsed = CatalogThemeSchema.safeParse(result.data);
    return parsed.success ? parsed.data : null;
  },

  async getGuid(token: string, abbr: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetGuid/${token}/${abbr}`;
    const result = await apiFetch<{ guid: string }>(url);

    return result.success ? result.data.guid : null;
  },

  async getLogo(fileName: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetLogo/${fileName}`;
    const result = await apiFetch<{ base64: string }>(url);

    return result.success ? result.data.base64 : null;
  },

  async getBanner(fileName: string): Promise<string | null> {
    const url = `${BASE_URL}/v2/DigitalCatalog/GetBanner/${fileName}`;
    const result = await apiFetch<{ base64: string }>(url);

    return result.success ? result.data.base64 : null;
  },
};
