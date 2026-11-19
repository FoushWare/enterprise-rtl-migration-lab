import { execFile } from 'node:child_process';
import { mkdtemp, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { expect, test } from '@playwright/test';

// The historical test depended on a developer's deleted /private/tmp report,
// fixed finding IDs and an obsolete UI. Exercise the existing complete black-box
// journey instead; it creates/retains its own disposable target and services.
const run = promisify(execFile);
test('full installed-consumer journey validates accepted-only Apply and rollback in both modes', async () => {
  test.setTimeout(300_000);
  const artifacts = await mkdtemp(join(tmpdir(), 'rtl-phase6-package-'));
  const npm = process.env.npm_execpath;
  if (!npm) throw new Error('Run through npm run test:e2e or test:e2e:journey (npm_execpath required)');
  const packed = await run(process.execPath, [npm, 'pack', '--json', '--pack-destination', artifacts], {
    cwd: resolve('tools/rtl-scanner'), maxBuffer: 8_000_000,
  });
  const [{ filename }] = JSON.parse(packed.stdout);
  const result = await run(process.execPath, ['tests/e2e/package-consumer-smoke.mjs', join(artifacts, filename)], {
    cwd: process.cwd(), maxBuffer: 8_000_000,
  });
  const workspace = result.stdout.match(/CONSUMER_WORKSPACE (.+)/)?.[1];
  expect(workspace).toBeTruthy();
  const evidence = JSON.parse(await readFile(join(workspace!, 'smoke.json'), 'utf8'));
  expect(evidence.status).toBe('Passed');
  expect(evidence.modes).toHaveLength(2);
});
