# Scene03 Architecture Shot List
**Draft – Pending Review.** Preparation only. Proposed narration/timings require review and final alignment to the presenter recording. No Scene03 footage, scanner execution or fixes produced.



## Shot 01 · 0–10s · A cross-cutting business request
1. Open: Start on the actual broken Arabic dashboard, then the Procurement orders page.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `Browser:4200/4201, actual selector`.
3. Run: `No command; compare both real apps.`.
4. Observe: Both apps translate labels, yet share form/table/shell symptoms.
5. Meaning: A shared symptom suggests investigating ownership; this is an investigation strategy, not proof that one line causes every issue.
6. Say: قبل ما نصلّح، لازم نعرف كل جزء مسؤول عن إيه. نفس مشكلة المحاذاة ظهرت في تطبيقين، فهنبدأ من الحاجات المشتركة.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 10s.

## Shot 02 · 10–24s · Nx organizes the workspace
1. Open: Open package.json, nx.json, and both project.json files in actual VS Code.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `package.json; nx.json; apps/*/project.json`.
3. Run: `npm run  # lists existing scripts, without starting tasks`.
4. Observe: dev selects invoicing:dev; dev:procurement selects procurement:dev; @nx/vite/plugin infers dev/build targets.
5. Meaning: Nx coordinates projects/tasks; it is not a production application server or a business backend.
6. Say: ده Nx monorepo: تطبيق للفواتير وتطبيق للمشتريات، ومعاهم مكتبات وأدوات. أوامر التشغيل بتختار المشروع؛ Nx بينظم المهام، مش بيحسب الفواتير.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 14s.

## Shot 03 · 24–36s · Trust imports, not missing graph edges
1. Open: Open tsconfig.json and actual App/main imports. Show the prepared import-grounded diagram.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `tsconfig.json; apps/invoicing/src/App.tsx; apps/procurement/src/App.tsx`.
3. Run: `Read the cached graph receipt; optionally generate a new graph only when filming is approved.`.
4. Observe: Aliases resolve @atlas/design-system and @atlas/shared. Cached graph lists five workspace nodes but no workspace-node edges.
5. Meaning: The hand-authored diagram documents verified imports; it is not presented as Nx-generated output or runtime timing.
6. Say: الـimports بتوضح إن التطبيقين بيستخدموا design-system وshared. لو Nx graph ما أظهرش العلاقة، ده مش معناه إنها مش موجودة. الخريطة دي مبنية على الكود.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 12s.

## Shot 04 · 36–50s · Separate UI ownership from business data
1. Open: Open design-system/index.tsx, then shared/index.ts. Reveal one library at a time.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `libs/design-system/src/index.tsx; libs/shared/src/index.ts`.
3. Run: `No runtime command; use VS Code Go to Definition on AppShell and total.`.
4. Observe: AppShell/FormField/DataTable/Modal are shared presentation; fixtures, money, total, mockApi are shared business helpers.
5. Meaning: A shared component affects both consumers. A presentation change must preserve IDs, statuses and amounts.
6. Say: الـdesign-system مسؤول عن الـShell والحقول والجداول والـDialog. shared فيها البيانات وحساب المجموع واللغة. هنغيّر طريقة العرض بعدين، من غير ما نغيّر معنى البيانات.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 14s.

## Shot 05 · 50–66s · Follow the real React provider tree
1. Open: Open both main.tsx files. Highlight the actual nesting in order.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `apps/invoicing/src/main.tsx; apps/procurement/src/main.tsx`.
3. Run: `No new command; inspect createRoot(...).render(...) at line8.`.
4. Observe: StrictMode → Provider → BrowserRouter → LocaleProvider → App in this Study tree.
5. Meaning: Provider is an ancestor of LocaleProvider, and currently always selects the LTR theme. Do not show the migrated reference provider as active Study code.
6. Say: نقطة البداية main.tsx. الـProvider برّه الـRouter والـLocaleProvider. في نسخة الـStudy دي، الـProvider بيختار LTR theme ثابت؛ وجود rtlTheme لوحده مش معناه إنه مستخدم.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 16s.

