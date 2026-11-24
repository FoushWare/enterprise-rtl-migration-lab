import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { homedir, tmpdir } from 'node:os';
import { join } from 'node:path';
import { ApplyAuditStore, APPLY_CONFIRMATION, ControlledApplyService } from '../src/controlled-apply.js';
import { evidenceIntegrity, type EvidenceSnapshot } from '../src/evidence-store.js';
import { OWNER_MARKER, REVIEW_SOURCE, createReviewSession, disposeReviewSession, processStartTime, sweepOrphanedReviewWorkspaces, type PatchRequest, type ReviewIdentity, type ReviewRecord, type ReviewSession } from '../src/review-session.js';
import { ReviewWorkflowStore, type ReviewWorkflow } from '../src/review-workflow.js';

// Every fixture is a disposable directory under the OS temporary directory, removed in `finally`.
const hash = (text: string) => createHash('sha256').update(text).digest('hex');
const findingId = 'RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea';
const identity: ReviewIdentity = { findingId, sourcePath: REVIEW_SOURCE, inputDigest: 'input', policyDigest: 'policy', schemaVersion: 2 };

async function applyFixture(backupRoot?: string) {
  const root = await mkdtemp(join(tmpdir(), 'rtl-durability-fixture-'));
  await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
  const original = 'const value = {i.id};\n';
  await writeFile(join(root, REVIEW_SOURCE), original);
  const startOffset = original.indexOf('{i.id}');
  const patch: PatchRequest = { findingId, path: REVIEW_SOURCE, startOffset, endOffset: startOffset + 6, expectedSha256: hash('{i.id}'), replacement: '<bdi dir="auto">{i.id}</bdi>' };
  const candidate = original.slice(0, startOffset) + patch.replacement + original.slice(startOffset + 6);
  const base = { ...identity, candidatePatchIdentity: { path: REVIEW_SOURCE, expectedSha256: patch.expectedSha256, replacementSha256: hash(patch.replacement) }, originalSourceSha256: hash(original), candidateSourceSha256: hash(candidate), codeDiff: '- {i.id}\n+ <bdi dir="auto">{i.id}</bdi>', scannerBefore: { findingPresent: true, resultDigest: 'a'.repeat(64) }, scannerAfter: { findingPresent: false, resultDigest: 'b'.repeat(64) }, browserDomValidation: ['candidate bdi=1'], screenshotReferences: [], timestamp: new Date().toISOString(), decision: 'Approved' as const, snapshotId: 'snapshot-1' };
  const evidence = { ...base, integritySha256: evidenceIntegrity(base) } as EvidenceSnapshot;
  const reviewRecord: ReviewRecord = { ...identity, status: 'Approved', reviewerNotes: 'Approved after validation.', evidenceReferences: ['snapshot-1'], timestamp: new Date().toISOString() };
  const audit = new ApplyAuditStore(join(root, 'audit.json'));
  const service = new ControlledApplyService(root, audit, backupRoot ?? join(root, 'backups'));
  return { root, original, patch, evidence, reviewRecord, audit, service };
}

async function deadPid(): Promise<number> {
  const child = spawnSync(process.execPath, ['-e', '0']);
  return child.pid!;
}

describe('candidate ownership marker', () => {
  it('writes an owner marker naming this process into every new candidate workspace', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rtl-marker-project-'));
    let session: ReviewSession | undefined;
    try {
      await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
      await writeFile(join(root, REVIEW_SOURCE), 'const value = {i.id};\n');
      session = await createReviewSession(root);
      const marker = JSON.parse(await readFile(join(session.candidateRoot, OWNER_MARKER), 'utf8'));
      expect(marker.schema).toBe('rtl-review-workspace-owner-v1');
      expect(marker.owner).toBe('rtl-analyzer');
      expect(marker.pid).toBe(process.pid);
      expect(marker.processStart).toBe(await processStartTime(process.pid));
    } finally {
      if (session) await disposeReviewSession(session);
      await rm(root, { recursive: true, force: true });
    }
  });
});

describe('orphan detection and recovery', () => {
  it('removes only marked, unreferenced orphans past the grace period and reports legacy workspaces', async () => {
    const base = await realpath(await mkdtemp(join(tmpdir(), 'rtl-sweep-')));
    try {
      const old = new Date(Date.now() - 3 * 3600_000).toISOString();
      const fresh = new Date().toISOString();
      const dead = await deadPid();
      const make = async (name: string, marker: object | null) => { const dir = join(base, name); await mkdir(dir); if (marker) await writeFile(join(dir, OWNER_MARKER), JSON.stringify(marker)); return dir; };
      const orphan = await make('rtl-review-orphan', { schema: 'rtl-review-workspace-owner-v1', owner: 'rtl-analyzer', pid: dead, processStart: 'gone', createdAt: old });
      const alive = await make('rtl-review-alive', { schema: 'rtl-review-workspace-owner-v1', owner: 'rtl-analyzer', pid: process.pid, processStart: await processStartTime(process.pid), createdAt: old });
      const referenced = await make('rtl-review-referenced', { schema: 'rtl-review-workspace-owner-v1', owner: 'rtl-analyzer', pid: dead, processStart: 'gone', createdAt: old });
      const recent = await make('rtl-review-recent', { schema: 'rtl-review-workspace-owner-v1', owner: 'rtl-analyzer', pid: dead, processStart: 'gone', createdAt: fresh });
      const legacy = await make('rtl-review-legacy', null);
      const malformed = await make('rtl-review-malformed', { schema: 'other', owner: 'someone-else', pid: dead, processStart: 'gone', createdAt: old });
      const notOurs = await make('unrelated-folder', null);

      const result = await sweepOrphanedReviewWorkspaces({ root: base, referenced: new Set([referenced]), graceMs: 3600_000 });

      expect(result.removed).toEqual([orphan]);
      expect(result.legacyUnmarked).toEqual([legacy]);
      expect(result.kept.sort()).toEqual([alive, malformed, recent, referenced].sort());
      expect(result.failures).toEqual([]);
      await expect(access(orphan)).rejects.toThrow();
      await expect(access(legacy)).resolves.toBeUndefined();
      await expect(access(notOurs)).resolves.toBeUndefined();
    } finally { await rm(base, { recursive: true, force: true }); }
  });

  it('treats a reused process id as a different owner and removes that workspace', async () => {
    if (process.platform === 'win32') return;
    const base = await realpath(await mkdtemp(join(tmpdir(), 'rtl-sweep-reuse-')));
    try {
      const dir = join(base, 'rtl-review-reused');
      await mkdir(dir);
      await writeFile(join(dir, OWNER_MARKER), JSON.stringify({ schema: 'rtl-review-workspace-owner-v1', owner: 'rtl-analyzer', pid: process.pid, processStart: 'Mon Jan  1 00:00:00 2001', createdAt: new Date(Date.now() - 7_200_000).toISOString() }));
      const result = await sweepOrphanedReviewWorkspaces({ root: base, referenced: new Set(), graceMs: 3600_000 });
      expect(result.removed).toEqual([dir]);
    } finally { await rm(base, { recursive: true, force: true }); }
  });
});

