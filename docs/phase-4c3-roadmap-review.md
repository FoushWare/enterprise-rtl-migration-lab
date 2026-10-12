# Phase 4C.3 — Migration roadmap and scope review

Project: Migrating Enterprise React Apps to RTL Without Breaking LTR. Coffee Break Web case study. Review date: 12 October 2026.

## Executive summary

Recommendation: **APPROVE WITH CONDITIONS** for the planning direction, not implementation. Recommend one next stage: **Stage 4D.1 — Runtime direction contract and compatibility design**. This is a narrow investigation/design prerequisite within the existing Stage 4D, before installing dependencies or changing providers. The CSS pilot is closed; further generic CSS conversion is not justified by its success. Runtime implementation is premature until cache ownership, shell isolation, mode semantics and scanner coverage expectations are explicitly settled.

Verified source facts, prior documentary observations and future recommendations are identified separately below. No runtime experiments, browser sessions, new servers, worktrees or transformations were started during this review.

## Verified repository baseline

Branch: feat/phase-3-rtl-scanner. HEAD: **85f4dde02142f305b434c815a39015a4c5eaafec**. Initial working tree/staging clean. Recent history:

| Commit | Checkpoint |
| --- | --- |
| 85f4dde | Approved two-property logical spacing pilot, semantic reviews and historical/live test separation |
| 05138f1 | Strict policy validation/stale safeguards |
| 9c2df15 | Stage 4A planning |
| 0de6d60 | Conservative detection and Stage 3 closure |
| 406b7cd | Read-only scanner foundation |

Reviewed evidence includes docs/testing-strategy.md, verification.md, Phase 2A observed issues and screenshots/manifest/gallery, Phase 3 scanner plan/foundation/detection/adjudication and archived reports, Stage 4A ownership/policies/regression/roadmap/issue matrix, Stage 4B review, and all three Stage 4C reviews. Current source, policy, scripts, scanner rules/adapters/tests and .github/workflows/ci.yml were inspected. Historical documents retain their checkpoint-specific results; they are not rewritten into current reports.

## Roadmap alignment and naming

The existing phase-4a-implementation-roadmap.md defines **4B policy safeguards → 4C logical CSS pilot → 4D MUI/Emotion runtime direction → 4E component fixes → 4F controlled codemod expansion**. It does not define a competing 4C.3 stage; references in recent reviews are stop boundaries, not another implementation definition. This user-requested 4C.3 is a roadmap review closing the pilot family. Proposed 4D.1 is a design substage inside 4D, preserving the roadmap order rather than silently renaming 4C.3 as runtime implementation.

Some historical scanner README paragraphs still describe pre-pilot status (unapproved pilots, no fixes, archived-output equality, Stage 4B awaiting review). Those are superseded by the actual commit and later Stage 4C reviews. They are documentation debt, not permission to alter them during this one-file task. Stage 3 archived 58-entry reports remain correct historical evidence.

## Current scan and policy facts

Direct compiled CLI scan was run against current source; it completed successfully:

| Metric | Actual current value |
| --- | ---: |
| Extracted facts | 419 |
| Report entries | 56 |
| Actionable entries | 53 |
| Metadata entries | 3 |
| MANUAL_REVIEW | 48 |
| RUNTIME_CONFIG | 5 |
| INTENTIONAL_LTR | 2 |
| INFORMATIONAL | 1 |
| AUTO_CANDIDATE | 0 |
| Coverage diagnostics | Nine, all nonblocking |
| Complete | true |

No stale/conflicting policy diagnostics occur. Current schema-v1 config has approvals:[], ownerOverrides:[], two English HTML-root exceptions and three exact source/expression-pinned dynamic-background exceptions. Human approval authorized a bounded manual pilot; it did not insert scanner policy approvals. Strict validation and fail-closed auditing remain present. Findings are static review risks, not 53 confirmed runtime bugs. Nine issue associations do not prove nine independent causes or universal coverage; the 18 evidence-dependent candidates remain separate review questions.

