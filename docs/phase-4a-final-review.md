# Phase 4 Stage 4A — Final planning review

Project: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Review date: 12 October 2026 (Africa/Cairo).

**Stage 4A planning COMPLETE; implementation approval pending.** Only the nine requested documents were added. No commit/push/new branch, migration, codemod, runtime fix, semantic approval, dependency/test/baseline change or CI gate. Stage 4B has not begun.

## Repository baseline and evidence provenance

Initial branch `feat/phase-3-rtl-scanner`; HEAD exactly `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`; working tree clean with no staged/unstaged/untracked changes. A 177-tracked-file SHA-256 snapshot was recorded outside the repository before writing documentation. All 177 tracked files remain byte-identical, including scanner, config, archived reports, application/design-system/shared source, lockfile and tests. No existing work was reset, stashed or overwritten.

Reviewed Phase 3 architecture, foundation, detection, final adjudication, closure, canonical JSON/Markdown inventories, scanner README and rtl-scanner.config.json; Phase 2A observations and relevant current app/shared/theme/Emotion/MUI/chart/icon/routing sources. Installed MUI/Emotion source and version-specific official references support runtime proposals. Historical foundation schema v1/incomplete inventory must not override current Stage 3 schema v2/catalog completeness. New planning reports do not modify historical reviews.

Four distinct evidence levels are maintained:

- **Confirmed source facts:** literal physical declarations, imports/calls, provider order, SVG coordinates, original text sinks and fixed formatter. Exact source positions/IDs are in the ownership inventory.
- **Existing Phase 2A observations:** nine documented visual issue families with three Major/six Minor severities, measured glyph/chronology/brand effects and explicit no-reproduction cases. These are historical documentary evidence, not new screenshots collected here.
- **Proposed migration decisions:** ownership, logical/manual/runtime treatments, pilot recommendations, acceptance thresholds, preview-mode strategy and staged implementation. None is authorized by a scanner finding or by this plan.
- **Unresolved questions:** 17 bidi candidates require runtime/content evidence; locale target requires product decision; bounded graph/cache/cascade/owner coverage remains. Fresh existing Playwright assertions do not prove every glyph/geometry case.

## Counts and complete candidate review

| Report category | Preserved count |
| --- | ---: |
| MANUAL_REVIEW | 50 |
| RUNTIME_CONFIG | 5 |
| INTENTIONAL_LTR | 2 |
| INFORMATIONAL | 1 |
| AUTO_CANDIDATE | 0 |
| Total | 58 |

419 extracted facts across 20 supported files. 55 actionable candidates plus three metadata entries; 13 affected files. [Style ownership](phase-4a-style-ownership.md) inventories every stable ID among all 58, preserving category/owner/source and adding a separate proposed treatment, reviewer-known consumer evidence, runtime requirements, confidence and questions. It does not silently reclassify findings.

Previous adjudication is exactly 46 IDs after excluding nine selected positive calibration primaries: 28 valid review risks, 18 requiring evidence, zero established false positives. This does not establish a zero false-positive rate, perfect precision, exhaustive coverage or 55 confirmed runtime bugs. [Evidence plan](phase-4a-evidence-plan.md) preserves all 18 IDs and assigns 17 RUNTIME_EVIDENCE_REQUIRED and one UNRESOLVED (locale) planning states; their source premises are supported, not automatically proof of defects.

All nine NONBLOCKING_DYNAMIC diagnostics remain visible with rationales; complete=true still means applicable supported static analysis completed, not global reachability/runtime/visual correctness. Three dynamic-background source/expression pins and two English HTML exceptions retain exact current matching. Semantic approvals and ownerOverrides remain empty.

## Ownership and proposed strategy

Plain CSS/inline styles bypass Emotion. MUI-generated CSS is runtime-owned; custom templates/sx/theme overrides need an explicitly reviewed processing contract. Shared Provider/theme, forms, tables, shell, status and formatter have source-supported consumers in both apps. Modal and decorative dashboard KPI/chart structures have invoicing consumers; no procurement usage is fabricated. Shared `applications: []` remains scanner reachability unresolved, not zero consumers.

Current Provider sits outside LocaleProvider in both entry trees. Propose a locale/mode-aware boundary inside the router, stable direction-specific theme/cache instances, prefixing and compatible RTL processing with preserved English insertion order and no form remount. No plugin is currently installed and no dependencies were added. Cache absence remains scoped; unknown k.icon sx owner remains visible despite reviewer inspection of its imported icon tuples.

A global plugin may flip SidebarFrame but leave plain-CSS .app-main gutter untouched. Proposed 4D transition needs a verified shell opt-out until coordinated 4E work, or separately approved atomic shell changes. MUI theme alone does not fix emitted physical defaults. Portal root RTL already works; do not manufacture a portal inheritance issue. Modal, columns and custom icons must be reevaluated after runtime setup before adding manual reversals.

Proposed semantic targets: coordinate right reading-start Arabic shell while preserving English left geometry; preserve May→October physical LTR chart chronology/data; complete Latin brand island; isolate known LTR tokens without forcing unknown Arabic names LTR; keep en-US formatting pending separate locale decision. Policies and double-handling risks are in [migration policies](phase-4a-migration-policies.md). Global live before-mode preservation requires its own decision: a shared CSS change affects legacy demo too. Recommend a separate approved before-checkpoint server for video comparison, or explicitly approved mode-scoped styles; no second server/mode was created.

## CSS pilot recommendations — no permission granted

