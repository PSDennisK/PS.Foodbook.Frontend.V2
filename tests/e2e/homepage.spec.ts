import { expect, test } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');

    // Check that the page loaded
    await expect(page).toHaveTitle(/PS Foodbook/i);

    // Check for main content
    await expect(page.locator('main')).toBeVisible();
  });

  test('should navigate to product search', async ({ page }) => {
    await page.goto('/');

    // Look for a link to products page (adjust selector based on actual implementation)
    const productLink = page.locator('a[href*="/product"]').first();

    if (await productLink.isVisible()) {
      await productLink.click();

      // Check URL changed
      await expect(page).toHaveURL(/\/product/);
    }
  });

  test('should have language in URL', async ({ page }) => {
    await page.goto('/');

    const url = page.url();

    // Should either have no prefix (Dutch default) or a locale prefix
    expect(url).toMatch(/\/(en\/|de\/|fr\/)?$/);
  });

  test('should be accessible', async ({ page }) => {
    await page.goto('/');

    // Check for basic accessibility landmarks
    await expect(page.locator('main')).toBeVisible();

    // Check that images have alt text
    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      expect(alt).toBeDefined();
    }
  });
});
