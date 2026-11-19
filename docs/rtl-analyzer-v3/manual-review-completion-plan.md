# استكمال مسارَي RTL Analyzer — عقد التنفيذ الحالي

تاريخ متابعة التحقق: 2026-11-19. المتابعة الحالية هي واجهة review workspace والتحقق الشفاف المعتمدان، مع الحفاظ على تحضير Before/After تلقائيًا واستعادة المرشح بعد reload وrollback/rescan؛ إصلاح source-to-preview binding السابق ونتائج Master expansion محفوظان؛ عقد العائلات السبع ودورة المراجعة محفوظان بعد اكتمال CSS spacing وإصلاح سياق Apply/rollback؛ لا release؛ تعديل الواجهة الحالي محدود بالعقد المعتمد أدناه. قسم fullscreen أدناه سجل المتابعة السابقة. طلب استكمال المسارين السابق supersedes نطاق المعاينة القديم فقط. الأقسام التاريخية أدناه تحفظ أدلتها وحدودها السابقة؛ استبعاد Apply First وتوقف العمل قبل القرارات فيها لم يعدا تعليمات التنفيذ الحالية.

| Task ID | المطلوب الحالي / acceptance | checkpoint |
|---|---|---|
| 0 / S1 | هوية scan/dashboard/Companion/root متطابقة؛ تحليل read-only؛ inventory من scanner وcodemod الفعلي | PASS: backend يعيد المسح ويطابق input/policy/root؛ inventory حقيقية |
| 2 / S2 | جلسة متعددة الملفات والـ patches؛ ranges أصلية؛ إعادة تركيب عند الرفض؛ duplicate/retry آمنان | PASS: ranges أصلية، recomposition، serialized snapshots وpersisted sessions |
| 3 / M1 | One by One: اقتراح حقيقي، مرشح معزول تلقائي للموقع المؤهل ذي mapping محققة؛ accept/reject/defer/flag محفوظة بعد reload/restart | PASS ضمن inventory المدعومة |
| B1 | Apply First: تنفيذ supported eligible فقط بعد البدء؛ inventory كاملة وأسباب blocked | PASS: batch صريح يطبق eligible فقط؛ Pending لا تعني Accepted |
| 1E / P1 | تضمين route حقيقي حيث توجد mapping؛ اتجاه/viewport/Expand وهوية آمنة | PASS: iframe DOM + directions/viewports/Expand + root/session/hash handshake |
| 4 / V1 | تحقق accepted candidate بأوامر المشروع المتاحة وscanner وruntime؛ unavailable ليست Passed | PASS: accepted-only candidate؛ أوامر typecheck/build/test الأصلية وscanner وruntime |
| 4 / A1 | apply نهائي صريح للمقبول فقط، فحص hashes/identity، backups/audit وrollback scoped يحمي user edits | PASS: multi-file journal/backups، freshness guards وscoped rollback |
| 5 / QA | متصفح فعلي على disposable targets متعددة الملفات والتغييرات؛ جميع checks المطلوبة | PASS: 5/5 browser acceptance؛ الأدلة النهائية أدناه |

قبول Ahmed الشخصي: [ ] One by One، [ ] Apply First، [ ] التطبيق والاسترجاع. لا تُعلّم هذه البنود بواسطة agent.

التنفيذ الحالي يحافظ على تصميم dashboard، ويعيد استخدام scanner/codemod وcandidate/runtime وcontrolled apply. لا تعديل لمصدر Ahmed المستهدف ولا أصول الفيديو. الاختبارات والـ apply/rollback على fixtures مؤقتة فقط.

## Three-column completion — verified 2026-11-19

CONTINUE. Before edits: [real HTTP capture](../../test-results/review-three-column-20261119/before.png), [measured bounds](../../test-results/review-three-column-20261119/before-bounds.json), 1600 × 1000. Existing work and approvals preserved; Ahmed acceptance [ ].

| Area | Current implementation | Design gap | Required change |
|---|---|---|---|
| Duplicated navigation | Header plus workspace Navigation | Redundant column and rail | Remove workspace navigation, preserve global destinations |
| Column sizing | Four columns, review loses 180px | Review cramped; collapse combinations conflict | Three named panes, independent bounded sidebar widths |
| Session toolbar | Sticky with accepted count and menu | Mode only in tooltip; verbose zero action | Visible mode, concise disabled action |
| Source and Details | Bounded exact source and compact disclosure | Verify hierarchy with recovered width | Retain exact content and compact reasoning |
| Code comparison | Real balanced diff and semantic disclosure | Verify readable width and complete explanation | Preserve actual proposal and accessible overflow |
| Preview controls / metadata | Real frames, concatenated status text | Long combined headings compete with targets | Separate compact badges, aligned controls |
| Decision | Exact selection and notes | Actual status lacks badge shape | Compact actual decision badge |
| Review details | Segmented modal, SVG tabs, connected timeline | Recheck spacing / timestamps against reference B | Preserve read-only evidence and bounded scroll |
| Responsive | Old positional column selectors | Sidebar visibility tied to removed column | Named panes, no blank rails, measured narrow layout |

### Three-column implementation and final verification

The workspace now creates only named Explorer, Findings and Review panes. The global header retains its existing enabled Code Explorer and four disabled Coming soon destinations; no new destinations were invented. Navigation markup, collapse button, rail and positional grid selectors are removed. Explorer and Findings use independent width variables (210 / 230px desktop, bounded at smaller widths); both may collapse together to 32px. Current source has no persisted collapse preference keys: obsolete navigation/focus state was transient DOM state, and rebuilding on reload cannot recreate its column. Legacy `panel-nav-collapsed` has no styling or handler.

At 1600 × 1000 the review pane grows **951 → 1132px**; both sidebars collapsed yield **1508px**. The finding title and actual path/location precede the slim sticky toolbar. Visible mode, concise disabled zero-selection action, source highlight, neutral unvalidated live frames, distinct state badges, target/fullscreen alignment, unobtrusive healthy Retry and actual Decision badge refine the reference hierarchy. Full source, diff, semantic limitations and diagnostics remain accessible. Technical identities have Copy controls, with selectable text fallback if the browser denies clipboard access. No new observer or backend policy was introduced in this continuation.

Files edited in this continuation: `dashboard-client.ts`, `dashboard-html.ts`, `dashboard-review-workflow.ts`, `dashboard-embedded-preview.ts`, `dashboard-contextual-preview.ts`, `dashboard-review-details.ts` under `tools/rtl-scanner/src/`; focused assertions in `tests/e2e/review-workspace.spec.ts`; this plan and affected project-memory summaries. Other dirty/untracked files predate this continuation and remain preserved.

Final evidence and acceptance results are recorded below after the live verification gate. Earlier failed generated-CSS quoting run is retained in `test-results/review-three-column-20261119/workspace.log`; its corrected complete rerun is `workspace-rerun.log`. The intermediate desktop capture taken while tests were applying source is diagnostic only, not acceptance evidence.

### Final three-column results and acceptance evidence

**Scoped implementation and automated verification complete; Ahmed acceptance [ ].** This section supersedes the earlier four-column visual follow-up. No exact pixel-parity claim is made.

| Area | Final implementation / design comparison |
|---|---|
| Navigation and columns | Three actual panes; duplicate Navigation removed entirely; global header behavior preserved; 181px recovered for review |
| Toolbar | Heading above sticky toolbar above source; visible mode/count/status, Details, one next action and top-layer overflow; zero accepted uses disabled “Validate changes” |
| Source and Details | Actual title/path/location, exact purple highlighted range, bounded source with horizontal scrolling; concise badges and collapsed full reasoning |
| Code comparison | Exact proposal retained, balanced cards and semantic disclosure; complete explanation available when expanded |
| Preview controls and metadata | Real matched route/data/direction/viewport; short headings, separate actual badges, aligned target and fullscreen buttons; neutral normal frames, diagnostic details collapsed, failures remain actionable |
| Decision | Actual decision pill; only the actual selected action pressed; notes and candidate inclusion remain; session controls stay above source |
| Review details | Consistent icons, lightweight tabs, compact cards, connected timestamped history; actual limited results and source receipts remain separate; Technical Copy verified |
| Responsive | Independent Explorer/Findings collapse/restore together; legacy navigation class inert after reload; stacked bounded mobile panes, unclipped menu and contained dialog |

Measured final gate: Explorer **210px**, Findings **230px**, review **1132px** (previously **951px**); review **1508px** with both sidebars collapsed. Sticky toolbar top **0px** after scrolling; desktop menu **238 × 87px**, inside viewport. At 480 × 720, document width **480px**, Decision bottom inside workspace. No browser errors or POST requests during the read-only final gate; source hashes unchanged; iframe identities survive dialog/fullscreen. Clipboard read-back matches the copied review identity. Both current workflows: Reviewing, all Pending, 0 accepted, Not run; recorded historical Limited validation does not validate either current review.

| Command / suite | Final result |
|---|---|
| `RTL_WORKSPACE_OUTPUT_PREFIX=test-results/review-three-column-20261119/rerun node tests/e2e/run-review-workspace.mjs` | PASS 14 distinct cases: full 10, limited 2, failed 1, none 1 |
| `RTL_REVIEW_SPECS=tests/e2e/review-workflows-complete.spec.ts node tests/e2e/run-review-workflows.mjs` | PASS 5 core cases; workflow-core.log |
| `RTL_EXPANSION_FIXTURE=1 RTL_REVIEW_SPECS=tests/e2e/automatic-before-details.spec.ts,tests/e2e/fullscreen-review-preview.spec.ts,tests/e2e/post-apply-context.spec.ts,tests/e2e/rollback-review-resumption.spec.ts node tests/e2e/run-review-workflows.mjs` | 5 passed; fullscreen failed only on new badge capitalization; retained preview-lifecycle.log |
| `RTL_EXPANSION_FIXTURE=1 RTL_REVIEW_SPECS=tests/e2e/fullscreen-review-preview.spec.ts node tests/e2e/run-review-workflows.mjs` | PASS after consistent “Validation: Not run” badge wording; fullscreen-rerun.log. All 6 distinct lifecycle cases now pass |
| `RTL_MANUAL_ENVIRONMENT=<JJpbIr/environment.json> RTL_VALIDATION_SCENARIO=limited npx playwright test --config=playwright.manual-preview.config.ts tests/e2e/review-workspace.spec.ts --output=test-results/review-three-column-20261119/final-focused` | PASS 2 final served-build mode reruns |
| `node test-results/review-three-column-20261119/inspect-final.cjs <JJpbIr/environment.json> test-results/review-three-column-20261119/artifacts` | PASS actual HTTP/source/layout/clipboard/frame gate |
| `npm run rtl:scan:test` | PASS 386/386, 30 files, including final source rerun |
| `npm run rtl:scan:typecheck` / `npm run rtl:scan:build` | PASS |
| `npm run typecheck` / `npm run build` | PASS; build 3 tasks, 2 cached |
| `git diff --check` | PASS |
| `python3 docs/project-memory/validate.py` | Existing baseline missing-link failure: 47 required and 6 optional missing historical links; final scan has 46 freshness advisories and one undated index entry; no historical artifacts regenerated |

Total: **25 distinct passing browser cases**, plus two final served-build reruns and the read-only final gate. Failed earlier attempts are retained, not counted as passing. The generated-CSS quoting error was corrected before the complete scenario rerun. Final dashboard regeneration initially refused an existing output (EEXIST) and then a nonexistent output directory; the original output was preserved and the final fresh directory created explicitly before successful generation. No target source edits were needed for presentation.

All logs and measurements: `test-results/review-three-column-20261119/`. Broader traces: `test-results/review-workflows-2026-11-18T23-58-11.377Z` (core), `test-results/review-workflows-2026-11-19T00-04-42.543Z` (lifecycle), `test-results/review-workflows-2026-11-19T00-07-28.302Z` (fullscreen passing rerun).

Real screenshots, desktop 1600 × 1000 and narrow 480 × 720 (the corresponding workflow test narrow modal uses its recorded viewport):

- [Full three-column workspace / toolbar above source](../../test-results/review-three-column-20261119/artifacts/desktop-top.png)
- [Live previews and compact Decision](../../test-results/review-three-column-20261119/artifacts/live-previews.png)
- [Sticky toolbar and open menu](../../test-results/review-three-column-20261119/artifacts/sticky-menu.png)
- [Activity modal](../../test-results/review-three-column-20261119/artifacts/activity.png)
- [Current Limited Validation](../../test-results/review-three-column-20261119/final-focused/review-workspace-limited-o-41b95-ation-and-read-only-details/details-validation.png)
- [Applied historical evidence](../../test-results/review-three-column-20261119/final-focused/review-workspace-limited-o-41b95-ation-and-read-only-details/history-applied.png)
- [Rolled-back history and timeline](../../test-results/review-three-column-20261119/artifacts/history.png)
- [Historical Limited Validation](../../test-results/review-three-column-20261119/artifacts/history-validation.png)
- [Narrow layout](../../test-results/review-three-column-20261119/artifacts/narrow-full.png)
- [Narrow menu](../../test-results/review-three-column-20261119/artifacts/narrow-menu.png)
- [Both sidebars collapsed](../../test-results/review-three-column-20261119/artifacts/collapsed-both.png)
- [Sidebars restored](../../test-results/review-three-column-20261119/artifacts/restored.png)
- [Fullscreen](../../test-results/review-three-column-20261119/artifacts/fullscreen.png)
- [Expanded semantic considerations](../../test-results/review-three-column-20261119/artifacts/semantic-expanded.png)
- [Measured/source gate](../../test-results/review-three-column-20261119/artifacts/delivery-gate.json)

Direct comparison with approved references A/B/C: the three-column composition, hierarchy, purple action/highlight language, compact cards and segmented/underline modal now follow the concepts. Remaining intentional differences: existing global branding/search/workspace/statistics occupy additional header space; live previews render the full real `/people` route and real fixture data rather than cropped illustrative contacts/invoices; utility text remains compact within the existing dashboard typography; actual minified source stays one horizontally scrollable line; the modal includes a history picker and every real event/check, so longer histories and validation use bounded internal scrolling and more height than the four-event concept. The history picker retains a short identity suffix to distinguish real records sharing a timestamp; full identities remain in Technical. Code removal styling remains distinct from validation status. Automatic preparation replaces the concept’s manual preparation gate, and both frames use the same direction as explicitly required. There is no permanent Review details sidebar or presentation annotations. These are recorded deviations, not claims of exact parity.

Working dashboard: [open current disposable review](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30). Final target **JJpbIr**, own npm dependencies; environment `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-JJpbIr/environment.json`; supervisor **85819**, Companion **85821**, HTTP **85852**. Source-write tests used disposable targets only. Previous P2Ia3Q supervisor 71427 and children were verified before normal SIGTERM; its files/history remain. Recheck process command/root ownership before stopping current services. No push, merge, deploy, publish, packaging restructure or active-project source write.

Ahmed’s English acceptance checklist (left unchecked):

- [ ] Review the three-column desktop layout; collapse and restore Explorer and Findings, then reload.
- [ ] Try both review modes; confirm automatic matched Before/After, route/direction/viewport/target and fullscreen controls.
- [ ] Check decisions, notes, keyboard menu, sticky scrolling and narrow layout.
- [ ] Inspect Activity, Limited Validation, exact Changes and Technical; close restores focus and previews.
- [ ] On the disposable target only, validate accepted changes, explicitly Apply and Rollback; confirm fresh Pending / Not run and separate historical evidence.

## Visual parity follow-up — 2026-11-19

Session Guard **CONTINUE**. Baseline captured from the running HTTP dashboard at 1600 × 1000 before source edits: [workspace](../../test-results/review-visual-20261119/before-workspace.png), [details](../../test-results/review-visual-20261119/before-details.png). The sample contains real fixture data, not reference-image values. Ahmed manual acceptance remains [ ].

| Area | Current visual issue | Intended change |
|---|---|---|
| Session toolbar | Below source, 85px tall, exposes ID and routine policy row | Slim sticky toolbar before source, concise actual state |
| Source | 150px fixed editor leaves whitespace for short files | Bound height to useful content while retaining scrolling |
| Details and code | Reasoning and comparison compete with workspace | Compact explanation, badges and balanced code cards |
| Live previews | Long state headings and visible technical paragraphs; green candidate frame before validation | Short headings and badges, collapsed diagnostics, neutral unvalidated frame |
| Decision | Multiple purple actions and generous vertical space | Compact controls with actual selected state |
| Review details | Plain context buttons and timeline, no summary card or footer | Segmented context, underlined tabs, summary and structured timeline, bounded content-sized modal |

### Visual follow-up checkpoint — verified 2026-11-19

Historical checkpoint; the completed scoped follow-up below supersedes its incomplete status. Ahmed's acceptance state is unchanged.

Partial implementation: the toolbar is before source and measured 41px tall / sticky at viewport top; source height fits the displayed short fixture; selected decisions use `aria-pressed`; preview verification details are collapsed on success; the dialog has a segmented switch, summary card, footer and compact checks. Limited-validation lifecycle browser cases passed for both modes on the final disposable target, including Apply/rollback, read-only history, focus and viewport measurements. Screenshots and logs are in `test-results/review-visual-20261119/`. Scanner: 386/386; scanner and project typechecks, scanner and project builds, and `git diff --check` passed. Memory validator still reports the historical 47 missing required links. Earlier failed browser attempts were retained; later two-case rerun passed.

This follow-up remains **incomplete**: broader existing preview/fullscreen and workflow regression suites were not rerun after these edits; the overflow menu, compact semantic caveats, modal icon/timeline details, and desktop/narrow visual parity still need refinement and complete verification against the concepts. Ahmed manual acceptance [ ]. No claim of final visual acceptance is made. The live disposable target is `rtl-independent-onboarding-0aF3Si`, supervisor 52967; recheck ownership before stopping it. Prior target `2SuFYO` was stopped normally and preserved.

### Scoped visual completion — verified 2026-11-19

**Scoped implementation and verification complete; Ahmed manual acceptance [ ].** This section supersedes the incomplete status at the historical checkpoint above. Session Guard **CONTINUE**. Current local changes and the three supplied approved references were preserved. Reference A governs the workspace hierarchy; reference B governs the modal; reference C supplies workflow relationships. No backend validation/Apply policy or packaging change was made in this continuation.

| Outstanding area | Final change and verification |
|---|---|
| Session overflow | Floating native top-layer popover anchored to More; stays outside ancestor clipping without increasing toolbar height. Keyboard arrows/Home/End, Enter, Escape, Tab and outside-click dismissal; correct menu roles/expanded state; open state and focus survive a real delayed notes-save response. Position is clamped/flipped within viewport and updated on scrolling/resizing. Secondary actions retain confirmations and existing eligibility. |
| Semantic caveat | Short current candidate status, followed by collapsed **Review considerations**. The exact persisted explanation is accessible when expanded. Disclosure state survives workflow rendering. Duplicate rationale text in expanded Details is removed without discarding other reasoning. Actual failures remain visible. |
| Review details | One consistent SVG stroke icon set; compact segmented context switch and underline tabs; selected-review summary and actual lifecycle badge; connected event timeline with status-scoped colors; local timestamps with exact local/ISO values on demand; content-sized modal, internal scrolling, accessible header/footer, read-only View changes and Close. Limited validation remains amber and coverage Unknown. |
| Responsive/scrolling | Long real source lines scroll horizontally without rewriting source. A min-content sizing bug exposed by that change is contained at the app/workspace/source boundaries. Narrow review panes grow with content and previews stack; consolidated header row sizing and two-column narrow statistics prevent overlap. Bounds assertions check actual toolbar, menu, source, shell, preview/Decision containment and page width. |

**Exact continuation file list.** Production: `tools/rtl-scanner/src/dashboard-review-workflow.ts`, `dashboard-review-details.ts`, `dashboard-client.ts`, `dashboard-html.ts`, and `dashboard-embedded-preview.ts` (the latter four use the same directory). Tests: `tests/e2e/enter-review.ts`, `run-review-workspace.mjs`, `review-workspace.spec.ts`, `automatic-after.spec.ts`, `automatic-before-details.spec.ts`, `contextual-review-preview.spec.ts`, `css-spacing-workflows.spec.ts`, `directional-expansion-workflows.spec.ts`, `fullscreen-review-preview.spec.ts`, `independent-expansion.spec.ts`, `independent-onboarding.spec.ts`, `post-apply-context.spec.ts`, `preview-binding.spec.ts`, `preview-ui-reproduce.spec.ts`, `preview-ui-state.spec.ts`, `review-workflows-complete.spec.ts`, and `rollback-review-resumption.spec.ts` (all share the same test directory). Documentation: this plan, `docs/project-memory/ARCHITECTURE-MAP.md`, and `docs/project-memory/HANDOFF.md`. Existing dirty/untracked backend files, previous tests, and `video-assets/` were retained. Test-only label assertions follow the compact heading/status split and accessible menu roles; source, identity, hash, history, and iframe-state assertions remain in place. The standalone runner accepts a test-output prefix so earlier evidence is preserved.

| Gate | Actual final result |
|---|---|
| Standalone browser scenarios: `RTL_WORKSPACE_OUTPUT_PREFIX=test-results/review-visual-completion-20261119/scenarios node tests/e2e/run-review-workspace.mjs` | **14/14 PASS**: 10 full-command preview/workspace cases, 2 limited cases, 1 real failed command, 1 unconfigured-command case. [Log](../../test-results/review-visual-completion-20261119/standalone.log). |
| Core: `RTL_REVIEW_SPECS=tests/e2e/review-workflows-complete.spec.ts node tests/e2e/run-review-workflows.mjs` | **5/5 PASS**, including both workflows, accepted-only Apply, stale-source/candidate protection, origin/identity/scope authorization, required unavailable/failed checks, rollback conflicts and partial-write recovery. [Final log](../../test-results/review-visual-completion-20261119/core-rerun.log). |
| Lifecycle: same runner with `RTL_EXPANSION_FIXTURE=1` and `automatic-before-details.spec.ts,fullscreen-review-preview.spec.ts,post-apply-context.spec.ts,rollback-review-resumption.spec.ts` | **6/6 PASS**: automatic original recovery, read-only details, direction/viewport/route controls, preserved iframe nodes/navigation/input state, post-Apply source reconciliation, delayed pre-rollback response and failed-rescan recovery, fresh Pending/Not run reviews in both modes. [Final log](../../test-results/review-visual-completion-20261119/lifecycle-final.log). |
| Final delivery fixture: `RTL_MANUAL_ENVIRONMENT=…/rtl-independent-onboarding-P2Ia3Q/environment.json RTL_VALIDATION_SCENARIO=limited npx playwright test --config=playwright.manual-preview.config.ts tests/e2e/review-workspace.spec.ts --output=test-results/review-visual-completion-20261119/delivery-complete` | **2/2 focused reruns PASS after the final responsive fixes**, including actual pane/header/menu bounds, scrollable source, one-copy rationale and caveat, notes-save focus/menu preservation, selected decision, read-only dialog/focus, limited accepted-only Apply and protected rollback. [Log](../../test-results/review-visual-completion-20261119/delivery-browser-complete.log). |
| Final HTTP/browser/source inspection | **PASS**: sticky toolbar at top 0; menu in viewport; 480px page/viewport; no overlapping header/statistics/scope; Decision inside its pane/workspace; sidebar collapse/restore; 1600×1000 fullscreen; iframe nodes survive dialog/fullscreen; zero page errors and zero POSTs during read-only inspection; source hashes unchanged; both modes Pending/0 accepted/Not run. [Gate JSON](../../test-results/review-visual-completion-20261119/artifacts-final/delivery-gate.json), [inspection script](../../test-results/review-visual-completion-20261119/inspect-delivery.cjs), [log](../../test-results/review-visual-completion-20261119/http-browser-final.log). |
| `npm run rtl:scan:typecheck` / `npm run rtl:scan:build` | **PASS** on the final scanner/UI source. [Typecheck](../../test-results/review-visual-completion-20261119/scanner-typecheck-final.log), [build](../../test-results/review-visual-completion-20261119/scanner-build-final.log). |
| `npm run typecheck` / `npm run build` | **PASS**; application build: 3 tasks succeeded, 2 cached. [Typecheck](../../test-results/review-visual-completion-20261119/typecheck-final.log), [application build](../../test-results/review-visual-completion-20261119/build.log). |
| `npm run rtl:scan:test` | **386/386 tests, 30/30 files PASS**. [Log](../../test-results/review-visual-completion-20261119/scanner-final.log). |
| `git diff --check` | **PASS**. No changes under application/library source; no push, merge, publication or deployment. |
| Project-memory validator | **47 preexisting missing required historical asset links** remain; advisories reviewed, no historical assets regenerated or moved. [Log](../../test-results/review-visual-completion-20261119/memory-final.log). |

The passing total is **25 distinct browser cases plus two final delivery reruns**, followed by the read-only live inspection. Earlier failed/interrupted attempts are retained and excluded from passing counts. The core helper initially expected a mode name inside the accepted-count label; lifecycle assertions expected context/candidate state inside the former long heading/paragraph. They now verify the actual mode tooltip or status badge. A failed post-Apply assertion left its fixture Applied and caused the next rollback case to start with historical state; the entire group was rerun on fresh fixtures. Visual inspection additionally found real narrow-pane clipping, intrinsic-width expansion, and header/statistics overlap; these were fixed and covered by measured bounds before the final delivery run.

#### Final real-browser screenshots and reference comparison

Desktop viewport is **1600×1000** for checkpoint and final viewport screenshots. Narrow viewport is **480×720**. All screenshots are from the real HTTP dashboard and live disposable applications. Full-page captures may span beyond that viewport; use the viewport captures to inspect live iframe paint.

| Required state | Real screenshot |
|---|---|
| Checkpoint before the final changes | [Workspace](../../test-results/review-visual-completion-20261119/checkpoint-workspace.png), [Activity](../../test-results/review-visual-completion-20261119/checkpoint-activity.png) |
| Full workspace at top: toolbar before source | [Desktop top](../../test-results/review-visual-completion-20261119/artifacts-final/desktop-top.png), [full-page workspace](../../test-results/review-visual-completion-20261119/artifacts-final/desktop-full.png) |
| Scrolled workspace and floating menu | [Sticky toolbar/menu](../../test-results/review-visual-completion-20261119/artifacts-final/sticky-menu.png) |
| Compact finding Decision | [Decision](../../test-results/review-visual-completion-20261119/artifacts-final/decision.png) |
| Full semantic-review explanation | [Expanded review considerations](../../test-results/review-visual-completion-20261119/artifacts-final/semantic-expanded.png) |
| Review details → Activity | [Current activity](../../test-results/review-visual-completion-20261119/artifacts-final/activity.png) |
| Review details → Validation with limited checks | [Current accepted candidate / limited checks](../../test-results/review-visual-completion-20261119/delivery-complete/review-workspace-limited-o-41b95-ation-and-read-only-details/details-validation.png) |
| History after Apply and rollback | [After Apply](../../test-results/review-visual-completion-20261119/delivery-complete/review-workspace-limited-o-41b95-ation-and-read-only-details/history-applied.png), [after rollback](../../test-results/review-visual-completion-20261119/artifacts-final/history.png) |
| Narrow window | [Menu and main pane](../../test-results/review-visual-completion-20261119/artifacts-final/narrow-menu.png), [actual live previews](../../test-results/review-visual-completion-20261119/artifacts-final/narrow-preview-before.png), [reachable Decision](../../test-results/review-visual-completion-20261119/artifacts-final/narrow-decision.png), [narrow dialog](../../test-results/review-visual-completion-20261119/delivery-complete/review-workspace-limited-o-41b95-ation-and-read-only-details/narrow-dialog.png) |
| Preserved fullscreen application | [Fullscreen](../../test-results/review-visual-completion-20261119/artifacts-final/fullscreen.png) |

Direct comparison with the supplied images confirms the intended ordering, slim session controls, collapsed reasoning, navy/violet palette, segmented context, light icon tabs, summary/notice/timeline/footer hierarchy and neutral unvalidated candidate. **Exact pixel parity is not claimed.** Remaining intentional differences are: existing global navigation/statistics and dashboard typography are retained; live previews show the actual mapped application route rather than the illustration's cropped people card; real histories can contain more events and a historical-record selector, so modal height/scrolling follows content; narrow controls wrap and previews stack. Automatic preparation, same direction/data for Before and After, and honest amber limited-validation results follow the explicit requirements over illustrative reference states. No sample people/files/counts/times/results were copied into product state.

#### Live delivery and Ahmed's acceptance

