/**
 * Verify the reviewed readability migration against its committed source baseline.
 * Run from the repository root: node docs/readability/verify-equivalence.mjs
 * No source, policy, report, or historical artifact is rewritten by this verifier.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import ts from 'typescript';
import { transformSync } from 'esbuild';

const root = process.cwd();
const base = 'b127325a14ad3bf8e70aede2a2e29b9dae638355';
const directory = path.join(root, 'docs/readability');
const read = (name) => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8'));
const hash = (text) => createHash('sha256').update(text).digest('hex');
const originalSource = (file) => execFileSync('git', ['show', `${base}:${file}`], { cwd: root, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' });
const currentSource = (file) => fs.readFileSync(path.join(root, file), 'utf8');

/**
 * Compare TypeScript-emitted JavaScript after deterministic esbuild normalization.
 * This removes comment/layout/quote spelling differences; it is corroborating
 * evidence, not a formal proof of every JavaScript runtime behavior.
 */
function executable(text, file) {
  const output = ts.transpileModule(text, {
    fileName: file,
    compilerOptions: {
      target: ts.ScriptTarget.ESNext,
      module: ts.ModuleKind.ESNext,
      jsx: ts.JsxEmit.ReactJSX,
      removeComments: true,
    },
  }).outputText;
  return transformSync(output, {
    loader: 'js', target: 'esnext', minifyWhitespace: true,
    minifySyntax: true, minifyIdentifiers: false, legalComments: 'none',
  }).code;
}
const before = read('scanner-before.json');
const after = read('scanner-after.json');
const actual = JSON.parse(execFileSync(process.execPath, ['dist/tools/rtl-scanner/cli.js', '--format', 'json'], { cwd: root, maxBuffer: 16 * 1024 * 1024, encoding: 'utf8' }));
assert.deepEqual(actual, after, 'Current scanner result must match the reviewed after report');
const allowedPaths = new Set([
  ...read('format-equivalence.json').filter((entry) => entry.changed).map((entry) => entry.path),
  'rtl-scanner.config.json', 'docs/autonomous/protected-evidence.json',
]);
const changedPaths = execFileSync('git', ['diff', '--name-only', base], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const file of changedPaths) {
  assert(file.startsWith('docs/readability/') || allowedPaths.has(file), `Unreviewed changed path: ${file}`);
}
const sourceBefore = new Map(before.files.map((file) => [file, originalSource(file)]));
const sourceAfter = new Map(after.files.map((file) => [file, currentSource(file)]));
const runtimeFiles = read('format-equivalence.json').filter((entry) => entry.changed);
for (const { path: file, baselineRef = base } of runtimeFiles) {
  const previous = execFileSync('git', ['show', `${baselineRef}:${file}`], { cwd: root, encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  assert.equal(executable(previous, file), executable(currentSource(file), file), `Executable output changed: ${file}`);
}

/** Check every coordinate against the associated source, not just numeric ranges. */
function excerpt(record, sources) {
  const source = sources.get(record.path);
  assert.equal(typeof source, 'string', `Missing source: ${record.path}`);
  for (const point of [record.range.start, record.range.end]) {
    assert(point.offset >= 0 && point.offset <= source.length);
    const lines = source.slice(0, point.offset).split(/\r\n|\r|\n/);
    assert.deepEqual(point, { offset: point.offset, line: lines.length, column: lines.at(-1).length + 1 });
  }
  assert(record.range.start.offset <= record.range.end.offset);
  const text = source.slice(record.range.start.offset, record.range.end.offset);
  if ('original' in record) assert.equal(text, record.original);
  return text;
}
const changes = [];
for (const kind of ['evidence', 'findings', 'diagnostics']) {
  assert.equal(before[kind].length, after[kind].length, `${kind} count`);
  for (let index = 0; index < before[kind].length; index++) {
    const left = before[kind][index], right = after[kind][index];
    const oldText = excerpt(left, sourceBefore), newText = excerpt(right, sourceAfter);
    const a = structuredClone(left), b = structuredClone(right);
    delete a.range; delete b.range;
    if ('original' in a) {
      if (oldText !== newText) {
        // Only two JSX structural anchors require formatting normalization.
        assert.equal(kind, 'findings');
        assert.equal(executable(`const value = (${oldText});`, 'fragment.tsx'), executable(`const value = (${newText});`, 'fragment.tsx'));
      }
      delete a.original; delete b.original;
    } else {
      // All diagnostic expression excerpts are byte-identical in this migration.
      assert.equal(oldText, newText, 'Diagnostic source expression changed');
    }
    if ('relatedLocations' in a) {
      assert.equal(a.relatedLocations.length, b.relatedLocations.length);
      for (let i = 0; i < a.relatedLocations.length; i++) {
        assert.equal(excerpt(a.relatedLocations[i], sourceBefore), excerpt(b.relatedLocations[i], sourceAfter));
      }
      a.relatedLocations = a.relatedLocations.map(({ path }) => ({ path }));
      b.relatedLocations = b.relatedLocations.map(({ path }) => ({ path }));
    }
    assert.deepEqual(a, b, `${kind}[${index}] semantic fields, IDs, or policy decision changed`);
    if (JSON.stringify(left) !== JSON.stringify(right)) changes.push({ kind, index, id: left.id ?? null, path: left.path, previousRange: left.range, nextRange: right.range, originalFormattingChanged: oldText !== newText, reason: 'Comments/formatting shifted source coordinates; executable output and semantic fields verified.' });
  }
}
const a = structuredClone(before), b = structuredClone(after);
for (const key of ['evidence', 'findings', 'diagnostics', 'inputDigest', 'policyDigest']) { delete a[key]; delete b[key]; }
assert.deepEqual(a, b, 'Report contract, metrics, inventory, or completeness changed');
for (const [report, sources] of [[before, sourceBefore], [after, sourceAfter]]) {
  assert.equal(report.inputDigest, hash(report.files.map((file) => `${file}\0${sources.get(file)}`).join('\0')));
}
const oldPolicy = JSON.parse(originalSource('rtl-scanner.config.json'));
const newPolicy = JSON.parse(currentSource('rtl-scanner.config.json'));
assert.equal(before.policyDigest, hash(JSON.stringify(oldPolicy)));
assert.equal(after.policyDigest, hash(JSON.stringify(newPolicy)));
const migration = read('source-pin-migration.json');
assert.equal(migration.length, 3);
for (let i = 0; i < oldPolicy.dynamicExceptions.length; i++) {
  const oldPin = oldPolicy.dynamicExceptions[i], newPin = newPolicy.dynamicExceptions[i];
  assert.equal(oldPin.sourceDigest, hash(sourceBefore.get(oldPin.path)));
  assert.equal(newPin.sourceDigest, hash(sourceAfter.get(newPin.path)));
  assert.deepEqual({ ...oldPin, sourceDigest: newPin.sourceDigest }, newPin, 'Exception scope or expression digest changed');
  const matching = before.evidence.filter((e) => e.path === oldPin.path && e.property === oldPin.property && hash(e.value) === oldPin.valueDigest);
  assert.equal(matching.length, 1);
  assert.deepEqual(migration[i], { path: oldPin.path, property: oldPin.property, context: matching[0].context, valueDigestUnchanged: oldPin.valueDigest, previous: oldPin.sourceDigest, next: newPin.sourceDigest });
}
assert.deepEqual({ ...oldPolicy, dynamicExceptions: newPolicy.dynamicExceptions }, newPolicy, 'Non-pin policy change');
const oldProtection = JSON.parse(originalSource('docs/autonomous/protected-evidence.json'));
const newProtection = JSON.parse(currentSource('docs/autonomous/protected-evidence.json'));
const expectedProtection = structuredClone(oldProtection);
for (const { path: file } of migration) expectedProtection.hashes[file] = hash(sourceAfter.get(file));
expectedProtection.dynamicExceptions = newPolicy.dynamicExceptions;
assert.deepEqual(expectedProtection, newProtection, 'Protected evidence manifest changed beyond the two reviewed sources');
for (const [file, digest] of Object.entries(oldProtection.hashes)) {
  if (!migration.some((entry) => entry.path === file)) assert.equal(hash(fs.readFileSync(path.join(root, file))), digest, `Historical evidence changed: ${file}`);
}
const byRule = (r) => Object.fromEntries([...new Set(r.findings.map((f) => f.ruleId))].sort().map((rule) => [rule, r.findings.filter((f) => f.ruleId === rule).length]));
assert.deepEqual(byRule(before), byRule(after));
const summary = {
  baseline: base, executableFilesVerified: runtimeFiles.length,
  evidence: { before: before.evidence.length, after: after.evidence.length },
  findings: { before: before.findings.length, after: after.findings.length },
  diagnostics: { before: before.diagnostics.length, after: after.diagnostics.length, allNonblocking: after.diagnostics.every((d) => !d.blocking) },
  metrics: after.metrics, findingsByRule: byRule(after), complete: after.complete,
  evidenceIdChanges: 0, findingIdChanges: 0, policyScopeChanges: 0,
  inputDigest: { before: before.inputDigest, after: after.inputDigest },
  policyDigest: { before: before.policyDigest, after: after.policyDigest },
  sourceMetadataChanges: changes,
};
process.stdout.write(JSON.stringify(summary, null, 2) + '\n');
