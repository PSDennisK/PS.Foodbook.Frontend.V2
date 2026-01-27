import { env } from '@/config/env';
import { FilterType } from '@/types/enums';
import type { Culture } from '@/types/enums';
import type { Filter, SearchParams, SearchResults } from '@/types/filter';
import { type Product, ProductSchema } from '@/types/product';
import { apiFetch } from './base';

const BASE_URL = env.api.foodbook;

type BackendFilterType = 'Checkbox' | 'Slider' | 'Select';

interface BackendFilterOption {
  id: string | number;
  name: string;
  count?: number;
}

interface BackendFilter {
  id: string;
  name: string;
  key: string;
  filterType: BackendFilterType;
  showInitially: boolean;
  options?: BackendFilterOption[];
}

interface BackendSearchProduct {
  id: number;
  name: string;
  image?: string;
  brand?: string;
  gtin?: string;
  artikelnummer?: string;
}

interface BackendSearchResults {
  results: number;
  products: BackendSearchProduct[];
  filters: unknown[];
  showSubFilters: unknown[];
  voedingswaardes: unknown[];
}

function mapFilterType(type: BackendFilterType): FilterType {
  switch (type) {
    case 'Checkbox':
      return FilterType.CHECKBOX;
    case 'Slider':
      return FilterType.RANGE;
    case 'Select':
      return FilterType.SELECT;
    default:
      return FilterType.CHECKBOX;
  }
}

function mapBackendFilters(backendFilters: BackendFilter[]): Filter[] {
  return backendFilters.map((filter) => ({
    key: filter.key,
    label: filter.name,
    type: mapFilterType(filter.filterType),
    options: filter.options?.map((option) => ({
      id: option.id,
      label: option.name,
      count: option.count,
    })),
  }));
}

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
    const payload = {
      keyword: params.keyword ?? '',
      filters: [],
      pageIndex: params.page ?? 0,
      pageSize: params.pageSize ?? 21,
    };

    // Als er een securityToken is, zoeken we binnen een digitale catalogus
    const isCatalogSearch = Boolean(params.securityToken);

    console.log('isCatalogSearch', isCatalogSearch);
    console.log('securityToken', params.securityToken);

    const url = isCatalogSearch
      ? `${BASE_URL}/v2/Search/DC/SearchResults?language=nl`
      : `${BASE_URL}/v2/Search/SearchResults`;

    const result = await apiFetch<BackendSearchResults>(url, {
      method: 'POST',
      headers: isCatalogSearch
        ? {
            securitytoken: params.securityToken as string,
          }
        : undefined,
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      return null;
    }

    const backend = result.data;

    const page = params.page ?? 0;
    const pageSize = params.pageSize ?? 21;
    const total = backend.results;
    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    console.log('search products', backend.products);
    console.log('search filters', backend.filters);
    console.log('search voedingswaardes', backend.voedingswaardes);

    return {
      products: backend.products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      // Voor nu gebruiken we alleen de losse /v2/Filter/List voor filter-definities
      filters: [],
    };
  },

  async autocomplete(
    keyword: string,
    locale: Culture,
    securityToken?: string,
  ): Promise<string[]> {
    const isCatalogSearch = Boolean(securityToken);

    const url = isCatalogSearch
      ? `${BASE_URL}/v2/Search/DC/${locale}/AutoComplete/${encodeURIComponent(keyword)}`
      : `${BASE_URL}/v2/Search/${locale}/AutoComplete/${encodeURIComponent(keyword)}`;

      console.log('autocomplete url', url);
      console.log('isCatalogSearch', isCatalogSearch);
      console.log('securityToken', securityToken);

    const result = await apiFetch<string[]>(url, {
      headers: isCatalogSearch
        ? {
            securitytoken: securityToken as string,
          }
        : undefined,
    });

    console.log('autocomplete result', result);

    return result.success ? result.data : [];
  },

  async getFilters(): Promise<Filter[]> {
    const url = `${BASE_URL}/v2/Filter/List`;
    const result = await apiFetch<BackendFilter[]>(url);

    if (!result.success) {
      return [];
    }

    return mapBackendFilters(result.data);
  },

  async getImpactScore(mongoId: string, type: 'farm' | 'gate'): Promise<unknown | null> {
    const endpoint = type === 'farm' ? 'Farmtofarm' : 'Cradletogate';
    const url = `${BASE_URL}/v2/Co/${endpoint}/${mongoId}`;
    const result = await apiFetch<unknown>(url);

    return result.success ? result.data : null;
  },
};