Ownership: plain CSS custom-css; React inline custom-inline; Emotion templates/MUI sx/theme custom-emotion-review; HTML document-runtime; generated MUI mui-generated. Unknown/conflicting pipeline semantics do not qualify for automatic transformation. Shared applications:[] means reachability unresolved, not zero consumers; source-known consumers are described separately.

## Completed pilot impact and remaining CSS

Verified styles.css:299 and :385 use margin-inline-end:7px and :6px. KPI note at :266 remains margin-right:5px. Exactly RTL.CSS.PHYSICAL:911c43329429945ea8519fad and RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945 disappeared. Prior Stage 4C.2 browser measurements documented correct 7px/6px gaps in both directions across 20 states; closure verified all six English visuals. Those are prior measured results, not new browser evidence collected here.

Remaining plain-CSS physical risks include brand margins at :21/:32; nav margin-left:auto at :49; active border/padding at :83/:84; shell margin-left:238px at :114 and resets :502/:561; header divider/margin :143/:144; KPI right:20px at :241; KPI note :266; chart-label padding-left:40px at :285. There are also inline/sx/Emotion directional declarations. Their meanings differ: reading-flow spacing, intentional brand/chart frame, paired geometry and mixed bidi content. None is granted AUTO_CANDIDATE by this review. The KPI remains conditional; chart-axis gutter is not a safe reading-start replacement. Any further CSS candidate needs per-declaration semantics, owner/writing-mode/cascade proof, exact source pins and independent authorization.

## Runtime baseline and architectural constraints

SOURCE FACT: both apps/main.tsx:8–16 wrap Provider outside BrowserRouter and LocaleProvider. Shared LocaleProvider at libs/shared/src/i18n.tsx:25–56 selects Arabic only when demo=unmigrated-rtl and lang=ar; useLayoutEffect sets document lang/dir at :33–34. Normal and lang=ar-only routes remain English. demoHref retains the opt-in query through navigation/cross-app links. No migrated-preview flag currently exists.

SOURCE FACT: design-system/index.tsx:39–79 creates one fixed direction:ltr MUI theme and ThemeProvider. No owned CacheProvider/RTL plugin was found in app/library sources. package-lock.json resolves MUI 7.3.11, Emotion react/cache 11.14.0, styled 11.14.1, Stylis 4.2.0. Cache/Stylis are not direct dependencies; neither @mui/stylis-plugin-rtl nor stylis-plugin-rtl is installed. These are local lockfile facts, not a compatibility guarantee or package recommendation.

SOURCE FACT: SidebarFrame at index.tsx:213–231 is Emotion-generated fixed left:0, border-right and mobile translateX(-100%). Plain CSS independently reserves/reset the left content gutter. Turning on RTL processing for the template alone could move/mirror one owner without the other. Existing logical status/legend CSS bypasses this pipeline. Runtime plugin processing plus separately hand-swapped physical/custom styles can conflict; do not assume a global plugin fixes all CSS or that every logical property requires mirroring.

PRIOR OBSERVATION: normal body portals inherited document RTL in Phase 2A. No blanket portal propagation failure is established. Dialog close geometry and generated field/table geometry still need the shared runtime and component contracts; local direction islands would require explicit portal-boundary decisions. Drawer here is a custom aside, not a MUI Drawer whose anchor can simply be changed.

SOURCE FACT: rules.ts:90 emits blocking CACHE_CONFIGURATION_UNRESOLVED for a CacheProvider it cannot resolve. A future provider may legitimately make scanning incomplete until compatible static evidence is implemented in a separately approved scanner change. Suppression to retain complete=true is not acceptable. index.tsx whole-file changes also stale one reviewed background pin; Dashboard changes stale its two pins. Pin refresh requires explicit source review, never automation.

## Remaining Phase 2A issue dependency map

These are prior documentary cases, not freshly revalidated after the pilot. The two spacing fixes do not resolve any entire nine-case issue.

