# Terminal summary

Use the summary to understand the scan before inspecting individual findings:

```sh
npm run rtl:scan:build
npm run rtl:scan -- --format summary
```

The summary reads the existing Report. It does not run additional detection,
modify policy, approve fixes, or reinterpret completeness. Findings are static
risks or reviewed classifications, not confirmed runtime bugs. COMPLETE means
no blocking uncertainty was reported; it does not certify full RTL support.

The overview includes evidence/finding/diagnostic counts, explicit blocking and
nonblocking counts, automatic candidates, classification/category counts, severity,
per-rule counts, and monotonic elapsed scan time. Unclassified diagnostics are
shown separately if present. Rule rows are capped at 20 with a detailed-report
pointer; totals always cover all findings. Duration measures `scan()` only and
is not inserted into the structured report.

## Compatibility

JSON remains the default in terminals, CI, and redirected output because existing
consumers may parse it. Select summary explicitly. JSON and Markdown serializers,
report schema, and exit-code calculation are unchanged. No terminal headings,
colors, timing data, or extra logs are added to those formats.

```sh
npm run --silent rtl:scan -- --format json > rtl-report.json
npm run --silent rtl:scan -- --format markdown > rtl-report.md
npm run --silent rtl:scan -- --format summary > rtl-summary.txt
```

`--silent` is an npm option; it suppresses npm's command banner, not scanner output
or errors. The scanner did not previously support its own `--silent` flag; passing
it after npm's `--` still fails with exit 2. No new silent mode is introduced.

Colors are enabled only for a TTY whose TERM is not `dumb`, without NO_COLOR and
without FORCE_COLOR=0. NO_COLOR takes precedence over FORCE_COLOR. Redirected
summaries are always plain text, even with FORCE_COLOR=1. There is no dependency
added for decoration or formatting.

Exit codes remain 0 for a complete scan, 1 for actionable findings only when
`--fail-on-findings` is supplied, and 2 for incomplete scans or CLI errors.
Classification does not change because the display format changes.

## Verification

```sh
npm run rtl:scan:test
npm run lint
npm run typecheck
npm run rtl:scan:typecheck
npm run rtl:scan:build
npm run build
node scripts/verify-rtl-protections.mjs
git diff --check
```

Tests compile the actual scanner CLI into a disposable directory. They check
counts/grouping, empty and incomplete reports, unknown diagnostic classification,
color policy, simulated TTY versus pipe stdout, exact JSON/Markdown bytes,
JSON defaults, invalid flags, findings gating, and actual incomplete-source exit
codes in every format. Only temporary synthetic fixtures are created.
