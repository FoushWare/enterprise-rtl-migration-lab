// Implementation-native E2E: suites that need only this repository's own build (the standalone `npm run build` output) and
// start their own companion. Overlay-dependent suites (DashboardSession, the review dashboard, provenance-verified runtime)
// run in the wrapper's CI; see docs/ci-test-ownership.md.
import { defineConfig } from '@playwright/test';
import { project } from './tests/e2e/portable-fixture.mjs';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: ['security-negative.spec.ts'],
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  outputDir: 'test-results/native',
  metadata: { portableFixtureRoot: project },
  use: { browserName: 'chromium' },
});