| Issue | Primary owner/source | Dependency and recommended treatment | Evidence required before/after |
| --- | --- | --- | --- |
| RTL-01 sidebar/drawer | Emotion SidebarFrame index.tsx:213–231 plus CSS gutter/nav/reset | Runtime processing must preserve coordinated geometry or ship a separately approved atomic shell patch; 4E shell slice | Both app drawer/desktop, 899/900/901px and print; focus, gutter/anchor/motion agreement |
| RTL-02 chart chronology | Dashboard.tsx:87–136 SVG + CSS labels :282/:285 | Independent manual fixed LTR time frame with Arabic labels; not plugin/CSS conversion. Keep under 4E order | May→Oct physical x, endpoint correspondence and identical paths/data/accessible meaning |
| RTL-03 KPI overlap | CSS :241 plus Dashboard label/icon | Manual clearance; runtime alone does not flip plain CSS. KPI note semantics separate | Arabic label/icon glyph clearance, all cards and widths; procurement has no matching icon |
| RTL-04 MUI fields | Theme/Provider and FormField index.tsx:85 | 4D generated direction pipeline first; then inspect input/content policy before custom fix | Empty/focus/error/filled/select/helper/notch, caret and persisted values |
| RTL-05 dialog close | Modal index.tsx:129–161; sx right:12 at :150 | Runtime may alter sx side; remeasure before manual placement. Local portal dir only where applicable | Open both dialogs, title/close clearance, focus trap/Escape/return and switching |
| RTL-06 table headers | DataTable index.tsx:175–211, theme overrides | Generated runtime then explicit human/numeric/token column policy in 4E; no blanket mirror | Both app list/detail, headers/body and mobile scroll extremes |
| RTL-07 arrows | InvoiceTable:76, Dashboard:197, Sidebar:295, Pagination Invoices:66 | MUI pagination depends on theme; custom arrows/copy require separate manual roles | Actual next/previous route/page semantics; non-navigation/growth glyphs unchanged |
| RTL-08 mixed tokens | CreateInvoice:228, Customers:32/:52 and shared formatter | Content-boundary manual bidi work; locale formatting remains a separate decision; not solved by margins/theme | Code-point copy/storage, punctuation, ranges/caret; 18 unresolved cases remain explicit |
| RTL-09 Latin brand | Sidebar index.tsx:250–252 plus CSS brand | Manual complete LTR composition within RTL shell; shell placement independent | Both apps symbol/word/period order, unchanged glyphs and English placement |

No single shared runtime root is counted as several independent causes. Chart/icon/bidi/branding choices are semantic decisions even if static risks have High confidence.

## Comparison of next workstreams

| Criterion | A: expand logical CSS | B: runtime infrastructure | C: targeted UI issue |
| --- | --- | --- | --- |
| Dependencies | Per-ID semantic/cascade/owner approval; automation engine absent | Mode/topology/cache/plugins, shell ownership, scanner support and pin review | Per-issue product contract; forms/tables depend on runtime |
| English risk | Small for truly isolated approved spacing; larger for geometry | High cross-app insertion-order/provider/state risk | Low–high depending on slice; fixes may be repeated after runtime |
| RTL benefit | Incremental gaps; few unambiguous remaining candidates | Broad generated control consistency across both apps | Visually obvious single symptom, e.g. chart; no infrastructure coverage |
| Policy readiness | Strict validation exists, but zero approvals/candidates and no transformer | Existing scanner cannot establish arbitrary cache/plugin compatibility | Manual work not automatically authorized by classifications |
| Verification | Before/after gap+English regression; cascade meaning still manual | Strong existing workflows, but missing cache/theme and repeated-switch probes | Geometric/semantic Arabic assertions still need design |
| Reversibility | Small exact patch; future apply manifest required | One reviewed commit reversible but coupled providers/styles need isolation | Bounded patch reversible; verify shared consumers |
| Video value | Proven small first step; expansion alone risks implying regex migration | Explains document/theme/cache distinction and double-flip trap | High before/after visual payoff but may bypass foundational decisions |
| Reviewable next slice | Further semantic review, not blanket codemod | **Narrow 4D.1 contract design now**, then approved runtime implementation | Viable later 4E slices; chart exception out-of-order needs explicit roadmap deviation |

