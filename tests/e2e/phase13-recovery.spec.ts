import { test, expect } from '@playwright/test';

test('recovers archived validation evidence after companion restart', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  await expect(page.locator('.archived-evidence')).toContainText('Archived Evidence', { timeout: 15_000 });
  await expect(page.locator('.archived-evidence')).toContainText('Scanner before: finding present');
  await expect(page.locator('.archived-evidence')).toContainText('Browser/DOM evidence');
});
