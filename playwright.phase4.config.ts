import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/e2e', fullyParallel: false, timeout: 120_000, use: { browserName: 'chromium' }, webServer: [
  { command: 'RTL_SCAN_MANIFEST_STORE_PATH=/private/tmp/rtl-phase4-manifests5.json node dist/tools/rtl-scanner/preview-companion.js', url: 'http://127.0.0.1:4318/health', reuseExistingServer: false, timeout: 30_000 },
  { command: 'python3 -m http.server 4320 --bind 127.0.0.1', cwd: '/private/tmp/rtl-phase4-dashboard3', url: 'http://127.0.0.1:4320/rtl-report-dashboard.html', reuseExistingServer: false, timeout: 30_000 },
] });