[Open or refresh the final dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30). Current target: **Field Notes synthetic standalone integration fixture P2Ia3Q**, with its own npm install. Environment: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-P2Ia3Q/environment.json`; supervisor **71427**, Companion **71449**, HTTP **71480** at verification. Recheck ownership before signaling any process. Both modes were left Pending / zero acceptances / validation Not run after source-restoring rollback; historical limited results remain separate. Prior targets and their evidence were retained, with normal owned-runtime shutdown where needed. No active-project source-write test was used.

Short English acceptance checklist — leave every item for Ahmed:

- [ ] Review both modes; check toolbar/menu keyboard behavior and sticky/narrow layout.
- [ ] Expand review considerations; confirm notes and selected decisions remain clear.
- [ ] Inspect live Before/After, route/direction/viewport/target controls and fullscreen.
- [ ] Review Activity, limited Validation, Changes and Technical/history; exercise confirmed Apply/rollback only on the disposable target.

## Approved review workspace and transparent validation — 2026-11-18

Session Guard **CONTINUE**: explicitly approved handoff. Current local source is authoritative; backup commit is reference only. Ahmed manual acceptance [ ]. This section supersedes the earlier presentation boundaries only; historical evidence and approvals remain unchanged.

### Inspected contract before implementation

| Requested behavior | Existing implementation | Required change |
|---|---|---|
| Session toolbar | `dashboard-review-workflow.ts` appends details/validate/Apply/rollback below Decision | Move session operations to sticky review-pane toolbar, accepted count and one lifecycle action; recovery overflow |
| Finding Decision | Persisted choices/notes, automatic preview status mixed with session operations | Keep choices/notes/status; put Retry and reconsider controls beside preview |
| Details dialog | `dashboard-review-details.ts` read-only snapshots, native dialog/focus trap, four tabs; fixed 720px height | Content height, underline/icon tabs, timeline/fields, real command evidence and selectable historical records |
| Preview lifecycle | Context renderer verifies original identity/targets; embedded renderer handles direction/viewport/fullscreen; coordinator serializes automatic candidate preparation | Preserve guards and lifecycle; no normal Prepare click, single failure Retry |
| Validation configuration/execution | Independent project declares check args; Nx fallback package scripts; real accepted-only candidate commands, scanner and runtime, persisted signature/hashes | Expose configuration before execution; distinguish Not configured/Not run/exclusions/start errors; accurate limited summary and Unknown coverage |
| Source Apply eligibility | `validate()` excludes missing project commands from required checks; required scanner/runtime failure/unavailability blocks; `apply()` requires Passed and matching accepted signature, source/config/candidate hashes, explicit confirmation, receipts/backups | Preserve policy, show exact limitations/reasons; no missing command becomes Passed |
| History | A prior rollback snapshot passed to dialog; source reconciliation keeps historical validation/decisions separate | Read-only history inventory and selector; historical state never enables current actions |

### Implementation and policy verified 2026-11-18

Production files changed:

- [`dashboard-review-workflow.ts`](../../tools/rtl-scanner/src/dashboard-review-workflow.ts): sticky session toolbar with readable workflow identity, accepted count, honest validation summary, Review details, one lifecycle primary action/progress lock, and recovery overflow. Decision retains only choices, notes and selected-finding status. Retry/reconsider controls belong to live previews.
- [`dashboard-review-details.ts`](../../tools/rtl-scanner/src/dashboard-review-details.ts): content-sized native dialog (`fit-content`, viewport cap/internal scroll), compact context controls and icon/underline tabs, structured timeline, real validation commands/scopes/logs, actual inventory/diffs, readable identity fields and expandable diagnostics/receipts/backups. History selector uses persisted records, defaults to the current review's predecessor, and remains read-only. Focus restoration also handles an opener replaced by an asynchronous validation result.
- [`dashboard-embedded-preview.ts`](../../tools/rtl-scanner/src/dashboard-embedded-preview.ts): a single Retry beside failed After, reconsider beside an explicitly excluded preview, neutral unavailable/code-suggestion styling, and honest validation labels in the existing fullscreen/preview lifecycle. No normal Prepare candidate click is introduced. Contextual target binding, matching direction/viewport/route/data and identity checks remain in the existing contextual renderer.
- [`workflow-validation.ts`](../../tools/rtl-scanner/src/workflow-validation.ts), [`review-workflow.ts`](../../tools/rtl-scanner/src/review-workflow.ts): protected-baseline command configuration before execution; distinct Not run, Not configured, explicit Not applicable, Passed, Failed and Error/Unavailable records; command arguments and scope persisted with actual results; separate scanner/runtime evidence; limited/no-command summaries and Unknown change coverage. A matching Passed label without required command/scanner/runtime/hash evidence fails closed. Rollback now records its actual completion timestamp; older absent timestamps are not invented.
- [`project-configuration.ts`](../../tools/rtl-scanner/src/project-configuration.ts): optional `validationExclusions: {"typecheck":"owner's explicit reason"}` for explicit Not applicable. Only typecheck/build/test keys are admitted, reasons must be nonempty, and a check cannot have both a command and exclusion. This protected configuration cannot stand in for executed checks.
- [`preview-companion.ts`](../../tools/rtl-scanner/src/preview-companion.ts): serialized read-only history snapshots. Explicit Start new review uses current scan identity and a separate baseline/session; prior decisions, notes, validation and candidate files remain historical. It stops only the prior owned runtime and marks the prior review superseded; historical decisions/validation/Apply are rejected. No approval is inherited.

**Apply policy:** unconfigured project commands were already excluded from required-check aggregation. That policy remains: after actual accepted-only validation, required scanner/runtime evidence and identity/hash checks may permit source Apply even when project commands are incomplete or entirely unconfigured. The UI then says **Limited validation** or **Technical validation unavailable**, never “all checks passed.” The internal persisted `validation.state: Passed` is the existing policy verdict; `validationPresentation` is the honest user-facing summary. Configured failures, execution errors, unavailable required runtime evidence, stale accepted signatures, source/config/candidate changes and incomplete execution/hash records block Apply. Explicit confirmation, accepted-only composition, ownership, receipts/backups, scoped rollback and source-edit conflict protections remain. Toolbar explains the snapshot's blocking reason; final Apply repeats source/candidate guards, so a later external edit can still block at execution.

Scanner `coverage.ts` classifies parser/source completeness; it is not test execution coverage. No matching source/candidate/test-run change-coverage evidence exists in this implementation, so coverage stays **Unknown**, including after passing tests. No coverage engine, inferred component coverage, test discovery claim or RTL visual-correctness proof was added.

### Verification and evidence

New behavioral regressions: [`review-workspace.spec.ts`](../../tests/e2e/review-workspace.spec.ts), [`workflow-validation.test.ts`](../../tools/rtl-scanner/tests/workflow-validation.test.ts), additional workflow/configuration guard cases, and [`run-review-workspace.mjs`](../../tests/e2e/run-review-workspace.mjs). The standalone generator has test-only full/limited/failing/no-command configuration variants. Existing test files updated: `automatic-after.spec.ts`, `automatic-before-details.spec.ts`, `css-spacing-workflows.spec.ts`, `directional-expansion-workflows.spec.ts`, `independent-expansion.spec.ts`, `independent-onboarding.spec.ts`, `post-apply-context.spec.ts`, `preview-ui-reproduce.spec.ts`, `preview-ui-state.spec.ts`, `review-workflows-complete.spec.ts`, and `rollback-review-resumption.spec.ts`. The existing `serve-independent-onboarding.mjs`, scanner `review-workflow.test.ts` and `project-configuration.test.ts` also changed. Documentation changes are this plan and memory `ARCHITECTURE-MAP.md` / `HANDOFF.md`. Existing workflow/lifecycle/details tests use the new count-bearing Apply label and recovery overflow; assertions for unavailable/failed Apply now require that no Apply primary action exists. No source/identity/security assertion was relaxed.

The standalone runner passed **14 Chromium cases**: six automatic preview/delay/retry/rollback cases, two target/UI lifecycle cases, both new full-validation workflows, both limited-validation workflows, one actual command failure, and one no-project-command workflow. Initial configured checks are Not run; notes/decisions survive reload, acceptance changes invalidate validation, source writes contain only accepted validated changes, and rollback restores original hashes and fresh Pending/Not run candidates. Dialog tabs/context/history selection/narrow layout are read-only; keyboard navigation and focus restoration also survive a live validation update. [Scenario log](../../test-results/review-workspace-audit/scenarios-final-05.log).

Real screenshots from the standalone HTTP app:

1. [Workspace, session toolbar and compact Decision](../../test-results/review-workspace-delivery/review-workspace-limited-o-41b95-ation-and-read-only-details/workspace-toolbar-decision.png)
2. [Review details → Activity, content-sized](../../test-results/review-workspace-delivery/review-workspace-limited-o-41b95-ation-and-read-only-details/details-activity.png)
3. [Review details → Validation, build only / limited checks](../../test-results/review-workspace-delivery/review-workspace-limited-o-41b95-ation-and-read-only-details/details-validation.png)
4. [History after Apply](../../test-results/review-workspace-delivery/review-workspace-limited-o-41b95-ation-and-read-only-details/history-applied.png) and [after rollback](../../test-results/review-workspace-delivery/review-workspace-limited-o-41b95-ation-and-read-only-details/history-rollback.png)

These are actual generated/tested results on the **new Field Notes integration target with synthetic people data**, installed outside this repository with its own npm dependencies. No existing real-world-project certification is implied. The earlier VaXLnk target was preserved before ownership-checked shutdown: [identity and pre-shutdown hashes](../../test-results/review-workspace-audit/preserved-environment.json), [preservation check](../../test-results/review-workspace-audit/prior-target-preservation.json). Its source and other state files are unchanged; the sole changed state file contains normal owned-runtime shutdown metadata. No historical target/candidate directory or video asset was removed.

Earlier exploratory gates remain logged. The first exposed History default selection and native-dialog stretching; both were corrected. A subsequent workspace test assumed zero approvals despite a preceding persisted workflow, then used a one-shot style read during asynchronous DOM replacement; the test now explicitly starts a fresh review and uses a retrying CSS assertion. The combined legacy run encountered fixture port 4202 contention after an earlier automatic preview, and its old apply-first test assumed no history despite existing records. Core tests are run on a separate fresh fixture; history assertions now compare the real read-only record inventory. These failures are retained as investigation evidence, not reported as passing gates.

### Final gates and live delivery — verified 2026-11-19

| Actual command / gate | Result |
|---|---|
| `npm run rtl:scan:typecheck` and `npm run typecheck` | PASS — both applicable TypeScript checks |
| `npm run rtl:scan:build` | PASS, including the final timestamp presentation adjustment |
| `npm run build` | PASS — 3 Nx tasks, 2 cached; [log](../../test-results/review-workspace-audit/builds-final-02.log) |
| `npm run rtl:scan:test` | PASS — **386 tests / 30 files**; [log](../../test-results/review-workspace-audit/scanner-final-06.log) |
| `node tests/e2e/run-review-workspace.mjs` | PASS — **14/14** actual Chromium cases across four command configurations; [final log](../../test-results/review-workspace-audit/scenarios-final-05.log) |
| `node tests/e2e/run-review-workflows.mjs` (core, fresh fixture) | PASS — **5/5**; [log](../../test-results/review-workspace-audit/core-isolated-final-02.log) |
| Same runner, `RTL_EXPANSION_FIXTURE=1`, details/fullscreen/post-Apply/rollback specs | PASS — **6/6**; [log](../../test-results/review-workspace-audit/lifecycle-final.log) |
| Focused `review-workspace.spec.ts --grep 'limited one-by-one'` on the delivery target | PASS — **1/1 rerun**, after making the rollback timestamp a separate line; [log](../../test-results/review-workspace-audit/delivery-browser.log) |
| Final live HTTP/browser/source/process gate | PASS — toolbar actually stays at `top: 0` after scrolling 494px; fullscreen 1600×1000; read-only dialog/history; no page errors; both modes Pending/Not run/0 accepted; source hashes match baseline; [gate](../../test-results/review-workspace-audit/final-gate.json) |
| `git diff --check` | PASS; no app/library source or historical asset changes |
| `python3 docs/project-memory/validate.py` | **FAIL: 47 preexisting missing required historical asset links**, 6 optional missing links; 45 freshness advisories and one undated index reviewed. [Log](../../test-results/review-workspace-audit/memory-validation-final.log), [HEAD comparison](../../test-results/review-workspace-audit/baseline-memory-links.json). The exact same 47 required references are missing at HEAD `21404360ed115fc81b83393f3941fa68a0181adc`; this task introduces **zero** missing required memory links. Historical assets were not moved/regenerated to silence the validator. |

The final total is **25 distinct passing browser cases**, plus one focused delivery rerun and a live HTTP inspection. The final scroll assertion exposed two preexisting incidental scroll containers (`workspace` and body overflow): scoped clip/visible overflow now lets the toolbar stick to the viewport while keeping inline fullscreen scroll locks effective. The rerun also checks overflow state during automatic preparation and session controls with no selected finding. Normal Start new review preserves the prior record and owned candidate files; it does not write source. Earlier interrupted/failed diagnostic runs remain logged and are excluded from passing totals.

Working URL: [Open the RTL Analyzer dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30).

Current target: **new standalone Field Notes integration target 2SuFYO**, synthetic people, own npm installation, at `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-2SuFYO/field-notes`. It deliberately configures **build only**: passing build is limited validation, tests/typecheck are Not configured, change coverage Unknown. Source is restored; current reviews have no inherited approval or validation. [Live workspace](../../test-results/review-workspace-audit/live-workspace.png), [actual sticky toolbar](../../test-results/review-workspace-audit/live-sticky-toolbar.png), [fullscreen](../../test-results/review-workspace-audit/live-fullscreen.png), [Activity](../../test-results/review-workspace-audit/live-activity.png), [visibly historical limited validation](../../test-results/review-workspace-audit/live-historical-validation.png).

Current services: supervisor **47169**, Companion **47256** on 4318, HTTP **47287** on 4320. Original and candidate commands/roots/PIDs and current runtime ports are in the final gate. Ownership was verified against the project/candidate roots and runtime identity. The generated dashboard is a new `dashboard-delivery-20261119` directory; prior reports were retained. Recheck the recorded process commands before signaling; normal supervisor SIGTERM retains this integration target/history/candidates. To resume once its service ports are free:

```sh
RTL_ONBOARDING_ENVIRONMENT=/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-2SuFYO/environment.json node tests/e2e/serve-independent-onboarding.mjs
```

### Short English manual acceptance — Ahmed [ ]

1. Open the dashboard URL. Use **Change review workflow** to inspect each mode. Both current reviews start with zero accepted, Pending decisions and Not run validation. Before/After prepare automatically for the selected supported mapped finding; reload and switch findings. Source remains unchanged.
2. Scroll the review pane: the session toolbar stays visible. Expand the preview, switch direction/viewport and close it; matching Before/After context and fullscreen controls remain usable. A failed preview has its own single Retry beside After.
3. Expand Reviewer notes, save a note and approve a prepared fix. The toolbar count follows the whole session even when another finding is selected. Click **Validate accepted changes**. Expect **Limited validation**: build Passed, tests/typecheck Not configured, separate scanner/runtime results and **Change coverage: Unknown**. No component coverage or “all checks passed” claim is warranted.
4. Open **Review details**. Inspect Activity, Validation commands/scope/logs, Changes/exact diff, and Technical receipts/identities. Use arrow/Home/End navigation, Tab, Escape and a narrow window. History is visibly historical; viewing it must not change decisions or enable Apply for the current review.
5. On this disposable integration target only, choose **Apply N accepted changes to source** and confirm. In **More**, choose Rollback and confirm. Expect restored source, automatic rescan/fresh isolated previews, zero accepted and Not run. Historical validation/receipts remain selectable. Start new review also retains historical records and resets approvals/validation.
6. Leave Ahmed's acceptance unchecked until Ahmed performs these steps. No push, merge, deployment or publication is included.



## Preview state presentation consistency — 2026-11-18

Session Guard **CONTINUE**. Scope: current target-selector/lifecycle presentation only, preserving automatic isolated preparation, explicit decisions/validation/source Apply, historical evidence, fullscreen and notes. **Ahmed manual acceptance [ ].** No Review details redesign or Mocking/Next.js support.

### Investigation before production edits

A real Chromium diagnostic on fresh disposable standalone **UkQIij** reproduced all three observed defects before production edits: [passing reproduction log](../../test-results/preview-ui-audit/reproduction-03.log), [captured state](../../test-results/preview-ui-reproduction-03/preview-ui-reproduce-histo-a2713-nd-verbose-Decision-defects/reproduction.json), [selector screenshot](../../test-results/preview-ui-reproduction-03/preview-ui-reproduce-histo-a2713-nd-verbose-Decision-defects/before-fix-approved-selector.png), [verbose Applied Decision](../../test-results/preview-ui-reproduction-03/preview-ui-reproduce-histo-a2713-nd-verbose-Decision-defects/before-fix-after-apply.png), [stale rollback feedback after Accepted/Passed](../../test-results/preview-ui-reproduction-03/preview-ui-reproduce-histo-a2713-nd-verbose-Decision-defects/before-fix-stale-rollback-status.png). Prior production UI snapshots are retained under `test-results/preview-ui-audit/baseline`.

- `contextRoutes()` replaces an unavailable candidate's selector with “No target yet”, without invalidating `item.targetSignature`. When the same verified targets return after a candidate/runtime transition, the message handler sees an unchanged signature and skips rebuilding the options, while independently updating verification text/target rendering. Selection exists only on the ephemeral view item, so rebuilding a view or reloading also loses a valid selection. This is a UI cache/projection defect, not evidence that the backend failed target verification.
- The workflow renderer appends rollback/rescan success whenever persisted `resumedFrom` exists. That field is permanent provenance, so Accepted decisions and Passed validation do not retire the old success banner.
- The historical branch of the main workflow renderer still emits full current/historical analysis digests and a long immutable-Before/history explanation directly in Decision. The compact read-only Review details already contains historical decisions, validation, identities, receipts and backups; that branch bypasses its intended presentation boundary.

Two exploratory diagnostic runs preceded the stable reproduction: one checked readiness too early around validation/runtime reconciliation; another did not consistently wait for the new bridge report. Their failure artifacts are retained, rather than treated as proof of backend failure. The passing diagnostic waits for current verified bridge status before recording the selector defect. Active **LuVAGQ** source/workflow state was snapshotted before ownership-checked service shutdown; it is not used for Apply/rollback testing.

### Scoped changes and standalone verification

Only the four existing UI modules changed in production; backend identity/eligibility/approval/validation/Apply/rollback checks are unchanged:

- [`dashboard-contextual-preview.ts`](../../tools/rtl-scanner/src/dashboard-contextual-preview.ts) projects target options and selected value from each accepted current bridge report. Unavailable/error states clear the same report/cache/options, and reconciliation also checks actual DOM options. UI-only preferences are bound to root, input/policy, workflow, finding/path, role, candidate session and route; a saved index must still match its target label (or a unique relocated label). All-target selection remains valid only with current targets. Restored selection also refreshes the actual highlight. Old reports are ignored while the authoritative descriptor resolves; all existing nonce/origin/root/session/source/finding/route guards remain.
- [`dashboard-embedded-preview.ts`](../../tools/rtl-scanner/src/dashboard-embedded-preview.ts) clears target projection with unavailable frames and replaces the old view on workflow/session change. Preferences can restore a matching context on reload, but another finding/new candidate session starts with its own verified targets.
- [`dashboard-review-workflow.ts`](../../tools/rtl-scanner/src/dashboard-review-workflow.ts) shows rollback success only for an untouched Pending/Not run successor, with a read-only Dismiss control persisted per workflow. Explicit review advancement retires the banner even without dismissal. Applied Decision shows a short source/recovery status; the event/provenance remains in Activity/History.
- [`dashboard-review-details.ts`](../../tools/rtl-scanner/src/dashboard-review-details.ts) receives the existing historical identity/immutable-Before explanation in History → Technical. Current/History tabs, decisions, validation, receipt/backup disclosures, focus and read-only behavior retain their existing design.

[Task-only diff](../../test-results/preview-ui-audit/dashboard-contextual-preview.ts.diff) and the other `.diff` files in the same audit directory compare against pre-edit snapshots, independent of the repository's preexisting dirty/untracked state. Test-only changes: new [`preview-ui-state.spec.ts`](../../tests/e2e/preview-ui-state.spec.ts), gated pre-fix diagnostic, optional two-contact disposable fixture flag, the post-Apply assertion moved to the existing Technical view, and the held-descriptor regression's cold-start deadline aligned with its existing 30-second readiness limit.

Standalone **VaXLnk**, its own npm installation, two synthetic contacts: **8/8 real Chromium cases passed**. [Final log](../../test-results/preview-ui-audit/browser-final-02.log). Six existing automatic lifecycle cases retain held real descriptors/preparation responses, rapid switching, one Retry/no retry loop, mapping blockers, source preservation and both rollback/rescan modes. Two new complete UI journeys verify second-contact and All selection through context retry/reload, finding isolation, notes, explicit approval, accepted-only validation and real source Apply/rollback; actual highlight agrees with selection. They verify compact Applied Decision, historical decisions/Passed checks/digests/receipts/backups, fresh-session reset with every decision Pending and validation absent, read-only persistent dismissal, and automatic banner retirement after Accepted/Passed. Browser errors are empty and all target source hashes return to baseline. Earlier failed setup/cold-start attempts remain logged; the final run used the correctly generated report and completed all cases.

Real screenshots for both workflows are stored with their traces/video and JSON evidence:

| Stage | One by One | Apply First |
|---|---|---|
| Before explicit source Apply | [Validated preview](../../test-results/preview-ui-final-02/preview-ui-state-one-by-on-88eed-lidation-Apply-and-Rollback/before-source-apply.png) | [Validated preview](../../test-results/preview-ui-final-02/preview-ui-state-apply-fir-67e81-lidation-Apply-and-Rollback/before-source-apply.png) |
| After source Apply | [Compact Decision](../../test-results/preview-ui-final-02/preview-ui-state-one-by-on-88eed-lidation-Apply-and-Rollback/after-source-apply.png) | [Compact Decision](../../test-results/preview-ui-final-02/preview-ui-state-apply-fir-67e81-lidation-Apply-and-Rollback/after-source-apply.png) |
| After rollback/rescan | [Fresh Pending/Not run](../../test-results/preview-ui-final-02/preview-ui-state-one-by-on-88eed-lidation-Apply-and-Rollback/after-rollback.png) | [Fresh Pending/Not run](../../test-results/preview-ui-final-02/preview-ui-state-apply-fir-67e81-lidation-Apply-and-Rollback/after-rollback.png) |
| Current review advanced after rollback | [Accepted/Passed, no stale banner](../../test-results/preview-ui-final-02/preview-ui-state-one-by-on-88eed-lidation-Apply-and-Rollback/advanced-current-review.png) | [Accepted/Passed, no stale banner](../../test-results/preview-ui-final-02/preview-ui-state-apply-fir-67e81-lidation-Apply-and-Rollback/advanced-current-review.png) |

[Active project preservation audit](../../test-results/preview-ui-audit/active-project-preservation.json) confirms prior **LuVAGQ** source and workflow/decision/validation/receipt state unchanged except runtime shutdown metadata; all candidate directories remain. Historical artifacts and all existing dirty/untracked changes are retained. ### Relevant regression results

- Scanner: **375/375 tests across 29 files** — [log](../../test-results/preview-ui-audit/scanner-suite-delivery.log).
- Core workflows: **5/5** — [log](../../test-results/preview-ui-audit/core-regressions.log), including both review modes, source/candidate conflicts, real Companion restart, unavailable versus failed validation, endpoint guards and partial-write rollback.
- Post-Apply/current-source and both rollback/rescan modes: **3/3** — [log](../../test-results/preview-ui-audit/lifecycle-regressions.log), including failed rescan/Retry, late old context and no inherited approval/validation. The historical explanation assertion now opens History → Technical and checks the compact Decision separately.
- Automatic Before/notes/read-only details: **2/2** on the required expansion fixture — [log](../../test-results/preview-ui-audit/details-regressions.log). Keyboard/responsive dialog behavior, saved notes, historical receipts/backups and fresh review remain covered.
- Fullscreen: **1/1** — [log](../../test-results/preview-ui-audit/fullscreen-regression.log). Actual iframe nodes, app navigation/search state, direction/viewport changes, focus/cleanup and no extra workflow mutations remain covered.
- With the standalone 8/8 above, **19 distinct Chromium regression cases passed**. Scanner build, [scanner typecheck](../../test-results/preview-ui-audit/scanner-typecheck-delivery.log), [workspace typecheck](../../test-results/preview-ui-audit/typecheck.log) and [all configured app builds](../../test-results/preview-ui-audit/apps-build.log) passed.

During partial-write review, the same compact historical branch also needed an accurate `Applying` status. It now says “Source apply incomplete · Use Rollback to recover,” instead of prematurely saying “Source applied.” This final wording change leaves backend recovery checks intact; its focused browser assertion/evidence follows with the delivery gate.

The final focused partial-write/recovery rerun **1/1 passed** with the new incomplete-Apply status assertion: [log](../../test-results/preview-ui-audit/partial-recovery-final.log). Thus 19 distinct Chromium cases plus this focused rerun passed; the scanner build/typecheck includes the final wording.

### Working disposable dashboard and manual acceptance — Ahmed [ ]

Exact [dashboard URL](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30). [Final identity/source/workflow/process gate](../../test-results/preview-ui-audit/final-gate.json), [environment](../../test-results/preview-ui-audit/final-environment.json), [live full UI state](../../test-results/preview-ui-audit/live-dashboard-state.txt), [live fresh Before/After screenshot](../../test-results/preview-ui-audit/live-after-rollback.png).

The working app is the **new standalone Field Notes integration target VaXLnk**, with two synthetic contacts and its own npm dependencies, outside the repository. Root: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-VaXLnk/field-notes`. The latest generated UI is served from sibling `dashboard-final`; prior reports/evidence are retained. Supervisor **96064**, Companion **96065** (`4318`), HTTP **96096** (`4320`), original Vite **96160** (`4215`), current one-by-one candidate Vite **96525** (`4202`). The gate records another retained owned runtime on 4206; no port owner was stopped by port. Recheck command/root/handshake before signaling. Normal supervisor SIGTERM retains target/history/candidates. Resume only when ports are free:

```sh
RTL_ONBOARDING_ENVIRONMENT=/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-VaXLnk/environment.json node tests/e2e/serve-independent-onboarding.mjs
```

The live one-by-one view is left after rollback/resume with a **different candidate session, only the selected patch prepared, every decision Pending, empty decision history and validation Not run**, both selectors matching the two verified rendered targets. All five target source hashes match the baseline, and historical entries/Passed validation/receipts match the Applied snapshot. The other mode's explicitly advanced Accepted/Passed test review is retained as test state; it was not automatically inherited or marked as Ahmed acceptance.

The extra desktop-browser check reached Applied, verified from the authoritative workflow and receipt hashes. Its native confirmation left the old browser view unresponsive; the action was not repeated. An explicit workflow API rollback restored the disposable source, and a new tab automatically resumed/prepared the fresh review. [Supplementary transaction record](../../test-results/preview-ui-audit/live-rollback.json). Full GUI lifecycle flows had already passed in both automated behavioral tests; this supplementary recovery is not represented as an all-GUI journey or personal acceptance.

Short English manual acceptance steps (repeat in both review workflows):

1. Select an eligible mapped finding; wait for automatic Before/After. Choose the second target or All targets, then Retry context/reload. Check that options, selected target, highlight and Verified count agree.
2. Explicitly Approve fix and Validate accepted changes. Check Accepted/Passed, preserved target choice and no stale rollback success banner. Save/reload a note and use fullscreen.
3. Explicitly Apply accepted changes to source. Decision should show only a short source/recovery status; open Review details → History → Technical for identities, receipts and backups, and Validation for historical Passed checks.
4. Rollback. Wait for rescan and automatic fresh Before/After; check **0 accepted, Pending, Not run** and current target options. Dismiss the success notification and reload; verify History still retains rollback, decisions, validation and recovery evidence.

Memory link validation: **149 links checked, zero missing required/optional references**. Seven existing source-staleness advisories and the undated navigation index were reviewed; unrelated facts were not rewritten. [Validator log](../../test-results/preview-ui-audit/memory-validation-final.log).

**Ahmed manual acceptance remains [ ] One by One, [ ] Apply First.** Automated verification and agent browser checks do not complete it. No Review details redesign, Mocking/Next.js support, release, application-source change or historical-asset overwrite was included.


## Automatic Before/After preparation and recovery — 2026-11-18

Session Guard **CONTINUE**. User-requested lifecycle change supersedes the prior manual-only candidate-preparation contract, including the older “No candidate prepared after rollback” acceptance statements. Decisions, technical validation and explicit source Apply remain separate. **Ahmed manual acceptance [ ]**. No Mocking/Next.js expansion.

### Root cause documented before implementation

Source inspection and a real Chromium reproduction on a fresh standalone Field Notes copy **69FFtG** confirmed two causes:

1. Selection/restore only calls `embeddedReview.configure` → contextual descriptor/Before initialization. Candidate patch/runtime work is reachable only through `reviewWorkflow.preview` from a candidate action. Rollback intentionally resumes an analysis-only workflow and selection never continues to candidate preparation. Thus automatic After is absent by the previous implementation contract, including after reload/rescan.
2. `preview(f)` snapshots `embeddedReview.capability(f)` **before** asynchronous patch preparation. If the original target has not yet been verified, the first click prepares code and returns early without a runtime request. When Before later verifies, only the button label changes to Apply & Preview; nothing resumes preparation. With a delayed real contextual response, the browser made **one change request, zero runtime requests**, then displayed verified Before with no After. A second click made **one runtime request** and displayed verified After, with no second patch and no target-source changes. The verified-target branch itself completed with one click; duplicate source patching was not the reproduced cause. Busy clicks can also be discarded while that incomplete operation is running.

[Reproduction log](../../test-results/automatic-after-audit/reproduction.log), [first-click Before only](../../test-results/automatic-after-reproduction/automatic-after-reproduce--ecb8a-ly-click-two-stage-behavior/first-click-before-only.png), [reproduction test](../../tests/e2e/automatic-after-reproduce.spec.ts). Exact artifact paths and final verification follow below. Diagnosis recorded before production edits; prior source snapshots are retained under `test-results/automatic-after-audit/baseline`.

### Scoped implementation

The existing workflow coordinator now exposes one serialized, idempotent `prepare-preview` operation. It checks the current source/configuration identity, eligibility, decision, route/application mapping and any existing candidate hashes, then composes the selected isolated patch and reuses/starts its application runtime. It does not change decisions, run validation or call source Apply. An existing rejected/deferred/flagged decision stays excluded unless explicitly reconsidered. Code-only preparation remains explicit for unmapped fixes; it never creates an unrelated live After.

The dashboard continues preparation when the authoritative Before source/route/target verifies, instead of sampling capability before an asynchronous click operation. Preparation is owned by workflow, source/policy, finding, route and candidate composition. A single in-flight operation coalesces events; failures reconcile the same workflow and wait for one Retry. Selection and descriptor generation checks reject stale responses. After reload or receipt-authorized rollback/rescan, the current successor automatically reuses a valid candidate/runtime or prepares the selected patch. Fresh successors keep Pending decisions, empty history and Not run validation; completed review decisions/validation/receipts remain historical.

States distinguish verification/preparing, ready, actual mapping/unsupported blockers and failed preparation with Retry. Post-preparation descriptors may be delayed while the prior Before sends heartbeats; those heartbeats cannot classify an unresolved descriptor as failure. App mounting and direction changes receive the existing bounded verification timeout before candidate failure; a single premature target report does not destroy a loading iframe. Fullscreen Before/After-only panels preserve source-bound verification evidence for a hidden iframe, and reusing an existing mapped candidate still requires current source/route/direction identity. After itself must render and verify before Ready.

Production changes are confined to `review-workflow.ts`, the Companion workflow dispatcher, and the three existing dashboard preview/workflow modules. [Task-only diffs](../../test-results/automatic-after-audit/dashboard-review-workflow.ts.diff) compare against this task's snapshots, preserving preexisting dirty/untracked work. No app source, historical video asset, transformation family, Mocking or Next.js support changed.

### Automated verification (not user acceptance)

- Fresh standalone **LuVAGQ** with its own npm dependencies: **8/8 real Chromium tests passed**. Six lifecycle tests cover initial selection without candidate-action clicks; held post-preparation descriptor; reload/session reuse; rapid finding switch with held real preparation response; one injected preparation failure, no automatic retry loop, one Retry; unsupported/missing mappings; and real Apply → rollback → automatic rescan/preparation in both modes. Two independent onboarding regressions retain three-family LTR/RTL computed checks, decisions, accepted-only source Apply, protected rollback and history. [Log](../../test-results/automatic-after-audit/browser-final.log), [initial/reload evidence](../../test-results/automatic-after-final/automatic-after-initial-se-9b6a7-ion-clicks-or-source-writes/evidence.json), [rapid-switch evidence](../../test-results/automatic-after-final/automatic-after-rapid-swit-8de32-nly-the-current-target-next/evidence.json), [single Retry evidence](../../test-results/automatic-after-final/automatic-after-preparatio-8e89d-and-no-automatic-retry-loop/evidence.json).
- Every standalone lifecycle test compares all scanned target-source hashes before/after preparation. Both rollback tests assert a different current session, only the selected patch prepared, every decision Pending, empty current history, absent current validation, and preserved historical entries/validation/receipts. Browser errors were empty. [One-by-one rollback](../../test-results/automatic-after-final/automatic-after-one-by-one-5fd10-thout-historical-validation/evidence.json), [apply-first rollback](../../test-results/automatic-after-final/automatic-after-apply-firs-b2fbe-thout-historical-validation/evidence.json), [rollback split view](../../test-results/automatic-after-final/automatic-after-apply-firs-b2fbe-thout-historical-validation/automatic-after-rollback.png).
- Scanner **375/375 tests, 29 files passed**, including two new coordinator tests for idempotence/source preservation/current validation reuse and stale identity/candidate/mapping/unsupported/decision guards. [Log](../../test-results/automatic-after-audit/scanner-suite-final.log). Scanner and workspace typechecks and all three app builds passed; [scanner typecheck](../../test-results/automatic-after-audit/scanner-typecheck-final.log), [workspace typecheck](../../test-results/automatic-after-audit/typecheck-final.log), [builds](../../test-results/automatic-after-audit/apps-build.log).
- Existing automatic Before/details regression **2/2 passed** after the descriptor-race fix; fullscreen regression **1/1 passed** after verifying direction transitions and hidden-panel recovery, while retaining iframe-node preservation, app navigation/search data, focus, viewport and no extra workflow mutation assertions. [Final details log](../../test-results/automatic-after-audit/details-final.log), [fullscreen log](../../test-results/automatic-after-audit/fullscreen-final-03.log).

- Existing core workflow suite **5/5 passed** in a fresh disposable environment, retaining one-by-one/apply-first accepted-only Apply, runtime retry/reuse, real service outage/restart, source/candidate conflicts, bounded-port exhaustion versus failing checks, endpoint guards and interrupted partial-write recovery. [Core log](../../test-results/automatic-after-audit/core-regressions.log). Existing post-Apply and both rollback/rescan tests **3 passed**, including failed rescan/Retry, held historical descriptor, current/history identities and external-change rejection. [Lifecycle log](../../test-results/automatic-after-audit/lifecycle-regressions.log). That combined run could not start the core suite because the earlier test's new automatic candidate occupied its reserved 4202 port; the separate fresh 5/5 run resolves the fixture contention. The scoped resumption expectations now assert automatic fresh candidate readiness/session reuse instead of historical no-candidate behavior.
- The earlier live **LpzYej** target was shut down only after process/root ownership checks. Its source hashes, candidate/workflow state, decisions, validation and receipts match the preserved snapshot except runtime shutdown metadata. [Preservation audit](../../test-results/automatic-after-audit/prior-target-preservation.json). Historical artifacts and targets are retained.

### Manual acceptance — Ahmed [ ]

The service identity and final browser gate below are time-sensitive. Acceptance remains unperformed by Ahmed. Open the exact dashboard URL, select an eligible configured finding and watch Before/After become ready without a candidate-action click. Reload and switch findings; examine Pending/Not run and unchanged target source. On the disposable integration target, explicitly approve/validate/Apply and then rollback to review automatic rescan/new candidate with history kept separate. Unsupported/unmapped selections must show their own blocker. Injected failure/delay tests are automated evidence, not a claim that Ahmed personally accepted them.


### Live standalone acceptance environment

Final **2026-11-18** gate: [identity/source/workflow/process audit](../../test-results/automatic-after-audit/final-gate.json), [environment](../../test-results/automatic-after-audit/final-environment.json), [desktop browser state](../../test-results/automatic-after-audit/live-dashboard-state.txt), [actual live split view](../../test-results/automatic-after-audit/live-automatic-after.png). Desktop IAB was reloaded, switched to the next eligible finding and back, then reloaded again: both real source-bound targets verified automatically without a candidate-action click. Both review modes remain Pending, empty decision history, Not run validation; the active one-by-one candidate contains the three independently selected Pending patches. All five scanned target source hashes equal the pre-preview baseline. This is agent verification, not Ahmed acceptance.

Exact URL: [http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30).

This is the **new standalone Field Notes integration app**, with synthetic people data and its own npm install, at `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-LuVAGQ/field-notes`. No existing real-world-project acceptance is implied. Supervisor **79179**, Companion **79180** (`4318`), HTTP **79211** (`4320`), original Vite **79278** (`4215`), candidate Vite **79408** (`4206`). Commands/root/handshakes were verified in the final gate; recheck ownership before signaling. The supervisor's normal SIGTERM stops owned services and retains this target/history/candidates. Resume only when its ports are free:

```sh
RTL_ONBOARDING_ENVIRONMENT=/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-LuVAGQ/environment.json node tests/e2e/serve-independent-onboarding.mjs
```

Automated final total: **19 passing Chromium cases** across standalone (8), core workflow (5), post-Apply/rollback (3), details (2) and fullscreen (1), plus 375 scanner tests. The earlier details run without `RTL_EXPANSION_FIXTURE=1` lacked the required CSS findings; the correct fixture run passed 2/2. Memory validation: required links pass; the seven preexisting source-staleness advisories and undated navigation index are reviewed warnings, not facts automatically rewritten.

## Independent-project onboarding — 2026-11-18

Session Guard **CONTINUE**, approved handoff. This section supersedes the older Nx-only discovery and invoice-only final runtime-validation limits for explicitly configured React/Vite projects. Historical results, family exclusions, approvals and receipts below remain dated evidence. **Ahmed manual acceptance [ ]**. No release, new configuration UI, general Mocking platform or repair-family expansion.

### Generic behavior and bounded changes

- Existing scanner extractors, shared transformation inventory, contextual resolver/bridge, persisted workflow/recomposition, validation signatures, controlled Apply journal/backups and receipt-bound source reconciliation are reused. No independent app name, source path, selector or route was added to analyzer business logic.
- Optional [`rtl-project.config.json` loader](../../tools/rtl-scanner/src/project-configuration.ts) declares project-relative scan roots, candidate copy paths, package manager and existing check arguments. Discovery reads those roots without Nx metadata. Default flat Nx discovery remains supported. Configuration enters scan input identity and workflow baseline; changed commands/scope cannot reuse a validated candidate. Path traversal, dependency scopes, symlinked ancestors/configuration and uncopied scan roots fail closed.
- [`rtl-preview.config.json`](../../tools/rtl-scanner/src/preview-configuration.ts) keeps the existing application/Vite config/entry/origin/readiness/routes/source-rule/target contract, now permitting standalone relative paths and an optional `startupScript`. [`runtime-process.ts`](../../tools/rtl-scanner/src/runtime-process.ts) runs that script through the declared package manager with the generated development Vite config, loopback host, actual port and `--strictPort`. The script must forward Vite CLI arguments. Default direct Vite startup is retained. Owned process groups include the npm child; no PID is adopted or stopped by port. Caches are scoped by root/role/application. Signaled children are treated as exited. Companion reports 503 during shutdown instead of continuing to claim health while owned runtimes drain.
- Candidate copying respects the declared source/assets/test setup, mounts the target's dependencies, and preserves configuration/check files. Final generic validation runs configured checks plus the shared rescan and actual mapped application routes in LTR/RTL. It checks readiness, direction, visible rendered selectors, Vite source stylesheet/rule correspondence and applicable bidi DOM; checks record route/viewport/computed evidence. Unmapped accepted changes or unavailable runtime evidence block final Apply. Configuration alone never means Verified or Passed.
- The existing bounded bidi transform now accepts safe standalone JSX/TSX paths; its AST/range/isolation/content safeguards and supported expression grammar are unchanged. Legacy invoice handlers remain compatibility paths, not dependencies of configured independent workflows.

