// Runtime reuse equivalence. The same navigation (prepare finding A, then finding B, on one review) runs twice: with candidate
// runtime reuse (default) and with the fresh-runtime control (RTL_PREVIEW_RUNTIME_REUSE=0). For TSX and for the same component
// transpiled to JSX, the rendered candidate DOM and direction must match between the two modes in LTR and RTL.
//
// Requires: a built scanner (npm run build in tools/rtl-scanner), Playwright Chromium, and free ports 4202-4212 for candidate
// runtimes. Every workspace and companion created here is removed, including after a failure.
//
// Run: node tests/e2e/runtime-reuse-equivalence.mjs
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { chromium } from '@playwright/test';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '../..');
const require = createRequire(import.meta.url);
const ts = require('typescript');
const { scan } = await import(join(repo, 'dist/tools/rtl-scanner/scan.js'));
const fixture = await import(join(here, 'portable-fixture.mjs'));

const COMPONENT = 'apps/invoicing/src/components/InvoiceTable';
const ROUTE_ID = 'invoicing:invoices';
const log = (...args) => console.log(new Date().toISOString().slice(11, 19), ...args);

async function freePort() {
  return await new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => { const { port } = probe.address(); probe.close(() => resolvePort(port)); });
  });
}

/** A disposable copy of the portable project. The JSX variant transpiles the component and keeps its module paths resolvable. */
function makeVariant(kind) {
  const workspace = mkdtempSync(join(tmpdir(), `rtl-reuse-${kind}-`));
  const project = join(workspace, 'project');
  cpSync(fixture.project, project, { recursive: true, verbatimSymlinks: true });
  if (kind === 'jsx') {
    const tsxPath = join(project, `${COMPONENT}.tsx`);
    const transpiled = ts.transpileModule(readFileSync(tsxPath, 'utf8'), {
      compilerOptions: { jsx: ts.JsxEmit.Preserve, target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      fileName: 'InvoiceTable.tsx',
    }).outputText;
    rmSync(tsxPath);
    // vite-tsconfig-paths resolves aliases for .ts and .tsx sources only, so the .jsx control imports the same modules by path.
    writeFileSync(join(project, `${COMPONENT}.jsx`), transpiled
      .replaceAll('"@atlas/shared"', '"../../../../libs/shared/src/index"')
      .replaceAll('"@atlas/design-system"', '"../../../../libs/design-system/src/index"'));
    const config = JSON.parse(readFileSync(join(project, 'rtl-preview.config.json'), 'utf8'));
    for (const mapping of config.mappings) mapping.source = mapping.source.replace(/\.tsx$/, '.jsx');
    writeFileSync(join(project, 'rtl-preview.config.json'), JSON.stringify(config, null, 2));
  }
  const state = join(workspace, 'state');
  mkdirSync(join(state, 'backups'), { recursive: true });
  return { workspace, project, state };
}

function startCompanion({ project, state, port, reuse }) {
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
    RTL_PREVIEW_OWNER_PID: String(process.pid),
    RTL_PREVIEW_RUNTIME_REUSE: reuse ? '1' : '0',
  };
  const child = spawn(process.execPath, [join(repo, 'dist/tools/rtl-scanner/preview-companion.js')], { cwd: repo, env, stdio: ['ignore', 'pipe', 'pipe'] });
  child.stdout.resume();
  child.stderr.resume();
  return child;
}

async function stopCompanion(child) {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise(resolveExit => child.once('exit', resolveExit));
  child.kill('SIGTERM');
  const graceful = await Promise.race([exited.then(() => true), new Promise(resolveTimer => setTimeout(() => resolveTimer(false), 15_000))]);
  if (!graceful) { child.kill('SIGKILL'); await exited; throw new Error('COMPANION_SHUTDOWN_TIMEOUT'); }
}

