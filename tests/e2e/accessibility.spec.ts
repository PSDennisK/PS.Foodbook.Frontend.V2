import { expect, test } from '@playwright/test';

test.describe('Accessibility', () => {
  test('homepage has proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThan(0);
    expect(h1Count).toBeLessThanOrEqual(1); // Should only have one h1
  });

  test('all images have alt text', async ({ page }) => {
    await page.goto('/');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');

      // Alt attribute should exist (can be empty for decorative images)
      expect(alt).not.toBeNull();
    }
  });

  test('interactive elements are keyboard accessible', async ({ page }) => {
    await page.goto('/product');

    // Tab through page
    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      const focused = await page.locator(':focus').count();
      if (focused > 0) {
        const tagName = await page.locator(':focus').evaluate((el) => el.tagName);
        const role = await page.locator(':focus').getAttribute('role');

        // Focused element should be interactive
        expect(['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(tagName);
      }
    }

    expect(tabCount).toBe(maxTabs);
  });

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/product');

    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');
      const ariaLabelledBy = await button.getAttribute('aria-labelledby');

      // Button should have text content, aria-label, or aria-labelledby
      const hasAccessibleName = text?.trim() || ariaLabel || ariaLabelledBy;
      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test('links have meaningful text', async ({ page }) => {
    await page.goto('/product');

    await page.waitForSelector('a', { timeout: 5000 });

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < Math.min(count, 10); i++) {
      // Check first 10 links
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');

      const hasAccessibleName = text?.trim() || ariaLabel;
      expect(hasAccessibleName).toBeTruthy();

      // Should not be generic text like "click here"
      if (text) {
        expect(text.toLowerCase()).not.toMatch(/^(click here|read more|here)$/);
      }
    }
  });

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/product');

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const ariaLabelledBy = await input.getAttribute('aria-labelledby');
      const placeholder = await input.getAttribute('placeholder');

      // Input should have id (for label), aria-label, aria-labelledby, or at least placeholder
      const hasLabel = id || ariaLabel || ariaLabelledBy || placeholder;
      expect(hasLabel).toBeTruthy();
    }
  });

  test('page has lang attribute', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const lang = await html.getAttribute('lang');

    expect(lang).toBeTruthy();
    expect(['nl', 'en', 'de', 'fr']).toContain(lang || '');
  });

  test('skip to content functionality', async ({ page }) => {
    await page.goto('/');

    // First tab should ideally focus skip link (if implemented)
    await page.keyboard.press('Tab');

    const focused = page.locator(':focus');
    const text = await focused.textContent();

    // If skip link exists, it should be first focusable element
    // This is optional but good practice
    if (text?.toLowerCase().includes('skip')) {
      await page.keyboard.press('Enter');

      // Should jump to main content
      const mainFocused = page.locator(':focus');
      await expect(mainFocused).toBeVisible();
    }
  });

  test('no empty links or buttons', async ({ page }) => {
    await page.goto('/');

    const links = page.locator('a');
    const linkCount = await links.count();

    for (let i = 0; i < linkCount; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const ariaLabel = await link.getAttribute('aria-label');
      const hasChildren = await link.locator('*').count();

      // Link should have text, aria-label, or children (like icons)
      expect(text?.trim() || ariaLabel || hasChildren > 0).toBeTruthy();
    }
  });

  test('color contrast is sufficient', async ({ page }) => {
    await page.goto('/');

    // Note: This is a basic check. For comprehensive contrast checking,
    // use tools like axe-core or pa11y

    // Check that background and text colors are not the same
    const body = page.locator('body');
    const styles = await body.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
      };
    });

    expect(styles.color).not.toBe(styles.backgroundColor);
  });
});