### Target discovery and identity

Read-only local discovery found React/Vite and Next.js projects under `/Users/a.fouad/Projects`. The PNPM migration React/medium examples have incomplete runnable assets/test setup and mostly utility/dynamic content outside the repair contract; Git_search lacks a runnable entry/index and installed dependencies. Tibr Perfumes is a complete existing React/Vite application and was copied outside this repository for inspection: **complete scan, 26 findings, zero eligible proposals**, confirmed again after the standalone bidi path repair. Its explicit direction scopes, physical coordinate layouts, selector/cascade constraints and computed/translated content remain bounded exclusions. No repair guard was relaxed to force a target count. [Discovery/configuration](../../test-results/independent-onboarding-audit/discovery.json), [actual final existing-target inventory](../../test-results/independent-onboarding-audit/existing-target-inventory-final.json).

The working fallback is **Field Notes, a newly created standalone integration target**, not an existing real-world project. Its generator is [`serve-independent-onboarding.mjs`](../../tests/e2e/serve-independent-onboarding.mjs). Actual application files live outside the analyzer checkout at `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-LpzYej/field-notes`. It has `src`, `index.html`, Vite/TypeScript configs, a React provider, one `/people` route, imported styles, a synthetic contacts module and a real Node data-contract test. The page visibly says **Standalone integration target · synthetic people data**. No server, authentication or production credentials are involved. Initial development used a dependency symlink; the final target uses its **own npm installation and lockfile**, not the analyzer's node_modules. [Actual installation log](../../test-results/independent-onboarding-audit/standalone-install.log).

Three supported families are exercised without adding rules: spacing (`margin-left`), alignment (`text-align:left`), and side borders (`border-left`). Additional spacing edits provide explicit rejected/pending cases; an unmapped selector and unsupported findings keep honest fallback states. Synthetic contacts are deliberately explicit test data. The same real layout/styles/provider/data module runs in both origins; no replacement preview page or screenshot mock is used.

### Reproducible configuration and commands

The final target's `rtl-project.config.json`:

```json
{
  "schemaVersion": 1,
  "scanRoots": ["src", "index.html"],
  "copyPaths": ["src", "index.html", "tests", "vite.config.ts", "tsconfig.json", "package.json", "package-lock.json"],
  "packageManager": "npm",
  "validation": {
    "typecheck": ["run", "typecheck"],
    "build": ["run", "build"],
    "test": ["run", "test"]
  }
}
```

Its application and one binding (the actual config declares five selectors):

```json
{
  "schemaVersion": 1,
  "applications": {
    "directory": {
      "viteConfig": "vite.config.ts", "entry": "src/main.tsx",
      "originalOrigin": "http://127.0.0.1:4215",
      "readySelector": "#root main article", "dataAdapter": "none",
      "startupScript": "dev",
      "routes": [{"id":"people","path":"/people","ltr":"/people?direction=ltr","rtl":"/people?direction=rtl"}]
    }
  },
  "mappings": [{"source":"src/reading.css","sourceSelector":".contact-card","targetSelector":".contact-card","routes":[{"application":"directory","route":"people"}]}]
}
```

`dev` is the target's ordinary `vite` script. Managed original startup executes `npm run dev -- --config <target>/.rtl-preview/vite.directory.config.mts --host 127.0.0.1 --port 4215 --strictPort`; candidate startup uses its isolated root/config and an available port in `4202..4212`. Readiness requires runtime identity followed by the source/target bridge, not HTTP 200 alone. npm was exercised; pnpm/yarn configuration is implemented but not certified by this run. Next.js has no runtime adapter in this scope and remains unsupported, rather than being labeled a generic framework pass.

From the analyzer repository, with its dependencies installed:

```sh
npm run rtl:scan:build
# Creates a standalone target and independently installs its dependencies; preserves it on shutdown.
RTL_ONBOARDING_INSTALL=1 node tests/e2e/serve-independent-onboarding.mjs
# Use the printed environment.json in a second terminal:
RTL_MANUAL_ENVIRONMENT='/actual/printed/environment.json' npx playwright test \
  --config=playwright.manual-preview.config.ts tests/e2e/independent-onboarding.spec.ts \
  --output=test-results/independent-onboarding-new-run
```

For an existing supported Vite project, install its own dependencies, declare its actual config/entry/source/route mappings, run the scanner with `--root /absolute/project`, then run Companion with `RTL_PROJECT_ROOT=/absolute/project` and root-specific state store/backup paths (the generator shows the exact existing environment variables). Serve the external report directory with `python3 -m http.server 4320 --bind 127.0.0.1`. Automatic Before starts only a mapped owned original. Do not start another uninstrumented server on the configured original port. Preview commands do not run at scan time. The three target check commands are `npm run typecheck`, `npm run build`, and `npm run test` in the isolated candidate.

### Actual browser/structural evidence

Final gate: **373/373 scanner tests (29 files)**, **2/2 independent HTTP browser lifecycles on the target's own npm install**, **11/11 existing Atlas HTTP regressions**, general/scanner typechecks, scanner build and **3 Nx app build tasks PASS**. [Machine-readable gate and current identities](../../test-results/independent-onboarding-audit/final-gate.json), [final independent browser log](../../test-results/independent-onboarding-audit/browser-final.log), [legacy regression log](../../test-results/independent-onboarding-audit/legacy-regressions-02.log), [scanner suite](../../test-results/independent-onboarding-audit/scanner-suite-final-02.log), [general typecheck](../../test-results/independent-onboarding-audit/typecheck-final.log), [scanner typecheck](../../test-results/independent-onboarding-audit/scanner-typecheck-final.log), [scanner build](../../test-results/independent-onboarding-audit/scanner-build-final.log), [apps build](../../test-results/independent-onboarding-audit/apps-build.log).

Memory validation **PASS: 135 links, 0 missing**. The same 7 advisory source-staleness warnings and undated index were reviewed without unrelated factual rewrites; [validator log](../../test-results/independent-onboarding-audit/memory-validation-final.log). `git diff --check` PASS; app/library checkout diff empty.

The 11 regressions are core workflows **5/5**, automatic Before/details **2/2**, rollback resumption **2/2**, post-Apply context **1/1**, fullscreen **1/1**. Independent preliminary runs on borrowed dependencies are separate evidence, not included in the final 2/2 count. Scanner negative tests additionally check standalone scope/config freshness, escaped/symlinked paths, copy isolation and accepted unmapped changes remaining Unavailable with source Apply blocked.

Actual final screenshots, visually inspected: [three families RTL](../../test-results/independent-onboarding-browser-final/independent-onboarding-one-343a7-y-rollback-and-fresh-review/three-families-rtl.png), [LTR](../../test-results/independent-onboarding-browser-final/independent-onboarding-one-343a7-y-rollback-and-fresh-review/three-families-ltr.png), [fresh review](../../test-results/independent-onboarding-browser-final/independent-onboarding-one-343a7-y-rollback-and-fresh-review/standalone-fresh-review.png), [separate History](../../test-results/independent-onboarding-browser-final/independent-onboarding-one-343a7-y-rollback-and-fresh-review/standalone-history.png). Full source/configuration/requests/decisions/checks/computed styles/source identities are in [manual acceptance.json](../../test-results/independent-onboarding-browser-final/independent-onboarding-one-343a7-y-rollback-and-fresh-review/acceptance.json) and [batch acceptance.json](../../test-results/independent-onboarding-browser-final/independent-onboarding-app-fd2f3-y-rollback-and-fresh-review/acceptance.json), with traces/videos alongside. At **1280 px** in both origins, RTL Before retains margin-left **18 px**, left alignment and left border **3 px**; After has margin-right **18 px**, start alignment and right border **3 px**. LTR preserves the corresponding left reading edge. Both show the same actual contact text. Source SHA-256 returns to `53f90e7a6f0f0c2e2c5f019514ca253f95a4548ae324f5c0024cc4d22ba40137`. Atomic Apply/rollback replaces the inode; canonical path, device and restored content identity are confirmed and the changed inode is recorded honestly.

The browser test covers Analyze → explicit candidate preparation → accept → validate → explicit source Apply → rollback → rescan → fresh review in **both modes**. It accepts three families, prepares/rejects a separate patch, leaves others Pending, verifies exact accepted-only candidate/source composition and blocks rollback after an intervening edit. Restored file content, SHA-256, canonical path and device identity are checked; inode is recorded rather than falsely required to survive a write strategy. Both origins share `/people`, viewport, direction and actual visible data. Computed margins/alignments/borders, loaded source-rule/target verification, selection, reload, Review details and fullscreen are exercised. Automatic Before never creates/patches a candidate; initial Apply First preparation is attributed to the explicit batch-start action. After rollback both paths return Pending/Not run/no candidate with fresh suggestions; historical Passed/decisions/receipts remain separate.

Development failures are retained separately: the first browser run waited for the old action label after it correctly changed to Open candidate preview; the test uses the existing candidate-action hook. The first legacy regression exposed health staying 200 while shutdown drained runtimes; the service now returns 503 during shutdown. No acceptance result was fabricated or marked as Ahmed's approval.

### Expansion and Mocking audit (not a general Mocking implementation)

| Area | Evidence-backed status / remaining boundary |
|---|---|
| Repair families / both workflows | Existing E0–E6 contracts below remain authoritative: bounded spacing/alignment/positioning/borders/corners, marked progression icons, direct bidi text and direct React inline adapters. This target proves spacing/alignment/borders in both paths. Utilities, CSS-in-JS ownership/processor cases and unsupported expressions retain reasons. No broad coverage expansion. |
| Batch decisions / rejection removal | Real mixed Accepted/Rejected/Pending batch verified. Rejection reconstructs from immutable originals; validation removes all nonaccepted patches; only accepted patches reach source. Existing core tests cover cross-file composition, restart and partial-write recovery. |
| Stories / fixtures / test setup / providers | Repository already has `.storybook`, stories, Vitest and Playwright fixtures; existing Atlas harness copies test/setup/provider sources. New `copyPaths` preserves the independent target's actual tests/providers/assets. There is no automatic story/props/provider discovery or component-isolation adapter. |
| Equivalent editable data | Existing Atlas adapter synchronizes a dedicated preview seed/storage scope; existing contextual tests own that evidence. This independent target uses the same fixed synthetic data module and the browser compares visible rows in both origins. `dataAdapter:none` honestly keeps dataset-equivalence unverified in the generic UI. Arbitrary user edits and cross-origin editable-data synchronization are not implemented. |
| API / module mocks | No general interceptor registry, generated mocks, service-worker integration or module replacement platform was added. Independent target requires no API; reuse its explicit synthetic module and real provider. Each additional app needs an explicit app-owned test seam. |
| Authenticated pages | No server-authenticated page was exercised. Cookies/server sessions, login/setup steps and authenticated readiness remain separate requirements. localStorage data does not authenticate a server session; no production auth behavior or credentials changed. |
| Multi-project / Nx | Existing Nx apps/libs discovery and explicit multiple-application preview config are retained. New scan/copy scope can declare standalone or selected monorepo sources; mapping identifies the owning app. No arbitrary Nx executor/startup adapter, workspace dependency graph, multi-package install or general Next.js support is claimed. |
| Batch scaling / interruptions | Existing persisted signatures/source baselines, rejection recomposition, receipts, restart/outage and partial-write rollback remain tested. Process-group ownership now includes npm children. Candidate port pool stays finite; validation timeouts remain bounded; there is no distributed coordinator, large-repository benchmark or general command-interruption/resume scheduler. |

Next bounded implementation task: onboard **one existing Vite application with genuinely eligible repairs**, its own installed dependencies and one explicit test-data/provider seam, then repeat this same route/lifecycle gate. This run proves the configuration contract on a newly created integration target; it does not claim existing real-world repair acceptance, arbitrary framework onboarding or a general Mocking platform.

### Running dashboard and short English manual acceptance

[Open the working local dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3Ae382b9aea738a8b457207d30). Current standalone root **LpzYej**, supervisor **62602**, Companion **62603** (4318), HTTP **62634** (4320), original Vite **62832** (4215), owned npm process group **62790**. No current candidate runtime is required or prepared. [Environment](../../test-results/independent-onboarding-audit/manual-environment.json), [listener/process ownership](../../test-results/independent-onboarding-audit/service-ownership.txt), [independently installed dependencies](../../test-results/independent-onboarding-audit/independent-dependencies.json).

Both workflows are left **Reviewing after successful rollback**, all Pending, no session or current validation. Manual current `56c3c386-1e56-4bfb-bf35-780973411dd8` resumes historical `6d3ae756-3248-4a35-a4c2-4c1c3c9efc7c`; batch current `77a480fb-0a98-483b-a03e-fbbe62309d20` resumes historical `d94d8fbf-d8ad-468a-b877-3084169cbf39`. Historical Passed/receipts/backups remain separate. A final in-app-browser inspection confirmed **Verified /people Before**, **Pending / 0 accepted / Not run**, the fresh logical suggestion and **No candidate prepared** without taking a candidate action.

The prior **8zGU2i** service children were positively identified by process command and Companion root before stopping; its workflows/candidates/source/history were retained offline. Its old supervisor **44347** remains idle, with no serving children; it was not sent the destructive cleanup signal from the old historical instructions. [Prior identity and preserved workflows](../../test-results/independent-onboarding-audit/prior-service-preservation.json). The existing Tibr source/tests/assets were read-only and [compared against the inspection copy](../../test-results/independent-onboarding-audit/existing-target-preserved.json). No analyzer checkout app/library source or historical video asset changed.

Recheck process commands/root before stopping the current supervisor with `kill -TERM 62602`; this new harness retains target files, candidates, evidence and backups. Resume this exact environment later with:

```sh
RTL_ONBOARDING_ENVIRONMENT='/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-independent-onboarding-LpzYej/environment.json' \
  node tests/e2e/serve-independent-onboarding.mjs
```

Use the newly printed PIDs after any restart. Ports must be free; no unrelated owner is stopped automatically.

1. Open the dashboard and choose **Review One by One** if a chooser appears. Select `src/reading.css` / `.contact-card`. Before should load automatically; the suggested logical property must be visible while After says **No candidate prepared**.
2. Select `.contact-name` and `.contact-email`, then reload. Verify automatic Before each time. Inspect **Review details**: Current is Pending/Not run; History retains Rolled Back/Passed separately.
3. Explicitly prepare a candidate. Compare LTR/RTL and Expand/Close on `/people`; check the synthetic-data label and matching rows/viewport. Accept the three intended fixes, reject `.reject-me`, and keep `.pending-me` Pending.
4. Validate, explicitly Apply accepted changes, then Rollback. Expect restored source, automatic Before, fresh suggestions, all Pending/Not run and no current candidate. Repeat with **Apply First, Review Later** on this disposable target.
5. **[ ] Ahmed records his own acceptance.** Leave this unchecked until he does.


## Automatic Before and compact Review details — 2026-11-18

Session Guard **CONTINUE**. Both bounded fixes are implemented and verified. This section supersedes only the older preview-entry and inline-detail organization described below. Existing transformation inventory and Apply/validation/rollback guards remain authoritative. **Ahmed manual acceptance [ ]**; previous approvals and acceptance checkboxes are preserved.

### Root cause and implementation

A late Companion health callback called `detail()` directly and replaced the restored workflow card with the legacy panel. The workflow previously restored its controls/Before only through selection wrappers; clicking a workflow or candidate action masked this race. Reload also reopened the workflow chooser, hiding the restored review. The existing contextual renderer requested Before independently, but could only describe a missing original runtime; candidate runtime startup was the only visible recovery action.

- Every detail rebuild now restores the existing workflow and original preview, including health/recovery callbacks. A saved workflow reopens directly on reload; absence of a matching saved workflow returns to the explicit chooser. No batch preparation is repeated by reload.
- Original initialization uses a separate identity-checked `/contextual-preview/original` operation. The authoritative report, finding, source, workflow/configuration and approved route are checked before startup. Healthy originals are reused; concurrent startup shares one operation per root/application. It starts only an available loopback port with strict-port Vite, records its own child, and never kills/adopts another port owner. It creates only the generated development wrapper/runtime, with no candidate creation, patch, validation or source Apply. Missing mappings never start a runtime. Unavailable originals retain their honest descriptor/recovery reason without hiding an otherwise available candidate. Selection/route tokens reject stale responses.
- Decision keeps the four decisions, expandable reviewer notes with explicit Save notes, candidate action, concise current status, Review details, and discoverable existing Validate/Apply/Rollback controls. Notes use the existing workflow change handler with a notes-only branch; it preserves candidate membership and validation.
- The native accessible dialog displays **Current review / History** and **Activity / Validation / Changes / Technical**. It reads workflow snapshots and refreshes them when an already-running operation completes. Validation logs, file inventories/diffs, identities/hashes, receipts and backups are expandable. It makes no API requests and contains no lifecycle mutation controls. Escape, Tab containment, arrow-key tabs, focus restoration, responsive dimensions and a scrolling body are implemented. Historical evidence never enters current action gates.
- After rollback/rescan both modes show the restored original automatically, a fresh real suggestion, all Pending, validation Not run, and **No candidate prepared** in After. Previous decisions, Passed results, receipts and backups remain separate History.

Changed production files (changes in these files before this task were preserved): [dashboard-client.ts](../../tools/rtl-scanner/src/dashboard-client.ts), [dashboard-review-workflow.ts](../../tools/rtl-scanner/src/dashboard-review-workflow.ts), [dashboard-contextual-preview.ts](../../tools/rtl-scanner/src/dashboard-contextual-preview.ts), new [dashboard-review-details.ts](../../tools/rtl-scanner/src/dashboard-review-details.ts), new [original-preview-runtime.ts](../../tools/rtl-scanner/src/original-preview-runtime.ts), [preview-companion.ts](../../tools/rtl-scanner/src/preview-companion.ts), and the notes-only branch in [review-workflow.ts](../../tools/rtl-scanner/src/review-workflow.ts). No checkout `apps/` or `libs/` changes; no historical video assets changed.

Tests: new [automatic Before/details HTTP acceptance](../../tests/e2e/automatic-before-details.spec.ts), new [saved-workflow entry helper](../../tests/e2e/enter-review.ts), notes persistence coverage in [workflow tests](../../tools/rtl-scanner/tests/review-workflow.test.ts). Existing HTTP regressions were adapted to direct reload restoration: `review-workflows-complete`, `rollback-review-resumption`, `post-apply-context`, `fullscreen-review-preview`, `embedded-review-preview`, `review-one-by-one-analysis`, `review-one-by-one-preview`, `contextual-review-preview`, `css-spacing-workflows`, `directional-expansion-workflows`, `preview-binding`, and `independent-expansion`. Detailed receipt/check assertions now open the dialog. The original-outage simulation covers both the descriptor and the new original-only initializer; assertions were not weakened.

### Actual verification

**28/28 HTTP browser regressions**, plus **2/2 final delivery checks on the final implementation**, across both workflows. **362/362 scanner tests (28 files)**. General typecheck, scanner typecheck/build and all **3 Nx app build tasks PASS**. `git diff --check` PASS and checkout app/library diff empty. [Machine-readable gate, exact evidence directories, current workflow identities and service identity](../../test-results/compact-review-audit/final-gate.json).

| HTTP regression | Actual result | Log |
|---|---|---|
| focused | 2/2 PASS | [focused-final.log](../../test-results/compact-review-audit/focused-final.log) |
| workflows | 5/5 PASS | [workflows-final.log](../../test-results/compact-review-audit/workflows-final.log) |
| resumption | 2/2 PASS | [resumption-final.log](../../test-results/compact-review-audit/resumption-final.log) |
| post | 1/1 PASS | [post-final.log](../../test-results/compact-review-audit/post-final.log) |
| fullscreen | 1/1 PASS | [fullscreen-final.log](../../test-results/compact-review-audit/fullscreen-final.log) |
| embedded | 2/2 PASS | [embedded-final.log](../../test-results/compact-review-audit/embedded-final.log) |
| analysis | 2/2 PASS | [analysis-final.log](../../test-results/compact-review-audit/analysis-final.log) |
| external | 1/1 PASS | [external-final.log](../../test-results/compact-review-audit/external-final.log) |
| contextual | 4/4 PASS | [contextual-final.log](../../test-results/compact-review-audit/contextual-final.log) |
| spacing | 2/2 PASS | [spacing-final.log](../../test-results/compact-review-audit/spacing-final.log) |
| mixed | 2/2 PASS | [mixed-final.log](../../test-results/compact-review-audit/mixed-final.log) |
| independent | 2/2 PASS | [independent-final.log](../../test-results/compact-review-audit/independent-final.log) |
| binding | 2/2 PASS | [binding-final.log](../../test-results/compact-review-audit/binding-final.log) |
| final persistent delivery | 2/2 PASS | [delivery-final.log](../../test-results/compact-review-audit/delivery-final.log) |

Structural logs: [scanner suite](../../test-results/compact-review-audit/scanner-suite-final.log), [typecheck](../../test-results/compact-review-audit/typecheck-final.log), [scanner typecheck](../../test-results/compact-review-audit/scanner-typecheck-final.log), [scanner build](../../test-results/compact-review-audit/scanner-build-final.log), [apps build](../../test-results/compact-review-audit/apps-build-final.log).

Memory validation **PASS: 128 links, 0 missing**; the same 7 advisory source-staleness warnings and undated memory index were reviewed without unrelated factual rewrites. [Memory validation log](../../test-results/compact-review-audit/memory-validation-final.log).

Verified entry, mapped-finding changes, reload **without dismissing a chooser or clicking any candidate action**, original runtime recovery, real Apply → rollback → rescan, fresh suggestions/Pending/Not run, and no candidate mutations from original initialization. The stopped-original case made exactly one original-initialization request; the healthy-original workflow reused it with zero initialization requests. Both resumed reviews have no session/validation. Dialog-only tabs/periods/open/close produced zero mutation requests; notes/decisions survive reload; a dialog opened during validation updates when that explicit operation finishes. Current Not run and historical Passed are shown in their respective periods. Existing suites cover delayed old responses, failed rescan/retry, source/candidate freshness, unavailable and failed checks, partial Apply, protected rollback, embedded/fullscreen state, missing/unloaded/unconfigured mappings, occupied candidate ports and repeated startup/retry without duplicate candidate mutations. Contextual regression uses the established four-target smoke selection plus its complete controls/navigation/failure cases; it is not a new claim of exhaustive arbitrary-app mapping coverage.

Development failures are retained: [late-health race](../../test-results/compact-review-audit/focused-health-race-failed.log), [trace-write interruption](../../test-results/compact-review-audit/focused-trace-write-failed.log), and [old outage simulation bypassed by automatic original recovery](../../test-results/compact-review-audit/embedded-outage-simulation-old.log). The first drove the detail-rebuild fix; the tooling capture was rerun; the outage simulation was updated to include the separated original initializer. Final results above are fresh passing runs.

Actual final browser screenshots, visually inspected: [automatic Before after rollback](../../test-results/compact-review-audit/automatic-before-after-rollback.png), [compact Decision](../../test-results/compact-review-audit/compact-decision.png), [Review details / History](../../test-results/compact-review-audit/review-details-history.png). Both workflow request/state evidence and screenshots remain under [manual delivery outputs](../../test-results/compact-review-audit/manual).

### Running disposable dashboard and English manual acceptance