/** One mode of one variant: prepare A, then B; render each candidate in LTR and RTL. */
async function runMode(kind, reuse, browser) {
  const variant = makeVariant(kind);
  const port = await freePort();
  const companion = startCompanion({ ...variant, port, reuse });
  const origin = `http://127.0.0.1:${port}`;
  const post = async (path, body) => {
    const response = await fetch(origin + path, { method: 'POST', headers: { 'content-type': 'application/json', origin: 'http://127.0.0.1:4320' }, body: JSON.stringify(body) });
    return { status: response.status, json: await response.json().catch(() => ({})) };
  };
  try {
    for (let i = 0; i < 150; i++) { try { if ((await fetch(origin + '/health')).ok) break; } catch { /* not listening yet */ } await new Promise(r => setTimeout(r, 100)); }
    const report = await scan(variant.project);
    const extension = kind === 'jsx' ? 'jsx' : 'tsx';
    const bidi = report.findings
      .filter(f => f.path.endsWith(`InvoiceTable.${extension}`) && f.ruleId === 'RTL.BIDI.ISOLATION')
      .sort((a, b) => a.range.start.line - b.range.start.line);
    const findingA = bidi[0];
    const findingB = bidi.find(f => f.range.start.line !== findingA?.range.start.line);
    if (!findingA || !findingB) throw new Error(`FINDINGS_MISSING ${kind}`);
    const begin = await post('/review/workflows', { inputDigest: report.inputDigest, policyDigest: report.policyDigest, mode: 'one-by-one', scope: [], restart: false });
    if (begin.status !== 200) throw new Error(`BEGIN_FAILED ${begin.status}`);
    const workflowId = begin.json.workflow.id;
    const steps = [];
    for (const [label, finding] of [['A', findingA], ['B', findingB]]) {
      const prepared = await post(`/review/workflows/${workflowId}/prepare-preview`, { findingId: finding.id, application: 'invoicing', routeId: ROUTE_ID, inputDigest: report.inputDigest, policyDigest: report.policyDigest });
      const runtime = prepared.json.workflow?.session?.runtime ?? {};
      const step = { label, prepare: prepared.status, runtimeStatus: runtime.status ?? null, runtimePort: runtime.port ?? null, dom: {} };
      if (prepared.status === 200 && runtime.origin) {
        for (const mode of ['ltr', 'rtl']) {
          const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
          const pageErrors = [];
          page.on('pageerror', error => pageErrors.push(error.message.slice(0, 200)));
          page.on('response', response => { if (response.status() >= 400) pageErrors.push(`HTTP ${response.status()}`); });
          await page.goto(`${runtime.origin}/invoices?demo=unmigrated-rtl&lang=${mode === 'rtl' ? 'ar' : 'en'}`, { waitUntil: 'load', timeout: 60_000 });
          await page.waitForSelector('.toolbar', { timeout: 60_000 }).catch(() => undefined);
          step.dom[mode] = await page.evaluate(() => ({
            dir: document.documentElement.dir,
            links: [...document.querySelectorAll('.invoice-link')].slice(0, 6).map(link => link.innerHTML),
            bdi: document.querySelectorAll('bdi').length,
            bodyText: document.body.innerText.slice(0, 160),
          }));
          step.dom[mode].pageErrors = pageErrors.slice(0, 4);
          await page.close();
        }
      }
      steps.push(step);
    }
    return steps;
  } finally {
    await stopCompanion(companion).catch(error => log('companion stop', error.message));
    rmSync(variant.workspace, { recursive: true, force: true });
  }
}

const browser = await chromium.launch();
const results = {};
let failed = false;
try {
  for (const kind of ['tsx', 'jsx']) {
    for (const reuse of [true, false]) {
      const key = `${kind}-${reuse ? 'reuse' : 'fresh'}`;
      log('run', key);
      results[key] = await runMode(kind, reuse, browser);
    }
  }
} catch (error) {
  failed = true;
  console.error('RUNTIME_REUSE_EQUIVALENCE_ERROR', error.stack ?? error);
} finally {
  await browser.close();
}

const verdicts = {};
for (const kind of ['tsx', 'jsx']) {
  const reused = results[`${kind}-reuse`] ?? [];
  const fresh = results[`${kind}-fresh`] ?? [];
  const comparable = reused.length === 2 && fresh.length === 2;
  verdicts[kind] = {
    comparable,
    domEqualPerStep: comparable && reused.every((step, index) => JSON.stringify(step.dom) === JSON.stringify(fresh[index].dom)),
    rendered: comparable && reused.every(step => step.dom.ltr?.dir === 'ltr' && step.dom.rtl?.dir === 'rtl' && step.dom.ltr.links.length > 0 && step.dom.ltr.pageErrors.length === 0 && step.dom.rtl.pageErrors.length === 0),
    prepareStatuses: reused.map(step => step.prepare),
    reusePorts: reused.map(step => step.runtimePort),
    freshPorts: fresh.map(step => step.runtimePort),
  };
}
const passed = !failed && Object.values(verdicts).every(v => v.comparable && v.domEqualPerStep && v.rendered);
console.log('RUNTIME_REUSE_EQUIVALENCE ' + JSON.stringify({ passed, verdicts }, null, 1));
process.exitCode = passed ? 0 : 1;
