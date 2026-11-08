import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

test('registers and recovers a durable manual implementation with stale guards', async ({ page, request }) => {
  const source = await readFile('apps/invoicing/src/components/InvoiceTable.tsx', 'utf8');
  const id = 'RTL.ICON.PROGRESSION:237172da962fe4d0605ddd83';
  await page.goto(`http://127.0.0.1:4320/rtl-report-dashboard.html?finding=${encodeURIComponent(id)}`);
  await expect(page.getByRole('heading', { name: 'Manual Implementation' })).toBeVisible();
  const panel = page.locator('.manual-workflow').last();
  await panel.locator('textarea').nth(0).fill(source + '\n');
  await panel.locator('textarea').nth(1).fill(source);
  const responsePromise = page.waitForResponse(r => r.url().includes('/review/manual-changes') && r.request().method() === 'POST', { timeout: 5000 }).catch(() => null);
  await panel.getByRole('button', { name: 'Register Manual Change' }).click();
  const response = await responsePromise;
  expect(response?.status()).toBe(201);
  await expect(panel.getByText('Manual change validated and persisted')).toBeVisible();
  await page.reload();
  await expect(page.locator('.manual-workflow').getByText('Manual change validated and persisted')).toBeVisible();
  const identity = new URLSearchParams({ findingId: id, sourcePath: 'apps/invoicing/src/components/InvoiceTable.tsx', inputDigest: 'input', policyDigest: 'policy', schemaVersion: '2' });
  const stale = await request.post('http://127.0.0.1:4318/review/manual-changes', { data: { findingId: id, sourcePath: 'apps/invoicing/src/components/InvoiceTable.tsx', inputDigest: 'input', policyDigest: 'policy', schemaVersion: 2, beforeText: source, afterText: source + '\n' } });
  expect(stale.status()).toBe(400);
  expect((await request.get('http://127.0.0.1:4318/review/manual-changes?' + identity)).ok()).toBeTruthy();
});

test('rejects invalid identity and unsafe manual registrations through the dashboard', async ({ page }) => {
  const source = await readFile('apps/invoicing/src/components/InvoiceTable.tsx', 'utf8');
  const id = 'RTL.ICON.PROGRESSION:237172da962fe4d0605ddd83';
  await page.goto(`http://127.0.0.1:4320/rtl-report-dashboard.html?finding=${encodeURIComponent(id)}`);
  const panel = page.locator('.manual-workflow').last();
  await expect(panel).toBeVisible();

  await panel.locator('textarea').nth(0).fill(source);
  await panel.locator('textarea').nth(1).fill(source);
  await panel.getByRole('button', { name: 'Register Manual Change' }).click();
  await expect(panel.getByText('MANUAL_CHANGE_UNCHANGED')).toBeVisible();

  await panel.locator('textarea').nth(0).fill(source);
  await panel.locator('textarea').nth(1).fill(source + '\n');
  await panel.getByRole('button', { name: 'Register Manual Change' }).click();
  await expect(panel.getByText('STALE_MANUAL_SOURCE')).toBeVisible();

  const invalid = await page.evaluate(async ({ source }) => {
    const response = await fetch('http://127.0.0.1:4318/review/manual-changes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ findingId: 'not-a-valid-finding', sourcePath: 'apps/invoicing/src/components/InvoiceTable.tsx', inputDigest: 'invalid', policyDigest: 'invalid', schemaVersion: 3, beforeText: source + '\n', afterText: source }),
    });
    return { status: response.status, body: await response.json() };
  }, { source });
  expect(invalid.status).toBe(400);
  expect(invalid.body.error).toBe('INVALID_REVIEW_IDENTITY');
});
