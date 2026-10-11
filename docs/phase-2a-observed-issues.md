# Phase 2A — observed Unmigrated RTL issues

Phase 2A implements the approved [plan](phase-2a-plan.md) using the existing [audit](rtl-readiness-audit.md). Arabic copy and global document RTL are active only in the query-selected demonstration. The legacy stylesheet, fixed LTR MUI theme, default Emotion setup, existing inline/`sx` style declarations, icons and SVG paths remain unchanged. No RTL remedies or codemods were applied.

**Observation result: nine confirmed visual issues (three Major, six Minor), zero Critical issues observed.** Critical means data loss or a blocked core workflow; Major means misleading data presentation or obscured UI content; Minor means an alignment, branding, navigation convention or token-presentation inconsistency with the approved intended behavior. Severities describe this demonstration, not a supported Arabic release.

Both applications were inspected at **1440×1000** and **390×844**, Chromium **156.0.8078.4**, macOS arm64, browser locale en-US, timezone UTC and light mode. There are **68 documentary captures**, paired Arabic/opt-in-English states, with **zero captured JavaScript page errors**. Full-page captures cover ordinary pages; portal overlays and open mobile navigation use viewport captures to avoid full-page repositioning of fixed elements. Exact URLs, inputs, steps and computed measurements are in the [capture manifest](screenshots/phase-2a/manifest.json); the [gallery](screenshots/phase-2a/index.html) provides full-resolution images. No image is an approved RTL correctness baseline.

## Confirmed issues

### RTL-01 — Navigation remains on the physical left (Minor; manual review)

**Applications / widths:** both applications, desktop shell and mobile open navigation.

**Reproduce:** open `http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar` or `http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar`. At 390×844 click **فتح قائمة التنقل**. On desktop select an existing sidebar route to inspect its active indicator.

**Observed:** desktop sidebar stays at x=0, content still reserves the 238px left gutter, and the active stripe remains on the left of a right-starting navigation row. Mobile navigation opens from and closes toward the left. The approved future convention is navigation on the right reading-start edge. The drawer functions; no overlap from a partially moved sidebar was introduced or observed.

