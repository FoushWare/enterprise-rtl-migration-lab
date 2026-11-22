import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, rm, realpath, readdir, lstat, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { composeWorkflowFile, ReviewWorkflowStore } from '../src/review-workflow.js';
import { ApplyAuditStore, ControlledApplyService } from '../src/controlled-apply.js';
import { disposeReviewSession } from '../src/review-session.js';

const file = 'apps/invoicing/src/components/InvoiceTable.tsx';
const exists = (path: string) => access(path).then(() => true, () => false);

async function fixture() {
  const root = await realpath(await mkdtemp(join(tmpdir(), 'rtl-workflow-recovery-')));
  await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
  await mkdir(join(root, 'libs'));
  await writeFile(join(root, 'apps/invoicing/project.json'), JSON.stringify({ sourceRoot: 'apps/invoicing/src' }));
  await writeFile(join(root, 'apps/invoicing/index.html'), '<html dir="ltr"><body></body></html>');
  await writeFile(join(root, file), 'export const View=({a}:{a:{id:string}})=><><span>{a.id}</span><span>{a.id}</span><span>{a.account.id}</span></>;');
  for (const name of ['package.json', 'nx.json', 'tsconfig.json']) await writeFile(join(root, name), '{}');
  await writeFile(join(root, 'rtl-scanner.config.json'), JSON.stringify({ schemaVersion: 1, generatedStyleOwner: 'unknown', ownership: {}, approvals: [], exceptions: [], issueBindings: [], dynamicExceptions: [], roles: [] }));
  const storePath = join(root, 'state/workflows.json');
  const auditPath = join(root, 'state/audit.json');
  const backups = join(root, 'state/backups');
  const apply = () => new ControlledApplyService(root, new ApplyAuditStore(auditPath), backups);
  const store = new ReviewWorkflowStore(root, storePath, apply());
  await store.load();
  // A companion restart is a fresh store that reads the persisted file.
  const restart = async () => { const next = new ReviewWorkflowStore(root, storePath, apply()); await next.load(); return next; };
  return { root, store, restart };
}

/** Creates an apply-first review that has a live candidate, then removes the candidate as companion shutdown does. */
async function reviewWithDisposedCandidate() {
  const env = await fixture();
  const report = await scan(env.root);
  const w = await env.store.begin({ ...report, mode: 'apply-first' });
  expect(w.entries.some(e => e.patch)).toBe(true);
  expect(w.session).toBeDefined();
  const candidateBefore = w.session!.candidateRoot;
  const sessionId = w.session!.id;
  await disposeReviewSession(w.session!);
  return { ...env, w, candidateBefore, sessionId, finding: w.entries.find(e => e.patch)!.finding.id };
}

async function candidateFiles(w: { baseline: Record<string, string> }, candidateRoot: string) {
  const out: Record<string, string> = {};
  for (const path of Object.keys(w.baseline)) out[path] = await readFile(join(candidateRoot, path), 'utf8');
  return out;
}

