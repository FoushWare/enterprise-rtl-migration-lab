# Phase 3 Stage 3 — Final adjudication

Project/video: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Review date: 12 October 2026. Branch: `feat/phase-3-rtl-scanner`. Approved foundation/HEAD: `406b7cdb66940e9a236093219cf0b21c34bc2861`. Stage 3 remains uncommitted.

## Recommendation: approve with conditions

Approve the conservative, read-only Stage 3 scanner scope subject to the documentation conditions below. This is a reviewer recommendation, not authorization to commit, migrate CSS, approve semantic exceptions or begin Stage 4. The current policy grants no AUTO_CANDIDATE approvals. No application, scanner, policy, report artifact, test or baseline was edited during this review; only this document was added.

The corpus contains 419 extracted facts, 58 report entries: 55 actionable review candidates and three metadata entries. Categories remain 50 MANUAL_REVIEW, five RUNTIME_CONFIG, two INTENTIONAL_LTR, one INFORMATIONAL, zero AUTO_CANDIDATE. The nine prior primary calibration findings are excluded by exact ID below, not by issueBindings: a linked issue ID does not mean a finding was previously adjudicated.

## Method and complete adjudication

Each remaining candidate was checked against its original source/context, the matching rule and ownership policy, and the Phase 2A observations. **28 valid review risks; zero established false positives; 18 requiring further evidence; total 46/46.** “Valid risk” means appropriate for review under the conservative rule contract, not a confirmed defect or safe transformation. “Further evidence” means source evidence is real but the need for remediation is unproven. No measured false-positive rate is asserted: this is an exhaustive source adjudication of the remaining candidate set, with unresolved outcomes, seeded positive calibration and no independent exhaustive visual ground truth/negative population. Zero established false positives must not be presented as perfect precision.

