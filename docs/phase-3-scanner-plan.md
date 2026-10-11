# Migrating Enterprise React Apps to RTL Without Breaking LTR

## Phase 3: Enterprise RTL Migration Scanner — architecture proposal

Planning only. Base checkpoint: `61491d7f6dd359033c4a9e80b556d3b3e2446305`. The working tree was clean before creating `feat/phase-3-rtl-scanner` directly from that checkpoint. This document is the only proposed file addition. No dependencies, scanner code, runtime settings, styling, translations or baselines are changed. No push or commit is part of this request.

Primary evidence: [readiness audit](rtl-readiness-audit.md), [observed issues](phase-2a-observed-issues.md), and [final review](phase-2a-final-review.md). The first audit describes Phase 1; its historical line numbers and root-direction claims must not override current Phase 2A source. Current source locations below were checked against the approved checkpoint. Nine visual issues are confirmed by Phase 2A evidence; scanner detections will be risk findings, not fresh proof of rendered failures.

## 1. Source inventory and scope

Nx has two applications (`invoicing`, `procurement`) and two source-consumed libraries (`design-system`, `shared`). Each has a `project.json`; root `tsconfig.json` resolves `@atlas/design-system` and `@atlas/shared` aliases. Shared UI imports its stylesheet and is consumed by both applications. Findings at shared definitions should be reported once, with both affected applications attributed through an import graph; availability alone must not imply usage (Modal currently renders only in invoicing).

| Mechanism | Actual evidence | Scanner scope |
| --- | --- | --- |
| Plain CSS | `libs/design-system/src/styles.css:83–84` active-edge border/padding; `:114` shell gutter; `:241` KPI position; `:282–285` chart labels; media/print resets `:502`, `:561` | Parse selectors, declarations, cascade order and enclosing media/print rules. Also scan `libs/shared/src/demo.css` as demo-owned styles, without treating its symmetric spacing as a fault. |
| Emotion template | `libs/design-system/src/index.tsx:213–231` `styled.aside`, fixed `left:0`, right border and negative mobile translation | Resolve imported styled binding, extract literal CSS with exact source mapping; preserve nesting and interpolation uncertainty. |
| MUI `sx` and theme overrides | `libs/design-system/src/index.tsx:150` dialog `right:12`; `:295` arrow `marginLeft`; theme overrides `:53–69`; application `sx` in `InvoiceTable.tsx:29`, `Invoices.tsx:46`, procurement `App.tsx:49` | Recognize MUI bindings/wrappers, objects, aliases, arrays, responsive values and callbacks. Include `createTheme` override objects, not just JSX props. |
| React inline style | `apps/invoicing/src/pages/Invoices.tsx:56` `marginLeft:auto`; `Dashboard.tsx:150`, `:171`, `:177` style objects; `CreateInvoice.tsx:205` flex-end action row | Recognize React CSS objects separately from MUI System semantics; these bypass Emotion. Storybook inline styles in `StatusBadge.stories.tsx:6` belong to story scope. |
| Icons and SVG | `InvoiceTable.tsx:76`, shared `index.tsx:295` ArrowForward; `Dashboard.tsx:197` translated literal arrow; `Dashboard.tsx:87–135` SVG paths, endpoint and separate HTML month strip | Resolve icon imports and rendered usages, literal glyphs in translation keys/values, chart coordinates and CSS/JSX relationships. No icon or SVG mirroring proposals by default. |
| Runtime configuration | `libs/shared/src/i18n.tsx:29–35` opt-in document direction; shared `index.tsx:40` fixed LTR theme and `:73–79` Provider; both `apps/*/index.html:2` initial English roots | Analyze entry points, provider composition, direction assignments and cache configuration. Initial HTML LTR is compatible with the default English mode, not itself a demonstrated bug. |
| Bidi and locale | `CreateInvoice.tsx:227–228` mixed confirmation; `Customers.tsx:32`, `:52` names/address; `libs/shared/src/index.ts:118` en-US formatting | Detect unisolated candidate content sinks and formatting policy, without claiming tokens or storage reverse. |

