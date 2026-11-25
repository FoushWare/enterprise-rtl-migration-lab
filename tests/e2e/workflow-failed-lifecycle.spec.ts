import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

// Migrated from the retired controlled-apply panel. An applied change is followed by a source edit, and the authorized
// rollback from the workflow is refused as a source integrity conflict. The refusal writes nothing, keeps the applied state
// and records one ROLLBACK_FAILED audit event with a structured reason and no source content.
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const companion = 'http://127.0.0.1:4318';
const dashboardHeaders = { origin: 'http://127.0.0.1:4320', 'content-type': 'application/json' };
const digest = (text: string) => createHash('sha256').update(text).digest('hex');

test('a rollback refused by a later source edit records ROLLBACK_FAILED and keeps the applied state', async ({ page, request }, testInfo) => {
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
    await page.getByRole('button', { name: /^Apply 1 change/ }).click();
    await page.getByRole('button', { name: 'Apply to source' }).click();
    await expect(page.getByRole('heading', { name: 'Changes applied' })).toBeVisible({ timeout: 180_000 });
    const appliedSha256 = digest(readFileSync(sourceFile, 'utf8'));
    expect(appliedSha256).not.toBe(digest(originalText));

    // A later edit by someone else, then the authorized rollback.
    writeFileSync(sourceFile, readFileSync(sourceFile, 'utf8') + '\n// rollback conflict edit\n');
    const editedSha256 = digest(readFileSync(sourceFile, 'utf8'));
    const report = JSON.parse(readFileSync(process.env.RTL_E2E_REPORT ?? '', 'utf8'));
    const found = await (await request.get(`${companion}/review/workflows?inputDigest=${report.inputDigest}&policyDigest=${report.policyDigest}&mode=one-by-one`, { headers: { origin: dashboardHeaders.origin } })).json();
    const workflow = found.workflow ?? found;
    expect(workflow?.state).toBe('Applied');
    const refused = await request.post(`${companion}/review/workflows/${workflow.id}/rollback`, { headers: dashboardHeaders, data: { confirmation: 'ROLLBACK_CONFIRMED' } });
    expect(refused.status()).toBe(409);
    expect((await refused.json()).error).toBe('ROLLBACK_CONFLICT');
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(editedSha256);

    // Exactly one structured failure for this authorized attempt; no source content in the journal.
    const events = (await (await request.get(`${companion}/review/audit?sourcePath=${encodeURIComponent(sourcePath)}`, { headers: { origin: dashboardHeaders.origin } })).json()).events;
    const failures = events.filter((event: { type: string }) => event.type === 'ROLLBACK_FAILED');
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatchObject({ reason: 'CURRENT_SOURCE_CHANGED', path: sourcePath, resultingSha256: editedSha256 });
    expect(JSON.stringify(events)).not.toContain('rollback conflict edit');

    // The applied state is still shown after the refusal and survives a reload.
    await page.reload();
    await expect(page.getByText(/blocked|Source context blocked/).first()).toBeVisible({ timeout: 30_000 });
    const after = await (await request.get(`${companion}/review/workflows?inputDigest=${report.inputDigest}&policyDigest=${report.policyDigest}&mode=one-by-one`, { headers: { origin: dashboardHeaders.origin } })).json();
    expect((after.workflow ?? after).state).toBe('Applied');
  } finally {
    writeFileSync(sourceFile, originalText);
    expect(digest(readFileSync(sourceFile, 'utf8'))).toBe(digest(originalText));
  }
});
