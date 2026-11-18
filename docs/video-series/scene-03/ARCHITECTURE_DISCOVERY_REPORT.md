# Scene 03 — Architecture & Discovery

Status: Draft — Pending Review. Discovery only; no Scene 03 recording, editing, fixes, commits or pushes.
Inspection date: 2026-10-27 (client date). Primary evidence: current Study working tree, not directory names or previous CI claims.

## 1. Executive summary

The project is a two-application React/Nx demonstration, with shared presentation/runtime and shared business/locale libraries. It uses fixture data and browser storage, not a production backend. The Study intentionally combines modern tooling with historically unmigrated UI behavior. That distinction must be visible in the educational story.

**Verified:** document Arabic direction and MUI direction disagree in Study. The application still renders, but migrated acceptance gates are not green. Fresh checks: lint/typecheck/scanner build pass; app/shared tests 6 pass and 3 fail; Scanner tests 189 pass and 6 fail; protected-source verification fails; scan is incomplete and Codemod refuses to plan. These are actual results, not successful historical release results.

**Why it matters:** a working demo is not a verified migration. Preserve the reference and existing gates; study the intentional divergence before approving any repair. **Recommended action:** review this report, then approve a narrowly scoped first runtime lesson. Confidence: Verified.

## 2. Verified architecture overview

| Layer | Actual responsibility | Evidence | Importance / recommendation |
| --- | --- | --- | --- |
| Apps | Invoicing owns invoice collection and route pages; Procurement reads order fixtures and filters them | apps/invoicing/src/App.tsx:18; apps/procurement/src/App.tsx:19 | Teach state ownership before RTL. Verified. |
| UI library | Shell, sidebar, header, cards, MUI fields/table/modal and Emotion SidebarFrame | libs/design-system/src/index.tsx:50,110,166,204,385 | Shared changes affect both apps. Verify both consumers. Verified. |
| Runtime | MUI theme/CssBaseline; Study uses only English theme | libs/design-system/src/runtime.tsx:6,78 | Separate document direction from styling engine direction. Verified. |
| Shared | Typed invoices/customers/items, fixtures, totals, money, storage API, locale and translations | libs/shared/src/index.ts:26,95,128,154,193 | Preserve business values while changing presentation. Verified. |
| Tools | Static scanner, explicit report formats, conservative approval-based Codemod | tools/rtl-scanner/src/cli.ts:5; tools/rtl-codemod/cli.mjs:6 | Tools analyze source; they do not certify runtime visuals. Verified. |

React Router supplies BrowserRouter, Routes, Link/NavLink and route parameters. React StrictMode surrounds each root. MUI uses Emotion and legacy CSS also participates; changing only one styling layer cannot resolve every RTL risk. package.json:24–58 lists React 19, MUI 7, Nx 23.3, Vite 6, TypeScript 5.9, Vitest and Playwright declarations; version ranges are not a claim about every installed package.

## 3. Workspace structure and provenance

Absolute Study root: `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`.

| Checkout | Observed HEAD / branch | Interpretation |
| --- | --- | --- |
| Study | 910133cc332af96268d19fc6563608434b2c321c / study/unmigrated-rtl-ui | Primary inspection target; committed migrated reference plus existing local unmigrated UI changes. |
| latest | 6f0d1c6ffe89363fc1e9ab12f195f713dbe96a6d / rtl-migration-study | Name does not mean latest release. Existing nx.json modification and untracked rtl-report.json preserved. |
| original css-migrations-rtl | 8041f4c9c4411adb0247c3061727086c9d0735b7 / feat/phase-3-rtl-scanner | Historical checkout; untracked assets/ and video-assets/ preserved. |

Local tag `v1.0.0-rtl-migrated-reference` peels to 910133cc332af96268d19fc6563608434b2c321c. No remote release freshness assertion: this task did not fetch or query GitHub. Worktree list also contains temporary/prunable historical checkouts; none were removed or switched.

Primary structure: apps/invoicing, apps/procurement; libs/design-system, libs/shared; tools/rtl-scanner, tools/rtl-codemod; tests/e2e, tests/fixtures, root unit tests; scripts/verify-rtl-protections.mjs; docs/study-baseline and historical docs/evidence. New Scene 03 files live only under this directory.

