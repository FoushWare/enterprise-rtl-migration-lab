import { cpSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { homedir, tmpdir } from 'node:os';
import { resolveScannerRuntime } from './runtime-path.mjs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RUNTIME_DIR = resolveScannerRuntime();
const repo = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const workspace = mkdtempSync(join(realpathSync(tmpdir()), 'rtl-analyzer-e2e-'));
const project = join(workspace, 'project');
const state = join(workspace, 'state');

// Failure diagnostics: capture the CLI's stdout, stderr and exit status. Machine-specific paths are replaced so logs
// carry no home directory, temporary workspace or checkout location, and the output is bounded.
const redact = (text) => String(text ?? '')
  .split(workspace).join('<workspace>')
  .split(fileURLToPath(new URL('../..', import.meta.url))).join('<checkout>')
  .split(homedir()).join('~');
const bounded = (text) => (text.length > 4000 ? text.slice(0, 4000) + ' …[truncated]' : text);
function runScannerCli(args) {
  try {
    return execFileSync(process.execPath, [join(RUNTIME_DIR, 'cli.js'), ...args], { cwd: repo, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  } catch (error) {
    throw new Error([
      'scanner CLI failed (portable fixture)',
      `runtime=${redact(RUNTIME_DIR)}`,
      `args=${redact(args.join(' '))}`,
      `exit=${error.status ?? 'none'} signal=${error.signal ?? 'none'}`,
      `stdout=${bounded(redact(error.stdout))}`,
      `stderr=${bounded(redact(error.stderr))}`,
    ].join('\n'));
  }
}
const dashboard = join(workspace, 'dashboard');
mkdirSync(join(state, 'backups'), { recursive: true });

for (const name of ['apps', 'libs']) cpSync(join(repo, name), join(project, name), { recursive: true });
for (const name of ['package.json', 'tsconfig.json', 'nx.json', 'rtl-scanner.config.json']) cpSync(join(repo, name), join(project, name));
symlinkSync(join(repo, 'node_modules'), join(project, 'node_modules'), 'dir');
// Nx cannot resolve the external vite dependency in this copied tree, so the disposable project's build check runs the
// application's own Vite build directly. Validation still runs the declared build and typecheck scripts.
const fixturePackage = JSON.parse(readFileSync(join(project, 'package.json'), 'utf8'));
// The copied tree has no test files; the repository's vitest script would exit 1 on an empty include set.
const scriptsWithoutTests = { ...(fixturePackage.scripts ?? {}) };
delete scriptsWithoutTests.test;
fixturePackage.scripts = { ...scriptsWithoutTests, build: 'vite build --config apps/invoicing/vite.config.ts' };
writeFileSync(join(project, 'package.json'), JSON.stringify(fixturePackage, null, 2));

// Preview configuration in the same shape as the other e2e fixtures (preview-binding-fixture.mjs): one invoicing
// application served at a loopback origin, one route, and one explicit binding for the invoice table component.
// The original runtime is served through the RTL preview bridge so the companion can verify its identity.
const previewConfiguration = {
  schemaVersion: 1,
  applications: {
    invoicing: {
      viteConfig: 'apps/invoicing/vite.config.ts',
      entry: 'apps/invoicing/src/main.tsx',
      originalOrigin: 'http://127.0.0.1:4200',
      readySelector: '.toolbar',
      dataAdapter: 'none',
      routes: [{ id: 'invoices', path: '/invoices', ltr: '/invoices?demo=unmigrated-rtl&lang=en', rtl: '/invoices?demo=unmigrated-rtl&lang=ar' }],
    },
  },
  mappings: [
    {
      source: 'apps/invoicing/src/components/InvoiceTable.tsx',
      context: 'InvoiceTable',
      targetSelector: '.invoice-link',
      routes: [{ application: 'invoicing', route: 'invoices' }],
    },
  ],
};
writeFileSync(join(project, 'rtl-preview.config.json'), JSON.stringify(previewConfiguration, null, 2));

mkdirSync(dashboard, { recursive: true });
runScannerCli(['--root', project, '--format', 'dashboard', '--embed-source-snippets', '--output-dir', dashboard]);

// Generate the original runtime wrapper with the supported writer. Run in a child process so this module stays synchronous.
const entrySha256 = createHash('sha256').update(readFileSync(join(project, 'apps/invoicing/src/main.tsx'))).digest('hex');
const writerScript = `
import { writePreviewRuntimeConfig } from ${JSON.stringify(join(RUNTIME_DIR, 'preview-runtime.js'))};
const path = await writePreviewRuntimeConfig(${JSON.stringify(project)}, { role: 'original', sessionId: 'original', sourceSha256: ${JSON.stringify(entrySha256)} }, { application: 'invoicing' });
process.stdout.write(path);`;
const originalRuntimeConfig = execFileSync(process.execPath, ['--input-type=module', '-e', writerScript], { cwd: repo, encoding: 'utf8' }).trim();

process.env.RTL_E2E_REPO = repo;
process.env.RTL_E2E_PROJECT = project;
process.env.RTL_E2E_STATE = state;
process.env.RTL_E2E_DASHBOARD = dashboard;
process.env.RTL_E2E_FIXTURE_ROOT = project;
process.env.RTL_E2E_REPORT = join(dashboard, 'rtl-report.json');
// RTL_E2E_KEEP_WORKSPACE=1 keeps the generated workspace for diagnosis; the default removes it on exit.
if (!process.env.RTL_E2E_KEEP_WORKSPACE) process.on('exit', () => rmSync(workspace, { recursive: true, force: true }));
else console.error(`RTL_E2E_WORKSPACE=${workspace}`);

export { dashboard, originalRuntimeConfig, project, repo, state };