| Exact source | Proposed future treatment | Recommendation |
| --- | --- | --- |
| libs/design-system/src/styles.css:385:3 — .status-dot margin-right:6px | margin-inline-end:6px for marker-following gap | Recommend conditional approval after semantic/owner review, safeguards and bilingual computed-gap evidence |
| libs/design-system/src/styles.css:299:3 — .chart-legend i margin-right:7px | margin-inline-end:7px for inline legend gap, independent of chart axis | Recommend conditional approval after inline-flow evidence and chronology exclusion |
| libs/design-system/src/styles.css:266:3 — .kpi-note b margin-right:5px | Potential margin-inline-end:5px | Defer until mixed note/token grouping and growth semantics are reviewed |

All remain unchanged MANUAL_REVIEW findings. [Pilot review](phase-4a-css-pilot-review.md) checks markup, consumers, specificity/cascade, inline flow, runtime overlap and English equivalence assumptions. Proposed recommendation is not authorization to edit or promote AUTO_CANDIDATE.

## Policy prerequisites and roadmap

Current runtime JSON validation is partial; TypeScript interfaces do not validate external data. Only currently detected malformed config is guaranteed to exit 2. Stale records have no explicit diagnostics, and whole-file pins can invalidate after unrelated edits. Exact matching is not broad suppression.

[Safeguard plan](phase-4a-policy-validation-plan.md) proposes strict schema/enum/unknown-field checks, source/ID validation, stale/conflicting ownership diagnostics, negative fixtures, exit behavior and report compatibility before automation, new policy suppression or CI enforcement. Validator/dependency choice and stale warning/blocking boundary need explicit approval. No safeguards implemented now.

[Implementation roadmap](phase-4a-implementation-roadmap.md) proposes independent review gates: **4B safeguards → 4C exact approved CSS pilot → 4D runtime themes/caches/providers → 4E bounded component/semantic fixes → 4F controlled codemod expansion**. Each has scope/dependencies/risks/deliverables/tests/stop condition. Unknown runtime syntax introduced later may make the scanner incomplete: retain diagnostics, do not suppress them to preserve current metrics.

[Nine-issue matrix](phase-4a-issue-migration-matrix.md) retains only existing actual scanner associations, notes shared roots and separates Phase 2A visual severity from static priority. [Regression plan](phase-4a-regression-plan.md) defines original automated assertions, preserved documentary images, proposed future correctness baselines and manual probes separately, with measurable criteria.

## Fresh verification results

| Check | Actual result |
| --- | --- |
| npm run rtl:scan:test | 60 tests passed, three files |
| npm run rtl:scan:typecheck | Passed |
| npm test | Four original unit tests passed |
| npm run lint | Passed |
| npm run typecheck | Passed |
| NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run build | Three Nx tasks succeeded, two cached; both apps and scanner |
| Existing Playwright, no update-snapshots | 20 passed in 12.2s: 11 original English plus nine demo; six zero-difference English visual assertions unchanged. Outputs outside repository. |
| Repeated direct JSON/Markdown scans | Both formats deterministic and byte-identical to approved Stage 3 artifacts; no report rewrite |
| Direct scan read-only | 255-file inventory/content/mtime snapshot unchanged, including ignored Nx/dist outputs and the nine new planning documents |
| Six English SHA-256 baseline checks | All six match docs/phase-2a-ltr-baselines.sha256 |
| Tracked-file snapshot | All 177 original tracked files unchanged; no scanner/config/classification/dependency/test/runtime modifications |
| Protected Phase 2A comparison | 120 app/library/e2e/evidence files byte-identical to 61491d7 checkpoint, including 68 documentary PNGs and gallery/manifest |

Builds/tests may produce ignored outputs; this is separate from direct read-only scanning. No documentary recapture or new screenshots were performed. No claim of pixel-perfect reproducibility across environments or hosted CI execution. Detailed no-mutation checks accompany final inventory verification; no staging/commit/push occurs.

## Exact files added

1. [Style ownership and all-entry dispositions](phase-4a-style-ownership.md)
2. [Migration policies](phase-4a-migration-policies.md)
3. [CSS pilot review](phase-4a-css-pilot-review.md)
4. [18-candidate evidence plan](phase-4a-evidence-plan.md)
5. [Policy validation plan](phase-4a-policy-validation-plan.md)
6. [Nine-issue migration matrix](phase-4a-issue-migration-matrix.md)
7. [Regression plan](phase-4a-regression-plan.md)
8. [Implementation roadmap](phase-4a-implementation-roadmap.md)
9. This final review.

All nine are new untracked planning documents. No existing tracked document was updated, no generated source/report added, no original baseline or screenshot overwritten.

## Explicit reviewer decisions before implementation

1. Approve Stage 4B scope only, including strict schema strategy, any proposed validator dependency and report/policy backward-compatibility contract; decide which stale records block completion versus warn.
2. Approve exact pilot semantics/IDs individually, or defer/reject them; resolve KPI-note bidi grouping before admitting it. Stage 4C application needs separate authorization, not an implicit approval from this report.
3. Select live before-mode strategy: separate checkpoint server versus mode-scoped styles/runtime; define future migrated-preview URL/UI without changing normal English defaults.
4. Approve runtime boundary/provider topology, direct cache/plugin dependencies, insertion order and shell transition opt-out; accept that runtime may resolve several linked symptoms together.
5. Confirm semantic layout/chart/brand/icon/column/input/bidi contracts and locale formatting policy. No blanket SVG mirror, data reversal, global right-alignment or forced LTR for unknown names.
6. Approve future Arabic visual baselines and measurable acceptance thresholds (including proposed dialog clearance), independently of documentary before captures; require English baseline preservation and per-stage stop gates.

**Stop:** Stage 4A only. Wait for explicit approval; no Stage 4B or later implementation is authorized.
