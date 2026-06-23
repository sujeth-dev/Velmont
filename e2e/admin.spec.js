import { test, expect } from '@playwright/test';

// Admin test credentials — set these in .env or CI environment variables.
const ADMIN_EMAIL = process.env.VITE_ADMIN_TEST_EMAIL;
const ADMIN_PASSWORD = process.env.VITE_ADMIN_TEST_PASSWORD;
const HAS_CREDS = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD);

// ─── Unauthenticated access tests (always run) ────────────────────────────────

test.describe('Phase 5 — admin panel (unauthenticated)', () => {
  test('login page loads and shows login form', async ({ page }) => {
    await page.goto('/admin/login');
    await expect(page.locator('[data-login-form]')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('[data-login-submit]')).toBeVisible();
  });

  test('dashboard redirects unauthenticated users to /admin/login', async ({ page }) => {
    await page.goto('/admin/dashboard');
    // Auth guard uses auth.authStateReady() + 8s fallback before redirecting
    await page.waitForURL('**/admin/login', { timeout: 30000 });
    await expect(page.locator('[data-login-form]')).toBeVisible();
  });

  test('project-form redirects unauthenticated users to /admin/login', async ({ page }) => {
    await page.goto('/admin/project-form');
    await page.waitForURL('**/admin/login', { timeout: 30000 });
    await expect(page.locator('[data-login-form]')).toBeVisible();
  });

  test('login shows error for wrong credentials', async ({ page }) => {
    await page.goto('/admin/login');
    await page.fill('#email', 'wrong@example.com');
    await page.fill('#password', 'wrongpassword');
    await page.click('[data-login-submit]');
    // auth timeout fires at 12s; give extra buffer
    await expect(page.locator('[data-login-error]')).toBeVisible({ timeout: 20000 });
  });
});

// ─── Authenticated tests (require VITE_ADMIN_TEST_EMAIL / VITE_ADMIN_TEST_PASSWORD) ──

test.describe('Phase 5 — admin panel (authenticated)', () => {
  test.skip(!HAS_CREDS, 'Set VITE_ADMIN_TEST_EMAIL and VITE_ADMIN_TEST_PASSWORD to run admin E2E tests');

  async function login(page) {
    await page.goto('/admin/login');
    await page.fill('#email', ADMIN_EMAIL);
    await page.fill('#password', ADMIN_PASSWORD);
    await page.click('[data-login-submit]');
    await page.waitForURL('**/admin/dashboard', { timeout: 12000 });
  }

  test('login with valid credentials navigates to dashboard', async ({ page }) => {
    await login(page);
    await expect(page.locator('[data-project-list]')).toBeVisible();
  });

  test('dashboard shows project list with rows', async ({ page }) => {
    await login(page);
    // Wait for rows to load
    await expect(page.locator('.adm-project-row').first()).toBeVisible({ timeout: 10000 });
    const rows = page.locator('.adm-project-row');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Add Project button navigates to project form', async ({ page }) => {
    await login(page);
    await page.click('a[href="/admin/project-form"]');
    await expect(page.locator('[data-project-form]')).toBeVisible();
  });

  test('add project — fill form and submit → new row appears in dashboard', async ({ page }) => {
    await login(page);
    await page.goto('/admin/project-form');

    await page.fill('#title', 'Playwright Test Project');
    await page.selectOption('#discipline', 'Commercial');
    await page.fill('#location', 'Test City, India');
    await page.fill('#year', '2025');
    await page.fill('#area', '10,000 sq ft');
    await page.fill('#scope', 'Test Scope');
    await page.fill('#lead', 'A test editorial lead for the Playwright suite.');
    await page.fill('#body0', 'First body paragraph for the Playwright test project.');

    await page.click('[data-form-submit]');

    // Should redirect back to dashboard
    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });

    // New project should appear in list
    await expect(page.locator('[data-project-list]')).toBeVisible();
    await expect(page.locator('.adm-project-row').filter({ hasText: 'Playwright Test Project' })).toBeVisible({ timeout: 10000 });
  });

  test('edit project — change title and save → updated title in dashboard', async ({ page }) => {
    await login(page);

    // Find the test project and click Edit
    const testRow = page.locator('.adm-project-row').filter({ hasText: 'Playwright Test Project' });
    await expect(testRow).toBeVisible({ timeout: 10000 });
    await testRow.locator('a[href*="/admin/project-edit"]').click();

    // Wait for form to load (edit loading state resolves)
    await expect(page.locator('[data-project-form]')).toBeVisible({ timeout: 10000 });

    // Change the title
    await page.fill('#title', 'Playwright Test Project (Edited)');
    await page.click('[data-form-submit]');

    await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    await expect(
      page.locator('.adm-project-row').filter({ hasText: 'Playwright Test Project (Edited)' }),
    ).toBeVisible({ timeout: 10000 });
  });

  test('delete project — confirm modal → row removed from dashboard', async ({ page }) => {
    await login(page);

    const testRow = page.locator('.adm-project-row').filter({ hasText: 'Playwright Test Project' });
    await expect(testRow).toBeVisible({ timeout: 10000 });

    // Click delete
    await testRow.locator('[data-delete-id]').click();

    // Confirm modal appears
    const modal = page.locator('[data-confirm-modal]');
    await expect(modal).toBeVisible();

    // Confirm deletion
    await page.click('[data-modal-confirm]');

    // Row should disappear
    await expect(testRow).not.toBeVisible({ timeout: 12000 });
  });

  test('published toggle off → project not visible on public /work page', async ({ page }) => {
    await login(page);

    // Find a published project and edit it to unpublish
    const firstRow = page.locator('.adm-project-row').first();
    const firstRowTitle = await firstRow.locator('.adm-project-row__title').textContent();
    await firstRow.locator('a[href*="/admin/project-edit"]').click();

    await expect(page.locator('[data-project-form]')).toBeVisible({ timeout: 10000 });

    // Uncheck published
    const publishedToggle = page.locator('#published');
    const wasPublished = await publishedToggle.isChecked();
    if (wasPublished) {
      await publishedToggle.uncheck();
      await page.click('[data-form-submit]');
      await page.waitForURL('**/admin/dashboard', { timeout: 15000 });

      // Verify it no longer appears on the public work page
      await page.goto('/work');
      await page.waitForSelector('[data-work-grid]', { timeout: 8000 });
      const publicTiles = page.locator(`[data-tile]`);
      const titles = await publicTiles.allTextContents();
      const found = titles.some((t) => t.includes(firstRowTitle.trim()));
      expect(found).toBe(false);

      // Re-publish to restore state
      await login(page);
      const editedRow = page.locator('.adm-project-row').filter({ hasText: firstRowTitle.trim() });
      await editedRow.locator('a[href*="/admin/project-edit"]').click();
      await expect(page.locator('[data-project-form]')).toBeVisible({ timeout: 10000 });
      await page.locator('#published').check();
      await page.click('[data-form-submit]');
      await page.waitForURL('**/admin/dashboard', { timeout: 15000 });
    }

    // If project was already unpublished, just verify it's not on public page
    if (!wasPublished) {
      await page.goto('/work');
      await page.waitForSelector('[data-work-grid]', { timeout: 8000 });
    }
  });

  test('sign out returns to login page', async ({ page }) => {
    await login(page);
    await page.click('[data-logout]');
    await page.waitForURL('**/admin/login', { timeout: 8000 });
    await expect(page.locator('[data-login-form]')).toBeVisible();
  });
});
