# Stage 4A — Regression and Arabic acceptance plan

Project: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Stage 4A planning only, 12 October 2026. Branch `feat/phase-3-rtl-scanner`, approved HEAD `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`. All treatments are proposals; no approval, code/policy/test change, commit or push is granted by these documents.

## Four evidence classes

| Evidence class | Existing or proposed | Meaning / preservation |
| --- | --- | --- |
| Automated assertions | Existing baseline.spec.ts 11 tests plus demo.spec.ts nine; application four unit and scanner 60 tests | Preserve source and behavior; six English screenshot assertions require maxDiffPixels:0, no relaxed threshold/update. Tests do not validate every RTL glyph/collision. |
| English screenshot baselines | Existing six files under tests/e2e/baseline.spec.ts-snapshots; hash manifest | Immutable default-English states; opt-in English demo captures do not replace them. Any pixel delta is investigated. |
| Documentary screenshots | Existing 68 PNGs plus manifest/gallery under docs/screenshots/phase-2a | Historical broken RTL/opt-in English observation, not desired Arabic correctness assertions. Preserve bytes; never regenerate in-place for an after state. |
| Arabic correctness baselines/probes | Proposed new per-mode screenshots and semantic/geometry assertions after reviewer approval | Separate directories/specs and approved expectations; do not bless current defects as correct baselines. No new tests/baselines created in Stage 4A. |

## Mode boundaries and fixture isolation

Propose default English, legacy opt-in Unmigrated RTL comparison and distinct migrated-preview mode, with explicit reviewer agreement on URL and controls before runtime work. Current app only implements the first two. Do not relabel broken mode as fixed, or silently use legacy Phase 2A screenshots to assert a new mode. Maintain fresh contexts with existing seed records, browser en-US/UTC/light, fixed fonts/no remote font and animations disabled for captures. Use current Chromium version recorded with each new artifact; native date coverage adds explicitly labeled browser/locale matrix.

Base widths 1440×1000 and 390×844; add 899/900/901 breakpoint checks, 600 boundary and print emulation for shell geometry. At 200% text zoom/long Arabic text perform manual clearance/overflow inspection; do not promise pixel equality across OS/browser/font versions. New evidence belongs under a separate approved phase/mode directory.

## Proposed measurable checks

| Area | Existing coverage | Additional future acceptance / method |
| --- | --- | --- |
| English visual/workflows | Six exact screenshots; navigation, search, filters, create/persist, responsive drawer | All six baseline hashes unchanged and screenshot diff 0px; existing tests pass; run against same fixture/platform first. |
| Arabic correctness | Demo source text/root/portal/data checks; documentary defects | All nine target criteria in issue matrix pass, measured glyph/collision/chronology where specified; reviewer approves new Arabic captures. |
| Direction switch | Both apps switch/reload/deep link/cross-app; form values retained | Repeat en→ar→en five cycles with open form/menu/dialog and untouched inputs; no subtree remount/data loss; root/theme/cache agree every stabilized mode. |
| Shared components | Forms/tables/shell/status used by both; Modal only invoicing | Matrix consumers exercised: multiple statuses, long labels, empty/filter states, list/detail. Do not assert procurement Modal usage. |
| Dialogs/portals | Computed RTL outside #root checked | Global root plus local island future scenarios; zero close/title glyph overlap and proposed ≥8px clearance; focus trap/Escape/focus return; computed portal dir matches mode. |
| Forms/input | Validation, select, settings, data storage | Empty/focus/error/populated notch/helper/select geometry; Arabic/Latin/mixed input caret/selection/copy; native date segments in tested browsers, ISO values unchanged. |
| Tables | Seed content, filters/page roles; manual mobile scroll observations | Human headers at approved start, numeric/token per-column alignment; scroll both extremes without lost columns; document scrollWidth equals clientWidth at target widths. |
| Charts | SVG accessible name; Phase 2A month measurements | May..Oct monotonic physical x; October endpoint correspondence, identical path/data/proportions and localized accessible meaning. No invented tooltip test. |
| Icons | Routes/pages work; screenshots show original orientation | Compare semantic progression orientation + click destination; keep trend/external/Close/brand orientations; pagination uses correct previous/next role only once. |
| Bidi | DOM/storage intact; documented exact mixed cases | Per-ID glyph-order/selection/copy probes, sentence punctuation, Latin address/amount boundaries and Arabic human names; no control characters inserted into business data. |
| Navigation/layout | Desktop/mobile original drawer works | Paired anchor/gutter; hidden/visible drawer intervals correct; no page overflow; open/close/menu clicks keyboard operable; media/print resets approved. |
| Branding | Before captures in both shells | Approved symbol/word/period order, unchanged letter shapes; preserved English rectangle geometry within reference environment. |
| Scanner/policy | Deterministic/read-only fixtures and source hashes | Known unsupported new runtime cache expressions remain diagnosed; do not suppress them to preserve complete=true. A future adapter expansion needs separate approval/tests. |

## Execution and failure policy

Run scanner/tooling tests/typecheck, original unit/lint/typecheck, both app/tooling builds and all existing Playwright tests at each approved implementation checkpoint. Direct scanner runs compare repeated JSON/Markdown; preserve source/baseline/evidence hashes and inventory. Application changes legitimately affect scanner findings/digests in later stages: write new report artifacts and explain IDs/coverage changes rather than overwriting the approved Stage 3 reference silently. Changing shared index.tsx will invalidate whole-file background pins; re-review source/color evidence explicitly, never auto-refresh pins.

Future new tests/fixtures require separate approval; original coverage remains intact. Test writes use temporary outputs/contexts; no update-snapshots. A failure blocks the affected stage's completion until diagnosed; do not weaken assertions, update English goldens or normalize unexpected geometry. Documentary capture rasterization has known environmental variation; compare metadata/geometry and state rather than claim it is an automated correctness baseline. No hosted CI or gating change is authorized.
