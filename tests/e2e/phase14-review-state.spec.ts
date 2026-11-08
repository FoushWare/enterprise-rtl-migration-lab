import { expect, test } from '@playwright/test';

test('renders unified contextual review state without the legacy selector', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  await page.getByText('FINDING DETAILS').waitFor();
  await expect(page.getByText('Review Workspace')).toBeVisible();
  await expect(page.getByText(/Offline assessment:/)).toBeVisible();
  await expect(page.locator('.review-panel select')).toHaveCount(0);
  await expect(page.getByText('Approval is a review decision only; it never modifies source.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Propose Candidate' })).toBeVisible();
});
