import { test, expect } from '@playwright/test';

test.describe('Phase 2 — home page', () => {
  test('page title is "Velmont Design Studio"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Velmont Design Studio');
  });

  test('hero H1 reads "Commercial interiors built to the highest standard."', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vm-hero__h1')).toHaveText(
      'Commercial interiors built to the highest standard.',
    );
  });

  test('Selected Work strip renders all published project tiles', async ({ page }) => {
    await page.goto('/');
    // Carousel renders all published projects; clones are marked data-clone and aria-hidden
    const tiles = page.locator('.vm-work__tile:not([data-clone])');
    await expect(tiles).toHaveCount(6);
  });

  test('each tile has discipline, name, and arrow', async ({ page }) => {
    await page.goto('/');
    const tiles = page.locator('.vm-work__tile');
    const n = await tiles.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const tile = tiles.nth(i);
      await expect(tile.locator('.vm-work__tile__discipline')).not.toBeEmpty();
      await expect(tile.locator('.vm-work__tile__name')).not.toBeEmpty();
      await expect(tile.locator('.vm-work__tile__arrow')).toHaveText('→');
    }
  });

  test('process section has 4 steps with the approved labels', async ({ page }) => {
    await page.goto('/');
    const titles = await page.locator('.vm-process__step__title').allTextContents();
    expect(titles.map((s) => s.trim())).toEqual(['Brief', 'Planning', 'Build', 'Handover']);
  });

  test('stats bar has 4 cells', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.vm-finale__stat')).toHaveCount(4);
  });

  test('CTA banner Enquire link points at /contact', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('[data-cta="enquire"]');
    await expect(cta).toContainText('Enquire');
    await expect(cta).toHaveAttribute('href', '/contact');
  });
});
