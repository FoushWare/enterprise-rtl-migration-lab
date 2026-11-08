import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 120_000,
  use: { browserName: 'chromium', viewport: { width: 1440, height: 1000 }, locale: 'en-US', timezoneId: 'UTC', colorScheme: 'light' },
  webServer: [
    { command: 'node dist/tools/rtl-scanner/preview-companion.js', url: 'http://127.0.0.1:4318/health', reuseExistingServer: false, timeout: 30_000 },
    { command: 'npx vite --config apps/invoicing/vite.config.ts --host 127.0.0.1 --port 4200 --strictPort', url: 'http://127.0.0.1:4200/invoices', reuseExistingServer: false, timeout: 30_000 },
    { command: 'python3 -m http.server 4320 --bind 127.0.0.1', cwd: '/private/tmp/rtl-phase3-dashboard2', url: 'http://127.0.0.1:4320/rtl-report-dashboard.html', reuseExistingServer: false, timeout: 30_000 },
  ],
});
