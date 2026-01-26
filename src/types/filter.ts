import type { FilterType } from './enums';
import type { ProductSummary } from './product';

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
}

export interface SearchResults {
  products: ProductSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  filters: Filter[];
}
