import { test, expect } from '@playwright/test';

// All 6 published projects from data/projects.json
const PROJECTS = [
  { slug: 'jw-marriott-bengaluru', title: 'JW Marriott Bengaluru Prestige Golfshire', discipline: 'Hospitality' },
  { slug: 'taj-malabar-kochi', title: 'Taj Malabar Resort & Spa, Kochi', discipline: 'Hospitality' },
  { slug: 'itc-ratnadipa-colombo', title: 'ITC Ratnadipa, Colombo', discipline: 'Hospitality' },
  { slug: 'marriott-marquis-delhi', title: 'Marriott Marquis New Delhi', discipline: 'Hospitality' },
  { slug: 'mea-bangalore', title: 'Ministry of External Affairs — Bangalore', discipline: 'Workplace' },
  { slug: 'taj-exotica-andaman', title: 'Taj Exotica Resort & Spa, Andamans', discipline: 'Hospitality' },
];

test.describe('Phase 3 — Work list page', () => {
  test('work page loads and shows 6 project tiles', async ({ page }) => {
    await page.goto('/work');
    const tiles = page.locator('.vm-grid-tile');
    await expect(tiles).toHaveCount(6);
  });

  test('clicking "Hospitality" filter shows only hospitality projects', async ({ page }) => {
    await page.goto('/work');
    await page.click('[data-filter-btn="Hospitality"]');
    // 5 hospitality projects should be visible
    const visible = page.locator('.vm-grid-tile:not([hidden])');
    await expect(visible).toHaveCount(5);
    // Verify the workplace tile is hidden
    await expect(page.locator('[data-tile="mea-bangalore"]')).toHaveAttribute('hidden', '');
  });

  test('clicking "Workplace" filter shows only MEA project', async ({ page }) => {
    await page.goto('/work');
    await page.click('[data-filter-btn="Workplace"]');
    const visible = page.locator('.vm-grid-tile:not([hidden])');
    await expect(visible).toHaveCount(1);
    await expect(page.locator('[data-tile="mea-bangalore"]')).not.toHaveAttribute('hidden');
  });

  test('clicking "All" shows all 6 tiles again', async ({ page }) => {
    await page.goto('/work');
    await page.click('[data-filter-btn="Hospitality"]');
    await page.click('[data-filter-btn=""]');
    const tiles = page.locator('.vm-grid-tile:not([hidden])');
    await expect(tiles).toHaveCount(6);
  });

  test('each project tile links to correct project detail URL', async ({ page }) => {
    await page.goto('/work');
    for (const proj of PROJECTS) {
      const tile = page.locator(`[data-tile="${proj.slug}"]`);
      await expect(tile).toHaveAttribute('href', `/work/${proj.slug}`);
    }
  });
});

test.describe('Phase 3 — Project detail pages', () => {
  for (const proj of PROJECTS) {
    test(`${proj.title} — renders H1, spec bar, body, gallery, breadcrumb, prev/next`, async ({ page }) => {
      await page.goto(`/work/${proj.slug}`);

      // H1 matches project title
      await expect(page.locator('[data-proj-h1]')).toHaveText(proj.title);

      // Spec bar has 4 cells
      await expect(page.locator('.vm-spec-bar__cell')).toHaveCount(4);

      // Spec bar values are populated (not empty "—" for industry/scope, those always have values)
      await expect(page.locator('[data-spec-industry]')).toHaveText(proj.discipline);
      await expect(page.locator('[data-spec-scope]')).not.toBeEmpty();

      // Body editorial lead is present
      await expect(page.locator('[data-proj-lead]')).not.toBeEmpty();

      // Body paragraphs rendered
      await expect(page.locator('[data-proj-body] .vm-proj-body__para').first()).not.toBeEmpty();

      // Breadcrumb present with correct project name
      await expect(page.locator('[data-breadcrumb-project]')).toHaveText(proj.title);
      await expect(page.locator('[data-breadcrumb-discipline]')).toHaveText(proj.discipline);

      // Gallery: 3 images present (main + topRight + bottomRight)
      await expect(page.locator('[data-gallery-main]')).toHaveAttribute('src', /.+/);
      await expect(page.locator('[data-gallery-top-right]')).toHaveAttribute('src', /.+/);
      await expect(page.locator('[data-gallery-bottom-right]')).toHaveAttribute('src', /.+/);

      // Prev/Next nav present
      await expect(page.locator('[data-prev-link]')).toHaveAttribute('href', /\/work\/.+/);
      await expect(page.locator('[data-next-link]')).toHaveAttribute('href', /\/work\/.+/);
    });
  }

  test('prev/next navigation links work (circular)', async ({ page }) => {
    // Start at first project
    await page.goto('/work/jw-marriott-bengaluru');

    // Follow "Next" link
    const nextHref = await page.locator('[data-next-link]').getAttribute('href');
    expect(nextHref).toBeTruthy();
    await page.goto(nextHref);
    // Should be on taj-malabar-kochi
    await expect(page.locator('[data-proj-h1]')).toHaveText('Taj Malabar Resort & Spa, Kochi');

    // Follow "Prev" back
    const prevHref = await page.locator('[data-prev-link]').getAttribute('href');
    await page.goto(prevHref);
    await expect(page.locator('[data-proj-h1]')).toHaveText('JW Marriott Bengaluru Prestige Golfshire');

    // Circular: prev from first should wrap to last
    const prevFromFirst = await page.locator('[data-prev-link]').getAttribute('href');
    await page.goto(prevFromFirst);
    await expect(page.locator('[data-proj-h1]')).toHaveText('Taj Exotica Resort & Spa, Andamans');
  });
});