Choose B's design prerequisite. It follows the established sequence and addresses blockers that would make a broad runtime commit unsafe. A small chart fix could be independently useful, but recommending it next would deviate from the current 4D→4E roadmap and leave generated-style ownership unresolved. No such deviation is silently approved.

## One recommended next stage: 4D.1 runtime contract and compatibility design

Scope, if human authorizes it next: produce an implementation-ready direction/cache contract and test plan. Inspect actual installed/provider/style pipelines, choose a verified shell exclusion/coordinated strategy, decide external Before workflow, define cache keys/plugin order/insertion precedence and enumerate required dependency compatibility evidence. Document proposed future patch before writing it. No production runtime changes in this design substage.

Candidate design inputs (not authorized edit paths): apps/invoicing/src/main.tsx, apps/procurement/src/main.tsx, libs/shared/src/i18n.tsx, libs/design-system/src/index.tsx, styles.css, package.json/lockfile, scanner cache rule/adapters/policy pins and tests/e2e/demo.spec.ts. A proposed next documentation artifact could be docs/phase-4d1-runtime-contract.md; its name/scope requires approval. Investigation fixtures, package installation or runtime experiments would need separately explicit bounded authorization; none are assumed by this recommendation.

Out of scope: new CSS pilots/codemods, sidebar placement migration, charts, icons, bidi, branding, locale/data changes, dashboards, CI gates, policy suppression and baselines. A shell *preservation* decision during future runtime activation is distinct from implementing RTL-01.

Prerequisites/human decisions:

1. Authorize 4D.1 design scope, then separately approve production implementation.
2. Choose preserved legacy shell under verified processor opt-out versus an explicitly expanded atomic shell scope. If exemptions cannot be verified, do not activate a global pipeline.
3. Decide whether future migrated output uses the existing opt-in route on a distinct revision, or a separately approved new mode. Do not repurpose query semantics without approval; this review recommends separate revisions for comparisons.
4. Approve proposed direct cache/plugin/Stylis dependencies only after exact compatibility/maintenance evidence; transitive availability is insufficient.
5. Decide a separate bounded scanner cache-analysis prerequisite versus explicitly accepted incomplete runtime scan. No hiding diagnostics or implicit schema/rule changes.
6. Approve source-pin re-review after intended owning-source changes and the live-test expected delta, while preserving historical report hashes.

Design acceptance: one owner assigned per generated/custom directional effect; concrete provider topology reads locale inside router without remounting business state; stable LTR/RTL theme/cache lifetimes, distinct insertion keys and reviewed order; Arabic first paint/deep link and repeated switches specified; shell gutter/anchor/motion kept coherent; ordinary/local-island portal boundaries defined; future test matrix and allowed paths list complete. No unknown pipeline is called compatible without evidence. Stop after contract/test-plan review.

Future implementation regression gates, subject to approval: all 120 scanner/four application/20 Playwright checks, six English zero-pixel snapshots and hashes, 68 documentary bytes, compiler/lint/build checks. Add reviewed runtime probes for root/theme/cache agreement, five en→ar→en cycles, populated form/menu/dialog open while switching, no data loss/remount, both apps/routes, insertion-tag duplication/order, visible mobile table/drawer, portal focus and cache exceptions. Verify the existing 6px/7px logical gaps remain correct. Keep new Arabic after assertions/captures separate; never update historical English evidence to hide a regression. New tests are proposals, not created here.

Stop conditions: incompatible dependency/plugin semantics; no proven shell isolation; English pixel delta; state loss; ambiguous styling owner; stale pins without review; policy conflict; unsupported cache analysis; scope expansion. A future design must explicitly plan how scanner complete=false/exit2 limitations are reported, rather than treating runtime presence as proof of processing. Any scanner-coverage remedy needs its own approval before implementation.

