import { ProductSearchClient } from '@/components/search/product-search-client';
import { useFilterStore } from '@/stores/filter.store';
import type { SearchResults } from '@/types/filter';
import { mockFilters, mockSearchResults } from '@tests/utils/mock-data';
import { findByText, render, screen, waitFor } from '@tests/utils/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock fetch for API calls
global.fetch = vi.fn();

function mockFetch(data: SearchResults) {
  (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
    ok: true,
    json: async () => data,
  });
}

describe('Product Search Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset filter store before each test
    useFilterStore.getState().clearFilters();
  });

  it('displays search results', async () => {
    mockFetch(mockSearchResults);

    // Render first, then set keyword to trigger the query
    render(<ProductSearchClient initialFilters={mockFilters} />);

    // Set keyword after render to trigger React Query
    useFilterStore.getState().setKeyword('test');

    // Wait for products to load
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Check that multiple products are displayed
    expect(screen.getByText('Test Product 2')).toBeInTheDocument();
    expect(screen.getByText('Test Product 3')).toBeInTheDocument();
  });

  it('shows empty state when no results', async () => {
    const emptyResults = {
      products: [],
      pagination: {
        page: 0,
        pageSize: 20,
        total: 0,
        totalPages: 0,
      },
      filters: mockFilters,
    };
    mockFetch(emptyResults);

    // Render first, then set keyword to trigger the query
    render(<ProductSearchClient initialFilters={mockFilters} />);

    // Set keyword after render to trigger React Query
    useFilterStore.getState().setKeyword('test');

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Wait for empty state to appear - check for either text pattern
    await waitFor(
      () => {
        // Try to find the text using screen queries first
        const emptyText1 = screen.queryByText(/geen producten gevonden/i);
        const emptyText2 = screen.queryByText(/geen resultaten gevonden/i);

        if (emptyText1 || emptyText2) {
          expect(emptyText1 || emptyText2).toBeInTheDocument();
          return;
        }

        // Fallback: check container text
        const main = screen.getByRole('main');
        const text = main.textContent ?? '';
        const hasEmptyText =
          /geen producten gevonden/i.test(text) || /geen resultaten gevonden/i.test(text);
        expect(hasEmptyText).toBe(true);
      },
      { timeout: 5000 }
    );
  });

  it('shows product count', async () => {
    mockFetch(mockSearchResults);

    // Render first, then set keyword to trigger the query
    render(<ProductSearchClient initialFilters={mockFilters} />);

    // Set keyword after render to trigger React Query
    useFilterStore.getState().setKeyword('test');

    // Wait for products to load first
    await waitFor(
      () => {
        expect(screen.getByText('Test Product')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Then check for product count - text is split across elements
    await waitFor(
      () => {
        const container = screen.getByRole('main');
        const text = container.textContent ?? '';
        expect(/3.*producten gevonden/i.test(text)).toBe(true);
      },
      { timeout: 1000 }
    );
  });

  it('renders filters', () => {
    render(<ProductSearchClient initialFilters={mockFilters} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Merk')).toBeInTheDocument();
    expect(screen.getByText('Categorie')).toBeInTheDocument();
  });

  it('displays error state on API failure', async () => {
    // Mock fetch to reject - retries are disabled in test QueryClient
    (global.fetch as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('API Error'));

    // Render first, then set keyword to trigger the query
    render(<ProductSearchClient initialFilters={mockFilters} />);

    // Set keyword after render to trigger React Query
    useFilterStore.getState().setKeyword('test');

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Wait for error to appear
    await waitFor(
      () => {
        // Try to find the error text using screen queries first
        const errorText = screen.queryByText(/er is een fout opgetreden/i);

        if (errorText) {
          expect(errorText).toBeInTheDocument();
          return;
        }

        // Fallback: check container text
        const main = screen.getByRole('main');
        const text = main.textContent ?? '';
        const hasError = /er is een fout opgetreden/i.test(text);
        expect(hasError).toBe(true);
      },
      { timeout: 5000 }
    );
  });
});
