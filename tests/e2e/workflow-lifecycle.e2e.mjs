// Workflow lifecycle regression: prepare -> accept -> validate -> apply -> companion restart -> rollback, with exact
// SHA-256 restoration. Also covers a rollback refused after a later source edit, and the lifecycle of owned processes.
// Everything runs on a disposable copy of the portable fixture under the OS temporary directory. The companion runs on
// a free loopback port and is stopped by this test; nothing else is signalled.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { createServer } from 'node:net';
import { join } from 'node:path';

const fixture = await import('./portable-fixture.mjs');
const { project: fixtureProject, repo } = fixture;
const sourcePath = 'apps/invoicing/src/components/InvoiceTable.tsx';
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const dashboardOrigin = 'http://127.0.0.1:4320';
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const report = JSON.parse(readFileSync(join(fixture.dashboard, 'rtl-report.json'), 'utf8'));
const finding = report.findings.find((f) => f.id === findingId);

/** A private copy of the fixture project and state for one test, so tests never share source bytes or workflows. */
function freshWorkspace() {
  const workspace = mkdtempSync(join(tmpdir(), 'rtl-lifecycle-'));
  const project = join(workspace, 'project');
  const state = join(workspace, 'state');
  cpSync(fixtureProject, project, { recursive: true, verbatimSymlinks: true });
  mkdirSync(join(state, 'backups'), { recursive: true });
  return { workspace, project, state, sourceFile: join(project, sourcePath) };
}

/** Every test removes its own workspace, after success, failure or timeout. */
function disposeWorkspace(workspace) {
  rmSync(workspace, { recursive: true, force: true });
}

async function freePort() {
  return await new Promise((resolve, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolve(port)); });
  });
}

