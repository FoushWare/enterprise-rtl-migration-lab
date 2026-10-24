import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const git = promisify(execFile);
const digest = (text) => createHash('sha256').update(text).digest('hex');
const stable = (value) => JSON.stringify(value, null, 2) + '\n';
const fail = (message) => {
  throw new Error(message);
};
const property =
  /^(margin|padding|border)-(left|right)(-(width|style|color))?$/;

function shape(value, keys) {
  if (
    !value ||
    typeof value !== 'object' ||
    Array.isArray(value) ||
    stable(Object.keys(value).sort()) !== stable([...keys].sort())
  )
    fail('Invalid plan/journal shape');
}
/**
 * Reject unsupported plan fields, identities, selections, and source digests.
 * @param plan - Untrusted plan or journal payload.
 * @throws When its schema or exact edit inventory is not supported.
 */
function validatePlan(plan) {
  shape(plan, [
    'schemaVersion',
    'kind',
    'commit',
    'policyDigest',
    'inputDigest',
    'eligibleIds',
    'selectedIds',
    'files',
  ]);
  if (
    plan.schemaVersion !== 1 ||
    plan.kind !== 'rtl-codemod-plan' ||
    typeof plan.commit !== 'string' ||
    typeof plan.policyDigest !== 'string' ||
    typeof plan.inputDigest !== 'string' ||
    !/^([a-f0-9]{40}|[a-f0-9]{64})$/.test(plan.commit) ||
    !/^[a-f0-9]{64}$/.test(plan.policyDigest) ||
    !/^[a-f0-9]{64}$/.test(plan.inputDigest)
  )
    fail('Invalid plan metadata');
  for (const ids of [plan.eligibleIds, plan.selectedIds]) {
    if (
      !Array.isArray(ids) ||
      ids.some(
        (id) =>
          typeof id !== 'string' ||
          !/^RTL\.CSS\.PHYSICAL:[a-f0-9]{24}$/.test(id),
      ) ||
      new Set(ids).size !== ids.length
    )
      fail('Invalid plan IDs');
  }
  if (
    plan.selectedIds.some((id) => !plan.eligibleIds.includes(id)) ||
    !Array.isArray(plan.files) ||
    new Set(plan.files.map((f) => f.path)).size !== plan.files.length
  )
    fail('Invalid selection/file inventory');
  for (const file of plan.files) {
    shape(file, [
      'path',
      'before',
      'after',
      'edits',
      'beforeDigest',
      'afterDigest',
    ]);
    validPath(file.path);
    if (
      typeof file.before !== 'string' ||
      typeof file.after !== 'string' ||
      !Array.isArray(file.edits) ||
      digest(file.before) !== file.beforeDigest ||
      digest(file.after) !== file.afterDigest
    )
      fail('Invalid source bytes/digests');
    for (const edit of file.edits) {
      shape(edit, ['findingId', 'evidenceId', 'start', 'from', 'to']);
      if (
        !plan.selectedIds.includes(edit.findingId) ||
        typeof edit.evidenceId !== 'string' ||
        !/^[a-f0-9]{64}$/.test(edit.evidenceId) ||
        typeof edit.from !== 'string' ||
        typeof edit.to !== 'string'
      )
        fail('Invalid edit identity');
    }
  }
}

async function head(root) {
  return (await git('git', ['rev-parse', 'HEAD'], { cwd: root })).stdout.trim();
}
async function clean(root) {
  if (
    (
      await git('git', ['status', '--porcelain', '--untracked-files=all'], {
        cwd: root,
      })
    ).stdout
  )
    fail('Apply requires a clean committed checkout');
}
function validPath(relative) {
  if (typeof relative !== 'string') fail('Source path must be a string');
  if (relative === 'rtl-scanner.config.json') return;
  if (
    !/^(apps|libs)\/[a-zA-Z0-9_./-]+\.css$/.test(relative) ||
    relative.split('/').includes('..') ||
    relative.includes('//')
  )
    fail('Unsupported repository-relative CSS path');
}
/**
 * Resolve an allowed repository path while rejecting symlink traversal.
 * @returns The existing regular file; this does not authorize an edit.
 */
