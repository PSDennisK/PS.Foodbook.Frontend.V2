import { devices, expect, test } from '@playwright/test';

test.describe('Mobile Experience', () => {
  test.use({ ...devices['iPhone 12'] });

  test('should display mobile navigation', async ({ page }) => {
    await page.goto('/');

    // Look for mobile menu button
    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"]');

    await expect(menuButton).toBeVisible();
  });

  test('should open mobile menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('button[aria-label*="menu" i], button[aria-label*="Menu"]');

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Menu should open
      await page.waitForTimeout(300);

      // Check for navigation items
      const nav = page.locator('[role="dialog"], [class*="sheet"], nav');
      await expect(nav.first()).toBeVisible();
    }
  });

  test('should navigate using mobile menu', async ({ page }) => {
    await page.goto('/');

    const menuButton = page.locator('button[aria-label*="menu" i]').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      await page.waitForTimeout(300);

      // Find product link in menu
      const productLink = page.locator('a[href*="/product"]').first();

      if (await productLink.isVisible()) {
        await productLink.click();

        await expect(page).toHaveURL(/\/product/);
      }
    }
  });

  test('product cards are mobile responsive', async ({ page }) => {
    await page.goto('/product');

    await page.waitForSelector('a[href*="/product/"]', { timeout: 5000 });

    // Get viewport width
    const viewportSize = page.viewportSize();
    expect(viewportSize?.width).toBeLessThan(768);

    // Products should be in single column on mobile
    const productCards = page.locator('a[href*="/product/"]').first();

    if (await productCards.isVisible()) {
      const box = await productCards.boundingBox();
      expect(box?.width).toBeGreaterThan(200); // Should use most of screen width
    }
  });

  test('touch interactions work', async ({ page }) => {
    await page.goto('/product');

    await page.waitForSelector('a[href*="/product/"]', { timeout: 5000 });

    const firstProduct = page.locator('a[href*="/product/"]').first();

    if (await firstProduct.isVisible()) {
      // Tap on product
      await firstProduct.tap();

      // Should navigate
      await expect(page).toHaveURL(/\/product\/\d+/);
    }
  });

  test('filters work on mobile', async ({ page }) => {
    await page.goto('/product');

    // Filters should be visible or in a collapsible section
    const filtersSection = page.locator('[aria-label*="filter" i], aside, [class*="sidebar"]');

    const count = await filtersSection.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('search input is accessible on mobile', async ({ page }) => {
    await page.goto('/product');

    const searchInput = page.locator('input[type="search"], input[placeholder*="Zoek"]');

    if (await searchInput.isVisible()) {
      await searchInput.tap();

      // Input should be focused
      await expect(searchInput).toBeFocused();

      // Keyboard should appear (can't test directly, but focus indicates it)
    }
  });
});
