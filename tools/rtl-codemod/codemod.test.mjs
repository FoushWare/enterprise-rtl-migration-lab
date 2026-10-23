import { it, expect, afterEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { prepare, apply, rollback } from './codemod.mjs';

const roots = [];
const hash = (text) => createHash('sha256').update(text).digest('hex');
afterEach(async () => {
  vi.restoreAllMocks();
  for (const root of roots.splice(0))
    await fs.rm(root, { recursive: true, force: true });
});
async function fixture(
  css = '.sample { margin-left: 8px; padding-right: 4px; }',
  overrides = {},
) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'atlas-codemod-'));
  roots.push(directory);
  const root = path.join(directory, 'repo');
  const file = 'apps/x/src/style.css';
  await fs.mkdir(path.join(root, 'apps/x/src'), { recursive: true });
  await fs.mkdir(path.join(root, 'libs'));
  await fs.writeFile(
    path.join(root, 'apps/x/project.json'),
    '{"sourceRoot":"apps/x/src"}',
  );
  await fs.writeFile(
    path.join(root, 'apps/x/index.html'),
    '<html dir="ltr"></html>',
  );
  await fs.writeFile(path.join(root, file), css);
  const approval = (property, value, logicalProperty) => ({
    path: file,
    context: 'stylesheet/.sample',
    property,
    value,
    owner: 'custom-css',
    logicalProperty,
    reason: 'Synthetic fixture reading-flow intent',
    reviewedBy: 'fixture only',
    sourceDigest: hash(css),
  });
  const policy = {
    schemaVersion: 1,
    ownership: { css: 'custom-css' },
    approvals: [
      approval('margin-left', '8px', 'margin-inline-start'),
      approval('padding-right', '4px', 'padding-inline-end'),
    ],
    exceptions: [],
    issueBindings: [],
    dynamicExceptions: [],
    roles: [],
    ownerOverrides: [],
    generatedStyleOwner: 'mui-generated',
    ...overrides,
  };
  await fs.writeFile(
    path.join(root, 'rtl-scanner.config.json'),
    JSON.stringify(policy, null, 2) + '\n',
  );
  execFileSync('git', ['init', '-q'], { cwd: root });
  execFileSync('git', ['config', 'user.name', 'Synthetic fixture'], {
    cwd: root,
  });
  execFileSync('git', ['config', 'user.email', 'fixture@example.invalid'], {
    cwd: root,
  });
  execFileSync(
    'git',
    ['add', '--', 'apps', 'libs', 'rtl-scanner.config.json'],
    { cwd: root },
  );
  execFileSync('git', ['commit', '-qm', 'Synthetic source approvals'], {
    cwd: root,
  });
  const initial = await prepare(root);
  return {
    root,
    file,
    css,
    policy,
    ids: initial.eligibleIds,
    journal: path.join(directory, 'journal.json'),
  };
}
async function content(f) {
  return fs.readFile(path.join(f.root, f.file), 'utf8');
}

