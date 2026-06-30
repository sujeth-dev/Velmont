import { test, expect } from '@playwright/test';

// All 18 published projects from data/projects.json (6 launch + 12 seeded)
const PROJECTS = [
  {
    slug: 'jw-marriott-bengaluru',
    title: 'JW Marriott Bengaluru Prestige Golfshire',
    discipline: 'Hospitality',
  },
  {
    slug: 'taj-malabar-kochi',
    title: 'Taj Malabar Resort & Spa, Kochi',
    discipline: 'Hospitality',
  },
  { slug: 'itc-ratnadipa-colombo', title: 'ITC Ratnadipa, Colombo', discipline: 'Hospitality' },
  {
    slug: 'marriott-marquis-delhi',
    title: 'Marriott Marquis New Delhi',
    discipline: 'Hospitality',
  },
  {
    slug: 'mea-bangalore',
    title: 'Ministry of External Affairs — Bangalore',
    discipline: 'Workplace',
  },
  {
    slug: 'taj-exotica-andaman',
    title: 'Taj Exotica Resort & Spa, Andamans',
    discipline: 'Hospitality',
  },
  {
    slug: 'allianz-trivandrum',
    title: 'Allianz Technology, Technopark Phase III',
    discipline: 'Workplace',
  },
  {
    slug: 'apollo-hospital-gurugram',
    title: 'Apollo Hospital, Golf Course Road',
    discipline: 'Healthcare',
  },
  { slug: 'embassy-chennai', title: 'Embassy Splendid TechZone', discipline: 'Workplace' },
  {
    slug: 'gopalan-mall-bangalore',
    title: 'Gopalan Signature Mall, Tin Factory',
    discipline: 'Commercial',
  },
  { slug: 'ireo-grand-hyatt-gurugram', title: 'Grand Hyatt, Ireo City', discipline: 'Hospitality' },
  {
    slug: 'kauvery-hospital-chennai',
    title: 'Kauvery Hospital, Kovilambakkam',
    discipline: 'Healthcare',
  },
  { slug: 'moxy-bangalore-airport', title: 'Moxy Bengaluru Airport', discipline: 'Hospitality' },
  { slug: 'shangri-la-bangalore', title: 'Shangri-La Bengaluru', discipline: 'Hospitality' },
  {
    slug: 'shell-nctb-bangalore',
    title: 'Shell Technology Centre Bangalore',
    discipline: 'Workplace',
  },
  { slug: 'shibaura-machine-chennai', title: 'Shibaura Machine India HQ', discipline: 'Workplace' },
  { slug: 'taj-cial-kochi', title: 'Taj Cochin International Airport', discipline: 'Hospitality' },
  {
    slug: 'wells-fargo-chennai',
    title: 'Wells Fargo, Embassy Splendid TechZone',
    discipline: 'Workplace',
  },
];

test.describe('Phase 3 — Work list page', () => {
  test('work page loads and shows 18 project tiles', async ({ page }) => {
    await page.goto('/work');
    const tiles = page.locator('.vm-grid-tile');
    await expect(tiles).toHaveCount(18);
  });

  test('clicking "Hospitality" filter shows only hospitality projects', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('.vm-grid-tile');
    await page.click('[data-filter-btn="Hospitality"]');
    // 9 hospitality projects should be visible
    const visible = page.locator('.vm-grid-tile:not([hidden])');
    await expect(visible).toHaveCount(9);
    // Verify a workplace tile is hidden
    await expect(page.locator('[data-tile="mea-bangalore"]')).toHaveAttribute('hidden', '');
  });

  test('clicking "Workplace" filter shows only workplace projects', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('.vm-grid-tile');
    await page.click('[data-filter-btn="Workplace"]');
    const visible = page.locator('.vm-grid-tile:not([hidden])');
    await expect(visible).toHaveCount(6);
    await expect(page.locator('[data-tile="mea-bangalore"]')).not.toHaveAttribute('hidden');
  });

  test('clicking "All" shows all 18 tiles again', async ({ page }) => {
    await page.goto('/work');
    await page.waitForSelector('.vm-grid-tile');
    await page.click('[data-filter-btn="Hospitality"]');
    await page.click('[data-filter-btn=""]');
    const tiles = page.locator('.vm-grid-tile:not([hidden])');
    await expect(tiles).toHaveCount(18);
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
    test(`${proj.title} — renders H1, spec bar, body, gallery, breadcrumb`, async ({ page }) => {
      await page.goto(`/work/${proj.slug}`);

      // H1 matches project title
      await expect(page.locator('[data-proj-h1]')).toHaveText(proj.title);

      // Spec bar has 4 cells
      await expect(page.locator('.vm-spec-bar__cell')).toHaveCount(4);

      // Spec bar values populated
      await expect(page.locator('[data-spec-industry]')).toHaveText(proj.discipline);
      await expect(page.locator('[data-spec-scope]')).not.toBeEmpty();

      // Body editorial lead is present
      await expect(page.locator('[data-proj-lead]')).not.toBeEmpty();

      // Body paragraphs rendered
      await expect(page.locator('[data-proj-body] .vm-proj-body__para').first()).not.toBeEmpty();

      // Breadcrumb present with correct project name
      await expect(page.locator('[data-breadcrumb-project]')).toHaveText(proj.title);
      await expect(page.locator('[data-breadcrumb-discipline]')).toHaveText(proj.discipline);

      // Gallery: first image hydrated with a real src (1–5 images per project)
      await expect(page.locator('[data-gallery-img="0"]')).toHaveAttribute('src', /.+/);
    });
  }
});
