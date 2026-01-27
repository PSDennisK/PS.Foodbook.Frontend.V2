import { useFilterStore } from '@/stores/filter.store';
import { beforeEach, describe, expect, it } from 'vitest';

describe('FilterStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useFilterStore.setState({
      keyword: '',
      filters: {},
      pageIndex: 0,
      pageSize: 21,
    });
  });

  describe('setKeyword', () => {
    it('sets keyword', () => {
      const { setKeyword } = useFilterStore.getState();

      setKeyword('test');

      expect(useFilterStore.getState().keyword).toBe('test');
    });

    it('resets pagination when keyword changes', () => {
      const { setKeyword, setPage } = useFilterStore.getState();

      setPage(5);
      expect(useFilterStore.getState().pageIndex).toBe(5);

      setKeyword('test');

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });
  });

  describe('addFilter', () => {
    it('adds a filter', () => {
      const { addFilter } = useFilterStore.getState();

      addFilter('brand', 'test-brand');

      expect(useFilterStore.getState().filters).toEqual({
        brand: 'test-brand',
      });
    });

    it('adds multiple filters', () => {
      const { addFilter } = useFilterStore.getState();

      addFilter('brand', 'test-brand');
      addFilter('category', 'test-category');

      expect(useFilterStore.getState().filters).toEqual({
        brand: 'test-brand',
        category: 'test-category',
      });
    });

    it('updates existing filter', () => {
      const { addFilter } = useFilterStore.getState();

      addFilter('brand', 'test-brand');
      addFilter('brand', 'new-brand');

      expect(useFilterStore.getState().filters).toEqual({
        brand: 'new-brand',
      });
    });

    it('resets pagination on filter change', () => {
      const { addFilter, setPage } = useFilterStore.getState();

      setPage(5);
      expect(useFilterStore.getState().pageIndex).toBe(5);

      addFilter('brand', 'test-brand');

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });

    it('handles array filter values', () => {
      const { addFilter } = useFilterStore.getState();

      addFilter('brands', ['brand1', 'brand2']);

      expect(useFilterStore.getState().filters).toEqual({
        brands: ['brand1', 'brand2'],
      });
    });

    it('handles range filter values', () => {
      const { addFilter } = useFilterStore.getState();

      addFilter('price', { min: 10, max: 50 });

      expect(useFilterStore.getState().filters).toEqual({
        price: { min: 10, max: 50 },
      });
    });
  });

  describe('removeFilter', () => {
    it('removes a filter', () => {
      const { addFilter, removeFilter } = useFilterStore.getState();

      addFilter('brand', 'test-brand');
      addFilter('category', 'test-category');

      removeFilter('brand');

      expect(useFilterStore.getState().filters).toEqual({
        category: 'test-category',
      });
    });

    it('resets pagination on filter removal', () => {
      const { addFilter, removeFilter, setPage } = useFilterStore.getState();

      addFilter('brand', 'test-brand');
      setPage(5);

      removeFilter('brand');

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });

    it('handles removing non-existent filter', () => {
      const { removeFilter } = useFilterStore.getState();

      removeFilter('nonexistent');

      expect(useFilterStore.getState().filters).toEqual({});
    });
  });

  describe('clearFilters', () => {
    it('clears all filters', () => {
      const { addFilter, clearFilters } = useFilterStore.getState();

      addFilter('brand', 'test-brand');
      addFilter('category', 'test-category');

      clearFilters();

      expect(useFilterStore.getState().filters).toEqual({});
    });

    it('clears keyword', () => {
      const { setKeyword, clearFilters } = useFilterStore.getState();

      setKeyword('test');

      clearFilters();

      expect(useFilterStore.getState().keyword).toBe('');
    });

    it('resets pagination', () => {
      const { setPage, clearFilters } = useFilterStore.getState();

      setPage(5);

      clearFilters();

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });
  });

  describe('setPage', () => {
    it('sets page index', () => {
      const { setPage } = useFilterStore.getState();

      setPage(3);

      expect(useFilterStore.getState().pageIndex).toBe(3);
    });

    it('allows setting page to 0', () => {
      const { setPage } = useFilterStore.getState();

      setPage(5);
      setPage(0);

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });
  });

  describe('resetPagination', () => {
    it('resets page to 0', () => {
      const { setPage, resetPagination } = useFilterStore.getState();

      setPage(10);

      resetPagination();

      expect(useFilterStore.getState().pageIndex).toBe(0);
    });
  });

  describe('initial state', () => {
    it('has correct initial values', () => {
      const state = useFilterStore.getState();

      expect(state.keyword).toBe('');
      expect(state.filters).toEqual({});
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(21);
    });
  });
});
