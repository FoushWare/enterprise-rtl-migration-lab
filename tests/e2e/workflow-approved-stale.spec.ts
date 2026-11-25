import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Migrated from the retired codemod panel. The reviewer approves and validates a change in the current workflow, the source
// then changes, and the authoritative workflow Apply must refuse it: no source write, no APPLIED audit record.
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const companion = 'http://127.0.0.1:4318';
const dashboardOrigin = { origin: 'http://127.0.0.1:4320', 'content-type': 'application/json' };
const digest = (text: string) => createHash('sha256').update(text).digest('hex');

test('an approved and validated change cannot be applied after its source changes', async ({ page, request }, testInfo) => {
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

    // The reviewed source changes before Apply.
    writeFileSync(sourceFile, originalText + '\n// approved stale edit\n');
    const editedSha256 = digest(readFileSync(sourceFile, 'utf8'));
    expect(editedSha256).not.toBe(digest(originalText));
    await page.reload();
    await expect(page.getByText(/blocked|Source context blocked/).first()).toBeVisible({ timeout: 30_000 });

    // The authoritative workflow apply refuses the stale approval.
    const report = JSON.parse(readFileSync(process.env.RTL_E2E_REPORT ?? '', 'utf8'));
    const history = await (await request.get(`${companion}/review/workflows?inputDigest=${report.inputDigest}&policyDigest=${report.policyDigest}&mode=one-by-one`, { headers: { origin: dashboardOrigin.origin } })).json();
    const workflow = history.workflow ?? history;
    expect(workflow?.id).toBeTruthy();
    const refused = await request.post(`${companion}/review/workflows/${workflow.id}/apply`, { headers: dashboardOrigin, data: { confirmation: 'APPLY_CONFIRMED' } });
    expect(refused.status()).toBe(409);
    expect((await refused.json()).error).toBe('STALE_ORIGINAL_SOURCE');
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(editedSha256);
    const audit = await (await request.get(`${companion}/review/audit?sourcePath=${encodeURIComponent(sourcePath)}`, { headers: { origin: dashboardOrigin.origin } })).json();
    expect(audit.events.some((event: { type: string }) => event.type === 'APPLIED')).toBe(false);
  } finally {
    writeFileSync(sourceFile, originalText);
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(digest(originalText));
  }
});
