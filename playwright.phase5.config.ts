import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dashboard, project, repo, state } from './tests/e2e/portable-fixture.mjs';
import { writePhase5Dashboard, writePhase5ProjectFixture } from './tests/e2e/phase5-fixture.mjs';
const dashboardServer = fileURLToPath(new URL('./tests/e2e/dashboard-session-server.mjs', import.meta.url));
writePhase5Dashboard(dashboard);
writePhase5ProjectFixture(project);
export default defineConfig({ testDir: './tests/e2e', fullyParallel: false, timeout: 120_000, use: { browserName: 'chromium' }, webServer: [
  { command: `RTL_PROJECT_ROOT="${project}" RTL_REVIEW_STORE_PATH="${state}/review-records-v1.json" RTL_EVIDENCE_STORE_PATH="${state}/review-evidence-v1.json" RTL_MANUAL_CHANGE_STORE_PATH="${state}/manual-changes-v1.json" RTL_SCAN_MANIFEST_STORE_PATH="${state}/scan-manifests-v1.json" RTL_AUDIT_STORE_PATH="${state}/apply-audit-v1.json" RTL_APPLY_BACKUP_ROOT="${state}/backups" node "${repo}/dist/tools/rtl-scanner/preview-companion.js"`, url: 'http://127.0.0.1:4318/health', gracefulShutdown: { signal: 'SIGTERM', timeout: 15_000 }, reuseExistingServer: false, timeout: 30_000 },
  { command: `node "${dashboardServer}" "${dashboard}"`, cwd: repo, env: { ...process.env, RTL_HARNESS_OWNER_PID: String(process.pid) }, url: 'http://127.0.0.1:4320/rtl-report-dashboard.html', reuseExistingServer: false, timeout: 30_000 },
] });