[Open HTTP dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3A39f73a91b4195b315ea2ccff). Fresh disposable root **8zGU2i**: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-8zGU2i/project`. Supervisor **44347**, Companion **44351**, automatically recovered original **44436** (4200), procurement original **44353** (4201), HTTP **44384** (4320). The initial fixture original **44352** was ownership-verified and stopped by the recovery test; **44436** is its replacement owned by Companion. [Environment](../../test-results/compact-review-audit/manual-environment.json), [live listener/process ownership](../../test-results/compact-review-audit/service-ownership.txt). Both modes are left Reviewing after successful rollback, all Pending, with no current candidate or validation. The one-by-one review is `06ae04f4-8f0b-4d4d-adb8-94c3349cd120`; apply-first is `220b768c-e4e1-4a5d-a437-7760fe4a0df9`. Historical workflows and their evidence/backups remain on this disposable root. Prior **sctlu1** files/candidates/evidence were preserved offline; its service ownership was checked before stopping its services. No source-write test used Ahmed's active project.

1. Open the URL. Choose a workflow only if this browser has no saved choice. Confirm Before automatically renders the real Reading edge target and After says **No candidate prepared**. Switch mapped findings and reload; Before should return automatically.
2. Open **Review details**. Inspect Current review and History across all four tabs. Current validation is Not run; History retains Passed and Rolled Back. Use Tab/Shift+Tab, arrow keys and Escape; focus should return to Review details. Try a narrow window and scrolling.
3. Expand **Reviewer notes**, save a note, choose Defer or Needs review, and reload. Confirm the note and decision persist. Explicitly prepare the candidate before approving it.
4. On this disposable fixture, run **Approve fix → Validate accepted changes → Apply accepted changes to source → Rollback accepted changes**. Confirm automatic Before, the fresh suggestion, Pending/Not run and no prepared candidate. Repeat through **Change review workflow** for the other mode. **Start new review** explicitly begins a new Apply First batch if desired; resuming the existing rolled-back review does not.
5. Leave Ahmed acceptance **[ ]** until Ahmed records his result. To stop this delivery later, first recheck the recorded PID commands/parents and root against the ownership record, then `kill -TERM 44347`; this stops only this fixture's owned services and cleans this delivery's disposable candidates.

## Post-rollback rescan and review resumption — 2026-11-18

Session Guard **CONTINUE**: related lifecycle repair explicitly requested. Approved dashboard layout and transformation inventory remain unchanged. Ahmed personal acceptance **[ ]**. Scope: verified rollback → automatic authoritative source-context rescan → reconciled selection → fresh analysis/suggestion and explicit candidate preparation, including failure/retry and stale-response isolation. No automatic patch, candidate or batch preparation after rollback.

Reproduced on a fresh disposable HTTP target before editing: Analyze → candidate → accept → real configured validation → Apply → rollback restores source and original preview, but After Code reads “Current analysis: no candidate or validation…” instead of the real `<bdi dir="auto">{i.id}</bdi>` proposal. [Failing browser log](../../test-results/rollback-resume-audit/reproduce.log); [screenshot](../../test-results/review-workflows-2026-11-17T22-25-29.087Z/rollback-review-resumption-667e9-date-or-historical-approval/reproduced-no-suggestion.png). The existing source-context service already rescanned and rebuilt report data, but workflow restoration selected the closed historical workflow and its renderer replaced the suggestion. No fresh analysis was initiated automatically; the old “Start new review” operation was explicit and could rerun batch preparation.

Implementation checkpoint: reuse receipt-bound `verifiedSourceTransition`, `scan`/dashboard presentation/snippets, existing scan reconciliation and shared `begin` proposals. Add idempotent analysis-only resumption linked through `resumedFrom`; keep the prior workflow's decisions/validation/receipts/backups untouched. Configured scope is retained. Source/rule/expression/location correspondence chooses the new selection; reused IDs cannot select a different expression by ID alone. Missing findings choose a remaining in-scope actionable finding and explain the transition. A pre-Apply source/location anchor restores the reviewed finding after rollback. Reload rebuilds counts/files/navigation from the authoritative report and invalidates the prior document/preview requests. A failed rescan keeps rollback success/receipts visible, marks the snapshot unverified, disables current analysis/preview actions and owns one **Retry rescan** that never repeats rollback. The existing **Start new review** stays explicit for an untouched resumed analysis; it may begin batch preparation only after that user action.

Regression discovery: blocking an unverified source snapshot initially hid the existing recovery rollback action after partial Apply; receipt-backed Applied/Applying recovery now remains available with the same confirmation/journal guards. The partial-Apply browser then exposed an older verifier assumption that every planned accepted file had an Apply receipt. After a successful partial rollback, an unwritten planned file legitimately has no receipt. Rolled Back now validates every present receipt and requires every protected file plus the complete scan digest to equal the original baseline; Applied still requires all planned receipts. Unit resumption coverage includes a planned-but-never-written second file. Failed runs remain in `workflows-development.log` and `workflows-partial-receipt-failed.log`; no failure was hidden by loosening assertions.

The spacing regression retained an obsolete click on the workflow-entry screen after reloading a previously failed rescan. The live state was already Reviewing with `resumedFrom`, no candidate and no validation; [captured state](../../test-results/rollback-resume-audit/spacing-fresh-state-before-test-adjustment.json). The test now asserts automatic resumption and zero accepted changes instead of waiting for a screen that should no longer interrupt recovery.

Initial focused gate **2/2 PASS**, both manual and batch, plus **361/361 scanner tests**. The extended focused rerun additionally passed real delayed pre-rollback context responses and simulated rescan failure/retry with one rollback request. Final structural/browser regressions passed and the fresh manual service identity is recorded below. Preserve dated earlier evidence below.

### Final rollback-resumption gate and delivery — 2026-11-18

**Completed for this lifecycle flow. Ahmed acceptance [ ].** Memory validation **PASS: 123 links, 0 missing**; 7 pre-existing advisory source-staleness messages and the undated index were reviewed without unrelated rewrites. [Validation log](../../test-results/rollback-resume-audit/memory-validation-final.log). `git diff --check` PASS; app/library checkout diff empty. **361/361 scanner tests (28 files), 26/26 HTTP browser regressions**, plus **1/1 real delivery lifecycle smoke** on the fresh expanded fixture. General/scanner typechecks, scanner build and all 3 Nx app build tasks PASS. [Exact gate/evidence directories](../../test-results/rollback-resume-audit/final-gate.json). Structural logs: [typecheck](../../test-results/rollback-resume-audit/typecheck-final.log), [scanner typecheck](../../test-results/rollback-resume-audit/scanner-typecheck-final.log), [scanner build](../../test-results/rollback-resume-audit/scanner-build-final.log), [scanner suite](../../test-results/rollback-resume-audit/scanner-suite-final.log), [apps build](../../test-results/rollback-resume-audit/apps-build-final.log).

| HTTP regression | Result | Log |
|---|---|---|
| workflows | 5/5 PASS | [workflows-final.log](../../test-results/rollback-resume-audit/workflows-final.log) |
| resumption | 2/2 PASS | [resumption-final.log](../../test-results/rollback-resume-audit/resumption-final.log) |
| post | 1/1 PASS | [post-final.log](../../test-results/rollback-resume-audit/post-final.log) |
| contextual | 4/4 PASS | [contextual-final.log](../../test-results/rollback-resume-audit/contextual-final.log) |
| fullscreen | 1/1 PASS | [fullscreen-final.log](../../test-results/rollback-resume-audit/fullscreen-final.log) |
| embedded | 2/2 PASS | [embedded-final.log](../../test-results/rollback-resume-audit/embedded-final.log) |
| analysis | 2/2 PASS | [analysis-final.log](../../test-results/rollback-resume-audit/analysis-final.log) |
| external | 1/1 PASS | [external-final.log](../../test-results/rollback-resume-audit/external-final.log) |
| spacing | 2/2 PASS | [spacing-final.log](../../test-results/rollback-resume-audit/spacing-final.log) |
| mixed | 2/2 PASS | [mixed-final.log](../../test-results/rollback-resume-audit/mixed-final.log) |
| independent | 2/2 PASS | [independent-final.log](../../test-results/rollback-resume-audit/independent-final.log) |
| binding | 2/2 PASS | [binding-final.log](../../test-results/rollback-resume-audit/binding-final.log) |

Verified: exact restored source and complete input/policy identity; restored counts/file tree/navigation; selected source/rule/location and real fresh suggestion; Pending/Not run without candidate in both modes; no automatic candidate/patch/runtime or rerun of batch preparation; explicit Apply & Preview creates a different session with actual `<bdi>` in rendered DOM; reload keeps the fresh review; old decisions/validation/receipts/backups remain unchanged; simulated rescan outage marks the report snapshot unverified and offers exactly one Retry rescan, with one rollback request before/after retry; a delayed real pre-rollback response cannot overwrite the new document. Unit correspondence covers changed IDs, reused IDs for different expressions, disappeared findings, empty reports and configured scope. The complete lifecycle suite preserves partial-write recovery, conflict protection and unavailable/failed validation semantics. No new event bridge or cleanup observer.

[Actual post-rollback suggestion](../../test-results/rollback-resume-audit/manual/rollback-review-resumption-667e9-date-or-historical-approval/post-rollback-suggestion.png), [full post-rollback dashboard](../../test-results/rollback-resume-audit/manual/rollback-review-resumption-667e9-date-or-historical-approval/post-rollback.png), [delivery request/state/source evidence](../../test-results/rollback-resume-audit/manual/rollback-review-resumption-667e9-date-or-historical-approval/manual-delivery.json), [delivery smoke log](../../test-results/rollback-resume-audit/manual-smoke.log). Screenshots visually inspected. Final resumption suite also contains rescan-failed/retry and newly prepared candidate screenshots; exact directories are in the gate JSON.

Fresh persistent disposable fixture **sctlu1** is left **after successful rollback and automatic resumption**. [Environment/identity](../../test-results/rollback-resume-audit/manual-environment.json): supervisor **28713**, Companion **28719**, original Vite **28720/28721**, HTTP **28752**. Root `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-sctlu1/project`. Current report **67 total / 64 actionable / 25 scanned files / 17 affected files**; input `70f1f3c2d3563045bb73003f6ef8ce9c7efdd51f0da371e75eef49c5a76170d8`. Fresh workflow **d58077cb-a69d-4d03-bb79-42911180896f**, all Pending, no current candidate or validation. Historical workflow **a2313d15-6392-4b36-a4b0-0d0f7dbd8a83** remains Rolled Back with its prior Passed evidence and backed-up receipt; neither transfers to the fresh analysis. The source SHA is restored exactly to `752f6c1cadbf363279cb8e18ddbcf29906ded2970346f8db4e205b956e01c1f0`. Delivery made exactly one Apply and one rollback request.

The prior lkMEkt supervisor/children were positively identified before shutdown. [35 preserved source/state files](../../test-results/rollback-resume-audit/preserved-source-state-identity.json) were hash-verified after restoring its snapshot offline; no personal-target write tests ran there. Zxh4GA/EDczGl remain untouched. [Nine shared transformation modules](../../test-results/rollback-resume-audit/unchanged-transformation-inventory.json) and [package/lock identities](../../test-results/rollback-resume-audit/dependency-identity.json) match the pre-repair snapshot. No app/library checkout source, historical video asset, dependency, transformation family or approved layout was changed.

English manual steps:

1. Open [the working disposable dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea). Choose **Start manual review** to restore the delivered fresh review. It is already after rollback; no additional Start new review is required.
2. Confirm **67 findings**, `InvoiceTable.tsx` at the restored source location, After (Suggested Fix) `<bdi dir="auto">{i.id}</bdi>`, **0 accepted / Pending / validation Not run** and a real Before target. After live preview correctly has no prepared candidate. Expand **Historical review** to inspect the separate Rolled Back review and its preserved evidence.
3. Click **Apply & Preview** to prepare a new isolated candidate. Inspect actual Before/After and LTR/RTL; the fresh session must differ from the historical one. On this disposable fixture only, repeat **Approve fix → Validate accepted changes → Apply accepted changes to source → Rollback accepted changes**. Successful rollback automatically rescans, reconciles selection and restores a fresh suggestion without candidate preparation or inherited approval.
4. To reproduce the automated failure/retry and both modes on fresh targets, stop the owned manual fixture first, then run `RTL_REVIEW_SPECS=tests/e2e/rollback-review-resumption.spec.ts node tests/e2e/run-review-workflows.mjs` after `npm run rtl:scan:build`. The batch case simulates a rescan outage and proves Retry rescan sends no second rollback. Existing lifecycle regressions use `RTL_REVIEW_SPECS=tests/e2e/review-workflows-complete.spec.ts node tests/e2e/run-review-workflows.mjs`; post-Apply context uses `post-apply-context.spec.ts` with the same runner. All targets are disposable.
5. Before cleanup, recheck `ps -p 28713,28719,28720,28721,28752 -o pid=,ppid=,command=` against the environment record. `kill -TERM 28713` stops only this fixture's owned services and removes its disposable roots/candidates. Preserve the recorded offline lkMEkt/Zxh4GA/EDczGl targets. No push/publish/deploy/release or personal acceptance was performed.

## Source-to-preview binding repair — 2026-11-17

Session Guard **CONTINUE**, explicitly requested related fix. Ahmed acceptance **[ ]**. Scope: reusable data-only source/rule → application/runtime/route/selector mapping, honest mapping/candidate/runtime/target states, existing shared transformations/lifecycle preserved. No family expansion or dashboard redesign.

Diagnosis verified against the live disposable target `Zxh4GA` before editing: `apps/invoicing/src/main.tsx` directly imports `./odd-edges.css`; its index HTML contains `.edge-align` text “Reading edge”. Browser `/invoices` in both directions reports one actual element and a Vite stylesheet with exact source path/rule; computed `textAlign` remains `left` before repair. Resolver returns `mapping.kind=unresolved`, no routes, `sessionId=null`. [Code/runtime evidence](../../test-results/preview-binding-audit/diagnosis.json). `/invoices` on the toolbar is a hardcoded fallback in `syncRoute`, not verified binding evidence. Missing mapping, absent candidate and runtime failure are separate states. Existing example-only resolver cannot express arbitrary source files or a minimal project's application/runtime configuration.

Finite implementation checkpoint: add optional validated `rtl-preview.config.json`; source CSS selector/JSX context locators and explicit route references; runtime bridge checks actual source stylesheet/rule + target before Verified. Keep configured mappings unverified until runtime evidence. Extend owned Vite runtime handling to configured applications, with root/config/source/session-bound identities. Preserve code-only candidate preparation without mapping; never substitute a default route. Add disposable imported/unused/missing-target/multi-route cases and an independent minimal configured app, then structural/HTTP/browser and lifecycle regressions. The prior expansion evidence and services remain dated history below.

### Configuration and supported verification contract

`rtl-preview.config.json` is optional data-only configuration. It does not grant transformation approval or validation. Existing example mappings remain a compatibility fallback; new configured bindings do not depend on Atlas paths, odd-edges.css or finding IDs. Example for the independent disposable app:

```json
{
  "schemaVersion": 1,
  "applications": {
    "demo": {
      "viteConfig": "apps/samples/runtime.ts",
      "entry": "apps/samples/src/entry.tsx",
      "originalOrigin": "http://127.0.0.1:4200",
      "readySelector": "#root main",
      "dataAdapter": "none",
      "routes": [
        {
          "id": "examples",
          "path": "/examples",
          "ltr": "/examples?direction=ltr",
          "rtl": "/examples?direction=rtl"
        }
      ]
    }
  },
  "mappings": [
    {
      "source": "apps/samples/src/strange-name.css",
      "sourceSelector": ".read-edge",
      "targetSelector": ".read-edge",
      "routes": [{ "application": "demo", "route": "examples" }]
    }
  ]
}
```

- Source paths and Vite config/entry are project-relative under the existing apps/libs scope. Paths cannot escape or traverse symlinks; runtime origins are explicit local loopback HTTP origins, with Companion/dashboard/candidate ports reserved. Unknown fields, duplicate/ambiguous locators and unresolved route references are rejected. Locator strings remain script data, including `</script>` text. No dependency was added.
- CSS `sourceSelector` matches the scanner's actual stylesheet rule context; `targetSelector` is a DOM CSS selector. Multiple route references are supported. For supported non-CSS sources, optional exact scanner `context` plus a selector is an explicit author declaration, not inferred component reachability. There is no import graph or automatic route discovery.
- A configured CSS binding remains unverified until the actual route satisfies readiness, Vite CSSOM identifies the exact stylesheet/source rule, and the target both renders and matches that rule. Source-rule contribution/overridden/inactive CSS is reported separately. CSS beyond supported Vite development stylesheet provenance, shadow roots, arbitrary UI preparation and complex selector normalization is not claimed as verified. A stylesheet “not observed on this route” is not a global unused-code verdict.
- The app owns direction changes through explicit `ltr`/`rtl` URLs. The bridge checks the actual document direction, configured path/query, source hash, project, application, finding, route, session and nonce. It does not fabricate target content or force a visual pass. `dataAdapter: none` uses actual application data and explicitly leaves dataset equivalence unverified; the existing Atlas seed adapter is opt-in for configured Atlas fixtures.
- The owned candidate runtime accepts configured Vite applications/entries and reuses existing port reservation/start/stop/identity services. Candidate property inspection reuses the shared transformation proposal to report logical CSS after repair; it does not add another transformation table. Runtime descriptors are per selected application, and route/finding switches cannot inherit an unrelated runtime.
- Missing/unverified binding: **Prepare candidate** patches code only, without starting an unrelated application. A verified original target enables **Apply & Preview**; **Open candidate preview** applies only after the selected change is actually prepared and the matching runtime is ready. Missing mapping, not-yet-prepared candidate, stopped/failed runtime, unobserved stylesheet, missing target and target mismatch have separate states. No `/invoices` fallback is shown as verification.
- Preview configuration participates in the report input digest and has a separately pinned workflow digest/baseline. After editing configuration, regenerate the report and original runtime wrapper; existing sessions are not silently rebound. Configuration does not affect the shared transformation inventory, semantic decisions, accepted-only application or protected rollback. Generic configured **preview** now works; general final technical validation still requires the existing project/runtime checks and is never marked Passed by a mapping alone.

### Implementation and verification checkpoint

The [configuration resolver](../../tools/rtl-scanner/src/preview-configuration.ts), existing contextual resolver/bridge/dashboard renderer and owned runtime coordinator implement this contract. The [independent HTTP fixture](../../tests/e2e/preview-binding-fixture.mjs) deliberately creates `/examples` and `/secondary`, imports the actual CSS from its React entry, and renders `.read-edge`; it also creates an intentionally unimported stylesheet, an imported missing target, and an imported unconfigured source. This is an explicit disposable demonstration, not automatic discovery of an existing app route. [Browser test](../../tests/e2e/preview-binding.spec.ts) checks both review modes, Before/After, source-rule evidence, highlighting, LTR/RTL geometry, multiple routes, preserved viewport/direction/session, switching and reload, no implicit approval and no original-source write.

The existing Atlas expansion fixture now writes explicit source-selector mappings to the two real routes `/invoices` and `/customers` that load its entry/stylesheet. Only rendered probe rules are declared; conflict/intent/shorthand rules without elements are not invented as targets. Probe layout is adjusted inside the disposable HTML so its real elements are visible alongside the existing app. No application checkout source or historical asset changed. Existing code-only spacing/independent regressions now click **Prepare candidate** and request an owning runtime explicitly where appropriate.

Checkpoint: **359/359 scanner tests, general/scanner typechecks, scanner build and 3 Nx application build tasks PASS**. Independent configured binding **2/2 PASS**; mixed-family Apply/rollback with configured CSS mapping **2/2 PASS**. The final browser gate passed **24/24**; exact final logs and current service identity are recorded below. Development failures and fixes: an encoding assertion read generated JS instead of decoded bridge data; candidate startup initially read transient UI loading state rather than the current authenticated target report; a test assumed direction should leak between different findings; existing mixed tests clicked the new code-only action before binding verification. The actual causes were fixed without weakening source/apply safeguards or replacing rendered evidence.

[Configured RTL screenshot](../../test-results/preview-binding-2026-11-17T21-37-19.777Z/preview-binding-one-by-one-8cf50-ed-missing-unmapped-sources/configured-rtl.png), [LTR screenshot](../../test-results/preview-binding-2026-11-17T21-37-19.777Z/preview-binding-one-by-one-8cf50-ed-missing-unmapped-sources/configured-ltr.png), [unused stylesheet](../../test-results/preview-binding-2026-11-17T21-37-19.777Z/preview-binding-one-by-one-8cf50-ed-missing-unmapped-sources/unused-stylesheet.png), [missing target](../../test-results/preview-binding-2026-11-17T21-37-19.777Z/preview-binding-one-by-one-8cf50-ed-missing-unmapped-sources/missing-target.png), [measurements/network/session evidence](../../test-results/preview-binding-2026-11-17T21-37-19.777Z/preview-binding-one-by-one-8cf50-ed-missing-unmapped-sources/binding-evidence.json). Actual RTL text alignment moves from the left inset to the right inset (9px from the content edge including border/padding); LTR remains at the same inset. These screenshots were visually inspected.

The prior live `Zxh4GA` workspace was copied in full (symlinks preserved), then its supervisor `91443`/children were positively identified before shutdown to release owned ports. Its original root was restored offline from that snapshot; source/state were preserved, not used for write tests. Snapshot: `test-results/preview-binding-audit/preserved-Zxh4GA/`. Ahmed's older Applied target `EDczGl` remains untouched. Final delivery uses a fresh target.

Application isolation follow-up: the contextual regression exposed reuse of a stopped app's port by another application during candidate reconstruction. The session now persists bounded per-application port preferences, avoids another app's assigned port, and reuses its previous free port after restart. Corrupt assignments outside 4202–4212 are rejected before runtime access. The unchanged contextual regression now passes **4/4**, including distinct app origins, ordinary/scoped data, actual form interaction, runtime outage, Companion restart and no presentation-triggered writes. The initial failed run remains in `test-results/preview-binding-audit/contextual-final.log`; the passing run is `contextual-final-2.log`. This is a runtime binding fix, not a relaxed assertion.

### Final binding gate and disposable delivery — verified 2026-11-17

**Completed within the configured Vite preview contract. Ahmed personal acceptance [ ].** Memory validation: **118 links, 0 missing, PASS**; 7 pre-existing advisory source-staleness messages and the undated memory index were reviewed, with no unrelated factual rewrites. `git diff --check` PASS; `git diff --numstat -- apps libs` empty. [Memory validation log](../../test-results/preview-binding-audit/memory-validation-final.log). Final gate: **359/359 scanner tests (28 files), 24/24 HTTP browser tests**, general/scanner typechecks, scanner build and all 3 Nx app build tasks PASS. [Machine-readable gate and exact evidence directories](../../test-results/preview-binding-audit/final-gate.json). Build logs: [typecheck](../../test-results/preview-binding-audit/typecheck-final.log), [scanner typecheck](../../test-results/preview-binding-audit/scanner-typecheck-final.log), [scanner build](../../test-results/preview-binding-audit/scanner-build-final.log), [scanner suite](../../test-results/preview-binding-audit/scanner-suite-final.log), [application builds](../../test-results/preview-binding-audit/apps-build-final.log).

| Real HTTP suite | Result | Final log |
|---|---|---|
| `contextual-review-preview.spec.ts` | 4/4 PASS | [contextual-final-2.log](../../test-results/preview-binding-audit/contextual-final-2.log) |
| `review-workflows-complete.spec.ts` | 5/5 PASS | [workflows-final-2.log](../../test-results/preview-binding-audit/workflows-final-2.log) |
| `post-apply-context.spec.ts` | 1/1 PASS | [post-final-2.log](../../test-results/preview-binding-audit/post-final-2.log) |
| `fullscreen-review-preview.spec.ts` | 1/1 PASS | [fullscreen-final-2.log](../../test-results/preview-binding-audit/fullscreen-final-2.log) |
| `embedded-review-preview.spec.ts` | 2/2 PASS | [embedded-final-2.log](../../test-results/preview-binding-audit/embedded-final-2.log) |
| `review-one-by-one-analysis.spec.ts` | 2/2 PASS | [analysis-final-2.log](../../test-results/preview-binding-audit/analysis-final-2.log) |
| `review-one-by-one-preview.spec.ts` | 1/1 PASS | [external-final-2.log](../../test-results/preview-binding-audit/external-final-2.log) |
| `css-spacing-workflows.spec.ts` | 2/2 PASS | [spacing-final-2.log](../../test-results/preview-binding-audit/spacing-final-2.log) |
| `independent-expansion.spec.ts` | 2/2 PASS | [independent-final-2.log](../../test-results/preview-binding-audit/independent-final-2.log) |
| `directional-expansion-workflows.spec.ts` | 2/2 PASS | [mixed-final-2.log](../../test-results/preview-binding-audit/mixed-final-2.log) |
| `preview-binding.spec.ts` | 2/2 PASS | [binding-final-2.log](../../test-results/preview-binding-audit/binding-final-2.log) |

Required cases all passed in both modes: imported CSS and real matching element; deliberately unused stylesheet despite matching DOM; imported rule with absent target; unconfigured source with code-only preparation; one stylesheet on two genuinely different routes; applied candidate with source-rule evidence, highlight, LTR/RTL text geometry and viewport preservation; route/finding/session isolation and reload; independent configured application/runtime. Lifecycle regressions also cover multi-application origins, port collision/reconstruction/restart, outage/HTTP-200-without-app, decisions, validation, accepted-only Apply, protected rollback and current/historical context. The shared transformation modules are [hash-identical to the preserved pre-repair snapshot](../../test-results/preview-binding-audit/unchanged-transformation-inventory.json); no app/library checkout edits or dependency changes were introduced by this repair.

Fresh manual fixture **lkMEkt** is running, explicitly generated by `RTL_EXPANSION_FIXTURE=1 node tests/e2e/serve-review-workflows.mjs`. It declares `/invoices` and `/customers` bindings for genuinely imported/rendered disposable probes; this is not inferred application use. [Environment, exact configuration, authenticated service identity, measurements and request log](../../test-results/preview-binding-audit/manual-environment.json). Supervisor **9685**, Companion **9689**, original Vite **9690/9691**, HTTP **9726**; candidate session **97e5a172-da81-4e15-a19c-0846d8fe718f**, runtime **http://127.0.0.1:4202**. Recheck ownership before using PIDs. The candidate contains one alignment patch; all decisions remain Pending, validation Not run, no source Apply/rollback and source hash unchanged. Prior Zxh4GA is preserved offline; EDczGl remains untouched.

**Actual odd-edges screenshots**, visually inspected: [RTL Before/After](../../test-results/preview-binding-audit/odd-edges-preview-rtl.png), [LTR Before/After](../../test-results/preview-binding-audit/odd-edges-preview-ltr.png), [full dashboard](../../test-results/preview-binding-audit/odd-edges-dashboard-rtl.png). Browser DOM Range measured RTL original text at left=0px/right=120.328125px, candidate at left=120.328125px/right=0px; LTR both left=0px. Both frames identify their own actual source stylesheet and one highlight overlay. `/customers` also verifies the real target. [Repeatable delivery smoke](../../test-results/preview-binding-audit/manual-smoke.mjs) and [result](../../test-results/preview-binding-audit/manual-smoke.log). Configured-minimal-project final screenshots, unused/missing states and geometry are in the binding suite's evidence directory linked by the gate JSON.

English manual steps:

1. Open [the disposable dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3A39f73a91b4195b315ea2ccff). Choose **Start manual review** to restore the delivered Pending session.
2. Select `odd-edges.css` → `text-align: left;`. Confirm **Route: /invoices · Verified target**, one real “Reading edge” target, and the Before source-rule evidence. The candidate patch is already prepared; **Open candidate preview** reopens the matching After runtime. On a fresh session the verified action is **Apply & Preview**.
3. Toggle **LTR/RTL**, choose a viewport, then **Expand → Split**. In RTL, Reading edge stays left in Before and moves right in After; LTR stays left. Inspect the highlighted real elements. Switch the configured route to `/customers`, then return to `/invoices`; session and candidate must remain the same.
4. Select an unconfigured finding. Expect **Unverified** and a mapping explanation, with **Prepare candidate** available for supported transformations. No unrelated route should be opened. Missing source/rule and missing target have their own messages; neither means no transformation exists.
5. Run the independent imported/unused/missing/multi-route acceptance with `node tests/e2e/preview-binding-fixture.mjs` after scanner build and after stopping the owned manual fixture. General regressions use `RTL_REVIEW_SPECS=tests/e2e/<spec> node tests/e2e/run-review-workflows.mjs`; add `RTL_CONTEXTUAL_BASELINE=1`, `RTL_SPACING_FIXTURE=1` or `RTL_EXPANSION_FIXTURE=1` for the corresponding fixture. Structural commands: `npm run typecheck`, `npm run rtl:scan:typecheck`, `npm run rtl:scan:build`, `npm run rtl:scan:test`, `npm run build`.
6. Configuration changes require a fresh report and original wrapper; do not reuse a workflow bound to an earlier config digest. The complete independent config example above declares application/runtime, routes, source rule and target without fixture-specific resolver code.
7. To stop only this disposable delivery, first verify `ps -p 9685,9689,9690,9691,9726 -o pid=,ppid=,command=` against the environment record, then run `kill -TERM 9685`. Its owned temporary roots/candidates are disposable. Preserve the recorded offline Zxh4GA/EDczGl projects. No personal approval or final source Apply was performed for this delivery.

The optional mapping is a preview contract, not automatic import discovery or universal project onboarding. Generic final technical validation retains the existing checks and unavailable/blocking behavior; a verified mapping never grants acceptance, validation Passed or original-source application. No transformation expansion, dashboard redesign, publish, push, deploy or release.

## Master expansion contract — 2026-11-17

Session Guard: **CONTINUE** — explicit dedicated expansion brief. This section supersedes the previous spacing-only scope; historical evidence/approval states below are preserved. Ahmed acceptance: **[ ] pending**. Discovery checked the shared inventory, parsers, workflow coordinator, scanner discovery, and existing CSS/browser tests. No `.specify`/`specs` or Spec Kit task artifacts are present in this checkout. Existing dirty/untracked files are baseline work, not authorized cleanup.

Finite contract (initial checkpoint; implementation/evidence updated here): all proposals remain Pending until explicit human acceptance. Deterministic means reproducible syntax, not proven semantic intent. CSS conversions assume horizontal-tb and LTR-authored reading edges; cross-file cascade, inherited writing mode, and product semantics require review.

| ID / family | Detection | Suggestion / transformation | Syntax | Preconditions | Review requirement | Manual | Batch | Verification / status |
|---|---|---|---|---|---|---|---|---|
| E0 spacing | Existing physical and shorthand rules | Existing `css-spacing-logical`; reuse unchanged bounds | Plain CSS | Flat single-class/custom-css, literal values, no cascade/intent conflicts | Reading-edge intent | Existing | Existing | PASS: existing spacing regression 2/2 below |
| E1 alignment | Existing text-align/float/clear | Add text-align left/right → start/end; float/clear remain actionable detection-only | Plain CSS + direct React style literal | Shared flat-rule/object guards; no text-align conflicts | Reading alignment, never numeric/physical intent by name | Implemented | Implemented | PASS: focused unit + mixed-family HTTP gate below |
| E2 positioning | Existing physical edge/geometry | Add left/right → inset-inline-start/end | Plain CSS + direct React style literal | Explicit absolute/fixed position, no inset/shorthand/logical/transform conflicts | Containing block and anchor semantics | Implemented | Implemented | PASS: geometry + mixed-family HTTP gate below |
| E3 borders/corners | Existing directional borders/corners | Add border side (and width/style/color) + four corner renames | Plain CSS + direct React style literal | No border shorthand/logical/duplicate conflicts; bounded literal grammar | Reading edge/corner; horizontal-tb | Implemented | Implemented | PASS: cascade/format/idempotence + real DOM gate below |
| E4 directional icons | Existing imported MUI icons/literal arrows | Add explicit CSS `rtl-icon: progression-right` opt-in → scoped `:dir(rtl)` scale; unmarked/MUI/literal icons stay detection-only | Plain CSS marked single-class icon rule | Explicit author semantics, display box, no transform/scale/animation/direction conflicts; inspect icon-only DOM | Confirm progression, no text/brand/trend/icon-framework mirroring | Implemented | Implemented | PASS: marked/unmarked icons, DOM/styles/screenshots below |
| E5 mixed content | Existing direct id/name/address/email sink detection | Extend bdi wrapper from identifier.id to identifier.name/email/address; preserve expressions/text | JSX/TSX direct text children | Native text containers/known existing Link; no dir/bdi/bdo/unicodeBidi/spread/unsafe ancestors | Auto direction and punctuation/copy review | Implemented | Implemented | PASS: ancestors, canonical text and rendered bdi below |
| E6 syntaxes | Existing CSS, TS inline, Emotion/MUI extraction; utility gap | Add bounded direct React style adapter for E0–E3; add static utility detection with actionable explanation | CSS + JSX/TSX inline; utility className detection | AST property identity, no spreads/computed/dynamic/shared objects; custom-inline | Same family intent plus framework ownership | Implemented | Implemented | PASS: standalone HTTP/Vite candidate evidence below |
| E6 exclusions | Emotion templates/MUI sx/theme already detected | Detection-only; clarify owner/runtime processing. Static utility tokens detection-only until version/build semantics established | CSS-in-JS, utility variants | No claim of framework transformation coverage | Product decision for RTL plugin ownership / utility compiler | Code review | Skipped with reason | No new dependency or general framework/runtime discovery planned |

Tasks/dependencies: **E0 audit → E1–E3 shared descriptor/guards → E6 inline adapter; E4 explicit opt-in and E5 ancestor-safe extension are independent; E7 mixed workflow integration → E8 final integration gate → consolidated handoff.** Reuse PostCSS/value-parser/TypeScript, original-coordinate patches, shared inventory and existing lifecycle. No new dependencies planned. Unsupported code repair never determines route-preview availability. Scanner source discovery remains flat Nx `apps`/`libs` with project.json, not arbitrary framework onboarding.

Checkpoint 22:47 Cairo: E1–E6 implemented in shared inventory; 345/345 scanner tests passed. Real HTTP mixed-family manual/batch acceptance **2/2 PASS** (58s): 13 supported proposals across three arbitrary files, original/candidate LTR/RTL computed styles, absolute-offset geometry, scoped icon scale, unchanged mixed-script copying, explicit decisions, reconstruction, reload, validation, accepted-only Apply, fullscreen/current-preview and protected rollback. Evidence: `test-results/review-workflows-2026-11-17T20-44-51.063Z/` (JSON, screenshots, traces). Early test failures exposed an incorrect expected probe count and declaration semicolon expectation; corrected from actual parser output. The RTL-ancestor detection regression was fixed without weakening the existing test; detection stays visible while transformation preserves explicit direction. Previous unsupported `{c.name}` regression anchors now use the existing unsupported money call because name is intentionally newly supported.

E7/E8 completed in the final gate below: independent HTTP candidate rendering, builds/typechecks/full suite, workflow/preview/persistence/transition regressions, screenshot review and fresh manual service delivery. Blocker: generic integrated runtime discovery is still Atlas-specific; standalone candidates must remain Unavailable for final Apply unless an approved runtime contract exists. Independent real Vite rendering will be recorded separately, never treated as integrated Passed. No new dependencies; no app checkout/source changes. Previous spacing-only supervisor 78610 was positively identified and stopped after copying environment/state to `test-results/rtl-expansion-audit/prior-*`; it was analyze-only. Ahmed’s preserved Applied target EDczGl is untouched.

 No original-source write against Ahmed’s target is authorized for verification; only fresh disposable targets.

### Implemented examples and bounded classifications

**Implemented / semantic review required** (deterministic range-based proposals, Pending decisions):

| Family | Before | After | Assumption / boundary |
|---|---|---|---|
| Spacing (existing CSS, new inline adapter) | `margin-left: 12px !important;` / `marginLeft: 11` | `margin-inline-start: 12px !important;` / `marginInlineStart: 11` | Existing CSS bounds unchanged; React numeric values retain px semantics |
| Alignment | `text-align: left;` / `textAlign: 'right'` | `text-align: start;` / `textAlign: 'end'` | Reading alignment; physical numeric/map alignment must be rejected/deferred |
| Positioning | `position: absolute; left: 12px;` | `position: absolute; inset-inline-start: 12px;` | Explicit absolute/fixed position; inspect containing block and clearance; no relative/sticky/coordinate rewrite |
| Border side | `border-left: 3px solid red;` | `border-inline-start: 3px solid red;` | Width/style/color side longhands also supported; conservative literal grammar and conflict checks |
| Corner | `border-top-right-radius: 9px;` / `borderBottomLeftRadius: 6` | `border-start-end-radius: 9px;` / `borderEndStartRadius: 6` | Four corners; one/two literal radii, no asymmetric/elliptical shorthand decomposition |
| Directional icon | `.next { /* rtl-icon: progression-right */ display:inline-block; ... }` | Original rule plus `.next:dir(rtl) { scale: -1 1; }` | Explicit author opt-in; class targets only the graphic; no framework, text, logo, trend or transform ownership conflict |
| Mixed content | `({person.email}) / {person.name} / {person.address}` | `(<bdi dir="auto">{person.email}</bdi>) / <bdi dir="auto">{person.name}</bdi> / <bdi dir="auto">{person.address}</bdi>` | Direct identifier.member text sinks; text/expressions unchanged; punctuation and copying require review |

**Detection only / actionable manual follow-up**: float/clear need formatting-context and wrapping review; asymmetric margin/padding/inset/border-radius shorthands need cascade/corner intent review; existing MUI icon imports/literal arrows need navigation vs trend/brand/framework ownership review; nested/call/composite bidi expressions need container/content semantics review; CSS-in-JS/MUI sx/theme require processor/owner analysis before raw logical source changes; static JSX utility tokens require installed compiler/version/config and variant semantics. These remain visible with no patch and explicit blockers. Utility detection covers static string `className` and a finite physical-token/variant grammar, not dynamic class builders or HTML class attributes.

**Unsupported / product or architecture decisions**: arbitrary-framework source discovery (scanner retains flat Nx apps/libs metadata); general runtime/route onboarding and immutable historical runtimes; automatically resolving cross-file cascade, custom-property/function values, interpolated/escaped/shared CSS-in-JS, vertical writing modes, arbitrary icon semantics and formatted/composite text. No universal automatic migration claim.

Implementation reuses PostCSS **8.5.29**, postcss-value-parser **4.2.0**, TypeScript **~5.9**, existing source-range hashes, candidate composition, review persistence, validation, accepted-only journal and protected rollback. Existing `@mui/stylis-plugin-rtl` is already a generated-style runtime processor (`libs/design-system/src/runtime.tsx`), not a source-patch inventory; raw MUI conversions could double-process directions and stay blocked. No dependency/package/lock change was made by this task. Existing JSX id codemod and spacing codemod were extended/dispatched, not replaced by whole-file printers or unrestricted replacements.

Overlap correction: workflow computes the entire conflicting-entry set before removing patches. A marked icon rule containing spacing produces overlapping full-rule/declaration proposals; **both** are blocked with `CONFLICTING_PATCH`. The independent HTTP test verifies this concrete case. Source identity, accepted-only hashing, stale-source checks, unrelated edits and protected rollback are retained.

### Consolidated English manual acceptance — Ahmed only [ ]

1. Open the delivered disposable dashboard URL. Choose **Review One by One → Start manual review**. Confirm semantic-review reasons and Pending status. In `odd-edges.css`, inspect text alignment, absolute offset, border, corner and the explicitly marked icon; in `StrangeProbe.tsx`, inspect inline styles and direct mixed-content sinks. Compare exact Code Before/After.
2. Apply supported proposals to the isolated candidate. Review **Change inventory** across files. Confirm intentional physical rules, inset/logical conflicts, shorthands, utility tokens and unmarked/MUI icons have no automatic patch. No original source should change.
3. Open the actual candidate route from the inventory/runtime origin, or select the existing mapped `InvoiceTable.tsx` finding to use embedded previews. CSS files with no contextual mapping stay explicitly code-only. Toggle **LTR/RTL**, viewports and **Expand/Close**; interact with the real app. Inspect edge movement, border/corner sides, progression icon orientation, punctuation and copying. Never treat an unavailable mapping as Passed.
4. Accept a mix of spacing/alignment/positioning/border/corner/icon/bidi changes; reject `marginLeft:11`; defer `text-align: right` in `another-random-name.css`. Confirm reconstruction removes only rejected/deferred edits. Reload and confirm saved decisions and session identity.
5. On this disposable target only, click **Validate accepted changes**. Inspect all check results. Explicitly **Apply accepted changes to source** after Passed; confirm accepted-only files, receipt/backups, Current source preview, fullscreen and reload. Historical validation/Before must stay labeled historical/unavailable. **Rollback accepted changes** and confirm original files and usable previews return.
6. Use **Change review workflow** to repeat with **Apply First, Review Later → Apply to candidate & review**. Supported edits are prepared on the isolated candidate and remain Pending; inspect skipped reasons and repeat selective decisions/validation/Apply/rollback. Keep Ahmed acceptance unchecked until Ahmed records his own result.
7. For standalone portability, run `node tests/e2e/independent-expansion.mjs` after scanner build and with dashboard ports free. This automated disposable run exercises both HTTP workflows and real LTR/RTL Vite candidates. Generic integrated runtime remains **Unavailable**, and final Apply must be blocked. This evidence does not authorize a generic runtime mapping or replace personal acceptance.

Final gate totals, exact log/evidence paths and running-service identity are recorded below after completion. No publish, push, deploy, release or production-scene change.


### Final master-expansion gate and delivery — 2026-11-17

الحالة: **Completed within the finite supported contract; broader families remain Partial as listed below.** Codex verification completed; **Ahmed manual acceptance [ ]**. لا تغيير في apps/libs بمصدر checkout ولا package dependencies أو أصول الفيديو؛ لا publish/push/deploy/release.

| Requested family | Completed scope | Partial / detection-only / blocked remainder | Manual / batch |
|---|---|---|---|
| CSS spacing | Existing bounded CSS unchanged; new direct React numeric/string adapter | Shorthands, dynamic/cascade/physical intent remain blocked | PASS / PASS |
| Alignment | Physical text-align → start/end in CSS/direct React style | float/clear, content-specific/table/framework alignment require manual semantic review | PASS / PASS |
| Positioning | left/right → inline inset with explicit absolute/fixed positioning | Relative/sticky, transforms/coupled geometry, fixed physical coordinates and unresolved anchors remain manual | PASS / PASS |
| Borders/corners | Side border and width/style/color longhands; four corner properties; direct inline equivalents | Shorthand/logical conflicts, functions/unsupported colors/elliptical shorthands and vertical modes remain blocked | PASS / PASS |
| Directional icons | Explicitly marked, custom-owned CSS progression graphic → scoped :dir(rtl) scale | Unmarked/MUI/imported/literal icons detected where supported, no indiscriminate mirroring; product semantics remain manual | PASS / PASS |
| Mixed-direction content | Direct identifier.id/name/email/address children wrapped in bdi, canonical expression/text retained | Calls, nested access, composite expressions, unsafe containers or direction/isolation/unknown ancestors stay manual | PASS / PASS |
| Source syntaxes | Plain CSS and direct native React JSX/TSX style literals; utility static class detection added | Emotion/MUI CSS-in-JS and utilities remain detection-only; generic framework/runtime discovery needs architecture/product work | PASS / PASS for declared adapters |

Every proposal requires explicit semantic review. All seven families have demonstrated supported behavior; none is claimed universally automated. Generic integrated runtime is the substantial remaining blocker: independent candidates render correctly in an externally owned real Vite process, but integrated validation remains **Unavailable** and original-source Apply remains disabled. No stub runtime or fake Passed evidence was added.

| Final command | Result | Log |
|---|---|---|
| `npm run typecheck` | PASS | `test-results/rtl-expansion-audit/typecheck-final.log` |
| `npm run rtl:scan:typecheck` | PASS | `scanner-typecheck-final.log` in the same directory |
| `npm run rtl:scan:build` | PASS | `scanner-build-final.log` |
| `npm run rtl:scan:test` | **346/346 PASS, 27 files** | `scanner-suite-final.log` |
| `npm run build` | PASS, 3 Nx tasks | `apps-build-final.log` |
| HTTP browser gate below | **22/22 PASS** | Per-suite logs/JSON/screenshots/traces below |

All browser targets were freshly generated disposable projects. General browser runs use `RTL_REVIEW_SPECS=tests/e2e/<spec> node tests/e2e/run-review-workflows.mjs`; contextual coverage adds `RTL_CONTEXTUAL_BASELINE=1`, mixed families add `RTL_EXPANSION_FIXTURE=1`, spacing adds `RTL_SPACING_FIXTURE=1`. Standalone uses `node tests/e2e/independent-expansion.mjs`. Run suites on separate fresh environments to avoid sharing a previously completed workflow. The independent runner verifies free ports and Companion project-root identity before tests and stops only its owned children.

| Coverage | Exact spec under tests/e2e | Current result | Log / evidence directory |
|---|---|---|---|
| Workflow/persistence/isolation/stale-source/apply/rollback | `review-workflows-complete.spec.ts` | **5/5 PASS** | [workflows-final.log](../../test-results/rtl-expansion-audit/workflows-final.log); `test-results/review-workflows-2026-11-17T20-49-25.204Z/` |
| Post-apply/current preview | `post-apply-context.spec.ts` | **1/1 PASS** | [post-apply-final.log](../../test-results/rtl-expansion-audit/post-apply-final.log); `test-results/review-workflows-2026-11-17T20-51-15.708Z/` |
| Fullscreen | `fullscreen-review-preview.spec.ts` | **1/1 PASS** | [fullscreen-final.log](../../test-results/rtl-expansion-audit/fullscreen-final.log); `test-results/review-workflows-2026-11-17T20-51-41.213Z/` |
| Contextual previews | `contextual-review-preview.spec.ts` | **4/4 PASS** | [contextual-final.log](../../test-results/rtl-expansion-audit/contextual-final.log); `test-results/review-workflows-2026-11-17T20-51-51.728Z/` |
| Embedded/concurrent ports/HTTP200 negative | `embedded-review-preview.spec.ts` | **2/2 PASS** | [embedded-current-final-2.log](../../test-results/rtl-expansion-audit/embedded-current-final-2.log); `test-results/review-workflows-2026-11-17T20-57-22.124Z/` |
| Manual analysis/retry | `review-one-by-one-analysis.spec.ts` | **2/2 PASS** | [analysis-current-final.log](../../test-results/rtl-expansion-audit/analysis-current-final.log); `test-results/review-workflows-2026-11-17T20-56-54.628Z/` |
| External candidate LTR/RTL | `review-one-by-one-preview.spec.ts` | **1/1 PASS** | [external-current-final.log](../../test-results/rtl-expansion-audit/external-current-final.log); `test-results/review-workflows-2026-11-17T20-56-59.602Z/` |
| Mixed families both workflows | `directional-expansion-workflows.spec.ts` | **2/2 PASS** | [mixed-final.log](../../test-results/rtl-expansion-audit/mixed-final.log); `test-results/review-workflows-2026-11-17T20-54-01.767Z/` |
| Existing spacing both workflows | `css-spacing-workflows.spec.ts` | **2/2 PASS** | [spacing-final.log](../../test-results/rtl-expansion-audit/spacing-final.log); `test-results/review-workflows-2026-11-17T20-54-58.988Z/` |
| Independent portable HTTP workflows | `independent-expansion.spec.ts` | **2/2 PASS** | [independent-final.log](../../test-results/rtl-expansion-audit/independent-final.log); `test-results/independent-expansion-2026-11-17T20-55-46.378Z/` |

Memory/diff gate: `python3 docs/project-memory/validate.py` **PASS**, 114 links / 0 missing; seven existing advisory staleness warnings and the existing undated index were reviewed, without rewriting unrelated historical facts. `git diff --check` passed; `git diff --numstat -- apps libs` is empty.

Remaining failures: **none in the final gate**. Development failures are retained in audit logs: a commented alignment value was initially missed, inline string spacing was incorrectly excluded, a scanner regression suppressed an RTL ancestor risk, an expected probe count/semicolon and one-line locator were wrong, and the independent harness initially used an invalid store filename. Those causes were fixed and rerun. The old embedded/manual tests initially asserted retired single-patch endpoints and exact query-free preview URLs; they now verify current shared-workflow inventory/ranges/request counts, retry, concurrent owned ports, actual iframe DOM, unavailable bridge, external LTR/RTL rendering and zero original-source writes. This updates the observed interface; guards and assertions were not bypassed. See `embedded-final.log`, `embedded-current-final.log` and the successful current logs for the failure/resolution trail.

Real screenshot QA: inspected independent LTR/RTL PNGs and Atlas mixed-family candidate screenshots. The independent arrow points right in LTR and left in RTL; physical borders/corners and offsets move as measured. Atlas probes are disposable fixture content, not replacement preview pages. Actual textContent remains unchanged; manual punctuation/copy UX still belongs to Ahmed. `mixed-family-acceptance.json` and `standalone-evidence.json` record styles/geometry/text, decisions and receipts. Old id/name-only exclusions in workflow tests now point to the existing unsupported money expression, preserving unsupported-preview coverage.

### Current manual service identity and reproducible commands

Working URL: http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3A39f73a91b4195b315ea2ccff

Fixture: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-Zxh4GA/project`. Dashboard shows **67 total / 64 actionable findings; 30 supported proposals** (13 in the newly added probes). Workflow `707c658d-c57f-47df-82ef-c7ad9447700c` is analyze-only, all Pending, no candidate, validation Not run; original app rendered RTL with no invoice bdi applied and no page errors. [Environment/inventory](../../test-results/rtl-expansion-audit/manual-environment.json), [dashboard screenshot](../../test-results/rtl-expansion-audit/manual-analysis.png), [service log](../../test-results/rtl-expansion-audit/manual-services.log).

