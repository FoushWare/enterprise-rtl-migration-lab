import { createHash, randomUUID } from 'node:crypto';
import { access, chmod, lstat, mkdir, open, readFile, rename, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir, tmpdir } from 'node:os';
import { validateEvidenceSnapshot, type EvidenceSnapshot } from './evidence-store.js';
import type { ReviewIdentity, ReviewRecord, PatchRequest } from './review-session.js';
import { validateReviewIdentity, validateReviewPath, validatePatch, validateProjectSourcePath, REVIEW_SOURCE } from './review-session.js';

export const APPLY_CONFIRMATION = 'APPLY_CONFIRMED';
export interface ApplyAuthorization { identity: ReviewIdentity; reviewRecord: ReviewRecord; evidence: readonly EvidenceSnapshot[]; patch: PatchRequest; confirmation: string }
export interface ApplyReceipt { auditId: string; path: string; originalSha256: string; appliedSha256: string; backupPath: string; appliedAt: string }
export interface ApplyAuditEvent { auditId: string; type: 'APPLY_PREPARED' | 'APPLIED' | 'ROLLED_BACK' | 'APPLY_FAILED' | 'ROLLBACK_FAILED'; path: string; sourceSha256: string; resultingSha256?: string; backupPath?: string; timestamp: string; reason?: string }
const active = new Set<string>();
const sha = (text: string) => createHash('sha256').update(text).digest('hex');
const readNoFollow = async (path: string): Promise<string> => { const handle = await open(path, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0)); try { return await handle.readFile('utf8'); } finally { await handle.close(); } };
const atomicWrite = async (path: string, content: string): Promise<void> => { const temporary = `${path}.rtl-apply.${process.pid}.${randomUUID()}.tmp`; try { await writeFile(temporary, content, { encoding: 'utf8', flag: 'wx', mode: 0o600 }); await rename(temporary, path); } catch (error) { try { await access(temporary, constants.F_OK); await rename(temporary, `${temporary}.failed`); } catch { /* preserve original error */ } throw error; } };

export class ApplyAuditStore {
  constructor(readonly path: string) {}
  async list(): Promise<ApplyAuditEvent[]> { try { return JSON.parse(await readFile(this.path, 'utf8')) as ApplyAuditEvent[]; } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw new Error('APPLY_AUDIT_UNREADABLE'); } }
  async append(event: ApplyAuditEvent): Promise<void> { const parent = dirname(this.path); await mkdir(parent, { recursive: true, mode: 0o700 }); const events = await this.list(); events.push(event); await atomicWrite(this.path, `${JSON.stringify(events, null, 2)}\n`); }
}

/**
 * Durable rollback backups are owner-only. The directory is created 0700, and an existing directory that a broader mode
 * left readable by others is tightened. Backups written before this change keep their recorded paths, so rollback of
 * existing receipts is unaffected.
 */
