import { test, expect } from '@playwright/test';

test.describe('Phase 4 — Contact page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/contact');
  });

  test('hero, form, details, and map are present', async ({ page }) => {
    await expect(page.locator('.vm-page-hero h1')).toContainText(
      "Let's build something exceptional together.",
    );
    await expect(page.locator('[data-contact-form]')).toBeVisible();
    await expect(page.locator('.vm-contact__details')).toBeVisible();
    await expect(page.locator('.vm-contact-map iframe')).toBeVisible();
  });

  test('Google Maps iframe targets google.com/maps', async ({ page }) => {
    const src = await page.locator('.vm-contact-map iframe').getAttribute('src');
    expect(src).toContain('google.com/maps');
  });

  test('submitting with empty required fields shows inline errors', async ({ page }) => {
    await page.locator('[data-submit]').click();
    await expect(page.locator('.vm-field.is-invalid')).toHaveCount(3);
    const status = page.locator('[data-form-status]');
    await expect(status).toHaveClass(/is-error/);
  });

  test('a malformed email surfaces an email-specific error', async ({ page }) => {
    await page.locator('#cf-name').fill('Test User');
    await page.locator('#cf-email').fill('not-an-email');
    await page.locator('#cf-message').fill('Hello, exploring a fit-out.');
    await page.locator('[data-submit]').click();
    const emailField = page.locator('#cf-email').locator('..');
    await expect(emailField).toHaveClass(/is-invalid/);
    await expect(emailField.locator('.vm-field__error')).toContainText(/email/i);
  });

  test('honeypot field is visually hidden and out of tab order', async ({ page }) => {
    const hp = page.locator('.vm-honeypot');
    await expect(hp).toBeAttached();
    const display = await hp.evaluate((el) => getComputedStyle(el).position);
    expect(display).toBe('absolute');
    const tabindex = await page.locator('input[name="website"]').getAttribute('tabindex');
    expect(tabindex).toBe('-1');
  });
});