| Exact finding ID | Repository source (line:column) | Original evidence | Adjudication | Basis / next evidence |
| --- | --- | --- | --- | --- |
| `RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea` | `apps/invoicing/src/components/InvoiceTable.tsx:18:15` | `{i.id}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:ee65b3a5436494c134055362` | `apps/invoicing/src/components/InvoiceTable.tsx:41:27` | `{c.name}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:c37e1290384b5b026d3550c4` | `apps/invoicing/src/components/InvoiceTable.tsx:42:26` | `{c.email}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:af648a829cee9b32c0bd2fb8` | `apps/invoicing/src/components/InvoiceTable.tsx:63:38` | `{money(total(i), i.currency)}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:20d0455279e243edca7d306d` | `apps/invoicing/src/pages/CreateInvoice.tsx:110:19` | `{c.name}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:638fd711c50f7608a2a4a274` | `apps/invoicing/src/pages/CreateInvoice.tsx:201:21` | `{money(total({ items }), currency)}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d` | `apps/invoicing/src/pages/CreateInvoice.tsx:228:19` | `{customers.find((c) =&gt; c.id === customer)?.name}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:a5143595873ed7a28d0ed095` | `apps/invoicing/src/pages/Customers.tsx:32:19` | `{c.name}` | Valid risk | RTL-08 documentary evidence supports name punctuation/address-number presentation at this exact sink; manual bidi treatment. |
| `RTL.BIDI.ISOLATION:73a3dbbb333c786c68bc36d6` | `apps/invoicing/src/pages/Customers.tsx:33:18` | `{c.email}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:75fcb34b4ca84b10731b3272` | `apps/invoicing/src/pages/Customers.tsx:51:16` | `{c.email}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:7b475e4aab4a97b7eecd4f1d` | `apps/invoicing/src/pages/Customers.tsx:52:33` | `{c.address}` | Valid risk | RTL-08 documentary evidence supports name punctuation/address-number presentation at this exact sink; manual bidi treatment. |
| `RTL.CSS.PHYSICAL:adebba7d3ad0dda9b7b8d423` | `apps/invoicing/src/pages/Dashboard.tsx:180:23` | `marginLeft: 10` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.ICON.LITERAL:aa0a8bc3f6ca19eae5b56a82` | `apps/invoicing/src/pages/Dashboard.tsx:197:47` | `"View all invoices →"` | Valid risk | Arabic translation retains the same literal right arrow (translations.ts:74); progression semantics require manual decision. |
| `RTL.BIDI.ISOLATION:9f05797020b15bb1031f12fe` | `apps/invoicing/src/pages/InvoiceDetails.tsx:38:17` | `{c.name}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:13dfdcf2817c6da7fa0b7930` | `apps/invoicing/src/pages/InvoiceDetails.tsx:41:15` | `{c.address}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:31882b621bb69ff054bca7a7` | `apps/invoicing/src/pages/InvoiceDetails.tsx:43:15` | `{c.email}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:e7869ece999321c7e9e1d86e` | `apps/invoicing/src/pages/InvoiceDetails.tsx:70:19` | `{money(total(i), i.currency)}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.CSS.PHYSICAL:01b8d7fcb0e0dd788a73af31` | `apps/invoicing/src/pages/Invoices.tsx:56:43` | `marginLeft: "auto"` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.RUNTIME.PAGINATION:c2bdfb11861582e5c386e851` | `apps/invoicing/src/pages/Invoices.tsx:66:11` | `&lt;Pagination             size="small"             getItemAriaLabel={language === "ar" ? (type, number) =&gt; type === "page" ? t("Go to page {page}", { page: number …` | Valid risk | MUI pagination roles depend on theme/runtime direction; avoid additional icon flipping before configuring ownership. |
| `RTL.BIDI.ISOLATION:862b107afb21edf9840ac703` | `apps/procurement/src/App.tsx:68:19` | `{o.id}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:95f0d5216f0155c798f82986` | `apps/procurement/src/App.tsx:84:55` | `{money(total(o))}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:3267dc7e6b7ff0e147b62518` | `apps/procurement/src/App.tsx:105:15` | `{order.id}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.BIDI.ISOLATION:0ae599d0017719ece2087ae9` | `apps/procurement/src/App.tsx:125:19` | `{money(total(order))}` | Further evidence | No explicit local isolation; test actual surrounding runs, punctuation, computed CSS and copy behavior. Standalone IDs/emails/amounts were not shown broken. |
| `RTL.RUNTIME.CACHE:c6803b61cf2818cad26b1416` | `libs/design-system/src/index.tsx:75:5` | `&lt;ThemeProvider theme={theme}&gt;` | Valid risk | Inspected Provider has no owned RTL cache; scoped configuration gap, not proof that every external/provider path is absent. |
| `RTL.FORM.DIRECTION:c3038155faae0e23f50372db` | `libs/design-system/src/index.tsx:85:3` | `&lt;TextField fullWidth {...props} /&gt;` | Valid risk | Shared TextField wrapper depends on unchanged LTR theme/generated styles; compute label/notch/select behavior in consumers. |
| `RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21` | `libs/design-system/src/index.tsx:199:17` | `&lt;TableCell key={c.label}&gt;` | Valid risk | Body cells share generated alignment but contain human text, numeric values and identifiers; requires per-column policy/runtime evidence, not universal right alignment. |
| `RTL.GEOMETRY.EDGE:91f8525674eed0701dd95542` | `libs/design-system/src/index.tsx:215:3` | `left: 0;` | Valid risk | Existing fixed left shell anchor; coordinate gutter, border and mobile motion. Left placement itself is an allowed product decision. |
| `RTL.CSS.PHYSICAL:87c7c8a9a1668b5ed0eb9d9e` | `libs/design-system/src/index.tsx:220:3` | `border-right: 1px solid #e9edf4;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.GEOMETRY.ORDER:0b23a5f6f4bc3966eb9e0efc` | `libs/design-system/src/index.tsx:226:5` | `transform: translateX(-100%);` | Valid risk | Mobile negative X translation depends on the current left anchor; changing side independently breaks drawer motion. |
| `RTL.ICON.PROGRESSION:f4c175932dd9a0c9123c55f5` | `libs/design-system/src/index.tsx:295:11` | `&lt;ArrowForward sx={{ fontSize: 15, marginLeft: "auto" }} /&gt;` | Valid risk | Rendered cross-app progression arrow needs a semantic decision; its companion auto margin is a separate spacing risk. |
| `RTL.CSS.PHYSICAL:a82eeae5e376b962d817b8b2` | `libs/design-system/src/index.tsx:295:45` | `marginLeft: "auto"` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:21623aff840f0d576f06f522` | `libs/design-system/src/styles.css:21:3` | `margin-left: 12px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:ecf95e3ab5ee9d97e51b7b4d` | `libs/design-system/src/styles.css:32:3` | `margin-right: 10px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:190bcc5a6e2552cc91cd610b` | `libs/design-system/src/styles.css:49:3` | `margin-left: auto;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:28c2d60d10633572c611bf0c` | `libs/design-system/src/styles.css:83:3` | `border-left: 3px solid #4c58d6;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:eef2d882a74a3ca1f4724fc2` | `libs/design-system/src/styles.css:84:3` | `padding-left: 11px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:a73f6f180169335db97e8e52` | `libs/design-system/src/styles.css:114:3` | `margin-left: 238px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:0dfdf26ee014cb3b23ca8b7f` | `libs/design-system/src/styles.css:143:3` | `border-left: 1px solid #e7eaf1;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:a750b772938d00bc32351bff` | `libs/design-system/src/styles.css:144:3` | `margin-left: 6px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6` | `libs/design-system/src/styles.css:266:3` | `margin-right: 5px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:82212e990854fbb975d34448` | `libs/design-system/src/styles.css:285:3` | `padding-left: 40px;` | Valid risk | Gutter is tied to fixed SVG axis geometry; review chronology and label correspondence together, not a spacing codemod. |
| `RTL.CSS.PHYSICAL:911c43329429945ea8519fad` | `libs/design-system/src/styles.css:299:3` | `margin-right: 7px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945` | `libs/design-system/src/styles.css:385:3` | `margin-right: 6px;` | Valid risk | Physical spacing/edge exists in rendered composition; approve semantic side and owner first. Presence proves a review risk, not a visual defect. |
| `RTL.CSS.PHYSICAL:d64ac5113f2d40f44c75d315` | `libs/design-system/src/styles.css:502:5` | `margin-left: 0;` | Valid risk | Zero reset is not independently broken; must reset the same side as a future shell gutter at this breakpoint/print mode. |
| `RTL.CSS.PHYSICAL:5f4d415396df52ea51e0a5d6` | `libs/design-system/src/styles.css:561:5` | `margin-left: 0;` | Valid risk | Zero reset is not independently broken; must reset the same side as a future shell gutter at this breakpoint/print mode. |
| `RTL.RUNTIME.LOCALE:9356c0da9bea9ff5056b08b3` | `libs/shared/src/index.ts:118:3` | `new Intl.NumberFormat("en-US", {     style: "currency",     currency,     maximumFractionDigits: 2,   })` | Further evidence | Fixed en-US formatting is the approved Phase 2A contract; future locale requirements need product approval. It does not establish the bidi root cause. |