Nx project JSON declares source roots and tags. nx.json:3 uses @nx/vite/plugin to infer build/dev targets; defaultBase is main. Existing local analytics=true was not altered. TypeScript uses root tsconfig.json with @atlas aliases; no tsconfig.base.json exists (an attempted read failed). Tags describe scope; no dependency-boundary enforcement is established by those tags alone.

Existing Study tracked modifications (preserved): both app main.tsx; Invoicing InvoiceTable, CreateInvoice, Customers; design-system index/runtime/styles; shared i18n/translations; nx.json. Existing untracked docs/study-baseline/ and study/ were preserved. These are not changes made by Scene 03.

Historical docs need qualification: docs/architecture.md describes the migrated reference runtime, not the current Study provider. docs/autonomous/STATE.md and ROADMAP.md contain historical delivery state, not today's test results. docs/study-baseline/README.md documents the historical restoration and existing captures. No Architecture Explorer HTML is tracked in the referenced snapshot according to that baseline inventory; no Pages content was imported or updated.

## 4. Application/shared-library dependency map

The following is an **import-grounded text map**, not a generated execution trace:

```text
invoicing/main → design-system Provider + shared LocaleProvider → invoicing/App
invoicing/App → pages → local InvoiceTable / InvoiceUi → design-system + shared
procurement/main → same providers → procurement/App → Orders / Details
Orders / Details → design-system components + shared purchaseOrders / total / money
shared/index → i18n → translations (+ React Router hooks)
design-system/index → runtime + CSS + shared useLocale / business types
runtime (Study) → MUI ThemeProvider / CssBaseline
scanner CLI → scan → parsers / policy / coverage / audit / rules → report serializers
codemod CLI → prepare / apply / rollback → existing scanner report and exact approvals
```

Both apps import both shared libraries. design-system imports shared locale; shared does not import app code. Evidence: app imports; libs/design-system/src/index.tsx imports and :243; libs/shared/src/i18n.tsx:1–4; tsconfig.json aliases. Confidence: Verified. Why: shared blast radius and locale ownership affect migration order. Action: demonstrate actual imports in VS Code.

Actual Nx command discovered five projects: design-system, rtl-scanner, procurement, invoicing, shared. Exported JSON graph has **empty dependency arrays for all five**. Therefore the generated graph does not currently visualize these source dependencies. Do not show invented edges as Nx output. Why graph inference omits them needs separate configuration investigation; no graph configuration was changed. Confidence: Verified output / Hypothesis for its cause.

## 5. Flow A — Startup execution

```text
npm run dev
→ package.json:6 “nx run invoicing:dev”
→ nx.json:3 @nx/vite/plugin (dev target inference)
→ apps/invoicing/vite.config.ts (root, React plugin, alias plugin, strict 127.0.0.1:4200)
→ apps/invoicing/index.html:10 root + :11 /src/main.tsx
→ main.tsx:8 createRoot(...).render
→ StrictMode → Provider → BrowserRouter → LocaleProvider → App
→ AppShell + loaded route page → real browser DOM
```

Procurement is identical in outline, using `npm run dev:procurement`, apps/procurement/vite.config.ts and port 4201. Build outputs are dist/apps/invoicing and dist/apps/procurement. Separate Vite cache directories avoid sharing one optimized-dependency cache.

Current HTTP probes returned 200 for both 127.0.0.1 ports. Existing in-app browser accessibility tree showed the actual Arabic dashboard, 24 invoices and INV-2026-1048 at $4,800.00. No fresh server start was needed or executed; the package-to-target chain is verified statically, not represented as a newly recorded terminal launch. HTML HTTP 200 alone is not proof of all routes/interaction success.

**Reference contrast:** `git show HEAD:libs/design-system/src/runtime.tsx` contains module-lifetime ltrCache(css,[prefixer]) and rtlCache(atlas-rtl,[prefixer,rtlPlugin]), with CacheProvider selection at :107. Reference main puts BrowserRouter/LocaleProvider above Provider. Study puts the LTR-only Provider outside those contexts and removes active RTL cache selection. Confidence: Verified. Recommended demo: compare these exact providers, without checkout/switching or changing files.

## 6. Flow B — Language switching

