import type { Report } from './model.js';

export interface SummaryOptions {
  /** Monotonic elapsed time for the scan only; omit when it was not measured. */
  durationMs?: number;
  color?: boolean;
}

/** Enable decoration only for a capable terminal, never for redirected output. */
export function supportsSummaryColor(
  isTTY: boolean,
  env: Record<string, string | undefined>,
): boolean {
  return (
    isTTY &&
    env.NO_COLOR === undefined &&
    env.TERM !== 'dumb' &&
    env.FORCE_COLOR !== '0'
  );
}

/**
 * Present existing report data without changing detection, policy, or completeness.
 * Findings describe static risks/review decisions, not confirmed runtime defects.
 * @param report - The completed scanner report, also used by JSON and Markdown.
 * @param options - Optional measured duration and terminal-only decoration.
 * @returns A concise overview with a trailing newline and detailed-report commands.
 */
export function summary(report: Report, options: SummaryOptions = {}): string {
  const heading = (text: string) =>
    options.color ? `\u001b[1;36m${text}\u001b[0m` : text;
  const row = (label: string, count: number | string) =>
    `  ${label.padEnd(29)} ${String(count).padStart(6)}`;
  const grouped = (key: 'category' | 'ruleId' | 'severity') => {
    const counts = new Map<string, number>();
    for (const finding of report.findings)
      counts.set(finding[key], (counts.get(finding[key]) ?? 0) + 1);
    return counts;
  };
  const categories = grouped('category');
  const severities = grouped('severity');
  const blocking = report.diagnostics.filter((d) => d.blocking === true).length;
  const nonblocking = report.diagnostics.filter(
    (d) => d.blocking === false,
  ).length;
  const unclassified = report.diagnostics.length - blocking - nonblocking;
  const lines = [
    heading('RTL Scanner | Static risk overview'),
    '--------------------------------------------------',
    row('Evidence', report.evidence.length),
    row('Findings', report.findings.length),
    row('Diagnostics', report.diagnostics.length),
    row('  Blocking', blocking),
    row('  Non-blocking', nonblocking),
    ...(unclassified ? [row('  Unclassified', unclassified)] : []),
    row('AUTO_CANDIDATE', categories.get('AUTO_CANDIDATE') ?? 0),
    row('Scan completeness', report.complete ? 'COMPLETE' : 'INCOMPLETE'),
  ];
  if (
    options.durationMs !== undefined &&
    Number.isFinite(options.durationMs) &&
    options.durationMs >= 0
  ) {
    lines.push(
      row('Scan duration', `${(options.durationMs / 1000).toFixed(3)} s`),
    );
  }
  lines.push('', heading('Classification / category'));
  for (const category of [
    'AUTO_CANDIDATE',
    'MANUAL_REVIEW',
    'RUNTIME_CONFIG',
    'INTENTIONAL_LTR',
    'INFORMATIONAL',
  ]) {
    lines.push(row(category, categories.get(category) ?? 0));
  }
  lines.push('', heading('Severity'));
  for (const severity of ['Critical', 'Major', 'Minor', 'Info'])
    lines.push(row(severity, severities.get(severity) ?? 0));
  lines.push('', heading('Rules'));
  const rules = [...grouped('ruleId')].sort(([a], [b]) =>
    a < b ? -1 : a > b ? 1 : 0,
  );
  for (const [rule, count] of rules.slice(0, 20)) lines.push(row(rule, count));
  if (!rules.length) lines.push('  No findings.');
  if (rules.length > 20)
    lines.push(
      `  ${rules.length - 20} additional rules: see the detailed report.`,
    );
  lines.push(
    '',
    heading('How to read this'),
    '  Evidence: source facts extracted for analysis.',
    '  Findings: potential risks or reviewed classifications;',
    '    they are not proof of runtime bugs or permission to auto-fix.',
    '  Diagnostics: analysis uncertainty or coverage/policy issues.',
    '  Completeness: the scanner reports no blocking uncertainty;',
    '    COMPLETE does not certify a bug-free UI or full RTL support.',
    '',
    'Detailed reports (same --root and gating options also apply):',
    '  npm run --silent rtl:scan -- --format json > rtl-report.json',
    '  npm run --silent rtl:scan -- --format markdown > rtl-report.md',
  );
  return lines.join('\n') + '\n';
}