async function ensureOwnerOnlyDirectory(directory: string): Promise<void> {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const info = await lstat(directory);
  if (!info.isDirectory()) throw new Error('APPLY_BACKUP_ROOT_NOT_DIRECTORY');
  if (process.platform !== 'win32' && (info.mode & 0o077) !== 0) await chmod(directory, 0o700);
}
export class ControlledApplyService {
  constructor(private readonly repositoryRoot: string, private readonly audit = new ApplyAuditStore(process.env.RTL_AUDIT_STORE_PATH || join(homedir(), '.rtl-migration-analyzer', 'apply-audit-v1.json')), private readonly backupRoot = process.env.RTL_APPLY_BACKUP_ROOT || join(homedir(), '.rtl-migration-analyzer', 'apply-backups')) {}
  async recoverAcceptedFileReceipts(operationId: string): Promise<ApplyReceipt[]> {
    const events = await this.audit.list(); const receipts: ApplyReceipt[] = [];
    for (const e of events.filter(e => e.type === 'APPLY_PREPARED' && e.auditId === `${operationId}:${e.path}`)) {
      if (!e.backupPath || !e.resultingSha256 || sha(await readFile(e.backupPath, 'utf8')) !== e.sourceSha256) throw new Error('APPLY_BACKUP_MISMATCH');
      const current = sha(await readNoFollow(await validateProjectSourcePath(this.repositoryRoot, e.path)));
      // Prepared but unwritten files are not tool-owned rollback changes.
      if (current === e.resultingSha256 || events.some(done => done.auditId === e.auditId && done.type === 'APPLIED')) receipts.push({ auditId: e.auditId, path: e.path, originalSha256: e.sourceSha256, appliedSha256: e.resultingSha256, backupPath: e.backupPath, appliedAt: e.timestamp });
    }
    return receipts;
  }
  /** Internal workflow boundary: callers must supply the accepted, validated file set. Journal precedes writes. */
  async applyAcceptedFiles(operationId: string, files: readonly { path: string; before: string; after: string }[], confirmation: string): Promise<ApplyReceipt[]> {
    if (confirmation !== APPLY_CONFIRMATION) throw new Error('APPLY_CONFIRMATION_REQUIRED');
    const events = await this.audit.list();
    const prepared: ApplyReceipt[] = [];
    for (const file of files) {
      const path = await validateProjectSourcePath(this.repositoryRoot, file.path);
      if (!(await lstat(path)).isFile()) throw new Error('APPLY_SOURCE_NOT_REGULAR_FILE');
      const auditId = `${operationId}:${file.path}`;
      const old = events.find(e => e.auditId === auditId && e.type === 'APPLY_PREPARED');
      const current = sha(await readNoFollow(path));
      if (current !== sha(file.before) && !(old && current === sha(file.after))) throw new Error('STALE_APPLY_SOURCE');
      if (old && (old.sourceSha256 !== sha(file.before) || old.resultingSha256 !== sha(file.after))) throw new Error('APPLY_OPERATION_MISMATCH');
      if (!old) {
        await ensureOwnerOnlyDirectory(this.backupRoot);
        const backupPath = join(this.backupRoot, `${randomUUID()}.bak`);
        await writeFile(backupPath, file.before, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        const timestamp = new Date().toISOString();
        await this.audit.append({ auditId, type: 'APPLY_PREPARED', path: file.path, sourceSha256: sha(file.before), resultingSha256: sha(file.after), backupPath, timestamp });
        prepared.push({ auditId, path: file.path, originalSha256: sha(file.before), appliedSha256: sha(file.after), backupPath, appliedAt: timestamp });
      } else prepared.push({ auditId, path: file.path, originalSha256: old.sourceSha256, appliedSha256: old.resultingSha256!, backupPath: old.backupPath!, appliedAt: old.timestamp });
    }
    for (const [index, receipt] of prepared.entries()) {
      const path = await validateProjectSourcePath(this.repositoryRoot, receipt.path);
      const current = sha(await readNoFollow(path));
      if (sha(await readFile(receipt.backupPath, 'utf8')) !== receipt.originalSha256) throw new Error('APPLY_BACKUP_MISMATCH');
      if (current === receipt.appliedSha256) continue;
      if (current !== receipt.originalSha256) throw new Error('STALE_APPLY_SOURCE');
      await atomicWrite(path, files[index].after);
      await this.audit.append({ auditId: receipt.auditId, type: 'APPLIED', path: receipt.path, sourceSha256: receipt.originalSha256, resultingSha256: receipt.appliedSha256, backupPath: receipt.backupPath, timestamp: new Date().toISOString() });
    }
    return prepared;
  }
  async rollbackAcceptedFiles(receipts: readonly ApplyReceipt[]): Promise<void> {
    const events = await this.audit.list();
    // Preflight the entire scope: a later user edit blocks every write in this rollback.
    for (const r of receipts) {
      const event = events.find(e => e.auditId === r.auditId && e.type === 'APPLY_PREPARED' && e.path === r.path && e.backupPath === r.backupPath && e.sourceSha256 === r.originalSha256 && e.resultingSha256 === r.appliedSha256);
      if (!event) throw new Error('ROLLBACK_RECEIPT_UNTRUSTED');
      const current = sha(await readNoFollow(await validateProjectSourcePath(this.repositoryRoot, r.path)));
      if (current !== r.appliedSha256 && current !== r.originalSha256) throw new Error('ROLLBACK_CONFLICT');
      if (sha(await readFile(r.backupPath, 'utf8')) !== r.originalSha256) throw new Error('ROLLBACK_BACKUP_MISMATCH');
    }
    for (const r of receipts) {
      const path = await validateProjectSourcePath(this.repositoryRoot, r.path);
      const current = sha(await readNoFollow(path));
      if (current === r.originalSha256) continue;
      if (current !== r.appliedSha256) throw new Error('ROLLBACK_CONFLICT');
      await atomicWrite(path, await readFile(r.backupPath, 'utf8'));
      await this.audit.append({ auditId: r.auditId, type: 'ROLLED_BACK', path: r.path, sourceSha256: r.appliedSha256, resultingSha256: r.originalSha256, backupPath: r.backupPath, timestamp: new Date().toISOString() });
    }
  }
  async recoverRollbackReceipt(pathValue: string, originalSha256: string, appliedSha256: string): Promise<ApplyReceipt | null> {
    const path = validateReviewPath(this.repositoryRoot, pathValue); const events = await this.audit.list(); const applied = [...events].reverse().find(event => event.type === 'APPLIED' && event.path === pathValue && event.sourceSha256 === originalSha256 && event.resultingSha256 === appliedSha256 && event.backupPath);
    if (!applied?.backupPath || events.some(event => event.auditId === applied.auditId && event.type === 'ROLLED_BACK')) return null;
    const current = await readNoFollow(path); if (sha(current) !== appliedSha256) return null;
    const backup = await readFile(applied.backupPath, 'utf8'); if (sha(backup) !== originalSha256) return null;
    return { auditId: applied.auditId, path: pathValue, originalSha256, appliedSha256, backupPath: applied.backupPath, appliedAt: applied.timestamp };
  }
  async apply(auth: ApplyAuthorization): Promise<ApplyReceipt> {
    validateReviewIdentity(auth.identity);
    if (auth.confirmation !== APPLY_CONFIRMATION) throw new Error('APPLY_CONFIRMATION_REQUIRED');
    if (auth.reviewRecord.status !== 'Approved' || auth.reviewRecord.findingId !== auth.identity.findingId || auth.reviewRecord.inputDigest !== auth.identity.inputDigest || auth.reviewRecord.policyDigest !== auth.identity.policyDigest) throw new Error('APPROVED_REVIEW_REQUIRED');
    if (auth.patch.path !== REVIEW_SOURCE || auth.patch.findingId !== auth.identity.findingId) throw new Error('APPLY_PATCH_IDENTITY_MISMATCH');
    const evidence = auth.evidence.find(x => { try { validateEvidenceSnapshot(x); } catch { return false; } return x.findingId === auth.identity.findingId && x.sourcePath === auth.identity.sourcePath && x.inputDigest === auth.identity.inputDigest && x.policyDigest === auth.identity.policyDigest && (x.decision === 'Approved' || x.decision === 'Ready for Review') && x.candidatePatchIdentity.expectedSha256 === auth.patch.expectedSha256 && x.candidatePatchIdentity.replacementSha256 === sha(auth.patch.replacement) && !x.scannerAfter.findingPresent && x.browserDomValidation.length > 0; });
    if (!evidence) throw new Error('VALIDATION_EVIDENCE_REQUIRED');
    const path = validateReviewPath(this.repositoryRoot, auth.patch.path); const key = path; if (active.has(key)) throw new Error('APPLY_IN_PROGRESS'); active.add(key);
    try { const stat = await lstat(path); if (!stat.isFile()) throw new Error('APPLY_SOURCE_NOT_REGULAR_FILE'); const original = await readNoFollow(path); const originalSha256 = sha(original); if (originalSha256 !== evidence.originalSourceSha256) throw new Error('STALE_APPLY_SOURCE'); validatePatch(original, auth.patch); const next = original.slice(0, auth.patch.startOffset) + auth.patch.replacement + original.slice(auth.patch.endOffset); const appliedSha256 = sha(next); if (appliedSha256 !== evidence.candidateSourceSha256) throw new Error('APPLY_RESULT_MISMATCH'); await ensureOwnerOnlyDirectory(this.backupRoot); const backupPath = join(this.backupRoot, `${randomUUID()}.bak`); await writeFile(backupPath, original, { encoding: 'utf8', mode: 0o600, flag: 'wx' }); if (sha(await readFile(backupPath, 'utf8')) !== originalSha256) throw new Error('APPLY_BACKUP_MISMATCH'); const auditId = randomUUID(); try { await atomicWrite(path, next); } catch (error) { await this.audit.append({ auditId, type: 'APPLY_FAILED', path: auth.patch.path, sourceSha256: originalSha256, timestamp: new Date().toISOString(), reason: 'ATOMIC_WRITE_FAILED' }); throw error; } try { await this.audit.append({ auditId, type: 'APPLIED', path: auth.patch.path, sourceSha256: originalSha256, resultingSha256: appliedSha256, backupPath, timestamp: new Date().toISOString() }); } catch (error) { await atomicWrite(path, original); throw new Error('APPLY_AUDIT_FAILED'); } return { auditId, path: auth.patch.path, originalSha256, appliedSha256, backupPath, appliedAt: new Date().toISOString() }; } finally { active.delete(key); }
  }
  async rollback(receipt: ApplyReceipt): Promise<void> { const path = validateReviewPath(this.repositoryRoot, receipt.path); const key = path; if (active.has(key)) throw new Error('APPLY_IN_PROGRESS'); active.add(key); try { const current = await readNoFollow(path); if (sha(current) !== receipt.appliedSha256) { await this.audit.append({ auditId: receipt.auditId, type: 'ROLLBACK_FAILED', path: receipt.path, sourceSha256: receipt.originalSha256, resultingSha256: sha(current), timestamp: new Date().toISOString(), reason: 'CURRENT_SOURCE_CHANGED' }); throw new Error('ROLLBACK_CONFLICT'); } const backup = await readFile(receipt.backupPath, 'utf8'); if (sha(backup) !== receipt.originalSha256) throw new Error('ROLLBACK_BACKUP_MISMATCH'); await atomicWrite(path, backup); await this.audit.append({ auditId: receipt.auditId, type: 'ROLLED_BACK', path: receipt.path, sourceSha256: receipt.appliedSha256, resultingSha256: receipt.originalSha256, backupPath: receipt.backupPath, timestamp: new Date().toISOString() }); } finally { active.delete(key); } }
}
