/**
 * CLI adapter: parse supported flags, await a scan, serialize its report, and choose
 * the exit status. Findings gating is opt-in; incomplete coverage always exits 2.
 */
import { exitCode } from './coverage.js';
import { scan } from './scan.js';
import { json, markdown } from './report.js';
import { summary, supportsSummaryColor } from './summary.js';
let root = process.cwd();
let format = 'json';
let gate = false;
try {
  const args = process.argv.slice(2).filter((a) => {
    if (a === '--fail-on-findings') {
      gate = true;
      return false;
    }
    return true;
  });
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i],
      value = args[i + 1];
    if (!value || value.startsWith('--'))
      throw new Error('Missing option value');
    if (key === '--root') root = value;
    else if (
      key === '--format' &&
      ['json', 'markdown', 'summary'].includes(value)
    )
      format = value;
    else throw new Error('Unknown option or format');
  }
  const started = performance.now();
  const r = await scan(root);
  const durationMs = performance.now() - started;
  // Preserve the JSON default for both terminals and pipes: existing consumers
  // may parse stdout. Only the explicit summary format receives decoration/time.
  process.stdout.write(
    format === 'summary'
      ? summary(r, {
          durationMs,
          color: supportsSummaryColor(
            Boolean(process.stdout.isTTY),
            process.env,
          ),
        })
      : format === 'markdown'
        ? markdown(r)
        : json(r),
  );
  process.exitCode = exitCode(
    r.complete,
    r.findings.filter(
      (f) => !['INFORMATIONAL', 'INTENTIONAL_LTR'].includes(f.category),
    ).length,
    gate,
  );
} catch (e) {
  console.error(e instanceof Error ? e.message : 'Scan failed');
  process.exitCode = 2;
}