**Root cause / exact source:** fixed `left:0` at [libs/design-system/src/index.tsx:215](../libs/design-system/src/index.tsx#L215), right border at [index.tsx:220](../libs/design-system/src/index.tsx#L220), negative closed transform at [index.tsx:226](../libs/design-system/src/index.tsx#L226), physical content reservation at [libs/design-system/src/styles.css:114](../libs/design-system/src/styles.css#L114), and active edge at [styles.css:83](../libs/design-system/src/styles.css#L83).

**Evidence:** [invoice desktop](screenshots/phase-2a/overview-desktop-ar.png), [procurement desktop](screenshots/phase-2a/orders-desktop-ar.png), [invoice mobile drawer](screenshots/phase-2a/invoicing-navigation-mobile-ar.png), [procurement mobile drawer](screenshots/phase-2a/procurement-navigation-mobile-ar.png); compare [English desktop](screenshots/phase-2a/overview-desktop-en.png) and [English mobile drawer](screenshots/phase-2a/invoicing-navigation-mobile-en.png).

**Future remediation:** coordinate sidebar anchor, reserved content space, boundary/active edges and drawer motion at every breakpoint and print rule. Review geometry as one shell contract before applying bounded spacing transformations.

### RTL-02 — Revenue months disagree with plotted chronology (Major; manual review)

**Application / widths:** invoicing overview, desktop and mobile.

**Reproduce:** open the invoicing Arabic demo root; compare the six month labels beneath the revenue SVG with its rising curve and its accessible May-to-October description.

**Observed:** May/مايو is on the right and October/أكتوبر on the left, while the unchanged curve ends at its high October point on the right. Desktop measured month positions run from May x≈1365 to October x≈744; mobile runs from May x≈333 to October x≈83. This associates the right-hand October endpoint with May. The approved intended chart convention retains May-to-October chronology from physical left to right.

**Root cause / exact source:** the flex month strip inherits RTL at [libs/design-system/src/styles.css:282](../libs/design-system/src/styles.css#L282), including its coupled left gutter at [styles.css:285](../libs/design-system/src/styles.css#L285). Fixed path coordinates remain at [apps/invoicing/src/pages/Dashboard.tsx:114](../apps/invoicing/src/pages/Dashboard.tsx#L114) and [Dashboard.tsx:118](../apps/invoicing/src/pages/Dashboard.tsx#L118), with endpoint at [Dashboard.tsx:123](../apps/invoicing/src/pages/Dashboard.tsx#L123) and translated original-order months at [Dashboard.tsx:133](../apps/invoicing/src/pages/Dashboard.tsx#L133).

**Evidence:** [desktop Arabic](screenshots/phase-2a/overview-desktop-ar.png), [desktop English](screenshots/phase-2a/overview-desktop-en.png), [mobile Arabic](screenshots/phase-2a/overview-mobile-ar.png), [mobile English](screenshots/phase-2a/overview-mobile-en.png), plus the manifest's month and endpoint measurements.

**Future remediation:** explicitly coordinate chart label direction, axis gutter and SVG data positions to preserve the approved chronology. Retain Arabic month text and accessible description; do not mirror SVG text or growth semantics indiscriminately.

### RTL-03 — KPI icons obscure Arabic labels (Major; manual review)

**Application / widths:** invoicing overview, desktop and mobile. Procurement KPIs have no equivalent decorative icon collision.

**Reproduce:** open the Arabic invoicing overview and inspect the first row of KPI labels, particularly total revenue and outstanding amounts; repeat at 390×844.

**Observed:** Arabic labels start at the right, beneath the opaque, physically top-right icon background. Portions of the label are hidden. On desktop the revenue text extends to x=1381 and its icon occupies x=1351–1383 at the same y band; a text-range probe confirmed actual glyph overlap, not merely overlapping full-width label containers. Mobile shows the same obstruction.

**Root cause / exact source:** absolute `right:20px; top:20px` at [libs/design-system/src/styles.css:241](../libs/design-system/src/styles.css#L241) and [styles.css:242](../libs/design-system/src/styles.css#L242), with no corresponding label clearance at [styles.css:249](../libs/design-system/src/styles.css#L249). Icon and text markup are at [apps/invoicing/src/pages/Dashboard.tsx:62](../apps/invoicing/src/pages/Dashboard.tsx#L62) and [Dashboard.tsx:65](../apps/invoicing/src/pages/Dashboard.tsx#L65).

**Evidence:** [desktop Arabic](screenshots/phase-2a/overview-desktop-ar.png), [mobile Arabic](screenshots/phase-2a/overview-mobile-ar.png), [desktop English](screenshots/phase-2a/overview-desktop-en.png).

**Future remediation:** review the decorative icon's reading-end placement and reserve appropriate label space, or adopt a reviewed layout that prevents overlap in either direction. Preserve all KPI calculations and growth icon meaning.

### RTL-04 — Fields retain LTR label, notch, helper and select-icon geometry (Minor; runtime configuration)

**Applications / widths:** invoicing create/settings/search and procurement status filter, desktop and mobile.

**Reproduce:** open `http://127.0.0.1:4200/invoices/new?demo=unmigrated-rtl&lang=ar`; inspect empty labels, focus **الوصف 1**, submit the empty form and open **العميل**. Also open the procurement demo and its **الحالة** menu.

**Observed:** Arabic outlined labels/notches and helper/error text remain on the physical left while form content and surrounding headings follow RTL. Select arrows remain on the right, the reading-start side, next to RTL values. The menu itself inherits RTL and opens successfully; this finding concerns generated component geometry, not portal inheritance.

**Root cause / exact source:** shared field wrapper at [libs/design-system/src/index.tsx:84](../libs/design-system/src/index.tsx#L84), immutable theme direction at [index.tsx:40](../libs/design-system/src/index.tsx#L40), and unchanged Provider at [index.tsx:75](../libs/design-system/src/index.tsx#L75). Actual fields appear at [apps/invoicing/src/pages/CreateInvoice.tsx:97](../apps/invoicing/src/pages/CreateInvoice.tsx#L97) and [apps/procurement/src/App.tsx:46](../apps/procurement/src/App.tsx#L46). Default Emotion processing supplies no RTL transformation. These are the installed MUI-generated styles, not custom left-alignment CSS added to the demo.

**Evidence:** [empty desktop form](screenshots/phase-2a/create-desktop-ar.png), [focused mobile field](screenshots/phase-2a/create-focused-mobile-ar.png), [desktop validation](screenshots/phase-2a/create-validation-desktop-ar.png), [customer menu](screenshots/phase-2a/customer-menu-desktop-ar.png), [procurement mobile menu](screenshots/phase-2a/order-menu-mobile-ar.png); compare [English form](screenshots/phase-2a/create-desktop-en.png).

**Future remediation:** configure document direction, MUI RTL theme and compatible Emotion RTL cache as a coordinated contract, then verify labels, notches, helpers, selects and native inputs. Do not patch vendor files or use isolated left/right overrides to conceal the mismatch.

### RTL-05 — Dialog close button collides with the title (Major; manual review and runtime configuration)

**Application / widths:** invoicing confirmation and customer dialogs, desktop and mobile.

**Reproduce:** on the Arabic create route choose Northstar Studio; enter **ورشة استراتيجية**, quantity **2**, rate **1500**, retain USD and dates **2026-10-11 / 2026-11-10**; click **مراجعة الفاتورة**. Alternatively open the first customer using **عرض العميل** on the Arabic customers route.

**Observed:** the title aligns at reading-start on the right, where the close button is still absolutely positioned. The close glyph overlaps Arabic confirmation text and the end of the Latin customer title. For desktop confirmation, title glyphs occupy x≈895–996 and the close button x=968–1008. Closing still works, but visual title clearance is lost.

**Root cause / exact source:** DialogTitle/close markup at [libs/design-system/src/index.tsx:145](../libs/design-system/src/index.tsx#L145) and physical `right:12` at [index.tsx:150](../libs/design-system/src/index.tsx#L150), with the fixed theme at [index.tsx:40](../libs/design-system/src/index.tsx#L40). Confirmation is instantiated at [apps/invoicing/src/pages/CreateInvoice.tsx:211](../apps/invoicing/src/pages/CreateInvoice.tsx#L211); customer dialog at [apps/invoicing/src/pages/Customers.tsx:44](../apps/invoicing/src/pages/Customers.tsx#L44). Portals correctly inherit `rtl` from the global document; they are not stuck in LTR.

**Evidence:** [desktop confirmation](screenshots/phase-2a/confirmation-desktop-ar.png), [mobile confirmation](screenshots/phase-2a/confirmation-mobile-ar.png), [desktop customer dialog](screenshots/phase-2a/customer-dialog-desktop-ar.png), [mobile customer dialog](screenshots/phase-2a/customer-dialog-mobile-ar.png); compare [English confirmation](screenshots/phase-2a/confirmation-desktop-en.png).

**Future remediation:** establish runtime style ownership first, then choose the close control's reading-end position and reserve title space without double flipping an Emotion rule. Verify both scripts, action spacing and focus order.

### RTL-06 — Arabic table headings remain physically left aligned (Minor; runtime configuration and manual alignment policy)

**Applications / widths:** both applications' lists/details, desktop and mobile.

**Reproduce:** open `http://127.0.0.1:4200/invoices?demo=unmigrated-rtl&lang=ar` and the procurement Arabic root. Inspect header alignment inside cells; at mobile width scroll each table to its opposite horizontal extreme.

**Observed:** the document makes column flow RTL, but Arabic headings remain `text-align:left`. Computed styles confirm left alignment for every header in both lists. Label alignment disagrees with reading-start. This does not imply every amount or identifier needs the same alignment as a label.

**Root cause / exact source:** shared TableCell rendering at [libs/design-system/src/index.tsx:191](../libs/design-system/src/index.tsx#L191) and [index.tsx:199](../libs/design-system/src/index.tsx#L199), fixed theme at [index.tsx:40](../libs/design-system/src/index.tsx#L40), and no per-column alignment contract in DataTable at [index.tsx:175](../libs/design-system/src/index.tsx#L175). Consumers include [apps/invoicing/src/components/InvoiceTable.tsx:15](../apps/invoicing/src/components/InvoiceTable.tsx#L15) and [apps/procurement/src/App.tsx:65](../apps/procurement/src/App.tsx#L65). The physical alignment originates in MUI's generated default.

**Evidence:** [invoice desktop](screenshots/phase-2a/invoices-desktop-ar.png), [order desktop](screenshots/phase-2a/orders-desktop-ar.png), [invoice mobile initial](screenshots/phase-2a/invoices-mobile-ar.png), [invoice mobile opposite edge](screenshots/phase-2a/invoices-scroll-end-mobile-ar.png), [order mobile opposite edge](screenshots/phase-2a/orders-scroll-end-mobile-ar.png).

**Future remediation:** configure the runtime and define reviewed column alignment/content-direction rules for human text, numeric amounts and identifiers. Preserve column arrays/data semantics. Horizontal scrolling itself worked and is recorded separately below.

### RTL-07 — Navigation arrows retain LTR progression (Minor; manual review; pagination also requires runtime configuration)

**Applications / widths:** cross-app link in both sidebars; invoicing recent/list detail actions, view-all link and pagination; desktop and mobile.

**Reproduce:** open the overview, inspect its **عرض جميع الفواتير →** link and recent-row arrows; visit the invoices route and inspect pagination. On mobile open navigation to inspect the cross-app arrow and scroll the invoice table to the action column.

**Observed:** detail and cross-app arrows still point physically right, despite RTL progression. The next-page pagination arrow also retains the LTR role/orientation while its row flows RTL. Page 2 works; this is directional feedback, not reversed business navigation. Growth arrows and the external-link glyph were not treated as navigation-progression failures.

**Root cause / exact source:** cross-app ArrowForward at [libs/design-system/src/index.tsx:295](../libs/design-system/src/index.tsx#L295), row ArrowForward at [apps/invoicing/src/components/InvoiceTable.tsx:76](../apps/invoicing/src/components/InvoiceTable.tsx#L76), literal arrow retained in translated copy at [apps/invoicing/src/pages/Dashboard.tsx:197](../apps/invoicing/src/pages/Dashboard.tsx#L197), and Pagination at [apps/invoicing/src/pages/Invoices.tsx:66](../apps/invoicing/src/pages/Invoices.tsx#L66) consuming the fixed LTR theme.

**Evidence:** [overview desktop](screenshots/phase-2a/overview-desktop-ar.png), [invoice desktop](screenshots/phase-2a/invoices-desktop-ar.png), [mobile pagination](screenshots/phase-2a/invoices-mobile-ar.png), [mobile row actions](screenshots/phase-2a/invoices-scroll-end-mobile-ar.png), [procurement mobile sidebar](screenshots/phase-2a/procurement-navigation-mobile-ar.png).

**Future remediation:** review icon meaning and text-arrow copy; make progression affordances direction aware. Let correctly configured MUI supply pagination icon roles before adding any custom reversal. Keep upward growth and external-link conventions independent.

### RTL-08 — Unisolated opposite-direction content changes token presentation (Minor; manual bidi policy)

**Application / widths:** invoicing confirmation and customer list/dialog, desktop and mobile.

**Reproduce:** open the confirmation using RTL-05's inputs. Compare the amount in the Arabic sentence with the standalone total. Open the Arabic customers page and inspect Evergreen & Co. and Northstar Studio's postal address in its dialog.

**Observed:** the stored/display string `$3,000.00` shows its dollar sign at the right end in the Arabic confirmation sentence, unlike the unchanged en-US standalone total. A text-range probe places `$` at x≈681 while `3` is at x≈609. Evergreen & Co.'s final period appears on the opposite visual side, and the address-leading number 24 appears at the right end of its unisolated Latin address. Complete invoice/order IDs, emails and numeric amounts remained intact in DOM/storage; this is token-boundary/punctuation presentation, not evidence that stored strings reverse.

**Root cause / exact source:** unisolated mixed sentence and amount at [apps/invoicing/src/pages/CreateInvoice.tsx:227](../apps/invoicing/src/pages/CreateInvoice.tsx#L227) and [CreateInvoice.tsx:228](../apps/invoicing/src/pages/CreateInvoice.tsx#L228), en-US money formatting at [libs/shared/src/index.ts:118](../libs/shared/src/index.ts#L118), company names and address rendered directly at [apps/invoicing/src/pages/Customers.tsx:32](../apps/invoicing/src/pages/Customers.tsx#L32) and [Customers.tsx:52](../apps/invoicing/src/pages/Customers.tsx#L52). The data library's address itself remains unchanged at [libs/shared/src/index.ts:37](../libs/shared/src/index.ts#L37).

**Evidence:** [desktop confirmation](screenshots/phase-2a/confirmation-desktop-ar.png), [mobile confirmation](screenshots/phase-2a/confirmation-mobile-ar.png), [Arabic customers](screenshots/phase-2a/customers-desktop-ar.png), [mobile customer dialog](screenshots/phase-2a/customer-dialog-mobile-ar.png), and [English confirmation](screenshots/phase-2a/confirmation-desktop-en.png).

**Future remediation:** establish isolated LTR boundaries around known Latin identifiers, formatted amounts and Latin address/name phrases; use suitable auto-direction for user text. Preserve canonical values, copy behavior and route matching. Review locale formatting separately; do not fix this by reversing strings or inserting arbitrary Unicode controls into stored data.

### RTL-09 — Latin brand composition is reordered (Minor; manual branding policy)

**Applications / widths:** both desktop sidebars and both mobile open-navigation panels.

**Reproduce:** compare the brand on either opt-in English root (`lang=en`) with Arabic (`lang=ar`); at mobile width open navigation.

**Observed:** the boxed symbol moves to the right of the Latin wordmark and the period moves to its left, changing the approved `atlas.` composition. Glyphs are not mirrored. Desktop measurements place the symbol at x=174 and period at x≈103; the Latin word itself remains an LTR run.

**Root cause / exact source:** flex brand row at [libs/design-system/src/styles.css:15](../libs/design-system/src/styles.css#L15), physical margins at [styles.css:21](../libs/design-system/src/styles.css#L21) and [styles.css:32](../libs/design-system/src/styles.css#L32), with inherited document direction affecting the separate children in [libs/design-system/src/index.tsx:250](../libs/design-system/src/index.tsx#L250).

**Evidence:** [Arabic desktop](screenshots/phase-2a/overview-desktop-ar.png), [English desktop](screenshots/phase-2a/overview-desktop-en.png), [Arabic mobile sidebar](screenshots/phase-2a/invoicing-navigation-mobile-ar.png), [English mobile sidebar](screenshots/phase-2a/invoicing-navigation-mobile-en.png).

**Future remediation:** preserve the complete approved brand as an intentional LTR island while adapting its surrounding navigation layout. Do not reverse Latin lettering or translate the wordmark.

## Investigated cases that did not reproduce

| Candidate | Actual investigation / result |
| --- | --- |
| Wrapper-only portal inheritance failure | Both body-mounted customer menus and dialogs were outside `#root` but computed `direction:rtl`. Global HTML direction covers them. The fixed LTR MUI context still causes the separate generated-style limitations above. No wrapper-only mode or portal workaround was added. |
| Sidebar overlap / wrong-side hidden right drawer | Not reproduced: sidebar anchor and gutter stay coordinated on the left, and the left drawer opens/closes. The audit's hypothetical partially migrated right anchor was not implemented. |
| RTL table scroll inaccessible columns / page-wide overflow | Mobile invoice table measured 682px content in a 352px viewport, with scrollLeft moving from 0 to −330; orders measured 513px in 352px, moving from 0 to −161. Opposite-edge captures expose remaining columns. All 68 captures measured document scrollWidth equal to viewport width. These observations do not constitute exhaustive browser/touch coverage. |
| Entire invoice/order IDs or email strings reverse | Existing IDs and emails remain complete in the rendered text and routes. Arabic creation/reload checks preserve the generated ID, canonical status/currency/dates and entered Arabic description in storage. The confirmed bidi finding is punctuation/grouping, not wholesale string reversal. |
| Growth and external-link icons need blanket mirroring | Growth arrows retain their upward meaning; the external-link glyph remains its conventional form. Neither was classified as a broken progression action. |
| Arabic translation breaks business workflows | Nine demo tests pass, including validation, canonical-status filters, page 2, invoice save/reload, settings persistence, language switching without losing form values, and cross-app navigation at both widths. Core calculations and business data were retained. |
| Arbitrary long-copy overflow / Arabic glyph shaping failure | No page-wide overflow or missing Arabic glyphs was observed with the actual translations and system fonts. Cross-platform fonts, long customer content and native calendar/caret interaction remain broader coverage limitations. |

## Changed files and implementation scope

| Files | Change |
| --- | --- |
| `libs/shared/src/i18n.tsx`, `translations.ts`, `demo.css`; export in `libs/shared/src/index.ts` | Typed UI dictionary/context, opt-in query propagation, root lang/dir updates, language selector and Arabic-mode notice. CSS selectors target only the new demonstration controls. The existing shared data/functions are unchanged. |
| `apps/invoicing/src/main.tsx`, `apps/procurement/src/main.tsx` | LocaleProvider inside the existing BrowserRouter and shared Provider. |
| `apps/invoicing/src/App.tsx`, six files in `apps/invoicing/src/pages/`, `components/InvoiceTable.tsx`, `components/InvoiceUi.tsx`; `apps/procurement/src/App.tsx` | Translate visible/accessibility copy, preserve canonical data/keys/comparisons, and carry opt-in query through links and invoice creation navigation. |
| `libs/design-system/src/index.tsx` | Translation plumbing in existing shell, status, modal and empty-table labels; demonstration controls render only when opted in. Existing style declarations and theme remain unchanged. |
| `tests/e2e/demo.spec.ts` | Nine new semantic tests covering opt-in isolation, both viewports/apps, switching/navigation/reload, business persistence, filters/pagination and portal inheritance. |
| `scripts/capture-phase2a.mjs` | Deterministic isolated-context capture and evidence/gallery generation. |
| `docs/phase-2a-observed-issues.md`, `docs/phase-2a-screenshots.md`, `docs/phase-2a-ltr-baselines.sha256`, `docs/screenshots/phase-2a/`; `README.md` | Observations, reproduction commands, hash protection, 68 images, measured manifest, HTML gallery and entry-point documentation. |

No dependencies, lockfile, original test/configuration files or approved LTR baseline images changed. The prerequisite Phase 1/audit/plan checkpoint was committed before implementation. Phase 2A implementation and publication cleanup have been approved for finalization on the dedicated branch.

## Verification, protection and remaining limits

Before implementation, Phase 1 source and audit were already committed at `2fe522fad44bb8f79b3f15190227b8b94b7d9469`; the approved plan was committed at `8700e9c` on main, then work moved to **feat/phase-2a-broken-rtl**. No prior uncommitted source changes were present. No automatic push was performed.

| Actual check | Outcome |
| --- | --- |
| Before implementation: `npm test` | 4/4 passed |
| Before implementation: original English Playwright specification | 11/11 passed, including 6 screenshot comparisons |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run build` | Both applications built successfully; 2/2 Nx tasks succeeded, neither from cache |
| After implementation: `npm test` | 4/4 passed |
| After implementation: original English Playwright specification | 11/11 passed, including all 6 unchanged screenshot comparisons |
| New `tests/e2e/demo.spec.ts` | 9/9 passed |
| Final combined `npm run test:e2e -- --workers=2` with the existing browser cache | 20/20 passed in 12.1s (original 11 + new 9) |
| Capture script | 68 images + manifest + browsable gallery; zero captured JavaScript page errors |
| Six baseline SHA-256 hashes | All unchanged; [hash manifest](phase-2a-ltr-baselines.sha256) |
| Legacy source protection comparison | All existing `sx`/inline style declarations, shared theme, SidebarFrame template and legacy stylesheet unchanged; original English spec, Playwright configuration and dependency lockfile unchanged |

The initial sandboxed pre-implementation browser command could not bind localhost (`EPERM`). Its permitted rerun passed all 11 tests. This environment failure did not indicate an application regression. No failing tests remain in the checks above. Hosted CI has not been run for this branch.

Arabic UI localization intentionally does not translate business records, normalize money/date formats, configure MUI/Emotion RTL, change chart geometry, fix icons or isolate mixed tokens. Numeric business values and ISO storage remain canonical; the existing native date presentation can change visually with document direction/browser settings. Font rendering and the documentary screenshots are tied to this macOS/Chromium environment. Storybook RTL variants, exhaustive keyboard/caret/print behavior, other browsers and a production Arabic release are outside this phase. No Critical issue observed is not a guarantee of exhaustive runtime correctness.

**Known limitation — save-error language persistence (Minor):** a failed invoice save stores an already translated error message in component state at `apps/invoicing/src/pages/CreateInvoice.tsx:73` (state declaration at line 34), then renders it directly at line 204. Switching language after that failure can retain the previous language in the error. This was identified by source review; the failure-and-switch path was not runtime verified and is separate from the nine confirmed visual issues. Future remediation could store an error key and translate it while rendering. Application behavior is intentionally unchanged in this cleanup.

Phase 2A stops here. All remediations above are proposals requiring approval; no codemods, RTL remediation or Phase 3 work has started.
