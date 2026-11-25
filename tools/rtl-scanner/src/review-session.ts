import { createHash, randomUUID } from 'node:crypto';
import { cp, lstat, mkdtemp, readFile, readdir, realpath, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join, posix, relative, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { type ChildProcess, execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync = promisify(execFile);
import {spawnPreviewRuntime,signalOwnedRuntime} from './runtime-process.js';
import {isOwnedShutdownStarted} from './owned-processes.js';
import { createServer as createNetServer } from 'node:net';
import type { PreviewApplication } from './example-preview-mappings.js';
import {loadProjectConfiguration,PROJECT_CONFIGURATION} from './project-configuration.js';
import {loadPreviewConfiguration,DEFAULT_STARTUP_TIMEOUT_MS,runtimeConfigName} from './preview-configuration.js';
import { writePreviewRuntimeConfig } from './preview-runtime.js';

export const REVIEW_SOURCE = 'apps/invoicing/src/components/InvoiceTable.tsx';
export const REVIEW_FINDING_ID = 'RTL.ICON.PROGRESSION:237172da962fe4d0605ddd83';
export type ReviewState = 'Not Reviewed' | 'Candidate Proposed' | 'Validation Failed' | 'Ready for Review' | 'Approved' | 'Rejected';
export type ReviewStatus = 'Not Reviewed' | 'Needs Manual Investigation' | 'Verified Correct' | 'Candidate Proposed' | 'Validation Failed' | 'Ready for Review' | 'Approved' | 'Rejected';
export type ReviewClassification = 'Manual' | 'Assisted' | 'Automated / Codemod Eligible';
export interface ReviewIdentity { findingId: string; sourcePath: string; inputDigest: string; policyDigest: string; schemaVersion: number }
export interface ReviewRecord extends ReviewIdentity { status: ReviewStatus; reviewerNotes: string; evidenceReferences: readonly string[]; candidateSessionId?: string; timestamp: string }
export interface PatchRequest { findingId: string; path: string; startOffset: number; endOffset: number; expectedSha256: string; replacement: string }
export interface ReviewSession { id: string; root: string; candidateRoot: string; sourcePath: string; state: ReviewState; classification: ReviewClassification; originalSha256: string; candidateSha256?: string; patch?: PatchRequest; createdAt: string; runtimePorts?:Record<string,number>; runtime?: { port: number; origin: string; status: 'starting'|'healthy'|'stopped'|'failed'; error?: string } }
export type ReviewComparisonState = 'ready' | 'unchanged' | 'stale' | 'unavailable';
export interface ReviewComparison { state: ReviewComparisonState; path: string; before?: string; after?: string; beforeLocation?: { line: number; column: number }; afterLocation?: { line: number; column: number }; diff: string; reason?: string }
export const CANDIDATE_PORT = 4202;
export const CANDIDATE_ORIGIN = `http://127.0.0.1:${CANDIDATE_PORT}`;
export function runtimeCacheDir(root: string, role: 'original' | 'candidate'): string { return join(resolve(root), '.rtl-vite-cache', role); }
const runtimes = new Map<string, ChildProcess>();
const runtimeStates = new Map<string, ReviewSession>();
const runtimeStarts = new Map<string, Promise<ReviewSession>>();
const reservedPorts = new Set<number>();
export const CANDIDATE_PORTS = Array.from({ length: 11 }, (_, index) => CANDIDATE_PORT + index);
const reviewRecords = new Map<string, ReviewRecord>();

const digest = (text: string) => createHash('sha256').update(text).digest('hex');
const recordKey = (identity: ReviewIdentity) => `${identity.findingId}|${identity.sourcePath}|${identity.inputDigest}|${identity.policyDigest}|${identity.schemaVersion}`;
export const reviewStatusTransitions: Record<ReviewStatus, readonly ReviewStatus[]> = {
  'Not Reviewed': ['Needs Manual Investigation', 'Verified Correct', 'Candidate Proposed'],
  'Needs Manual Investigation': ['Verified Correct', 'Candidate Proposed', 'Rejected'],
  'Verified Correct': ['Needs Manual Investigation'],
  'Candidate Proposed': ['Validation Failed', 'Ready for Review', 'Needs Manual Investigation'],
  'Validation Failed': ['Candidate Proposed', 'Needs Manual Investigation'],
  'Ready for Review': ['Approved', 'Rejected', 'Needs Manual Investigation'],
  'Approved': ['Rejected', 'Needs Manual Investigation'],
  'Rejected': ['Candidate Proposed', 'Needs Manual Investigation'],
};
export function reviewRecordKey(identity: ReviewIdentity): string { return recordKey(identity); }
/**
 * Repository-relative paths are POSIX on every platform, so the check must not use the platform path module:
 * on Windows, `normalize('src/a.css')` returns `src\a.css`. Backslashes, drive letters, control characters and
 * absolute forms are refused explicitly, and `..` segments are refused.
 */
export function isRepositoryRelativePath(value: unknown): value is string {
  if (typeof value !== 'string' || value === '') return false;
  if (/[\\\0\r\n]/.test(value) || /^[A-Za-z]:/.test(value)) return false;
  if (posix.isAbsolute(value) || value.endsWith('/') || posix.normalize(value) !== value) return false;
  return !value.split('/').includes('..');
}
export function validateReviewIdentity(identity: ReviewIdentity): void { if (!identity || typeof identity.findingId !== 'string' || !identity.findingId.trim() || identity.findingId.length > 500 || !isRepositoryRelativePath(identity.sourcePath) || identity.schemaVersion !== 2 || !identity.inputDigest || !identity.policyDigest) throw new Error('INVALID_REVIEW_IDENTITY'); }
export function validateReviewRecordShape(input: Omit<ReviewRecord, 'timestamp'> & { timestamp?: string }): void { validateReviewIdentity(input); if (!Object.prototype.hasOwnProperty.call(input, 'status') || !reviewStatusTransitions[input.status]) throw new Error('INVALID_REVIEW_STATUS'); if (typeof input.reviewerNotes !== 'string' || input.reviewerNotes.length > 4000 || !Array.isArray(input.evidenceReferences) || input.evidenceReferences.length > 50 || input.evidenceReferences.some(reference => typeof reference !== 'string' || reference.length > 500)) throw new Error('REVIEW_EVIDENCE_TOO_LARGE'); if (input.candidateSessionId !== undefined && (typeof input.candidateSessionId !== 'string' || input.candidateSessionId.length > 100)) throw new Error('INVALID_CANDIDATE_SESSION_ID'); if (input.timestamp !== undefined && (!Number.isFinite(Date.parse(input.timestamp)))) throw new Error('INVALID_REVIEW_TIMESTAMP'); }
export function getReviewRecord(identity: ReviewIdentity): ReviewRecord | null { validateReviewIdentity(identity); return reviewRecords.get(recordKey(identity)) ?? null; }
export function saveReviewRecord(input: Omit<ReviewRecord, 'timestamp'> & { timestamp?: string }): ReviewRecord {
  validateReviewRecordShape(input);
  const key = recordKey(input); const current = reviewRecords.get(key); const previous = current?.status ?? 'Not Reviewed';
  if (input.status !== previous && !reviewStatusTransitions[previous].includes(input.status)) throw new Error('INVALID_REVIEW_TRANSITION');
  const record = { ...input, timestamp: input.timestamp ?? new Date().toISOString() };
  reviewRecords.set(key, record); return record;
}
export function clearReviewRecords(): void { reviewRecords.clear(); }
const inside = (root: string, target: string) => { const r = relative(root, target); return r === '' || (r !== '..' && !r.startsWith(`..${sep}`) && !isAbsolute(r)); };
export function validateReviewPath(root: string, path: string): string {
  if (!isRepositoryRelativePath(path)) throw new Error('INVALID_REVIEW_PATH');
  const target = resolve(root, path);
  if (!inside(resolve(root), target) || path !== REVIEW_SOURCE) throw new Error('REVIEW_SOURCE_NOT_ALLOWED');
  return target;
}
export async function validateProjectSourcePath(root: string, path: string): Promise<string> {
  if (!isRepositoryRelativePath(path)) throw new Error('INVALID_REVIEW_PATH');
  const canonicalRoot = await realpath(resolve(root));
  const target = resolve(canonicalRoot, path);
  if (!inside(canonicalRoot, target)) throw new Error('REVIEW_SOURCE_NOT_ALLOWED');
  let canonicalTarget: string;
  try { canonicalTarget = await realpath(target); } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('PROJECT_SOURCE_UNAVAILABLE'); throw error; }
  if (!inside(canonicalRoot, canonicalTarget)) throw new Error('REVIEW_SOURCE_NOT_ALLOWED');
  return canonicalTarget;
}
export function validatePatch(text: string, patch: PatchRequest): void {
  if (!patch.findingId || patch.path !== REVIEW_SOURCE) throw new Error('REVIEW_FINDING_NOT_ALLOWED');
  if (!Number.isInteger(patch.startOffset) || !Number.isInteger(patch.endOffset) || patch.startOffset < 0 || patch.endOffset < patch.startOffset || patch.endOffset > text.length) throw new Error('INVALID_REVIEW_RANGE');
  if (digest(text.slice(patch.startOffset, patch.endOffset)) !== patch.expectedSha256) throw new Error('STALE_REVIEW_SOURCE');
}
/**
 * Creates a new isolated candidate root: a filtered copy of the project in the OS temporary directory, with node_modules
 * linked. The project itself is never written. Removes the new root again if the copy fails.
 */
/**
 * Converts a path reported by fs.cp into the repository-relative POSIX form that the copy allow-list is written in.
 * fs.cp reports native separators (backslashes on Windows); the separator is a parameter so both forms are testable.
 */
export function repositoryRelativeFromCopyPath(root: string, copyPath: string, separator: string = sep): string {
  return copyPath.slice(root.length + 1).split(separator).join('/');
}
/** Name of the ownership marker written at the root of every candidate workspace this module creates. */
export const OWNER_MARKER = '.rtl-review-owner.json';
const OWNER_SCHEMA = 'rtl-review-workspace-owner-v1';
export interface WorkspaceOwnerMarker { schema: typeof OWNER_SCHEMA; owner: 'rtl-analyzer'; pid: number; processStart: string | null; createdAt: string }
/** Process start time from the operating system (POSIX `ps`), used to tell a live owner from a reused process id. */
export async function processStartTime(pid: number): Promise<string | null> {
  if (process.platform === 'win32') return null;
  try { const { stdout } = await execFileAsync('ps', ['-o', 'lstart=', '-p', String(pid)]); return stdout.trim() || null; } catch { return null; }
}
export async function copyCandidateRoot(root: string, sourcePath: string): Promise<string> {
  const candidateRoot = await realpath(await mkdtemp(join(tmpdir(), 'rtl-review-')));
  try {
    const marker: WorkspaceOwnerMarker = { schema: OWNER_SCHEMA, owner: 'rtl-analyzer', pid: process.pid, processStart: await processStartTime(process.pid), createdAt: new Date().toISOString() };
    await writeFile(join(candidateRoot, OWNER_MARKER), JSON.stringify(marker), { flag: 'wx', mode: 0o600 });
    const project=await loadProjectConfiguration(root);
    const rootConfigs = (await readdir(root)).filter(name => /^(tsconfig.*\.json|(?:vite|vitest|playwright|eslint)(?:\.[\w-]+)*\.config\.[cm]?[jt]s)$/.test(name));
    const allowedTopLevel = new Set(['apps', 'libs', 'tests', 'tools', '.storybook', 'package.json', 'package-lock.json', 'nx.json', 'rtl-scanner.config.json','rtl-preview.config.json',PROJECT_CONFIGURATION, ...(project?.copyPaths.map(p=>p.split('/')[0])??[]), ...rootConfigs]);
    await cp(root, candidateRoot, { recursive: true, dereference: false, filter: (sourcePath) => { const relativePath = repositoryRelativeFromCopyPath(root, sourcePath); const parts = relativePath.split('/'); const top = parts[0] ?? ''; return relativePath === '' || (allowedTopLevel.has(top) && (!project || [PROJECT_CONFIGURATION,'rtl-preview.config.json','rtl-scanner.config.json',...rootConfigs,...project.copyPaths].some(p=>relativePath===p||relativePath.startsWith(p+'/')||p.startsWith(relativePath+'/'))) && !parts.some(part => ['node_modules', 'dist', '.nx', '.git', '.rtl-vite-cache'].includes(part))); } });
    await symlink(join(root, 'node_modules'), join(candidateRoot, 'node_modules'), 'dir');
    await validateProjectSourcePath(candidateRoot, sourcePath);
    return candidateRoot;
  } catch (error) { await rm(candidateRoot, { recursive: true, force: true }); throw error; }
}
export interface WorkspaceSweepResult { removed: string[]; kept: string[]; legacyUnmarked: string[]; failures: { path: string; error: string }[] }
async function ownerIsAlive(marker: WorkspaceOwnerMarker): Promise<boolean> {
  try { process.kill(marker.pid, 0); } catch (error) { return (error as NodeJS.ErrnoException).code === 'EPERM'; }
  // Without a recorded start time identity cannot be verified, so the owner is treated as alive.
  if (marker.processStart === null) return true;
  return (await processStartTime(marker.pid)) === marker.processStart;
}
/**
 * Removes orphaned candidate workspaces: marked by this module, owner process gone (or replaced), not referenced by any
 * persisted or live review, and older than the grace period. Unmarked (legacy) workspaces are reported, never removed.
 */
export async function sweepOrphanedReviewWorkspaces(options: { root?: string; referenced: ReadonlySet<string>; graceMs: number; now?: number }): Promise<WorkspaceSweepResult> {
  const base = await realpath(options.root ?? tmpdir());
  const result: WorkspaceSweepResult = { removed: [], kept: [], legacyUnmarked: [], failures: [] };
  const now = options.now ?? Date.now();
  for (const name of await readdir(base)) {
    if (!name.startsWith('rtl-review-')) continue;
    const path = join(base, name);
    const info = await lstat(path).catch(() => undefined);
    if (!info?.isDirectory()) continue;
    let marker: WorkspaceOwnerMarker;
    try { marker = JSON.parse(await readFile(join(path, OWNER_MARKER), 'utf8')) as WorkspaceOwnerMarker; }
    catch { result.legacyUnmarked.push(path); continue; }
    const created = Date.parse(marker.createdAt);
    if (marker.schema !== OWNER_SCHEMA || marker.owner !== 'rtl-analyzer' || !Number.isInteger(marker.pid) || !Number.isFinite(created)) { result.kept.push(path); continue; }
    if (await ownerIsAlive(marker)) { result.kept.push(path); continue; }
    const real = await realpath(path).catch(() => path);
    if (options.referenced.has(real) || options.referenced.has(path) || now - created < options.graceMs) { result.kept.push(path); continue; }
    try {
      if (!inside(base, real)) throw new Error('OUTSIDE_SWEEP_ROOT');
      await rm(real, { recursive: true, force: true });
      result.removed.push(path);
    } catch (error) { result.failures.push({ path, error: error instanceof Error ? error.message : String(error) }); }
  }
  return result;
}
export async function createReviewSession(root: string, sourcePath: string = REVIEW_SOURCE): Promise<ReviewSession> {
  const source = sourcePath===REVIEW_SOURCE?validateReviewPath(root,sourcePath):await validateProjectSourcePath(root,sourcePath);
  const sourceStat = await lstat(join(root,sourcePath));
  if (!sourceStat.isFile()) throw new Error('REVIEW_SOURCE_NOT_REGULAR_FILE');
  const candidateRoot = await copyCandidateRoot(root, sourcePath);
  try {
    const copied = await validateProjectSourcePath(candidateRoot, sourcePath);
    const text = await readFile(copied, 'utf8');
    return { id: randomUUID(), root: resolve(root), candidateRoot, sourcePath, state: 'Candidate Proposed', classification: 'Manual', originalSha256: digest(text), createdAt: new Date().toISOString() };
  } catch (error) { await rm(candidateRoot, { recursive: true, force: true }); throw error; }
}
export async function applyReviewPatch(session: ReviewSession, patch: PatchRequest): Promise<ReviewSession> {
  const target = validateReviewPath(session.candidateRoot, patch.path);
  const text = await readFile(target, 'utf8');
  validatePatch(text, patch);
  const next = text.slice(0, patch.startOffset) + patch.replacement + text.slice(patch.endOffset);
  await writeFile(target, next, 'utf8');
  return { ...session, state: 'Candidate Proposed', candidateSha256: digest(next), patch };
}
const locationAt = (text: string, offset: number): { line: number; column: number } => {
  const prefix = text.slice(0, offset);
  const line = prefix.split(/\r?\n/).length;
  const lastBreak = Math.max(prefix.lastIndexOf('\n'), prefix.lastIndexOf('\r'));
  return { line, column: offset - lastBreak };
};
export async function reviewSessionComparison(session: ReviewSession): Promise<ReviewComparison> {
  const original = await readFile(validateReviewPath(session.root, REVIEW_SOURCE), 'utf8');
  const candidate = await readFile(await validateProjectSourcePath(session.candidateRoot,session.sourcePath), 'utf8');
  if (digest(original) !== session.originalSha256) return { state: 'stale', path: REVIEW_SOURCE, diff: '', reason: 'STALE_ORIGINAL_SOURCE' };
  if (session.candidateSha256 && digest(candidate) !== session.candidateSha256) return { state: 'stale', path: REVIEW_SOURCE, diff: '', reason: 'STALE_CANDIDATE_SOURCE' };
  if (!session.patch) return original === candidate
    ? { state: 'unchanged', path: REVIEW_SOURCE, diff: 'No candidate changes applied.' }
    : { state: 'unavailable', path: REVIEW_SOURCE, diff: '', reason: 'PATCH_CORRESPONDENCE_UNAVAILABLE' };
  const patch = session.patch;
  try { validatePatch(original, patch); } catch (error) { return { state: 'stale', path: REVIEW_SOURCE, diff: '', reason: error instanceof Error ? error.message : 'STALE_REVIEW_SOURCE' }; }
  const expectedCandidate = original.slice(0, patch.startOffset) + patch.replacement + original.slice(patch.endOffset);
  if (expectedCandidate !== candidate) return { state: 'unavailable', path: REVIEW_SOURCE, diff: '', reason: 'PATCH_CORRESPONDENCE_UNAVAILABLE' };
  const before = original.slice(patch.startOffset, patch.endOffset);
  const afterStart = patch.startOffset;
  const after = candidate.slice(afterStart, afterStart + patch.replacement.length);
  const beforeLocation = locationAt(original, patch.startOffset);
  const afterLocation = locationAt(candidate, afterStart);
  return { state: 'ready', path: REVIEW_SOURCE, before, after, beforeLocation, afterLocation, diff: `--- ${REVIEW_SOURCE} (original)\n+++ ${REVIEW_SOURCE} (candidate)\n@@ ${beforeLocation.line}:${beforeLocation.column} → ${afterLocation.line}:${afterLocation.column}\n- ${before}\n+ ${after}` };
}
export async function reviewSessionDiff(session: ReviewSession): Promise<string> {
  const comparison = await reviewSessionComparison(session);
  if (comparison.state === 'ready' || comparison.state === 'unchanged') return comparison.diff;
  throw new Error(comparison.reason ?? 'PATCH_CORRESPONDENCE_UNAVAILABLE');
}
export async function assertPortAvailable(port: number = CANDIDATE_PORT): Promise<void> {
  await new Promise<void>((resolvePort, reject) => {
    const probe = createNetServer();
    probe.once('error', () => reject(new Error('CANDIDATE_PORT_OCCUPIED')));
    probe.listen(port, '127.0.0.1', () => probe.close(() => resolvePort()));
  });
}
async function runtimeIdentityHash(session:ReviewSession,application:string){const app=(await loadPreviewConfiguration(session.candidateRoot)).applications[application];return digest(await readFile(await validateProjectSourcePath(session.candidateRoot,(application==='invoicing'?session.sourcePath:app?.entry)??(application==='procurement'?'apps/procurement/src/App.tsx':session.sourcePath)),'utf8'));}
const runtimeKey = (session: ReviewSession, application: PreviewApplication) => session.id + (application === 'invoicing' ? '' : ':' + application);
export function candidateApplicationRuntime(session: ReviewSession, application: PreviewApplication): ReviewSession['runtime'] { return runtimeStates.get(runtimeKey(session, application))?.runtime; }
async function ownedRuntimeHealthy(session: ReviewSession, application: PreviewApplication = 'invoicing'): Promise<boolean> {
  const child = runtimes.get(runtimeKey(session, application));
  if (!child || child.exitCode !== null || child.signalCode !== null || !session.runtime) return false;
  try {
    const response = await fetch(session.runtime.origin + '/__rtl_preview_identity', { signal: AbortSignal.timeout(1000) });
    const identity = await response.json() as { sessionId?: string; sourceSha256?: string; role?: string; projectRoot?: string; application?: string };
    return response.ok && identity.sessionId === session.id && identity.role === 'candidate' && identity.application === application && identity.sourceSha256 === await runtimeIdentityHash(session,application) && identity.projectRoot === await realpath(session.candidateRoot);
  } catch { return false; }
}
export async function startCandidateRuntime(session: ReviewSession, application?: PreviewApplication): Promise<ReviewSession> {
  if(Object.values(session.runtimePorts??{}).some(port=>!CANDIDATE_PORTS.includes(port)))throw Error('CANDIDATE_PORT_ASSIGNMENT_INVALID');
  const apps=(await loadPreviewConfiguration(session.candidateRoot)).applications;
  application=application??(Object.keys(apps)[0]||'invoicing');
  if(!apps[application]&&!['invoicing','procurement'].includes(application))throw Error('PREVIEW_APPLICATION_NOT_CONFIGURED');
  const key = runtimeKey(session, application);
  const active = runtimeStarts.get(key);
  if (active) { const next = await active; return next; }
  const operation = startRuntime(session, application);
  runtimeStarts.set(key, operation);
  try { const next = await operation; return next; } finally { runtimeStarts.delete(key); }
}
/**
 * Verifies a running candidate server for a new composition without restarting it: the server drops its cached module graph,
 * and its identity must name this session, application and project, the composed state, and the candidate file on disk.
 */
async function reuseRuntime(session: ReviewSession, application: PreviewApplication, existing: ReviewSession, expectedSource: string): Promise<boolean> {
  // Kill switch and verification control: RTL_PREVIEW_RUNTIME_REUSE=0 forces a full restart for every composition.
  if (process.env.RTL_PREVIEW_RUNTIME_REUSE === '0') return false;
  const child = runtimes.get(runtimeKey(session, application));
  if (!child || child.exitCode !== null || child.signalCode !== null || !existing.runtime) return false;
  try {
    const refreshed = await fetch(existing.runtime.origin + '/__rtl_preview_refresh', { method: 'POST', signal: AbortSignal.timeout(2000) });
    if (!refreshed.ok) return false;
    const identity = await (await fetch(existing.runtime.origin + '/__rtl_preview_identity', { signal: AbortSignal.timeout(2000) })).json() as { sessionId?: string; role?: string; application?: string; projectRoot?: string; sourceSha256?: string; sourceHashes?: Record<string, string> };
    const onDisk = digest(await readFile(await validateProjectSourcePath(session.candidateRoot, session.sourcePath), 'utf8'));
    return identity.sessionId === session.id && identity.role === 'candidate' && identity.application === application
      && identity.projectRoot === await realpath(session.candidateRoot) && identity.sourceSha256 === expectedSource && identity.sourceHashes?.[session.sourcePath] === onDisk;
  } catch { return false; }
}
/**
 * Marks a candidate's running server as no longer serving the current composition after its files changed. The server
 * stays alive for reuse; nothing reports it as healthy until a verified reuse or a restart.
 */
export function markCandidateRuntimeStale(session: ReviewSession): ReviewSession {
  for (const key of [...runtimeStates.keys()]) {
    if (key !== session.id && !key.startsWith(session.id + ':')) continue;
    const state = runtimeStates.get(key);
    if (state?.runtime) runtimeStates.set(key, { ...state, runtime: { ...state.runtime, status: 'stopped' } });
  }
  return { ...session, runtime: session.runtime ? { ...session.runtime, status: 'stopped' } : undefined };
}
async function startRuntime(session: ReviewSession, application: PreviewApplication): Promise<ReviewSession> {
  const key = runtimeKey(session, application);
  const currentHash = digest(await readFile(await validateProjectSourcePath(session.candidateRoot,session.sourcePath), 'utf8'));
  if (session.candidateSha256 && currentHash !== session.candidateSha256) throw new Error('STALE_CANDIDATE_SOURCE');
  const dependencyMount = join(session.candidateRoot, 'node_modules');
  try { await symlink(join(session.root, 'node_modules'), dependencyMount, 'dir'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || await realpath(dependencyMount) !== await realpath(join(session.root, 'node_modules'))) throw error; }
  const sourceSha256 = digest(await readFile(await validateProjectSourcePath(session.candidateRoot,session.sourcePath), 'utf8'));
  if (session.candidateSha256 && sourceSha256 !== session.candidateSha256) throw new Error('STALE_CANDIDATE_SOURCE');
  const runtimeSourceHash = await runtimeIdentityHash(session,application);
  const configPath = join(session.candidateRoot, '.rtl-preview', runtimeConfigName(application));
  const configBefore = await readFile(configPath, 'utf8').catch(error => { if (error.code === 'ENOENT') return undefined; throw error; });
  const candidateConfig = await writePreviewRuntimeConfig(session.candidateRoot, { role: 'candidate', sessionId: session.id, sourceSha256: runtimeSourceHash }, { application, contextRoot: session.root });
  // Reuse: the Vite configuration is static, so an unchanged configuration plus a verified state refresh keeps the running server.
  // Anything that does not verify falls back to a full restart below.
  const existing = runtimeStates.get(key);
  if (existing && configBefore !== undefined && (await readFile(configPath, 'utf8')) === configBefore && await reuseRuntime(session, application, existing, runtimeSourceHash)) {
    const reused = { ...existing.runtime!, status: 'healthy' as const };
    runtimeStates.set(key, { ...existing, runtime: reused, candidateSha256: session.candidateSha256 });
    return { ...session, runtime: reused };
  }
  if (existing) await stopRuntimeKey(existing, key);
  // Retain per-application origins through composition/restart; a stopped app's URL must not become another app in the same review.
  const assignments=session.runtimePorts??(session.runtimePorts={});
  const preferred=assignments[application];
  const ports=preferred?[preferred,...CANDIDATE_PORTS.filter(p=>p!==preferred)]:CANDIDATE_PORTS;
  for (const port of ports) {
  if (isOwnedShutdownStarted()) throw new Error('COMPANION_SHUTTING_DOWN');
  if(Object.entries(assignments).some(([app,assigned])=>app!==application&&assigned===port))continue;
  if (reservedPorts.has(port)) continue;
  reservedPorts.add(port);
  try { await assertPortAvailable(port); } catch { reservedPorts.delete(port); continue; }
  const origin = `http://127.0.0.1:${port}`;
  let child:ChildProcess;
  try {
  child = await spawnPreviewRuntime(session.candidateRoot,application,candidateConfig,port, { cwd: session.candidateRoot, env: { ...process.env, NODE_PATH: join(session.root, 'node_modules'), RTL_VITE_CACHE_DIR: runtimeCacheDir(session.candidateRoot, 'candidate') }, shell: false, stdio: ['ignore', 'ignore', 'pipe'] });
  }catch(error){reservedPorts.delete(port);throw error;}
  let startupError = ''; child.stderr?.on('data', chunk => { startupError = `${startupError}${String(chunk)}`.slice(-2000); });
  child.on('error', error => { startupError = error.message; });
  runtimes.set(key, child);
  assignments[application]=port;
  const starting = { ...session,runtimePorts:assignments, candidateSha256: sourceSha256, runtime: { port, origin, status: 'starting' as const } };
  runtimeStates.set(key, starting);
  // Same startup budget as the original: the application's startupTimeoutMs, or the default.
  const candidateBudget = (await loadPreviewConfiguration(session.root).catch(() => undefined))?.applications[application]?.startupTimeoutMs ?? DEFAULT_STARTUP_TIMEOUT_MS;
  const candidateDeadline = Date.now() + candidateBudget;
  for (let attempt = 0; Date.now() < candidateDeadline; attempt++) { if (await ownedRuntimeHealthy(starting, application)) { const healthy = { ...starting, runtime: { ...starting.runtime, status: 'healthy' as const } }; runtimeStates.set(key, healthy); return healthy; } if (child.exitCode !== null || startupError.includes('EADDRINUSE') || isOwnedShutdownStarted()) break; await new Promise(resolveDelay => setTimeout(resolveDelay, 100)); }
  await stopRuntimeKey(starting, key);
  if (/EADDRINUSE|already in use/.test(startupError)) continue;
  return { ...starting, runtime: { ...starting.runtime, status: 'failed', error: startupError.trim() || 'CANDIDATE_IDENTITY_UNAVAILABLE' } };
  }
  throw new Error('CANDIDATE_PORT_POOL_EXHAUSTED');
}
async function stopRuntimeKey(session: ReviewSession, key: string): Promise<void> {
  const child = runtimes.get(key);
  if (child && child.exitCode === null && child.signalCode === null) { signalOwnedRuntime(child); await new Promise<void>(resolveStop => { const timer = setTimeout(() => { if (child.exitCode === null) signalOwnedRuntime(child,'SIGKILL'); resolveStop(); }, 2000); child.once('exit', () => { clearTimeout(timer); resolveStop(); }); }); }
  const owned = runtimeStates.get(key); if (owned?.runtime) reservedPorts.delete(owned.runtime.port); runtimes.delete(key); runtimeStates.delete(key);
}
export async function stopCandidateRuntime(session: ReviewSession): Promise<ReviewSession> {
  await Promise.all([...new Set([session.id, ...runtimes.keys(), ...runtimeStates.keys()])].filter(key => key === session.id || key.startsWith(session.id + ':')).map(key => stopRuntimeKey(session, key)));
  return { ...session, runtime: session.runtime ? { ...session.runtime, status: 'stopped' } : undefined };
}
/** Stops every runtime this process owns, whatever session it belongs to. Waits for starts in flight so none escapes. */
export async function stopAllCandidateRuntimes(): Promise<void> {
  await Promise.allSettled([...runtimeStarts.values()]);
  await Promise.allSettled([...new Set([...runtimes.keys(), ...runtimeStates.keys()])].map(key => stopRuntimeKey({} as ReviewSession, key)));
}
/** Synchronous last resort for process exit: signal every owned runtime's process group. Never touches adopted or port-owning processes. */
export function signalAllCandidateRuntimes(signal: NodeJS.Signals = 'SIGKILL'): void {
  for (const child of runtimes.values()) signalOwnedRuntime(child, signal);
}
/**
 * Idempotent: disposing a session whose candidate root is already gone succeeds without touching anything else.
 * A root that still exists must resolve inside the OS temporary directory; anything else is refused and left alone.
 */
export async function disposeReviewSession(session: ReviewSession): Promise<void> {
  await Promise.all([...runtimeStarts].filter(([key]) => key === session.id || key.startsWith(session.id + ':')).map(([, start]) => start.catch(() => undefined)));
  await stopCandidateRuntime(session);
  const candidate = await realpath(session.candidateRoot).catch((error: NodeJS.ErrnoException) => {
    if (error.code === 'ENOENT') return undefined;
    throw error;
  });
  if (candidate === undefined) return;
  if (!inside(await realpath(tmpdir()), candidate)) throw new Error('INVALID_REVIEW_SESSION_ROOT');
  await rm(candidate, { recursive: true, force: true });
}
export const reviewSourceDirectory = (root: string) => dirname(validateReviewPath(root, REVIEW_SOURCE));
