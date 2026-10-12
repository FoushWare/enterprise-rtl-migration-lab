# Phase 4C.2 — Controlled CSS logical properties pilot

Project: Migrating Enterprise React Apps to RTL Without Breaking LTR. Verification date: 12 October 2026.

Recommendation: **APPROVE WITH CONDITIONS** for the two-property implementation and measured spacing. Closure is not ready while one unchanged scanner test asserts the pre-pilot live report. Review and separately authorize an appropriate source-independent historical/report expectation test before committing; this stage does not alter tests or archived reports.

## Repository baseline, authority and Before reference

Branch feat/phase-3-rtl-scanner; exact Before committed HEAD **05138f1c5f68db92bcd94afe11e63fd83322f8cb**. Preflight found no staged or modified files; only the pre-existing untracked docs/phase-4c1-semantic-review.md. That document was read and preserved byte-for-byte. Relevant Stage 4A pilot, ownership, migration, regression, roadmap and policy prerequisites and Stage 4B review were inspected. CSS ownership remains custom-css; no new pipeline, competing rules or runtime changes were present.

Human authorization in the Phase 4C.2 request permits exactly two manual replacements. It excludes KPI spacing and all other CSS/runtime/chart/icon/content changes. No config approval or AUTO_CANDIDATE entry was needed or added.

Before route set (only accurate when serving the exact Before checkpoint):

- Invoicing: http://127.0.0.1:4200/, /invoices, /invoices/INV-2026-1048.
- Procurement: http://127.0.0.1:4201/, /orders/PO-2026-402.
- Arabic: append ?demo=unmigrated-rtl&lang=ar to each route. English: normal routes without query.

Fresh Before measurements were collected before editing in this session. After measurements use the same URLs and viewport/state matrix on the updated source. The live Arabic Unmigrated RTL demo now includes these two spacing changes; it no longer exhibits these exact former missing gaps. All historical Phase 2A evidence remains immutable.

For future side-by-side reproducibility, a separately approved detached worktree at the Before SHA can be placed outside the tracked repository, with dependencies independently prepared and invoicing/procurement served on unused ports such as 4300/4301 via explicit Vite port overrides. After stays on 4200/4201. Never reset the active branch, copy a tree into tracked source, or run both revisions on the same ports. No second checkout/worktree, infrastructure or feature flag was created here. The same URL path/query semantics apply at the chosen Before origins.

## Exact implementation

Only libs/design-system/src/styles.css changes:

| Source | Finding removed by the pilot | Before | After |
| --- | --- | --- | --- |
| 385:3, .status-dot | RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945 | margin-right: 6px; | margin-inline-end: 6px; |
| 299:3, .chart-legend i | RTL.CSS.PHYSICAL:911c43329429945ea8519fad | margin-right: 7px; | margin-inline-end: 7px; |

Selectors, declaration order, values, formatting, specificity and all surrounding rules are preserved. Physical declarations were replaced, not layered. The .kpi-note b declaration at 266:3 remains margin-right:5px. No codemod was run.

## Measured layout comparison

Method: existing local servers, installed Chromium channel chromium, fresh en-US/UTC contexts, 1440×1000 and 390×844. Five routes, each default English and Arabic, at both widths: 20 states. Computed styles, DOM order, element/adjacent-text ranges and line fragments were collected read-only. Mobile status targets were scrolled into view before After measurements; all measured target boxes were inside the horizontal viewport. Temporary measurements and test outputs are outside the repository. No baseline/documentary images were regenerated and no new screenshots were required.

| Candidate | English Before → After (left/right margins; exterior gap) | Arabic Before → After (left/right margins; exterior gap) |
| --- | --- | --- |
| Status dot | 0/6px; 6px → 0/6px; 6px | 0/6px; 0px → 6/0px; 6px |
| Chart legend | 0/7px; 7px → 0/7px; 7px | 0/7px; 0px → 7/0px; 7px |

All 100 approved marker/text pairs passed exact expected computed margins and exterior spacing within 0.5 CSS px. Direction remains inherited ltr/rtl and writing-mode horizontal-tb. DOM order remains marker then translated text node. Dot is inline; legend marker is inline-block. Status label parent is block/nowrap with a flex/row Chip ancestor. Legend parent is blockified within section-title's flex row; its marker/text remain inline flow. No gap/flex reversal was introduced.

Gap is the following text range's left minus marker right in LTR, marker left minus following range right in RTL. Line fragments were examined: measured following text fragments occupy one line in these fixtures. No wrapped pair was encountered; no union-box claim is made for untested wrapped text or glyph ink/caret order. KPI measured physical margins and missing Arabic exterior gap remain unchanged; its bidi/icon semantics are still deferred.

### After route evidence