| Service | PID | Port |
|---|---|---|
| Owned disposable supervisor | `91443` | — |
| Companion | `91446` | 4318 |
| Original invoicing Vite | `91447` | 4200 |
| Original procurement Vite | `91448` | 4201 |
| Dashboard HTTP | `91479` | 4320 |

No candidate service is running. Ownership was checked using `ps` parent/command/config paths and listening ports. Cleanup for this exact fixture:

```sh
ps -p 91443 -o pid,ppid,command
kill -TERM 91443
```

The supervisor stops its owned children/candidates and removes this disposable fixture. It does not stop unrelated port owners. To reproduce after stopping it, from the repository root:

```sh
npm run rtl:scan:build
RTL_EXPANSION_FIXTURE=1 node tests/e2e/serve-review-workflows.mjs
# Use the newly printed environment path; PIDs/roots change each run.
# Automated mixed-family verification on a fresh disposable target instead:
RTL_EXPANSION_FIXTURE=1 RTL_REVIEW_SPECS=tests/e2e/directional-expansion-workflows.spec.ts node tests/e2e/run-review-workflows.mjs
# Standalone portability, with the dashboard ports free:
node tests/e2e/independent-expansion.mjs
```

Ahmed's earlier Applied target `EDczGl` remains offline and untouched; historical receipt/backups/restore command below remain historical. The old analyze-only spacing service was stopped only after ownership verification and preservation of its environment/state. Use the one consolidated English checklist above for this new target. Do not mark personal acceptance from these Codex test results.


## CSS spacing transformation family — verified 2026-11-17

Session Guard: **CONTINUE**؛ هذه الجلسة تنفذ handoff المعتمد صراحة. لم تتغير قواعد AGENTS.md. الحالة: **PASS ضمن العقد المحدود أدناه**؛ قبول Ahmed الشخصي **[ ]**. لا Spec Kit artifacts مهيأة عُثر عليها؛ استُخدمت هذه الخطة وقائمة Tasks فيها، دون تثبيت tooling أو إنشاء خطة منافسة.

### capability inventory

| Finding family | Detection exists | Suggestion exists | Transformation exists | Limitations | Existing parser/library |
|---|---|---|---|---|---|
| Bidi identifier text | نعم | نعم | `bidi-isolate-auto` السابق | direct identifier.id JSX؛ app/lib scanner scope؛ غير ذلك شرح يدوي | TypeScript AST |
| Physical CSS margin/padding left/right | نعم `RTL.CSS.PHYSICAL` | اقتراح scanner عند policy approval المطابق؛ الآن أيضًا proposal parser-backed يحتاج review | **`css-spacing-logical` جديد** | `.css`، custom-css، flat simple class rule؛ العقد أدناه | PostCSS + postcss-value-parser |
| Physical border/alignment/float/clear | نعم | bounded policy suggestions لبعض الحالات | لا في هذه المرحلة | ليست spacing longhands المدعومة | PostCSS / value-parser / TS extraction |
| Asymmetric shorthand | نعم `RTL.CSS.SHORTHAND` | مراجعة يدوية | لا | لا split أو reverse للشورتهاند؛ أثر cascade يحتاج مراجعة | value-parser |
| Positioned edges / transforms / geometry | نعم | مراجعة دلالية | لا | لا تحويل إحداثيات physical مقصودة أو توسيع للعائلة | PostCSS / TypeScript |

المصدر: `css.ts`, `rules.ts`, `codemod.ts`, `eligibility.ts` و`transformations.ts`. dependencies الموجودة: PostCSS `8.5.29`، postcss-value-parser `4.2.0` وTypeScript `~5.9`. **لا dependency جديدة** ولا تعديل لـ package.json/lock من هذه المرحلة.

### عقد الاقتراح والتحويل

- [x] **معنى التحويل**: يُفترض `horizontal-tb` ومصدر مكتوب على أساس LTR، وأن المسافة مقصودة كـ reading-start/end. عند RTL تنتقل الجهة عمدًا؛ لا يحافظ التحويل على left/right كإحداثيات ثابتة. الوراثة وCSS خارج الملف ودلالة المنتج يجب مراجعتها صراحة. التصنيف **Assisted** والسبب يبدأ `Requires semantic review`؛ وجود patch ليس approval أو Validation Passed.
- [x] المدعوم: lowercase `margin-left`, `margin-right`, `padding-left`, `padding-right` في stylesheet `.css` بأي اسم داخل source scope الحالي. rule مباشرة تحت root، selector صنف واحد مثل `.card` وowner `custom-css`. القيم literal مفردة بوحدات `px/em/rem/%/vw/vh/ch/ex` أو صفر بلا وحدة؛ margin يسمح بالسالب و`auto`، padding يستبعد السالب وauto. لا defaults تعكس كل left/right.
- [x] PostCSS يطابق finding ID/range/declaration والنص الأصلي؛ patch يغطي finding declaration الأصلية كاملة مع expected SHA-256 لها، لكنه يغيّر **اسم الخاصية فقط** ويعيد tail الأصلية حرفيًا. لذلك Before/After يعرض التصريح والقيمة كاملين. القيمة، whitespace، CRLF، التعليقات و`!important` تبقى كما هي. value-parser يفحص بنية القيمة. لا stringify للملف كله أو تغيير CSS للتطبيق الحقيقي.
- [x] أسباب skip صريحة: nesting/at-rules/conditional selectors، selectors المركبة، owner غير واضح، unitless nonzero، قيم functions/var/env أو compound values، writing-mode غير horizontal أو أي direction في الملف، وposition/all في rule. التكرار في selector أو wildcard conflict في الملف محجوب. الشورتهاند والـ logical longhands من العائلة نفسها أو duplicate property محجوبة، بما فيها اختلاف حالة أحرف property. لا محاولة لتسوية cascade عبر الملفات.
- [x] existing logical declarations تُترك؛ وجودها مع physical من العائلة نفسها يمنع الاقتراح. opposite physical longhands يمكن اقتراحهما منفصلين من الأصل، ثم الرفض يعيد intended patch وحده. `/* rtl-physical: reason */` داخل rule وpolicy exceptions يتركان المسافة physical مع سبب واضح.
- [x] حدود policy: لا يُعاد ربط source-pinned approvals أو exceptions أو ترقيتها تلقائيًا. إذا أصبح pin قديمًا في candidate، يحجب scanner التحقق/Apply وفق الحماية القائمة؛ ترحيل هذه الأدلة ليس جزءًا من العائلة. لا ادعاء بأن سلامة syntax تثبت النية أو كامل cascade.

```css
/* Before */
.card { margin-left: 12px !important; padding-right: 8px; }
/* Proposed After — requires explicit semantic acceptance */
.card { margin-inline-start: 12px !important; padding-inline-end: 8px; }
```

### Tasks / integration

- [x] inventory واحدة في `transformations.ts`: dispatcher نفسه تستعمله `classifyEligibility` و`ReviewWorkflowStore.begin` لكلا الوضعين. registry المعروض مشتق منها. لم يُضف if خاص بأسماء fixtures أو Atlas داخل التحويل.
- [x] إزالة InvoiceTable-only eligibility fallback؛ eligibility بلا source لا تدعي تطابق AST. نطاق scanner الحالي يبقى Nx-compatible `apps/libs` بملفات project.json؛ لا ادعاء onboarding عام.
- [x] `createReviewSession(root, sourcePath)` يدعم source anchor عام مع path/regular-file checks. workflow يستعمل InvoiceTable anchor عند وجوده للتوافق مع runtime السابق، وإلا أول source proposal. CSS-only candidate في مشروع مصغّر بلا InvoiceTable نجح. hashing للمرشح يتبع session.sourcePath؛ النسخ والـ original ranges وselective recomposition والحماية القائمة محفوظة.
- [x] قرار/patch persistence، Accepted-only validation/source apply، backups/receipts/rollback وpost-apply reconciliation أعيد اختبارها. فحص patched bdi DOM خاص بعائلة bidi؛ لم تُزعم bdi كدليل لتغييرات CSS.
- [x] fixtures opt-in فقط في harness عبر `RTL_SPACING_FIXTURE=1`. ملفان بأسماء arbitrary، أكثر من تغيير في الملف نفسه، logical property موجودة، shorthand conflict وphysical intent صريح. working apps/libs لم تُعدّل.
- [x] فحوص parser/portability + متصفح manual/batch + regressions + typecheck/build كاملة أدناه.
- [ ] Ahmed manual acceptance؛ لا يعلّمها agent.

### actual acceptance evidence

الاختبار `tests/e2e/css-spacing-workflows.spec.ts` اجتاز **2/2** على هدف مؤقت جديد في **46.8s**؛ دليل النسخة النهائية `test-results/review-workflows-2026-11-17T19-54-06.862Z/`:

- [manual flow JSON](../../test-results/review-workflows-2026-11-17T19-54-06.862Z/css-spacing-workflows-one--fff1c-applies-once-and-rolls-back/css-acceptance.json)، [manual CSS screenshot](../../test-results/review-workflows-2026-11-17T19-54-06.862Z/css-spacing-workflows-one--fff1c-applies-once-and-rolls-back/css-validated.png).
- [batch flow JSON](../../test-results/review-workflows-2026-11-17T19-54-06.862Z/css-spacing-workflows-appl-6eae4-applies-once-and-rolls-back/css-acceptance.json)، [batch CSS screenshot](../../test-results/review-workflows-2026-11-17T19-54-06.862Z/css-spacing-workflows-appl-6eae4-applies-once-and-rolls-back/css-validated.png).
- [live preview after CSS source apply](../../test-results/review-workflows-2026-11-17T19-54-06.862Z/css-spacing-workflows-appl-6eae4-applies-once-and-rolls-back/css-post-apply.png).

المشاهدات الفعلية: original في RTL بقي `margin-left:12px`؛ candidate في LTR حافظ على left12/right0، وفي RTL أصبح left0/right12. padding-right8 المقترحة أصبحت padding-left8 في RTL. بعد رفض padding proposal بقيت physical right8، مع بقاء margin المقبول logical؛ accepted padding-left16 في الملف الآخر أصبح right16 في RTL. هذه computed styles من التطبيق الحقيقي المحمل بـ CSS الفعلية، لا صور أو بيانات مصطنعة للنتيجة.

كل وضع حضّر الاقتراحات الأربع نفسها، ثم قبل اثنين في ملفين ورفض واحدًا وأجّل آخر. reload حافظ على workflow/session؛ مصدر original لم يتغير قبل الإجراء الصريح. source Apply أُرسل مرة واحدة، وإيصالان وbackup hashes طابقا المصدر. rollback حفظ تعديلًا غير مرتبط؛ بعد إثبات الحفظ أزيل فقط تعليق الاختبار، واستعادت المعاينة الهوية المتوقعة. source CSS الأصلية عادت حرفيًا. لا إعادة Apply للـ bidi ضمن إثبات CSS.

**Portability:** `tools/rtl-scanner/tests/css-spacing.test.ts` ينشئ مشروعًا منفصلًا مصغّرًا Nx-compatible باسم `libs/any-name/src/spacing.css`، بلا Atlas أو InvoiceTable أو mapping. المسح والاقتراحات وكلا وضعي candidate/rejection/defer/persistence نجحوا. إعادة المسح بعد التحويل لم تنتج spacing finding نفسها. runtime adapter الحالي مثال Atlas؛ في هذا المشروع المصغّر validation تبقى **Unavailable** وsource Apply محجوب. هذا حد صريح محفوظ، وليس Passed وهمية أو اعتمادًا من transformation eligibility على preview mapping. الملفات arbitrary في fixture المتصفح أيضًا بلا mapping خاصة؛ راجعت CSS code diffs، واختبرت التطبيق الفعلي مباشرة، ثم تحققت من mapped preview بعد Apply/rollback.

| Check | Actual result / evidence |
|---|---|
| CSS manual + batch | **2/2 PASS**؛ `browser-delivery-full-css.log` والأدلة أعلاه |
| Full scanner suite | **312/312 PASS، 26 files**؛ `units-final.log`، منها 19 parser/portability cases |
| Existing workflow/apply/rollback | **5/5 PASS، 1.7m**؛ `test-results/review-workflows-2026-11-17T19-41-41.044Z/` |
| Contextual previews | **4/4 PASS، 1.3m**؛ `test-results/review-workflows-2026-11-17T19-43-26.630Z/` |
| Fullscreen | **1/1 PASS، 6.8s**؛ `test-results/review-workflows-2026-11-17T19-44-49.148Z/` |
| Post-apply lifecycle | **1/1 PASS، 21.9s**؛ `test-results/review-workflows-2026-11-17T19-44-59.805Z/` |
| Typecheck + scanner typecheck/build + project build | **PASS**؛ `typecheck.log`, `scanner-typecheck.log`, `build.log`, `project-build.log`؛ 3 Nx tasks |
| Protected Ahmed target | **PASS**؛ نفس Applied workflow/session/history/receipt/backup و43 source/config hashes؛ [audit](../../test-results/css-spacing-audit/preserved-after.json) |

logs المختصرة تحت `test-results/css-spacing-audit/`. إخفاق التطوير الأول كان RTL fixture URL بلا demo flag؛ صحح الاختبار ليفعّل runtime RTL الحقيقي. فحص symlink سابق كشف اختلاف error بعد تعميم source anchor؛ أعيد حفظ regular-file guard الأصلي، ونجح الاختبار القديم دون تغيير assertion. لا suppressions أو إضعاف للفحوص.

### Current manual URL / English acceptance steps

**Disposable target only:** http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.CSS.PHYSICAL%3A79eeb454cbb725c592132ff1

1. Open the URL and choose **Start manual review**. Confirm `css-spacing-logical`, **Requires semantic review**, and the real CSS proposal in `arbitrary-spacing.css`. Review the horizontal-tb, LTR-authored reading-edge assumption before accepting.
2. Apply the four eligible spacing proposals to the isolated candidate. In **Apply First, Review Later**, the same inventory is prepared after **Apply to candidate & review**. Confirm shorthand/logical conflicts and intentional physical spacing remain skipped with concrete reasons.
3. Before changing decisions, select `InvoiceTable.tsx` to view the existing live application frames, without applying its bidi proposal. Toggle LTR/RTL. The candidate includes the spacing proposals; arbitrary CSS paths themselves remain code-only where no verified route mapping exists.
4. Accept `margin-left:12px` and `padding-left:16px` in the second file; reject `padding-right:8px`; defer `margin-right:20px`. Inspect Change inventory: rejection must remove only its property rename.
5. Reload, validate accepted changes, then explicitly apply accepted changes to source. Check the two receipts/backups, current preview and reload. Historical Passed evidence must remain bound to its original review.
6. Roll back on this disposable target. Confirm original CSS and preview return. Repeat with the other workflow using **Change review workflow**. Leave Ahmed's personal acceptance unchecked until he records it.

البيئة الحالية `rtl-analyzer-e2e-3C7VbY`؛ supervisor `78610`، Companion `78615`، original invoicing `78616` وprocurement `78617`، HTTP `78648`. [environment / proposal inventory](../../test-results/css-spacing-audit/manual-environment.json)، [current manual screenshot](../../test-results/css-spacing-audit/manual-css-inventory.png). الحالة المتروكة analyze-only، بلا candidate أو source apply. `kill -TERM 78610` يوقف الخدمات المملوكة وينظف **هذه** fixture فقط.

هدف Ahmed السابق `rtl-analyzer-e2e-EDczGl` متروك محفوظًا على القرص في Applied مع إيصال `2026-11-17T18:27:26.540Z` والـ backup الأصلي؛ لم يُستخدم لاختبار Apply. أوقف supervisor المملوك `64112` بعد فحص هويته ونسخ الحالة، لإخلاء المنافذ. لإعادة تشغيله بعد إيقاف fixture الحالية: `node test-results/contextual-preview-audit/serve-preserved-services.mjs`. لا تشغّل disposable supervisor على مساره؛ لا تتوقف عن عملية غير مرتبطة على 4319 أو غيره.

```sh
npm run rtl:scan:build
RTL_SPACING_FIXTURE=1 RTL_REVIEW_SPECS=tests/e2e/css-spacing-workflows.spec.ts node tests/e2e/run-review-workflows.mjs
# For a fresh persistent manual target instead:
RTL_SPACING_FIXTURE=1 node tests/e2e/serve-review-workflows.mjs
```

## عيب سياق المعاينة بعد Apply / rollback — verified 2026-11-17

Session Guard: **CONTINUE**. الحالة: **PASS — تحقق agent مكتمل**. هذا القسم هو دليل المتابعة الأحدث؛ نتائج contextual/fullscreen السابقة أدناه تبقى سجلًا مؤرخًا. قبول Ahmed الشخصي: **[ ]**.

- [x] إعادة الإنتاج في متصفح HTTP على هدف جديد `rtl-analyzer-e2e-NiSdoy`، وليس مصدر Ahmed المطبق. التسلسل الفعلي: analyze → candidate → accept → validation Passed → explicit source Apply → فشل جميع السياقات بالبصمة القديمة → reload يبقي الفشل. [دليل إعادة الإنتاج](../../test-results/post-apply-reproduction/post-apply-context-source--5524d-rating-historical-approvals/identity-transitions.json)، [الصورة](../../test-results/post-apply-reproduction/post-apply-context-source--5524d-rating-historical-approvals/reproduced-post-apply.png).
- [x] أول هوية stale: Apply يكتب المصدر ويحتفظ بهوية workflow الأصلية الصحيحة كسجل، لكن dashboard ظل يستعمل `inputDigest` التقرير السابق كسياق حالي. بعد ذلك تبقى generated runtime bindings/sourceHashes على المصدر السابق أيضًا. الحارس `DASHBOARD_SOURCE_IDENTITY_MISMATCH` كان صحيحًا؛ غاب انتقال السياق بعد الكتابة. `AMBIGUOUS_TOKEN_EXPRESSION` سبب مستقل لرفض codemod، وليس سبب الفشل العام.
- [x] `source-context.ts` يطابق root/realpaths وكل baseline source/config والـ accepted composition مع إيصالات Apply، ثم يطابق المسح الكامل مع scanner-after المحفوظ أو baseline عند rollback. الملف الجديد أو التغيير الخارجي أو اختلاف policy/hash يظل محجوبًا. لا تعديل لـ codemod أو approval أو validation أو controlled apply/rollback implementations.
- [x] بعد انتقال المصدر المكتمل، dashboard يعيد bootstrap من مسح ومقاطع مصدر حالية؛ workflow/session/قرارات/validation/receipts القديمة لا تُكتب فوقها ولا تُنقل إلى ranges جديدة. الرد الذي يضيع بعد Apply ويستعاد من workflow يمر بنفس إعادة التحميل. التقارير الثابتة القابلة للتنزيل تُسمى Historical؛ التحليل الحالي منفصل.
- [x] يعاد ربط generated original wrappers فقط بعد إثبات الانتقال الموثق. Vite يعيد تحميل config بنفس الخدمة المملوكة؛ الكتابة idempotent ولا تبدأ candidate أو تعيد patch. تشمل هوية runtime `inputDigest` و`policyDigest` وsourceHashes الفعلية. إعادة تشغيل عمياء ليست مسار الإصلاح.
- [x] historical Before **غير متاح صراحة**: لا immutable application baseline runtime محفوظ. المعاينة اسمها **Current source · Applied / Rolled Back**، والـ toolbar يذكر Current source؛ لا تعرض المصدر المعدل كـ Before التاريخي. لا current candidate؛ validation الحالية **Not run**. validation القديمة Passed تبقى Historical وبـ review digest/session الأصليين. inventory والقرارات ومقاطع before/after والإيصال ومسار backup متاحة كسجل.
- [x] التنقل بين supported/unsupported وprocurement، تفاعل التطبيق، fullscreen، reload وrollback تعمل بالهوية الحالية. التغيير الخارجي يظل محجوبًا في الطلب المباشر وبعد reload. لا global stale context بسبب unsupported finding.
- [x] حماية Ahmed: حفظت الحالة المطبقة قبل أي إيقاف خدمة في `test-results/post-apply-context-audit/ahmed-state-before/` مع source/dashboard snapshots. الفحص النهائي يطابق **43 ملف source/config**، ونفس workflow/session/entries/history/validation/receipts، وbackup SHA. الفرق المسموح runtime state عابر وخادما preview configs المولدان وdashboard client. لا Apply أو rollback على هدف Ahmed. [التدقيق النهائي](../../test-results/post-apply-context-audit/preserved-delivery.json).
- [ ] قبول Ahmed الشخصي لهذا الإصلاح.

### انتقال الهويات المثبت في المتصفح

الهدف الجديد النهائي: `rtl-analyzer-e2e-pZzAOG`؛ workflow `0a276da9-aa80-4bbe-a15b-5052c56f4172`؛ session `57acdf88-0cd9-42a7-9c11-5a54022ff2f1`. السياسة بقيت `fc82bc0137f0800c3c6818b55a14ef2ac9abaeb1b018d503834d9899183abf49`.

| المرحلة | report/runtime الأصلي الحالي inputDigest | SHA-256 لـ InvoiceTable | findings / validation |
|---|---|---|---|
| قبل Apply | `acc14c4d91bf8eef8ffd99db03c258ad2597a7268fa60877e7acc8d7f1deb5f5` | `2858495a622f77d758812f04a580b48bdacb53a3d84bb44e66f57df994dc12fb` | 50؛ candidate المقبول Passed بهويته |
| بعد Apply وreload | `825387baa80dc352c040024c2a0cfe768e56d87ab7b15376eb32c979fe5ed8be` | `681c317d4b6365556829e9bc7e7842a04a7a8556395d022f15e6689916b3f235` | 49؛ current Not run، historical Passed |
| بعد rollback وreload | baseline `acc14c4d…` | baseline `2858495a…` | 50؛ current Not run، التاريخ محفوظ |

workflow/session الأصلية بقيتا ثابتتين. candidate التاريخي ظل على SHA `681c317d…`؛ لم يُقدّم كمرشح حالي بعد Apply/rollback. الطلب بالـ digest القديم بعد Apply يستمر في إعطاء `DASHBOARD_SOURCE_IDENTITY_MISMATCH`؛ الطلب الحالي الصحيح يعمل. **finding ID نفسه `…741d2ce2aec3a86cf2db37ea` أُعيد استخدامه لتعبير آخر**: range التاريخي `20:15` أصبح الحالي `20:77`. رغم ذلك القرار الحالي Pending وليس Accepted. هذا سبب فصل السجل كله عن current analysis، لا مصالحة الموافقات بتطابق ID وحده.

[identity-transitions.json الكامل](../../test-results/review-workflows-2026-11-17T18-50-22.681Z/post-apply-context-source--5524d-rating-historical-approvals/identity-transitions.json) يسجل report/source/session/runtime roots/hashes قبل وبعد Apply وreload وrollback. طلبات المتصفح: workflow واحد، candidate apply واحد، runtime request واحد، Accepted واحد، validate واحد، source apply واحد، rollback واحد؛ **لا requests إضافية لإنشاء candidate أو patch أو runtime عند العرض/التنقل/reload**.

### التحقق والآثار الحالية

| الفحص | النتيجة / الدليل |
|---|---|
| Behavioral browser regression الجديد | **1/1 PASS، 23.5s**؛ `post-apply-context.spec.ts`، [الأدلة](../../test-results/review-workflows-2026-11-17T18-50-22.681Z/post-apply-context-source--5524d-rating-historical-approvals/identity-transitions.json) |
| مسارا manual/batch والتحقق وApply/rollback والأمان والتعافي الجزئي | **5/5 PASS، 1.8m**؛ `test-results/review-workflows-2026-11-17T18-52-46.274Z/`؛ log `test-results/post-apply-context-audit/workflows-final.log` |
| contextual previews | **4/4 PASS، 1.3m**؛ 47 findings / 77 route variants؛ `test-results/review-workflows-2026-11-17T18-51-12.770Z/` |
| fullscreen frames/navigation/state | **1/1 PASS، 7.4s**؛ `test-results/review-workflows-2026-11-17T18-52-34.717Z/` |
| وحدات scanner، ومنها رفض receipt خاطئ/تغيير خارجي/config/ملف جديد | **293/293 PASS، 25 files**؛ `unit-delivery.log` |
| typecheck / scanner build / build العام | **PASS**؛ `typecheck-final.log`، `build-delivery.log`، `build-project.log` تحت `test-results/post-apply-context-audit/`؛ build العام 3 Nx tasks |
| هدف Ahmed المطبق بعد إعادة الخدمات | **PASS read-only**؛ 49 finding، الحالي Ready والتطبيق تفاعلي؛ unsupported صريحة مع original route متاحة؛ reload والإيصال/backup/43 hashes ثابتة؛ **0 POST و0 page errors**؛ [التدقيق](../../test-results/post-apply-context-audit/preserved-delivery.json) |
| memory validator / diff hygiene | **PASS**؛ 102 links، 0 missing؛ 7 advisory freshness warnings وREADME بلا verification date كما في السجل السابق؛ فُحصت ولم تُعد كتابة تاريخها. `git diff --check` ناجح، ولا diff في apps/libs |

حدثت إخفاقات أثناء التطوير: خطأ syntax في client المصاغ كنص، assertion افترض أن ID سيتغير، selector غير فريد لرسالة الحجب، وrender كان يخفي `ROLLBACK_CONFLICT`. صححت الأسباب وأعدت الفحوص أعلاه؛ لم أُضعف identity guards أو أغير شروط Apply/validation. هذه الإخفاقات محفوظة في logs، وليست نتائج القبول الحالية.

صور بعد Apply: [المصدر الحالي بحجم كامل](../../test-results/post-apply-context-audit/ahmed-post-apply-current.png)، [unsupported مع candidate غير متاح بوضوح](../../test-results/post-apply-context-audit/ahmed-post-apply-unsupported.png)، [السجل والإيصال](../../test-results/post-apply-context-audit/ahmed-post-apply-history.png). صور الهدف المؤقت: [procurement بعد Apply](../../test-results/review-workflows-2026-11-17T18-50-22.681Z/post-apply-context-source--5524d-rating-historical-approvals/post-apply-procurement.png)، [بعد rollback](../../test-results/review-workflows-2026-11-17T18-50-22.681Z/post-apply-context-source--5524d-rating-historical-approvals/post-rollback-current.png).

### رابط الاختبار اليدوي والخدمات المحفوظة

الرابط: http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea

1. افتح الرابط واختر Start manual review إذا ظهرت شاشة البداية. يجب رؤية **49** finding وCurrent source · Applied؛ Accepted السابق موجود في السجل فقط.
2. افتح Expand original preview، وجرّب البحث في الفواتير وLTR/RTL وClose. الشاشة تعرض المصدر الحالي المطبق.
3. اختر finding `InvoiceTable.tsx:43:27`: `AMBIGUOUS_TOKEN_EXPRESSION` يوضح عدم دعم التحويل، والمعاينة الحالية تعمل. جرّب finding من procurement ثم ارجع.
4. Reload يعيد الحالة نفسها. افحص Change inventory وHistorical validation والإيصال ومسار backup؛ لا تُعد Apply على التغيير المطبق. Apply/rollback الكاملان تحققا على الهدف المؤقت أعلاه.

الهدف المحفوظ `rtl-analyzer-e2e-EDczGl` ما زال Applied. workflow `77b9e220-9a97-4b01-b1dc-8dbd7e7ddb9a`، session `ce9eecd3-97fb-4034-ba0e-6d3451c6a8d7`، الإيصال الأصلي `2026-11-17T18:27:26.540Z`، وbackup `1ea6645a-3545-4571-9dff-e17250bdf160.bak` لم تتغير. supervisor `64112`؛ Companion `64149`؛ original invoicing `64116` وprocurement `64117`؛ HTTP `64148`. لا candidate runtime جديد لهذا السجل التاريخي. لإيقاف الخدمات المملوكة مع إبقاء المصدر/السجل/backup: `kill -TERM 64112`. السكربت `test-results/contextual-preview-audit/serve-preserved-services.mjs` لا يحذف الهدف عند الإيقاف؛ لا تستبدله بـ disposable supervisor على هذا المسار.

لإعادة behavioral regression على هدف جديد بعد إخلاء منافذ الخدمات المملوكة:

```sh
npm run rtl:scan:build
RTL_REVIEW_SPECS=tests/e2e/post-apply-context.spec.ts node tests/e2e/run-review-workflows.mjs
```

## contextual live previews — بدأ 2026-11-16، متابعة 2026-11-17

Session Guard: **CONTINUE** بطلب Ahmed الصريح. الحالة: **PASS — تحقق agent مكتمل 2026-11-17**؛ اعتماد Ahmed الشخصي ما زال معلقًا. PASS التاريخية ليست دليلًا على الخدمة الحالية. لا قبول شخصي بواسطة agent.

- [x] تدقيق checkout والتقرير والخدمات: checkout `52ab6cb513e44703e996febcaaf2e9c56a4ce7a2` مع التعديلات السابقة، **47 finding** وdigest `3011f559425f764e053dd89b48a060b24d79ce1d9a3eca068fb5e308fb81608a`. التقرير المفتوح **50 finding** ويطابق هدف regression المؤقت، digest `acc14c4d91bf8eef8ffd99db03c258ad2597a7268fa60877e7acc8d7f1deb5f5`. الثلاث الإضافية تخص تكرار identifier و`ReviewTokens.tsx` في fixture؛ ليست findings جديدة في مصدر Ahmed. الدليل `test-results/contextual-preview-audit/identity.json`.
- [x] مصالحة inventory لكل findings مع verified targets / document / nonvisual / unresolved؛ لا تكتمل المرحلة بوجود فجوات visual قابلة للحل.
- [x] معاينة original لكل finding دون codemod/apply/approval، ضمن الصفحة الحقيقية، مع highlight وscroll وroute/instance selection.
- [x] invoicing وprocurement وshared consumers وHTML/TSX/CSS، بما فيها حوارات/قوائم تحتاج UI state فعلية، media وoverridden CSS.
- [x] بيانات deterministic scoped قبل initialization، ومعادلة بين origins/ports، دون مسح بيانات Ahmed أو إعادة seed عند كل selection.
- [x] After فعلية بهوية candidate وpatch inventory الصحيحة؛ fullscreen القائم واتجاه/modes/devices/focus/state بلا mutations مكررة.
- [x] المتصفح الفعلي وtypecheck/build/scanner/tests ومسارا manual/batch وapply/rollback عند تعديل shared runtime/session؛ الأدلة والخدمات وأوامر startup/cleanup أدناه.
- [ ] قبول Ahmed الشخصي للمرحلة الحالية.

