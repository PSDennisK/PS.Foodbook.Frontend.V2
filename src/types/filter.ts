import type { FilterType } from './enums';

export interface FilterOption {
  id: string | number;
  label: string;
  count?: number;
}

export interface Filter {
  key: string;
  label: string;
  type: FilterType;
  options?: FilterOption[];
  min?: number;
  max?: number;
  value?: FilterValue;
}

export type FilterValue = string | number | string[] | number[] | { min: number; max: number };

export interface SearchParams {
  keyword?: string;
  filters?: Record<string, FilterValue>;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  securityToken?: string;
}

export interface SearchProduct {
  id: number;
  name: string;
  image?: string;
  brand?: string;
  gtin?: string;
  artikelnummer?: string;
}

export interface SearchResults {
  products: SearchProduct[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: Filter[];
}
