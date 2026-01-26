import type { FilterValue } from '@/types/filter';
import { create } from 'zustand';

interface FilterState {
  keyword: string;
  filters: Record<string, FilterValue>;
  pageIndex: number;
  pageSize: number;

  // Actions
  setKeyword: (keyword: string) => void;
  addFilter: (key: string, value: FilterValue) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  resetPagination: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  keyword: '',
  filters: {},
  pageIndex: 0,
  pageSize: 21,

  setKeyword: (keyword) => set(() => ({ keyword, pageIndex: 0 })),

  addFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      pageIndex: 0,
    })),

  removeFilter: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.filters;
      return { filters: rest, pageIndex: 0 };
    }),

  clearFilters: () => set(() => ({ filters: {}, keyword: '', pageIndex: 0 })),

  setPage: (pageIndex) => set(() => ({ pageIndex })),

  resetPagination: () => set(() => ({ pageIndex: 0 })),
}));