All IDs above are unique. The nine previously calibrated primary IDs are:

- `RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9`
- `RTL.BRAND.ISLAND:b2139ad57eaf0ae87a66743e`
- `RTL.CHART.LABEL_FLOW:caa8a6652446209dc2fc98cf`
- `RTL.GEOMETRY.COUPLED:cd662af13b746b307885c1c6`
- `RTL.GEOMETRY.EDGE:4a19b0ffbf510d5d3715c64c`
- `RTL.GEOMETRY.EDGE:a9ac460392929e44328f29fe`
- `RTL.ICON.PROGRESSION:07d33024c457dfcdc175bd85`
- `RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4`
- `RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677`

## Ownership and exceptions

The six mechanism defaults in `rtl-scanner.config.json` match actual sources: plain CSS → custom-css; inline → custom-inline; Emotion templates, MUI sx and theme overrides → custom-emotion-review; HTML roots → document-runtime. The custom-emotion-review label deliberately withholds approval for the processing pipeline. Generated MUI rules use mui-generated; that is policy metadata, not an inventory of emitted MUI CSS. No ownerOverrides or semantic approvals exist, and there are no conflicting-owner findings in this corpus. The unresolved `k.icon` sx owner remains visible at Dashboard.tsx:63:23; literal fontSize alone is nonblocking for current directional rules, not proof of its ownership. There is no broad “shared means safe” exception.

