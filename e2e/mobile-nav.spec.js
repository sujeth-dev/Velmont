import { test, expect } from '@playwright/test';

// The hamburger toggle only exists (visually) below the 1024px breakpoint —
// see src/css/nav.css. Desktop viewports get their own sanity check instead
// of the open/close behavior, so this suite runs against every project but
// asserts different things depending on viewport width.

test.describe('Mobile nav toggle', () => {
  test('desktop: toggle is hidden, links are directly visible', async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport.width < 1024, 'desktop-only assertion');

    await page.goto('/');
    await expect(page.locator('.vm-nav__toggle')).toBeHidden();
    await expect(page.locator('.vm-nav__links')).toBeVisible();
  });

  test('mobile/tablet: panel is closed by default, opens on toggle click', async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport.width >= 1024, 'mobile/tablet-only assertion');

    await page.goto('/');
    const toggle = page.locator('.vm-nav__toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.vm-nav__links')).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('.vm-nav__links')).toBeVisible();
    await expect(page.locator('.vm-nav__link')).toHaveCount(4);

    // No horizontal overflow while the panel is open.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test('mobile/tablet: Escape closes the open panel', async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport.width >= 1024, 'mobile/tablet-only assertion');

    await page.goto('/');
    const toggle = page.locator('.vm-nav__toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.vm-nav__links')).toBeHidden();
  });

  test('mobile/tablet: clicking the toggle again closes the panel', async ({ page }) => {
    const viewport = page.viewportSize();
    test.skip(viewport.width >= 1024, 'mobile/tablet-only assertion');

    await page.goto('/');
    const toggle = page.locator('.vm-nav__toggle');
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('.vm-nav__links')).toBeHidden();
  });
});