describe('workspace disposal outcome', () => {
  it('records a successful disposal on the workflow', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rtl-disposal-project-'));
    try {
      await mkdir(join(root, 'apps/invoicing/src/components'), { recursive: true });
      await writeFile(join(root, REVIEW_SOURCE), 'const value = {i.id};\n');
      const session = await createReviewSession(root);
      const store = new ReviewWorkflowStore(root, join(root, 'workflows.json'), new ControlledApplyService(root, new ApplyAuditStore(join(root, 'audit.json')), join(root, 'backups')));
      const workflow = { id: 'wf', state: 'Applied', session } as unknown as ReviewWorkflow;
      await store.disposeCandidate(workflow, 'applied');
      await expect(access(session.candidateRoot)).rejects.toThrow();
      expect(workflow.workspaceDisposal).toMatchObject({ state: 'disposed', reason: 'applied' });
    } finally { await rm(root, { recursive: true, force: true }); }
  });

  it('records a refused disposal as a failure instead of dropping it', async () => {
    const root = await mkdtemp(join(tmpdir(), 'rtl-disposal-refused-'));
    try {
      const store = new ReviewWorkflowStore(root, join(root, 'workflows.json'), new ControlledApplyService(root, new ApplyAuditStore(join(root, 'audit.json')), join(root, 'backups')));
      // The home directory exists and lies outside the temporary directory; disposal refuses it before any removal.
      const session = { id: 'refused', root, candidateRoot: homedir(), sourcePath: REVIEW_SOURCE, state: 'Candidate Proposed', classification: 'Manual', originalSha256: '', createdAt: new Date().toISOString() } as unknown as ReviewSession;
      const workflow = { id: 'wf', state: 'Superseded', session } as unknown as ReviewWorkflow;
      await store.disposeCandidate(workflow, 'superseded');
      expect(workflow.workspaceDisposal).toMatchObject({ state: 'failed', reason: 'superseded' });
      expect(workflow.workspaceDisposal?.error).toContain('INVALID_REVIEW_SESSION_ROOT');
      await expect(access(homedir())).resolves.toBeUndefined();
    } finally { await rm(root, { recursive: true, force: true }); }
  });
});

describe('durable rollback backups', () => {
  it('defaults new backups to the owner-only store under the home directory, not the temporary directory', () => {
    if (process.env.RTL_APPLY_BACKUP_ROOT) return;
    const service = new ControlledApplyService(tmpdir(), new ApplyAuditStore(join(tmpdir(), 'unused-audit.json')));
    const backupRoot = (service as unknown as { backupRoot: string }).backupRoot;
    expect(backupRoot).toBe(join(homedir(), '.rtl-migration-analyzer', 'apply-backups'));
    expect(backupRoot.startsWith(tmpdir())).toBe(false);
  });

  it('creates and keeps the backup directory owner-only, tightening a broader existing mode', async () => {
    if (process.platform === 'win32') return;
    const backups = join(await mkdtemp(join(tmpdir(), 'rtl-backup-mode-')), 'backups');
    await mkdir(backups, { mode: 0o755 });
    const f = await applyFixture(backups);
    try {
      await f.service.apply({ identity, reviewRecord: f.reviewRecord, evidence: [f.evidence], patch: f.patch, confirmation: APPLY_CONFIRMATION });
      expect((await stat(backups)).mode & 0o777).toBe(0o700);
    } finally { await rm(f.root, { recursive: true, force: true }); await rm(join(backups, '..'), { recursive: true, force: true }); }
  });

  it('rolls back a receipt whose backup lives at a legacy temporary location after the default changed', async () => {
    const legacy = join(await mkdtemp(join(tmpdir(), 'rtl-legacy-backups-')), 'legacy');
    const f = await applyFixture(legacy);
    try {
      const receipt = await f.service.apply({ identity, reviewRecord: f.reviewRecord, evidence: [f.evidence], patch: f.patch, confirmation: APPLY_CONFIRMATION });
      // A service built with the new default root rolls back the receipt through its recorded backup path.
      const current = new ControlledApplyService(f.root, f.audit);
      await current.rollback(receipt);
      expect(await readFile(join(f.root, REVIEW_SOURCE), 'utf8')).toBe(f.original);
    } finally { await rm(f.root, { recursive: true, force: true }); await rm(join(legacy, '..'), { recursive: true, force: true }); }
  });
});
