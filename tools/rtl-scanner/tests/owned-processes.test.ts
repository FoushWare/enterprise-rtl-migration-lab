import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { execOwned, processStartTime, spawnOwned, sweepOwnedManifests, terminateOwnedGroups } from '../src/owned-processes.js';

const roots: string[] = [];
const isolatedRoot = () => { const root = mkdtempSync(join(tmpdir(), 'rtl-owned-')); roots.push(root); return root; };
const alive = (pid: number) => { try { process.kill(pid, 0); return true; } catch { return false; } };
const waitFor = async (check: () => boolean, ms: number) => { const deadline = Date.now() + ms; while (Date.now() < deadline && !check()) await new Promise(r => setTimeout(r, 25)); return check(); };

afterEach(async () => {
  await terminateOwnedGroups({ graceMs: 200 }).catch(() => undefined);
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe('owned process groups', () => {
  it('terminates a group that ignores SIGTERM by escalating to SIGKILL, and reports the escalation', async () => {
    const child = spawnOwned(process.execPath, ['-e', "process.on('SIGTERM', () => {}); setInterval(() => {}, 1000);"], { label: 'test-stubborn', stdio: 'ignore' });
    expect(child.pid).toBeGreaterThan(0);
    await new Promise(r => setTimeout(r, 300));
    const report = await terminateOwnedGroups({ graceMs: 300 });
    expect(report.terminated).toBeGreaterThanOrEqual(1);
    expect(report.escalated).toBeGreaterThanOrEqual(1);
    expect(report.survivors).toEqual([]);
    expect(await waitFor(() => child.exitCode !== null || child.signalCode !== null, 2000)).toBe(true);
    expect(child.signalCode).toBe('SIGKILL');
  });

  it('stops a well-behaved owned child on SIGTERM without escalating', async () => {
    const child = spawnOwned(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { label: 'test-polite', stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 200));
    const report = await terminateOwnedGroups({ graceMs: 1500 });
    expect(report.survivors).toEqual([]);
    expect(await waitFor(() => child.exitCode !== null || child.signalCode !== null, 2000)).toBe(true);
    expect(child.signalCode).toBe('SIGTERM');
  });

  it('bounds a command: a timeout stops the whole group and rejects with execFile-compatible fields', async () => {
    const root = isolatedRoot();
    const started = Date.now();
    await expect(execOwned(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { cwd: root, timeout: 400, maxBuffer: 10_000, label: 'test-timeout' })).rejects.toMatchObject({ killed: true });
    expect(Date.now() - started).toBeLessThan(5000);
  });

  it('resolves a successful command with its output', async () => {
    const root = isolatedRoot();
    const result = await execOwned(process.execPath, ['-e', "process.stdout.write('ok')"], { cwd: root, timeout: 5000, maxBuffer: 10_000, label: 'test-ok' });
    expect(result.stdout).toBe('ok');
  });
});

describe('owned-process manifest recovery', () => {
  const dead = async (): Promise<number> => {
    const child = spawnOwned(process.execPath, ['-e', '0'], { label: 'test-dead-owner', stdio: 'ignore' });
    await new Promise<void>(resolve => child.once('exit', () => resolve()));
    return child.pid!;
  };

  it('recovers a group whose manifest identity (start time and root) still matches, and only that group', async () => {
    const directory = isolatedRoot();
    const root = join(directory, 'candidate-root');
    mkdirSync(root);
    // Started outside the registry, as a dead companion's group would be: only its manifest survives the companion.
    const orphan = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);', root], { detached: true, stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 300));
    const start = await processStartTime(orphan.pid!);
    expect(start).toBeTruthy();
    const groupLeader = orphan.pid!;
    expect(alive(groupLeader)).toBe(true);
    const owner = await dead();
    writeFileSync(join(directory, `companion-${owner}.json`), JSON.stringify({ schema: 'rtl-owned-processes-v1', ownerPid: owner, entries: [{ pgid: groupLeader, label: 'test-orphan', root, processStart: start }] }));
    const result = await sweepOwnedManifests({ directory, graceMs: 300 });
    expect(result.recovered).toEqual([groupLeader]);
    expect(await waitFor(() => orphan.exitCode !== null || orphan.signalCode !== null || !alive(groupLeader), 3000)).toBe(true);
    orphan.unref();
  });

  it('does not signal a group whose recorded start time no longer matches (possible PID reuse)', async () => {
    const directory = isolatedRoot();
    const root = join(directory, 'candidate-root');
    mkdirSync(root);
    const bystander = spawnOwned(process.execPath, ['-e', 'setInterval(() => {}, 1000);', root], { label: 'test-bystander', root, stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 300));
    const owner = await dead();
    writeFileSync(join(directory, `companion-${owner}.json`), JSON.stringify({ schema: 'rtl-owned-processes-v1', ownerPid: owner, entries: [{ pgid: bystander.pid, label: 'test-bystander', root, processStart: 'Mon Jan  1 00:00:00 1990' }] }));
    const result = await sweepOwnedManifests({ directory, graceMs: 200 });
    expect(result.recovered).toEqual([]);
    expect(result.skipped).toContain(bystander.pid);
    await new Promise(r => setTimeout(r, 200));
    expect(bystander.exitCode).toBeNull();
    expect(bystander.signalCode).toBeNull();
  });

  it('never signals a group whose owner companion is still running', async () => {
    const directory = isolatedRoot();
    const child = spawnOwned(process.execPath, ['-e', 'setInterval(() => {}, 1000);'], { label: 'test-live-owner', stdio: 'ignore' });
    await new Promise(r => setTimeout(r, 200));
    writeFileSync(join(directory, `companion-${process.ppid}.json`), JSON.stringify({ schema: 'rtl-owned-processes-v1', ownerPid: process.ppid, entries: [{ pgid: child.pid, label: 'x', root: directory, processStart: 'never' }] }));
    const result = await sweepOwnedManifests({ directory, graceMs: 100 });
    expect(result.recovered).toEqual([]);
    expect(child.exitCode).toBeNull();
  });
});