Default discovery: application/library source `.css`, `.ts`, `.tsx`, `.js`, `.jsx`, both entry HTML files, root tsconfig and package manifest, project metadata; optionally Storybook. Exclude dependencies, `.git`, `.nx`, build outputs, browser/test reports, screenshots, generated gallery, capture outputs and fixture business records as standalone styling inputs. Translation strings may supply glyph evidence, but report the rendering callsite and related dictionary location rather than every repeated key. Tests are scanner fixtures/verification inputs, not production findings. Current source has no observed CSS custom-property declarations/usages, asymmetric corner-radius rules or row-reverse rules; support them through fixtures rather than inventing repository findings.

## 2. Parser choices and limits

Recommend **TypeScript compiler API + PostCSS**, with small adapters feeding a shared evidence model. Pin versions in the lockfile during an approved implementation stage; TypeScript 5.9 is already a direct development dependency. Do not depend on incidental transitive PostCSS availability.

| Input | Proposed parser/library | Trade-off |
| --- | --- | --- |
| TS/TSX and JS/JSX | TypeScript compiler API: parse source files and a no-emit Program, resolve imports/symbol aliases with tsconfig | Fits existing TS project and permits wrapper/import attribution. More verbose than Babel; type resolution costs memory and does not prove runtime values. Avoid emitting, transformations and incremental cache writes. |
| CSS and literal Emotion CSS | PostCSS core; `postcss-value-parser` for token-aware values; optional `postcss-selector-parser` for selectors/nested context | Mature CSS node positions and retained raw syntax. Value parser tokenizes, but does not validate every CSS grammar or prove cascade semantics. Core alone does not understand JavaScript interpolation. |
| HTML root attributes | `parse5` with source location information | Avoid regex-based HTML attribute detection. Only initial document facts, not client lifecycle guarantees. |
| Alternative JS adapter | Babel parser/traverse with TS/JSX plugins, if a future Babel-only syntax requirement appears | Convenient traversal and broad syntax plugins; a second AST and separate symbol-resolution layer add cost. Do not combine two JS parsers without a concrete need. |
| Runtime observations | Existing Playwright evidence, explicitly outside static scan execution | Can establish computed direction/overlap; environment-dependent and must not be silently launched by the scanner. |

Read-only extraction: traverse recognized style sinks, not arbitrary objects with a `left` key. Normalize known MUI aliases (`ml`, `mr`, `pl`, `pr`, `mx`) while retaining original keys and theme-spacing semantics. A numeric React margin is CSS pixels; a numeric MUI margin uses theme spacing, so suggestions must keep the appropriate source representation. Preserve arrays and breakpoints as separate cases. Resolve bounded local immutable references and imported constants through symbols; spreads, computed keys, callbacks and conditional expressions are analyzed structurally without executing them. Unresolved branches produce explicit coverage diagnostics, never fabricated concrete declarations.

For Emotion literal fragments, parse raw source with a synthetic wrapper only when needed and map every offset back to the original template. Interpolations are opaque spans: parse fully independent declarations/fragments, and downgrade interpolation-dependent rules to MANUAL_REVIEW. Never evaluate templates, import application modules, invoke Nx plugins or execute configuration files. Reject unsupported CSS with a parse diagnostic; do not use a forgiving parser to silently lose declarations. Escape sequences require a segment map; if a precise declaration span cannot be recovered, report the enclosing template plus a location-confidence warning and omit transformation suggestions.

