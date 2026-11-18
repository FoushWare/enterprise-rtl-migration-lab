# RTL Breaking Inventory

**Draft – Pending Review** · 2026-10-28. Actual Study at 910133cc + preserved local unmigrated changes. Browser: isolated headless Google Chrome 156.0.8078.48, not the user’s Brave session. Both existing Vite processes verified to run from Study/apps; HTTP200. No server restart required. Fresh screenshot/DOM audit in runtime.json and interactions.json. Historical native Brave footage supplies moving video; it is not described as today’s recording.

## Confirmed visible problems

All rows below are CONFIRMED in the running UI. Impact describes presentation, not a confirmed financial/business-data failure. IDs remain in evidence, not primary on-screen labels.

### RTL-01 — Desktop shell / mobile drawer — CONFIRMED
- Application: Both. Impact: High visual navigation impact.
- English baseline: Sidebar at reading start in LTR.
- Broken Arabic: Arabic keeps desktop sidebar and mobile drawer on physical left.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Desktop shell / mobile drawer; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `aside; .app-main; .mobile-menu`. Visual evidence: audit/evidence/invoice-dashboard-en.png, audit/evidence/invoice-dashboard-ar.png.
- Scene02: 014–022s. Label EN: Sidebar stays on the left in Arabic. Label AR: الـSidebar لسه على الشمال.
- SFX: restrained warning at 15.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-02 — Latin logo — CONFIRMED
- Application: Both. Impact: Medium brand composition.
- English baseline: Mark → atlas → period.
- Broken Arabic: Arabic reverses mark placement and moves the period before the Latin name.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Latin logo; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `.brand; .brand-mark; .brand-period`. Visual evidence: audit/evidence/invoice-invoices-en.png, audit/evidence/invoice-invoices-ar.png.
- Scene02: 024–031s. Label EN: Logo flips; the dot moves before the name. Label AR: الـLogo اتقلب؛ النقطة بقت قبل الاسم.
- SFX: restrained warning at 25.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-03 — Dashboard KPI — CONFIRMED
- Application: Invoicing. Impact: Medium readability.
- English baseline: Icon has space beside label.
- Broken Arabic: KPI icon occupies Arabic heading space.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Dashboard KPI; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `.kpi-icon; .kpi-label`. Visual evidence: audit/evidence/invoice-dashboard-en.png, audit/evidence/invoice-dashboard-ar.png.
- Scene02: 031–039s. Label EN: KPI icon overlaps Arabic text. Label AR: أيقونة الـKPI داخلة في النص العربي.
- SFX: restrained warning at 32.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-04 — Revenue chart — CONFIRMED
- Application: Invoicing. Impact: High chart interpretation; not corrupted source data.
- English baseline: May→October labels follow fixed left-to-right plot.
- Broken Arabic: Labels reverse while the SVG path stays unchanged.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Revenue chart; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `.chart-months; SVG path`. Visual evidence: audit/evidence/invoice-dashboard-en.png, audit/evidence/invoice-dashboard-ar.png.
- Scene02: 039–047s. Label EN: Months reverse; the chart path does not. Label AR: الشهور اتعكست؛ خط الرسم زي ما هو.
- SFX: restrained warning at 40.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-05 — Invoice detail arrow — CONFIRMED
- Application: Invoicing. Impact: Medium navigation affordance.
- English baseline: Right arrow opens next/detail in LTR.
- Broken Arabic: Arabic control moves left but still points right; route action works.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Invoice detail arrow; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `a[aria-label*="INV-"]; ArrowForward`. Visual evidence: audit/evidence/invoice-invoices-en.png, audit/evidence/invoice-invoices-ar.png.
- Scene02: 049–056s. Label EN: Detail arrow does not mirror in RTL. Label AR: سهم فتح التفاصيل ما اتعكسش مع الـRTL.
- SFX: restrained warning at 50.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-06 — Pagination — CONFIRMED
- Application: Invoicing. Impact: Medium navigation affordance.
- English baseline: Next points toward later page positions.
- Broken Arabic: Arabic Next remains right-pointing on the left side of page order; data advances correctly.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Pagination; use actual `Language / اللغة` selector → العربية; compare the same control. Open /invoices and use Next, then inspect changed IDs and arrow meaning.
- Actual selectors: `.pagination button`. Visual evidence: audit/evidence/invoice-next-page.png.
- Scene02: 060–067s. Label EN: Next still points right in RTL. Label AR: سهم التالي لسه بيشاور يمين في الـRTL.
- SFX: restrained warning at 61.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-07 — MUI forms, search, select; also Settings — CONFIRMED
- Application: Both. Impact: Medium readability / consistency.
- English baseline: LTR labels/notches on left.
- Broken Arabic: Arabic labels/notches retain left positioning; shared forms repeat symptom.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to MUI forms, search, select; also Settings; use actual `Language / اللغة` selector → العربية; compare the same control. For the create form open /invoices/new; Settings repeats the same field positioning.
- Actual selectors: `.MuiInputLabel-root; .MuiSelect-select; .MuiSelect-icon`. Visual evidence: audit/evidence/invoice-invoices-new-en.png, audit/evidence/invoice-invoices-new-ar.png.
- Scene02: 072–081s. Label EN: Arabic field labels still align left. Label AR: عناوين الحقول العربي لسه على الشمال.
- SFX: restrained warning at 73.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-08 — Customer / invoice-confirmation dialog — CONFIRMED
- Application: Invoicing. Impact: High title readability; Escape still closes.
- English baseline: Close button has clearance from left title.
- Broken Arabic: Arabic title at right occupies same region as physical-right close button.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Customer / invoice-confirmation dialog; use actual `Language / اللغة` selector → العربية; compare the same control. Open Customers → first View customer; wait for dialog transition completion.
- Actual selectors: `[role=dialog] h2; [role=dialog] button`. Visual evidence: audit/evidence/customer-dialog-en.png, audit/evidence/customer-dialog-ar.png.
- Scene02: 085–093s. Label EN: Close button overlaps the dialog title. Label AR: زرار القفل داخل على عنوان الـPopup.
- SFX: restrained warning at 86.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-09 — English address inside Arabic dialog — CONFIRMED
- Application: Invoicing. Impact: Medium interpretation; not a translation defect.
- English baseline: Address begins with 24.
- Broken Arabic: Unisolated RTL paragraph visually places 24 at end; English fixture itself is unchanged.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to English address inside Arabic dialog; use actual `Language / اللغة` selector → العربية; compare the same control. Open Customers → first View customer; wait for dialog transition completion.
- Actual selectors: `[role=dialog] .hint`. Visual evidence: audit/evidence/customer-dialog-en.png, audit/evidence/customer-dialog-ar.png.
- Scene02: 093–101s. Label EN: Stored English address: 24 moves to the end. Label AR: نفس العنوان الإنجليزي؛ رقم 24 بقى في الآخر.
- SFX: restrained warning at 94.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-10 — Shared DataTable / order and invoice tables — CONFIRMED
- Application: Both. Impact: Medium table readability.
- English baseline: English headers left aligned.
- Broken Arabic: Arabic headers remain physically left inside RTL column order.
- Reproduce: open http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en; navigate to Shared DataTable / order and invoice tables; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `th; .MuiTableCell-head`. Visual evidence: audit/evidence/procurement-orders-en.png, audit/evidence/procurement-orders-ar.png.
- Scene02: 115–122s. Label EN: Arabic table headers still align left. Label AR: عناوين الـTable العربي لسه بمحاذاة الشمال.
- SFX: restrained warning at 116.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