```text
DemoControls select onChange (i18n.tsx:97–100)
→ context.setLanguage (71–75)
→ URLSearchParams sets demo=unmigrated-rtl and lang=en/ar
→ React Router navigate preserves pathname/hash
→ useLocation → language derived at :45–47
→ translator(language) substitutes dictionary keys / placeholders
→ useLayoutEffect :50–53 sets html.lang and html.dir
→ context consumers rerender labels / links
→ Study Provider remains theme.direction=ltr (runtime.tsx:7,78)
```

There is no separate global language store or backend language call in this flow. Arabic requires **both** query values; `?lang=ar` alone is English. `demoHref` (:59–64) preserves mode/language for normal links; mail/tel/fragment links pass through. DemoControls returns null outside demo mode (:89). To show actual selector switching, start with `/?demo=unmigrated-rtl&lang=en`; plain `/` has no visible selector.

Inputs: current pathname/search/hash and requested language. Outputs: new URL, derived translations, document attributes and rerendered consumers. Business statuses remain canonical English strings; localized labels are presentation only. Existing comment at i18n.tsx:38 mentions migrated support and is stale for this Study working tree; executable code, not that comment, establishes behavior. Confidence: Verified. Action: clarify this distinction verbally; no source/comment edit authorized here.

## 7. Flow C — Invoicing business UI

App owns invoices and loaded state (App.tsx:20–26). `mockApi.listInvoices()` reads origin-scoped `atlas-invoices-v1`; absent storage falls back to 24 seed invoices (shared/index.ts:95,148–164). It is async-shaped, with no fetch/network delay in its implementation. Then App renders route pages.

| Route | Real component and flow | Input/output and purpose |
| --- | --- | --- |
| / | Dashboard, pages/Dashboard.tsx:17 | invoices → KPI balances/status counts, illustrative revenue chart, recent invoice links |
| /invoices | Invoices, pages/Invoices.tsx:14 | collection → status/search filter → slice of eight → InvoiceTable → DataTable |
| /invoices/:id | InvoiceDetails, pages/InvoiceDetails.tsx:17 | useParams ID → in-memory find → customer join + items + total; not-found EmptyState |
| /invoices/new | CreateInvoice, pages/CreateInvoice.tsx:24,58,68 | controlled fields/items → confirmation/save → mockApi.createInvoice → App onCreated prepend → detail navigation |
| /customers | Customers, pages/Customers.tsx:11 | customer fixtures → cards and detail dialog |
| /settings | Settings, pages/Settings.tsx:10 | local form → atlas-settings localStorage on submit (:30–33) |
| unmatched | App.tsx:57 | translated Page not found |

Real example: seed index i=0 produces INV-2026-1048, c1 Northstar Studio, Pending, USD, quantity 1 × rate 4800. `total()` (shared/index.ts:128) returns 4800; `money(4800,"USD")` (:136) uses en-US financial presentation `$4,800.00`. InvoiceTable links the same canonical ID to detail; InvoiceDetails uses the collection already loaded by App, not a second backend fetch. App's onCreated runs only after persistence succeeds. No tax/exchange-rate computation exists in total().

Filtering does not translate stored statuses. Invoices.tsx:19 compares canonical values; :56–60 translates labels; :68 pages the result; :89–91 controls MUI Pagination. Changing search/status resets page to 1. Arrow direction and page meaning must be evaluated separately.

**Invariant:** locale change must not rewrite IDs, customer relationships, quantity/rate, ISO dates, stored statuses, totals, currency or route identity. LocalStorage may override fixtures. Also localhost and 127.0.0.1 are different origins; Sidebar cross-app href uses localhost (:293), so data seen after a hostname change can differ. Verify origin and stored data before filming; do not silently erase user storage. Confidence: Verified code, browser fixture identity confirmed for current dashboard.

## 8. Procurement business UI

App.tsx:149 wires AppShell(procurement) and Routes. `/` renders Orders (:19); status state controls fixture filtering (:65). `/orders/:id` renders Details (:105), matching purchaseOrders by route ID; unknown IDs use EmptyState. `/settings` is informational text, including approval policy copy, not an implemented approval engine.

shared/index.ts:171 creates nine orders, cycling Pending/Approved/Delivered. PO-2026-402 is Papertrail Supplies, quantity 1 × rate 2450. Orders renders shared FormField, DataTable and StatusBadge; details reuse DataTable, money and total. Pending filtering should show 402,399,396 from fixtures. No Procurement create-order flow or custom customer popup is implemented in this App; do not invent a demo for one. Confidence: Verified source; current HTTP availability confirmed, interactive filter not rerun during Scene 03.

