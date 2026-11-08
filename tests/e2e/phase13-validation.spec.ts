import { test, expect } from '@playwright/test';

test('Phase 1.3 validation and archived evidence recovery', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  await expect(page.getByText('Codemod Dry Run')).toBeVisible();
  await page.getByRole('button', { name: 'Propose Candidate' }).click();
  await expect(page.getByText(/Candidate session .* created/)).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Start Candidate Preview' }).click();
  await expect(page.getByRole('button', { name: 'Open Candidate LTR Preview' })).toBeVisible({ timeout: 30_000 });
  await page.getByRole('button', { name: 'Analyze Transformation' }).click();
  await expect(page.getByText('Analyzed: bidi-isolate-auto')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Apply to Candidate' }).click();
  await expect(page.getByRole('dialog')).toContainText('isolated candidate');
  await page.getByRole('dialog').getByRole('button', { name: 'Apply to Candidate' }).click();
  await expect(page.getByText('Candidate-applied patch')).toBeVisible({ timeout: 15_000 });
  await page.getByRole('button', { name: 'Run Validation' }).click();
  await expect(page.getByText('Passed', { exact: true })).toBeVisible({ timeout: 120_000 });
  await expect(page.locator('.validation-output')).toContainText('Scanner before: finding present');
  await expect(page.locator('.validation-output')).toContainText('Scanner after: finding absent');
  await expect(page.locator('.validation-output')).toContainText('html.dir=ltr');
  await expect(page.locator('.validation-output')).toContainText('html.dir=rtl');
  await page.screenshot({ path: '/private/tmp/phase132-workflow-validation.png', fullPage: true });
  await page.getByRole('button', { name: 'Archive Evidence' }).click();
  await expect(page.getByText('Evidence Archived')).toBeVisible({ timeout: 15_000 });
  await page.reload();
  await expect(page.locator('.archived-evidence')).toContainText('Archived Evidence', { timeout: 15_000 });
  await expect(page.locator('.archived-evidence')).toContainText('Scanner before: finding present');
  await page.screenshot({ path: '/private/tmp/phase132-workflow-recovered.png', fullPage: true });
});
