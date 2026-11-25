import { spawn, type ChildProcess } from 'node:child_process';
import { rmSync } from 'node:fs';

/** Time an owned companion has to exit after SIGTERM before the test escalates and fails. */
export const COMPANION_SHUTDOWN_GRACE_MS = 8_000;

/**
 * Starts a companion that this test owns. The companion also exits when this test process dies
 * (RTL_PREVIEW_OWNER_PID), so an interrupted run cannot leave it behind. Its output is drained so a full pipe can never
 * block it.
 */
export function startOwnedCompanion(env: NodeJS.ProcessEnv, cwd: string = process.cwd()): ChildProcess {
  const child = spawn(process.execPath, ['dist/tools/rtl-scanner/preview-companion.js'], {
    cwd,
    env: { ...env, RTL_PREVIEW_OWNER_PID: String(process.pid) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.resume();
  child.stderr?.resume();
  return child;
}

/**
 * Stops an owned companion with SIGTERM. If it has not exited within the grace period, it is killed with SIGKILL and the
 * stop fails: a companion that ignores SIGTERM is a defect, and it must not pass silently.
 */
export async function stopOwnedCompanion(child: ChildProcess, graceMs: number = COMPANION_SHUTDOWN_GRACE_MS): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise<void>(resolve => child.once('exit', () => resolve()));
  child.kill('SIGTERM');
  let timer: NodeJS.Timeout | undefined;
  const graceful = await Promise.race([
    exited.then(() => true),
    new Promise<boolean>(resolve => { timer = setTimeout(() => resolve(false), graceMs); }),
  ]);
  if (timer) clearTimeout(timer);
  if (graceful) return;
  child.kill('SIGKILL');
  await exited;
  throw new Error('COMPANION_SHUTDOWN_TIMEOUT');
}

/** Removes a temporary workspace this test created. Safe to call after a failure and more than once. */
export function disposeWorkspace(path: string): void {
  rmSync(path, { recursive: true, force: true });
}
