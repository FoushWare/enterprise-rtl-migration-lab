# Scene03 Architecture Evidence

**Draft – Pending Review** ·2026-10-29 ·Study only. Committed HEAD910133cc332af96268d19fc6563608434b2c321c plus the preserved intentional unmigrated UI patch. Directory names do not substitute for Git state.

## Storyboard corrections

|Storyboard illustration|Verified value used|
|---|---|
|Invoice1250 / Acme Trading / Sent|INV-2026-1048 / Northstar Studio / Pending / USD4800 = $4,800.00|
|Simplified amount/customer business shape|Invoice has customerId and items; total sums quantity×rate; money formats en-US currency|
|Illustrative pnpm commands and test output|Not shown. Repository scripts use npm/Nx; no scanner or Codemod run in this scene|
|Potential app→app architecture arrow|Removed. Both apps import shared libraries; neither imports the other|
|Framework major labels|Installed package versions shown, not just manifest ranges|
|Assumed active RTL configuration|Study uses LTR ThemeProvider; document direction can be RTL; rtlTheme export is unused|

Installed values from each Study node_modules package.json: react 19.3.0, @mui/material 7.3.11, nx 23.3.0, vite 6.4.4, typescript 5.9.3, @emotion/react 11.14.0, @emotion/styled 11.14.1, @emotion/cache 11.14.0, @mui/stylis-plugin-rtl 7.3.10. No packages installed.

## Source-grounded claims

|Claim / relationship|Actual source|
|---|---|
|Invoicing → shared/design-system|[apps/invoicing/src/main.tsx:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/main.tsx:1>) (inspected lines1–18)|
|Procurement → shared/design-system|[apps/procurement/src/main.tsx:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/procurement/src/main.tsx:1>) (inspected lines1–18)|
|App owns invoice collection; Router renders pages|[apps/invoicing/src/App.tsx:18](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/App.tsx:18>) (inspected lines18–70)|
|Procurement Orders/Details use fixtures and shared components|[apps/procurement/src/App.tsx:19](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/procurement/src/App.tsx:19>) (inspected lines19–190)|
|Alias resolution|[tsconfig.json:14](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/tsconfig.json:14>) (inspected lines14–20)|
|Nx Vite plugin infers dev/build tasks|[nx.json:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/nx.json:1>) (inspected lines1–15)|
|Actual script mappings dev/dev:procurement|[package.json:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/package.json:1>) (inspected lines1–25)|
|Design-system → shared locale / Emotion styled / CSS / runtime|[libs/design-system/src/index.tsx:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/index.tsx:1>) (inspected lines1–37)|
|DataTable shared presentation|[libs/design-system/src/index.tsx:166](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/index.tsx:166>) (inspected lines166–194)|
|Theme LTR, exported rtlTheme not selected, Provider uses theme|[libs/design-system/src/runtime.tsx:6](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/runtime.tsx:6>) (inspected lines6–84)|
|Locale opt-in, translator and document direction|[libs/shared/src/i18n.tsx:42](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/i18n.tsx:42>) (inspected lines42–80)|
|Selector calls setLanguage|[libs/shared/src/i18n.tsx:87](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/i18n.tsx:87>) (inspected lines87–105)|
|Shared → locale re-export|[libs/shared/src/index.ts:193](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/index.ts:193>) (inspected lines193–193)|
|Fixture and data helpers|[libs/shared/src/index.ts:95](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/index.ts:95>) (inspected lines95–165)|
|Purchase-order fixtures|[libs/shared/src/index.ts:171](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/shared/src/index.ts:171>) (inspected lines171–191)|
|Invoice ID navigation|[apps/invoicing/src/components/InvoiceTable.tsx:75](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/components/InvoiceTable.tsx:75>) (inspected lines75–85)|
|Details select same collection by route ID|[apps/invoicing/src/pages/InvoiceDetails.tsx:17](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/pages/InvoiceDetails.tsx:17>) (inspected lines17–28)|
|Amount display uses total and money|[apps/invoicing/src/pages/InvoiceDetails.tsx:62](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/apps/invoicing/src/pages/InvoiceDetails.tsx:62>) (inspected lines62–81)|
|Physical CSS remains independent of html.dir|[libs/design-system/src/styles.css:15](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/libs/design-system/src/styles.css:15>) (inspected lines15–27)|
|Scanner CLI imports scan/reports/summary|[tools/rtl-scanner/src/cli.ts:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/tools/rtl-scanner/src/cli.ts:1>) (inspected lines1–13)|
|Codemod mode parsing uses prepare/apply/rollback and provenance checks|[tools/rtl-codemod/cli.mjs:1](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/tools/rtl-codemod/cli.mjs:1>) (inspected lines1–58)|