Custom CSS/inline logical conversions must have one owner. Custom Emotion/sx styles need a separately reviewed logical-versus-physical processing contract; generated MUI physical styles may need compatible direction-aware cache processing. Theme direction alone is insufficient. Never process already-logical custom styles with an independently assumed flip policy. Current source inspection cannot prove the absence of all external/re-exported caches or a complete cascade.

### Three dynamic-background exceptions

| Exact source | Reviewed expression | Assessment |
| --- | --- | --- |
| apps/invoicing/src/pages/Dashboard.tsx:151:29 | conic-gradient with invoice-status proportions | Angular proportions/color stops, not reading-start/end declarations; donut direction/geometry still requires manual visual semantics. |
| apps/invoicing/src/pages/Dashboard.tsx:171:43 | String(color) | Color comes from local literal status tuples; no background-position input. |
| libs/design-system/src/index.tsx:120:21 | colors[status][0] | Local status dictionary contains literal colors; no directional background input. |

Each matches path, property, expression SHA-256 and the entire source-file SHA-256. The two Dashboard source digests match `7253ee7538e849c08f884147bf4dfb0cd5fe3fa6f91a822b181970186909ed1e`; the design-system source matches `7c2fc659a5eadff7b3b4e93ae895ce8e9fc307110b6577cd8921fd44da7f78ac`. Current scan confirms all three matches. A source/expression change invalidates the nonblocking exception and returns a blocking dynamic-background diagnostic; the source-change fixture tests this. Even unrelated whitespace invalidates a whole-file pin, intentionally conservative but costly to maintain. No general background suppression exists.

Initial HTML English exceptions additionally match rule/path/context/original declaration digest. Changed markup stops matching and returns an unsuppressed entry. **Unmatched/stale policy entries do not produce an explicit stale-policy diagnostic.** Dynamic diagnostics remain visible after matching; exceptions are not deletion filters. The two root exceptions preserve English defaults, not client runtime LTR.

Policy loader limits at `tools/rtl-scanner/src/policy.ts:13`: validation is partial (schema version/arrays and selected required fields), not a complete runtime schema. Ownership values, generatedStyleOwner, role/override shapes, string types, normalized paths and digest formats are not all validated. TypeScript interfaces do not validate JSON. Conflict handling exists at rules.ts:20–22 for directional evidence contexts, not a comprehensive global ownership audit. Current config is coherent and its pins valid; malformed future policy cannot universally be claimed to exit 2. Strict schema, stale-entry reporting and full override validation are prerequisites before relying on policy for automated transformation or CI enforcement.

## Shared attribution: evidence, not inferred universal reachability

The reports correctly retain `applications: []` for library entries: **reachability unresolved by the scanner graph**, not zero affected applications. Do not edit these arrays manually to imply the scanner computes a dependency graph. Existing source supports the following reviewer-level consumer associations:

| Shared component/selector | Existing consumer evidence | Reviewer attribution / limit |
| --- | --- | --- |
| Provider/theme/cache | both apps/src/main.tsx:4,9; LocaleProvider at :11 | Both entry trees render the inspected provider. External/re-exported providers remain outside the scanner's bounded graph. |
| FormField | invoicing/pages/Invoices.tsx:29; procurement/App.tsx:44 | Both use the wrapper; generated field behavior depends on actual props and state. |
| DataTable/body/header | invoicing/components/InvoiceTable.tsx:10, pages/InvoiceDetails.tsx:55; procurement/App.tsx:58,114 | Both render shared table cells; column-level requirements differ. |
| Sidebar, brand, workspace, navigation, .app-main and header divider | invoicing/App.tsx:32; procurement/App.tsx:140; design-system/index.tsx:385 and :348 | Both AppShell paths compose the shared shell. Specific state/breakpoint participation still needs runtime validation. |
| StatusBadge/.status-dot | invoicing/components/InvoiceTable.tsx; procurement/App.tsx:88,110; design-system/index.tsx:115 | Both have status consumers; CSS selector ownership is shared, not proof every page renders it. |
| Modal close edge | invoicing/pages/Customers.tsx:43 and CreateInvoice.tsx:210 | Invoicing consumers found; no procurement Modal consumer established. |
| .kpi-icon, .kpi-note b, .chart-labels, .chart-legend i | invoicing/pages/Dashboard.tsx:63,67,83,87 | Invoicing-specific consumers despite shared stylesheet. Procurement KPIs do not render these icon/chart structures. |
| money locale | imports/calls in both applications; shared/index.ts:117–122 | Both consume formatter; not full arbitrary data-flow coverage of every text sink. |

This evidence improves human triage without upgrading unresolved scanner reachability to computed attribution.

## Proposed bounded pilot — no approval granted

Only these three plain-CSS spacing declarations are proposed. All remain MANUAL_REVIEW and unchanged. They are candidate declarations, not a pilot of fixing the whole associated component.

| Finding ID | Exact source | Proposed equivalent after approval | Prerequisites / risks |
| --- | --- | --- | --- |
| RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945 | libs/design-system/src/styles.css:385:3, .status-dot | margin-right: 6px → margin-inline-end: 6px | Approve dot-before-label reading-order intent in both apps; verify inline flow, gap and all statuses. |
| RTL.CSS.PHYSICAL:911c43329429945ea8519fad | libs/design-system/src/styles.css:299:3, .chart-legend i | margin-right: 7px → margin-inline-end: 7px | Approve legend-marker-to-label gap; inspect inline Arabic/English label flow. Does not authorize any SVG axis/chronology change. |
| RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6 | libs/design-system/src/styles.css:266:3, .kpi-note b | margin-right: 5px → margin-inline-end: 5px | Approve spacing after the leading KPI note; percentage/arrow bidi handling remains a separate manual concern. |

Common prerequisites: explicit named semantic approval; exact declaration/context/value and current file fingerprint; horizontal writing mode and inherited direction verified; custom-css ownership retained; no competing physical/logical declaration or later cascade override; no Emotion reprocessing of these stylesheet rules; browser support and English/mobile/Arabic before-after checks agreed. Preserve six English baselines; investigate any LTR delta rather than updating them. Approval may later allow AUTO_CANDIDATE metadata; it never authorizes applying a codemod itself. Brand margins, shell gutters/resets, chart-label padding, positioning, sx aliases and geometry are excluded from this pilot.

## Treatments that are not safe CSS codemods

- Runtime: document/theme direction, compatible Emotion processing, generated TextField/TableCell/Pagination roles and locale display policy. Portal inheritance already works under the HTML-root direction; do not invent a portal defect.
- Coordinated layout: SidebarFrame anchor/border/238px gutter/mobile transform/print and responsive resets; KPI/title clearance; Modal close placement. Product placement and typography decisions come before property conversion.
- Bidi: 20 bounded text-sink candidates, including confirmation currency, names and addresses. Verify isolated/auto-direction policy, punctuation and copying without reversing or mutating canonical data. Missing isolation is not proof every standalone token fails.
- Manual chart/icon/brand: keep approved chronology independent of label flow; select progression icon semantics rather than mirror every glyph; preserve complete Latin brand composition via an approved direction island. Fixed en-US locale is an intentional Phase 2A display contract pending future product decision.