## Shot 06 · 66–86s · Trace the actual language change
1. Open: Open i18n.tsx and use the real selector in the browser.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `libs/shared/src/i18n.tsx:42,50,71,87`.
3. Run: `Browser console: ({lang:document.documentElement.lang,dir:document.documentElement.dir,query:location.search})`.
4. Observe: Selector → setLanguage → navigate query → LocaleProvider derives language → translator/useLayoutEffect sets html.lang/dir.
5. Meaning: Arabic requires demo=unmigrated-rtl AND lang=ar. Plain / has no demo selector. This flow does not translate stored business statuses.
6. Say: لما نختار العربي، setLanguage بيغيّر الـquery عن طريق الـRouter. LocaleProvider يختار الترجمة ويضبط lang وdir على المستند. لكن ده مش بيغيّر حالة الفاتورة المخزّنة.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 20s.

## Shot 07 · 86–106s · Language direction is not the styling engine
1. Open: Open runtime.tsx, styles.css, and SidebarFrame; return to the actual misaligned field.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `libs/design-system/src/runtime.tsx:6,78; index.tsx:204; styles.css:114`.
3. Run: `Read code; no DOM style patches or theme changes.`.
4. Observe: ThemeProvider uses theme.direction=ltr; Study has no active CacheProvider/RTL Stylis pipeline. SidebarFrame uses Emotion styled; legacy CSS uses physical margin-left.
5. Meaning: Document direction, MUI direction, Emotion style transformation and explicit component geometry are distinct owners. Evidence supports a mismatch; no repair in this scene.
6. Say: هنا الفرق: المستند RTL، لكن MUI لسه LTR. وفيه Emotion styled وCSS قديم بمسافات ثابتة. تغيير اللغة وحده مش بيوحّد الطبقات دي؛ لازم نفهم مين بيملك كل قرار.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 20s.

## Shot 08 · 106–122s · Follow one real invoice, not a fictional backend
1. Open: Open seedInvoices/listInvoices/App, then the real INV-2026-1048 detail route.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `libs/shared/src/index.ts:95,128,136,155; apps/invoicing/src/App.tsx:18; pages/InvoiceDetails.tsx:17`.
3. Run: `Open /invoices/INV-2026-1048?demo=unmigrated-rtl&lang=ar on4200`.
4. Observe: Fixture fallback → mockApi localStorage read → App state → table/detail → total/money. First invoice: Northstar Studio, Pending, USD4800.
5. Meaning: No network backend is involved in listInvoices. Existing origin-local storage can override fixture data; use an isolated filming context.
6. Say: الفاتورة 1048 جاية من seedInvoices لو مفيش بيانات محفوظة. mockApi يقراها، App يحتفظ بيها، والـTable والـDetails يعرضوها. total يحسب 4800، وmoney ينسّقها؛ العربي ما يغيّرش القيمة.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 16s.

## Shot 09 · 122–132s · Hand off to evidence-based scanning
1. Open: Show tools folder and CLI/report imports briefly, then pause for the next lesson.
2. Files under `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study`: `tools/rtl-scanner/src/cli.ts; tools/rtl-scanner/src/scan.ts`.
3. Run: `Do not execute the Scanner in this scene. Commands will be reviewed interactively next.`.
4. Observe: CLI supports json, markdown, summary; default remains JSON. Tools are not mounted React UI dependencies.
5. Meaning: Static evidence/findings are investigation leads, not automatic proof of a visible bug or safe Codemod approval.
6. Say: دلوقتي عرفنا حدود النظام. في المشهد الجاي هنشغّل الـScanner مع بعض، ونفرّق بين Evidence وFinding وعيب شفناه فعلًا، قبل أي تعديل.
7. Record/animate: genuine VS Code/browser1920×1080,30FPS. Code font≥24px, collapse unrelated panes, highlight only referenced function. Diagram overlays remain separate. Hold on result; cut only after the sentence. Estimated delivery allowance 10s.