Rollback: design-only stage has no runtime to undo. Future production changes should be one reviewable commit or small dependency-preserving commits with a recorded precondition manifest; revert only the exact migration patch/commit after review, never reset/stash/discard unrelated work. Explicit before/after branch/port isolation and unchanged protected artifacts make comparison reversible. Codemod transaction/rollback and idempotency belong to 4F, not this stage.

## Before/After demonstration workflow

Canonical pre-pilot Before: 05138f1c5f68db92bcd94afe11e63fd83322f8cb. Current post-pilot: 85f4dde02142f305b434c815a39015a4c5eaafec. Full Phase 2A historical source/evidence checkpoint remains 61491d7f6dd359033c4a9e80b556d3b3e2446305. They answer different questions: original broken demo versus exact pre-two-margin state versus incremental pilot result.

Separate detached worktree(s) outside tracked source would be useful for reproducible comparisons after explicit authorization. Serve Before on unused ports such as 4300/4301 and current After on 4200/4201; review cross-app hardcoded-origin links/port settings before promising cross-app parity. Keep isolated browser storage and identical fixture/browser/font/viewport settings. Preserve default English and ?demo=unmigrated-rtl&lang=ar paths at each revision; no concurrent listeners on the same ports. No worktree or servers were created in this planning stage.

Use existing docs/screenshots/phase-2a/index.html and manifest.json as documentary history, not Arabic correctness goldens. The 68 PNGs are not regenerated. Capture future approved after states into a separate phase location. Video sequence: English baseline → historical broken Arabic → scanner risk/review distinction → two-spacing pilot → later reviewed runtime/component slices → English regression proof. Do not claim updated live demo still exhibits the two removed spacing risks or that the pilot resolves all nine issue families.

## Verification coverage and future gates

Verified .github/workflows/ci.yml runs npm ci, lint, app typecheck/build/unit tests and Playwright on macOS, uploading reports. It does not explicitly run rtl:scan:test/typecheck/build or enforce scanner exits/hash manifests. No new CI gate is enabled. Hosted results were not fetched and no current hosted success is claimed. Local closure previously passed 120 scanner/four unit/20 browser tests; this planning stage reran scanner tests only, not app build/browser checks (no servers authorized).

Existing tests protect English exact screenshot states, core app navigation/data workflows, demo query/root direction/portals and desktop/mobile routes. Scanner fixtures cover extraction, strict policy, stale/fail-closed, read-only and deterministic output. Live tests now intentionally compare the approved 56-ID set to pinned historical IDs minus two; future approved changes require an explicit expected-delta review. Missing safeguards for runtime cache correctness, arbitrary glyph/caret layout and new Arabic correctness baselines must be proposed and reviewed separately. There is no transformation engine, so no current codemod-idempotency test exists; 4F must define dry-run no-write, allowlist/pin refusal, deterministic diff, atomic apply and second-run no-op tests.

Suggested remaining sequence: authorize 4D.1 contract design → separately approved cache-coverage/compatibility validation where necessary → narrow 4D runtime implementation with shell preservation → individual 4E shell/control/chart/icon/bidi/brand slices after remeasurement → 4F controlled codemod expansion only after semantic/ownership approval. KPI-note spacing stays deferred. Do not collapse these gates into one bulk RTL rewrite.

## Final verification and inventory

Fresh direct scan: complete=true, expected 419/56 counts, no policy diagnostics. Fresh scanner suite: 120 passed. Six English baseline hashes matched. All 68 documentary PNGs and tracked historical screenshot/manifest/gallery files remain byte-identical to HEAD. Archived Stage 3 JSON/Markdown and all other tracked files remain unchanged. git diff --check passed; staging empty.

Exact file-change inventory: **docs/phase-4c3-roadmap-review.md only**, newly added. No CSS/application/scanner/policy/test/dependency/report/evidence changes, no worktree, no server start, no commit/push and no implementation stage started. Final recommendation **APPROVE WITH CONDITIONS** for the next design direction; wait for explicit authorization before 4D.1 or any implementation.