## 9. RTL migration risk register

Confidence refers to the stated evidence, not to a blanket claim that a static finding is a bug. Prior runtime evidence is explicitly historical Study capture evidence; no new Scene 03 recording was made.

| Finding | Evidence | Why it matters | Confidence | Recommended action |
| --- | --- | --- | --- | --- |
| Document RTL + active LTR MUI theme; no Study RTL cache | i18n.tsx:50; runtime.tsx:7,78; source comparison to HEAD | Fields, menus, tables and generated spacing have inconsistent direction owners | Verified code; prior Study visual evidence | Start migration teaching at runtime ownership, then verify both locales |
| Sidebar physical left and main margin-left | design-system/index.tsx:204–211; styles.css:114 | Shared desktop geometry fails to follow Arabic reading start | Verified source and existing Study observations | Review coordinated sidebar/gutter/mobile/print rules; no blanket replacement |
| Brand composition inherits bidi/flow | index.tsx:246; styles.css:15 | Latin identity/punctuation should retain deliberate composition | Partially Verified here; prior V4 logo capture available | Inspect English/Arabic close-up before choosing explicit direction island |
| Row-detail ArrowForward is unconditional | InvoiceTable.tsx:80; sidebar index.tsx:298 | Progression direction differs from growth/external icon meaning | Verified source; prior V4 route interaction | Compare same invoice in both locales, preserve href/action |
| Pagination uses LTR MUI runtime | Invoices.tsx:79–91; runtime.tsx:7 | Icon orientation can disagree with Arabic order although next-page data works | Partially Verified; prior V4 next/previous checks | Check semantic page movement and accessible labels, not orientation alone |
| Table heading alignment shared across apps | DataTable index.tsx:166–190; runtime theme | One shared default affects invoices/orders/details | Partially Verified from source + existing Procurement capture | Compare actual cell geometry and numbers in both apps |
| Chart labels inherit flow while SVG geometry is fixed | Dashboard.tsx:127–148; legacy chart CSS | Reversing labels without data geometry changes the apparent chronology | Verified code; existing Study geometry evidence | Preserve chronology/data association; do not blindly mirror SVG |
| KPI icon physical right | styles.css:241; Dashboard KPI markup | Arabic glyphs can overlap the icon | Partially Verified here; existing Study geometry captures | Measure glyph clearance rather than only element boxes |
| Forms/select notch and icons retain LTR generation | shared FormField index.tsx:50; runtime.tsx:7; Procurement App.tsx:49 | Labels, notches and carets require runtime ownership and per-field semantics | Partially Verified; existing captures | Separate natural language, email, numeric and date input policies |
| Dialog close uses physical right | design-system/index.tsx:110,131; Customers.tsx:11 | Arabic title and close glyph may collide; keyboard focus must remain correct | Partially Verified here; prior settled dialog capture | Reproduce settled dialog, check glyph clearance/focus at existing breakpoints |
| Mixed customer/address/email/amount direction | shared/index.ts:35–41; InvoiceDetails.tsx:43–59; Customers markup | Bidi can reorder punctuation/numeric segments without changing business data | Partially Verified; not every text string tested | Use actual token boundaries and isolate intentionally; no global text reversal |
| Shared UI changes can regress English and mobile | both main files; shared DataTable/AppShell; E2E widths | A local fix has two-app and multi-viewport blast radius | Verified architecture; future regressions are Hypothesis | Preserve English baselines and both app acceptance checks |
| Cross-host navigation changes storage origin | index.tsx:293; shared/index.ts:148 | A recording can appear to lose created invoices when hostname changes | Verified browser-origin semantics/source; no data-loss reproduction here | Keep host consistent and disclose fixture/storage state |
| Protected policy source pins no longer match Study | fresh scan + config:121; protection script:14–19 | Fail-closed safety blocks planning and invalidates green-gate claims | Verified current command | Preserve pins; request separate reviewed strategy rather than refresh silently |

## 10. Existing testing and migration capabilities

