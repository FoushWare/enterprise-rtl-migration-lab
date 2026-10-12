# Enterprise RTL Scanner — Conservative Detection

For **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Foundation was committed separately at `406b7cd`; Stage 3 adds risk detection, not remediation. No fixes, codemods, RTL plugins, runtime changes or dashboard exist.

```sh
npm run rtl:scan:typecheck
npm run rtl:scan:test
npm run rtl:scan:build
node dist/tools/rtl-scanner/cli.js --format json > /tmp/atlas-rtl.json
node dist/tools/rtl-scanner/cli.js --format markdown > /tmp/atlas-rtl.md
```

Build writes ignored `dist/tools/rtl-scanner`. Direct scanning is separate, uses only reads, and writes solely to stdout. `npm run rtl:scan -- --format json` also works but npm prints a script banner; use direct node for machine-readable stdout. Options: `--root repository`, `--format json|markdown`, optional `--fail-on-findings`.

Exit codes:

- **0:** applicable supported analysis completed; risk entries do not fail scans by default. Documented nonblocking dynamic diagnostics remain in the report.
- **1:** completed scan with actionable entries when the explicit `--fail-on-findings` gate is selected. INFORMATIONAL and INTENTIONAL_LTR entries do not count toward this gate.
- **2:** blocking directional uncertainty, parser/source coverage failure, input/configuration errors detected by the loader or internal error. Coverage failures take precedence over a findings gate. Partial JSON/Markdown is emitted for diagnosed incomplete scans; malformed root/configuration errors use stderr.

The actual Atlas scan currently completes with nine visible nonblocking diagnostics. A dynamic color does not block directional rules. Unknown left/right values, spreads, interpolated templates, dynamic runtime direction, unknown directional sx objects and parse failures remain blocking. The `k.icon` owner is unresolved but its full sx object is a literal non-directional fontSize. Three background exceptions in the data-only policy are tied to both expression and source-file SHA-256 fingerprints; changed source invalidates them.

Discovery reads flat Nx `apps/*/project.json` and `libs/*/project.json`, their source roots and application index HTML. It does not execute Nx/configuration/application modules, traverse symlinks, create caches or use network/subprocesses. Stories, dependencies and generated outputs are excluded. Skipped unsupported styling sources produce explicit coverage diagnostics.

Adapters preserve repository-relative paths, exact original snippets and one-based UTF-16 lines/columns with zero-based half-open offsets. PostCSS supplies declaration/selector/media context; tokens preserve functions/shorthands. TypeScript recognizes imported Emotion templates, MUI sx/aliases/responsive objects and arrays, theme overrides, inline styles and bounded local const objects. MUI sx spacing uses theme semantics; theme styleOverrides use raw Emotion CSS, while inline styles use React CSS semantics. HTML attributes describe initial markup, not client direction.

Report **schema v2** retains the foundation's 419 style facts separately from findings, adding policy digest, metrics, coverage impact/blocking status and stable rule-based finding IDs. Every finding has severity, confidence, source/range/original/mechanism, rationale, treatment, owner, related evidence/locations, limitations and reference-case IDs where a reviewed binding supports them. JSON and Markdown derive from one model and omit timestamps/absolute checkout paths. Semantic AST IDs omit trivia; declaration IDs use path/context/property/value rather than source lines. Changes to declarations/structural anchors or indistinguishable duplicates can change IDs.

Rules cover physical edges/spacing/borders/corners, asymmetric or unresolved shorthands, positioned/coupled shell geometry, transforms/order, runtime document/theme/cache correlation, icons/glyphs, separate SVG/flex-label flow, mixed-content sinks, reviewed brand roles and table/form policies. Static chart/collision hints do not prove actual rendered errors. Growth/external-link/close icons, symmetric spacing, vertical spacing, full-grid-span rules and explicit isolation are negative cases.

`rtl-scanner.config.json` is data-only:

- mechanism ownership distinguishes custom CSS/inline, unresolved custom Emotion/sx handling and generated MUI styles;
- exact semantic approvals require owner, source fingerprint, declaration identity, reason, reviewer and conditional logical equivalent; MUI sx remains manual because alias/unit processing of logical equivalents has not been verified;
- **Atlas approvals are empty**, so no AUTO_CANDIDATE entries are authorized;
- exact-original exceptions preserve approved default English roots without suppressing runtime mismatch findings;
- reviewed role metadata identifies brand composition, and reference bindings connect evidence to Phase 2A cases. These links are not automatic visual diagnoses;
- conflicting overrides are manual review, and unknown owners cannot qualify for automation.

