import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test } from './companion-test';

// Migrated from the retired lifecycle panel. A validated change whose source changes before Apply is shown as blocked in the
// reviewer's workflow, and the authoritative Apply refuses it with STALE_ORIGINAL_SOURCE without writing the source.
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const companion = 'http://127.0.0.1:4318';
const dashboardHeaders = { origin: 'http://127.0.0.1:4320', 'content-type': 'application/json' };
const digest = (text: string) => createHash('sha256').update(text).digest('hex');

test('a stale validated change is blocked on reload and cannot be applied', async ({ page, request }, testInfo) => {
  const fixtureRoot = testInfo.config.metadata?.portableFixtureRoot;
  if (typeof fixtureRoot !== 'string' || !fixtureRoot) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE');
  const sourceFile = `${fixtureRoot}/${sourcePath}`;
  const originalText = readFileSync(sourceFile, 'utf8');
  try {
    await page.goto(`http://127.0.0.1:4320/rtl-report-dashboard.html?finding=${encodeURIComponent(findingId)}`);
    await page.getByRole('button', { name: 'Start manual review' }).click();
    await page.getByRole('button', { name: /InvoiceTable\.tsx:19:15/ }).first().click();
    await page.getByRole('button', { name: 'Approve fix' }).click();
    await page.getByRole('heading', { name: 'Proposed change approved' }).waitFor({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Stay on this finding' }).click();
    await page.getByRole('button', { name: 'Validate changes', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Validation passed' })).toBeVisible({ timeout: 180_000 });
    await page.getByRole('button', { name: 'Back to review' }).click();

    writeFileSync(sourceFile, originalText + '\n// stale lifecycle edit\n');
    const editedSha256 = digest(readFileSync(sourceFile, 'utf8'));
    await page.reload();
    await expect(page.getByText(/blocked|Source context blocked/).first()).toBeVisible({ timeout: 30_000 });

    const report = JSON.parse(readFileSync(process.env.RTL_E2E_REPORT ?? '', 'utf8'));
    const found = await (await request.get(`${companion}/review/workflows?inputDigest=${report.inputDigest}&policyDigest=${report.policyDigest}&mode=one-by-one`, { headers: { origin: dashboardHeaders.origin } })).json();
    const workflow = found.workflow ?? found;
    const refused = await request.post(`${companion}/review/workflows/${workflow.id}/apply`, { headers: dashboardHeaders, data: { confirmation: 'APPLY_CONFIRMED' } });
    expect(refused.status()).toBe(409);
    expect((await refused.json()).error).toBe('STALE_ORIGINAL_SOURCE');
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(editedSha256);
    const events = (await (await request.get(`${companion}/review/audit?sourcePath=${encodeURIComponent(sourcePath)}`, { headers: { origin: dashboardHeaders.origin } })).json()).events;
    expect(events.some((event: { type: string }) => event.type === 'APPLIED')).toBe(false);
  } finally {
    writeFileSync(sourceFile, originalText);
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(digest(originalText));
  }
});