- Vitest root config runs tests/**/*.test.tsx in jsdom; shared component/persistence tests and runtime-foundation acceptance exist. These assert the migrated runtime, so Study is not expected to satisfy all of them unchanged. Still report every failure.
- Scanner has six test files / 195 tests in this execution; integration/policy/summary assertions depend on the actual repository snapshot. Current 6 failures must not be called scanner-algorithm regressions without isolation against reference.
- Codemod tests and apply were not run; dry-run was executed and refused incomplete coverage. README defines exact declaration approvals, conservative CSS-only support, clean committed checkout, digests and external rollback journal. No AUTO_CANDIDATE currently exists. Do not equate manual findings with approval.
- Scanner actual order: scan.ts:23 walk source roots from project JSON → :74 loadPolicy → :75 read/dispatch CSS/HTML/TS parsers → :97 sort/evidence IDs → :123 classifyDiagnostics → :127 detect without approvals/exceptions for audit anchors → :133 auditPolicy → :143 fail-closed effective policy → :160 final detect → :175 report with complete = no blocking diagnostics. There is an audit detection pass before final detection, not a fabricated linear “rules then applyPolicy” API.
- CSS parser uses PostCSS (css.ts:20,31–32) to walk declarations into facts; model.ts:18 defines Evidence. Rules generate Findings (rules.ts:33), not browser measurements. CLI default remains JSON; summary requires --format summary. JSON/Markdown are serializers over the same Report. --fail-on-findings is opt-in; incomplete reports exit 2.
- Playwright development uses both Vite servers, Chromium by default, viewport 1440×1000, en-US, UTC, light mode and zero screenshot differing pixels. Production uses Vite previews and distinct output/report directories, refuses reuseExistingServer. Seven form/table widths: 390,899,900,901,1100,1101,1440 (forms-dialogs-tables.spec.ts:3).
- Failure traces retain-on-failure and screenshots only-on-failure. tests/fixtures/e2e.ts:39 captures bounded console/page/HTTP/transport errors and navigation/paint snapshots on unexpected failures. Event cap 200 (:49); at most three pages and 1000ms collection bound (:133–190). Timing is observer-relative, not an invented React-ready measurement.
- CI (.github/workflows/ci.yml) runs macos-latest / Node22, npm ci, lint/typechecks/protection, scanner/test/build, Codemod dry-run, app builds/tests and development/production E2E with two workers. Artifacts include both HTML reports and raw result folders; retention seven days. Native date OS region preparation is guarded for disposable GitHub-hosted macOS runners only; do not run it on the local Mac.
- This discovery ran Node24.6.0/npm11.5.1, not CI Node22. Full E2E/app production builds were not run now; no claim of current full acceptance or remote CI success is made.

## 11. Commands executed and actual results

All run from Study unless stated. Temporary outputs under /private/tmp; no report overwrites inside repo. Commands below are observations, not publication steps.

| Command | Actual result |
| --- | --- |
| git status --short; git worktree list --porcelain; git rev-parse HEAD; git branch --show-current | Inspected states above; preserved existing modifications/untracked directories |
| git rev-parse 'v1.0.0-rtl-migrated-reference^{}' | 910133cc332af96268d19fc6563608434b2c321c |
| git show HEAD:libs/design-system/src/runtime.tsx | Read migrated cache/theme selection without switching checkout |
| node --version; npm --version | v24.6.0; 11.5.1 |
| curl both http://127.0.0.1:4200/ and :4201/ | HTTP 200 for each; no restart |
| npm run typecheck | Exit 0 |
| npm run lint | Exit 0 |
| npm run rtl:scan:build | Exit 0; refreshed ignored dist scanner from current unchanged source |
| npm test | Initial sandbox EPERM writing temporary Vite config; supported permission retry ran tests: exit 1, 6 passed / 3 failed |
| npm run rtl:verify:protected | Exit 1: Protected evidence changed: libs/design-system/src/index.tsx |
| npm run rtl:scan -- --format summary | Exit 2: 427 evidence / 58 findings / 10 diagnostics (4 blocking,6 nonblocking), zero AUTO_CANDIDATE, INCOMPLETE; measured scan 0.180s in this run, not a performance guarantee |
| npm run --silent rtl:scan -- --format json > /private/tmp/scene03-report.json | Exit 2, valid report covering 21 files; inspected blocking diagnostics |
| npm run rtl:scan:test | Exit 1: 189 passed / 6 failed of 195 |
| npm run rtl:codemod -- --dry-run | Exit 2: Scanner coverage or policy is incomplete; no patch applied |
| node node_modules/nx/bin/nx.js show projects --json | Initial wrong installed CLI path: MODULE_NOT_FOUND. Corrected to node_modules/.bin/nx, no installation |
| NX_DAEMON=false NX_TUI=false node node_modules/.bin/nx show projects --json | Exit 0, five projects |
| NX_DAEMON=false NX_TUI=false node node_modules/.bin/nx graph --file=/private/tmp/scene03-project-graph.json | Exit 0; real graph JSON, empty dependency arrays |
| cat tsconfig.base.json | No such file; actual root config is tsconfig.json |

