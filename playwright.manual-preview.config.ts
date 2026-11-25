import { readFileSync } from 'node:fs';
import { defineConfig } from '@playwright/test';

if (!process.env.RTL_MANUAL_ENVIRONMENT) throw new Error('Start node tests/e2e/serve-manual-preview.mjs and set RTL_MANUAL_ENVIRONMENT to its environment.json');
const environment = JSON.parse(readFileSync(process.env.RTL_MANUAL_ENVIRONMENT, 'utf8'));
import { tmpdir, userInfo } from 'node:os';
import { join as joinPath } from 'node:path';
// Test API requests act as the dashboard: a companion session minted with the run's bootstrap secret (owner-only file).
// Origin is not set globally: the page would send it to the Vite-served original application, which then refuses module requests.
// Review writes set their own dashboard Origin explicitly.
const companionSession = await (async () => {
  try {
    const bootstrap = JSON.parse(readFileSync(joinPath(tmpdir(), 'rtl-analyzer-auth-' + userInfo().uid, 'companion-4318.json'), 'utf8')).bootstrap;
    const response = await fetch('http://127.0.0.1:4318/auth/session', { method: 'POST', headers: { 'x-rtl-companion-bootstrap': bootstrap } });
    return ((await response.json()) as { token: string }).token;
  } catch { return undefined; }
})();
export default defineConfig({
  testDir: './tests/e2e', workers: 1, fullyParallel: false, timeout: 90_000,
  outputDir: 'test-results/manual-preview',
  metadata: { portableFixtureRoot: environment.project, dashboardDirectory: environment.dashboard },
  use: { browserName: 'chromium', extraHTTPHeaders: companionSession ? { 'x-rtl-companion-session': companionSession } : undefined, baseURL: environment.dashboardUrl, viewport: { width: 1600, height: 1000 }, trace: 'on', video: 'on' },
});
