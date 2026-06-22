import { test, expect } from '@playwright/test';

const EXPECTED_SERVICES = [
  'Commercial Interiors',
  'Turnkey Fit-Outs',
  'Furniture Manufacturing',
  'Project Execution',
  'Technical Support',
  'Carpentry & Joinery',
];

test.describe('Phase 4 — Services page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/services');
  });

  test('renders hero and 6 service cards', async ({ page }) => {
    await expect(page.locator('.vm-page-hero h1')).toContainText(
      'Specialist services for commercial interiors.',
    );
    const titles = await page.locator('.vm-service__title').allTextContents();
    expect(titles.map((s) => s.trim())).toEqual(EXPECTED_SERVICES);
  });

  test('service cards count is exactly 6', async ({ page }) => {
    await expect(page.locator('.vm-service')).toHaveCount(6);
  });

  test('Enquire CTA targets /contact', async ({ page }) => {
    const cta = page.locator('[data-cta="enquire"]');
    await expect(cta).toContainText('Enquire');
    await expect(cta).toHaveAttribute('href', '/contact');
  });
});
