import { expect, test } from '@playwright/test';

const finding = (id: string, original = id, context = 'ctx') => ({ id, ruleId: 'R', ruleVersion: 1, category: 'MANUAL_REVIEW', severity: 'Minor', confidence: 'High', title: id, sourceMechanism: 'css', applications: ['invoicing'], path: 'fixture.tsx', range: { start: { offset: 0, line: 1, column: 1 }, end: { offset: 1, line: 1, column: 2 } }, original, context, ownership: 'test', rationale: 'test', treatment: 'review', evidenceIds: [], relatedLocations: [], issueIds: [], suggestion: null, limitation: 'test' });
const manifest = (findings: unknown[], complete = true, id = crypto.randomUUID()) => ({ scanId: id, inputDigest: 'input-'+id, policyDigest: 'policy', timestamp: new Date().toISOString(), sourceCoverage: { complete, filesAnalyzed: complete ? 1 : 0, filesExpected: 1 }, findings });

test('rescan persists reconciliation and protects incomplete coverage', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  const first = manifest([finding('old')], true, 'scan-1');
  const second = manifest([finding('old', 'changed', 'changed-context'), finding('new')], true, 'scan-2');
  const incomplete = manifest([finding('new')], false, 'scan-3');
  const completeResolved = manifest([finding('new')], true, 'scan-4');
  const ghostBaseline = manifest([finding('ghost')], true, 'scan-5');
  const ghostIncomplete = manifest([], false, 'scan-6');
  const ghostRestored = manifest([finding('ghost')], true, 'scan-7');
  const ghostResolved = manifest([], true, 'scan-8');
  const post = (m: unknown) => page.evaluate(async manifest => { const r = await fetch('http://127.0.0.1:4318/review/rescan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project: 'invoicing', manifest }) }); return { status: r.status, body: await r.json() }; }, m);
  expect((await post(first)).status).toBe(201);
  expect((await post(second)).body.reconciliation.map((x: { status: string }) => x.status)).toEqual(expect.arrayContaining(['Changed', 'New']));
  expect((await post(completeResolved)).body.reconciliation.find((x: { findingId: string }) => x.findingId === 'old').status).toBe('Resolved');
  await post(ghostBaseline);
  expect((await post(ghostRestored)).body.reconciliation.find((x: { findingId: string }) => x.findingId === 'ghost').status).toBe('Unresolved');
  expect((await post(ghostIncomplete)).body.reconciliation.find((x: { findingId: string }) => x.findingId === 'ghost').status).toBe('Stale');
  await post(ghostBaseline);
  expect((await post(ghostResolved)).body.reconciliation.find((x: { findingId: string }) => x.findingId === 'ghost').status).toBe('Resolved');
  const persisted = await page.evaluate(async () => (await fetch('http://127.0.0.1:4318/review/rescan')).json());
  expect(persisted.scans).toHaveLength(8);
  await page.reload();
  await expect(page.getByText(/Rescan persisted:/)).toBeVisible();
  const responsePromise = page.waitForResponse(response => response.url().endsWith('/review/rescan') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Rescan authoritative report' }).click();
  expect((await responsePromise).status()).toBe(201);
  const invalid = await page.evaluate(async () => { const r = await fetch('http://127.0.0.1:4318/review/rescan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project: 'other', manifest: {} }) }); return r.status; });
  expect(invalid).toBe(400);
  const invalidCoverage = await page.evaluate(async () => { const r = await fetch('http://127.0.0.1:4318/review/rescan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ project: 'invoicing', manifest: { scanId: 'bad', inputDigest: 'bad', policyDigest: 'bad', timestamp: new Date().toISOString(), sourceCoverage: { complete: true, filesAnalyzed: 2, filesExpected: 1 }, findings: [] } }) }); return r.status; });
  expect(invalidCoverage).toBe(400);
});

test('restores durable rescan results after companion restart', async ({ page }) => {
  await page.goto('http://127.0.0.1:4320/rtl-report-dashboard.html');
  const persisted = await page.evaluate(async () => (await fetch('http://127.0.0.1:4318/review/rescan')).json());
  expect(persisted.scans.length).toBeGreaterThanOrEqual(4);
  await expect(page.getByText(/Rescan persisted:/)).toBeVisible();
});
