/**
 * CLI adapter for dry-run planning, explicit apply, and journal rollback. Selecting
 * a mode never bypasses the provenance and source checks implemented by the tool.
 */
import fs from 'node:fs/promises';
import { prepare, apply, rollback } from './codemod.mjs';

try {
  let root = process.cwd(),
    mode = 'dry-run',
    input,
    journal;
  let ids = [];
  let explicitMode = false;
  const seen = new Set();
  function choose(next) {
    if (explicitMode) throw new Error('Specify exactly one operation');
    explicitMode = true;
    mode = next;
  }
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (seen.has(arg)) throw new Error('Duplicate option');
    seen.add(arg);
    if (arg === '--dry-run') choose('dry-run');
    else if (
      ['--root', '--ids', '--apply', '--rollback', '--journal'].includes(arg)
    ) {
      const value = args[++i];
      if (!value || value.startsWith('--'))
        throw new Error('Missing option value');
      if (arg === '--root') root = value;
      else if (arg === '--ids') ids = value.split(',');
      else if (arg === '--journal') journal = value;
      else {
        choose(arg.slice(2));
        input = value;
      }
    } else
      throw new Error(
        'Unknown option; use --dry-run, --root, --ids, --apply, --journal or --rollback',
      );
  }
  if (mode !== 'dry-run' && ids.length)
    throw new Error('--ids applies only to dry-run planning');
  if (mode !== 'apply' && journal)
    throw new Error('--journal applies only to apply');
  let result;
  if (mode === 'dry-run') result = await prepare(root, ids);
  else if (mode === 'apply') {
    if (!journal)
      throw new Error('--apply requires an external --journal path');
    result = await apply(
      root,
      JSON.parse(await fs.readFile(input, 'utf8')),
      journal,
    );
  } else result = await rollback(root, input);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Codemod failed');
  process.exitCode = 2;
}
