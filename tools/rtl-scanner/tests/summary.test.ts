import { afterAll, beforeAll, expect, it } from 'vitest';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  symlink,
  rm,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import ts from 'typescript';
import { summary, supportsSummaryColor } from '../src/summary.js';
import { scan } from '../src/scan.js';
import { json, markdown } from '../src/report.js';
import { exitCode } from '../src/coverage.js';
import { emptyPolicy } from '../src/policy.js';
import type { Report } from '../src/model.js';

const empty = (): Report => ({
  schemaVersion: 2,
  kind: 'rtl-risk-report',
  policyDigest: '',
  inputDigest: '',
  files: [],
  skipped: [],
  evidence: [],
  findings: [],
  diagnostics: [],
  metrics: {
    byCategory: {},
    bySeverity: {},
    byConfidence: {},
    uniqueAffectedFiles: 0,
    referenceCaseIds: [],
  },
  complete: true,
});
const range = {
  start: { offset: 0, line: 1, column: 1 },
  end: { offset: 0, line: 1, column: 1 },
};
let directory: string;
let report: Report;

beforeAll(async () => {
  report = await scan(process.cwd());
  // Compile the actual CLI into a disposable directory so tests never depend on
  // stale dist files or rewrite application sources/protected evidence.
  directory = await mkdtemp(join(tmpdir(), 'rtl-summary-test-'));
  await writeFile(join(directory, 'package.json'), '{"type":"module"}');
  const incomplete = join(directory, 'incomplete');
  await mkdir(join(incomplete, 'apps/demo/src'), { recursive: true });
  await mkdir(join(incomplete, 'libs'));
  await writeFile(
    join(incomplete, 'apps/demo/project.json'),
    JSON.stringify({ sourceRoot: 'apps/demo/src' }),
  );
  await writeFile(
    join(incomplete, 'apps/demo/index.html'),
    '<html lang="en" dir="ltr"></html>',
  );
  await writeFile(join(incomplete, 'apps/demo/src/broken.css'), '.broken {');
  await writeFile(
    join(incomplete, 'rtl-scanner.config.json'),
    JSON.stringify(emptyPolicy),
  );
  await symlink(
    join(process.cwd(), 'node_modules'),
    join(directory, 'node_modules'),
  );
  for (const file of await readdir('tools/rtl-scanner/src')) {
    if (!file.endsWith('.ts')) continue;
    const source = await readFile(join('tools/rtl-scanner/src', file), 'utf8');
    await writeFile(
      join(directory, file.replace(/\.ts$/, '.js')),
      ts.transpileModule(source, {
        compilerOptions: {
          target: ts.ScriptTarget.ES2022,
          module: ts.ModuleKind.ESNext,
        },
      }).outputText,
    );
  }
});
afterAll(async () => {
  if (directory) await rm(directory, { recursive: true, force: true });
});

/** Execute the actual argument/format/exit adapter with a controlled stdout TTY. */
function cli(args: string[], tty = false, env: NodeJS.ProcessEnv = {}) {
  const script = `Object.defineProperty(process.stdout,'isTTY',{value:${tty}});process.argv=[process.execPath,'scanner',...${JSON.stringify(args)}];await import(${JSON.stringify(pathToFileURL(join(directory, 'cli.js')).href)});`;
  return spawnSync(process.execPath, ['--input-type=module', '-e', script], {
    encoding: 'utf8',
    env: { ...process.env, ...env },
    maxBuffer: 8 * 1024 * 1024,
  });
}

it('groups actual evidence, risks, diagnostics, categories, rules and severity without mutating the report', () => {
  const before = structuredClone(report);
  const text = summary(report, { durationMs: 1250 });
  expect(text).toMatch(/Evidence\s+440/);
  expect(text).toMatch(/Findings\s+42/);
  expect(text).toMatch(/Diagnostics\s+9/);
  expect(text).toMatch(/Non-blocking\s+9/);
  expect(text).toMatch(/MANUAL_REVIEW\s+36/);
  expect(text).toMatch(/AUTO_CANDIDATE\s+0/);
  expect(text).toMatch(/Major\s+1/);
  expect(text).toMatch(/Minor\s+38/);
  for (const rule of new Set(report.findings.map((f) => f.ruleId))) {
    const line = text
      .split('\n')
      .find((line) => line.trimStart().startsWith(rule + ' '));
    expect(Number(line?.trim().split(/\s+/).at(-1))).toBe(
      report.findings.filter((f) => f.ruleId === rule).length,
    );
  }
  expect(text).toContain('1.250 s');
  expect(text).toContain('not proof of runtime bugs');
  expect(text).toContain('--format json');
  expect(text).toContain('--format markdown');
  expect(text.split('\n').length).toBeLessThan(85);
  expect(report).toEqual(before);
});

it('renders empty results with explicit zeroes and omits unmeasured/invalid duration', () => {
  for (const durationMs of [undefined, -1, NaN, Infinity]) {
    const text = summary(empty(), { durationMs });
    expect(text).toMatch(/Findings\s+0/);
    expect(text).toMatch(/Diagnostics\s+0/);
    expect(text).toContain('No findings.');
    expect(text).toContain('COMPLETE');
    expect(text).not.toContain('Scan duration');
  }
});

