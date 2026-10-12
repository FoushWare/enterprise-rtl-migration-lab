# Phase 4C.1 — Semantic review of three CSS pilots

Project: Migrating Enterprise React Apps to RTL Without Breaking LTR. Review date: 12 October 2026.

Overall recommendation: **APPROVE WITH CONDITIONS**. Recommend the status and legend spacing for a future pilot; KPI spacing remains conditional. These are reviewer recommendations, not semantic approval records or implementation authority. No transformations were applied or simulated.

## Baseline and inspected evidence

Initial branch: feat/phase-3-rtl-scanner. HEAD: 05138f1c5f68db92bcd94afe11e63fd83322f8cb. Initial working tree and staging were clean. All three declarations, complete stylesheet, selectors, values, media/print rules and consumer sources match that checkpoint. Stylesheet SHA-256: 7f75a3e295d7ffe023d1e5893f8902d16f25937630445039c8000bf3bb889ed1.

Reviewed the Stage 3 final adjudication, Stage 4B validation review, all nine Stage 4A planning documents, canonical findings and rtl-scanner.config.json. Relevant source inspection covers design-system/index.tsx and styles.css, Dashboard, InvoiceTable, InvoiceDetails, both App routing/entry files, shared/i18n.tsx and translations.ts. Prior planning/visual observations are historical evidence; the measurements below are new read-only layout evidence, not proof of a future patch.

## Exact candidates and ownership

All locations below are in libs/design-system/src/styles.css. All original categories remain MANUAL_REVIEW, owner custom-css, scanner confidence High, static severity Minor. Scanner applications:[] remains reachability unresolved; reviewer-known consumers are separately established below.

| Candidate / stable finding ID | Source | Original → proposed | Recommendation |
| --- | --- | --- | --- |
| Status indicator: RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945 | 385:3, .status-dot | margin-right:6px → margin-inline-end:6px | **APPROVE FOR FUTURE PILOT** |
| Revenue legend: RTL.CSS.PHYSICAL:911c43329429945ea8519fad | 299:3, .chart-legend i | margin-right:7px → margin-inline-end:7px | **APPROVE FOR FUTURE PILOT** |
| KPI note: RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6 | 266:3, .kpi-note b | margin-right:5px → margin-inline-end:5px | **CONDITIONAL** |

SOURCE FACT: stylesheet import is design-system/index.tsx:38. These rules are authored plain CSS, not MUI-generated declarations or Emotion templates. Policy ownership.css is custom-css; no owner override exists and approvals is empty. Current application sources contain no CacheProvider, Stylis RTL pipeline, writing-mode override or competing logical margin for these selectors. Emotion processes the Chip host/sx, not these separately imported stylesheet declarations. A later change to stylesheet processing or parent direction islands requires renewed review.

The selectors have specificity (0,1,0), (0,1,1), (0,1,1), respectively, with no important flags. Source search found each selector once and no matching pilot margin override elsewhere in apps/libs. The universal rule sets box-sizing only (styles.css:1–3). Responsive rules at 484–551 change surrounding grids/layout, not these margins. Print rules at 552–577 likewise do not override them. No directional custom properties or margin shorthands compete on these elements. Future replacement must remove the physical property, retain the value/selector/order/specificity and avoid stacking both sides.

## Candidate 1 — Status indicator

SOURCE FACT: StatusBadge's Chip label fragment puts span.status-dot containing ● immediately before label(status), design-system/index.tsx:100–126, especially 115–116. It has no intervening JSX whitespace text. Dot and label are inline content inside the MUI Chip label; the Chip host is flex, but the dot is not a direct flex item. No gap-based spacing separates this pair. The inherited direction controls their inline reading order; the neutral dot participates in its Arabic or English context.

Known consumers: invoicing InvoiceTable.tsx:66, rendered on Dashboard.tsx:199 and Invoices.tsx:59; InvoiceDetails.tsx:34. Procurement App.tsx:88 list and :110 detail. Storybook StatusBadge.stories.tsx is an additional source-known consumer, not browser-verified here. Procurement Pending/Approved/Delivered and invoicing Paid/Pending/Overdue/Draft labels were measured in lists; detail consumers were measured separately.

OBSERVED: inherited ltr/rtl, horizontal-tb, dot display inline, label parent block/nowrap, and Chip host flex/row. Current right margin is 6px in both languages; left margin is zero. Dot-to-label rectangle separation is 6px in English and zero on the Arabic reading-following side across both apps and widths. This is source-supported wrong-side spacing, not a claim of glyph overlap or a Chip geometry fix.

INFERENCE: inline-end expresses the intended gap after the leading status marker, resolving to physical right in English and left in Arabic. Recommend future pilot with High confidence for this bounded relationship. No MUI theme/cache fix is prerequisite for this plain-CSS gap today: document direction already reaches the marker. Future MUI changes may alter host padding/alignment and must be tested independently.

## Candidate 2 — Revenue chart legend

