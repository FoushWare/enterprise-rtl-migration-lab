// Owned child processes. Every process this companion starts (candidate and original preview runtimes, validation
// commands) runs in its own process group, is recorded here, and is stopped by process group only. Nothing else is
// signalled: no port owners, no adopted PIDs, and no process found by name.
//
// Shutdown is bounded: owned groups get SIGTERM, then SIGKILL after a grace period, and the companion exits by a hard
// deadline even if a promise never settles. A manifest per companion lets a later companion recover groups that a
// crashed companion left behind, but only when the recorded process start time and root still match the live group.
import { execFile, spawn, type ChildProcess, type SpawnOptions } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Time an owned group has to exit after SIGTERM before it is killed. */
export const OWNED_TERMINATE_GRACE_MS = 1_500;
/** Absolute bound for the whole companion shutdown. The process exits by this deadline even if a step is stuck. */
export const COMPANION_SHUTDOWN_DEADLINE_MS = 8_000;

interface OwnedGroup { pgid: number; label: string; root: string | null; child: ChildProcess; processStart?: string | null }
const groups = new Map<number, OwnedGroup>();
let shutdownStarted = false;

export const isOwnedShutdownStarted = (): boolean => shutdownStarted;
export const markOwnedShutdownStarted = (): void => { shutdownStarted = true; };
const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

function groupSignal(pgid: number, signal: NodeJS.Signals): void {
  if (process.platform === 'win32') return;
  try { process.kill(-pgid, signal); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ESRCH') throw error; }
}
/** True while any process remains in the group (including children that outlived their leader). */
function groupAlive(pgid: number): boolean {
  if (process.platform === 'win32') return false;
  try { process.kill(-pgid, 0); return true; } catch (error) { return (error as NodeJS.ErrnoException).code === 'EPERM'; }
}
function pruneGroups(): void { for (const [pgid] of groups) if (!groupAlive(pgid)) groups.delete(pgid); }

/** Spawns a child in its own process group and records the group as owned. */
export function spawnOwned(command: string, args: readonly string[], options: SpawnOptions & { label: string; root?: string }): ChildProcess {
  const { label, root, ...spawnOptions } = options;
  pruneGroups();
  const child = spawn(command, args, { ...spawnOptions, shell: false, detached: process.platform !== 'win32' });
  if (child.pid) {
    groups.set(child.pid, { pgid: child.pid, label, root: root ?? null, child });
    void writeManifest();
    // Record the start time after spawn so a later sweep can prove the group is still the same process.
    void processStartTime(child.pid).then(start => { const g = groups.get(child.pid!); if (g) { g.processStart = start; void writeManifest(); } });
  }
  return child;
}

export function ownedGroupCount(): number { pruneGroups(); return groups.size; }

export interface TerminationReport { terminated: number; escalated: number; survivors: number[] }

/**
 * Stops every owned group: SIGTERM, a bounded grace period, then SIGKILL for any group still alive. Idempotent.
 * Groups that are already gone are dropped from the registry. Survivors are reported, never ignored.
 */
export async function terminateOwnedGroups(options: { graceMs?: number } = {}): Promise<TerminationReport> {
  pruneGroups();
  const targets = [...groups.keys()];
  for (const pgid of targets) groupSignal(pgid, 'SIGTERM');
  const graceDeadline = Date.now() + (options.graceMs ?? OWNED_TERMINATE_GRACE_MS);
  while (Date.now() < graceDeadline && targets.some(groupAlive)) await delay(50);
  let escalated = 0;
  for (const pgid of targets) if (groupAlive(pgid)) { groupSignal(pgid, 'SIGKILL'); escalated++; }
  const settleDeadline = Date.now() + 1_000;
  while (Date.now() < settleDeadline && targets.some(groupAlive)) await delay(20);
  const survivors = targets.filter(groupAlive);
  for (const pgid of targets) if (!survivors.includes(pgid)) groups.delete(pgid);
  await writeManifest();
  return { terminated: targets.length, escalated, survivors };
}

/** Synchronous last resort for process exit: SIGKILL every owned group. Never touches anything else. */
export function killOwnedGroupsSync(): void {
  for (const pgid of groups.keys()) groupSignal(pgid, 'SIGKILL');
}

/**
 * Runs a bounded command in an owned process group and resolves with its output. Rejects with execFile-compatible
 * fields (code, signal, stdout, stderr). A timeout or shutdown stops the whole group, never a single PID.
 */
export function execOwned(file: string, args: readonly string[], options: { cwd: string; env?: NodeJS.ProcessEnv; timeout: number; maxBuffer: number; label: string }): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    if (shutdownStarted) { reject(Object.assign(new Error('COMPANION_SHUTTING_DOWN'), { code: 'COMPANION_SHUTTING_DOWN' })); return; }
    const child = spawnOwned(file, args, { cwd: options.cwd, env: options.env, stdio: ['ignore', 'pipe', 'pipe'], label: options.label, root: options.cwd });
    let stdout = '', stderr = '', timedOut = false;
    const pgid = child.pid ?? 0;
    const stop = setTimeout(() => { timedOut = true; groupSignal(pgid, 'SIGTERM'); setTimeout(() => groupSignal(pgid, 'SIGKILL'), 1_000).unref(); }, options.timeout);
    const cap = (text: string) => text.length > options.maxBuffer ? text.slice(-options.maxBuffer) : text;
    child.stdout?.on('data', chunk => { stdout = cap(stdout + String(chunk)); });
    child.stderr?.on('data', chunk => { stderr = cap(stderr + String(chunk)); });
    child.once('error', error => { clearTimeout(stop); reject(error); });
    child.once('close', (code, signal) => {
      clearTimeout(stop);
      if (code === 0) { resolve({ stdout, stderr }); return; }
      reject(Object.assign(new Error(`Command failed: ${file} ${args.join(' ')}\n${stderr}`.trim()), { code: code ?? undefined, signal: signal ?? undefined, stdout, stderr, killed: timedOut }));
    });
  });
}