it('distinguishes blocking, nonblocking and unclassified diagnostics and respects report completeness', () => {
  const r = empty();
  r.complete = false;
  r.diagnostics = [true, false, undefined].map((blocking) => ({
    path: 'fixture.css',
    code: 'FIXTURE',
    message: 'Coverage uncertainty',
    range,
    blocking,
  }));
  const text = summary(r);
  expect(text).toMatch(/Diagnostics\s+3/);
  expect(text).toMatch(/  Blocking\s+1/);
  expect(text).toMatch(/Non-blocking\s+1/);
  expect(text).toMatch(/Unclassified\s+1/);
  expect(text).toContain('INCOMPLETE');
  expect(text).toContain('does not certify a bug-free UI');
});

it('supports color only on capable terminals, honoring NO_COLOR, TERM and FORCE_COLOR=0', () => {
  expect(supportsSummaryColor(true, { TERM: 'xterm-256color' })).toBe(true);
  for (const env of [
    { NO_COLOR: '' },
    { NO_COLOR: '1', FORCE_COLOR: '1' },
    { TERM: 'dumb' },
    { FORCE_COLOR: '0' },
  ]) {
    expect(supportsSummaryColor(true, env)).toBe(false);
  }
  expect(supportsSummaryColor(false, { FORCE_COLOR: '1' })).toBe(false);
  expect(summary(empty(), { color: true })).toContain('\u001b[');
  expect(summary(empty())).not.toContain('\u001b[');
});

it('preserves exact JSON and Markdown bytes and JSON default for redirected and terminal stdout', () => {
  for (const tty of [true, false]) {
    for (const [args, expected] of [
      [[], json(report)],
      [['--format', 'json'], json(report)],
      [['--format', 'markdown'], markdown(report)],
    ] as const) {
      const result = cli([...args], tty, {
        FORCE_COLOR: '1',
        NO_COLOR: undefined,
      });
      expect(result.status).toBe(0);
      expect(result.stderr).toBe('');
      expect(result.stdout).toBe(expected);
    }
  }
}, 15000);

it('keeps redirected summaries plain even with forced color and decorates an eligible terminal', () => {
  const redirected = cli(['--format', 'summary'], false, {
    FORCE_COLOR: '1',
    NO_COLOR: undefined,
  });
  expect(redirected.status).toBe(0);
  expect(redirected.stdout).not.toContain('\u001b[');
  expect(redirected.stdout).toMatch(/Scan duration\s+\d+\.\d{3} s/);
  const terminal = cli(['--format', 'summary'], true, {
    NO_COLOR: undefined,
    FORCE_COLOR: '1',
    TERM: 'xterm',
  });
  expect(terminal.stdout).toContain('\u001b[');
  expect(
    cli(['--format', 'summary'], true, { NO_COLOR: '1' }).stdout,
  ).not.toContain('\u001b[');
});

it('preserves CLI findings gate, invalid-argument behavior and all exit-code cases', () => {
  for (const format of ['summary', 'json', 'markdown']) {
    expect(cli(['--format', format, '--fail-on-findings']).status).toBe(1);
  }
  expect(cli(['--format', 'unsupported']).status).toBe(2);
  expect(cli(['--format']).status).toBe(2);
  // --silent is an npm option, not a new scanner flag. Preserve its old rejection.
  expect(cli(['--silent']).status).toBe(2);
  for (const format of ['summary', 'json', 'markdown']) {
    const r = empty();
    r.complete = false;
    expect(
      format === 'summary'
        ? summary(r)
        : format === 'json'
          ? json(r)
          : markdown(r),
    ).toBeTruthy();
    expect(exitCode(r.complete, 0, false)).toBe(2);
    expect(exitCode(r.complete, 5, true)).toBe(2);
  }
  expect(exitCode(true, 0, true)).toBe(0);
  expect(exitCode(true, 3, false)).toBe(0);
  expect(exitCode(true, 3, true)).toBe(1);
});

it('returns exit 2 for an actual incomplete source scan in every format, even with the findings gate', () => {
  for (const format of ['summary', 'json', 'markdown']) {
    for (const gate of [[], ['--fail-on-findings']]) {
      const result = cli([
        '--root',
        join(directory, 'incomplete'),
        '--format',
        format,
        ...gate,
      ]);
      expect(result.status).toBe(2);
      expect(result.stderr).toBe('');
      if (format === 'summary') expect(result.stdout).toContain('INCOMPLETE');
      if (format === 'json')
        expect(JSON.parse(result.stdout).complete).toBe(false);
    }
  }
});

it('counts nonzero automatic candidates and caps rule rows without hiding total findings', () => {
  const r = empty();
  r.findings = Array.from({ length: 21 }, (_, i) => ({
    ...report.findings[0],
    category: 'AUTO_CANDIDATE',
    severity: 'Critical',
    ruleId: `RULE.${String(i).padStart(2, '0')}`,
  }));
  const text = summary(r);
  expect(text).toMatch(/Findings\s+21/);
  expect(text).toMatch(/AUTO_CANDIDATE\s+21/);
  expect(text).toMatch(/Critical\s+21/);
  expect(text).toContain('1 additional rules: see the detailed report.');
  expect(text).not.toContain('RULE.20');
});