SOURCE FACT: Dashboard.tsx:83–85 renders span.chart-legend with empty i followed immediately by t("Revenue · USD"). Translation is الإيرادات · USD (shared/translations.ts:68). The marker is inline-block, 7×7px and circular (styles.css:293–299). The legend is a flex item in section-title (209–214) but marker/text flow internally as inline content; section-title's justify-content does not provide their internal gap.

Known consumer: invoicing Dashboard only. Procurement has KPI cards but no chart-legend markup. Shared file location does not imply both applications render this selector.

OBSERVED: horizontal-tb; inherited ltr/rtl; marker inline-block; legend blockified as a flex item. Right margin 7px persists in Arabic while inline-end/left is zero. The following text-range bounding rectangle is 7px from the marker in English and directly adjacent on its left in Arabic, at both widths. The Arabic/Latin-unit label is a mixed run; the measured range bounds establish the exterior spacing relationship, not the correctness of every punctuation/glyph run.

INFERENCE: margin-inline-end:7px is suitable for marker-before-label spacing without changing textual content. Recommend future pilot with High confidence for the exterior gap. Do not force the whole label LTR to preserve USD. Unit isolation/punctuation remain separately reviewable.

This selector is independent of chart-wrap svg and chart-labels. It does not authorize changing fixed SVG paths, x coordinates, chronological order, axis-side padding-left:40px at styles.css:285, month array or accessible meaning. Existing RTL-02 label/geometry mismatch remains unresolved by this pilot. A future LTR chart direction island must not accidentally encompass the Arabic legend and defeat its reading-flow contract.

## Candidate 3 — KPI note

SOURCE FACT: Dashboard.tsx:67–72 puts b containing ↗ plus k.note before the comparison phrase. Notes include 12.8%, 8.2%, and translated counts (39,45,51,57). shared/translations.ts:130–131,146 supplies Arabic comparison/count phrases. The bold element is inline, not isolated: no bdi, explicit dir or unicode-bidi rule. Its DOM-leading position alone cannot prove every internal visual token is leading. Procurement KPI markup at App.tsx:22–39 has no kpi-note/b consumer.

OBSERVED: all four invoicing notes in each desktop/mobile language state have horizontal-tb, inherited direction and unicode-bidi:normal. The note parent is block with normal whitespace; the surrounding KPI collection is grid. Current English right gap is 5px; Arabic following phrase's range bounds touch the bold element's left boundary (zero gap). Examples: ↗ 12.8% مقارنة بالشهر السابق and ↗ 4 فواتير هذا الشهر. The bold element remains the leading *outer range* in measured seed layouts, but contains multiple bidi characters/runs; bounding rectangles do not prove correct arrow/number/word ordering.

INFERENCE: logical end probably fixes only exterior bold-to-phrase spacing, with English unchanged. Keep **CONDITIONAL** (Medium semantic confidence) until the product owner explicitly accepts the whole bold fragment as the leading semantic unit and preserves the current growth-arrow orientation. Need glyph/run-level review of percentages, counts, spaces and arrow in Arabic, plus longer/wrapped notes. If that grouping is rejected, moving spacing to an approved wrapper/layout mechanism would be a separate manual patch, outside this proposal. Margin conversion is not bidi isolation or an icon fix, and no full KPI correctness claim is justified.

## Read-only browser method and results

Used existing local apps on ports 4200/4201, installed Chromium with Playwright channel chromium, fresh contexts, en-US/UTC, 1440×1000 and 390×844. Existing port listeners were reused; attempted starts reported ports already in use. Default headless-shell launch was unavailable; switching to the already installed full Chromium succeeded without installing anything. Navigation and evaluation read DOM/computed styles and Range rectangles only. No CSS injection, DOM editing, saving, source simulation or screenshots occurred. Temporary script/results are outside the repository and are not public deliverables.

Twenty route/language/viewport states were measured: invoicing /, /invoices, /invoices/INV-2026-1048 and procurement /, /orders/PO-2026-402; each default English and Arabic ?demo=unmigrated-rtl&lang=ar at both widths. Dot/marker/b precedes its following text node in every inspected DOM. All computed writing modes were horizontal-tb. Computed physical margins and range gaps are reproduced below. Gap means following-text.left minus element.right for LTR, element.left minus following-text.right for RTL; it is an outer-range separation, not ink clearance.