حدود التنفيذ: خرائط Atlas example صريحة في `example-preview-mappings.ts` منفصلة عن bridge/transport. لا universal source-to-DOM discovery، لا تخطيط بديل للصفحة، ولا اعتماد على iframe load وحده. source وبيانات الجلسة القديمة محفوظة قبل إعادة الخدمات في `test-results/contextual-preview-audit/preserved-state/` و`preserved-workflow.json`. لا تعديل لأصول الفيديو أو مصدر التطبيقات للتحويلات التوضيحية.

### التنفيذ الحالي وحدود الأدلة — verified 2026-11-17

- `example-preview-mappings.ts` يحتوي خرائط المثال المحدد؛ `contextual-preview.ts` يطابق report/root/finding/source/runtime/session ويعيد descriptors للقراءة فقط. `contextual-preview-bridge.ts` يفحص DOM داخل التطبيق الحقيقي؛ dashboard لا يقرأ DOM عبر origins. الحالات `routeReady` و`verified/document/navigated/hidden/unresolved/runtime-unavailable` منفصلة. فتح route أو iframe load لا يثبت locating الهدف.
- المصدر الفعلي للمثال: 21 scanned source files، منها 13 تحمل findings؛ inventory الحالية 47: invoicing 24، procurement 5، shared 18. الخرائط تشمل القوائم والحوارات الموجودة فعلًا، وجدولًا متعدد instances، وdocument/provider scope. لا nonvisual مصطنعة ولا layout بديل. `Overlay` التظليل مستقل بـ `pointer-events:none` ولا يغيّر attributes أو أبعاد العنصر المستهدف.
- CSSOM يربط قواعد stylesheet بمصدر Vite، ويعرض contribution والـ computed value؛ يراعي normal/important وspecificity/order وmedia/supports وinline/generated sx للمثال. اختبارات DOM تثبت override فعليًا بـ `!important` ثم استعادته، وsidebar inactive على Desktop وoverridden عند فتحه. هذا bounded attribution، وليس تحليلًا عامًا لـ cascade layers/shadow styles، ولا حكمًا بأن كل selector match يمثل RTL defect. الـ sidebar المغلق قد يكون off-canvas عمدًا؛ يوجد `Reveal navigation`.
- seed الحقيقية `seedInvoices` = 24، و`purchaseOrders` = 9 static orders. generated development Vite wrapper فقط يربط mock API بمفتاح `rtl-analyzer-preview:atlas-seed-v1:<UUID>` في frames المسماة؛ لا تعديل لـ app/library source. UUID محفوظ في dashboard sessionStorage لكل report. يؤخّر wrapper mount حتى تهيئة original، ويمرر dataset نفسها إلى candidate قبل mount على أي منفذ جديد. لا reseed عند اختيار finding. fingerprints تكشف اختلاف البيانات بعد التفاعل، و`Reset preview data` يعيد المفتاح المخصص في الجانبين فقط إلى seed الأصلية. مفاتيح التطبيق العادية لا تُمسح؛ السلوك القديم المسجل في 1E أدناه أصبح تاريخيًا وحل محله هذا العزل.
- inventory التحويلات الفعلية في checkout: **3/47 supported** فقط: `InvoiceTable.tsx:19` (`{i.id}`)، و`procurement/App.tsx:68` (`{o.id}`) و`:105` (`{order.id}`). كل منها `bidi-isolate-auto` الموجود؛ بقية 44 تبقى original contextual review مع سبب غياب automatic fix. لا توسيع لـ codemod. candidate header يعرض القرار وvalidation الفعليين، والرسالة تحدد selected change applied/unchanged وعدد patches الموجودة فعلًا. وجود runtime لتطبيق آخر لا يغيّر `Apply & Preview` إلى إجراء عرض قبل تطبيق finding المحددة.
- original apps على 4200/4201؛ candidate apps منفصلة داخل الجلسة نفسها وتشارك مجموعة 4202–4212 المحمية. اختيار finding/route/instance وExpand/Close لا يبدأ runtime. startup يحتاج إجراءً صريحًا؛ الهوية تشمل application/root/runtime session/source hash. cleanup يوقف children المملوكة للجلسة فقط. هذا تعديل runtime management في `review-session.ts`؛ approval/validation/final apply/rollback implementations لم تتغير في هذه المرحلة، وتبقى regressions المطلوبة أدناه شرطًا للإغلاق.
- fullscreen القائم يعيد استخدام iframe nodes. عند توفر `moveBefore` ينشأ viewport overlay داخل dashboard (`div` مع `role="dialog"` و`aria-modal="true"`)، وتُنقل إليه عناصر البطاقة، بما فيها الإطارات نفسها، بنقل يحافظ على browsing contexts؛ تعود إلى host الأصلي عند الإغلاق. overlay متصل مباشرة بـ body وبأبعاد viewport، مع fixed layout في الموضع الأصلي عند غياب state-preserving move، ودون اشتراط browser fullscreen. لا يُستخدم reparenting العادي لإطارات حية. تُحفظ قيم layout وتُستعاد عند الإغلاق. يبقى Before/After/Split وAuto أو device dimensions فعلية، وtoolbar/Close/focus/Escape/inert/scroll restoration. رسائل stale origin/source/nonce/app/root/session/finding/hash/route تُرفض. تغير اللغة داخل التطبيق يظهر كاختلاف عن اتجاه المقارنة ويمكن استعادته من toolbar. تغيّر المسار الداخلي يبقى `navigated` حتى يعود للهدف، ولا يتحول إلى contextual coverage لصفحة أخرى.

- regression التنقل الطويل كشف أن التهيئة العامة للأنماط ومستمعات الأحداث وMutationObservers كانت داخل helpers `el` و`b`، فتتكرر مع إنشاء عناصر dashboard، وتضيف أنماطًا عامة متأخرة تتعارض مع العرض الموسّع. نُقلت التهيئة نفسها خارج الدالتين لتعمل مرة واحدة؛ محتوى الأنماط وعمليات المراجعة لم يتغيرا. فحص جديد يقارن عدد `head > style` قبل وبعد جميع الاختيارات، ثم يفحص native/browser bounds و`innerWidth` داخل التطبيق الحقيقي. فحص الـ50 finding المحفوظة نجح بعد الإصلاح في 31.8s (`test-results/contextual-initialization-long/`). فشلت محاولات سابقة قبل هذا الإصلاح، وأدلتها محفوظة؛ لا يُنسب النجاح النهائي إلى تغيير نوع الحوار وحده.

### inventory المصدر والـ DOM — تحقق 2026-11-17

المصالحة: **47/47 findings** في checkout، **77 route variants**؛ **44 target + 3 document، 0 nonvisual، 0 unresolved**. المالك: **24 invoicing + 5 procurement + 18 shared**. ملفات المصدر 21، منها 13 تحمل findings. الصفوف التالية من فحص HTTP/DOM الفعلي، مع selector وحالة UI وأعداد العناصر لكل route؛ ليست استنتاجًا من نجاح فتح route. دليل التغطية: `test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--aa499--in-its-running-application/coverage.json`. النسخة النهائية اجتازت المجموعة السياقية كاملة: **4/4 PASS**، ومنها إعادة التغطية وملء الشاشة بعد التنقل وبيانات candidate والأعطال. القبول الشخصي منفصل وغير مؤشّر.

| Finding / rule | المصدر | المالك والمسارات والحالة المطلوبة | الهدف الفعلي / التصنيف | دليل المتصفح والحدود |
|---|---|---|---|---|
| `RTL.DOCUMENT.INITIAL:3321a4fa4f1dd561e3b7fee5` | `apps/invoicing/index.html:2:17` | invoicing<br>`invoicing /invoices` · default seeded page · 1 target(s) | `html`<br>document / document | `html` |
| `RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea` | `apps/invoicing/src/components/InvoiceTable.tsx:19:15` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `.invoice-link`<br>targets / verified | `InvoiceTable` |
| `RTL.BIDI.ISOLATION:ee65b3a5436494c134055362` | `apps/invoicing/src/components/InvoiceTable.tsx:42:27` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `.customer-cell strong`<br>targets / verified | `InvoiceTable` |
| `RTL.BIDI.ISOLATION:c37e1290384b5b026d3550c4` | `apps/invoicing/src/components/InvoiceTable.tsx:43:26` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `.customer-cell small`<br>targets / verified | `InvoiceTable` |
| `RTL.BIDI.ISOLATION:af648a829cee9b32c0bd2fb8` | `apps/invoicing/src/components/InvoiceTable.tsx:64:38` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `.amount`<br>targets / verified | `InvoiceTable` |
| `RTL.ICON.PROGRESSION:237172da962fe4d0605ddd83` | `apps/invoicing/src/components/InvoiceTable.tsx:78:17` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `tbody [data-testid="ArrowBackIcon"]`<br>targets / verified | `InvoiceTable/ArrowBack` |
| `RTL.ICON.PROGRESSION:07d33024c457dfcdc175bd85` | `apps/invoicing/src/components/InvoiceTable.tsx:80:17` | invoicing<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`invoicing /` · default seeded page · 5 target(s) | `tbody [data-testid="ArrowForwardIcon"]`<br>targets / verified | `InvoiceTable/ArrowForward` |
| `RTL.BIDI.ISOLATION:20d0455279e243edca7d306d` | `apps/invoicing/src/pages/CreateInvoice.tsx:110:19` | invoicing<br>`invoicing /invoices/new` · customer-menu · 6 target(s) | `[role="listbox"] [role="option"]`<br>targets / verified | `CreateInvoice` |
| `RTL.BIDI.ISOLATION:638fd711c50f7608a2a4a274` | `apps/invoicing/src/pages/CreateInvoice.tsx:201:21` | invoicing<br>`invoicing /invoices/new` · default seeded page · 1 target(s) | `.form-total strong`<br>targets / verified | `CreateInvoice` |
| `RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d` | `apps/invoicing/src/pages/CreateInvoice.tsx:228:19` | invoicing<br>`invoicing /invoices/new` · invoice-confirm · 1 target(s) | `.MuiDialogContent-root p:first-child strong:first-of-type`<br>targets / verified | `CreateInvoice` |
| `RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9` | `apps/invoicing/src/pages/CreateInvoice.tsx:228:109` | invoicing<br>`invoicing /invoices/new` · invoice-confirm · 1 target(s) | `.MuiDialogContent-root p:first-child strong:last-of-type`<br>targets / verified | `CreateInvoice` |
| `RTL.BIDI.ISOLATION:a5143595873ed7a28d0ed095` | `apps/invoicing/src/pages/Customers.tsx:32:19` | invoicing<br>`invoicing /customers` · default seeded page · 6 target(s) | `.customer-card h3`<br>targets / verified | `Customers` |
| `RTL.BIDI.ISOLATION:73a3dbbb333c786c68bc36d6` | `apps/invoicing/src/pages/Customers.tsx:33:18` | invoicing<br>`invoicing /customers` · default seeded page · 6 target(s) | `.customer-card p:first-of-type`<br>targets / verified | `Customers` |
| `RTL.BIDI.ISOLATION:75fcb34b4ca84b10731b3272` | `apps/invoicing/src/pages/Customers.tsx:51:16` | invoicing<br>`invoicing /customers` · customer-dialog · 1 target(s) | `.MuiDialogContent-root p:nth-of-type(2)`<br>targets / verified | `Customers` |
| `RTL.BIDI.ISOLATION:7b475e4aab4a97b7eecd4f1d` | `apps/invoicing/src/pages/Customers.tsx:52:33` | invoicing<br>`invoicing /customers` · customer-dialog · 1 target(s) | `.MuiDialogContent-root p.hint`<br>targets / verified | `Customers` |
| `RTL.CHART.LABEL_FLOW:caa8a6652446209dc2fc98cf` | `apps/invoicing/src/pages/Dashboard.tsx:87:13` | invoicing<br>`invoicing /` · default seeded page · 1 target(s) | `.chart-wrap svg`<br>targets / verified | `Dashboard/svg` |
| `RTL.CSS.PHYSICAL:adebba7d3ad0dda9b7b8d423` | `apps/invoicing/src/pages/Dashboard.tsx:180:23` | invoicing<br>`invoicing /` · default seeded page · 4 target(s) | `.breakdown-row strong > span`<br>targets / verified | `Dashboard/span`<br>CSS margin-left: contributing · computed 10px |
| `RTL.ICON.LITERAL:aa0a8bc3f6ca19eae5b56a82` | `apps/invoicing/src/pages/Dashboard.tsx:197:47` | invoicing<br>`invoicing /` · default seeded page · 1 target(s) | `.section-title a`<br>targets / verified | `Dashboard` |
| `RTL.BIDI.ISOLATION:9f05797020b15bb1031f12fe` | `apps/invoicing/src/pages/InvoiceDetails.tsx:38:17` | invoicing<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 1 target(s) | `.detail-grid h3`<br>targets / verified | `InvoiceDetails` |
| `RTL.BIDI.ISOLATION:13dfdcf2817c6da7fa0b7930` | `apps/invoicing/src/pages/InvoiceDetails.tsx:41:15` | invoicing<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 1 target(s) | `.detail-grid p.hint`<br>targets / verified | `InvoiceDetails`<br>Both text expressions share one paragraph; the containing rendered element is highlighted. |
| `RTL.BIDI.ISOLATION:31882b621bb69ff054bca7a7` | `apps/invoicing/src/pages/InvoiceDetails.tsx:43:15` | invoicing<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 1 target(s) | `.detail-grid p.hint`<br>targets / verified | `InvoiceDetails`<br>Both text expressions share one paragraph; the containing rendered element is highlighted. |
| `RTL.BIDI.ISOLATION:e7869ece999321c7e9e1d86e` | `apps/invoicing/src/pages/InvoiceDetails.tsx:70:19` | invoicing<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 1 target(s) | `.form-total strong`<br>targets / verified | `InvoiceDetails` |
| `RTL.CSS.PHYSICAL:01b8d7fcb0e0dd788a73af31` | `apps/invoicing/src/pages/Invoices.tsx:56:43` | invoicing<br>`invoicing /invoices` · default seeded page · 1 target(s) | `.toolbar > .hint`<br>targets / verified | `Invoices/span`<br>CSS margin-left: contributing · computed 327.906px |
| `RTL.RUNTIME.PAGINATION:c2bdfb11861582e5c386e851` | `apps/invoicing/src/pages/Invoices.tsx:66:11` | invoicing<br>`invoicing /invoices` · default seeded page · 1 target(s) | `.pagination nav`<br>targets / verified | `Invoices/Pagination` |
| `RTL.DOCUMENT.INITIAL:e0c891dfa8af31d4d67bfd56` | `apps/procurement/index.html:2:17` | procurement<br>`procurement /` · default seeded page · 1 target(s) | `html`<br>document / document | `html` |
| `RTL.BIDI.ISOLATION:862b107afb21edf9840ac703` | `apps/procurement/src/App.tsx:68:19` | procurement<br>`procurement /` · default seeded page · 9 target(s) | `.invoice-link`<br>targets / verified | `Orders` |
| `RTL.BIDI.ISOLATION:95f0d5216f0155c798f82986` | `apps/procurement/src/App.tsx:84:55` | procurement<br>`procurement /` · default seeded page · 9 target(s) | `.amount`<br>targets / verified | `Orders` |
| `RTL.BIDI.ISOLATION:3267dc7e6b7ff0e147b62518` | `apps/procurement/src/App.tsx:105:15` | procurement<br>`procurement /orders/PO-2026-402` · default seeded page · 1 target(s) | `.page-heading h1`<br>targets / verified | `Details` |
| `RTL.BIDI.ISOLATION:0ae599d0017719ece2087ae9` | `apps/procurement/src/App.tsx:125:19` | procurement<br>`procurement /orders/PO-2026-402` · default seeded page · 1 target(s) | `.form-total strong`<br>targets / verified | `Details` |
| `RTL.FORM.DIRECTION:c3038155faae0e23f50372db` | `libs/design-system/src/index.tsx:41:3` | shared<br>`invoicing /invoices` · default seeded page · 2 target(s)<br>`procurement /` · default seeded page · 1 target(s)<br>`invoicing /invoices/new` · default seeded page · 7 target(s)<br>`invoicing /customers` · default seeded page · 1 target(s) | `.MuiFormControl-root`<br>targets / verified | `FormField/TextField` |
| `RTL.GEOMETRY.EDGE:4a19b0ffbf510d5d3715c64c` | `libs/design-system/src/index.tsx:106:39` | shared<br>`invoicing /customers` · customer-dialog · 1 target(s)<br>`invoicing /invoices/new` · invoice-confirm · 1 target(s) | `.MuiDialogTitle-root button`<br>targets / verified | `Modal/IconButton`<br>CSS right: contributing · computed 12px |
| `RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677` | `libs/design-system/src/index.tsx:147:15` | shared<br>`invoicing /invoices` · default seeded page · 6 target(s)<br>`procurement /` · default seeded page · 5 target(s)<br>`invoicing /` · default seeded page · 6 target(s)<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 4 target(s)<br>`procurement /orders/PO-2026-402` · default seeded page · 3 target(s) | `thead th`<br>targets / verified | `DataTable/TableCell` |
| `RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21` | `libs/design-system/src/index.tsx:155:17` | shared<br>`invoicing /invoices` · default seeded page · 48 target(s)<br>`procurement /` · default seeded page · 45 target(s)<br>`invoicing /` · default seeded page · 30 target(s)<br>`invoicing /invoices/INV-2026-1048` · default seeded page · 4 target(s)<br>`procurement /orders/PO-2026-402` · default seeded page · 3 target(s) | `tbody td`<br>targets / verified | `DataTable/TableCell` |
| `RTL.GEOMETRY.ORDER:0b23a5f6f4bc3966eb9e0efc` | `libs/design-system/src/index.tsx:182:19` | shared<br>`invoicing /invoices` · default seeded page · 1 target(s)<br>`procurement /` · default seeded page · 1 target(s) | `aside`<br>targets / verified | `SidebarFrame/@media (max-width: 900px)`<br>CSS transform: contributing · computed matrix(1, 0, 0, 1, -238, 0)<br>A collapsed sidebar can be intentionally outside the viewport. Target geometry and active/overridden CSS are reported; use Reveal navigation to inspect the open component. |
| `RTL.GEOMETRY.ORDER:1226abd54e967deed14a4a6c` | `libs/design-system/src/index.tsx:184:21` | shared<br>`invoicing /invoices` · default seeded page · 1 target(s)<br>`procurement /` · default seeded page · 1 target(s) | `aside`<br>targets / verified | `SidebarFrame/@media (max-width: 900px)/html[dir="rtl"] &:not(.is-open)`<br>CSS transform: contributing · computed matrix(1, 0, 0, 1, 238, 0)<br>A collapsed sidebar can be intentionally outside the viewport. Target geometry and active/overridden CSS are reported; use Reveal navigation to inspect the open component. |
| `RTL.BRAND.ISLAND:b2139ad57eaf0ae87a66743e` | `libs/design-system/src/index.tsx:209:7` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `aside .brand`<br>targets / verified | `Sidebar/a` |
| `RTL.ICON.PROGRESSION:f4c175932dd9a0c9123c55f5` | `libs/design-system/src/index.tsx:254:11` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `.app-link [data-testid="ArrowForwardIcon"]`<br>targets / verified | `Sidebar/ArrowForward` |
| `RTL.CSS.PHYSICAL:a82eeae5e376b962d817b8b2` | `libs/design-system/src/index.tsx:254:45` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `.app-link [data-testid="ArrowForwardIcon"]`<br>targets / verified | `Sidebar/ArrowForward`<br>CSS margin-left: contributing · computed 34.0312px<br>CSS margin-left: contributing · computed 58.1875px |
| `RTL.DOCUMENT.RUNTIME:1f3bd0fab5211f473ef82db4` | `libs/design-system/src/runtime.tsx:86:5` | shared<br>`invoicing /invoices` · default seeded page · 1 target(s)<br>`procurement /` · default seeded page · 1 target(s) | `html`<br>document / document | `Provider` |
| `RTL.CSS.PHYSICAL:21623aff840f0d576f06f522` | `libs/design-system/src/styles.css:22:3` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `.brand`<br>targets / verified | `stylesheet/.brand`<br>CSS margin-left: contributing · computed 12px |
| `RTL.CSS.PHYSICAL:ecf95e3ab5ee9d97e51b7b4d` | `libs/design-system/src/styles.css:33:3` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `.brand-mark`<br>targets / verified | `stylesheet/.brand-mark`<br>CSS margin-right: contributing · computed 10px |
| `RTL.CSS.PHYSICAL:190bcc5a6e2552cc91cd610b` | `libs/design-system/src/styles.css:50:3` | shared<br>`invoicing /invoices` · sidebar · 1 target(s)<br>`procurement /` · sidebar · 1 target(s) | `.workspace > span`<br>targets / verified | `stylesheet/.workspace > span`<br>CSS margin-left: contributing · computed 32.9844px |
| `RTL.CSS.PHYSICAL:0dfdf26ee014cb3b23ca8b7f` | `libs/design-system/src/styles.css:147:3` | shared<br>`invoicing /invoices` · default seeded page · 1 target(s)<br>`procurement /` · default seeded page · 1 target(s) | `.header-divider`<br>targets / verified | `stylesheet/.header-divider`<br>CSS border-left: contributing · computed 1px solid rgb(231, 234, 241) |
| `RTL.CSS.PHYSICAL:a750b772938d00bc32351bff` | `libs/design-system/src/styles.css:148:3` | shared<br>`invoicing /invoices` · default seeded page · 1 target(s)<br>`procurement /` · default seeded page · 1 target(s) | `.header-divider`<br>targets / verified | `stylesheet/.header-divider`<br>CSS margin-left: contributing · computed 6px |
| `RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6` | `libs/design-system/src/styles.css:270:3` | shared<br>`invoicing /` · default seeded page · 4 target(s) | `.kpi-note b`<br>targets / verified | `stylesheet/.kpi-note b`<br>CSS margin-right: contributing · computed 5px |
| `RTL.CSS.PHYSICAL:82212e990854fbb975d34448` | `libs/design-system/src/styles.css:290:3` | shared<br>`invoicing /` · default seeded page · 1 target(s) | `.chart-labels`<br>targets / verified | `stylesheet/.chart-labels`<br>CSS padding-left: contributing · computed 40px |
| `RTL.RUNTIME.LOCALE:9356c0da9bea9ff5056b08b3` | `libs/shared/src/index.ts:118:3` | shared<br>`invoicing /invoices` · default seeded page · 8 target(s)<br>`procurement /` · default seeded page · 9 target(s) | `.amount`<br>targets / verified | `money`<br>These consumers call the real money() formatter. A target match does not establish a locale defect or authorize changing currency data. |

### نتائج القبول النهائية — 2026-11-17

الأصول النهائية قورنت بالـbuild الحالي عبر HTTP، وليس بوجود الملفات فقط. checkout الحالي **47** finding؛ لوحة التسليم المحفوظة **50** = نفس الـ47 + ثلاث findings اصطناعية في fixture السابق. لا تُستبدل هوية هذه الجلسة لتغيير العداد. الإضافات الثلاث اجتازت فحص DOM منفصلًا: **3/3، 4 route variants**، في `test-results/contextual-preserved-extras/`. المجموع الموفق بين الجردين **50 distinct IDs**، وليس 50 finding في checkout.

| مجال القبول | الحالة | التحقق الفعلي |
|---|---|---|
| inventory وoriginal بلا apply/codemod | PASS | 47/47 و77 route variants؛ 44 target + 3 document، 0 nonvisual و0 unresolved؛ workflow ثابت و0 preview mutation requests |
| التطبيقان وshared وUI state | PASS | DOM/route/app port صحيحة، confirmation/menu/customer dialog حقيقية، consuming routes وinstances فعلية؛ صور أدناه |
| CSS/scroll/highlight | PASS | contributing → overridden بـ7px !important → restored 40px؛ sidebar media/inactive/open override؛ 48 table cells، آخر instance وAll، outerHTML/الأبعاد ثابتة؛ spoofed/stale messages مرفوضة |
| seed وعزل البيانات | PASS | 24 → 25 بالتفاعل → 24 بعد Reset صريح؛ finding switching يحفظ25؛ ordinary storage canaries محفوظة؛ fingerprint متكافئة عبر origins ومنافذ مختلفة |
| After الفعلية | PASS | bdi الأصل0 / invoice candidate8، procurement9، detail1؛ ثلاث patches الموجودة فقط، نفس session، Pending وNot run؛ unsupported finding تعرض original وselected finding unchanged |
| fullscreen والتفاعل والحالة | PASS | 1600×1000، التطبيق نفسه >1500px في single Auto، transform none؛ fixed768/390×850، directions، search/navigation، Escape/focus/Close/scroll restoration؛ نفس frames و0 POST عند التكرار |
| تنقل طويل / تهيئة عامة | PASS |47 finding، head styles **16 → 16**، ثم fullscreen للتطبيقين وshared؛ 20.6s. وفحص منفصل للـ50 المحفوظة نجح31.8s |
| outages/restart/occupied port | PASS | original SIGSTOP/recover، Companion restart، reload يعيد نفس session/decisions، Retry وexplicit runtime restart؛ مالك4202 المحجوز بقي حيًا، لا قتل لخدمة غير مملوكة |
| manual/batch + validation/apply/rollback | PASS | **5/5** على آخر renderer؛ actual checks، accepted-only apply، رفض stale/conflict، failure gating، restart، partial-write + scoped rollback |
| source/session/assets | PASS | digest checkout ثابت، كل baseline محفوظة،29 ملف app/library تقارن مع candidate وتطابق الـpatch المحفوظة فقط؛ runtime source hashes صحيحة، served HTML يطابقbuild |
| typecheck/scanner/build | PASS | `npm run typecheck`، scanner `tsc` build/typecheck، **292/292** scanner tests (24 files، worker1)، `npm run build`:3 Nx tasks succeeded |
| Ahmed acceptance | **PENDING** | [ ] قبول Ahmed الشخصي؛ لا agent acceptance نيابة عنه |

لا توجد FAIL أو BLOCKED متبقية ضمن المثال المتاح وحدود الخرائط المعلنة. محاولات التشخيص الفاشلة محفوظة ولم تُحذف: fullscreen قبل إصلاح helpers؛ وtest race في restore/start-new أصلح بانتظار `.workflow-summary` قبل اختبار زر `Start new review`. التشغيل الأخير للمسارين كامل **5/5 PASS**. تشغيل unit مع24 workers تعثر في مهلة5s لفحصين تحت الحمل؛ التشغيل النهائي بـworker1 اجتاز292/292 دون تغيير assertions أو timeout.

#### الأدلة القابلة للمراجعة

- المجموعة السياقية النهائية **4/4، 1.4m**: [log](../../test-results/contextual-preview-audit/contextual-delivery-final.log)، [coverage47/77](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--aa499--in-its-running-application/coverage.json)، [CSS/instances/security](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--182e0-and-stale-message-rejection/controls.json)، [data/source/candidates](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--b3632-view-state-through-failures/candidate-data.json)، [style stability](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--2b0b7-sequence-of-finding-changes/context-switching.json).
- المساران على آخر UI **5/5، 1.6m**: [log](../../test-results/contextual-preview-audit/workflows-delivery-acceptance.log)، artifacts `test-results/review-workflows-2026-11-17T17-54-01.677Z/` (traces/videos وvalidation/apply/rollback evidence).
- الجلسة المحفوظة على آخر الأصول **fullscreen1/1، 6.6s**: [log](../../test-results/contextual-preview-audit/preserved-fullscreen-delivery.log)، [frame/session/request proof](../../test-results/contextual-preserved-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/verification.json). الإضافات3/3: [log](../../test-results/contextual-preview-audit/preserved-extras.log).
- [final identity and all source hashes](../../test-results/contextual-preview-audit/final-identity.json)، [final unit292](../../test-results/contextual-preview-audit/unit-final-ui.log)، [typecheck](../../test-results/contextual-preview-audit/typecheck-final-ui.log)، [scanner build](../../test-results/contextual-preview-audit/initialization-build.log)، [app build](../../test-results/contextual-preview-audit/build-delivery.log).
- مصدر Ahmed لم يُعدّل؛ `git diff -- apps libs` فارغ. المخازن والـcandidate المحفوظة قورنت بما قبل إعادة الخدمات، مع استثناء `session.runtime` فقط من المقارنة البنيوية بسبب PID/port lifecycle؛ IDs والقرارات والnotes/history/patches وحالة validation ثابتة.

صور المصدر الحالي47، في المتصفح الحقيقي1600×1000:

| السياق | الصورة |
|---|---|
| invoicing، confirmation target في الصفحة الفعلية | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--2b0b7-sequence-of-finding-changes/RTL.BIDI.ISOLATION-invoicing.png) |
| procurement، purchase-order target | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--2b0b7-sequence-of-finding-changes/RTL.BIDI.ISOLATION-procurement.png) |
| shared CSS chart labels في consuming route | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--2b0b7-sequence-of-finding-changes/RTL.CSS.PHYSICAL-invoicing.png) |
| Before-only | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--b3632-view-state-through-failures/before-only.png) |
| After-only، patch applied، Pending/Not run | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--b3632-view-state-through-failures/after-only.png) |
| Split، نفس البيانات والمسار | [صورة](../../test-results/review-workflows-2026-11-17T17-49-55.002Z/contextual-review-preview--b3632-view-state-through-failures/split.png) |

CUA أعاد تحميل **الأصول النهائية** في التبويب القائم، وفتح Before/After/Split، واستخدم Highlight ثم Close؛ عاد التركيز إلى `Expand original preview`، وبقي finding URL نفسه و0 accepted/Pending/Not run. صور فعلية بعرض النافذة المتاح608px: [Before](../../test-results/contextual-preview-audit/cua-before-only-delivery.png)، [After](../../test-results/contextual-preview-audit/cua-after-only-delivery.png)، [Split](../../test-results/contextual-preview-audit/cua-split-delivery.png)، [dashboard بعد Close](../../test-results/contextual-preview-audit/cua-dashboard-delivery.png). النوافذ الضيقة تحتاج scrolling طبيعيًا؛ صور1600 أعلاه توضح desktop.

فحص project memory: **100 links، 0 missing، PASS**؛ بقيت7 تنبيهات staleness إرشادية وملاحظة تاريخ واحدة في README، راجعتها ولم أعد كتابة قرارات أو وقائع تاريخية غير مرتبطة بهذه المهمة. [نتيجة validator](../../test-results/contextual-preview-audit/memory-final.log).

#### الخدمات وهوية التسليم الحالية

[افتح dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea). مصدر الخدمة المحفوظة هو fixture الذي سبق تسليمه، وليس checkout الحالي؛ التفريق مقصود للحفاظ على session/decisions. `final-identity.json` يحتوي hashes ومصالحة47/50 وHTML bytes.

- workflow `77b9e220-9a97-4b01-b1dc-8dbd7e7ddb9a`، session `ce9eecd3-97fb-4034-ba0e-6d3451c6a8d7`، patch واحدة، **0 Accepted**، **Not run**.
- original root `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-EDczGl/project`؛ candidate `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-review-zsIHKD`.
- environment `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-EDczGl/environment.json`؛ state في sibling `state/`، dashboard في `workflow-dashboard/`. هذه مسارات مؤقتة محفوظة لهذه المراجعة، وليست release artifacts.

| الخدمة | PID | HTTP |
|---|---:|---|
| preserved supervisor |53258| — |
| original invoicing |53259|127.0.0.1:4200|
| original procurement |53260|127.0.0.1:4201|
| dashboard Python |53291|127.0.0.1:4320|
| Companion |53292|127.0.0.1:4318|
| saved candidate invoicing |53348|127.0.0.1:4202|

تحقق من PID/root قبل استخدام أوامر قديمة. scoped stop للخدمات **المذكورة فقط** (يبقي state/source/candidate files، ويوقف child runtime المملوك عبر Companion):

```sh
ps -p 53258 -o pid=,args=
# يجب أن يطابق serve-preserved-services.mjs أعلاه
kill -TERM 53258
```

إعادة نفس الجلسة بعد إيقاف هذه الخدمات، من جذر repository:

```sh
npm run rtl:scan:build
node test-results/contextual-preview-audit/refresh.mjs --runtimes
node test-results/contextual-preview-audit/serve-preserved-services.mjs
```

هذا يجدد generated preview assets/configs فقط، ولا يستبدل تقرير المراجعة أو يعيد patch/approval؛ توليد runtime bindings يجري scan للقراءة فقط. افتح نفس URL و`Start manual review` للاستعادة. إذا كان runtime متوقفًا، استخدم الإجراء الصريح `Open candidate preview` للـpatch الموجودة، لا session جديدة.

لتكرار الفحص من checkout الحالي على fixture نظيفة47، بعد تحرير المنافذ بإيقاف الخدمات المملوكة أعلاه؛ harness يرفض port مشغولًا ولا يقتل صاحبه:

```sh
npm run rtl:scan:build
RTL_CONTEXTUAL_BASELINE=1 RTL_REVIEW_SPECS=tests/e2e/contextual-review-preview.spec.ts node tests/e2e/run-review-workflows.mjs
node tests/e2e/run-review-workflows.mjs
npx vitest run --config tools/rtl-scanner/vitest.config.ts --maxWorkers=1
npm run typecheck
npm run build
```

كل browser runner ينشئ ويحذف fixture/candidates المملوكة له فقط عند الانتهاء، ويبقي أدلته في `test-results/review-workflows-<timestamp>/`. لواجهة نظيفة تفاعلية بدل test runner: `RTL_CONTEXTUAL_BASELINE=1 node tests/e2e/serve-review-workflows.mjs`؛ يطبع environment وPID، وCtrl+C يوقف ويحذف fixture الخاصة به. لا تحذف الجلسة المحفوظة أو backups/historical assets ضمن هذا التنظيف. بعد ذلك يمكن إعادة preserved supervisor بالأوامر السابقة. لا تستخدم kill-by-port أو خدمة4319 غير المملوكة.