App/shared failed tests: runtime-foundation private stable cache creation (no calls), standalone Provider document synchronization (empty dir), source CacheProvider assertion absent. Scanner failed tests: actual-inventory integration, live policy completeness, summary repository counts (expected 440), JSON/default exit contract fixture expectation, redirected/TTY summary expectation, findings-gate expectation. These use migrated live inputs; observed incomplete Study scan explains their expected-vs-actual differences. No test was edited or failure hidden.

Blocking scan details: POLICY_STALE_DYNAMIC_EXCEPTION at rtl-scanner.config.json:121–127 targets modified design-system/index.tsx whole-file pin. Fail-closed policy handling then leaves three DYNAMIC_VALUE diagnostics blocking (Dashboard.tsx:165,:185 and design-system/index.tsx:96). Dashboard itself is not modified in git diff; those diagnostics do not prove three new runtime bugs. Counts: MANUAL_REVIEW 50, RUNTIME_CONFIG 5, INFORMATIONAL 3; Major 2, Minor 53, Info 3. Findings are static risks/classifications, not 58 confirmed UI defects.

Reproduction commands (inspected, not all executed here):

```sh
npm run dev                       # Invoicing, 127.0.0.1:4200
npm run dev:procurement           # Separate terminal, 127.0.0.1:4201
npm run lint
npm run typecheck
npm test
npm run rtl:scan:build
npm run rtl:scan -- --format summary
npm run --silent rtl:scan -- --format json > /tmp/scene03-rtl-report.json
npm run rtl:scan:test
npm run rtl:codemod -- --dry-run   # Refuses incomplete current Study report
# Future validation only; not run by this discovery:
npm run rtl:codemod:test
npm run build
npm run test:e2e -- --workers=2
npm run test:e2e:production -- --workers=2
```

Do not start production previews on occupied dev ports. Full E2E may write fresh test outputs; preserve historical evidence and review the intended environment before executing. No dependency installation was performed.

## 12. Evidence references and line anchors

Paths below are repository-relative to the absolute Study root in §3 and refer to working-tree lines unless HEAD is specified. Historical reference lines are explicitly marked.

| File / anchor | Evidence |
| --- | --- |
| package.json:6–22; nx.json:3–12 | Entry commands and inferred Nx targets |
| apps/invoicing/vite.config.ts:5; apps/procurement/vite.config.ts:5 | App root, aliases, strict ports and output directories |
| tsconfig.json:14–17 | Shared source aliases |
| apps/invoicing/index.html:10–11; apps/invoicing/src/main.tsx:8–17 | HTML-to-React boot and Study provider order |
| apps/procurement/src/main.tsx:8–17 | Same provider hierarchy |
| libs/shared/src/i18n.tsx:42–79,87–103 | Query locale, document attributes, navigation and selector |
| libs/design-system/src/runtime.tsx:6–7,78–84 | Active Study LTR-only theme |
| HEAD:libs/design-system/src/runtime.tsx:88–112 | Migrated cache/plugin/theme selection, read with git show |
| apps/invoicing/src/App.tsx:18–68 | Invoice state/loading and route ownership |
| libs/shared/src/index.ts:95–164,171–190 | Fixtures, amount helpers, persistence and orders |
| apps/invoicing/src/pages/Invoices.tsx:19–25,46–91 | Canonical filtering, reset and pagination |
| apps/invoicing/src/pages/InvoiceDetails.tsx:17–28,62–80 | Route lookup, customer join and totals |
| apps/invoicing/src/pages/CreateInvoice.tsx:58–88 | Item update and persist-before-notify sequence |
| libs/design-system/src/index.tsx:110–131,166–211,246–248,293–298,385–420 | Shared dialog, table, sidebar, cross-app navigation and shell |
| apps/invoicing/src/pages/Dashboard.tsx:127–148 | Fixed SVG curve and month label rendering |
| tools/rtl-scanner/src/scan.ts:19–186; css.ts:20–48; rules.ts:33 | Actual scanner discovery/extraction/audit/detection flow |
| tools/rtl-scanner/src/cli.ts:10–56; model.ts:18–68 | Explicit format/default/gating and report contracts |
| tools/rtl-codemod/codemod.mjs:105–113,198,464–479 | Clean checkout, planning, regeneration and durable journal |
| scripts/verify-rtl-protections.mjs:14–35; rtl-scanner.config.json:121–127 | Exact-source and historical evidence protection; stale pin |
| tests/runtime-foundation.test.tsx:42–75 | Migrated runtime expectations now failing in Study |
| tests/fixtures/e2e.ts:39–220; playwright.config.ts:7–43 | Bounded failure diagnostics and browser configuration |
| .github/workflows/ci.yml:1 | CI sequence, native-date guard, artifact policy (read full file) |

