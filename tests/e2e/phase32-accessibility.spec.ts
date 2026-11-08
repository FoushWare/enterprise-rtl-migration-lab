import { expect, test } from '@playwright/test';

test('supports keyboard finding navigation, live feedback, and accessible candidate confirmation', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  const search = page.getByRole('textbox', { name: 'Search findings' });
  await search.focus();
  await page.locator('.filter-control select').first().focus();
  await expect(page.locator('.filter-control select').first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await search.fill('RTL.BIDI.ISOLATION');
  await page.locator('.finding-list .finding').first().click();
  await expect(page.getByRole('button', { name: 'Next finding' })).toBeVisible();
  await page.getByRole('button', { name: 'Next finding' }).click();
  await expect(page.locator('[role="status"]')).toContainText('findings available');
  await search.fill('RTL.BIDI.ISOLATION');
  await page.locator('.finding-list .finding').first().click();

  await page.getByRole('button', { name: 'Propose Candidate' }).click();
  await expect(page.getByRole('button', { name: /Propose Candidate|Start Candidate Preview/ }).first()).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Analyze Transformation' }).click();
  await expect(page.getByText('Analyzed: bidi-isolate-auto')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Apply to Candidate' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Apply to Candidate' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.finding-list .finding').first()).toBeVisible();
});
