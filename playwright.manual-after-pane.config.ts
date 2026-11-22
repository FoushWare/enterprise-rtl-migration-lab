import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (!process.env.RTL_MANUAL_ENVIRONMENT) throw new Error('Set RTL_MANUAL_ENVIRONMENT to an environment.json naming a disposable project, its dashboard directory and dashboardUrl, served by a running preview companion on :4318');
const environment = JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT, 'utf8'));
export default defineConfig({
  testDir: './tests/e2e', testMatch: 'manual-review-after-pane.spec.ts', workers: 1, fullyParallel: false, timeout: 180_000,
  outputDir: 'test-results/manual-after-pane',
  reporter: 'list',
  use: { browserName: 'chromium', baseURL: environment.dashboardUrl, viewport: { width: 1600, height: 1000 } },
});