Raw command receipts are in /private/tmp/scene03-{typecheck,lint,unit,protected,scan-build,summary,scanner-tests,codemod,nx,graph}.log, scene03-report.json and scene03-project-graph.json. Temporary receipts are not durable repository artifacts; this report records key results. Existing supporting browser evidence: docs/study-baseline/evidence/observations.json and PNGs; study/demo/videos/fullscreen-v4/V3-to-V4-VERIFIED-COVERAGE.md. These were not rewritten.

## 13. Unknowns and limitations

- No current remote branch/CI/release verification; this is local architecture discovery.
- Current server availability plus Arabic accessibility tree is verified; no fresh exhaustive English/Arabic, mobile, dialog or Procurement interaction run was performed in Scene 03. Prior captured observations are supporting context, not a fresh pass.
- Why Nx emits no dependency edges is unconfirmed; source imports independently establish the map.
- No full E2E, Codemod suite, app build, Storybook startup or cold npm-run-dev lifecycle was run now. Existing dev servers were preserved.
- No claim that scanner output is complete, that Codemod is ready to apply in this dirty Study, or that static risks prove runtime defects.
- LocalStorage may change fixtures. The current browser dashboard has 24 records, but no general guarantee is made about other origins/profiles.
- Runtime performance, all responsive layouts, assistive technology and production hosting require separate tests. Node differs from CI.
- Existing migrated architecture documentation has statements that do not describe Study. Do not “fix” documentation/pins outside the approved scope merely to turn gates green.

## 14. Recommended next technical steps

1. Review the distinction between migrated tag, Study HEAD and Study local diff.
2. Approve a script focused on one concrete journey: INV-2026-1048 → shared table/detail → locale boundary → runtime mismatch.
3. Decide how future Study acceptance should coexist with immutable migrated expectations and pins. No pin update or test rewrite is proposed as an automatic action.
4. Investigate Nx dependency visualization separately if a real connected graph is needed; use source imports for now.
5. Before any migration implementation, capture a clearly scoped current runtime baseline and a business-data invariant inventory, retaining English screenshots and all existing tests.
6. Only after review, authorize Scene 03 recording. No recordings, visual assets or application fixes are produced by this task.

The migration approach is sound as a controlled teaching experiment: preserve the reference, keep tools conservative, identify direction ownership and protect business contracts. The current Study is a **deliberately failing baseline**, not a clean release candidate or proof that all modern tools accept historical UI without policy consequences.

## 15. Proposed visual demonstrations

Use full-screen actual VS Code/browser/terminal, never a simulated IDE or screenshot slideshow. Suggested sequence: workspace/ref identity → real startup chain in source → invoice fixture/state/detail → shared two-app blast radius → actual selector/document versus MUI direction → honest scanner summary and refused Codemod. Nx graph may be shown only with its actual missing-edge limitation, not as a connected dependency map. Arabic/English narration should convey the same facts; labels attached to actual highlighted code/UI, no permanent caption region. Storyboard details are in STORYBOARD_PROPOSAL.md and remain pending approval.
