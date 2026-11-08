import { expect, test } from '@playwright/test';

test('supports finding search, filters, sorting, and URL-backed navigation', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  await expect(page.getByText('Findings: search and filters')).toBeVisible();
  const search = page.getByRole('textbox', { name: 'Search findings' });
  await expect(page.getByText(/matching of .* findings/)).toBeVisible();

  await search.fill('RTL.BIDI.ISOLATION');
  await expect(page.locator('.finding-list .finding').first()).toBeVisible();
  await expect(page).toHaveURL(/q=RTL.BIDI.ISOLATION/);

  await page.locator('.filter-control').locator('select').nth(0).selectOption('Major');
  await expect(page.locator('.finding-list .finding')).toHaveCount(0);
  await expect(page.getByText('No findings match this scope.')).toBeVisible();

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.finding-list .finding').first()).toBeVisible();

  await search.fill('RTL.BIDI.ISOLATION');
  await page.locator('.finding-list .finding').first().click();
  await expect(page).toHaveURL(/finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea/);
  await page.reload();
  await expect(page.locator('.finding-list .finding.selected')).toContainText('bidi', { ignoreCase: true });

  await page.goBack();
  await expect(search).toHaveValue('');
  await page.goForward();
  await expect(page).toHaveURL(/finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea/);
  await page.screenshot({ path: '/private/tmp/phase22-finding-navigation.png', fullPage: true });
});