| Route | Width | Selector | Elements measured | Direction | Left / right margin | Following-range gap (px) |
| --- | ---: | --- | ---: | --- | --- | ---: |
| http://127.0.0.1:4200/ | 1440 | .status-dot | 5 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/ | 1440 | .chart-legend i | 1 | ltr | 0px / 7px | 7 |
| http://127.0.0.1:4200/ | 1440 | .kpi-note b | 4 | ltr | 0px / 5px | 5 |
| http://127.0.0.1:4200/invoices | 1440 | .status-dot | 8 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048 | 1440 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/ | 1440 | .status-dot | 9 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402 | 1440 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 5 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 1440 | .chart-legend i | 1 | rtl | 0px / 7px | 0 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 1440 | .kpi-note b | 4 | rtl | 0px / 5px | 0 |
| http://127.0.0.1:4200/invoices?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 8 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4200/invoices/INV-2026-1048?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 1 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 9 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4201/orders/PO-2026-402?demo=unmigrated-rtl&lang=ar | 1440 | .status-dot | 1 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4200/ | 390 | .status-dot | 5 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/ | 390 | .chart-legend i | 1 | ltr | 0px / 7px | 7 |
| http://127.0.0.1:4200/ | 390 | .kpi-note b | 4 | ltr | 0px / 5px | 5 |
| http://127.0.0.1:4200/invoices | 390 | .status-dot | 8 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/invoices/INV-2026-1048 | 390 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/ | 390 | .status-dot | 9 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4201/orders/PO-2026-402 | 390 | .status-dot | 1 | ltr | 0px / 6px | 6 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 5 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 390 | .chart-legend i | 1 | rtl | 0px / 7px | 0 |
| http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar | 390 | .kpi-note b | 4 | rtl | 0px / 5px | 0 |
| http://127.0.0.1:4200/invoices?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 8 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4200/invoices/INV-2026-1048?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 1 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 9 | rtl | 0px / 6px | 0 |
| http://127.0.0.1:4201/orders/PO-2026-402?demo=unmigrated-rtl&lang=ar | 390 | .status-dot | 1 | rtl | 0px / 6px | 0 |
Evidence gaps: no after-conversion behavior was observed or simulated. No vertical writing-mode support is promised. Storybook, print rendering, alternative engines/font environments, 200% text zoom, long/wrapped alternative Arabic labels, every filtered/page state and future RTL cache behavior were not browser-tested. Mobile table status cells can be outside the initial horizontal viewport; layout measurements include those offscreen boxes and are not claimed as scrolled visual screenshot proof. No new screenshots exist. Run-level ink/caret/copy measurements were not collected, especially important for KPI and mixed legend text. These gaps do not invalidate the observed current exterior gap, but limit correctness claims.

## LTR and RTL risks; proposed Phase 4C.2 acceptance

PROPOSED: approve exact per-ID semantics separately from implementation. Under the measured horizontal LTR mode, inline-end maps to the existing physical right side, so equivalent cascade should preserve English pixels; this is an inference requiring after-patch regression, not an already tested result. Direction/writing-mode islands, wrapping, new overrides or a changed styling pipeline invalidate that expectation.

For an explicitly approved future patch:

1. Replace only individually authorized declarations, preserving selector/value/order and removing the old physical margin. No chart, bidi, icon, MUI or runtime changes may be bundled as safe CSS conversion.
2. Verify computed English left=0/right=6,7,5px for the respective approved candidates; Arabic left=6,7,5/right=0px under the agreed inherited RTL contract. In unwrapped fixture pairs, following-range separation must equal the intended value within 0.5 CSS px, with no new overlap. Wrapped text needs line-fragment inspection rather than a union-box assertion.
3. Run unchanged six English visual assertions with zero pixel difference and unchanged hashes, original unit/browser workflows and scanner/tooling checks. Preserve all 68 documentary PNGs and canonical data/translations. New after-evidence must be separate and explicitly approved.
4. Recheck both list/detail status consumers at desktop/mobile and all seeded statuses; inspect visible horizontally scrolled mobile cells. For legend, preserve exact SVG geometry, paths, data/chronology and accessible meaning; separately retain the unresolved RTL-02 status.
5. For KPI, require approved fragment grouping/arrow semantics first, inspect per-character/range bidi order and long/wrapped Arabic notes, preserve text/copy meaning and explicitly exclude bidi isolation from the margin pilot's claimed result.
6. Validate print/cascade, 600/900px boundaries, owner/pins and future cache interactions without broad suppression. Any later runtime/ownership change requires renewed evidence.
7. Settle live before-mode strategy before applying global CSS: shared stylesheet changes would also change the running Unmigrated RTL demonstration. Protected historical screenshots do not freeze live behavior. A separately served before checkpoint or approved scoped-preview design is a human decision, not work performed here.

## Human decisions and final scope audit

Human decisions: approve marker-before-label semantic gaps for named status/legend IDs; decide whether the KPI bold fragment is an accepted leading unit with unchanged ↗ meaning; choose the future before/after mode boundary; explicitly authorize any implementation and any separate semantic records. No recommendation here grants that authority.

Final recommendation **APPROVE WITH CONDITIONS**: two bounded future-pilot recommendations, one conditional candidate, explicit after-change regression and mode-boundary prerequisites. All three categories remain MANUAL_REVIEW and AUTO_CANDIDATE remains zero. No unrelated physical property is endorsed.

Only docs/phase-4c1-semantic-review.md was added. Final tracked diff is empty; scanner implementation/configuration/reports, application/CSS/translations, tests and dependencies are unchanged. Six original English baseline hashes matched the existing manifest; all 68 documentary PNGs matched HEAD byte for byte. All tracked files match HEAD. Policy approvals remains empty. No commit, push, codemod, semantic approval, CSS migration or Phase 4C.2 implementation occurred. Stage 4C.1 ends for human review.
