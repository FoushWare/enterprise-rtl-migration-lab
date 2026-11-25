import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Every test run gets its own temporary root. Candidate workspaces, backups and fixtures created by any test land here,
// and the root is removed after the run, so no test leaks into the user's OS temporary directory.
let runRoot: string | undefined;

export async function setup(): Promise<void> {
  runRoot = await mkdtemp(join(tmpdir(), 'rtl-test-run-'));
  process.env.TMPDIR = runRoot;
  process.env.TMP = runRoot;
  process.env.TEMP = runRoot;
}

export async function teardown(): Promise<void> {
  if (runRoot) await rm(runRoot, { recursive: true, force: true });
}
