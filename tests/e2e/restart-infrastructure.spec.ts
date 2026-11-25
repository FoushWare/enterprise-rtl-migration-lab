import { createHash } from 'node:crypto';
import { cpSync, mkdtempSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, type ChildProcess } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { expect, test } from '@playwright/test';

const companionPort = 4319;
const fixtureSource = (testInfo: { config: { metadata?: Record<string, unknown> } }) => { const root = testInfo.config.metadata?.portableFixtureRoot; if (typeof root !== 'string' || !root) throw new Error('PORTABLE_FIXTURE_UNAVAILABLE'); return root; };
const dashboard = 'http://127.0.0.1:4320/rtl-report-dashboard.html';

function getHealth(): Promise<any> {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port: companionPort, path: '/health' }, response => {
      let body = '';
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => response.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`HEALTH_${response.statusCode}`)));
    });
    req.on('error', reject);
    req.end();
  });
}

async function waitForHealth(): Promise<any> {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    try { return await getHealth(); } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  throw new Error('COMPANION_READINESS_TIMEOUT');
}

function startCompanion(root: string, state: string): ChildProcess {
  return spawn(process.execPath, ['dist/tools/rtl-scanner/preview-companion.js'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      RTL_PREVIEW_PORT: String(companionPort),
      RTL_PROJECT_ROOT: root,
      RTL_REVIEW_STORE_PATH: join(state, 'review-records-v1.json'),
      RTL_EVIDENCE_STORE_PATH: join(state, 'review-evidence-v1.json'),
      RTL_MANUAL_CHANGE_STORE_PATH: join(state, 'manual-changes-v1.json'),
      RTL_SCAN_MANIFEST_STORE_PATH: join(state, 'scan-manifests-v1.json'),
      RTL_AUDIT_STORE_PATH: join(state, 'apply-audit-v1.json'),
      RTL_APPLY_BACKUP_ROOT: join(state, 'backups'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function stopOwned(child: ChildProcess): Promise<void> {
  if (child.exitCode !== null) return;
  const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
  child.kill('SIGTERM');
  await Promise.race([exited, new Promise((_, reject) => setTimeout(() => reject(new Error('COMPANION_SHUTDOWN_TIMEOUT')), 10_000))]);
}

test('restart infrastructure reconnects the same owned companion', async ({ page }, testInfo) => {
  const workspace = mkdtempSync(join(tmpdir(), 'rtl-restart-'));
  const root = join(workspace, 'project');
  const state = join(workspace, 'state');
  mkdirSync(state, { recursive: true });
  mkdirSync(join(state, 'backups'), { recursive: true });
  cpSync(fixtureSource(testInfo), root, { recursive: true });

  const sourceHash = createHash('sha256').update(readFileSync(join(root, 'apps/invoicing/src/components/InvoiceTable.tsx'))).digest('hex');
  const first = startCompanion(root, state);
  try {
    const before = await waitForHealth();
    expect(before.applicationOrigin).toBe('http://127.0.0.1:4200');
    await page.goto(dashboard);
    const firstHealth = await page.evaluate(async () => (await fetch('http://127.0.0.1:4319/health')).json());
    expect(firstHealth.ok).toBe(true);
    expect(firstHealth.service).toBe('rtl-preview-companion');
    await stopOwned(first);
    await expect.poll(() => getHealth().then(() => true).catch(() => false)).toBe(false);

    const second = startCompanion(root, state);
    try {
      const after = await waitForHealth();
      expect(after.applicationOrigin).toBe(before.applicationOrigin);
      await page.reload();
      const secondHealth = await page.evaluate(async () => (await fetch('http://127.0.0.1:4319/health')).json());
      expect(secondHealth.ok).toBe(true);
      expect(secondHealth.service).toBe(firstHealth.service);
      expect(createHash('sha256').update(readFileSync(join(root, 'apps/invoicing/src/components/InvoiceTable.tsx'))).digest('hex')).toBe(sourceHash);
    } finally {
      await stopOwned(second);
    }
  } finally {
    if (first.exitCode === null) await stopOwned(first);
  }
});