## Nine-case matrix audit

The matrix in phase-3-detection-review.md is a source association matrix backed by project-specific bindings. It already disclaims independent automatic visual detection and generally accurate limits. It should remain a nine-family reference calibration, not a precision benchmark or nine independent root causes.

| Case | Audit conclusion / evidence boundary |
| --- | --- |
| RTL-01 | Anchor/gutter/mobile motion source associations are valid. Left shell is a product placement choice; no actual drawer overlap or inaccessible right drawer was observed. Zero breakpoint/print margins are coordinated future obligations, not new visual bugs. |
| RTL-02 | Fixed SVG and separate flex labels support risk association; Phase 2A captures establish the chronology disagreement. Static analysis cannot establish corresponding coordinates, time sequence or correct mirroring policy. Chart-label gutter is companion geometry, not an independent chronology diagnosis. |
| RTL-03 | Absolute edge proves placement dependency, not collision. Major observed overlap in Phase 2A remains visual evidence; scanner Minor priority is not a severity downgrade of that observation. |
| RTL-04 | Theme/document mismatch is well supported. Cache absence is scoped, form wrapper is a configuration dependency. Generated notch/helper geometry and provider execution need runtime evidence. |
| RTL-05 | Close edge is correctly linked; title collision comes from Phase 2A visual evidence. HTML-root portals already compute RTL. Scanner Minor source priority and observed Major collision describe different evidence levels. |
| RTL-06 | Header/body sites need column policy; absent align alone is not a defect. Header calibration does not prove every body column fails. Shares theme root with RTL-04/07. |
| RTL-07 | Invoice ArrowForward, sidebar ArrowForward and translated literal arrow exist; Arabic string at translations.ts:74 preserves →. Pagination is runtime-owned. These are distinct treatments, not independent proofs from the same theme finding. |
| RTL-08 | Confirmation currency at CreateInvoice.tsx:228, Customers name :32/address :52 have documentary support. Standalone total :201 and confirmation name :228 are additional candidates, not confirmed reproductions. Fixed locale does not itself cause bidi isolation failure and was intentionally preserved. IDs/emails/date/caret reversal was not demonstrated. |
| RTL-09 | Flex brand children and missing local island support the observed composition reorder. Role is supplied by reviewed config, not automatic recognition; Latin glyph mirroring was not observed. |

Keep Phase 2A observed severities (three Major/six Minor) distinct from scanner priorities (two Major/53 Minor/three Info). Shared theme ID `RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4` appears in three cases; repeated matrix links do not increase finding or independent-cause counts. Missing full data-flow/provider/cascade graphs and content-dependent bidi remain evidence gaps.

## Coverage diagnostics and completeness

All nine diagnostics are visible in canonical JSON and Markdown, with NONBLOCKING_DYNAMIC impact, blocking=false and explicit rationale:

| Source line:column | Diagnostic / remaining limit |
| --- | --- |
| InvoiceTable.tsx:32:30 | Dynamic bgcolor; color expression not evaluated. |
| InvoiceTable.tsx:33:28 | Dynamic color; retained presentation value. |
| Customers.tsx:29:38 | Dynamic bgcolor; retained presentation value. |
| Customers.tsx:29:61 | Dynamic color; retained presentation value. |
| Dashboard.tsx:63:23 | UNRESOLVED_SX_OWNER; entire literal fontSize object non-directional for current catalog. |
| Dashboard.tsx:151:29 | Dynamic background; exact reviewed conic-gradient exception. |
| Dashboard.tsx:171:43 | Dynamic background; exact reviewed local color exception. |
| design-system/index.tsx:120:21 | Dynamic background; exact reviewed status-color exception. |
| design-system/index.tsx:121:16 | Dynamic color; retained presentation value. |