Coverage remains deliberately bounded: no complete type/import/route graph, computed cascade, generated vendor CSS evaluation, full CSS value grammar, native date/caret inspection or font-dependent collision proof. Re-exported providers, namespaces, unknown wrappers, escaped templates and interpolation can remain unsupported. Cache absence is explicitly scoped to analyzed imports/providers; global document RTL correctly reaches ordinary body-mounted portals, so no portal failure is invented. Custom-property values are not resolved across the cascade, and dynamic background positioning stays incomplete unless a source-pinned review exception establishes its non-directional role.

See [actual findings](../../docs/phase-3-rtl-findings.md) and [detection review/matrix](../../docs/phase-3-detection-review.md). The nine reference cases have static risk evidence, not nine independently proved visual failures. Stop after Stage 3; human approval is required before Stage 4 integration or any transformation/runtime remediation.

Application attribution is source-path based for app files. Shared findings carry an empty application list to indicate unresolved reachability, not an unaffected library; the reviewed reference-case matrix supplies known application context. Runtime cache presence with unresolved cache/plugin configuration remains blocking, rather than being accepted as proof of RTL support.

## Stage 3 closure qualifications

The [final adjudication](../../docs/phase-3-stage-3-final-adjudication.md) records all 46 candidates outside the nine positive calibration cases: 28 valid review risks, 18 requiring further evidence and zero established false positives. These are not 46 confirmed visual defects, a measured false-positive rate or evidence of perfect precision. The nine-family reference matrix is not a benchmark; repeated links to a shared theme finding do not create independent root causes. Phase 2A visual severities and scanner static priorities describe different evidence.

Stage 4B now validates schema-v1 JSON at runtime, rejects unknown fields/types/enums/paths/digests/duplicates/conflicts and audits source applicability. TypeScript interfaces alone still do not validate JSON. Stale approvals, overrides and directional exceptions block; stale informational associations warn. Whole-file SHA-256 pins still invalidate after unrelated edits; exact matching is not general-purpose suppression. Semantic approval, complete cascade/runtime ownership evidence and separate transformation authorization remain prerequisites before automation. No CI gate is enabled.

Shared `applications: []` means scanner reachability unresolved, not zero consumers. The final adjudication preserves reviewer-observed cross-app and application-specific consumer associations separately from scanner-computed reachability; there is no complete import/provider/selector graph. All nine coverage diagnostics and 18 unresolved candidates remain visible. Three proposed CSS spacing pilots remain unapproved and unchanged; AUTO_CANDIDATE stays zero. See the [closure audit](../../docs/phase-3-stage-3-closure.md) for final verification and commit scope. Stage 4A planning is committed; Stage 4B safeguards await review.

## Stage 4B policy safeguards

No new dependencies. `policy-validation.ts` uses an explicit closed shape/enum validator and the existing TypeScript JSON AST for duplicate members and exact UTF-16 source spans. Invalid/unsupported/conflicting policy input throws a source-located PolicyError before applying records: CLI stderr and exit 2. Missing config retains the empty-policy behavior; an existing symlink or malformed JSON config does not silently fall back.

`policy-audit.ts` checks records against unexcepted source findings/evidence. Stale approvals, owner overrides, intentional/directional exceptions and dynamic-background pins are blocking. Stale reference bindings, brand role associations and metadata-only INFORMATIONAL exceptions warn. INFORMATIONAL category on a directional rule is still a directional suppression and blocks when stale; it is not downgraded merely by the label. Blocking policy uncertainty disables all effect-bearing approval/exception/override records in the partial report, preserving source risks and coverage diagnostics. The supported dynamic exception property remains background only. Approval applicability reuses the unchanged detection safeguards and rejects conflicting exception records. Policies never write source or refresh pins.

Schema v2 is unchanged: policy diagnostics use existing path/range/code/message/blocking/rationale fields. Policy status/severity appear in code and message; warning-only policy entries omit the optional source-analysis impact, and Markdown displays POLICY. complete still means no blocking analysis/coverage uncertainty; warnings alone do not make analysis incomplete. Exit 2 wins over optional findings exit 1. Current valid Atlas JSON/Markdown are byte-identical to archived Stage 3 output, including all five exceptions and nine source diagnostics.

Policy schema v1 contains no per-record findingId, expiry or separate ownership-exception type. Unknown fields remain rejected; no new approval mechanism was invented. Supported rule IDs and generated finding-ID shape/rule agreement/uniqueness are validated; applicability uses existing exact anchors/digests. Future external ID binding or expiry needs a separately reviewed contract. The validator cannot prove arbitrary CSS cascade, computed runtime ownership or complete imports/consumer reachability. Existing safe-candidate rule safeguards still apply, and actual semantic approvals stay empty.

See [Stage 4B review](../../docs/phase-4b-policy-validation-review.md). Stage 4B changes remain uncommitted pending review. Stage 4C, CSS migrations, runtime changes, codemods and CI enforcement have not started.
