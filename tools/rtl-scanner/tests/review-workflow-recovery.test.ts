import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, realpath, lstat, symlink, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { scan } from '../src/scan.js';
import { composeWorkflowFile, ReviewWorkflowStore, signature } from '../src/review-workflow.js';
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
      // Other test files create candidates in parallel, so this checks this workflow's own root rather than global counts.
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      await reloaded.preview(env.w.id, env.finding, 'ltr');
      expect(reloaded.get(env.w.id)!.session!.candidateRoot).toBe(first);
      expect(await exists(first)).toBe(true);
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

  it('companion shutdown disposes the candidate of a Reviewing workflow, and the next resume rebuilds it', async () => {
    const env = await fixture();
    try {
      // A fresh review with a live candidate (not one that was already disposed in this store).
      const report = await scan(env.root);
      const w = await env.store.begin({ ...report, mode: 'apply-first' });
      const live = w.session!.candidateRoot;
      expect(await exists(live)).toBe(true);
      await env.store.shutdown();
      expect(await exists(live)).toBe(false);
      const reloaded = await env.restart();
      const finding = w.entries.find(e => e.patch)!.finding.id;
      await expect(reloaded.preview(w.id, finding, 'ltr')).resolves.toBeDefined();
      expect(await exists(reloaded.get(w.id)!.session!.candidateRoot)).toBe(true);
      await disposeReviewSession(reloaded.get(w.id)!.session!);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('apply after a candidate rebuild refuses with a clear invalidation error instead of crashing on cleared validation', async () => {
    const env = await fixture();
    try {
      // Validation needs configured checks that pass; they must exist before the review starts (the scan digests cover them).
      await writeFile(join(env.root, 'package.json'), JSON.stringify({ name: 'fixture', private: true, scripts: { check: 'node -e 0' } }));
      await writeFile(join(env.root, 'rtl-project.config.json'), JSON.stringify({ schemaVersion: 1, scanRoots: ['apps'], copyPaths: ['apps', 'package.json', 'nx.json', 'tsconfig.json', 'rtl-project.config.json'], packageManager: 'npm', validation: { typecheck: ['run', 'check'], build: ['run', 'check'], test: ['run', 'check'] } }));
      const report = await scan(env.root);
      const w = await env.store.begin({ ...report, mode: 'apply-first' });
      const e = w.entries.find(e => e.patch)!;
      e.decision = 'Accepted';
      await env.store.persist();
      // Make the review hold a real passing validation, as the dashboard does after Validate.
      const validated = await env.store.validate(w.id);
      // The fixture has no preview route for the accepted change, so its runtime check is Unavailable. Every other check
      // passed. Mark the validation Passed, as the dashboard would after a passing runtime check, so Apply reaches its
      // own rebuild-invalidation guard.
      const v = validated.validation!;
      expect(v.checks.filter(c => c.state !== 'Passed' && !c.name.startsWith('runtime')).length).toBe(0);
      v.state = 'Passed';
      await env.store.persist();
      // Companion restart: the candidate is gone and must be rebuilt by Apply.
      await disposeReviewSession(validated.session!);
      const reloaded = await env.restart();
      const source = join(env.root, file);
      const before = await readFile(source, 'utf8');
      await expect(reloaded.apply(w.id, 'APPLY_CONFIRMED')).rejects.toThrow(/VALIDATION_INVALIDATED_BY_REBUILD/);
      expect(await readFile(source, 'utf8')).toBe(before);
      const after = reloaded.get(w.id)!;
      expect(after.state).toBe('Reviewing');
      expect(after.receipts ?? []).toEqual([]);
      expect(after.validation).toBeUndefined();
      expect(after.validationInvalidation).toMatch(/validation must be run again/);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('reports Revalidation required with Apply ineligible while the candidate is missing, and rendering never rebuilds it', async () => {
    const env = await reviewWithDisposedCandidate();
    try {
      const reloaded = await env.restart();
      const stored = reloaded.get(env.w.id)!;
      // A passing validation persisted before the restart: before this fix the view presented it as Apply-ready.
      stored.validation = { state: 'Passed', signature: signature(stored), checks: [], hashes: {}, at: new Date().toISOString() } as never;
      const view = reloaded.view(stored) as { candidateRecoveryRequired: boolean; applyEligibility: { eligible: boolean; reason: string }; validationPresentation: { status: string } };
      expect(view.candidateRecoveryRequired).toBe(true);
      expect(view.applyEligibility.eligible).toBe(false);
      expect(view.applyEligibility.reason).toMatch(/Revalidation required/);
      expect(view.validationPresentation.status).toBe('Revalidation required');
      // Viewing is read-only: the missing candidate is not rebuilt until an explicit action needs it.
      expect(await exists(stored.session!.candidateRoot)).toBe(false);
    } finally {
      await rm(env.root, { recursive: true, force: true });
    }
  });

  it('a reconstruction that fails after the candidate copy leaves no record, source or temp change behind', async () => {
    const env = await reviewWithDisposedCandidate();
    const scratch = await mkdtemp(join(tmpdir(), 'rtl-recovery-failure-scratch-'));
    const previousTmp = process.env.TMPDIR;
    const snapshot = async () => {
      const out: Record<string, string> = {};
      for (const path of Object.keys(env.w.baseline)) out[path] = await readFile(join(env.root, path), 'utf8');
      return out;
    };
    try {
      const w = env.w;
      const first = w.entries.find(e => e.patch)!;
      first.decision = 'Accepted';
      first.notes = 'keep this note';
      // Forced failure: the stored patch no longer matches its original text, so composition throws after the candidate copy.
      first.patch = { ...first.patch!, expectedSha256: 'f'.repeat(64) };
      w.receipts = [{ auditId: 'audit-1', path: file, originalSha256: 'a', resultingSha256: 'b' } as never];
      w.validation = { state: 'Passed', signature: signature(w), checks: [], hashes: {}, at: new Date().toISOString() } as never;
      await env.store.persist();
      const storeBefore = await readFile(env.store.path, 'utf8');
      const sourceBefore = await snapshot();
      const reloaded = await env.restart();
      // Confine the failed copy to a scratch temp directory so any leaked candidate would be visible.
      process.env.TMPDIR = scratch;
      try {
        await expect(reloaded.preview(w.id, env.finding, 'ltr')).rejects.toThrow(/STALE_PATCH_RANGE/);
      } finally {
        if (previousTmp === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = previousTmp;
      }
      expect(await readdir(scratch)).toEqual([]);
      expect(await readFile(env.store.path, 'utf8')).toBe(storeBefore);
      expect(await snapshot()).toEqual(sourceBefore);
      const resumed = reloaded.get(w.id)!;
      expect(resumed.session!.candidateRoot).toBe(env.candidateBefore);
      expect(resumed.receipts).toEqual(w.receipts);
      expect(resumed.validation).toEqual(w.validation);
      expect(resumed.entries.find(e => e.finding.id === first.finding.id)).toMatchObject({ decision: 'Accepted', notes: 'keep this note' });
    } finally {
      if (previousTmp === undefined) delete process.env.TMPDIR; else process.env.TMPDIR = previousTmp;
      await rm(scratch, { recursive: true, force: true });
      await rm(env.root, { recursive: true, force: true });
    }
  });
});
