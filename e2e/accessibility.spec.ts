import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC_ROUTES = ['/', '/products', '/cam-nang', '/gioi-thieu', '/lien-he', '/flash-sale'];

for (const route of PUBLIC_ROUTES) {
  test(`accessibility audit: ${route}`, async ({ page }) => {
    await page.goto(route);
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .exclude('#__next [aria-hidden="true"]')
      .analyze();

    expect(
      results.violations,
      `Found ${results.violations.length} accessibility violation(s) on ${route}:\n` +
        results.violations
          .map(
            v =>
              `  [${v.impact}] ${v.id}: ${v.description}\n` +
              v.nodes
                .slice(0, 2)
                .map(n => `    → ${n.html}`)
                .join('\n')
          )
          .join('\n')
    ).toEqual([]);
  });
}

test('skip-to-content link is present and focusable', async ({ page }) => {
  await page.goto('/');
  const skipLink = page.locator('a[href="#main-content"]');
  await expect(skipLink).toBeAttached();

  // Tab to focus it
  await page.keyboard.press('Tab');
  await expect(skipLink).toBeFocused();
});

test('main content landmark has correct id', async ({ page }) => {
  await page.goto('/');
  const main = page.locator('#main-content');
  await expect(main).toBeAttached();
  await expect(main).toHaveAttribute('tabindex', '-1');
});
