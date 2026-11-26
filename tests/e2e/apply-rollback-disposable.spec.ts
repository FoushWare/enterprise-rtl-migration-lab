import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { enterReview } from './enter-review';

// Current workflow path: Start manual review -> select finding -> Approve fix -> Validate changes -> Apply -> Rollback.
// The legacy codemod and controlled-apply panels are hidden for workflow-owned findings, so this spec drives the workflow.
// Source bytes are checked with SHA-256 before Apply, after Apply and after Rollback.
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const findingLocation = 'InvoiceTable.tsx:19:15';
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const digest = (text: string) => createHash('sha256').update(text).digest('hex');

test('one-by-one workflow validates, applies and rolls back the source with exact SHA-256 restoration', async ({ page }, testInfo) => {
  const fixtureRoot = testInfo.config.metadata?.portableFixtureRoot;
  if (typeof fixtureRoot !== 'string' || !fixtureRoot) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE');
  const sourceFile = `${fixtureRoot}/${sourcePath}`;
  const originalSha256 = digest(readFileSync(sourceFile, 'utf8'));
  const rollbackDialogs: string[] = [];
  page.on('dialog', dialog => { rollbackDialogs.push(dialog.message()); void dialog.accept(); });

  await page.goto(`http://127.0.0.1:4320/rtl-report-dashboard.html?finding=${encodeURIComponent(findingId)}`);
  await page.getByRole('button', { name: 'Start manual review' }).click();
  await page.getByRole('button', { name: new RegExp(findingLocation.replace(/[.]/g, '\\.')) }).first().click();

  await page.getByRole('button', { name: 'Approve fix' }).click();
  await expect(page.getByRole('heading', { name: 'Proposed change approved' })).toBeVisible();
  await page.getByRole('button', { name: 'Stay on this finding' }).click();
  await page.getByRole('button', { name: 'Validate changes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Validation passed' })).toBeVisible({ timeout: 120_000 });
  await expect(page.getByText('Your original source files have not changed.')).toBeVisible();
  expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(originalSha256);

  await page.getByRole('button', { name: /^Apply 1 change/ }).click();
  await expect(page.getByRole('heading', { name: 'Apply changes to source' })).toBeVisible();
  await expect(page.getByRole('dialog').getByText(sourcePath)).toBeVisible();
  await page.getByRole('button', { name: 'Apply to source' }).click();
  await expect(page.getByRole('heading', { name: 'Changes applied' })).toBeVisible({ timeout: 120_000 });
  const appliedSha256 = digest(readFileSync(sourceFile, 'utf8'));
  expect(appliedSha256).not.toBe(originalSha256);

  await page.getByRole('button', { name: 'Rollback applied changes' }).first().click();
  await expect.poll(() => rollbackDialogs.length, { timeout: 30_000 }).toBeGreaterThan(0);
  await expect(page.getByText('Rollback succeeded · Automatic rescan complete · Fresh review ready.')).toBeVisible({ timeout: 120_000 });
  expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(originalSha256);
  expect(digest(readFileSync(sourceFile, 'utf8'))).not.toBe(appliedSha256);
});

// Ported from the retired legacy-panel copy (`disposable candidate validation persists through reload`). The supported
// workflow replaces the Codemod Dry Run panel: the disposable candidate's validation must still be the recorded state
// after a reload, the original source must be untouched, and nothing may be applied by the reload itself.
test('disposable candidate validation persists through reload without changing the original source', async ({ page }, testInfo) => {
  const fixtureRoot = testInfo.config.metadata?.portableFixtureRoot;
  if (typeof fixtureRoot !== 'string' || !fixtureRoot) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE');
  const sourceFile = `${fixtureRoot}/${sourcePath}`;
  const originalSha256 = digest(readFileSync(sourceFile, 'utf8'));

  await page.goto(`http://127.0.0.1:4320/rtl-report-dashboard.html?finding=${encodeURIComponent(findingId)}`);
  await page.getByRole('button', { name: 'Start manual review' }).click();
  await page.getByRole('button', { name: new RegExp(findingLocation.replace(/[.]/g, '\\.')) }).first().click();
  await page.getByRole('button', { name: 'Approve fix' }).click();
  await expect(page.getByRole('heading', { name: 'Proposed change approved' })).toBeVisible();
  await page.getByRole('button', { name: 'Stay on this finding' }).click();
  await page.getByRole('button', { name: 'Validate changes', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Validation passed' })).toBeVisible({ timeout: 120_000 });
  const validatedHash = digest(readFileSync(sourceFile, 'utf8'));
  expect(validatedHash).toBe(originalSha256);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await enterReview(page, 'one-by-one');
  // The recorded validation survives the reload: the status is the record's, never "Not run".
  await expect(page.locator('.workflow-validation')).toContainText(/Validation: (Passed|Limited validation)/, { timeout: 30_000 });
  await expect(page.locator('.workflow-validation')).not.toContainText('Not run');
  expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(originalSha256);
});