function startCompanion(port, { project, state }) {
  const env = {
    ...process.env,
    RTL_PREVIEW_PORT: String(port),
    RTL_PROJECT_ROOT: project,
    RTL_REVIEW_STORE_PATH: join(state, 'review-records-v1.json'),
    RTL_EVIDENCE_STORE_PATH: join(state, 'review-evidence-v1.json'),
    RTL_MANUAL_CHANGE_STORE_PATH: join(state, 'manual-changes-v1.json'),
    RTL_SCAN_MANIFEST_STORE_PATH: join(state, 'scan-manifests-v1.json'),
    RTL_AUDIT_STORE_PATH: join(state, 'apply-audit-v1.json'),
    RTL_APPLY_BACKUP_ROOT: join(state, 'backups'),
    // The companion exits if this test process dies, so an interrupted run cannot leave it behind.
    RTL_PREVIEW_OWNER_PID: String(process.pid),
  };
  const child = spawn(process.execPath, ['dist/tools/rtl-scanner/preview-companion.js'], { cwd: repo, env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.on('data', () => {});
  child.stderr.on('data', () => {});
  const exited = new Promise((resolve) => child.once('exit', (code, signal) => resolve({ code, signal })));
  return { child, exited, origin: `http://127.0.0.1:${port}` };
}

async function waitHealthy(origin) {
  for (let i = 0; i < 150; i++) {
    try { if ((await fetch(origin + '/health')).ok) return; } catch { /* not listening yet */ }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error('COMPANION_NOT_READY');
}

async function call(origin, method, path, body) {
  const response = await fetch(origin + path, {
    method,
    headers: { 'content-type': 'application/json', origin: dashboardOrigin },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  return { status: response.status, json };
}

async function stopCompanion(companion) {
  if (companion.child.exitCode !== null) return;
  companion.child.kill('SIGTERM');
  const result = await Promise.race([companion.exited, new Promise((resolve) => setTimeout(() => resolve('TIMEOUT'), 15_000))]);
  if (result === 'TIMEOUT') { companion.child.kill('SIGKILL'); throw new Error('COMPANION_DID_NOT_EXIT_ON_SIGTERM'); }
  return result;
}

async function beginAndAccept(origin) {
  const begin = await call(origin, 'POST', '/review/workflows', { inputDigest: report.inputDigest, policyDigest: report.policyDigest, mode: 'one-by-one', scope: [], restart: false });
  assert.equal(begin.status, 200);
  const workflow = begin.json.workflow;
  const identity = { inputDigest: report.inputDigest, policyDigest: report.policyDigest, findingId, application: 'invoicing', routeId: 'invoicing:invoices' };
  const prepared = await call(origin, 'POST', `/review/workflows/${workflow.id}/prepare-preview`, identity);
  assert.equal(prepared.status, 200, JSON.stringify(prepared.json));
  const accepted = await call(origin, 'POST', `/review/workflows/${workflow.id}/change`, { findingId, action: 'Accepted' });
  assert.equal(accepted.status, 200);
  return workflow;
}

test('validated changes apply, survive a companion restart, and roll back to the exact original bytes', async (t) => {
  const { workspace, project, state, sourceFile } = freshWorkspace();
  t.after(() => disposeWorkspace(workspace));
  const port = await freePort();
  const originalSha256 = sha256(sourceFile);
  let companion = startCompanion(port, { project, state });
  t.after(async () => { if (companion.child.exitCode === null) companion.child.kill('SIGKILL'); });
  await waitHealthy(companion.origin);

  const workflow = await beginAndAccept(companion.origin);
  const validated = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/validate`, {});
  assert.equal(validated.status, 200);
  assert.equal(validated.json.workflow.validation.state, 'Passed', JSON.stringify(validated.json.workflow.validation.checks));
  assert.equal(sha256(sourceFile), originalSha256, 'validation must not change the source');

  const applied = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/apply`, { confirmation: 'APPLY_CONFIRMED' });
  assert.equal(applied.status, 200, JSON.stringify(applied.json));
  assert.equal(applied.json.workflow.state, 'Applied');
  const appliedSha256 = sha256(sourceFile);
  assert.notEqual(appliedSha256, originalSha256);

  // Restart the companion. The applied workflow must persist, and the receipts must still authorize rollback.
  await stopCompanion(companion);
  companion = startCompanion(port, { project, state });
  await waitHealthy(companion.origin);
  const history = await call(companion.origin, 'GET', '/review/workflows?history=1');
  const persisted = history.json.workflows.find((w) => w.id === workflow.id);
  assert.equal(persisted?.state, 'Applied');

  const rolledBack = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/rollback`, { confirmation: 'ROLLBACK_CONFIRMED' });
  assert.equal(rolledBack.status, 200, JSON.stringify(rolledBack.json));
  assert.equal(rolledBack.json.workflow.state, 'Rolled Back');
  assert.equal(sha256(sourceFile), originalSha256, 'rollback must restore the exact original bytes');
  await stopCompanion(companion);
});

test('a rollback after a later source edit is refused with a conflict and changes nothing', async (t) => {
  const { workspace, project, state, sourceFile } = freshWorkspace();
  t.after(() => disposeWorkspace(workspace));
  const port = await freePort();
  const companion = startCompanion(port, { project, state });
  t.after(async () => { if (companion.child.exitCode === null) companion.child.kill('SIGKILL'); });
  await waitHealthy(companion.origin);

  const workflow = await beginAndAccept(companion.origin);
  const validated = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/validate`, {});
  assert.equal(validated.json.workflow.validation.state, 'Passed');
  const applied = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/apply`, { confirmation: 'APPLY_CONFIRMED' });
  assert.equal(applied.status, 200);

  writeFileSync(sourceFile, readFileSync(sourceFile, 'utf8') + '\n// lifecycle rollback conflict\n');
  const editedSha256 = sha256(sourceFile);
  const auditBefore = (await call(companion.origin, 'GET', '/review/audit?sourcePath=' + encodeURIComponent(sourcePath))).json.events;
  // An unauthorized request (no rollback confirmation) is refused and creates no audit record.
  const unauthorized = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/rollback`, { confirmation: 'nope' });
  assert.notEqual(unauthorized.status, 200);
  assert.equal(sha256(sourceFile), editedSha256);
  const refused = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/rollback`, { confirmation: 'ROLLBACK_CONFIRMED' });
  assert.equal(refused.status, 409);
  assert.equal(refused.json.error, 'ROLLBACK_CONFLICT');
  assert.equal(sha256(sourceFile), editedSha256, 'a refused rollback must not write the source');
  // Audit contract: exactly one ROLLBACK_FAILED for the authorized, conflicting attempt, with a structured reason and no source content.
  const auditAfter = (await call(companion.origin, 'GET', '/review/audit?sourcePath=' + encodeURIComponent(sourcePath))).json.events;
  const failures = auditAfter.filter((e) => e.type === 'ROLLBACK_FAILED');
  assert.equal(failures.length, 1);
  assert.equal(failures[0].reason, 'CURRENT_SOURCE_CHANGED');
  assert.equal(failures[0].resultingSha256, editedSha256);
  assert.equal(auditAfter.length, auditBefore.length + 1, 'only the authorized conflict may add an audit record');
  assert.equal(JSON.stringify(auditAfter).includes('lifecycle rollback conflict'), false, 'audit must not expose source content');
  // The applied state and the durable receipts are preserved after the refused rollback.
  const kept = (await call(companion.origin, 'GET', '/review/workflows?history=1')).json.workflows.find((w) => w.id === workflow.id);
  assert.equal(kept?.state, 'Applied');
  await stopCompanion(companion);
});

test('an approved change whose source changed after validation cannot be applied', async (t) => {
  const { workspace, project, state, sourceFile } = freshWorkspace();
  t.after(() => disposeWorkspace(workspace));
  const port = await freePort();
  const companion = startCompanion(port, { project, state });
  t.after(async () => { if (companion.child.exitCode === null) companion.child.kill('SIGKILL'); });
  await waitHealthy(companion.origin);

  const workflow = await beginAndAccept(companion.origin);
  const validated = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/validate`, {});
  assert.equal(validated.json.workflow.validation.state, 'Passed');

  const beforeEdit = sha256(sourceFile);
  writeFileSync(sourceFile, readFileSync(sourceFile, 'utf8') + '\n// stale after validation\n');
  const editedSha256 = sha256(sourceFile);
  assert.notEqual(editedSha256, beforeEdit);
  const refused = await call(companion.origin, 'POST', `/review/workflows/${workflow.id}/apply`, { confirmation: 'APPLY_CONFIRMED' });
  assert.equal(refused.status, 409, JSON.stringify(refused.json));
  assert.notEqual(refused.json.error, undefined);
  assert.equal(sha256(sourceFile), editedSha256, 'a stale apply must not write the source');
  await stopCompanion(companion);
});