async function safePath(root, relative) {
  validPath(relative);
  let current = root;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    if ((await fs.lstat(current)).isSymbolicLink())
      fail('Symlink targets are forbidden');
  }
  if (!(await fs.stat(current)).isFile()) fail('Target must be a regular file');
  return current;
}
async function source(root, relative) {
  const file = await safePath(root, relative);
  const bytes = await fs.readFile(file);
  const text = bytes.toString('utf8');
  if (!Buffer.from(text).equals(bytes))
    fail('Only lossless UTF-8 source is supported');
  return text;
}
function logical(p) {
  if (!property.test(p)) fail('Unsupported property');
  return p.replace(
    /^(margin|padding|border)-(left|right)/,
    (_, group, side) => `${group}-inline-${side === 'left' ? 'start' : 'end'}`,
  );
}
/**
 * Apply exact property-name edits from the end of the source towards the start.
 * Each edit must match original bytes, avoid overlap, and equal the allowed logical
 * property conversion. Values and all unrelated source bytes remain untouched.
 */
function replace(text, edits) {
  let result = text,
    previous = text.length;
  for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
    if (
      !Number.isInteger(edit.start) ||
      edit.start < 0 ||
      edit.start + edit.from.length > previous ||
      text.slice(edit.start, edit.start + edit.from.length) !== edit.from ||
      edit.to !== logical(edit.from)
    )
      fail('Invalid or overlapping exact property edit');
    result =
      result.slice(0, edit.start) +
      edit.to +
      result.slice(edit.start + edit.from.length);
    previous = edit.start;
  }
  return result;
}
async function scanner() {
  try {
    return await import('../../dist/tools/rtl-scanner/scan.js');
  } catch {
    fail('Build scanner first with npm run rtl:scan:build');
  }
}

// Reports/IDs are recomputed from source and existing strict scanner policy.
// This tool never creates an approval or uses a new suppression mechanism.
/**
 * Build a dry-run plan from a fresh complete scan and explicit reviewed finding IDs.
 * Only approved plain-CSS candidates with exact source digests are eligible. No source
 * is written and no approval is created.
 * @param root - Repository to inspect.
 * @param selectedIds - Explicit finding IDs; an empty selection makes no edits.
 * @returns A provenance-bound plan with before/after bytes and exact property edits.
 */
