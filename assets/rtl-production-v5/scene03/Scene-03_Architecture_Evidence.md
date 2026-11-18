# Scene03 Architecture Evidence
**Draft – Pending Review.** Preparation only. Proposed narration/timings require review and final alignment to the presenter recording. No Scene03 footage, scanner execution or fixes produced.


Inspected working tree: `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`; HEAD910133cc + intentional local UI patch. Actual source hashes in source-hashes.json. Git preservation verified in ../verification.json. Historical documentation is context, not a claim that Study gates pass.

|Source / function|Verified responsibility|
|---|---|
|[apps/invoicing/src/main.tsx:8](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/main.tsx:8)|React tree: StrictMode → Provider → BrowserRouter → LocaleProvider → App|
|[apps/procurement/src/main.tsx:8](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/procurement/src/main.tsx:8)|Same provider order, independent React root|
|[libs/design-system/src/runtime.tsx:6](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/runtime.tsx:6)|theme.direction=ltr; Provider:78 always selects theme; rtlTheme export is not selected|
|[libs/shared/src/i18n.tsx:42](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/i18n.tsx:42)|LocaleProvider reads opt-in query; layout effect:50 sets html.lang/dir; setLanguage:71 navigates; DemoControls:87 owns selector|
|[libs/design-system/src/index.tsx:1](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/index.tsx:1)|Imports shared useLocale/DemoControls, Emotion styled:33; exports runtime:36; FormField:50, Modal:110, DataTable:166, SidebarFrame:204, AppShell:385|
|[libs/design-system/src/styles.css:114](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/styles.css:114)|Physical margin-left238 for app-main; .brand and .kpi-icon have separate layout decisions|
|[libs/shared/src/index.ts:95](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/index.ts:95)|seedInvoices24; total:128; money:136 en-US; mockApi.listInvoices:155 reads localStorage; purchaseOrders:171; locale re-export:193|
|[apps/invoicing/src/App.tsx:18](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/App.tsx:18)|Collection owned by App; effect:22 hydrates; routes pass same collection to list/detail|
|[apps/invoicing/src/pages/InvoiceDetails.tsx:17](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/pages/InvoiceDetails.tsx:17)|useParams ID → in-memory find → customerFor → total/money; no second network API|
|[apps/procurement/src/App.tsx:19](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/procurement/src/App.tsx:19)|Orders filters purchaseOrders; Details:105; app routes:149; Settings informational, not approval engine|
|[tools/rtl-scanner/src/cli.ts:5](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/tools/rtl-scanner/src/cli.ts:5)|Imports scanner/report/summary; explicit summary option; default JSON; tooling not mounted into UI|

## Actual runtime receipts
../audit/runtime.json: isolated Chrome156.0.8078.48, html ar-EG/rtl, route states, geometries and screenshots. ../audit/interactions.json: search/no-results,4 invoice Pending rows,3 order Pending rows (runtime receipt), dialogs/focus, Settings and mobile evidence. No scanner findings reinterpreted as bugs.

## Important distinctions
- Runtime Study mismatch is verified. A claim that any individual physical property alone causes all defects would require separate causal testing.
- Emotion is present via @emotion/styled and MUI; absence of the migrated explicit RTL cache pipeline does not mean Emotion is absent.
- No active CacheProvider/rtlPlugin was found in inspected Study libs. The migrated committed reference is different and is not substituted into this lesson.
- The comment in i18n.tsx:38 says migrated support, but it is stale for this Study tree. Executable code establishes the current behavior; no comment/source change was made.
- Existing Nx cache has five workspace nodes and empty workspace edge arrays; many external npm edges exist. Diagram arrows come from source imports, not an invented graph regeneration.
- Business fixture example verified from code and runtime: INV-2026-1048 → c1/Northstar Studio → Pending/USD →1×4800 →$4,800.00. Browser storage overrides seeds; localhost and127.0.0.1 are separate origins.
- No current lint/unit/build/Scanner tests were run in this video-production task. Historical test outcomes are not fresh validation.

## Diagram semantics
architecture-imports.mmd and .svg are conceptual source-import diagrams. provider-tree.mmd describes React containment, not asynchronous execution timing. Dashed scanner box is a planned investigation handoff, not an application import.