### RTL-11 — Status select — CONFIRMED
- Application: Procurement. Impact: Medium; same runtime family as RTL-07, explicit second-app evidence.
- English baseline: English floating label at left.
- Broken Arabic: Arabic status floating label remains on left; canonical Pending filter works.
- Reproduce: open http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=en; navigate to Status select; use actual `Language / اللغة` selector → العربية; compare the same control. 
- Actual selectors: `.MuiInputLabel-root; .MuiSelect-select`. Visual evidence: audit/evidence/procurement-orders-en.png, audit/evidence/procurement-orders-ar.png.
- Scene02: 122–129s. Label EN: Status filter label still aligns left. Label AR: عنوان فلتر الحالة لسه على الشمال.
- SFX: restrained warning at 123.667s, synchronized to the animated border/label entrance.
- Editable border/label/source coordinates: scene02/timeline.json; original V4 layer paths retained.

## Functional checks and other classifications
- NOT REPRODUCIBLE in inspected states: broken Pending filtering (4 invoices / 3 orders), broken detail routing, page advancement, search/empty state, settings save, dialog Escape and focus trap, whole-document horizontal overflow at 390/899/900/1920. These passing checks do not certify every accessibility requirement.
- SUSPECTED: compact start-icon/text clearance in some Arabic buttons; no separate proven overlap measurement. Not added as a confirmed defect. Cross-app directional arrow semantics depend on intended navigation convention; not presented as a reproduced breakage.
- STATIC FINDING: physical left/right declarations and fixed LTR runtime are source evidence of risk, not extra confirmed defects. No fresh scanner run or claimed scan count in this task.
- Two console resource404 messages occurred in the route audit; no page exception was observed. The route audit did not record their response URLs, so their identity is unknown; do not call them application failures. Supplemental interaction responses are in interactions.json.

## Coverage and limits
- Both locales: Invoicing Dashboard, Invoices, INV-2026-1048 details, Create, Customers, Settings and fallback. Procurement overview/orders, PO-2026-402 details, Settings and fallback.
- Real selector switches in both apps; invoice Pending filter, search/no-results, pagination and detail action; Procurement Pending filter; invalid form validation and valid review dialog (no invoice persisted), Settings local save in disposable context, customer search/dialog and Escape; keyboard Tab remains inside review dialog.
- Arabic responsive overview at 390,899,900; mobile drawers opened and closed at390 in both apps. LTR mobile comparison, every viewport/OS/native date picker, print, every fixture/detail record, complete keyboard traversal/screen-reader audit, popup positioning on every device and long user-entered text remain untested. No exhaustive accessibility or visual guarantee.
- No Procurement create-order form/custom business popup exists in its route implementation. Header notifications are a browser alert; profile/workspace/chart ellipses are display elements without separate implemented flows. No invented flows or tooltip bugs.
- No whole-page overflow observed; intentionally horizontally scrollable tables are not automatically defects. USD/en-US money and ISO fixture dates are not called wrong solely because locale is Arabic. Customer names/addresses are fictional fixtures.
- Diagram arrows/breadcrumb slash inspected as display; no additional verified semantic defect. Card punctuation reversal belongs to mixed-direction text family and is not inflated into a separate root issue.
- Audit captured settled finite MUI animations before screenshots. An initial script attempted a scrim click under the drawer and was corrected to a visible outside point; this was an audit locator mistake, not an app defect.

## Reuse decision
Reuse V4 raw sources and verified geometry for all eleven shown problems, with shorter English/context holds and a134s scene. Group cross-app form/table symptoms while retaining explicit Procurement examples. Scene01 teaser uses only brief previews; Scene02 supplies actual explanation and verified navigation semantics.