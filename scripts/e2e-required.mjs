// Runs one required E2E step and fails unless it discovered and executed tests with no failures.
//
// A Playwright path filter that matches nothing exits 0, and so does a config with no tests. This wrapper makes that a
// failure: the step must report at least one expected test, no unexpected results, and no flaky results.
//
//   node scripts/e2e-required.mjs <label> -- <playwright test arguments>
//   node scripts/e2e-required.mjs <label> --tap -- node --test <file>      (node:test TAP output; needs at least one pass)
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const label = args.shift();
const tap = args[0] === '--tap';
if (tap) args.shift();
const separator = args.indexOf('--');
if (!label || separator < 0 || separator === args.length - 1) {
  console.error('usage: node scripts/e2e-required.mjs <label> [--tap] -- <command...>');
  process.exit(2);
}
const command = args.slice(separator + 1);
const dir = mkdtempSync(join(tmpdir(), 'e2e-required-'));
const reportPath = join(dir, 'report.json');
const playwrightCli = join(root, 'node_modules', '@playwright', 'test', 'cli.js');

let run;
if (tap) {
  run = spawnSync(command[0], command.slice(1), { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], env: process.env });
  const output = `${run.stdout}${run.stderr}`;
  process.stdout.write(output);
  const pass = Number((output.match(/^# pass (\d+)/m) ?? [])[1] ?? 0);
  const fail = Number((output.match(/^# fail (\d+)/m) ?? [])[1] ?? 0);
  const skipped = Number((output.match(/^# skipped (\d+)/m) ?? [])[1] ?? 0);
  console.log(`E2E_REQUIRED ${label}: pass=${pass} fail=${fail} skipped=${skipped}`);
  rmSync(dir, { recursive: true, force: true });
  if (run.status !== 0 || fail > 0 || pass === 0) { console.error(`E2E_REQUIRED ${label}: FAILED (no executed tests or a failure)`); process.exit(1); }
  process.exit(0);
}

run = spawnSync(process.execPath, [playwrightCli, 'test', ...command, '--reporter=list,json'], {
  cwd: root,
  encoding: 'utf8',
  stdio: ['ignore', 'inherit', 'inherit'],
  env: { ...process.env, PLAYWRIGHT_JSON_OUTPUT_NAME: reportPath },
});
let stats = { expected: 0, unexpected: 0, skipped: 0, flaky: 0 };
try {
  stats = JSON.parse(readFileSync(reportPath, 'utf8')).stats;
} catch {
  console.error(`E2E_REQUIRED ${label}: no Playwright report was produced`);
}
rmSync(dir, { recursive: true, force: true });
console.log(`E2E_REQUIRED ${label}: expected=${stats.expected} unexpected=${stats.unexpected} skipped=${stats.skipped} flaky=${stats.flaky}`);
if (run.status !== 0 || stats.expected === 0 || stats.unexpected > 0 || stats.flaky > 0) {
  console.error(`E2E_REQUIRED ${label}: FAILED`);
  process.exit(1);
}