#### walkthrough قصير — Ahmed acceptance غير مؤشّر

1. افتح URL واضغط `Start manual review`. راجع finding المحددة، Pending و0 accepted وNot run؛ Original يعمل أيضًا للنتائج بلا codemod.
2. أيقونة Before تفتح الأصل وحده، وأيقونة After تفتح candidate الموجودة وحدها، و`Expand` الحالي يفتح Split. جرّب search أو تنقل التطبيق، ثم Close وإعادة الفتح؛ يجب بقاء الحالة.
3. جرّب LTR/RTL وAuto/768/390؛ اختر route أوinstance لنتيجة shared/table، ثم `Highlight targets`. media/overrides لها حالة computed مستقلة عن مجرد selector match.
4. اختر finding من procurement وأخرى من HTML/shared CSS؛ تحقق من route/target الحقيقيين. `Open candidate application` إجراء runtime صريح، و`Apply & Preview` إجراء candidate صريح للـsupported finding فقط؛ لا حاجة لأي منهما لمراجعة original.
5. `Reset preview data` اختياري وصريح للبيانات المخصصة فقط، إن رغبت بمقارنة seed متكافئة بعد التفاعل. Close/Escape من dashboard يعيدان موضعك وتركيزك. اترك قرارات approval/validation/apply/rollback دون تنفيذ لهذه الجولة؛ اختباراتها المنفصلة على fixtures موثقة أعلاه.
6. [ ] Ahmed يسجل قبوله الشخصي أو ملاحظاته؛ هذه الخانة لا يملؤها agent.

### مراحل مستقبلية مؤجلة — لا تنفيذ في هذه المرحلة

- [ ] General setup UI: project root، run commands، base URLs، multiple apps وNx/monorepo setup.
- [ ] Reusable project/framework adapters.
- [ ] Reuse existing Storybook stories، fixtures وtest setup.
- [ ] Suggested automatic props/data mocking from types and actual usage.
- [ ] Editable deterministic RTL-focused mock scenarios.
- [ ] Provider/module/API mocking where supported.
- [ ] Test authentication/session setup، cookies وlocal/session storage، seeders وnavigation steps للصفحات المحمية/stateful.
- [ ] Clear distinction between real application context and mocked previews.
- [ ] Optional isolated component previews.
- [ ] Additional independent projects/scenarios.
- [ ] Explicit support boundaries and fallback behavior for general onboarding.

## متابعة fullscreen preview — 2026-11-16

تصنيف Session Guard: **CONTINUE**. نطاق هذه المتابعة: العرض والتفاعل داخل المعاينة الحية القائمة فقط.

- [x] إعادة استخدام زر `Expand` الحالي لفتح `Split`، وإضافة أيقونتي `Expand original preview` و`Expand candidate preview` إلى رأسي الإطارين.
- [x] مساحة dashboard تملأ viewport، مع `Before / After / Split`، route فعلية من رسائل bridge الموثوقة، `LTR / RTL`، viewport selector و`Close` دائم الظهور. لا اعتماد على native fullscreen.
- [x] إبقاء iframe nodes في موضعها؛ التبديل والإغلاق يغيّران العرض والأبعاد فقط. `Desktop / Auto` يستجيب للمساحة الفعلية دون transform؛ `Tablet 768 × 850` و`Mobile 390 × 850` يحتفظان بالأبعاد مع scrolling.
- [x] هوية Original/Candidate وقرار finding وvalidation منفصلان؛ لا ادعاء اعتماد أو نجاح تقني من مجرد المعاينة. فحوص origin/source/nonce/root/session/hash وsandbox محفوظة؛ route المعروضة لا تمنح حالة Ready خارج mapping المعتمدة.
- [x] عزل الخلفية بـ `inert`، قفل التمرير، حصر focus، Escape عند امتلاك dashboard للتركيز، استعادة opener ومكان dashboard. تنظيف القفل عند استبدال البطاقة عبر browser history، وربط مرشح جديد بهوية session الصحيحة.
- [x] إعادة التحقق النهائية: اختبار fullscreen الفعلي **1/1 PASS**، والمساران الكاملان **5/5 PASS**؛ typecheck وscanner typecheck/build وapp build ناجحة، وscanner **288/288 PASS**.
- [ ] قبول Ahmed الشخصي لتحسين fullscreen؛ يتركه agent دون تعليم.

المصدر: `tools/rtl-scanner/src/dashboard-embedded-preview.ts`. اختبار المتصفح المركّز: `tests/e2e/fullscreen-review-preview.spec.ts` عبر `playwright.manual-preview.config.ts` وHTTP dashboard الفعلية. تغيير اختبار المسارين الحالي يقتصر على استبدال إغلاق `Collapse` بزر `Close` في مساحة المعاينة الجديدة؛ بقية assertions lifecycle محفوظة. عولج أيضًا سباق signals في **harness فقط**: إشارة `SIGUSR2` المبكرة أثناء خروج Companion تُحفظ حتى `exit` بدل فقدها، دون تغيير الخدمة أو منطق الاسترجاع.

### أدلة fullscreen والاختبار اليدوي الحالي

- الاختبار المركّز النهائي: [نتيجة الهوية والأبعاد والطلبات](../../test-results/fullscreen-preview-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/verification.json)، [trace](../../test-results/fullscreen-preview-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/trace.zip).
- الصور: [Before فقط](../../test-results/fullscreen-preview-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/before-only.png)، [After فقط](../../test-results/fullscreen-preview-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/after-only.png)، [Split](../../test-results/fullscreen-preview-delivery/fullscreen-review-preview--10b07-ation-session-and-decisions/split.png).
- المتصفح تحقق من original بلا `bdi`، وcandidate ذات patch فعلية؛ نفس iframe nodes والتنقل ونص البحث بعد التبديل والإغلاق. شريط route يتتبع التنقل إلى `/customers`، وRTL/LTR يؤثران في الإطارين. Desktop/Auto ملء المساحة، و768/390 أبعاد فعلية دون reload؛ النافذة 900×700 تسمح بالتمرير للمقاس الثابت. الحوار 1600×1000، والتركيز وEscape/Close وscroll restoration وbrowser Back ناجحة. snapshot الجلسة والقرارات مطابق تمامًا قبل/بعد؛ **0 Companion POST** أثناء إجراءات المعاينة، ولا navigation/reload في دورات expand/close المتكررة.
- إعادة مجموعة المسارين الحالية: **5/5 PASS**، تحت `test-results/review-workflows-2026-11-16T21-25-03.839Z/`، بما فيها manual/batch وFailed/Unavailable وحماية endpoints وpartial-write rollback بعد restart. المحاولة الأولى `21-21-57.828Z` حفظت فشل سباق إشارات harness (4/5)؛ لم تُضعف assertions. اختبار fullscreen الأولي وأول اختبار history الفاشل محفوظان أيضًا؛ النهائي يثبت الإصلاح.
- الاختبار النهائي بعد تصحيح وصف التنقل خارج `/invoices`: **1/1 PASS (18.8s)**؛ route المعروضة تطابق الصفحة الفعلية، ويظهر `Live application` بدل الإبقاء على عدد صفوف invoices القديم. [لقطة المتصفح المفتوح](../../test-results/fullscreen-preview-delivery/before-in-app-browser.png).
- فحوص الكود: `npm run typecheck`، `npm run rtl:scan:typecheck`، `npm run rtl:scan:build`، `npm run build` كلها PASS؛ scanner **288/288 في 23 ملفًا**. working-source `InvoiceTable.tsx` بقي SHA-256 `fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c`.
- ملاحظة بيئة الاختبار: عند إيقاف الخدمات لإخلاء المنافذ، انتهى supervisor المؤقت القديم تلقائيًا لغياب child handles، ونفذ cleanup للـ fixture. بقي candidate root محفوظًا. استُعيد target في **نفس المسار** من المرشح و`before` في trace، ثم طابقت scanner digests و14 ملفًا/نتيجتها. استُعيد سجل workflow الكامل من استجابة HTTP المحفوظة، دون تغيير مصدر العمل أو patch المرشح. [تحقق الاستعادة](../../test-results/fullscreen-preview-first/restoration-verification.json) يثبت تطابق **كل public workflow snapshot**، بما فيها IDs و50 entry/history وfiles/hashes وruntime، مع trace السابق. لم يُنشأ candidate جديد. supervisor المستعاد يحتفظ بالملفات عند توقف الخدمات؛ الكود الخاص به generated/ignored ضمن الأدلة.

الرابط العامل: [dashboard](http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea).

1. اختر `Start manual review` لاستعادة نفس الجلسة، ثم أيقونة Before: يظهر original وحده بالحجم المتاح.
2. أغلق ثم افتح أيقونة After: يظهر candidate نفسه، بحالة `Pending · validation: Not run`. جرّب البحث والتنقل.
3. استخدم `Expand` الحالي لفتح Split. بدّل Before/After/Split وLTR/RTL وviewport؛ المقاسات الثابتة قابلة للتمرير.
4. أغلق بـ Close، أو Escape عندما يكون التركيز في toolbar؛ يعود التركيز ومكان dashboard ونفس finding والقرار. كرّر الفتح والإغلاق دون Apply أو Validate.

الخدمات الحالية — verified 2026-11-16:

- Supervisor `21826`؛ Companion `21859` على4318؛ original `21827` على4200؛ HTTP `21858` على4320؛ candidate `21866` على4202.
- نفس environment: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-EDczGl/environment.json`؛ نفس project وcandidate root السابقين.
- Workflow `77b9e220-9a97-4b01-b1dc-8dbd7e7ddb9a`؛ session `ce9eecd3-97fb-4034-ba0e-6d3451c6a8d7`. **1 candidate patch، 0 Accepted، validation Not run، source unchanged**.
- إيقاف الخدمات المملوكة فقط: `kill -TERM 21826`؛ يحتفظ بالبيانات. إعادة التشغيل المحلية: `node test-results/fullscreen-preview-first/serve-preserved-services.mjs`؛ بعد الإيقاف يلزم تشغيل runtime القائمة مرة واحدة عبر Open candidate preview. لا توقف الخدمة المستقلة على4319.
- قبول Ahmed الشخصي: [ ] fullscreen preview. لا agent acceptance بديلًا عنه.

## checkpoint التنفيذ — 2026-11-16

- تم تنفيذ `ReviewWorkflowStore` فوق scanner/codemod وcandidate/runtime و`ControlledApplyService` الحالية؛ لم يُستبدل تصميم dashboard. أزرار القرار الحالية تتصل بالحالة المحفوظة، وأضيف Reject صريح وinventory وvalidation/final apply/rollback في نفس مساحة القرار.
- `One by One` يحفظ metadata والتحليل دون candidate؛ إنشاء candidate وpatch لا يحدثان إلا عبر Apply. `Apply First` يبدأ بعد زر صريح وبـ scope ظاهر؛ يُطبق inventory المدعومة فقط على candidate. التطبيق الآلي لا يكتب Accepted.
- القرارات `Pending / Accepted / Rejected / Deferred / Flagged` منفصلة عن `applied` وعن validation وعن `Reviewing / Applying / Applied / Rolled Back`. تتضمن القرارات notes وhistory. الـ store على القرص تحت `RTL_APPLY_BACKUP_ROOT/review-workflows-v1.json`، مربوط بـ root وinputDigest وpolicyDigest وscope.
- الـ patches تحمل إحداثيات المصدر الأصلي وslice SHA-256. يُعاد تركيب كل ملف من baseline مع patches المختارة؛ الرفض/التأجيل/flag يزيل patch واحدة. overlapping ranges تُمنع؛ retry لا يعيد التحويل فوق النص المحول. إعادة التشغيل تحفظ candidate root وهوية الجلسة، ثم تعيد تشغيل runtime المملوكة عند الحاجة.
- `Validate accepted changes` يستبعد Pending/Rejected/Deferred/Flagged من المرشح النهائي، وينفذ أوامر `npm run typecheck`, `npm run build`, `npm run test` الموجودة في package المشروع، ثم scanner وفحص Chromium على route التطبيق الفعلية. تُعرض نتائج كل check بما فيها Failed وUnavailable. غياب mapping يبقى Unavailable ولا يتحول إلى ادعاء نجاح بصري. فشل check مهيأة أو غياب runtime يمنع final apply.
- قبل final apply يُعاد فحص root/canonical paths وhashes ومصادر scan/configs وcandidate validation signature. الـ journal والـ backups يُكتبان قبل الكتابة، وتُحفظ receipts. استئناف عملية Applying يستخدم نفس operation ID. rollback يتعامل مع ملفات receipts فقط، ويفحص النطاق كله قبل الكتابة؛ تعديل لاحق داخل ملف معدل يمنع rollback، وتعديل ملف آخر يبقى محفوظًا.
- `projectRoot` أضيف لهوية runtime والـ handshake فوق origin/source/nonce/session/finding/hash القائمة. المعاينات owning-route مع providers/styles/seed الفعلية؛ لا component isolation عامة ولا فرق بصري مصطنع.

### التحويلات المدعومة والحدود الصريحة

التحويل الوحيد هو `bidi-isolate-auto`: تعبير JSX نصي مباشر مثل `{item.id}` أو `{i.id}` داخل text containers المسموحة، في `apps/` أو `libs/` بامتداد TSX، مع scanner finding ورينج ونص مطابقين، ودون ancestor مع `bdi` أو `dir`. تُرفض expressions المحسوبة/المركبة، وname/email/money، وraw text/SVG/MathML، وunknown text containers، وpolicy exceptions/scan غير مكتملة. الفئات `AUTO_CANDIDATE` في scanner ليست قائمة codemods.

Fixture القبول الحالية بها **50 finding، منها 6 patches مدعومة**. يجري تطبيق/قبول اثنتين عبر ملفين، ورفض أخرى في نفس الملف، وتأجيل/flag غيرها. تبقى بقية التغييرات خارج final apply حتى لو كانت قد طُبقت في batch candidate.

البيئة المدعومة adapter المشروع Nx/React/Vite الموجود (`apps`, `libs`, package/configs، وتطبيق invoicing المطلوب لإنشاء runtime). الـ mapping المعتمدة فقط لـ `InvoiceTable.tsx` على `/invoices`؛ الملفات الأخرى تبقى قابلة لمراجعة الكود مع إظهار غياب live mapping. لا دعم frameworks أو transformation inventory عامة؛ لا codemods CSS جديدة. منافذ candidate محصورة في `4202..4212`؛ امتلاؤها سبب Unavailable دون قتل أصحابها. مخازن التنفيذ محلية؛ ليست multi-process distributed coordination. ضمان الكتابة يعتمد على filesystem/project root موثوقين ضد تبديل hostile متزامن للمجلدات، مثل حدود publisher الحالية.

### العيوب التي أُعيد إنتاجها وإصلاحها

| العيب | الدليل والتشخيص | الإصلاح وإعادة التحقق |
|---|---|---|
| Apply First يغلق الشاشة دون batch | فحص المتصفح للنسخة السابقة؛ screenshot محفوظة أثناء العمل | بدء inventory/candidate بعد initiation صريح؛ complete browser journey |
| GET يعرض Rejected قبل انتهاء كتابة الملف | `review-workflows-attempt1`، القرار جديد والملف ما زال في الكتابة | تسلسل GET snapshots مع mutations؛ إعادة إجراء الرفض وفحص الملف نجحت |
| file/finding switch يهيئ preview قبل بطاقتها | `review-workflows-attempt2` trace يحتوي null querySelectorAll | تشغيل normalizer قبل ربط المعاينة؛ الاختبار نفسه بلا pageerrors |
| partial write يترك rollback معطلاً | اختبار متصفح بصلاحية 0500 لمجلد disposable: الملف الأول طُبق والثاني EACCES | استعادة receipts للملفات المكتوبة من journal، تحديث UI من الحالة الخادمية عند الفشل، وإتاحة rollback في Applying؛ إعادة تحقق موثقة أدناه |
| اختلاف /var و/private في cleanup | scanner regression بعد تقوية root identity | canonical temp root في dispose؛ لم تُضعف اختبارات العزل |
| TS7016 الستة في harness | typecheck العام الأول | ملفات `.d.mts` حقيقية لـ portable/phase5 modules؛ typecheck ناجح |
| harness الأمني يتصل بخدمة أخرى على 4319 | أول تشغيل subset أعطى 9 PASS و5 FAIL لعدم مطابقة الهدف | منافذ مؤقتة + health root identity قبل الاختبار؛ إعادة التشغيل **14/14 PASS** |

ملاحظة الأثر الجانبي لـ harness القديم: الخدمة المستقلة PID `84347` على `4319` لم تُوقف. سجلها `/Users/a.fouad/.rtl-migration-analyzer/apply-audit-v1.json` احتفظ بمحاولة `ROLLBACK_FAILED` ذات `auditId=x`، بتاريخ `2026-11-16T20:48:57.062Z` (`22:48:57` Cairo)، وسبب `CURRENT_SOURCE_CHANGED`. لم تحدث كتابة للمصدر؛ hash ملف العمل `InvoiceTable.tsx` بقي `fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c`. لم يُحذف الحدث أو يُعدل سجل الخدمة الأخرى.

### الفحوص وأسلوب التشغيل

```sh
# Run from the repository root. Dependencies are already installed.
npm run typecheck
npm run rtl:scan:typecheck
npm run rtl:scan:build
npm run build
npm run rtl:scan:test
npm run test:e2e:workflows
```

الأمر الأخير يبدأ disposable target وCompanion وVite وHTTP dashboard، ويتحقق من endpoints، ويشغل suite المتصفح على dashboard الفعلية، ثم يوقف عملياته فقط وينظف target/candidates الخاصة به. يفشل بوضوح عند شغل منافذ الخدمات الأساسية، ولا يقتل أصحابها. تُحفظ trace/video/screenshots وinventory/decisions/hashes/receipts في output جديد تحت `test-results/review-workflows-<timestamp>/`. الملفات الأصلية للمشروع واختبارات `typecheck/build/test` تُنسخ كما هي؛ لا فحوص بديلة مخففة في دليل القبول النهائي.

لبيئة شخصية مستمرة:

```sh
npm run rtl:scan:build
node tests/e2e/serve-review-workflows.mjs
# Read REVIEW_WORKFLOWS_ENVIRONMENT and the new environment.json path.
# In another terminal, optional browser rerun:
RTL_MANUAL_ENVIRONMENT='/actual/environment.json' npx playwright test \
  --config=playwright.manual-preview.config.ts tests/e2e/review-workflows-complete.spec.ts \
  --output=test-results/personal-review-run
# Stop only the printed supervisor; this disposes this disposable environment:
kill -TERM <supervisorPid>
```

`SIGUSR1` و`SIGUSR2` على supervisor هما controls اختبارية لإيقاف/إعادة تشغيل Companion فقط مع حفظ المرشح والـ store؛ ليستا مطلوبتين للاستخدام العادي. استمرار الخدمة الفعلي وPID وروابط أحدث الأدلة تُسجل أدناه بعد آخر دورة قبول. اختبارات UI القديمة التي تفترض ظهور شاشات `Codemod Dry Run` افتراضيًا لم تُستخدم كدليل قبول جديد؛ هذه suite تغطي العقد الحالي على الصفحة المرسلة الفعلية. لا ادعاء بأن كل اختبارات المراحل التاريخية أُعيد تشغيلها.

### walkthrough لقبول Ahmed الشخصي (غير مؤشّر)

1. افتح dashboard واختر `Review One by One` ثم `Start manual review`. راجع الاقتراح وoriginal preview؛ لا تتغير المصادر أو ينشأ candidate من مجرد التحليل.
2. اختر finding المدعومة واضغط `Apply & Preview`، ثم جرّب `RTL`, `LTR`, أحجام العرض و`Expand`. `Approve fix` يثبت القرار فقط. جرّب Reject/Defer وراجع inventory وreload.
3. نفذ `Validate accepted changes`، وراجع checks والـ hashes، ثم `Apply accepted changes to source` فقط عندما ترغب في التطبيق على **الهدف disposable**. جرّب rollback وراجع receipts.
4. من `Change review workflow` ابدأ `Apply First`. قارن عدد patches الفعلية بالـ inventory، ثم اقبل/ارفض/أجّل. لا يكفي بدء batch لإصدار قبول. أعد validation والتطبيق والاسترجاع.
5. إذا ظهرت جلسة `Rolled Back` سابقة، استخدم `Start new review` لبدء سجل جديد صريح. سجّل قبولك أو ملاحظاتك بنفسك؛ agent لا يملأ خانات Ahmed.

---

## النتيجة النهائية والأدلة — verified 2026-11-16

| المسار / الضمان | النتيجة | Ahmed personally accepted |
|---|---|---|
| Review One by One: candidate → decisions → configured validation → accepted source apply → rollback | PASS | [ ] |
| Apply First: supported inventory → mixed decisions → accepted-only result → apply/rollback | PASS | [ ] |
| reload/restart/outage، occupied ports، stale original/candidate، duplicate/retry، rejection preserves acceptance | PASS | [ ] |
| Failed/Unavailable تمنع apply؛ partial-write recovery بعد restart | PASS | [ ] |

الفحوص النهائية: `npm run typecheck` PASS؛ `rtl:scan:typecheck` PASS؛ `rtl:scan:build` PASS؛ `npm run build` PASS (3 Nx tasks)؛ `rtl:scan:test` PASS (**288/288، 23 files**)؛ `npm run test:e2e:workflows` PASS (**5/5**)؛ subset الحماية على خدمات مملوكة PASS (**14/14**). أخطاء `TS7016` محلولة. memory validator: required links PASS؛ بقيت 7 freshness warnings وentry index بلا verification date؛ روجعت دون إعادة كتابة الحقائق التاريخية.

دورة القبول النهائية نسخت اختبارات/configs/toolchain المشروع الأصلية وشغلت `npm run typecheck/build/test` عليها داخل candidate؛ جميعها Passed. غياب live mapping لـ `ReviewTokens.tsx` بقي Unavailable مستقلاً عن نجاح فحوص الكود والتطبيق. لا blockers متبقية للعقد ضمن inventory/adapter المعلنين؛ قبول Ahmed ما زال غير مؤشّر.

الأدلة generated/ignored، ومحاولات الفشل محفوظة. الدليل النهائي تحت `test-results/review-workflows-2026-11-16T21-01-21.723Z/`:

- [One by One: inventory، decisions/history، requests، checks، hashes، receipts](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--8eae8-tion-and-protected-rollback/acceptance.json)، [trace](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--8eae8-tion-and-protected-rollback/trace.zip)، [video](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--8eae8-tion-and-protected-rollback/video.webm).
- [Apply First: inventory والقرارات والتطبيق والاسترجاع](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--53678-tion-and-protected-rollback/acceptance.json)، [trace](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--53678-tion-and-protected-rollback/trace.zip).
- [المعاينة RTL المكبرة](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--8eae8-tion-and-protected-rollback/expanded-rtl.png)، [dashboard بعد validation](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--53678-tion-and-protected-rollback/validated-dashboard.png).
- [نتائج check الفاشلة](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--a42b4-ck-final-source-application/failed-validation.json)، [Unavailable](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--a42b4-ck-final-source-application/unavailable-check.png)، [Failed](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--a42b4-ck-final-source-application/failed-check.png).
- [استرجاع partial write بعد restart](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--7bc27--through-scoped-UI-rollback/partial-recovery.json)، [لقطة الفشل الجزئي](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--7bc27--through-scoped-UI-rollback/partial-apply.png)، [trace](../../test-results/review-workflows-2026-11-16T21-01-21.723Z/review-workflows-complete--7bc27--through-scoped-UI-rollback/trace.zip).

`acceptance.json` يثبت تطابق restoredHashes مع originalHashes في المسارين. `partial-recovery.json` يثبت `Rolled Back` مع receipt واحدة للملف المكتوب؛ الملف الثاني غير المكتوب بقي خارج rollback بعد restart. تظل التعديلات اللاحقة في ملف خارج نطاق receipts محفوظة، وتمنع التعديلات اللاحقة داخل ملف مكتوب rollback قبل أي كتابة.

| الهوية | القيمة |
|---|---|
| inputDigest | `acc14c4d91bf8eef8ffd99db03c258ad2597a7268fa60877e7acc8d7f1deb5f5` |
| policyDigest | `fc82bc0137f0800c3c6818b55a14ef2ac9abaeb1b018d503834d9899183abf49` |
| One by One workflow | `25f80bc7-5eb1-48b6-9ef7-47dfddf70acf` |
| Apply First workflow | `b23f5e79-832c-4551-a931-12a7c639d0f3` |
| InvoiceTable original / restored SHA-256 | `2858495a622f77d758812f04a580b48bdacb53a3d84bb44e66f57df994dc12fb` |
| InvoiceTable accepted result SHA-256 | `681c317d4b6365556829e9bc7e7842a04a7a8556395d022f15e6689916b3f235` |
| ReviewTokens original / restored SHA-256 | `0aa9d8939179735e4c256956dec19f1f91b1080bdcd87c48fd40c7f5997e299d` |
| ReviewTokens accepted result SHA-256 | `5549545e9e723b98d514850e9abfe1e0bd4eeaed11496cce04c094a2ff00edac` |

### سجل الخدمات السابق — checked 2026-11-16، Cairo 23:06 (تاريخي؛ الحالة الحالية في متابعة fullscreen أعلاه)

- Dashboard: `http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea`؛ HTTP PID `14105`.
- Supervisor PID `14067`؛ Companion PID `14073` على `4318`؛ original Vite PID `14074` على `4200`؛ candidate Vite PID `14116` على `4202`.
- Environment: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-EDczGl/environment.json`.
- Project: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-EDczGl/project`. Stores تحت sibling `state/`؛ workflow store تحت `state/backups/`.
- Personal workflow `77b9e220-9a97-4b01-b1dc-8dbd7e7ddb9a`؛ candidate session `ce9eecd3-97fb-4034-ba0e-6d3451c6a8d7`؛ candidate root `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-review-zsIHKD`.
- تحقق CUA من الأصول النهائية: الإطاران Ready، patch واحدة applied إلى candidate، **0 Accepted**، validation `Not run`، بلا source apply. يمكن لـ Ahmed المتابعة من `Approve fix` أو تجربة Reject/Defer. بدء batch من Change workflow صريح.
- [لقطة dashboard الشخصية الحالية](../../test-results/review-workflows-personal-2026-11-16/dashboard.png).

لإيقاف البيئة الحالية وتنظيف target/candidates المملوكة لها فقط:

```sh
kill -TERM 14067
```

لا تستخدم قتلًا عامًا للمنافذ. الخدمة المستقلة `84347:4319` بقيت قائمة ولا يملكها هذا supervisor. الإيقاف الكامل للـ disposable supervisor يزيل fixture وbackups الخاصة بهذه البيئة المؤقتة؛ restart للـ Companion وحده يحفظها. إعادة التشغيل من أوامر `serve-review-workflows.mjs` أعلاه تنتج paths وPIDs جديدة؛ لا تعِد استخدام هذه الأرقام بعد تغير حالة الخدمات.

## سجل الخطة السابقة (تاريخي)

# خطة إكمال مسار «Review One by One» اليدوي

تاريخ الفحص: 2026-11-16

## الهدف والنطاق المدعوم

الهدف هو إكمال مسار يدوي قابل للاستخدام والعرض من تشغيل analyzer على مشروع، وفتح dashboard، واختيار finding، ثم تحليل اقتراح مدعوم، وإنشاء candidate معزول، ومراجعة الكود والمعاينة، وتسجيل قرار المراجعة، والتحقق، ثم تطبيق التغيير على المصدر الأصلي فقط عبر إجراء صريح محمي وقابل للاسترجاع.

النطاق المدعوم لهذا الإنجاز هو fixture الخاص بـ Atlas invoicing والتحويل المحدد `bidi-isolate-auto` للـ finding:

`RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea`

المسار لا يثبت دعم مشاريع أو frameworks أو findings عشوائية. الدليل على ذلك أن `preview-companion.ts` يرفض هوية finding غير المحددة، ويثبت المصدر `apps/invoicing/src/components/InvoiceTable.tsx`، ويستخدم إعداد Vite الخاص بـ invoicing لإنشاء candidate runtime.

## مصفوفة القدرة الحالية

| القدرة | الحالة | الدليل | Codex/browser verified | Ahmed manually verified |
|---|---|---|---|---|
| تشغيل scan وإنشاء dashboard | VERIFIED WORKING | `README.md` أوامر `rtl:scan:build` و`cli.js --format dashboard`; `tools/rtl-scanner/README.md` | نعم، بحسب baseline الموثق؛ أعد التحقق ضمن milestone 0 | لم يُعلّم |
| دخول Review One by One واختيار finding | VERIFIED WORKING | `tests/e2e/review-one-by-one-analysis.spec.ts`; `dashboard-client.ts` event `rtl-review-one-by-one-entered` | نعم | لم يُعلّم |
| تحليل finding المدعوم دون إنشاء candidate | VERIFIED WORKING | نفس الاختبار: POST واحد إلى `/review/codemod/analyze` و0 إلى `/review/sessions` | نعم | لم يُعلّم |
| عرض Before/After للكود والـ patch identity | VERIFIED WORKING | `review-session.ts` `reviewSessionDiff`; `evidence-store.ts` digest/range checks | نعم، كاختبارات حالية؛ يلزم click-through للواجهة الكاملة | لم يُعلّم |
| Apply & Preview من One by One | VERIFIED WORKING للنقرة الأولى | `review-one-by-one-preview.spec.ts`: session واحدة ثم `/patch` واحد ثم diff وruntime healthy؛ تحقق 2026-11-16 بعد إصلاح إعادة الاختيار | نعم، الأدلة أدناه | لم يُعلّم |
| candidate معزول وcandidate preview | VERIFIED WORKING في مسار Codemod Dry Run، IMPLEMENTED BUT NOT VERIFIED من One by One | `review-session.ts` `createReviewSession`, `applyReviewPatch`, `startCandidateRuntime`; `apply-rollback-disposable.spec.ts` | جزئياً | لم يُعلّم |
| مقارنة preview أصلية/candidate | VERIFIED WORKING للنطاق المدعوم | تحديث Milestone 1E في 2026-11-16: إطاران حقيقيان داخل dashboard؛ DOM وLTR/RTL وviewport وExpand مثبتة؛ external links ثانوية | نعم، أدلة 1E أدناه | لم يُعلّم |
| منع duplicate click/session | IMPLEMENTED BUT NOT VERIFIED | `dashboard-client.ts` `button.dataset.busy` و`selectionToken`; لا يوجد اختبار ضغط/نقر مزدوج | لا | لم يُعلّم |
| finding/session isolation وstale source | VERIFIED WORKING في lifecycle | `review-session.ts` identity/digest checks؛ `stale-lifecycle.spec.ts` | نعم في المسار الحالي | لم يُعلّم |
| review decision persistence | VERIFIED WORKING في المسار الكامل | `review-store.ts` transitions/persistence؛ `apply-rollback-disposable.spec.ts` بعد reload | نعم | لم يُعلّم |
| validation/evidence lifecycle | VERIFIED WORKING في disposable E2E | `validation.ts`, `evidence-store.ts`, `apply-rollback-disposable.spec.ts` | نعم | لم يُعلّم |
| explicit apply to original | VERIFIED WORKING في disposable E2E | `controlled-apply.ts`; Apply/Rollback disposable test | نعم | لم يُعلّم |
| rollback/recovery | VERIFIED WORKING في disposable E2E | `rollback-recovery.test.ts`, `failed-lifecycle.spec.ts` | نعم | لم يُعلّم |
| unsupported finding explanation | PARTIAL / BROKEN للتحقق اليدوي | backend يرفض `UNSUPPORTED_FINDING_IDENTITY`، لكن يلزم إثبات أن UI تعرض سبب عدم الإتاحة داخل One by One | لا | لم يُعلّم |

ملاحظة: نتيجة `python3 docs/project-memory/validate.py` في هذا الفحص: الروابط المطلوبة سليمة، مع خمس تحذيرات freshness استشارية ومرجع واحد بلا تاريخ تحقق. لم تُعد كتابة memory لأن المهمة خطة فقط.

## حدود الهوية والتشغيل

- يجب أن تأتي هوية report/dashboard من نفس scan manifest: `findingId`, `sourcePath`, `inputDigest`, `policyDigest`, `schemaVersion=2`.
- المصدر الحالي يستعمل `RTL_PROJECT_ROOT` وstore paths صريحة، وCompanion على `127.0.0.1:4318`، وdashboard على `127.0.0.1:4320`. تحقق 2026-11-16: `CANDIDATE_PORT` في `review-session.ts` هو `4202`؛ الرقم `4319` السابق يخص Companion في اختبارات أخرى، وليس candidate runtime.
- الإعداد الموثق في `playwright.phase5.config.ts` ينشئ dashboard وCompanion مع state disposable. الإعداد في `playwright.apply-rollback.config.ts` يضيف تطبيق invoicing على `127.0.0.1:4200`.
- `Component Review` لا يثبت حاليًا تطبيقين مضمّنين داخل dashboard؛ controls تفتح routes خارجية عبر `window.open`. لذلك criterion اليوم هو preview قابل للفتح ومقارنة أصلية/candidate واضحة، لا iframe أو redesign.
- أزرار `Apply to Candidate`, `Approve`, و`Apply Change` تمثل عمليات مستقلة في state machine؛ لا يجوز دمجها في إثبات واحد.

## الخطة المرتبة

### Milestone 0 — تجهيز وإثبات identity/startup

النتيجة المرئية: تشغيل analyzer/dashboard/Companion على fixture disposable من أوامر مكتشفة من repository، ثم ظهور finding المدعوم في dashboard.

إعادة الاستخدام: `README.md`, `playwright.phase5.config.ts`, `tests/e2e/portable-fixture.mjs`, `phase5-fixture.mjs`.

المطلوب: توثيق الأمر الفعلي المستخدم، working directory، ports، route، وstore paths؛ التأكد أن dashboard وCompanion يقرآن نفس manifest والـ project root.

Acceptance:

- [x] dependencies الموجودة استُخدمت ونجح `npm run rtl:scan:build` و`npm run rtl:scan:typecheck`؛ لم نعد تثبيت dependencies.
- [x] dashboard على `http://127.0.0.1:4320/rtl-report-dashboard.html` وCompanion health على `http://127.0.0.1:4318/health`.
- [x] يظهر finding `RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea` مع المصدر الصحيح.
- [x] دليل الإنجاز: report identity ولقطة/trace Playwright ونتائج التنفيذ أدناه.
- [ ] إغلاق الخدمات وحذف disposable state مؤجلان إلى ما بعد قبول Ahmed؛ أمر الإيقاف أدناه.