it('dry-run is deterministic and makes no file changes without an explicit selection', async () => {
  const f = await fixture();
  const a = await prepare(f.root),
    b = await prepare(f.root);
  expect(a).toEqual(b);
  expect(a.eligibleIds).toHaveLength(2);
  expect(a.files).toEqual([]);
  expect(await content(f)).toBe(f.css);
  expect(
    execFileSync('git', ['status', '--porcelain'], {
      cwd: f.root,
      encoding: 'utf8',
    }),
  ).toBe('');
});
it('applies exact logical property names and consumes only the selected existing approvals', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  expect(plan.files.map((f) => f.path)).toEqual([
    f.file,
    'rtl-scanner.config.json',
  ]);
  await apply(f.root, plan, f.journal);
  expect(await content(f)).toBe(
    '.sample { margin-inline-start: 8px; padding-inline-end: 4px; }',
  );
  const after = JSON.parse(
    await fs.readFile(path.join(f.root, 'rtl-scanner.config.json'), 'utf8'),
  );
  expect(after).toEqual({ ...f.policy, approvals: [] });
  const second = await prepare(f.root);
  expect(second.eligibleIds).toEqual([]);
  expect(second.files).toEqual([]);
});
it('rollback restores exact source and policy bytes and is idempotent', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await apply(f.root, plan, f.journal);
  expect((await rollback(f.root, f.journal)).restored).toHaveLength(2);
  expect(await content(f)).toBe(f.css);
  expect(
    JSON.parse(
      await fs.readFile(path.join(f.root, 'rtl-scanner.config.json'), 'utf8'),
    ),
  ).toEqual(f.policy);
  expect((await rollback(f.root, f.journal)).restored).toEqual([]);
});
it('rejects partial file selection which would stale another source-pinned approval', async () => {
  const f = await fixture();
  await expect(prepare(f.root, [f.ids[0]])).rejects.toThrow(
    'unconsumed approval',
  );
  expect(await content(f)).toBe(f.css);
});
it('rejects dirty worktrees before apply', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await fs.writeFile(path.join(f.root, f.file), f.css + '\n');
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow(
    'clean committed',
  );
});
it('rejects unknown plan fields without weakening the exact comparator', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await expect(
    apply(f.root, { ...plan, unsafe: true }, f.journal),
  ).rejects.toThrow('shape');
  expect(await content(f)).toBe(f.css);
});
it('rejects edited source/policy digests', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  plan.files[0].after += 'unsafe';
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow('digests');
});
it('rejects stale commit preconditions', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  execFileSync('git', ['commit', '--allow-empty', '-qm', 'New checkpoint'], {
    cwd: f.root,
  });
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow('preconditions');
});
it('rejects symlink replacement and preserves the external file', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids),
    external = path.join(path.dirname(f.journal), 'external.css');
  await fs.writeFile(external, f.css);
  await fs.rm(path.join(f.root, f.file));
  await fs.symlink(external, path.join(f.root, f.file));
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow();
  expect(await fs.readFile(external, 'utf8')).toBe(f.css);
});
it('rejects logical-property collisions despite an otherwise valid scanner approval', async () => {
  const f = await fixture(
    '.sample { margin-left: 8px; padding-right: 4px; margin-inline-start: 1px; }',
  );
  await expect(prepare(f.root, f.ids)).rejects.toThrow('cascade overlap');
});
it('rejects shorthand interactions', async () => {
  const f = await fixture(
    '.sample { margin-left: 8px; padding-right: 4px; margin: 0; }',
  );
  await expect(prepare(f.root, f.ids)).rejects.toThrow('cascade overlap');
});
it('rejects a file containing a direction island even outside the approved selector', async () => {
  const f = await fixture(
    '.sample { margin-left: 8px; padding-right: 4px; } .brand { direction: ltr; }',
  );
  await expect(prepare(f.root, f.ids)).rejects.toThrow('Direction islands');
});
it('does not invent approvals for physical declarations', async () => {
  const f = await fixture(undefined, { approvals: [] });
  const plan = await prepare(f.root);
  expect(plan.eligibleIds).toEqual([]);
  await expect(
    prepare(f.root, ['RTL.CSS.PHYSICAL:' + 'a'.repeat(24)]),
  ).rejects.toThrow('not an approved');
});
it('rejects duplicate selection IDs', async () => {
  const f = await fixture();
  await expect(prepare(f.root, [f.ids[0], f.ids[0]])).rejects.toThrow(
    'Unique explicit',
  );
});
it('rejects journals within the source checkout', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await expect(
    apply(f.root, plan, path.join(f.root, 'journal.json')),
  ).rejects.toThrow('outside');
  expect(await content(f)).toBe(f.css);
});
it('does not overwrite an existing external journal', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await fs.writeFile(f.journal, 'user evidence');
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow();
  expect(await fs.readFile(f.journal, 'utf8')).toBe('user evidence');
  expect(await content(f)).toBe(f.css);
});
it('rollback refuses concurrent edits and preserves unrelated user work', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await apply(f.root, plan, f.journal);
  await fs.writeFile(path.join(f.root, f.file), 'user edits');
  await fs.writeFile(path.join(f.root, 'notes.txt'), 'unrelated user work');
  await expect(rollback(f.root, f.journal)).rejects.toThrow(
    'preserve user edits',
  );
  expect(await content(f)).toBe('user edits');
  expect(await fs.readFile(path.join(f.root, 'notes.txt'), 'utf8')).toBe(
    'unrelated user work',
  );
});
it('rollback recovers a simulated interruption after only one file was replaced', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids);
  await fs.writeFile(
    f.journal,
    JSON.stringify({ schemaVersion: 1, kind: 'rtl-codemod-journal', plan }),
  );
  await fs.writeFile(path.join(f.root, f.file), plan.files[0].after);
  expect((await rollback(f.root, f.journal)).restored).toEqual([f.file]);
  expect(await content(f)).toBe(f.css);
});
it('recovers an injected second rename failure without partial source/policy mutation', async () => {
  const f = await fixture(),
    plan = await prepare(f.root, f.ids),
    real = fs.rename.bind(fs);
  let calls = 0;
  vi.spyOn(fs, 'rename').mockImplementation(async (...args) => {
    if (++calls === 2) throw new Error('Injected I/O failure');
    return real(...args);
  });
  await expect(apply(f.root, plan, f.journal)).rejects.toThrow(
    'Injected I/O failure',
  );
  expect(await content(f)).toBe(f.css);
  expect(
    JSON.parse(
      await fs.readFile(path.join(f.root, 'rtl-scanner.config.json'), 'utf8'),
    ),
  ).toEqual(f.policy);
});
it('rejects malformed rollback journals', async () => {
  const f = await fixture();
  await fs.writeFile(f.journal, '{"schemaVersion":99}');
  await expect(rollback(f.root, f.journal)).rejects.toThrow('Invalid rollback');
});
it('CLI dry-run exits zero with no approvals and unknown options exit two', async () => {
  const f = await fixture(undefined, { approvals: [] });
  const cli = path.resolve('tools/rtl-codemod/cli.mjs');
  const result = JSON.parse(
    execFileSync(process.execPath, [cli, '--root', f.root, '--dry-run'], {
      encoding: 'utf8',
    }),
  );
  expect(result.files).toEqual([]);
  try {
    execFileSync(process.execPath, [cli, '--root', f.root, '--unsafe'], {
      stdio: 'pipe',
    });
    throw new Error('Expected exit 2');
  } catch (error) {
    expect(error.status).toBe(2);
  }
});
it('CLI rejects conflicting operations instead of letting apply override dry-run', async () => {
  const f = await fixture(),
    cli = path.resolve('tools/rtl-codemod/cli.mjs');
  try {
    execFileSync(
      process.execPath,
      [
        cli,
        '--root',
        f.root,
        '--dry-run',
        '--apply',
        'unused.json',
        '--journal',
        f.journal,
      ],
      { stdio: 'pipe' },
    );
    throw new Error('Expected exit 2');
  } catch (error) {
    expect(error.status).toBe(2);
  }
  expect(await content(f)).toBe(f.css);
});
it('preserves Unicode comments and exact value/whitespace bytes', async () => {
  const f = await fixture(
    '/* العربية 💻 */\n.sample { margin-left: 8px; padding-right: 4px; }',
  );
  const plan = await prepare(f.root, f.ids);
  await apply(f.root, plan, f.journal);
  expect(await content(f)).toBe(
    '/* العربية 💻 */\n.sample { margin-inline-start: 8px; padding-inline-end: 4px; }',
  );
});
it('incomplete parser coverage blocks dry-run planning', async () => {
  const f = await fixture(undefined, { approvals: [] });
  await fs.writeFile(path.join(f.root, f.file), '.sample { margin-left:');
  await expect(prepare(f.root)).rejects.toThrow('incomplete');
});
