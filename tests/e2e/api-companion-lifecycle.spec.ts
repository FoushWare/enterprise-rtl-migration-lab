// API-level integration tests for the companion's critical operations. They complement the UI suites: they run without the
// dashboard UI, so they cover operations that the UI does not expose in every layout. Run with the manual-preview runner:
//   RTL_REVIEW_SPECS=tests/e2e/api-companion-lifecycle.spec.ts node tests/e2e/run-review-workflows.mjs
import { readFileSync, existsSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import { test, expect } from '@playwright/test';

const origin = 'http://127.0.0.1:4318';
const dashboardOrigin = 'http://127.0.0.1:4320';
const bootstrap = (): string => JSON.parse(readFileSync(join(tmpdir(), 'rtl-analyzer-auth-' + userInfo().uid, 'companion-4318.json'), 'utf8')).bootstrap;
// Read lazily: this spec needs the manual-preview runner's environment file, and a missing file must not fail module load.
const environment = (): { dashboard: string } => {
  const file = process.env.RTL_MANUAL_ENVIRONMENT;
  if (!file) throw new Error('RTL_MANUAL_ENVIRONMENT is not set: run this spec with the manual-preview runner (see header)');
  return JSON.parse(readFileSync(file, 'utf8')) as { dashboard: string };
};
const report = (): { inputDigest: string; policyDigest: string; findings: { id: string; path: string }[] } => {
  const path = join(environment().dashboard, 'rtl-report.json');
  if (!existsSync(path)) throw new Error('fixture report missing: ' + path);
  return JSON.parse(readFileSync(path, 'utf8'));
};

async function mintSession(): Promise<string> {
  const response = await fetch(origin + '/auth/session', { method: 'POST', headers: { 'x-rtl-companion-bootstrap': bootstrap() } });
  expect(response.status).toBe(201);
  return ((await response.json()) as { token: string }).token;
}

test.describe('companion authorization', () => {
  test('protected reads are refused without a session; health exposes no filesystem path', async () => {
    // Plain fetch: the test runner's request contexts inherit the configured session header, which an anonymous client does not have.
    expect((await fetch(origin + '/review/progress')).status).toBe(401);
    expect((await fetch(origin + '/review/source-context?inputDigest=x&policyDigest=y&mode=one-by-one')).status).toBe(401);
    const health = await (await fetch(origin + '/health')).json();
    expect(health.projectRoot).toBeUndefined();
    expect(health.projectRootDigest).toMatch(/^[0-9a-f]{64}$/);
  });

  test('sessions are isolated and a revoked session stops working while the other keeps working', async () => {
    const a = await mintSession();
    const b = await mintSession();
    expect(a).not.toBe(b);
    const probe = (token: string) => fetch(origin + '/review/progress', { headers: { 'x-rtl-companion-session': token } }).then(r => r.status);
    expect(await probe(a)).toBe(200);
    expect(await probe(b)).toBe(200);
    const revoked = await fetch(origin + '/auth/revoke', { method: 'POST', headers: { 'x-rtl-companion-bootstrap': bootstrap(), 'content-type': 'application/json' }, body: JSON.stringify({ token: a }) }).then(r => r.json());
    expect(revoked).toEqual({ revoked: true });
    expect(await probe(a)).toBe(401);
    expect(await probe(b)).toBe(200);
  });

  test('a forged or unknown session is refused', async () => {
    const forged = await fetch(origin + '/review/progress', { headers: { 'x-rtl-companion-session': 'forged-token' } });
    expect(forged.status).toBe(401);
    const wrongBootstrap = await fetch(origin + '/auth/session', { method: 'POST', headers: { 'x-rtl-companion-bootstrap': 'wrong' } });
    expect(wrongBootstrap.status).toBe(401);
  });
});

test.describe('review writes: origin and approval gates', () => {
  test('a review write needs the dashboard Origin, not just a session', async () => {
    const token = await mintSession();
    const body = JSON.stringify({});
    const headers = { 'x-rtl-companion-session': token, 'content-type': 'application/json' };
    const missing = await fetch(origin + '/review/workflows', { method: 'POST', headers, body });
    expect(missing.status).toBe(403);
    expect(await missing.json()).toEqual({ error: 'ORIGIN_NOT_ALLOWED' });
    const foreign = await fetch(origin + '/review/workflows', { method: 'POST', headers: { ...headers, origin: 'http://evil.example' }, body });
    expect(foreign.status).toBe(403);
    const dashboard = await fetch(origin + '/review/workflows', { method: 'POST', headers: { ...headers, origin: dashboardOrigin }, body });
    expect(dashboard.status).not.toBe(403);
  });

  test('applying without an approved review or confirmation is refused without mutation', async () => {
    const token = await mintSession();
    const headers = { 'x-rtl-companion-session': token, origin: dashboardOrigin, 'content-type': 'application/json' };
    const unknownWorkflow = await fetch(origin + '/review/workflows/does-not-exist/apply', { method: 'POST', headers, body: JSON.stringify({ confirmation: 'APPLY_CONFIRMED' }) });
    expect((await unknownWorkflow.json()).error).toBe('WORKFLOW_NOT_FOUND');
    const unapproved = await fetch(origin + '/review/apply', { method: 'POST', headers, body: JSON.stringify({ identity: { findingId: 'x', sourcePath: 'apps/invoicing/src/components/InvoiceTable.tsx', inputDigest: 'a', policyDigest: 'b', schemaVersion: 2 }, confirmation: '' }) });
    expect(unapproved.status).toBe(400);
    expect((await unapproved.json()).error).toBe('APPROVED_REVIEW_REQUIRED');
  });

  test('source context is unreadable without a session and answers identity mismatches with a session', async () => {
    const path = '/review/source-context?inputDigest=wrong&policyDigest=wrong&mode=one-by-one';
    expect((await fetch(origin + path)).status).toBe(401);
    const token = await mintSession();
    const authorized = await fetch(origin + path, { headers: { 'x-rtl-companion-session': token } });
    expect(authorized.status).toBe(409);
    expect((await authorized.json()).error).toBe('DASHBOARD_SOURCE_IDENTITY_MISMATCH');
  });
});

test.describe('original and candidate preview contracts', () => {
  test('the original preview route resolves in LTR and RTL for a configured finding', async () => {
    const token = await mintSession();
    const current = report();
    const finding = current.findings.find(f => f.id.startsWith('RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea')) ?? current.findings[0];
    for (const mode of ['ltr', 'rtl']) {
      const query = new URLSearchParams({ findingId: finding.id, inputDigest: current.inputDigest, policyDigest: current.policyDigest, mode });
      const response = await fetch(origin + '/contextual-preview?' + query, { headers: { 'x-rtl-companion-session': token } });
      expect(response.status, `mode ${mode}`).toBe(200);
      const body = await response.json();
      expect(body.route, `route for ${mode}`).toBeTruthy();
    }
  });

  test('the preview contract refuses a mismatched finding digest without leaking source', async () => {
    const token = await mintSession();
    const current = report();
    const query = new URLSearchParams({ findingId: current.findings[0].id, inputDigest: 'stale', policyDigest: current.policyDigest, mode: 'ltr' });
    const response = await fetch(origin + '/contextual-preview?' + query, { headers: { 'x-rtl-companion-session': token } });
    expect(response.status).not.toBe(401);
    expect(await response.text()).not.toContain('export ');
  });
});