Paths resolve to the application or library source locations used throughout this review. `complete=true` means no blocking failure for the implemented supported catalog on discovered inputs, not exhaustive styling, runtime coverage, full Nx reachability, locale/bidi correctness or screenshot correctness. Unsupported directional values/owner/spreads/interpolations, parser/source failures and unresolved cache/runtime expressions must remain blocking. The unknown font-only owner does not establish an RTL pipeline.

CLI semantics: completed inventory exits 0; optional findings gate exits 1 for actionable entries; incomplete analysis exits 2 before gate evaluation. Current Atlas has no blocking diagnostics. Existing fixture tests cover incomplete analysis/exit precedence. Input/config errors that the loader detects exit 2; do not generalize this to every malformed configuration with the current partial validator. No gate is enabled by this review.

## Verification and protected evidence

Fresh review checks: 60 scanner tests passed; tooling typecheck passed; four original application unit tests passed; all 20 Playwright tests passed in 14.1s, including six unchanged zero-pixel-difference English assertions. No update-snapshots flag or relaxed threshold was used. Test output was directed outside the repository. Lint/application typecheck/build results remain the successful Stage 3 results documented in phase-3-detection-review.md; they were not rerun because this review changes only Markdown.

Two direct JSON scans are byte-identical to each other and the existing findings artifact. Direct scans do not build or write repositories/caches. File inventory/content snapshot verification excludes only the newly requested review document. Six SHA-256 baseline manifest checks pass. All 120 protected application/library/e2e/evidence files compared byte-for-byte with Phase 2A checkpoint `61491d7` have no differences, including all 68 documentary PNGs and their gallery/manifest. Documentary captures are reproducible observations with viewport/language/state metadata, not Playwright regression baselines; this review preserves them rather than recapturing them or claiming pixel equivalence across future browser/font versions.

HEAD remains the approved foundation; no commit/push was made. Original Stage 3 candidate changes remain uncommitted. This review adds no runtime behavior, ownership approval or changed classification.

## Required corrections before commit

1. Treat this exhaustive 46-entry adjudication as part of the Stage 3 review package. Any summary of the nine-case matrix must distinguish the 28 valid review risks and 18 unresolved candidates; do not promote standalone money/name/ID/email cases to confirmed visual failures or claim a zero false-positive rate.
2. Qualify policy-validation/exception claims: only detected malformed configs exit 2; stale entries have no explicit diagnostic; whole-file pins are conservative. Current policy is valid, but it is not backed by a complete runtime schema. These limits must accompany any production-readiness claims.
3. Retain unresolved shared reachability in reports. Consumer evidence above can support human attribution, not synthetic graph certainty. Keep observed visual severity separate from static priority and avoid counting the shared theme root three times.

These are documentation/adjudication conditions, not instructions to change implementation in this review. No rule/config/report edits are required to preserve the current conservative candidate classifications. Any subsequent correction is a separate approved action before committing.

## Deferred enhancements and Stage 4 prerequisites

Before enabling automatic candidate approvals or enforcing CI, implement and review strict data-policy schema validation, digest/path/type checks, invalid/stale/duplicate/conflicting entry diagnostics and negative fixtures. Add bounded import/provider/selector reachability without guessing; investigate arbitrary data-flow/native dates/caret/isolation through CSS, escaped/interpolated styles, chart geometry and generated cache configuration separately. Evaluate precision only against a documented independently adjudicated population, preserving unresolved counts and false-negative limits; no benchmark is invented here.

Stage 4 requires explicit approval of scope, styling ownership and exceptions, pilot semantics, output contracts, human acceptance of bidi/chart/icon/brand/locale policies and a regression plan preserving English and Phase 2A evidence. Scanner development, risk classification, candidate admission and actual transformations remain separate approval checkpoints. No dashboard, codemod, RTL fix or CI gate has begun.