Primary library references: [TypeScript compiler API](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API), [PostCSS API](https://postcss.org/api/), [Babel parser](https://babeljs.io/docs/babel-parser), [parse5](https://parse5.js.org/), [PostCSS value parser](https://github.com/TrySound/postcss-value-parser). These inform the proposal; no library was installed for this plan.

## 3. Analysis pipeline and finding contract

1. Read repository-relative configuration/data and enumerate permitted files deterministically. Do not follow symlinks outside the repository; sort normalized POSIX paths and use explicit size limits.
2. Build a source/import inventory and collect style, content, geometry and runtime facts with raw source spans.
3. Normalize facts without rewriting source; attach mechanism, component/selector, conditional context, styling owner and reachability evidence.
4. Apply versioned rules; correlate coupled facts such as sidebar anchor/gutter/transform and SVG/month-strip direction. Associations through literal className are evidence, not a general CSS cascade solver.
5. Merge duplicate observations at definitions, retaining related callsites and reachable applications. Independent root causes remain separate findings linked by group IDs.
6. Apply reviewed exception policy, calculate summaries and serialize reports from one canonical model.

A finding needs: `id`, `ruleId`, `ruleVersion`, category, severity, confidence, title, repository-relative path, source mechanism, exact range, original source, property/value when applicable, selector/component, applications, ownership, evidence/related locations, rationale, recommended treatment, conditional logical suggestion, prerequisites, limitations, exception status and optional Phase 2A issue links.

**Identity:** namespaced rule IDs such as `RTL.CSS.PHYSICAL_SPACING`, `RTL.GEOMETRY.SHELL`, `RTL.RUNTIME.THEME_DIRECTION`. Instance ID = rule ID plus truncated SHA-256 of normalized path, structural anchor (component/selector and enclosing media/AST branch), canonical declaration identity and occurrence discriminator. Exclude line numbers, timestamp and absolute checkout paths. Whitespace/comment-only edits preserve IDs; moving/renaming a selector/file or changing the declaration may intentionally change identity. Identical duplicate declarations use an ordinal within their anchor; inserting an indistinguishable duplicate can change those IDs. Keep a longer full fingerprint to detect collisions and fail rather than merge distinct findings. This is stable enough for review, not a promise of identity across arbitrary refactors.

Locations: one-based line/column, UTF-16 code-unit columns, zero-based UTF-16 offsets, half-open end range; raw source retains CRLF and original spelling. Convert PostCSS/HTML locations using the original buffer and test Unicode/CRLF cases. Use declaration-key-through-value spans, not a nearby JSX line; include related locations for cross-file findings. Missing configuration is anchored to the provider/entry point and labeled an absence inference, not assigned a nonexistent cache line.

Categories are mutually exclusive primary treatments; related treatments can be listed:

| Category | Admission policy |
| --- | --- |
| AUTO_CANDIDATE | Bounded syntax, statically known value, reviewed reading-edge intent, resolved writing-mode/style owner, no geometric/content exception or cascade conflict. It is eligibility after review, never permission to transform. |
| MANUAL_REVIEW | Semantics, position/geometry, unresolved ownership, interpolation, complex cascade or uncertain intent. Default for ambiguous physical properties. |
| RUNTIME_CONFIG | Document/theme/cache/portal/formatting contract. Configuration mismatch can be detected; generated visual consequences require runtime checks. |
| INTENTIONAL_LTR | Explicitly reviewed exception with reason and scope: identifiers, brand or chart policy. Neither Latin text nor an SVG automatically establishes intentional direction. |
| INFORMATIONAL | Symmetric/vertical styles, configured direction facts, support gaps and nonblocking observations. Unsupported analysis is visible, not a clean bill of health. |

Severity: Critical for supported evidence of blocked essential behavior/data interpretation with no usable route; Major for likely substantial obstruction/misleading presentation; Minor for limited affordance/convention risk; Info for observations. Static severity is a review priority, separate from observed Phase 2A severity. Confidence High/Medium/Low describes evidence certainty, not auto-fix safety. High confidence in `right:12` does not prove the desired side.

Example contract (illustrative design, not scanner output):

```json
{
  "id": "RTL.GEOMETRY.ABSOLUTE_EDGE:<fingerprint>",
  "ruleId": "RTL.GEOMETRY.ABSOLUTE_EDGE",
  "ruleVersion": 1,
  "category": "MANUAL_REVIEW",
  "severity": "Major",
  "confidence": "High",
  "path": "libs/design-system/src/index.tsx",
  "range": {"start": {"line": 150, "column": 39}, "end": {"line": 150, "column": 48}},
  "original": "right: 12",
  "sourceType": "mui-sx",
  "component": "Modal",
  "applications": ["invoicing"],
  "ownership": "emotion-custom-unresolved",
  "relatedIssueIds": ["RTL-05"],
  "rationale": "Absolute title-adjacent control needs placement and clearance review.",
  "suggestion": null,
  "recommendedTreatment": "Approve runtime ownership and close-side policy; verify both directions."
}
```

The numeric range above describes the current literal declaration, while the eventual scanner must calculate it from the AST, never hardcode repository positions. Safe suggestions are structured property/value alternatives with source-specific spelling, e.g. approved CSS `margin-right:6px` → `margin-inline-end:6px` or React `marginLeft:"auto"` → `marginInlineStart:"auto"`. They are not edit patches. Without reviewed edge intent, report the possible equivalent as conditional rationale and leave actionable suggestion null.

## 4. Rules and conservative transformation strategy

| Concern | Planned handling |
| --- | --- |
| Physical spacing/borders | Find left/right margin, padding, border sides, text-align, float/clear and MUI aliases. Candidate only after semantic edge/owner review. Coupled active border/padding must share a group and prerequisites. Vertical/centered rules are informational or omitted from finding noise. |
| Shorthands | Tokenize 1–4-value margin/padding/inset with calc/functions intact. Two-value symmetric padding requires no migration. Four-value asymmetric sides can have logical suggestions only under approved horizontal-tb direction semantics and preserved cascade/importance. Existing `margin:30px 14px 12px` is symmetric horizontally. Unresolved var(), CSS-wide keywords, mixed logical/physical overrides, duplicate rules and media/print conflicts require review. Never split tokens on whitespace inside functions. |
| Radius corners | Recognize top-left/top-right/bottom-left/bottom-right and slash-separated elliptical radii. Under approved horizontal-tb, top-left can map to start-start and top-right to start-end; do not universalize to other writing modes. Preserve both axes/order. Symmetric circles/rounded cards are not directional failures. Asymmetric brand/artwork corners are manual. |
| Absolute/fixed edges | `left`/`right` → inline inset is not automatically safe. Position, width, collision clearance, containing block and companion gutters/transforms form a geometry group. Flag KPI/dialog/shell context; suggest no automatic placement. |
| Transforms/background/shadows | translateX, scaleX, transform-origin, background-position and asymmetric shadows are geometry risks, not generic sign reversals. Percentages can depend on element size. No mirroring SVG paths, image assets or text. Zero translation alone is not a defect. |
| Flex/grid order | Record row/row-reverse, order, justify/align start/end and explicit grid lines/areas. A default flex row follows direction naturally; flag semantic groups (chart labels/brand), not every flex container. Column layout and symmetric grid tracks do not warrant blanket reversal. DOM reading/focus order needs accessibility/runtime review. |
| Icons | Import-aware candidate catalog for ArrowForward/Back and directional chevrons plus literal arrows. Usage context distinguishes navigation, external links, trends and decorative art. Pagination delegates to MUI theme; no second custom flip. Close, Search, Menu, upward growth and external-link conventions are negative fixtures. |
| Bidi/content | Analyze JSX text/interpolations, known token-producing helpers and translated placeholders at rendered sinks; recognize bdi, dir, unicode-bidi and reviewed wrappers. IDs/email/amount/date candidates require isolation/content policy, not string reversal. Fixed en-US formatting is a runtime locale decision; canonical ISO dates/status/storage are not migration targets. Do not claim caret/native date behavior from AST. |
| Custom properties | Build bounded declaration/reference chains, preserve fallback and scopes. `--left-gap` name is only a hint; evaluate actual consumers such as margin-left. Dynamic var() or conflicting definitions reduce confidence. Report shared definition plus consumer links, not a fabricated logical variable name. Existing repository has no confirmed custom-property case. |
| Runtime | Compare reachable document direction options with theme and owned cache facts; detect explicit portal-container overrides, local direction islands and missing synchronization. Report document-root RTL as positive information and default LTR as intentional baseline context. Absence of a cache is limited to analyzed providers/import graph. Unresolved external providers create a diagnostic. |

Selectors/JSX linkage must not pretend to know complete CSS specificity, inherited computed styles, font lengths or actual overlap. Rules can flag absent visible clearance in a bounded local block, but cannot prove collision. No generated vendor CSS scanning or modifications; MUI defaults become related runtime evidence, not thousands of duplicate findings in node_modules.

## 5. Styling ownership: preventing double flipping

Recommend an explicit policy registry for future implementation, with owners per file/selector/style sink and narrower exceptions:

- **Custom plain CSS and React inline styles:** future logical-property migration owns direction. Emotion does not process these inputs.
- **Custom Emotion templates, application `sx` and custom theme overrides:** prefer logical properties for reviewed directional spacing/edges. Already logical declarations must not receive additional manual right/left reversal. Until a declaration is migrated, explicitly choose either legacy plugin handling or reviewed custom handling; never both.
- **MUI-generated physical styles:** compatible Emotion RTL processing plus MUI theme direction owns these. Document direction supplies inherited text flow. Theme direction alone is insufficient to process physical generated styles.
- **Intentional physical/LTR custom declarations in an RTL Emotion cache:** need a tested exemption or separately scoped style owner. MUI documents template `/* @noflip */`; do not assume that comments in JS object `sx` survive serialization. Require version-specific fixtures before recommending any exemption strategy there.
- **SVG/chart geometry and brand/content islands:** manual direction policy owns geometry/flow, independent of CSS processing. No global scaleX for the page.

The scanner reports unresolved or conflicting owners as MANUAL_REVIEW and suppresses AUTO_CANDIDATE admission until ownership is settled. Detect redundant direction-conditional physical swaps in plugin-owned styles as double-flip risks. Runtime policy is a recommendation for later remediation; the scanner must not create caches or change the Phase 2A theme.

[MUI RTL documentation](https://mui.com/material-ui/customization/right-to-left/) distinguishes document direction, theme direction and style processing, notes portal direction behavior, and documents template noflip exceptions. Select an RTL plugin compatible with the repository's installed MUI/Emotion/Stylis versions during a separately approved runtime phase; do not copy a latest-documentation package choice into this planning-only branch. Verify logical declarations/exemptions against that exact pipeline before future transformations.

## 6. Expected coverage of the nine confirmed issues

| Phase 2A issue | Expected static finding / category | Evidence and boundary |
| --- | --- | --- |
| RTL-01 navigation on left | Shell geometry group: MANUAL_REVIEW; active-edge pair conditionally AUTO_CANDIDATE after placement approval | `index.tsx:215`, `:220`, `:226`; CSS `:83–84`, `:114`, `:502`, `:561`. Detect physical coupling; cannot declare left placement invalid without the approved navigation convention. Drawer operation requires runtime. |
| RTL-02 chart chronology | SVG/HTML label-flow mismatch risk: MANUAL_REVIEW | Dashboard `:114`, `:118`, `:123`, `:133` + CSS `:282–285`. Literal class linkage supports correlation, but chronological correctness requires semantic review and visual/measurement evidence. |
| RTL-03 KPI collision | Absolute-edge overlay risk: MANUAL_REVIEW | CSS `:241–249`, Dashboard `:62–65`. Static position is detectable; actual glyph obstruction is visual, confirmed by Phase 2A only. |
| RTL-04 field geometry | Document/theme/cache mismatch: RUNTIME_CONFIG | `i18n.tsx:34`, shared `index.tsx:40`, `:75`, `:84`; consumer fields. No need to manufacture custom left-alignment declarations. Computed notch/helper/select geometry needs runtime checks. |
| RTL-05 dialog collision | Title-adjacent absolute position: MANUAL_REVIEW, related RUNTIME_CONFIG | `index.tsx:145–150`. Portal inheritance currently works; do not emit a confirmed portal-direction failure. Clearance remains a visual check. |
| RTL-06 table alignment | Shared TableCell default alignment policy risk: RUNTIME_CONFIG, related MANUAL_REVIEW | `index.tsx:175–199`, `:40`. Missing explicit align is not inherently wrong; correlate mismatch and ask for column policy. Runtime proves current physical left alignment. |
| RTL-07 navigation arrows | Icon/glyph semantics: MANUAL_REVIEW; Pagination: RUNTIME_CONFIG | Shared `:295`, InvoiceTable `:76`, Dashboard `:197`, Invoices `:66`. Detect usage/imports/glyphs; cannot infer all arrows should mirror. |
| RTL-08 mixed content | Unisolated content sink risk: MANUAL_REVIEW; fixed formatter: RUNTIME_CONFIG | CreateInvoice `:227–228`, Customers `:32`, `:52`, shared `index.ts:118`. Report punctuation/isolation risks, not reversed stored IDs. Actual token presentation is visual. |
| RTL-09 brand order | Unreviewed brand direction island: MANUAL_REVIEW | Shared `index.tsx:250–252` + CSS `:15–32`. Become INTENTIONAL_LTR only after explicit brand policy approval; do not silently infer exception from Latin letters. |

Target is **static evidence mapped to all nine issue families**, not nine guaranteed standalone diagnoses, a measured 100% coverage result or automatic repairs. Several issues share runtime root causes; link one configuration finding to multiple issues without inflating counts. Chart/brand correlation rules should use general structural evidence, not hardcoded Atlas filenames/classes; project-specific semantic policy can identify those groups explicitly. The translated save-error persistence limitation is recorded in Phase 2A but outside the directional scanner's core scope; keep it as a separate known limitation, not a tenth visual RTL issue.

## 7. Output, exceptions and CLI proposal

JSON is the canonical versioned report: `schemaVersion`, scanner/rule versions, input content digest, policy digest, scope, files analyzed/skipped, coverage/parse diagnostics, findings and metrics. Omit timestamps, durations, absolute paths, machine names and random ordering from deterministic artifacts. An optional separate provenance record may include commit SHA/tool versions; dirty content digest remains authoritative. Sort findings by path, start offset, rule ID and instance ID; sort all sets and use stable object key order/newlines. Identical bytes/policy/versions must yield identical JSON and Markdown even from different checkout paths.

Markdown generated from the same model includes scope/limits, category/severity counts, exact repository-relative source links, original declarations, conditional suggestions, rationale, owner, treatment and issue links. Escape pipes/code fences and limit snippets. Optional terminal summary goes to stderr so stdout JSON stays valid. Exit 0 for a completed scan by default, 1 for an explicitly configured finding gate, 2 for invalid configuration/parse/internal failure or incomplete analysis; partial output must clearly say incomplete. Do not gate CI on raw findings until review establishes a policy.

Exceptions live in data-only policy JSON, keyed by rule/path/structural anchor or finding fingerprint with reason, reviewer, scope and optional expiry. Never execute JS config. Preserve excepted findings as INTENTIONAL_LTR or informational with original category and review metadata; track stale exceptions. Existing Phase 2A intent is context, not authorization to suppress risks globally. Do not require application-source comments in a read-only phase.

Proposed package structure (not created):

```text
tools/rtl-scanner/
  project.json                 # independent Nx tooling project, no application dependency
  package.json                 # private tooling package
  tsconfig.json
  src/cli.ts
  src/discovery.ts
  src/adapters/{typescript,css,html}.ts
  src/analysis/{facts,imports,ownership,correlation}.ts
  src/rules/{spacing,geometry,icons,bidi,runtime}.ts
  src/report/{schema,json,markdown,summary}.ts
  src/policy.ts
  tests/{unit,fixtures,integration}/
  README.md
rtl-scanner.config.json        # reviewed scope, owner policy and exceptions
```

Use an independent scanner test config/target; root tsconfig currently includes apps/libs/tests, not tools, so include a dedicated tooling typecheck rather than changing application compiler settings. Future root scripts `rtl:scan`, `rtl:scan:test`, `rtl:scan:typecheck` would wrap the tooling target. Build it to an explicit temporary/tool output directory; no on-demand installs or dependency on Nx daemon writes in the scanner itself.

Illustrative future commands, **unavailable until implemented and approved**:

```sh
npm run rtl:scan -- --format json > /tmp/atlas-rtl-report.json
npm run rtl:scan -- --format markdown > /tmp/atlas-rtl-report.md
npm run rtl:scan -- --projects invoicing,procurement --summary
npm run rtl:scan:test
npm run rtl:scan:typecheck
```

Default output is stdout; shell redirection is caller-owned output. If a later `--output` option is approved, restrict it to explicit report paths outside input trees and refuse overwriting any source/baseline. No `--fix`, transformation writer, codemod dependency or implicit report file creation. Read-only means no application/source/baseline/cache mutation; writing an explicitly requested report is separate from scanning inputs.

## 8. Verification design and metrics

Unit tests: source spans/UTF-16/CRLF, source mapping across template escapes/interpolations, aliases and imported wrappers, MUI numeric semantics, value tokenization/functions, shorthand/radius mapping prerequisites, stable identity/collision detection, deterministic sorting, exception scope/expiry, schema validation and exit codes.

Fixture matrix: CSS + Emotion literal/object + MUI sx/object/array/callback/responsive + React inline styles + theme overrides + HTML roots. Include coupled desktop/mobile/print shell geometry, asymmetric shorthand/slash radius, conflicting cascade, dynamic custom properties, spreads/computed keys, renamed icon imports, literal translated arrows, SVG with separate labels, dir/bdi boundaries and portal overrides. Unsupported/dynamic cases must remain visible as coverage diagnostics rather than falsely safe edits.

Negative tests: symmetric spacing/circles, vertical margins, centered text, flex columns, non-style `left` fields, comments/strings mentioning CSS, upward growth/external-link/close icons, isolated identifiers, functioning global portal direction, approved LTR chart/brand exceptions and canonical business data. No automatic exception from a Latin string. Test ownership conflicts and plugin-owned explicit swaps as non-candidates.

Read-only/idempotence: hash all tracked and nonignored input files, Phase 2A evidence PNGs/manifest/gallery, six baselines and lockfile before/after two scanner runs; compare reports byte-for-byte across temporary cloned paths. Assert no new repository files, no cache writes and no changed mtimes where practical. Instrument write APIs and use read-only filesystem inputs; scanner test fixtures may produce files only in isolated temp directories. No emit, application imports or subprocess execution inside the scan. Bound file sizes/reference depth, reject escaping symlinks and handle parse failures without executing malformed content.

Repository regression gate after approved scanner development: lint, original application typecheck, both application builds, 4 existing unit tests, 11 original English Playwright tests (including six unchanged comparisons), nine demo tests, plus scanner tests/tooling typecheck. Run `shasum -a 256 -c docs/phase-2a-ltr-baselines.sha256`; compare application/library source, translations, runtime files and all 68 documentary captures against Phase 2A checkpoint. No snapshot updates, relaxed thresholds, regeneration or HTML/theme changes to make scanner tests pass. Documentary captures are evidence, not new expected RTL correctness baselines. Report actual fresh results and separate environment failures; checkpoint test counts are historical, not measurements made during this planning task.

Metrics, calculated only after implementation and human review:

- Finding counts by primary category, severity, confidence and mechanism; count definitions once and attribute affected applications separately.
- Unique affected files, files successfully analyzed, skipped/unsupported files, unresolved expressions and parse diagnostics; include denominators.
- Confirmed-issue coverage: mapped Phase 2A issues / nine, with separate static-root-cause, semantic-review and runtime-only coverage. Multiple links to one issue count once; a risk hint is not a confirmed diagnosis.
- False-positive review rate = findings adjudicated not applicable / adjudicated findings; report sample size, selection method and unreviewed remainder. Intentional LTR and accepted-but-deferred risks are separate dispositions, not automatically false positives.
- Candidate acceptance rate after semantic/ownership review, stale exceptions, deterministic-output mismatches and read-only violations. Candidate count does not measure remediation completion.
- Optional elapsed time/memory for a documented environment, outside deterministic reports. No benchmark values or promised speedups exist yet.

## 9. Staged delivery and approval checkpoints

1. **Approve this architecture:** parser stack, category/schema/identity rules, source scope, ownership policy and read-only boundaries. This is the present stop point.
2. **Scanner foundation:** dependency review/pinning, tooling project, adapters, locations and deterministic serializers; fixture tests and write-protection checks. Approval review verifies extraction without any application edits.
3. **Conservative rules:** physical declarations/runtime/icon/content detection, bounded semantic correlation, policy/exception support. Present an actual Atlas report with uncertainty and the nine-issue mapping. Review false positives and approve rule classifications before any CI gate.
4. **Scanner integration:** independent Nx/script targets, complete tests, documentation and regression evidence against checkpoint; decide whether to gate only incomplete scans or reviewed new risks. Approve scanner-only delivery.
5. **Separate future proposal:** codemod design and runtime remediation, each with its own ownership/semantic decisions, transformation tests and LTR/RTL visual approval. Scanner candidates alone never authorize edits. No transformation engine is part of Phase 3 scanner delivery.

Decisions needing approval: TypeScript/PostCSS/parse5 stack and supporting value parser; tool layout/CLI/output schema; conservative candidate admission; data-only reviewed exceptions; logical custom styles versus plugin-owned MUI generated styles; semantic policies for sidebar reading-start placement, preserved `atlas.` brand composition, left-to-right chart chronology, isolated mixed tokens and locale display formats. Phase 2A's documented conventions are useful starting proposals but should not be reinterpreted as authorization to fix them. Runtime configuration and codemods require a later explicit request.

## Planning verification and stop point

Confirmed clean starting tree and exact approved HEAD; created the requested branch. Inspected current source and the three evidence reports. Only this document was added. Six baseline hash checks and a checkpoint diff are the appropriate verification for this documentation-only task; no application regression suite or scanner benchmark is claimed to have run here. Stop for architecture approval before installing dependencies or implementing scanner code.
