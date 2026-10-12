# Stage 4A — Nine-issue migration treatment matrix

Project: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Stage 4A planning only, 12 October 2026. Branch `feat/phase-3-rtl-scanner`, approved HEAD `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`. All treatments are proposals; no approval, code/policy/test change, commit or push is granted by these documents.

## Observation versus proposed acceptance

Original observations/severities come from [Phase 2A observed issues](phase-2a-observed-issues.md), not new Stage 4A screenshots. IDs below are exactly the current report's reviewed issueBindings, not invented matches. Multiple links may share one root; RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4 participates in RTL-04/06/07 and is counted once. Related physical border/brand spacing may lack issueBindings; use the candidate inventory for those companion sources rather than fabricate links.

## RTL-01

**Phase 2A observation:** Sidebar and working mobile drawer stay physically left; active stripe/gutter also left (Minor). No drawer overlap observed.

**Existing scanner associations:**

- `RTL.GEOMETRY.COUPLED:cd662af13b746b307885c1c6` — `libs/design-system/src/index.tsx:214:3`; MANUAL_REVIEW.
- `RTL.GEOMETRY.EDGE:91f8525674eed0701dd95542` — `libs/design-system/src/index.tsx:215:3`; MANUAL_REVIEW.
- `RTL.GEOMETRY.ORDER:0b23a5f6f4bc3966eb9e0efc` — `libs/design-system/src/index.tsx:226:5`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:28c2d60d10633572c611bf0c` — `libs/design-system/src/styles.css:83:3`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:eef2d882a74a3ca1f4724fc2` — `libs/design-system/src/styles.css:84:3`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:a73f6f180169335db97e8e52` — `libs/design-system/src/styles.css:114:3`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:d64ac5113f2d40f44c75d315` — `libs/design-system/src/styles.css:502:5`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:5f4d415396df52ea51e0a5d6` — `libs/design-system/src/styles.css:561:5`; MANUAL_REVIEW.

**Likely implementation owner:** Shared shell CSS + Emotion; both AppShell consumers.

**Proposed treatment:** Approve reading-start target; atomically coordinate anchor, 238px gutter, boundary/active edges, motion, mobile/print resets.

**Required evidence / verification:** Both apps desktop/open mobile and 900px boundary/print; compare paired anchor/gutter.

**English LTR risk:** High if partial anchor/gutter patch; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** English left anchor/gutter/motion unchanged; Arabic target right reading-start, matched reservation and no clipping; keyboard/mobile drawer closes to matching side.

## RTL-02

**Phase 2A observation:** Arabic May on right disagrees with fixed high October endpoint; documented Major chronology mismatch.

**Existing scanner associations:**

- `RTL.CHART.LABEL_FLOW:caa8a6652446209dc2fc98cf` — `apps/invoicing/src/pages/Dashboard.tsx:87:13`; MANUAL_REVIEW.
- `RTL.CSS.PHYSICAL:82212e990854fbb975d34448` — `libs/design-system/src/styles.css:285:3`; MANUAL_REVIEW.

**Likely implementation owner:** Invoicing SVG/HTML label CSS.

**Proposed treatment:** Preserve physical LTR time frame, Arabic label text and original data/accessible description; axis gutter stays tied to coordinates.

**Required evidence / verification:** Measure six month positions against plot and high endpoint at both widths; no dataset reversal.

**English LTR risk:** High if data/SVG mirrored; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** May x < June < … < October; October matches high right endpoint; Arabic glyphs readable, accessible description unchanged in meaning.

## RTL-03

**Phase 2A observation:** Top-right KPI opaque icon overlaps actual Arabic label glyphs; Major; procurement has no equivalent icon collision.

**Existing scanner associations:**

- `RTL.GEOMETRY.EDGE:a9ac460392929e44328f29fe` — `libs/design-system/src/styles.css:241:3`; MANUAL_REVIEW.

**Likely implementation owner:** Invoicing dashboard/plain CSS.

**Proposed treatment:** Manual placement plus reserved label clearance; neutral icon orientation unchanged.

**Required evidence / verification:** Text Range glyph rectangles vs icon rectangle at both widths/long labels; full-box overlap insufficient.

**English LTR risk:** Medium/high for spacing/type/wrapping; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Zero icon/glyph intersection; labels readable; English original card layout preserved.

## RTL-04

**Phase 2A observation:** Fields retain LTR labels/notches/helpers/select geometry under HTML RTL; Minor.

**Existing scanner associations:**

- `RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4` — `libs/design-system/src/index.tsx:40:3`; RUNTIME_CONFIG.
- `RTL.RUNTIME.CACHE:c6803b61cf2818cad26b1416` — `libs/design-system/src/index.tsx:75:5`; RUNTIME_CONFIG.
- `RTL.FORM.DIRECTION:c3038155faae0e23f50372db` — `libs/design-system/src/index.tsx:85:3`; RUNTIME_CONFIG.

**Likely implementation owner:** Shared MUI-generated + theme/cache.

**Proposed treatment:** Synchronize runtime channels after provider topology/ownership approval; avoid vendor CSS patches.

**Required evidence / verification:** Empty/populated/focused/error/select/date forms in both apps; computed dir and notch/icon/label alignment.

**English LTR risk:** High for insertion order/provider remount; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Theme/root/cache agree in migrated mode; no clipped/floating label/helper text; menu direction right; business state preserved switching.

## RTL-05

**Phase 2A observation:** Close icon collides with dialog title; Major; global portal inheritance works.

**Existing scanner associations:**

- `RTL.GEOMETRY.EDGE:4a19b0ffbf510d5d3715c64c` — `libs/design-system/src/index.tsx:150:39`; MANUAL_REVIEW.

**Likely implementation owner:** Shared Modal custom sx plus MUI runtime; invoicing only.

**Proposed treatment:** Inspect plugin result first, then one owner for end-edge close plus title clearance; preserve focus/actions.

**Required evidence / verification:** Customer and confirmation dialogs desktop/mobile; open during switches; title range and close bounds.

**English LTR risk:** High if sx mirrored again after plugin; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Zero close/title glyph overlap, ≥8px proposed clearance; close/Escape/focus-return work; portal correct dir.

## RTL-06

**Phase 2A observation:** Arabic table headings remain left aligned; Minor; body columns have no explicit policy.

**Existing scanner associations:**

- `RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4` — `libs/design-system/src/index.tsx:40:3`; RUNTIME_CONFIG.
- `RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677` — `libs/design-system/src/index.tsx:191:15`; MANUAL_REVIEW.
- `RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21` — `libs/design-system/src/index.tsx:199:17`; MANUAL_REVIEW.

**Likely implementation owner:** Shared TableCell/MUI runtime and column consumer semantics.

**Proposed treatment:** Runtime first; explicit human-text reading-start and reviewed numeric/token alignment policy; no universal right-align.

**Required evidence / verification:** Invoice/order list/detail headers/body, mixed tokens, mobile opposite-edge scroll.

**English LTR risk:** Medium/high for generated alignment; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Header alignment matches approved role; numeric alignment stable per policy; no lost columns or changed sort/data identity.

## RTL-07

**Phase 2A observation:** Custom navigation arrows and Pagination retain LTR progression; Minor.

**Existing scanner associations:**

- `RTL.ICON.PROGRESSION:07d33024c457dfcdc175bd85` — `apps/invoicing/src/components/InvoiceTable.tsx:76:15`; MANUAL_REVIEW.
- `RTL.ICON.LITERAL:aa0a8bc3f6ca19eae5b56a82` — `apps/invoicing/src/pages/Dashboard.tsx:197:47`; MANUAL_REVIEW.
- `RTL.RUNTIME.PAGINATION:c2bdfb11861582e5c386e851` — `apps/invoicing/src/pages/Invoices.tsx:66:11`; RUNTIME_CONFIG.
- `RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4` — `libs/design-system/src/index.tsx:40:3`; RUNTIME_CONFIG.
- `RTL.ICON.PROGRESSION:f4c175932dd9a0c9123c55f5` — `libs/design-system/src/index.tsx:295:11`; MANUAL_REVIEW.

**Likely implementation owner:** Custom icon/copy owners; MUI pagination separately.

**Proposed treatment:** Direction-aware custom progression; preserve growth/external/brand glyphs; use theme-dependent pagination roles.

**Required evidence / verification:** Row/view-all/cross-app link and next/previous page clicks; bilingual URL/state verification.

**English LTR risk:** Medium for meaning/copy and page roles; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Arabic progression has approved orientation, actual route/page transition unchanged; no double mirror; non-navigation glyphs unchanged.

## RTL-08

**Phase 2A observation:** Confirmation dollar sign and name/address punctuation move in surrounding RTL; Minor. DOM/storage IDs/emails/values remain intact.

**Existing scanner associations:**

- `RTL.BIDI.ISOLATION:638fd711c50f7608a2a4a274` — `apps/invoicing/src/pages/CreateInvoice.tsx:201:21`; MANUAL_REVIEW.
- `RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d` — `apps/invoicing/src/pages/CreateInvoice.tsx:228:19`; MANUAL_REVIEW.
- `RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9` — `apps/invoicing/src/pages/CreateInvoice.tsx:228:109`; MANUAL_REVIEW.
- `RTL.BIDI.ISOLATION:a5143595873ed7a28d0ed095` — `apps/invoicing/src/pages/Customers.tsx:32:19`; MANUAL_REVIEW.
- `RTL.BIDI.ISOLATION:7b475e4aab4a97b7eecd4f1d` — `apps/invoicing/src/pages/Customers.tsx:52:33`; MANUAL_REVIEW.
- `RTL.RUNTIME.LOCALE:9356c0da9bea9ff5056b08b3` — `libs/shared/src/index.ts:118:3`; RUNTIME_CONFIG.

**Likely implementation owner:** Content/bidi boundary and display-locale owner.

**Proposed treatment:** Isolate known LTR tokens; auto-direction for unknown human text; locale separate and deferred unless approved.

**Required evidence / verification:** Confirm amount/name/address exact cases; all 18 evidence-plan cases; text ranges/copy/caret/native dates.

**English LTR risk:** High if blanket LTR/locale or Unicode data mutation; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Correct boundary punctuation for documented mixed cases; copied/stored code points/routes/totals unchanged; Arabic names remain Arabic.

## RTL-09

**Phase 2A observation:** Symbol, Latin word and period composition reorder under inherited flex RTL; Minor; glyphs not mirrored.

**Existing scanner associations:**

- `RTL.BRAND.ISLAND:b2139ad57eaf0ae87a66743e` — `libs/design-system/src/index.tsx:250:7`; MANUAL_REVIEW.

**Likely implementation owner:** Shared brand HTML/CSS; both sidebars.

**Proposed treatment:** Approved complete LTR brand island; outer Arabic shell placement separately coordinated.

**Required evidence / verification:** Measure child order and compare desktop/mobile brand in both apps.

**English LTR risk:** Medium if only one child isolated; require unchanged six approved snapshots and original workflows.

**Proposed Arabic acceptance:** Symbol → atlas → period physical order preserved inside island, Latin glyphs unchanged; surrounding nav RTL and same English geometry.

## Acceptance authority and evidence storage

Criteria are reviewer proposals, not new automated baselines. 8px clearance is a proposed explicit acceptance threshold to approve; no such requirement is claimed measured in existing code. Capture future after-state separately from Phase 2A before evidence. Existing historical snapshots/captures stay immutable; new correctness assertions require review. Font/browser sensitivity must be documented. Pure left sidebar placement, missing explicit align or a standalone en-US amount is not itself a newly confirmed failure. Stage 4D may resolve several visible symptoms together; rerun visuals before applying extra component patches.