export async function prepare(root, selectedIds = []) {
  root = await fs.realpath(root);
  if (
    !Array.isArray(selectedIds) ||
    selectedIds.some(
      (id) =>
        typeof id !== 'string' || !/^RTL\.CSS\.PHYSICAL:[a-f0-9]{24}$/.test(id),
    ) ||
    new Set(selectedIds).size !== selectedIds.length
  )
    fail('Unique explicit CSS finding IDs required');
  const report = await (await scanner()).scan(root);
  if (!report.complete) fail('Scanner coverage or policy is incomplete');
  const eligible = report.findings
    .filter(
      (f) =>
        f.category === 'AUTO_CANDIDATE' &&
        f.sourceMechanism === 'css' &&
        f.ownership === 'custom-css',
    )
    .map((f) => f.id)
    .sort();
  const files = new Map(),
    consumed = new Set();
  let configText, config;
  if (selectedIds.length) {
    configText = await source(root, 'rtl-scanner.config.json');
    config = JSON.parse(configText);
  }
  for (const id of [...selectedIds].sort()) {
    const finding = report.findings.find((f) => f.id === id);
    if (
      !finding ||
      !eligible.includes(id) ||
      finding.evidenceIds.length !== 1 ||
      !finding.suggestion
    )
      fail('Selection is not an approved plain-CSS candidate');
    const evidence = report.evidence.find(
      (e) => e.id === finding.evidenceIds[0],
    );
    if (
      !evidence ||
      !property.test(evidence.property) ||
      /[(){};]/.test(evidence.value) ||
      /^(inherit|initial|unset|revert|revert-layer)$/.test(evidence.value)
    )
      fail('Unsupported declaration/value');
    if (
      finding.suggestion.property !== logical(evidence.property) ||
      finding.suggestion.value !== evidence.value
    )
      fail('Logical suggestion mismatch');
    if (config.dynamicExceptions?.some((pin) => pin.path === evidence.path))
      fail('Protected policy source pins require separate review');
    const peers = report.evidence.filter(
      (e) => e.path === evidence.path && e.context === evidence.context,
    );
    if (
      peers.some(
        (e) =>
          e.property === finding.suggestion.property ||
          [
            'margin',
            'padding',
            'border',
            'border-width',
            'border-style',
            'border-color',
          ].includes(e.property),
      )
    )
      fail('Logical/cascade overlap requires manual review');
    if (
      report.evidence.some(
        (e) =>
          e.path === evidence.path &&
          ['direction', 'writing-mode'].includes(e.property),
      )
    )
      fail('Direction islands/writing modes require manual review');
    const text = await source(root, evidence.path);
    if (
      text.slice(evidence.range.start.offset, evidence.range.end.offset) !==
        evidence.original ||
      !new RegExp('^' + evidence.property + '\\s*:').test(evidence.original)
    )
      fail('Evidence/source mismatch');
    const approval = config.approvals.findIndex(
      (a) =>
        a.path === evidence.path &&
        a.context === evidence.context &&
        a.property === evidence.property &&
        a.value === evidence.value &&
        a.owner === 'custom-css' &&
        a.logicalProperty === finding.suggestion.property &&
        a.sourceDigest === digest(text),
    );
    if (approval < 0) fail('Exact existing semantic approval required');
    consumed.add(approval);
    if (!files.has(evidence.path))
      files.set(evidence.path, {
        path: evidence.path,
        before: text,
        edits: [],
      });
    files
      .get(evidence.path)
      .edits.push({
        findingId: id,
        evidenceId: evidence.id,
        start: evidence.range.start.offset,
        from: evidence.property,
        to: finding.suggestion.property,
      });
  }
  if (config?.approvals.some((a, i) => files.has(a.path) && !consumed.has(i)))
    fail('Partial file migration would stale an unconsumed approval');
  const changes = [...files.values()]
    .sort((a, b) => a.path.localeCompare(b.path))
    .map((file) => {
      const after = replace(file.before, file.edits);
      return {
        ...file,
        after,
        beforeDigest: digest(file.before),
        afterDigest: digest(after),
      };
    });
  if (consumed.size) {
    const after = stable({
      ...config,
      approvals: config.approvals.filter((_, i) => !consumed.has(i)),
    });
    changes.push({
      path: 'rtl-scanner.config.json',
      before: configText,
      after,
      beforeDigest: digest(configText),
      afterDigest: digest(after),
      edits: [],
    });
  }
  return {
    schemaVersion: 1,
    kind: 'rtl-codemod-plan',
    commit: await head(root),
    policyDigest: report.policyDigest,
    inputDigest: report.inputDigest,
    eligibleIds: eligible,
    selectedIds: [...selectedIds].sort(),
    files: changes,
  };
}
/**
 * Verify committed original bytes, HEAD, and the permitted policy approval reduction.
 * A saved journal is not trusted merely because its stored hashes are self-consistent.
 */
async function provenance(root, plan) {
  if (plan.commit !== (await head(root))) fail('Commit precondition changed');
  for (const file of plan.files) {
    validPath(file.path);
    if (
      digest(file.before) !== file.beforeDigest ||
      digest(file.after) !== file.afterDigest
    )
      fail('Journal digest mismatch');
    const committed = (
      await git('git', ['show', `${plan.commit}:${file.path}`], {
        cwd: root,
        maxBuffer: 8 * 1024 * 1024,
      })
    ).stdout;
    if (committed !== file.before)
      fail('Original bytes do not match committed provenance');
    if (
      file.path !== 'rtl-scanner.config.json' &&
      replace(file.before, file.edits) !== file.after
    )
      fail('Journal contains changes outside exact property edits');
  }
  const policy = plan.files.find((f) => f.path === 'rtl-scanner.config.json');
  if (policy) {
    const before = JSON.parse(policy.before),
      after = JSON.parse(policy.after);
    if (
      stable({ ...before, approvals: [] }) !==
        stable({ ...after, approvals: [] }) ||
      after.approvals.some(
        (a) => !before.approvals.some((b) => stable(a) === stable(b)),
      )
    )
      fail('Journal changes nonapproval policy records');
  }
}
async function externalJournal(root, journal) {
  if (!path.isAbsolute(journal))
    fail('Absolute external journal path required');
  const parent = await fs.realpath(path.dirname(journal));
  const target = path.join(parent, path.basename(journal));
  const relative = path.relative(root, target);
  if (!relative.startsWith('..' + path.sep) && relative !== '..')
    fail('Journal must be outside the source checkout');
  return target;
}
/**
 * Stage every output before replacement, then recheck each input before renaming.
 * Ordinary I/O failures are recovered only while source still matches expected bytes.
 * This is not a crash-atomic multi-file transaction; the external journal is retained.
 */
