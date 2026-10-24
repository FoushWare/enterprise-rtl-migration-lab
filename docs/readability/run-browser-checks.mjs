/**
 * Run the unchanged browser assertions against isolated server ports.
 * The temporary copy redirects network fetches, not browser URLs or assertions.
 * No repository screenshots, configuration, or source files are rewritten.
 */
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

const mode = process.argv[2] ?? 'development';
if (!['development', 'production'].includes(mode) || process.argv.length > 3) {
  throw new Error('Use development or production only; snapshot update flags are not accepted');
}
const root = process.cwd();
const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'rtl-readability-browser-'));
await fs.symlink(path.join(root, 'node_modules'), path.join(directory, 'node_modules'));
await fs.cp(path.join(root, 'tests/e2e'), path.join(directory, 'tests'), { recursive: true });
const redirect = `route.request().url().replace('127.0.0.1:4200', '127.0.0.1:4300').replace('localhost:4200', '127.0.0.1:4300')`;
for (const name of await fs.readdir(path.join(directory, 'tests'))) {
  if (!name.endsWith('.ts')) continue;
  const file = path.join(directory, 'tests', name);
  const before = await fs.readFile(file, 'utf8');
  let after = before.replaceAll('from "@playwright/test"', 'from "../fixture"').replaceAll("from '@playwright/test'", "from '../fixture'");
  if (name === 'kpi-direction.spec.ts') {
    // Its page route takes precedence over the context route. Preserve its CSS
    // transformation, but fetch the isolated server instead of the existing IDE server.
    if ((after.match(/await route\.fetch\(\)/g) ?? []).length !== 1) throw new Error('KPI interception changed; review harness');
    after = after.replace('await route.fetch()', `await route.fetch({ url: ${redirect} })`);
  }
  await fs.writeFile(file, after);
}
await fs.writeFile(path.join(directory, 'fixture.ts'), `
import { test as base } from '@playwright/test';
export { expect } from '@playwright/test';
export type { Page, Locator } from '@playwright/test';
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(/^http:\\/\\/(127\\.0\\.0\\.1|localhost):420[01](?:\\/|$)/, async route => {
      const url = new URL(route.request().url());
      url.hostname = '127.0.0.1';
      url.port = url.port === '4200' ? '4300' : '4301';
      await route.fulfill({ response: await route.fetch({ url: url.href }) });
    });
    await use(context);
  }
});
`);
const preview = mode === 'production' ? ' preview' : '';
const webServer = ['invoicing', 'procurement'].map((app, index) => ({
  command: `node_modules/.bin/vite${preview} --config apps/${app}/vite.config.ts --port ${4300 + index}`,
  cwd: root,
  url: `http://127.0.0.1:${4300 + index}`,
  reuseExistingServer: false,
}));
const config = {
  testDir: './tests', fullyParallel: true, workers: 4, reporter: [['list']],
  outputDir: './results',
  use: { baseURL: 'http://127.0.0.1:4200', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome', viewport: { width: 1440, height: 1000 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: 'light' },
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } }, webServer,
};
const configPath = path.join(directory, 'playwright.config.ts');
await fs.writeFile(configPath, `import { defineConfig } from '@playwright/test';\nexport default defineConfig(${JSON.stringify(config, null, 2)});\n`);
console.log(`Temporary ${mode} harness and results: ${directory}`);
const child = spawn(path.join(root, 'node_modules/.bin/playwright'), ['test', '--config', configPath], { cwd: root, stdio: 'inherit' });
child.on('error', (error) => { throw error; });
child.on('exit', (code) => { process.exitCode = code ?? 1; });
