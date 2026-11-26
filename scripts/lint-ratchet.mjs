// Temporary lint ratchet for inherited violations.
//
// The ESLint configuration is unchanged: `npm run lint` (eslint .) still reports every violation. This script runs the
// same ESLint and compares each violation's identity with the committed baseline (scripts/lint-baseline.json):
//   - a violation is identified by file, rule, and the trimmed text of its line, plus its occurrence index among identical
//     lines in that file, so unrelated edits that shift line numbers do not change identities;
//   - violations that are not in the baseline fail the check;
//   - baseline entries that no longer occur are reported so the baseline can be shrunk with --update.
//
// Usage:
//   node scripts/lint-ratchet.mjs            check against the baseline (CI)
//   node scripts/lint-ratchet.mjs --update   rewrite the baseline from the current violations (reviewed changes only)
// The baseline is technical debt, tracked in a separate issue; it must shrink, never grow.
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const baselinePath = join(root, 'scripts', 'lint-baseline.json');
const update = process.argv.includes('--update');

function runEslint() {
  // ESLint exits non-zero when it finds violations; the JSON report is still on stdout.
  try {
    return execFileSync(process.execPath, [join(root, 'node_modules', 'eslint', 'bin', 'eslint.js'), '.', '-f', 'json'], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    if (typeof error.stdout === 'string' && error.stdout.trim().startsWith('[')) return error.stdout;
    throw new Error('eslint did not produce a JSON report: ' + String(error.stderr || error.message).slice(0, 2000));
  }
}

const sourceCache = new Map();
function lineText(file, line) {
  if (!sourceCache.has(file)) sourceCache.set(file, readFileSync(file, 'utf8').split(/\r?\n/));
  return (sourceCache.get(file)[line - 1] ?? '').trim();
}

// Returns identities in file order; occurrence distinguishes repeated identical lines in one file.
function identities(report) {
  const out = [];
  for (const result of report) {
    if (!result.messages?.length) continue;
    const file = relative(root, result.filePath).split('\\').join('/');
    const counts = new Map();
    const messages = [...result.messages].sort((a, b) => a.line - b.line || a.column - b.column);
    for (const m of messages) {
      if (!m.ruleId) { out.push({ file, rule: 'parse-error', text: (m.message || '').slice(0, 160), occurrence: 1, line: m.line }); continue; }
      const text = lineText(result.filePath, m.line).slice(0, 200);
      const key = m.ruleId + '\u0000' + text;
      const occurrence = (counts.get(key) ?? 0) + 1;
      counts.set(key, occurrence);
      out.push({ file, rule: m.ruleId, text, occurrence, line: m.line });
    }
  }
  return out;
}

const keyOf = (i) => [i.file, i.rule, i.text, i.occurrence].join('\u0000');
const current = identities(JSON.parse(runEslint()));

if (update) {
  const entries = current.map(({ file, rule, text, occurrence }) => ({ file, rule, text, occurrence }));
  writeFileSync(baselinePath, JSON.stringify({ description: 'Inherited lint violations tracked by scripts/lint-ratchet.mjs. Shrink only; see the technical-debt issue.', count: entries.length, entries }, null, 2) + '\n');
  console.log(`lint-ratchet: baseline written with ${entries.length} violations`);
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error('lint-ratchet: scripts/lint-baseline.json is missing. Restore it; do not regenerate it to hide new violations.');
  process.exit(2);
}
const baseline = JSON.parse(readFileSync(baselinePath, 'utf8'));
const allowed = new Map();
for (const e of baseline.entries) { const k = keyOf(e); allowed.set(k, (allowed.get(k) ?? 0) + 1); }

const introduced = [];
const remaining = new Map(allowed);
for (const i of current) {
  const k = keyOf(i);
  const left = remaining.get(k) ?? 0;
  if (left > 0) remaining.set(k, left - 1);
  else introduced.push(i);
}
const resolved = [...remaining.entries()].filter(([, n]) => n > 0).reduce((s, [, n]) => s + n, 0);

console.log(`lint-ratchet: ${current.length} violations, ${baseline.entries.length} in baseline, ${introduced.length} new, ${resolved} resolved`);
if (resolved > 0) console.log('lint-ratchet: some baseline entries no longer occur; run `node scripts/lint-ratchet.mjs --update` in the change that removes them.');
if (introduced.length) {
  console.error('lint-ratchet: new violations (fix them or fix the code, do not add them to the baseline):');
  for (const i of introduced) console.error(`  ${i.file}:${i.line}  ${i.rule}  ${i.text}`);
  process.exit(1);
}
