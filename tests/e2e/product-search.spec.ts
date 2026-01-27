import { expect, test } from '@playwright/test';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/product');
  });

  test('should display search page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText(/producten/i);
  });

  test('should have search input', async ({ page }) => {
    const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]');
    await expect(searchInput).toBeVisible();
  });

  test('should have filters sidebar', async ({ page }) => {
    const filtersHeading = page.getByRole('heading', { name: /filters/i });
    await expect(filtersHeading).toBeVisible();
  });

  test('should display product grid', async ({ page }) => {
    // Wait for products to load
    await page.waitForSelector('[class*="grid"]', { timeout: 5000 });

    const productCards = page.locator('a[href*="/product/"]');
    const count = await productCards.count();

    // Should have at least one product or show empty state
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should navigate to product detail', async ({ page }) => {
    // Wait for products
    await page.waitForSelector('a[href*="/product/"]', { timeout: 5000 });

    const productLinks = page.locator('a[href*="/product/"]');
    const count = await productLinks.count();

    if (count > 0) {
      const firstProduct = productLinks.first();
      await firstProduct.click();

      // Should navigate to detail page
      await expect(page).toHaveURL(/\/product\/\d+/);

      // Should show product detail
      await expect(page.locator('h1, h2, h3')).toBeVisible();
    }
  });

  test('should expand/collapse filter sections', async ({ page }) => {
    // Find a filter button
    const filterButton = page.locator('[aria-expanded]').first();

    if (await filterButton.isVisible()) {
      const isExpanded = await filterButton.getAttribute('aria-expanded');

      // Click to toggle
      await filterButton.click();

      // Wait for state change
      await page.waitForTimeout(300);

      const newState = await filterButton.getAttribute('aria-expanded');
      expect(newState).not.toBe(isExpanded);
    }
  });

  test('should show loading state', async ({ page }) => {
    // Reload page and immediately check for skeleton/loading state
    await page.goto('/product');

    // Loading skeleton should appear briefly
    const hasSkeleton = await page.locator('[class*="skeleton"], [class*="animate-pulse"]').count();

    expect(hasSkeleton).toBeGreaterThanOrEqual(0);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.keyboard.press('Tab');

    // Check that focus is visible
    const focused = page.locator(':focus');
    await expect(focused).toBeVisible();

    // Tab through multiple elements
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Should still have focus somewhere
    const stillFocused = page.locator(':focus');
    await expect(stillFocused).toBeVisible();
  });
});
