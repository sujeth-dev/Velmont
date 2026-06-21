import { test, expect } from '@playwright/test';

test.describe('Phase 1 — nav', () => {
  test('renders with logo image visible (non-zero dimensions)', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.vm-nav__logo img');
    await expect(logo).toBeVisible();
    const box = await logo.boundingBox();
    expect(box).not.toBeNull();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('all 4 nav links present with correct text', async ({ page }) => {
    await page.goto('/');
    const labels = await page.locator('.vm-nav__link').allTextContents();
    expect(labels.map((s) => s.trim())).toEqual(['Work', 'Services', 'About', 'Contact']);
  });

  test('"Enquire" CTA renders with terracotta border', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.vm-nav__cta');
    await expect(cta).toHaveText('Enquire');
    const borderColor = await cta.evaluate((el) => getComputedStyle(el).borderTopColor);
    // var(--terracotta) #FF4015 → rgb(255, 64, 21)
    expect(borderColor.replace(/\s/g, '')).toBe('rgb(255,64,21)');
  });
});

test.describe('Phase 1 — footer', () => {
  test('renders with the white logo visible', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('.vm-footer__logo img');
    await expect(logo).toBeVisible();
    const src = await logo.getAttribute('src');
    expect(src).toContain('velmont-white');
    const box = await logo.boundingBox();
    expect(box.width).toBeGreaterThan(0);
    expect(box.height).toBeGreaterThan(0);
  });

  test('copyright line is present', async ({ page }) => {
    await page.goto('/');
    const copy = page.locator('.vm-footer__copyright');
    await expect(copy).toContainText('© 2026 Velmont Design Studio. All rights reserved.');
  });
});
