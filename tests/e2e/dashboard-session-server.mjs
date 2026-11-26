// Serves a generated dashboard through DashboardSession, the same server the CLI uses, so the page receives its companion
// session exactly as in a real run. Replaces the static `python3 -m http.server` the harnesses used before v0.6.3, which
// cannot authorize companion requests.
//
// Ownership: the harness supervisor passes its PID in RTL_HARNESS_OWNER_PID. This process exits when that supervisor is
// gone, including after SIGKILL, so the dashboard never outlives the run that started it.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { resolveScannerRuntime } from './runtime-path.mjs';

const runtime = resolveScannerRuntime();
const { DashboardSession } = await import(pathToFileURL(join(runtime, 'dashboard-session.js')).href);
const { readCompanionBootstrap } = await import(pathToFileURL(join(runtime, 'companion-auth.js')).href);

const dashboardDir = process.argv[2] ?? process.cwd();
const companionPort = Number(process.env.RTL_E2E_COMPANION_PORT ?? 4318);
const port = Number(process.env.RTL_E2E_DASHBOARD_PORT ?? 4320);
const owner = Number(process.env.RTL_HARNESS_OWNER_PID ?? '');

const session = new DashboardSession({
  dashboardDir,
  port,
  start: async () => {
    // The companion publishes its bootstrap secret after it starts listening; wait for it before the page can authorize.
    for (let i = 0; i < 600 && !readCompanionBootstrap(companionPort); i++) await new Promise(r => setTimeout(r, 100));
    return {
      state: 'ready',
      stop: async () => 'not-held',
      companion: { origin: `http://127.0.0.1:${companionPort}`, bootstrap: readCompanionBootstrap(companionPort) },
    };
  },
});
let stopping = false;
const stop = async (reason) => {
  if (stopping) return;
  stopping = true;
  console.error(`DASHBOARD_SESSION_SERVER: stopping reason=${reason} pid=${process.pid}`);
  await session.end().catch(() => undefined);
  process.exit(0);
};
process.on('SIGTERM', () => void stop('SIGTERM'));
process.on('SIGINT', () => void stop('SIGINT'));
// Registered before any wait, so an owner that dies while the companion is still starting still ends this process.
if (Number.isInteger(owner) && owner > 0) {
  setInterval(() => {
    try { process.kill(owner, 0); }
    catch (error) { if (error.code !== 'EPERM') void stop(`owner-gone:${owner}`); }
  }, 500).unref();
}
setInterval(() => {}, 1 << 30);
// Ready means ready: the port is opened only once the session has its companion, so the first page load is never "starting".
await session.begin();
await session.listen();
console.error(`DASHBOARD_SESSION_SERVER: listening port=${port} pid=${process.pid} owner=${Number.isInteger(owner) && owner > 0 ? owner : 'none'}`);
