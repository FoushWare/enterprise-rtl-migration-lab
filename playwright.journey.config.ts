import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'phase6-full-journey.spec.ts',
  outputDir: 'test-results/installed-journey',
  workers: 1,
  fullyParallel: false,
  reporter: 'line',
});
