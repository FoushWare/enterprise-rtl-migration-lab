// Persistent disposable environment for Ahmed's browser acceptance. Ctrl-C cleans it up.
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { writePreviewRuntimeConfig } from '../../dist/tools/rtl-scanner/preview-runtime.js';
import { dashboard, project, repo, state } from './portable-fixture.mjs';

const originalConfig = await writePreviewRuntimeConfig(project, { role: 'original', sessionId: 'original', sourceSha256: createHash('sha256').update(readFileSync(join(project, 'apps/invoicing/src/components/InvoiceTable.tsx'))).digest('hex') });

const env = { ...process.env, RTL_PROJECT_ROOT: project,
  RTL_REVIEW_STORE_PATH: join(state, 'review-records-v1.json'),
  RTL_EVIDENCE_STORE_PATH: join(state, 'review-evidence-v1.json'),
  RTL_MANUAL_CHANGE_STORE_PATH: join(state, 'manual-changes-v1.json'),
  RTL_SCAN_MANIFEST_STORE_PATH: join(state, 'scan-manifests-v1.json'),
  RTL_AUDIT_STORE_PATH: join(state, 'apply-audit-v1.json'), RTL_APPLY_BACKUP_ROOT: join(state, 'backups') };
const children = [
  spawn(process.execPath, [join(repo, 'dist/tools/rtl-scanner/preview-companion.js')], { cwd: repo, env, stdio: 'inherit' }),
  spawn(process.execPath, [join(repo, 'node_modules/vite/bin/vite.js'), '--config', originalConfig, '--host', '127.0.0.1', '--port', '4200', '--strictPort'], { cwd: project, stdio: 'inherit' }),
  spawn('python3', ['-m', 'http.server', '4320', '--bind', '127.0.0.1'], { cwd: dashboard, stdio: 'inherit' }),
];
const identity = { supervisorPid: process.pid, project, dashboard, state, children: children.map(p => p.pid), dashboardUrl: 'http://127.0.0.1:4320/rtl-report-dashboard.html' };
writeFileSync(join(dirname(project), 'environment.json'), JSON.stringify(identity, null, 2));
console.log('MANUAL_PREVIEW_ENVIRONMENT', JSON.stringify(identity));
let stopping = false;
async function stop() {
  if (stopping) return;
  stopping = true;
  await Promise.all(children.map(child => new Promise(resolve => {
    if (child.exitCode !== null) return resolve();
    child.once('exit', resolve); child.kill('SIGTERM');
  })));
  process.exit(0);
}
process.on('SIGTERM', stop); process.on('SIGINT', stop);
for (const child of children) child.once('exit', () => { if (!stopping) void stop(); });
