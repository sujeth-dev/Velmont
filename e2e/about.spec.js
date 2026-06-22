import { test, expect } from '@playwright/test';

test.describe('Phase 4 — About page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('renders all 6 sections', async ({ page }) => {
    await expect(page.locator('.vm-page-hero h1')).toContainText(
      'Built to deliver, from first sketch to final handover.',
    );
    await expect(page.locator('.vm-about-who')).toBeVisible();
    await expect(page.locator('.vm-stats')).toBeVisible();
    await expect(page.locator('.vm-approach')).toBeVisible();
    await expect(page.locator('.vm-manuf')).toBeVisible();
    await expect(page.locator('[data-cta="get-in-touch"]')).toBeVisible();
  });

  test('shows the 4 track-record stats with the expected numbers', async ({ page }) => {
    const nums = await page.locator('.vm-stats__num').allTextContents();
    expect(nums.map((s) => s.trim())).toEqual(['15+', '100+', '5M+', '200+']);
  });

  test('manufacturing photo placeholder is present', async ({ page }) => {
    await expect(page.locator('[data-placeholder]')).toBeVisible();
  });

  test('CTA links to /contact', async ({ page }) => {
    await expect(page.locator('[data-cta="get-in-touch"]')).toHaveAttribute('href', '/contact');
  });
});