اختبار regression: `npm run rtl:scan:typecheck`, `npm run rtl:scan:build`, ثم `playwright test --config=playwright.phase5.config.ts tests/e2e/phase5-progress.spec.ts`.

### Milestone 1 — Apply & Preview من Review One by One

النتيجة المرئية: بعد `Start manual review` ونجاح التحليل، يؤدي `Apply & Preview` إلى candidate واحد معزول، patch verified، diff، وcandidate preview؛ يبقى المصدر الأصلي بلا تغيير.

إعادة الاستخدام: `dashboard-client.ts` flow الخاص بـ `/review/sessions`, `/codemod/apply`, `/diff`, `/runtime/start`; `review-session.ts`; `apply-rollback-disposable.spec.ts` كمرجع lifecycle.

المطلوب: اختبار click-through جديد أو توسيع `review-one-by-one-analysis.spec.ts`؛ لا تعديل UI إلا إذا أثبت المتصفح defect.

Acceptance:

- [x] دخول `Start manual review` ثم اختيار finding يعرض Before/After verified.
- [x] نقر `Apply & Preview` مرة واحدة ينشئ candidate واحدًا فقط، وتظهر حالة candidate healthy. إعادة استخدام session بعد reload خارج تحقق هذه المهمة.
- [x] diff verified بنفس path/range؛ hashes مثبتة بربط analysis/patch responses بقراءة ملفَي original وcandidate.
- [x] candidate preview يفتح خارجيًا من `LTR` و`RTL`، وثبت URL والـ mode والـ session identity. المقارنة الأصلية/المرشح جنبًا إلى جنب ما زالت غير مثبتة.
- [x] يظل source file الأصلي وoriginal hash دون تغيير.
- [x] دليل الإنجاز: Playwright trace/video، request counts، session ID، diff payload، hash comparison أدناه.
- [x] عيب إعادة اختيار finding سُجل قبل الإصلاح، ثم أُصلح توقيت إعادة ربط الزر وأعيد نفس الاختبار بنجاح.

اختبار regression: `playwright test --config=playwright.phase5.config.ts tests/e2e/review-one-by-one-analysis.spec.ts` مع الاختبار الجديد، ثم `npm run rtl:scan:test`.

### Milestone 1E — المقارنة الحية المضمّنة (الأولوية الحالية)

أضيف بطلب Ahmed في 2026-11-16، قبل milestones القرارات والتطبيق النهائي. الهدف: route التطبيق الأصلي والـ candidate داخل إطارين فعليين جنبًا إلى جنب في Component Review، مع تشغيل موثوق وحالات منفصلة وأزرار الاتجاه والـ viewport والتوسعة.

التشخيص قبل التغيير: المنفذ `4202` يملكه PID `91449`، ابن Companion `90948`، ويشغل candidate الخاص بالجلسة `e452f638-70cd-4a80-a898-9169d8e9d804`. `GET /review/sessions/:id` يؤكد `healthy`. لم يكن Companion متوقفًا؛ جلسة جديدة اصطدمت بالمنفذ الثابت لجلسة أخرى. لا يجوز إعادة استخدام هذه العملية تحت هوية جلسة جديدة أو قتلها بسبب التعارض.

| مهمة القبول | Codex/browser verified | Ahmed manually verified |
|---|---|---|
| E1: إعادة استخدام runtime المطابقة واختيار منفذ محلي مسموح آخر عند التعارض ومعالجة السباق | [x] PASS | [ ] |
| E2: retry يحفظ session وpatch؛ cleanup يوقف العمليات المملوكة فقط | [x] PASS | [ ] |
| E3: Before/After يعرضان route الحقيقي مع providers/styles/data داخل dashboard | [x] PASS | [ ] |
| E4: رسائل جاهزية موثقة بالـ origin/source/session/nonce؛ حالات الخطأ منفصلة؛ لا قراءة DOM عابرة للأصل | [x] PASS | [ ] |
| E5: DOM الأصل بلا bdi والمرشح بالاستبدال؛ LTR/RTL وviewport وExpand يعملان على الإطارين | [x] PASS | [ ] |
| E6: تغيير finding لا ينسب معاينة قديمة إلى الجديدة؛ hash الأصل ثابت | [x] PASS | [ ] |

النهج المقرر: reuse manifest/session/runtime وdev-only wrapper لـ Vite في fixture/candidate، وbridge محدود يؤكد rendering من داخل التطبيق نفسه. فحص أولي: dashboard لا يفرض CSP يرفض frames، ورد Vite لا يحتوي `X-Frame-Options` أو `frame-ancestors`. لا توجد مصادقة في fixture، وبياناتها seed محلية. سيقتصر أي إعداد embedding على wrapper المعاينة المحلي؛ تبقى route preview لا component isolation. الأوامر والأدلة ونتائج التنفيذ ستضاف هنا بعد التحقق.

### Milestone 2 — duplicate prevention وfinding/session isolation

النتيجة المرئية: النقر المزدوج أو إعادة selection لا ينشئ sessions متنافسة، ولا يعرض candidate متعلقًا بـ finding آخر.

Acceptance:

- [ ] نقر `Apply & Preview` مرتين بسرعة ينتج POST/session واحدًا وحالة واحدة.
- [ ] تغيير finding أثناء operation لا يكتب نتيجة إلى finding الجديد أو القديم الخطأ.
- [ ] reload يعيد نفس record بالـ identity الرباعية و`schemaVersion`.
- [ ] stale source يعرض blocked/stale ولا يسمح بالتطبيق.
- [ ] دليل الإنجاز: Playwright request counter، identities، reload assertions.

اختبار regression: `tests/e2e/stale-lifecycle.spec.ts`, `tests/e2e/security-negative.spec.ts`، واختبار E2E جديد للنقر المزدوج.

### Milestone 3 — unsupported finding وقرار المراجعة

النتيجة المرئية: finding غير المدعوم يبقى inspectable ويشرح أن الاقتراح/التطبيق التلقائي غير متاح؛ finding المدعوم يسجل قرارًا مع notes/evidence.

Acceptance:

- [ ] unsupported finding يعرض source/explanation وسبب `UNSUPPORTED_FINDING_IDENTITY` بصياغة مفهومة، دون candidate.
- [ ] المدعوم لا ينتقل إلى `Ready for Review` بلا required notes/evidence.
- [ ] `Mark Ready for Review` ثم `Approve` يحفظان decision وhistory بعد reload.
- [ ] `Approve` لا يعدل source ولا يساوي apply.
- [ ] دليل الإنجاز: UI assertions، companion payload، persisted store record.

اختبار regression: `tests/e2e/phase14-review-state.spec.ts` مع امتداد UI، وunit tests لـ `review-store.ts` و`review-approval.ts`.

### Milestone 4 — validation ثم explicit apply/rollback

النتيجة المرئية: candidate validated، status واضح، ثم Apply إلى الأصل من زر مستقل وبعد safeguards، مع rollback/recovery واضحين.

Acceptance:

- [ ] `Run Validation` يعرض scanner before/after وbrowser DOM checks وstate `Passed` أو سبب failure.
- [ ] `Archive Evidence` يحفظ source/candidate hashes وfinding identity.
- [ ] لا يظهر `Apply Change` كجاهز قبل Approved + valid evidence + fresh source.
- [ ] confirmation صريح يطبق candidate hash إلى disposable original فقط.
- [ ] rollback يعيد original hash؛ conflict ينتج `ROLLBACK_CONFLICT`/`Failed` ولا يمسح audit.
- [ ] reload/restart يحافظان على lifecycle وaudit.
- [ ] دليل الإنجاز: `apply-rollback-disposable.spec.ts`, `failed-lifecycle.spec.ts`, audit/evidence payloads.

### Milestone 5 — manual handoff وقبول أحمد

النتيجة المرئية: إجراء تشغيل يدوي قصير يثبت journey كاملة على disposable fixture، مع فصل واضح لما يحتاج قرار Ahmed.

Acceptance:

- [ ] لا توجد علامة Ahmed مكتملة من Codex.
- [ ] Ahmed يشغل الأوامر الموثقة ويؤكد startup والـ route.
- [ ] Ahmed ينفذ click-through كاملًا ويؤكد Before/After، candidate preview، notes، validation، وexplicit apply/rollback.
- [ ] يسجل Ahmed browser/version، timestamp، fixture identity، والنتيجة/الملاحظات.

## تعريف «manual workflow complete»

يكون المسار مكتملًا عندما تنجح milestones 0–4 بمتصفح Playwright على disposable fixture، ويُثبت من الطلبات والواجهة والملفات أن: finding identity واحدة؛ candidate واحد معزول؛ patch وdiff وhashes صحيحة؛ original/candidate preview قابلان للمقارنة؛ القرار محفوظ؛ validation/evidence محفوظان؛ apply إلى الأصل منفصل وصريح؛ stale/duplicate/failure محمية؛ وAhmed يكرر المسار ويوقع milestone 5. لا يعني ذلك دعم arbitrary project أو arbitrary finding.

## ما هو خارج نطاق اليوم والبلوكَر العام

- دعم frameworks أو project roots أو codemods عامة: يحتاج adapters، route discovery، source-range contracts، preview startup contracts، وسياسة transformation لكل finding.
- القيد التاريخي الخاص بتأجيل Embedded comparison استُبدل بطلب Ahmed وتنفيذ Milestone 1E الموثق هنا؛ بقي component isolation العام خارج النطاق، والمعروض هو owning-route preview.
- Apply First, Review Later، redesign، cleanup غير متعلق، npm release، وأي تعديل في historical video assets.

## أول execution prompt

```text
In the repository root, execute only Milestone 0 and the first half of Milestone 1 from docs/rtl-analyzer-v3/manual-review-completion-plan.md.

Use the existing Playwright portable fixture and configs. Do not modify application source, dashboard UI, historical assets, or production project files. First run the documented build/typecheck prerequisites, then run the real Chromium click-through for the supported finding RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea.

Verify from the UI and network that:
1. the dashboard and Companion use the same project/report identity;
2. Start manual review performs one successful analysis and creates no candidate;
3. Apply & Preview creates at most one isolated candidate, applies only the verified patch to it, returns a ready diff with path/range/hashes, and starts a healthy candidate runtime;
4. the original source file and original SHA-256 remain unchanged;
5. the candidate preview route is exposed with the expected session and mode.

If a defect appears, make one narrowly scoped fix only after recording the failing observable, then rerun the same browser checks. Otherwise make no source changes. Save the trace/video and report the exact commands, URLs, request counts, session ID, diff payload, and hashes. Stop before review-decision or apply-to-original work.
```

## تعليمات الاختبار اليدوي لأول milestone

1. من جذر repository نفّذ `npm ci` إذا كانت dependencies غير مثبتة، ثم `npm run rtl:scan:typecheck` و`npm run rtl:scan:build`.
2. شغّل الاختبار: `npx playwright test --config=playwright.phase5.config.ts tests/e2e/review-one-by-one-analysis.spec.ts`، أو شغّل نفس web servers بالـ config واتبع dashboard URL الظاهر في الخطة.
3. في dashboard اختر finding المدعوم واضغط `Start manual review`. المتوقع: تحليل ناجح، Before/After صحيحان، و`Apply & Preview` enabled.
4. اضغط `Apply & Preview` مرة واحدة. المتوقع: رسالة candidate معزول، diff verified، وpreview candidate healthy؛ لا تتغير نسخة المصدر الأصلية.
5. افتح original وcandidate preview routes إن ظهرت controls، وسجل URL و`mode` وsession ID. لا تضغط `Approve` أو `Apply Change` في هذا milestone.
6. أعد تحميل dashboard وتحقق أن finding/session identity والـ hashes ما زالت متسقة، ثم أغلق الخدمات واحذف disposable fixture/state فقط.

نتيجة النجاح المطلوبة: trace أو video يثبت كل النقرات، console/network log يثبت عدد operations، وhash comparison يثبت أن التغيير بقي داخل candidate.

## سجل تنفيذ المهمة الحالية — 2026-11-16

تصنيف Session Guard: `CONTINUE`. لم نجد `.specify/` أو feature artifacts لـ Spec Kit؛ الربط بالمعرفات الموجودة هو `Milestone 0` للهوية والتشغيل و`Milestone 1` لأول Apply & Preview ومعاينة candidate. لم تبدأ milestones 2–5. علامات الإنجاز السابقة في هذا القسم تخص Codex فقط.

| معيار المهمة | Codex/browser verified | Ahmed manually verified |
|---|---|---|
| Environment identity | PASS — report HTTP وembedded dashboard لهما نفس digests/schema؛ إعادة scan من fixture تطابق report؛ snippet يطابق سطور الملف؛ Companion analysis يعيد SHA-256 نفسه وstore داخل fixture | [ ] لم يتحقق بعد |
| Manual analysis | PASS — دخول المسار ثم نقر finding؛ After يعرض الاستبدال الحقيقي؛ POST analysis واحد و0 candidate أثناء هذه المرحلة | [ ] لم يتحقق بعد |
| Apply & Preview | PASS — session واحدة وpatch واحد وruntime healthy؛ ملف candidate قُرئ فعليًا ومحتواه مطابق؛ الأصل بقي كما هو | [ ] لم يتحقق بعد |
| Candidate preview LTR/RTL | PASS — نافذتان خارجيتان من controls؛ mapping requests تحمل session نفسها؛ اتجاه html صحيح وinvoice-link يحوي bdi مرئيًا بنص INV؛ لا JavaScript page errors | [ ] لم يتحقق بعد |

### العيب والإصلاح المحدود

قبل الإصلاح أثبت المتصفح أن إعادة اختيار finding بعد التحليل تُبقي After صحيحًا لكنها تعيد `Apply & Preview` إلى `disabled` بعنوان `Unavailable: local companion required`. انتهى الاختبار بمهلة عند النقر. السبب أن cache branch يحاول ربط الزر قبل اكتمال إعادة بناء عناصر الواجهة بواسطة observers. التغيير في `dashboard-client.ts` يؤجل ربط cache branch باستخدام `setTimeout(..., 0)` مع فحص finding الحالية. لم تتغير بنية أو تصميم الواجهة.

دليل الفشل: [trace قبل الإصلاح](../../test-results/manual-preview/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/trace.zip)، و[سياق الفشل](../../test-results/manual-preview/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/error-context.md).

كذلك كشف فحص الإعداد قبل التنفيذ أن portable harness يولد التقرير من repository بدل fixture، وأن original Vite في config يستعمل ملف config الموجود في repository. عُدل harness لنسخ policy وتوليد report مع source snippets من `project` المؤقت، ولتشغيل original من config تلك النسخة. اختبار القبول يعيد scan ويقارن digests وsnippets ويقرأ candidate عبر مسار Vite source map ثم filesystem؛ فلا يكفي HTTP 200.

### الأدلة الفعلية

- Session: `e452f638-70cd-4a80-a898-9169d8e9d804`.
- Fixture original: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-nbShri/project`.
- Candidate source: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-review-nhVi0D/apps/invoicing/src/components/InvoiceTable.tsx`.
- `schemaVersion=2`؛ `inputDigest=3011f559425f764e053dd89b48a060b24d79ce1d9a3eca068fb5e308fb81608a`؛ `policyDigest=fc82bc0137f0800c3c6818b55a14ef2ac9abaeb1b018d503834d9899183abf49`.
- Original before SHA-256: `fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c`.
- Original after SHA-256: `fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c`.
- Candidate SHA-256: `8839c8b52b8a29855f97d0b31bf318b4d591c7ed7c78b4f58daa36491bc4aa03`.
- Patch offset range: `[760, 766)`؛ original slice SHA-256: `9efab2d80f1ed5f6e00518335775aaf5cc02a308b398667f53e6042d87f32b4f`.

```diff
--- apps/invoicing/src/components/InvoiceTable.tsx (original)
+++ apps/invoicing/src/components/InvoiceTable.tsx (candidate)
@@ 19:15 → 19:15
- {i.id}
+ <bdi dir="auto">{i.id}</bdi>
```

التسلسل الفعلي للعمليات الأساسية، وكل عملية مرة واحدة: `POST /review/codemod/analyze` → `POST /review/sessions` → `POST /review/sessions/:session/patch` → `GET /review/sessions/:session/diff` → `POST /review/sessions/:session/runtime/start` → `GET /mappings/invoicing-invoice-table/preview?mode=ltr&session=...` → نفس mapping بـ `mode=rtl`. حالات الاستجابة: `200, 201, 200, 200, 200, 200, 200`. طلبات القراءة الخلفية الخاصة بالقرار والسجل والدليل وeligibility وaudit وlifecycle لا تمثل writes؛ لم يُنفذ validation أو قرار أو apply إلى original أو rollback.

الأدلة محفوظة محليًا في outputs القابلة لإعادة التوليد:

- [acceptance.json: الهوية والـ hashes والـ diff والطلبات](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/acceptance.json)
- [network.json](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/network.json)، [console.json](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/console.json)، [trace.zip](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/trace.zip)
- [dashboard بعد العملية](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/candidate-ready.png)، [LTR الفعلية](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/candidate-ltr.png)، [RTL الفعلية](../../test-results/manual-preview-verified/review-one-by-one-preview--a03a2-nders-candidate-LTR-and-RTL/candidate-rtl.png)

### الملفات ونتائج الفحص

تعديلات هذه المهمة فقط:

1. `tools/rtl-scanner/src/dashboard-client.ts`: إصلاح cache branch عند إعادة اختيار finding.
2. `tests/e2e/portable-fixture.mjs`: scan/policy/source snippets من fixture.
3. `playwright.apply-rollback.config.ts`: original Vite config من fixture.
4. `tests/e2e/review-one-by-one-preview.spec.ts`: behavioral regression والتحقق من الهوية والملفات والمعاينتين.
5. `playwright.manual-preview.config.ts`: تشغيل اختبارات المتصفح على البيئة المؤقتة المعروفة.
6. `tests/e2e/serve-manual-preview.mjs`: إبقاء خدمات fixture للمراجعة وإغلاقها مع التنظيف.
7. هذه الخطة: checklist وأدلة المهمة. تغييرات المستخدم السابقة الأخرى محفوظة.

| الأمر | النتيجة |
|---|---|
| `npm run rtl:scan:typecheck` | PASS |
| `npm run rtl:scan:build` | PASS |
| `npm run rtl:scan:test` | PASS — 282 tests / 21 files |
| `npm run build` | PASS — 3 Nx tasks |
| `npm run typecheck` | FAIL — ستة TS7016 تخص تعريفات `portable-fixture.mjs` و`phase5-fixture.mjs` في configs/tests الحالية؛ لا خطأ متبقٍ في الاختبار الجديد |
| `review-one-by-one-analysis.spec.ts` + `review-one-by-one-preview.spec.ts` عبر manual-preview config | PASS — 3/3؛ بعد الإصلاح وإعادة نفس النقرات |
| `phase5-progress.spec.ts` عبر phase5 config | FAIL — 0/2؛ `Total current findings: 2` موجود لكنه hidden؛ ليس إثباتًا لفشل Apply & Preview، ولم نغير واجهة progress ضمن المهمة |
| `python3 docs/project-memory/validate.py` | PASS للروابط؛ 5 advisory staleness warnings ومرجع بلا تاريخ؛ لم تُعد كتابة memory |

النتيجة: معايير المهمة الأربع PASS؛ فحوص المشروع العامة ليست كلها خضراء للأسباب المسجلة. milestones القرار والتحقق والتطبيق النهائي ما زالت خارج هذه المهمة. لا يوجد قبول يدوي من Ahmed حتى الآن.

### التشغيل المتروك لقبول Ahmed

الخدمات الآن: dashboard HTTP `4320`، Companion `4318`، original fixture Vite `4200`، candidate Vite `4202`. المشرف PID `90946`؛ children: `90948`, `90949`, `90980`، وcandidate PID `91449` تابع للـ Companion. URLs:

- `http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea`
- `http://127.0.0.1:4202/invoices`
- `http://127.0.0.1:4202/invoices?demo=unmigrated-rtl&lang=ar`

لمقارنة الصور الحالية افتح candidate URLs مباشرة. لإعادة تنفيذ العملية كاملة من dashboard في متصفح جديد، حرّر candidate الاختبار أولًا بهذا الأمر المحدد، لأن session الحالية ليست مستعادة في dashboard جديدة ولأن المنفذ مشغول بالـ candidate المثبت:

```sh
curl --fail -X POST \
  -H 'Origin: http://127.0.0.1:4320' \
  'http://127.0.0.1:4318/review/sessions/e452f638-70cd-4a80-a898-9169d8e9d804/cleanup'
```

الأمر يزيل candidate المؤقت الحالي فقط؛ لا يغير fixture original. بعدها:

1. افتح dashboard URL أعلاه واختر `Review One by One` ثم `Start manual review` إذا ظهرت شاشة الاختيار؛ إن ظهر explorer مباشرة فالمسار مختار سابقًا.
2. اختر أول finding في `InvoiceTable.tsx` عند `19:15`. المتوقع After: `<bdi dir="auto">{i.id}</bdi>` والزر enabled، مع 0 sessions قبل النقر.
3. اضغط `Apply & Preview` مرة واحدة وانتظر `Candidate preview is running`.
4. افتح `LTR` ثم `RTL` في toolbar. المتوقع نافذتان خارجيتان تعرضان الفواتير؛ `html.dir` يطابق الوضع، وعناصر invoice IDs داخل `bdi[dir=auto]`. لا توجد embedded comparison مثبتة.
5. سجل النتيجة يدويًا في عمود Ahmed. توقف عند ذلك؛ لا تنفذ القرارات أو validation أو apply إلى original.

لإيقاف جميع خدمات هذه البيئة وتنظيف candidate وfixture المؤقتين، استخدم:

```sh
kill -TERM 90946
```

لإعادة التشغيل لاحقًا من جذر repository:

```sh
npm run rtl:scan:build
node tests/e2e/serve-manual-preview.mjs
# In a second terminal, use the newly printed environment.json path:
RTL_MANUAL_ENVIRONMENT='/actual/new/environment.json' npx playwright test \
  --config=playwright.manual-preview.config.ts \
  tests/e2e/review-one-by-one-analysis.spec.ts \
  tests/e2e/review-one-by-one-preview.spec.ts \
  --output=test-results/manual-preview-verified
```

المسارات والـ PIDs أعلاه مؤقتة بتاريخ التحقق فقط. الملف `environment.json` الجديد هو مصدر هوية كل تشغيل لاحق. outputs داخل `test-results` ignored وقد تُستبدل عند إعادة تشغيل نفس output directory.

## نتيجة Milestone 1E وتسليم المقارنة المضمّنة — 2026-11-16

هذا هو تسليم التشغيل الأحدث، ويحل محل روابط جلسات وخدمات التسليم السابق. تحقق Codex اكتمل؛ تحقق Ahmed اليدوي لم يُعلّم. لا تغييرات في app source الأصلية أو workflow القرارات أو validation أو apply إلى original.

### التنفيذ وحدوده

- `review-session.ts`: مجموعة المنافذ المسموحة `4202–4212`، فحص TCP قبل التشغيل، وحجز داخل العملية لمنع السباق. Vite يعمل بـ `--strictPort`؛ إن خسر الحجز لعملية خارجية يجرب المنفذ التالي. نفاد المجموعة يعطي `CANDIDATE_PORT_POOL_EXHAUSTED` دون قتل العملية المتعارضة.
- نفس session تشارك Promise startup واحدة. reuse يتحقق من child المملوك، ومن `/__rtl_preview_identity` الذي يطابق session وrole وsource hash. فشل الهوية لا يحول عملية غير مرتبطة إلى candidate. cleanup ينتظر startup ويوقف child المسجل لهذه الجلسة فقط.
- `preview-companion.ts`: runtime response وsession response وmapping endpoints تستعمل origin الفعلي؛ session غير معروفة أو finding غير مطابقة لا تعود إلى original بصمت. session قبل startup لا تدعي origin جاهزًا.
- `dashboard-embedded-preview.ts`: يحفظ حالة session والـ patch تحت report/finding identity، ويعيد startup على نفس candidate بعد الفشل، ويستعيد الجلسة داخل التبويب بعد reload. كل إعادة عرض مرتبطة بالاختيار الحالي؛ تغيير finding يزيل الإطارات القديمة.
- إطار Before يعرض original runtime، وإطار After يعرض candidate runtime بعد نجاح startup والتحقق من diff. كلاهما يعرض `/invoices` مع providers/styles/data الفعلية؛ هذه route preview وليست تشغيل component file مستقل.
- `preview-runtime.ts`: يولد `.rtl-preview/vite.config.mts` داخل fixture أو candidate فقط، ويستورد config التطبيق نفسه. Plugin مقصور على `apply: 'serve'`، ويضيف bridge و`Content-Security-Policy: frame-ancestors http://127.0.0.1:4320`. لم تُحذف حماية عامة أو تتغير production Vite configs. dashboard الحالي لا يحمل CSP يمنع الإطارات؛ رد التطبيق المحلي لا يحمل `X-Frame-Options` متعارضًا. fixture بلا authentication.
- dashboard لا يقرأ cross-origin DOM. التطبيق نفسه يرسل evidence عبر `postMessage`؛ الطرفان يتحققان من origin/source ومن nonce/role/session/finding/source path/hash. لا تصبح الحالة Ready بسبب iframe load أو HTTP 200؛ يجب ظهور invoice rows واتجاه صحيح، و`bdi` في candidate فقط. unit tests تختبر رفض الرسائل ذات المصدر/origin/هوية runtime/hash الخاطئة.
- قبل كل تحميل iframe، يمسح wrapper مفتاح `atlas-invoices-v1` في localStorage لبيئة fixture المحلية، لتبدأ المقارنة من نفس seed data؛ browser يثبت تطابق invoice IDs بين الإطارين. تعديلات بيانات تجريبية داخل الإطار ليست جلسة بيانات محفوظة عبر تبديل الاتجاه.
- `LTR/RTL` يغيران الإطارين؛ viewport يدور بين Desktop `1280` وTablet `768` وMobile `390` مع scaling مرئي، وExpand يكبر نفس المقارنة. external links بقيت actions ثانوية.
- حالات الخطأ منفصلة: Companion unavailable؛ original application unavailable؛ candidate startup failed؛ وembedding/bridge غير مؤكد بعد مهلة `12s`. غياب handshake وحده لا يثبت هل السبب frame policy أم غياب bridge، ولذلك تذكر الرسالة الاحتمالين ولا تدعي تشخيصًا غير مثبت.

### قبول المتصفح الفعلي

`embedded-review-preview.spec.ts` أثبت على HTTP fixture:

1. التحليل يعرض `<bdi dir="auto">{i.id}</bdi>` دون candidate عند الدخول.
2. في رحلة dashboard الرئيسية: session واحدة وPOST patch واحد، حتى بعد فشل startup مصنوع `503 SIMULATED_STARTUP_FAILURE` ثم Retry ثم refresh للمعاينة ثم reload.
3. خدمة HTTP مستقلة شغلت `4202` وأعادت `unrelated-port-owner`. استعمل candidate `4203` وبقيت الخدمة سليمة. الاختبار أغلق خدمته المستقلة بنفسه بعد إثبات بقائها؛ Companion لم ينهها.
4. runtime لنفس session أُعيد طلبه بالتزامن مرتين وأعاد origin نفسها. جلستان إضافيتان أنشأهما test harness صراحة لاختبار السباق اشتغلتا على `4204` و`4205`، ثم نُظفتا؛ بقيت الخدمة المستقلة والمعاينة الرئيسية سليمتين.
5. original DOM يحتوي `0` من `.invoice-link bdi`، وcandidate DOM يحتوي `8` عناصر `.invoice-link bdi[dir=auto]`، وكلها تمثل صفوف الفواتير الحقيقية. النص المرئي قد يكون متطابقًا؛ لم تُصنع فروق صور.
6. الاتجاهان، الأحجام الثلاثة، Expand/Collapse، تبديل finding والرجوع، وreload نجحوا. عند اختيار finding أخرى اختفت الإطارات بدل نسبها للاختيار الجديد.
7. اختبار مستقل أعاد HTTP 200 بإطار لا يحتوي تطبيقًا/bridge: لم يدّع dashboard Ready؛ عرض خطأ embedding/bridge بعد المهلة. واختبر original unavailable والتعافي إلى Ready.

الجلسة الرئيسية المثبتة: `76b7f21b-74ba-41ed-98d4-a68cc45c8dff`، origin: `http://127.0.0.1:4203`.

```text
Original before SHA-256:
fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c
Original after SHA-256:
fc53fd82d9334231a1ed6e704b72193af3c9d1f1503d4a240f62c016d3bd6c1c
Candidate SHA-256:
8839c8b52b8a29855f97d0b31bf318b4d591c7ed7c78b4f58daa36491bc4aa03
```

أدلة التشغيل النهائي:

- [المقارنة داخل dashboard](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/embedded-dashboard.png)
- [المقارنة المكبرة RTL](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/embedded-expanded-rtl.png)
- [LTR داخل الإطارين](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/embedded-ltr.png)
- [acceptance.json: session/DOM/hashes/concurrency/requests](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/acceptance.json)
- [network.json](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/network.json)، [console.json](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/console.json)، [trace.zip](../../test-results/embedded-review-final/embedded-review-preview-em-4015a-without-duplicate-mutations/trace.zip)

الأدلة generated وignored تحت `test-results`، ونتائج التنفيذ المختصرة محفوظة في هذه الخطة. إعادة الاختبار بنفس output directory تستبدل outputs؛ لا تستخدمها لتعديل مواد الفيديو التاريخية.

### الفحوص والملفات

| الفحص | النتيجة |
|---|---|
| `npm run rtl:scan:typecheck` | PASS |
| `npm run rtl:scan:build` | PASS |
| `npm run rtl:scan:test` | PASS — 284/284، 22 files |
| `npm run build` | PASS — 3 Nx tasks |
| اختبارات embedded + analysis/retry + secondary external preview | PASS — 5/5 بعد إعادة التنفيذ على fixture جديدة |
| `npm run typecheck` العام | FAIL — نفس أخطاء TS7016 الستة لتعريفات portable-fixture.mjs وphase5-fixture.mjs؛ لا أخطاء جديدة في هذه المهمة |
| memory validator | الروابط المطلوبة سليمة؛ warnings freshness القديمة استشارية |

فشل `phase5-progress` المسجل في المهمة السابقة لم يُحل ولم يُعد تشغيله في هذه المهمة؛ ليس من اختبارات المقارنة المضمّنة. تضمن تثبيت harness استعمال `domcontentloaded` ثم assertions فعلية بعد reload؛ انتظار networkidle مع iframes/Vite لم يكن شرطًا مناسبًا لإثبات readiness.

التغييرات: `review-session.ts`, `preview-companion.ts`, `dashboard-client.ts`؛ الملفان الجديدان `preview-runtime.ts`, `dashboard-embedded-preview.ts`؛ اختبارا `preview-runtime.test.ts`, `embedded-review-preview.spec.ts`؛ تحديث secondary-link locator في `review-one-by-one-preview.spec.ts`؛ wrapper التشغيل في `serve-manual-preview.mjs`؛ هذه الخطة وentry مؤرخة في memory architecture map. تغييرات المستخدم السابقة بقيت محفوظة.

### قبول Ahmed اليدوي والخدمات الحالية

الخدمات متروكة عمدًا: supervisor PID `94040`؛ Companion `94046` على `4318`؛ original fixture Vite `94047` على `4200`؛ HTTP dashboard `94078` على `4320`؛ candidate المثبت PID `94172` على `4203`. نُظفت جلسات race الثانوية وجلسة اختبار external preview؛ لم تُنظف جلسة المقارنة الرئيسية.

Fixture الحالية: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-analyzer-e2e-SmK9fC/project`.

1. افتح `http://127.0.0.1:4320/rtl-report-dashboard.html?finding=RTL.BIDI.ISOLATION%3A741d2ce2aec3a86cf2db37ea`.
2. اختر `Review One by One` ثم `Start manual review` إذا ظهرت شاشة البداية. Before يجب أن يعرض التطبيق داخل dashboard بعد Ready؛ After ينتظر candidate.
3. اختر finding عند `InvoiceTable.tsx:19:15`، وتأكد من الاستبدال في After code، ثم اضغط `Apply & Preview` مرة واحدة. سترى التطبيق الحقيقي داخل After أيضًا. في متصفح جديد قد تُنشأ session جديدة بمنفذ آخر من المجموعة؛ لا حاجة لإزالة runtime السابقة يدويًا بسبب المنفذ المشغول.
4. اضغط `RTL` ثم `LTR`: يتغير الإطاران. اضغط `Desktop` ثم `Tablet` ثم `Mobile` لتغيير العرض المتطابق، و`Expand` ثم `Collapse` للمقارنة المكبرة.
5. اختر finding أخرى: يجب ألا تبقى frames القديمة منسوبة لها. ارجع للمدعومة؛ المعاينة المخزنة في التبويب يعاد استخدامها. Reload في نفس التبويب يجب أن يستعيد session نفسها.
6. اترك خانات Ahmed غير معلّمة حتى يسجل هو النتيجة. لا تبدأ review decisions أو validation أو apply إلى original.

لإيقاف الخدمات وتنظيف fixture وكل candidate مملوكة لهذا Companion:

```sh
kill -TERM 94040
```

هذا الأمر لا يقتل عمليات مستقلة على منافذ المعاينة. لإعادة إنتاج القبول من جذر المشروع بعد إيقاف البيئة الحالية:

```sh
npm run rtl:scan:build
node tests/e2e/serve-manual-preview.mjs
# Use the newly printed environment.json path in a second terminal:
RTL_MANUAL_ENVIRONMENT='/actual/new/environment.json' npx playwright test \
  --config=playwright.manual-preview.config.ts \
  tests/e2e/embedded-review-preview.spec.ts \
  tests/e2e/review-one-by-one-analysis.spec.ts \
  tests/e2e/review-one-by-one-preview.spec.ts \
  --output=test-results/embedded-review-final
```

حدود القبول: fixture والتحويل المدعومان فقط؛ مجموعة منافذ محدودة؛ original runtime يحتاج wrapper التطوير المحلي؛ لا دعم embed عام لمواقع مصادقة أو مشاريع arbitrary؛ الجلسات الحية لا تُستعاد بعد restart للـ Companion؛ غياب handshake يعطي embedding/bridge غير مؤكد ولا يحدد policy بعينها. لا ادعاء بأن المرشح validated أو approved.