async function transact(root, files, forward) {
  const staged = [],
    committed = [];
  try {
    // Stage all outputs first; recheck every input before touching targets.
    for (const file of files) {
      const current = await source(root, file.path);
      if (digest(current) !== (forward ? file.beforeDigest : file.afterDigest))
        fail('Source changed; no overwrite authorized');
      const destination = await safePath(root, file.path),
        temporary = destination + '.rtl-stage-' + randomUUID();
      staged.push({ file, destination, temporary });
      await fs.writeFile(temporary, forward ? file.after : file.before, {
        flag: 'wx',
        mode: (await fs.stat(destination)).mode & 0o777,
      });
    }
    for (const stage of staged) {
      if (
        digest(await source(root, stage.file.path)) !==
        (forward ? stage.file.beforeDigest : stage.file.afterDigest)
      )
        fail('Concurrent source change before commit');
      await fs.rename(stage.temporary, stage.destination);
      committed.push(stage);
    }
  } catch (error) {
    // Recover ordinary I/O failures without overwriting concurrent user edits.
    for (const stage of committed.reverse()) {
      const expected = forward
        ? stage.file.afterDigest
        : stage.file.beforeDigest;
      if (digest(await source(root, stage.file.path)) !== expected)
        fail(
          'Concurrent change prevents automatic recovery; retain external journal',
        );
      await fs.writeFile(
        stage.destination,
        forward ? stage.file.before : stage.file.after,
      );
    }
    throw error;
  } finally {
    for (const stage of staged) await fs.rm(stage.temporary, { force: true });
  }
}

/**
 * Recompute a plan in a clean committed checkout before applying selected edits.
 * The exclusive external journal is synced before replacement and a post-scan must
 * remain complete. Concurrent edits cause refusal rather than silent overwrite.
 * @param root - Target repository.
 * @param plan - Exact plan previously prepared for this HEAD and policy.
 * @param journal - Absolute path outside the repository for recovery metadata.
 * @returns Changed paths and, when changes exist, the journal location.
 */
export async function apply(root, plan, journal) {
  root = await fs.realpath(root);
  validatePlan(plan);
  await clean(root);
  const regenerated = await prepare(root, plan?.selectedIds);
  if (stable(plan) !== stable(regenerated))
    fail('Plan schema/source/policy preconditions changed');
  await provenance(root, plan);
  if (!plan.files.length) return { changed: [] };
  journal = await externalJournal(root, journal);
  await fs.writeFile(
    journal,
    stable({ schemaVersion: 1, kind: 'rtl-codemod-journal', plan }),
    { flag: 'wx', mode: 0o600 },
  );
  // The journal is durable before the first source replacement.
  const handle = await fs.open(journal, 'r');
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
  await transact(root, plan.files, true);
  try {
    const report = await (await scanner()).scan(root);
    if (
      !report.complete ||
      report.diagnostics.some((d) => d.code.startsWith('POLICY'))
    )
      fail('Post-apply scanner/policy verification failed');
  } catch (error) {
    await transact(root, plan.files, false);
    throw error;
  }
  return { changed: plan.files.map((f) => f.path), journal };
}

/**
 * Restore journal originals only when current bytes match a known plan state.
 * Already restored files are skipped; unrelated user edits are never overwritten.
 * @param root - Repository at the plan commit.
 * @param journal - External journal created by apply.
 * @returns Paths restored during this call.
 */
export async function rollback(root, journal) {
  root = await fs.realpath(root);
  journal = await externalJournal(root, journal);
  const record = JSON.parse(await fs.readFile(journal, 'utf8'));
  if (
    stable(Object.keys(record).sort()) !==
      stable(['kind', 'plan', 'schemaVersion']) ||
    record.schemaVersion !== 1 ||
    record.kind !== 'rtl-codemod-journal' ||
    record.plan?.schemaVersion !== 1 ||
    record.plan.kind !== 'rtl-codemod-plan' ||
    !Array.isArray(record.plan.files)
  )
    fail('Invalid rollback journal');
  validatePlan(record.plan);
  await provenance(root, record.plan);
  const pending = [];
  for (const file of record.plan.files) {
    const current = digest(await source(root, file.path));
    if (current === file.beforeDigest) continue;
    if (current !== file.afterDigest)
      fail('Source changed; rollback must preserve user edits');
    pending.push(file);
  }
  await transact(root, pending, false);
  return { restored: pending.map((f) => f.path) };
}
