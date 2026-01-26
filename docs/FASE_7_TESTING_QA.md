# FASE 7: TESTING & QA - Claude Code Prompt

**Fase:** 7 - Testing & QA  
**Duur:** 2 weken  
**Doel:** Kwaliteit en stabiliteit  

## DOEL
Uitgebreide test coverage en bug fixes voor production-ready applicatie.

## DEEL 1: UNIT TESTS

### Component Tests
```typescript
// tests/components/product/product-card.test.tsx
import { render, screen } from '@/tests/utils/test-utils';
import { ProductCard } from '@/components/product/product-card';
import { mockProduct } from '@/tests/utils/mock-data';

describe('ProductCard', () => {
  it('renders product name', () => {
    render(<ProductCard product={mockProduct} locale="nl-NL" />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders product image', () => {
    render(<ProductCard product={mockProduct} locale="nl-NL" />);
    const image = screen.getByAltText('Test Product');
    expect(image).toBeInTheDocument();
  });

  it('links to product detail page', () => {
    render(<ProductCard product={mockProduct} locale="nl-NL" />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/product/123/test-product');
  });
});
```

### Hook Tests
```typescript
// tests/hooks/use-autocomplete.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useAutocomplete } from '@/hooks/use-autocomplete';

describe('useAutocomplete', () => {
  it('fetches suggestions on keyword change', async () => {
    const { result } = renderHook(() => useAutocomplete('nl-NL'));
    
    act(() => {
      result.current.setKeyword('test');
    });

    await waitFor(() => {
      expect(result.current.suggestions.length).toBeGreaterThan(0);
    });
  });
});
```

### Store Tests
```typescript
// tests/stores/filter.store.test.ts
import { useFilterStore } from '@/stores/filter.store';

describe('FilterStore', () => {
  beforeEach(() => {
    useFilterStore.getState().clearFilters();
  });

  it('adds filter', () => {
    const { addFilter, filters } = useFilterStore.getState();
    
    addFilter('brand', 'test-brand');
    
    expect(filters['brand']).toBe('test-brand');
  });

  it('resets page on filter change', () => {
    const { addFilter, setPage, pageIndex } = useFilterStore.getState();
    
    setPage(5);
    expect(pageIndex).toBe(5);
    
    addFilter('brand', 'test-brand');
    expect(pageIndex).toBe(0);
  });
});
```

## DEEL 2: INTEGRATION TESTS

### Search Flow
```typescript
// tests/integration/search-flow.test.tsx
describe('Product Search Flow', () => {
  it('completes full search flow', async () => {
    render(<ProductSearchPage />);

    // Type in search
    const searchInput = screen.getByPlaceholderText('Zoek producten...');
    await userEvent.type(searchInput, 'test');

    // Select autocomplete suggestion
    await waitFor(() => screen.getByText('test product'));
    await userEvent.click(screen.getByText('test product'));

    // Check results
    await waitFor(() => {
      expect(screen.getByText('Test Product')).toBeInTheDocument();
    });

    // Apply filter
    const filterCheckbox = screen.getByLabelText('Test Brand');
    await userEvent.click(filterCheckbox);

    // Check filtered results
    await waitFor(() => {
      expect(screen.getAllByRole('link')).toHaveLength(5);
    });
  });
});
```

### Auth Flow
```typescript
// tests/integration/auth-flow.test.tsx
describe('Authentication Flow', () => {
  it('blocks access to protected routes', async () => {
    render(<CatalogPage params={{ guid: 'test-guid' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Geen toegang')).toBeInTheDocument();
    });
  });

  it('allows access with valid token', async () => {
    // Set valid token
    document.cookie = 'PsFoodbookToken=valid-token';
    
    render(<CatalogPage params={{ guid: 'test-guid' }} />);
    
    await waitFor(() => {
      expect(screen.getByText('Catalogus Producten')).toBeInTheDocument();
    });
  });
});
```

## DEEL 3: E2E TESTS (Playwright)

### Product Search E2E
```typescript
// tests/e2e/product-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test('should search and view product', async ({ page }) => {
    await page.goto('/product');

    // Search for product
    await page.fill('[placeholder="Zoek producten..."]', 'test');
    await page.click('text=test product');

    // Wait for results
    await expect(page.locator('h1')).toContainText('Test Product');

    // Click product
    await page.click('text=Test Product');

    // Check detail page
    await expect(page).toHaveURL(/\/product\/\d+/);
    await expect(page.locator('h1')).toContainText('Test Product');
  });
});
```

### Catalog E2E
```typescript
// tests/e2e/catalog.spec.ts
test.describe('Digital Catalog', () => {
  test('should display custom theme', async ({ page }) => {
    await page.goto('/digitalcatalog/test-guid');

    // Check custom colors
    const header = page.locator('header');
    await expect(header).toHaveCSS('background-color', 'rgb(0, 102, 204)');

    // Check logo
    await expect(page.locator('img[alt="Logo"]')).toBeVisible();
  });
});
```

### Mobile E2E
```typescript
// tests/e2e/mobile.spec.ts
test.use({ viewport: { width: 375, height: 667 } });

test.describe('Mobile Experience', () => {
  test('should navigate on mobile', async ({ page }) => {
    await page.goto('/');

    // Open mobile menu
    await page.click('[aria-label="Menu"]');

    // Navigate to products
    await page.click('text=Producten');

    await expect(page).toHaveURL('/product');
  });
});
```

## DEEL 4: COVERAGE TARGETS

```json
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 80,
    statements: 80,
  },
  exclude: [
    'tests/**',
    '**/*.test.ts',
    '**/*.config.ts',
  ],
}
```

## DEEL 5: BUG TRACKING

Create issue template:
```markdown
## Bug Report

**Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser:
- OS:
- Screen size:

**Screenshots:**
If applicable
```

## OUTPUT
- ✅ Unit tests (>80% coverage)
- ✅ Integration tests
- ✅ E2E tests
- ✅ Bug tracking system
- ✅ All critical paths tested
- ✅ Cross-browser tested
- ✅ Mobile tested

## VERIFICATION
```bash
# Run all tests
npm test
npm run test:e2e

# Check coverage
npm test -- --coverage

# Targets:
- Unit tests: >80% coverage
- All E2E tests passing
- No console errors
- No TypeScript errors
- Lighthouse scores >90
```

**Volgende stap:** Fase 8 - Deployment