## Diagram relationship inventory
- Solid arrows: Invoicing→Design System, Invoicing→Shared, Procurement→Design System, Procurement→Shared, Design System→Shared. Verified imports above.
- Tool node is deliberately separate. Dashed relation means source analysis conceptually, not a React import, runtime request, proven scan scope or successful run. CLI modules inspect source; no application imports these tools.
- Existing Nx cache lists5workspace projects with empty workspace dependency arrays; external npm edges exist. No graph regeneration is claimed. Animated map is authored from the import evidence, not passed off as Nx output.
- Provider containment is StrictMode→Provider→BrowserRouter→LocaleProvider→App. Current Provider hardcodes LTR and does not consume the descendant locale. Runtime is not claimed to switch cache/theme automatically.
- LocaleProvider sets html.lang/ar-EG and dir/rtl only for demo=unmigrated-rtl&lang=ar. Source comment at i18n:38 is stale for Study; executable configuration takes precedence.
- Emotion exists through MUI/@emotion/styled. No active explicit RTL CacheProvider/rtlPlugin pipeline in inspected Study libs. Installed RTL packages do not establish that an RTL cache is active.
- Shared data formatting is intentionally en-US; this scene does not label every English-formatted date/amount a bug. Exact visual root causes require separate causal validation.

## Genuine application and source footage
- In-app browser live check2026-10-29: list link INV-2026-1048 clicked, real detail URL and Northstar/Pending/USD4800 verified. evidence/invoice-list-live.png, invoice-details-live.png/.txt. Procurement live list has9orders and total$84,750.00.
- Moving application footage is authentic prior native Brave originals, rechecked against current source/runtime; it is not described as a new screen recording today. Native Invoice_1048_Arrow_Action source48–63s contains the real list→details action.
- New targeted native VS Code window603 recording exists under media/VSCode_Architecture_Original.mov. Its captured picture remains on App.tsx despite AX navigation attempts and the Mac locking; only a stationary App source view is used. No claim that DataTable/Shared/runtime navigation was recorded.
- Shot03-04 uses this actual VS Code App recording. Other code panels are explicitly labeled actual source excerpts, extracted from files with line numbers/hashes; they are editorial graphics, not a mock IDE or claimed VS Code footage. Missing native takes are in the OBS list.
- Presenter is the separately editable Scene01 silhouette style. No realistic identity, synthetic narration, lip-sync or stock-license claim.
- Full-display recording was rejected by automatic approval review due to unrelated-private-content risk. The safer targeted VS Code window recording was allowed. No full display capture or security bypass was performed.

## Verification boundaries
No dependency installation, build, unit/E2E test, scanner run, Codemod, source repair or protected-fixture update in this scene. Historical test output is not shown as fresh or successful. Master append occurs only after scene media decode checks pass.

Additional safety implementation evidence: tools/rtl-codemod/codemod.mjs:191–296 requires a complete fresh scan, approved plain-CSS AUTO_CANDIDATE and exact source/approval digests; it does not create approvals. Scanner source roots are read from metadata in tools/rtl-scanner/src/scan.ts:18 onward. These paths were inspected only, never executed in this task.


Directional component semantics are distinct from document styling: the Runtime narration explicitly requires reviewing icon meaning, not blanket mirroring. InvoiceTable.tsx:75–85 is the actual link/ArrowForward source; the route works. This introduction does not assert that every directional-looking icon is defective. Product narration is explicitly aligned to actual footage: Invoicing20–27.5s, Procurement27.5–35s.
