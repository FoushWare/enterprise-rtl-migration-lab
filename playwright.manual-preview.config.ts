import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (!process.env.RTL_MANUAL_ENVIRONMENT) throw new Error('Start node tests/e2e/serve-manual-preview.mjs and set RTL_MANUAL_ENVIRONMENT to its environment.json');
const environment = JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT, 'utf8'));
export default defineConfig({
  testDir: './tests/e2e', workers: 1, fullyParallel: false, timeout: 90_000,
  outputDir: 'test-results/manual-preview',
  metadata: { portableFixtureRoot: environment.project, dashboardDirectory: environment.dashboard },
  use: { browserName: 'chromium', baseURL: environment.dashboardUrl, viewport: { width: 1600, height: 1000 }, trace: 'on', video: 'on' },
});