| URL | Width | Selector | Pairs | Direction | Left / right margin | Following-range gap (px) |
| --- | ---: | --- | ---: | --- | --- | ---: |
| http://127.0.0.1:4200/ | 1440 | .status-dot | 5 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/ | 1440 | .chart-legend i | 1 | ltr | 0px / 7px | 7 |
| http://127.0.0.1:4200/invoices | 1440 | .status-dot | 8 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048 | 1440 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/ | 1440 | .status-dot | 9 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402 | 1440 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 5 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 1440 | .chart-legend i | 1 | rtl | 7px / 0px | 7 |
| http://127.0.0.1:4200/invoices?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 8 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 1 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 9 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 1 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4200/ | 390 | .status-dot | 5 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/ | 390 | .chart-legend i | 1 | ltr | 0px / 7px | 7 |
| http://127.0.0.1:4200/invoices | 390 | .status-dot | 8 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048 | 390 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/ | 390 | .status-dot | 9 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402 | 390 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 5 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 390 | .chart-legend i | 1 | rtl | 7px / 0px | 7 |
| http://127.0.0.1:4200/invoices?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 8 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 1 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 9 | rtl | 6px / 0px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 1 | rtl | 6px / 0px | 6 |
Consumer coverage: invoicing Dashboard recent invoices, /invoices list and InvoiceDetails; procurement purchase-order list and detail. Status labels span seeded Paid, Pending, Overdue, Draft, Approved and Delivered values. Legend only exists on invoicing Dashboard; shared stylesheet does not imply procurement consumption. Source references remain design-system/index.tsx:115–116, InvoiceTable.tsx:66, InvoiceDetails.tsx:34, procurement/App.tsx:88,110, Dashboard.tsx:83–85.

## Scanner and policy compatibility

Direct scanner CLI succeeds with complete=true, 419 facts, 56 findings, 53 actionable candidates, three metadata entries and nine existing diagnostics. Categories: 48 MANUAL_REVIEW, five RUNTIME_CONFIG, two INTENTIONAL_LTR, one INFORMATIONAL, zero AUTO_CANDIDATE. Exactly the two authorized physical-property finding IDs disappear; no new IDs appear. Remaining IDs and classifications are unchanged. Two later stylesheet findings retain IDs but UTF-16 offsets legitimately shift because the longer property spellings precede them; line/column and declaration meaning remain unchanged. Those IDs are RTL.CSS.PHYSICAL:d64ac5113f2d40f44c75d315 and RTL.CSS.PHYSICAL:5f4d415396df52ea51e0a5d6.

Policy diagnostics: none. All three dynamic-background pins target unchanged Dashboard.tsx/design-system/index.tsx rather than styles.css, so no existing source pin becomes stale. Both English-root exceptions still match. No digest was refreshed, no record suppressed, and policy/config/rules/schema remain unchanged. Repeated post-pilot JSON and Markdown outputs are deterministic. The approved archived Stage 3 reports remain byte-identical to HEAD; they deliberately retain the historical 58 entries rather than being overwritten with the live 56-entry result.

## Verification and actual failure

| Command/check | Actual outcome |
| --- | --- |
| npm run rtl:scan:test | **118 passed, one failed, 119 total** |
| npm run rtl:scan:typecheck | Passed |
| npm run rtl:scan:build | Passed |
| npm test | Four passed |
| npm run lint | Passed |
| npm run typecheck | Passed |
| npm run build | Three Nx tasks succeeded, two cached; NX_DAEMON=false NX_ISOLATE_PLUGINS=false |
| Existing Playwright suite | 20 passed in 10.3 seconds |
| Six English visual assertions | Passed with existing maxDiffPixels:0; no snapshot updates |
| Six baseline SHA-256 manifest checks | All matched |
| Phase 2A evidence | All 68 documentary PNGs and tracked screenshot/gallery/manifest evidence unchanged |
| git diff --check | Passed |
| Repeated scanner outputs | Deterministic; intentional two-finding removal and source digest change |

Failure: tools/rtl-scanner/tests/policy.test.ts:41, “current Atlas configuration and all five exceptions retain exact archived reports”, expects live findings.length=58 but receives 56. The test also asserts exact equality to archived JSON/Markdown, which necessarily differs after approved source changes. This is an outdated live-source archival assertion, not evidence that the two physical risks persist. It must not be reported as a passing suite. The remaining 118 tests passed. No test, archived report, policy or assertion was weakened/updated. A separate reviewed test-design change is required before closure; no permission is inferred to implement it now.

## Remaining issues, limits and final scope

The pilot corrects only marker-to-label spacing. Sidebar/drawer geometry, chart chronology versus HTML labels (RTL-02), KPI icon collision and note grouping, MUI fields/table alignment, dialog close placement, directional icons, bidi isolation and branding are still separate migration concerns. Chart SVG paths/axis/month labels and chronology are byte-identical source: no full chart correctness claim is made. Theme direction remains LTR and no Emotion RTL plugin/cache has been added.

Untested states: wrapped/long alternate Arabic labels, text zoom, Storybook, print rendering, intermediate breakpoint boundaries, other engines/font environments, future cache/direction islands and every filtered/paginated state. Current measured fixtures and six English reference states passed; these results do not establish universal spacing or bidi correctness.

Final inventory relative to HEAD:

- libs/design-system/src/styles.css — exactly two authorized declaration replacements.
- docs/phase-4c2-css-pilot-review.md — new pilot review.
- docs/phase-4c1-semantic-review.md — pre-existing untracked review, preserved unchanged.

All other tracked files match HEAD, including applications, translations, scanner rules/implementation, configuration/exceptions, dependencies, tests, archived reports and protected evidence. The CSS diff is exactly the approved two replacements. No approvals were added to policy; no AUTO_CANDIDATE was created; no broad migration, runtime fix, CI enforcement or new dependency was introduced. No commit or push occurred, and no Stage 4C.3/other migration stage started.

Final recommendation: **APPROVE WITH CONDITIONS**. Spacing implementation and English/Arabic measurements meet the bounded acceptance criteria. The single historical-live-report test failure is a closure blocker requiring separate human review and authorization; do not commit or expand this pilot until resolved.