describe('review workflow recovery after candidate loss', () => {
  it('resumes a persisted apply-first review after its candidate is removed and the companion restarts', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const reloaded = await env.restart();
      // Opening the existing review (read-only: no runtime is started) must succeed rather than fail on the missing candidate.
      await expect(reloaded.preview(env.w.id, env.finding, 'ltr')).resolves.toBeDefined();
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('rebuilds the candidate with identical content, keeps the session ID, and points at a new isolated root', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      // Reference content: what the candidate contained before it was removed.
      const expected: Record<string, string> = {};
      for (const [path, before] of Object.entries(env.w.baseline)) {
        const patches = env.w.entries.filter(e => e.patch && e.patch.path === path).map(e => e.patch!);
        expected[path] = composeWorkflowFile(before, patches);
      }
      const reloaded = await env.restart();
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      const resumed = reloaded.get(env.w.id)!;
      expect(resumed.session!.id).toBe(env.sessionId);
      expect(resumed.session!.candidateRoot).not.toBe(env.candidateBefore);
      expect(await candidateFiles(resumed, resumed.session!.candidateRoot)).toEqual(expected);
      expect(resumed.session!.candidateSha256).toBeTruthy();
      // The rebuilt root lives in the OS temporary directory, never inside the project.
      expect(resumed.session!.candidateRoot.startsWith(env.root)).toBe(false);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('keeps decisions, notes, patches and receipts, and invalidates validation', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const w = env.w;
      w.receipts = [{ auditId: 'audit-1', path: file, originalSha256: 'a', resultingSha256: 'b' } as never];
      w.validation = { state: 'Passed' } as never;
      await env.store.persist();
      // Decisions, notes, patches, applied state and history are the protected fields. The explanatory `reason` text is
      // re-derived on every store load (existing behaviour), so it is excluded from the comparison.
      const protectedFields = (entries: typeof w.entries) => entries.map(e => ({ id: e.finding.id, decision: e.decision, notes: e.notes, patch: e.patch, applied: e.applied, history: e.history }));
      const entriesBefore = protectedFields(w.entries);
      const reloaded = await env.restart();
      await reloaded.preview(w.id, env.finding, 'ltr');
      const resumed = reloaded.get(w.id)!;
      expect(protectedFields(resumed.entries)).toEqual(entriesBefore);
      expect(resumed.receipts).toEqual([{ auditId: 'audit-1', path: file, originalSha256: 'a', resultingSha256: 'b' }]);
      expect(resumed.validation).toBeUndefined();
      expect(resumed.validationInvalidation).toMatch(/validation must be run again/);
      expect(resumed.state).toBe('Reviewing');
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('is idempotent: a repeated resume reuses the rebuilt root and creates nothing new', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const reloaded = await env.restart();
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      const first = reloaded.get(env.w.id)!.session!.candidateRoot;
      const tempBefore = (await readdir(tmpdir())).filter(n => n.startsWith('rtl-review-')).length;
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      expect(reloaded.get(env.w.id)!.session!.candidateRoot).toBe(first);
      expect((await readdir(tmpdir())).filter(n => n.startsWith('rtl-review-')).length).toBe(tempBefore);
      await disposeReviewSession(reloaded.get(env.w.id)!.session!);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('serializes concurrent resumes of one workflow into a single rebuild', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const reloaded = await env.restart();
      const [a, b, c] = await Promise.all([
        reloaded.preview(env.w.id, env.finding, 'ltr'),
        reloaded.preview(env.w.id, env.finding, 'ltr'),
        reloaded.preview(env.w.id, env.finding, 'ltr'),
      ]);
      expect(a).toBeDefined();
      expect(b).toBeDefined();
      expect(c).toBeDefined();
      const resumed = reloaded.get(env.w.id)!;
      expect(await exists(resumed.session!.candidateRoot)).toBe(true);
      expect(resumed.session!.candidateRoot).not.toBe(env.candidateBefore);
      await disposeReviewSession(resumed.session!);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('refuses stale source: a changed project file is never silently accepted into a rebuilt candidate', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      await writeFile(join(env.root, file), 'export const Changed = () => null;\n');
      const reloaded = await env.restart();
      await expect(reloaded.preview(env.w.id, env.finding, 'ltr')).rejects.toThrow(/STALE_ORIGINAL_SOURCE|STALE_PROJECT_IDENTITY/);
      // Nothing was created for the refused rebuild, and the persisted record still points at the old root.
      expect(reloaded.get(env.w.id)!.session!.candidateRoot).toBe(env.candidateBefore);
      expect(await readFile(join(env.root, file), 'utf8')).toBe('export const Changed = () => null;\n');
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('never modifies original project files during recovery', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const snapshot = async () => {
        const out: Record<string, string> = {};
        for (const path of Object.keys(env.w.baseline)) out[path] = await readFile(join(env.root, path), 'utf8');
        return out;
      };
      const before = await snapshot();
      const reloaded = await env.restart();
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      expect(await snapshot()).toEqual(before);
      await disposeReviewSession(reloaded.get(env.w.id)!.session!);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('rejects a persisted baseline path that escapes the project and writes nothing outside it', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const outside = join(env.root, '..', `rtl-escape-${Date.now()}.txt`);
      env.w.baseline['../rtl-escape-target.txt'] = 'x';
      await env.store.persist();
      const reloaded = await env.restart();
      await expect(reloaded.preview(env.w.id, env.finding, 'ltr')).rejects.toThrow();
      expect(await exists(outside)).toBe(false);
      expect(await exists(join(env.root, '..', 'rtl-escape-target.txt'))).toBe(false);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('does not follow a symlink planted in a rebuilt candidate', async () => {
    // A project-side symlink in a directory the candidate copy keeps must not let a rebuild write through it.
    const env = await reviewWithDisposedCandidate();
    try {
      const secret = join(env.root, '..', `rtl-symlink-secret-${Date.now()}.txt`);
      await writeFile(secret, 'secret');
      try {
        await rm(join(env.root, 'apps/invoicing/src/components/InvoiceTable.tsx'));
        await symlink(secret, join(env.root, 'apps/invoicing/src/components/InvoiceTable.tsx'));
        // The project file is now a symlink; freshness refuses it before any write happens.
        const reloaded = await env.restart();
        await expect(reloaded.preview(env.w.id, env.finding, 'ltr')).rejects.toThrow();
        expect(await readFile(secret, 'utf8')).toBe('secret');
        expect((await lstat(join(env.root, file))).isSymbolicLink()).toBe(true);
      } finally {
        await rm(secret, { force: true });
      }
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });
});