// ---- Manifest: lets a later companion recover groups this companion owned if it died without cleaning up. ----

interface ManifestEntry { pgid: number; label: string; root: string | null; processStart: string | null }
export const OWNED_MANIFEST_DIRECTORY = 'rtl-review-processes';
export function ownedManifestDirectory(base = tmpdir()): string { return join(base, OWNED_MANIFEST_DIRECTORY); }
function manifestPath(directory: string, ownerPid: number): string { return join(directory, `companion-${ownerPid}.json`); }

async function writeManifest(): Promise<void> {
  if (process.platform === 'win32') return;
  const directory = ownedManifestDirectory();
  const entries: ManifestEntry[] = [...groups.values()].map(g => ({ pgid: g.pgid, label: g.label, root: g.root, processStart: g.processStart ?? null }));
  try {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    const path = manifestPath(directory, process.pid);
    if (entries.length === 0) { await rm(path, { force: true }); return; }
    await writeFile(path, JSON.stringify({ schema: 'rtl-owned-processes-v1', ownerPid: process.pid, entries }, null, 2), { mode: 0o600 });
  } catch { /* A manifest failure must never block shutdown; the live registry still terminates every owned group. */ }
}
export async function removeOwnManifest(): Promise<void> { await rm(manifestPath(ownedManifestDirectory(), process.pid), { force: true }).catch(() => undefined); }

export async function processStartTime(pid: number): Promise<string | null> {
  if (process.platform === 'win32') return null;
  return await new Promise<string | null>(resolve => execFile('ps', ['-o', 'lstart=', '-p', String(pid)], (error, stdout) => resolve(error ? null : stdout.trim() || null)));
}
async function commandLine(pid: number): Promise<string> {
  return await new Promise<string>(resolve => execFile('ps', ['-o', 'command=', '-p', String(pid)], (error, stdout) => resolve(error ? '' : stdout.trim())));
}
const ownerAlive = (pid: number): boolean => { try { process.kill(pid, 0); return true; } catch (error) { return (error as NodeJS.ErrnoException).code === 'EPERM'; } };

export interface OwnedSweepResult { recovered: number[]; skipped: number[]; manifests: number }
/**
 * Recovers groups left by companions that are no longer running. A group is signalled only when its leader still has
 * the recorded start time and its command line still names the recorded root. Anything else is skipped and reported.
 */
export async function sweepOwnedManifests(options: { directory?: string; graceMs?: number } = {}): Promise<OwnedSweepResult> {
  const result: OwnedSweepResult = { recovered: [], skipped: [], manifests: 0 };
  if (process.platform === 'win32') return result;
  const directory = options.directory ?? ownedManifestDirectory();
  const names = await readdir(directory).catch(() => [] as string[]);
  for (const name of names.filter(n => /^companion-\d+\.json$/.test(n))) {
    const ownerPid = Number(name.match(/^companion-(\d+)\.json$/)![1]);
    if (ownerPid === process.pid || ownerAlive(ownerPid)) continue;
    result.manifests++;
    let entries: ManifestEntry[] = [];
    try { entries = (JSON.parse(await readFile(join(directory, name), 'utf8')) as { entries: ManifestEntry[] }).entries ?? []; } catch { result.skipped.push(ownerPid); }
    for (const entry of entries) {
      if (!groupAlive(entry.pgid)) continue;
      const start = await processStartTime(entry.pgid);
      const command = await commandLine(entry.pgid);
      if (!entry.processStart || start !== entry.processStart || !entry.root || !command.includes(entry.root)) { result.skipped.push(entry.pgid); continue; }
      groupSignal(entry.pgid, 'SIGTERM');
      const deadline = Date.now() + (options.graceMs ?? OWNED_TERMINATE_GRACE_MS);
      while (Date.now() < deadline && groupAlive(entry.pgid)) await delay(50);
      if (groupAlive(entry.pgid)) groupSignal(entry.pgid, 'SIGKILL');
      result.recovered.push(entry.pgid);
    }
    await rm(join(directory, name), { force: true });
  }
  return result;
}
