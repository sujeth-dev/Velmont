import { test, expect } from '@playwright/test';

test.describe('Phase 0 smoke', () => {
  test('vite preview serves index.html with 200 status', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response.status()).toBe(200);
    await expect(page).toHaveTitle('Velmont Design Studio');
  });

  test('design tokens stylesheet is loaded', async ({ page }) => {
    await page.goto('/');
    // The tokens CSS is critical — fail loudly if Vite did not bundle it.
    const paperBg = await page.evaluate(() =>
      getComputedStyle(document.body).getPropertyValue('background-color'),
    );
    // var(--paper) = #F4F0EB → rgb(244, 240, 235)
    expect(paperBg.replace(/\s/g, '')).toBe('rgb(244,240,235)');
  });
});
