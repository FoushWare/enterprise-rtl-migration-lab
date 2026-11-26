import { disposeWorkspace, stopOwnedCompanion } from './owned-companion.js';
import { createHash } from 'node:crypto';
import { cpSync, existsSync, mkdirSync, mkdtempSync, realpathSync, readFileSync, renameSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir, userInfo } from 'node:os';
import { join } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { request } from 'node:http';
import { createServer as createNetServer } from 'node:net';
import { expect, test } from '@playwright/test';

let port = 4319;
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const identity = { findingId: 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea', sourcePath, inputDigest: '3011f559425f764e053dd89b48a060b24d79ce1d9a3eca068fb5e308fb81608a', policyDigest: 'fc82bc0137f0800c3c6818b55a14ef2ac9abaeb1b018d503834d9899183abf49', schemaVersion: 2 };
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
// Bounded request. A response that never completes, aborts, or is not JSON rejects with a diagnostic instead of hanging
// until the test timeout. Assertions are unchanged; this only makes a stall visible at its source.
const REQUEST_TIMEOUT_MS = 15_000;
// Authorized by default: every call carries the companion session minted for this run. Negative authorization tests override it.
let runSession: string | undefined;
const call = (path: string, body?: unknown, options: { session?: string | null; origin?: string | null } = {}) => new Promise<{ status: number; json: any }>((resolve, reject) => {
  const method = body === undefined ? 'GET' : 'POST';
  const session = options.session === undefined ? runSession : options.session;
  const origin = options.origin === undefined ? 'http://127.0.0.1:4320' : options.origin;
  const headers: Record<string, string> = body === undefined ? {} : { 'content-type': 'application/json' };
  if (origin !== null && body !== undefined) headers.origin = origin;
  if (session) headers['x-rtl-companion-session'] = session;
  const r = request({ host: '127.0.0.1', port, path, method, headers }, res => {
    let text = '';
    res.on('data', x => text += x);
    res.on('aborted', () => reject(new Error(`COMPANION_RESPONSE_ABORTED ${method} ${path}`)));
    res.on('error', error => reject(new Error(`COMPANION_RESPONSE_ERROR ${method} ${path}: ${error.message}`)));
    res.on('end', () => {
      try { resolve({ status: res.statusCode ?? 0, json: JSON.parse(text || '{}') }); }
      catch { reject(new Error(`COMPANION_RESPONSE_NOT_JSON ${method} ${path} status=${res.statusCode} body=${JSON.stringify(text.slice(0, 200))}`)); }
    });
  });
  r.setTimeout(REQUEST_TIMEOUT_MS, () => r.destroy(new Error(`COMPANION_REQUEST_TIMEOUT ${method} ${path} after ${REQUEST_TIMEOUT_MS}ms`)));
  r.on('error', reject);
  if (body !== undefined) r.write(JSON.stringify(body));
  r.end();
});
const start = (root: string, state: string) => spawn(process.execPath, ['dist/tools/rtl-scanner/preview-companion.js'], { cwd: process.cwd(), env: { ...process.env, RTL_PREVIEW_PORT: String(port), RTL_PROJECT_ROOT: root, RTL_REVIEW_STORE_PATH: join(state, 'review-records-v1.json'), RTL_EVIDENCE_STORE_PATH: join(state, 'review-evidence-v1.json'), RTL_MANUAL_CHANGE_STORE_PATH: join(state, 'manual-changes-v1.json'), RTL_SCAN_MANIFEST_STORE_PATH: join(state, 'scan-manifests-v1.json'), RTL_AUDIT_STORE_PATH: join(state, 'apply-audit-v1.json'), RTL_APPLY_BACKUP_ROOT: join(state, 'backups'), RTL_PREVIEW_OWNER_PID: String(process.pid) }, stdio: 'ignore' });
const stop = (child: ChildProcess) => stopOwnedCompanion(child);
let portableFixtureRoot: string;
test.beforeAll(({}, workerInfo) => { const root = workerInfo.config.metadata?.portableFixtureRoot; if (typeof root !== 'string' || !root) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE'); portableFixtureRoot = root; });
const fixture = () => { if (!portableFixtureRoot) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE'); const workspace = mkdtempSync(join(tmpdir(), 'rtl-security-')); const root = join(workspace, 'project'); const state = join(workspace, 'state'); mkdirSync(join(state, 'backups'), { recursive: true }); cpSync(portableFixtureRoot, root, { recursive: true }); return { workspace, root, state, source: join(root, sourcePath) }; };
const withCompanion = async (run: (f: ReturnType<typeof fixture>) => Promise<void>) => {
  const f = fixture();
  port = await new Promise<number>((resolve, reject) => { const probe = createNetServer(); probe.once('error', reject); probe.listen(0, '127.0.0.1', () => { const address = probe.address(); const selected = typeof address === 'object' && address ? address.port : 0; probe.close(() => resolve(selected)); }); });
  const child = start(f.root, f.state);
  try {
    let ready = false;
    for (let i = 0; i < 100; i++) {
      if (child.exitCode !== null) throw new Error('OWNED_COMPANION_EXITED');
      try { const health = await call('/health'); if (health.status === 200 && health.json.projectRootDigest === createHash('sha256').update(realpathSync(f.root)).digest('hex')) { ready = true; break; } } catch {}
      await new Promise(r => setTimeout(r, 50));
    }
    if (!ready) throw new Error('OWNED_COMPANION_IDENTITY_UNAVAILABLE');
    // Mint this run's session with the companion's bootstrap (owner-only file). Negative tests can still send no session.
    const bootstrap = JSON.parse(readFileSync(join(tmpdir(), 'rtl-analyzer-auth-' + userInfo().uid, `companion-${port}.json`), 'utf8')).bootstrap as string;
    const issued = await new Promise<{ status: number; json: any }>((resolve, reject) => { const req = request({ host: '127.0.0.1', port, path: '/auth/session', method: 'POST', headers: { 'x-rtl-companion-bootstrap': bootstrap } }, res => { let text = ''; res.on('data', x => text += x); res.on('end', () => resolve({ status: res.statusCode ?? 0, json: JSON.parse(text || '{}') })); }); req.on('error', reject); req.end(); });
    expect(issued.status).toBe(201);
    runSession = issued.json.token as string;
    await run(f);
  } finally { await stop(child); disposeWorkspace(f.workspace); }
};

test('unauthorized apply is rejected without mutation or audit', async () => withCompanion(async f => { const before = readFileSync(f.source, 'utf8'); const result = await call('/review/apply', { identity, confirmation: 'APPLY_CONFIRMED' }); expect(result.status).toBe(400); expect(result.json.error).toBe('APPROVED_REVIEW_REQUIRED'); expect(readFileSync(f.source, 'utf8')).toBe(before); expect((await call('/review/audit?sourcePath=' + encodeURIComponent(sourcePath))).json.events).toEqual([]); }));
test('wrong identity is rejected without mutation or audit', async () => withCompanion(async f => { const before = readFileSync(f.source, 'utf8'); const result = await call('/review/apply', { identity: { ...identity, findingId: 'wrong' }, confirmation: 'APPLY_CONFIRMED' }); expect(result.status).toBe(400); expect(result.json.error).toBe('APPROVED_REVIEW_REQUIRED'); expect(readFileSync(f.source, 'utf8')).toBe(before); }));
test('invalid rollback is rejected without mutation or audit', async () => withCompanion(async f => { const before = readFileSync(f.source, 'utf8'); const result = await call('/review/rollback', { auditId: 'x', path: '../outside.ts', originalSha256: 'x', appliedSha256: 'y', backupPath: '../outside.bak', appliedAt: new Date().toISOString() }); expect(result.status).toBe(409); expect(result.json.error).toBe('INVALID_REVIEW_PATH'); expect(readFileSync(f.source, 'utf8')).toBe(before); expect((await call('/review/audit')).json.events).toEqual([]); }));
test('path traversal is rejected by the identity guard', async () => withCompanion(async f => { const before = readFileSync(f.source, 'utf8'); const result = await call('/review/apply', { identity: { ...identity, sourcePath: '../outside.ts' }, confirmation: 'APPLY_CONFIRMED' }); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_IDENTITY'); expect(readFileSync(f.source, 'utf8')).toBe(before); }));
test('symlink escape cannot be read or written', async () => withCompanion(async f => { const outside = join(f.workspace, 'outside.ts'); const original = readFileSync(f.source, 'utf8'); writeFileSync(outside, 'outside-secret'); const moved = f.source + '.real'; renameSync(f.source, moved); symlinkSync(outside, f.source); try { const result = await call('/review/rollback', { auditId: 'x', path: sourcePath, originalSha256: sha(original), appliedSha256: sha(original + 'candidate'), backupPath: join(f.state, 'missing.bak'), appliedAt: new Date().toISOString() }); expect(result.status).toBe(409); expect(String(result.json.error)).toMatch(/^(ELOOP|ROLLBACK_BACKUP_MISMATCH|ENOENT)/); expect(readFileSync(outside, 'utf8')).toBe('outside-secret'); } finally { renameSync(moved, f.source); } }));
test('stale source hash is rejected by the authoritative analyzer', async () => withCompanion(async f => { const source = readFileSync(f.source, 'utf8'); const result = await call('/review/codemod/analyze', { finding: { id: identity.findingId, path: sourcePath, line: 18, column: 69 }, sourceSha256: sha(source + 'changed') }); expect(result.status).toBe(409); expect(result.json.error).toBe('STALE_SOURCE'); expect(readFileSync(f.source, 'utf8')).toBe(source); }));
test('outside-root write attempt leaves trusted root and audit unchanged', async () => withCompanion(async f => { const outside = join(f.workspace, 'outside-write.ts'); const before = readFileSync(f.source, 'utf8'); const result = await call('/review/apply', { identity: { ...identity, sourcePath: '/tmp/outside-write.ts' }, confirmation: 'APPLY_CONFIRMED' }); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_IDENTITY'); expect(readFileSync(f.source, 'utf8')).toBe(before); expect(() => readFileSync(outside)).toThrow(); expect((await call('/review/audit')).json.events).toEqual([]); }));

test('codemod analysis rejects an invalid source path before reading', async () => withCompanion(async f => { const result = await call('/review/codemod/analyze', { finding: { id: identity.findingId, path: '../outside.ts', line: 1, column: 1 } }); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_PATH'); }));
test('lifecycle rejects an invalid source path before reading', async () => withCompanion(async () => { const result = await call('/review/lifecycle?' + new URLSearchParams({ ...identity, sourcePath: '../outside.ts' } as any)); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_PATH'); }));
test('review decisions reject an invalid source path before reading', async () => withCompanion(async () => { const result = await call('/review/decisions?' + new URLSearchParams({ ...identity, sourcePath: '../outside.ts' } as any)); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_PATH'); }));
test('manual changes reject an invalid source path before reading', async () => withCompanion(async () => { const result = await call('/review/manual-changes', { ...identity, sourcePath: '../outside.ts', beforeText: 'before', afterText: 'after' }); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_IDENTITY'); }));
test('source symlink escape is rejected before endpoint reads', async () => withCompanion(async f => { const outside = join(f.workspace, 'outside.ts'); const moved = f.source + '.real'; writeFileSync(outside, 'outside-secret'); renameSync(f.source, moved); symlinkSync(outside, f.source); try { const result = await call('/review/codemod/analyze', { finding: { id: identity.findingId, path: sourcePath, line: 1, column: 1 } }); expect(result.status).toBe(400); expect(result.json.error).toBe('REVIEW_SOURCE_NOT_ALLOWED'); expect(readFileSync(outside, 'utf8')).toBe('outside-secret'); } finally { renameSync(moved, f.source); } }));
test('decision POST rejects a symlink escape before reading outside the root', async () => withCompanion(async f => { const outside = join(f.workspace, 'outside.ts'); const moved = f.source + '.real'; writeFileSync(outside, 'outside-decision-secret'); renameSync(f.source, moved); symlinkSync(outside, f.source); try { const result = await call('/review/decisions', { ...identity, sourceDigest: sha('outside-decision-secret'), recommendation: 'Manual', recommendationRationale: 'security regression', eligibilityConstraints: [], blockers: [], selectedTreatment: 'Manual' }); expect(result.status).toBe(400); expect(result.json.error).toBe('REVIEW_SOURCE_NOT_ALLOWED'); expect(readFileSync(outside, 'utf8')).toBe('outside-decision-secret'); expect(existsSync(join(f.state, 'review-records-v1.json'))).toBe(false); } finally { renameSync(moved, f.source); } }));
test('apply eligibility rejects an invalid source path', async () => withCompanion(async () => { const result = await call('/review/apply/eligibility?' + new URLSearchParams({ ...identity, sourcePath: '../outside.ts' } as any)); expect(result.status).toBe(400); expect(result.json.error).toBe('INVALID_REVIEW_IDENTITY'); }));
test('apply eligibility returns a handled error when the source is missing', async () => withCompanion(async f => { renameSync(f.source, f.source + '.missing'); const result = await call('/review/apply/eligibility?' + new URLSearchParams(identity as any)); expect(result.status).toBe(400); expect(result.json.error).toBe('PROJECT_SOURCE_UNAVAILABLE'); }));

// Authorization negatives, kept separate from the guard tests above so each guard's assertion stays meaningful.
test('missing credentials return 401 and leave the source unchanged', async () => withCompanion(async f => {
  const before = readFileSync(f.source, 'utf8');
  const result = await call('/review/apply', { identity, confirmation: 'APPLY_CONFIRMED' }, { session: null });
  expect(result.status).toBe(401);
  expect(result.json.error).toBe('COMPANION_AUTH_REQUIRED');
  expect(readFileSync(f.source, 'utf8')).toBe(before);
}));

test('forged credentials are rejected with 401', async () => withCompanion(async f => {
  const before = readFileSync(f.source, 'utf8');
  const result = await call('/review/apply', { identity, confirmation: 'APPLY_CONFIRMED' }, { session: 'forged-token' });
  expect(result.status).toBe(401);
  expect(result.json.error).toBe('COMPANION_AUTH_REQUIRED');
  expect(readFileSync(f.source, 'utf8')).toBe(before);
}));

test('revoked credentials are rejected with 401', async () => withCompanion(async f => {
  const bootstrap = JSON.parse(readFileSync(join(tmpdir(), 'rtl-analyzer-auth-' + userInfo().uid, `companion-${port}.json`), 'utf8')).bootstrap as string;
  const token = runSession!;
  const revoked = await new Promise<number>((resolve, reject) => { const req = request({ host: '127.0.0.1', port, path: '/auth/revoke', method: 'POST', headers: { 'content-type': 'application/json', 'x-rtl-companion-bootstrap': bootstrap } }, res => { res.resume(); res.on('end', () => resolve(res.statusCode ?? 0)); }); req.on('error', reject); req.end(JSON.stringify({ token })); });
  expect(revoked).toBe(200);
  const result = await call('/review/apply', { identity, confirmation: 'APPLY_CONFIRMED' }, { session: token });
  expect(result.status).toBe(401);
  expect(result.json.error).toBe('COMPANION_AUTH_REQUIRED');
}));

test('an authenticated request with an invalid Origin is rejected with 403', async () => withCompanion(async f => {
  const before = readFileSync(f.source, 'utf8');
  const result = await call('/review/apply', { identity, confirmation: 'APPLY_CONFIRMED' }, { origin: 'http://evil.example' });
  expect(result.status).toBe(403);
  expect(result.json.error).toBe('ORIGIN_NOT_ALLOWED');
  expect(readFileSync(f.source, 'utf8')).toBe(before);
}));
