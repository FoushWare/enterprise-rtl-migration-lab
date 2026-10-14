# Conservative RTL risk report

Static risks and documented exceptions, not automatic proof of visual failures.

Schema: 2; files: 20; extracted facts: 419; findings: 58; diagnostics: 9; complete: true.

- INFORMATIONAL: 1
- INTENTIONAL_LTR: 2
- MANUAL_REVIEW: 50
- RUNTIME_CONFIG: 5

## Findings

### RTL.DOCUMENT.INITIAL:3321a4fa4f1dd561e3b7fee5

**Initial HTML direction** — INTENTIONAL_LTR; Info; High confidence.

Source: apps/invoicing/index.html:2:17; mechanism: html-root; application attribution: invoicing; context: html; owner: document-runtime.

Original: dir="ltr"

Rationale: Initial HTML direction is a source fact, not the client runtime direction.

Treatment: Preserve approved default English markup; evaluate runtime direction separately.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 2d593e36727e04e8885441bf45fd5a780219a8886d19b36e8fbebca23cac5f20; related locations: none.

Exception: Phase 2A preserves the approved default English LTR entry markup; opt-in runtime direction is reviewed separately.; original category: INFORMATIONAL.

### RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/components/InvoiceTable.tsx:18:15; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceTable; owner: manual-content.

Original: {i.id}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:ee65b3a5436494c134055362

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/components/InvoiceTable.tsx:41:27; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceTable; owner: manual-content.

Original: {c.name}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:c37e1290384b5b026d3550c4

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/components/InvoiceTable.tsx:42:26; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceTable; owner: manual-content.

Original: {c.email}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:af648a829cee9b32c0bd2fb8

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/components/InvoiceTable.tsx:63:38; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceTable; owner: manual-content.

Original: {money(total(i), i.currency)}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.ICON.PROGRESSION:07d33024c457dfcdc175bd85

**Directional icon requires semantic review** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/components/InvoiceTable.tsx:76:15; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceTable/ArrowForward; owner: custom-icon.

Original: &lt;ArrowForward sx={{ fontSize: 15, color: "#9aa2b3" }} /&gt;

Rationale: Imported directional icon renders in JSX; navigation meaning and appropriate orientation need review.

Treatment: Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-07; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:20d0455279e243edca7d306d

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/CreateInvoice.tsx:110:19; mechanism: typescript-structure; application attribution: invoicing; context: CreateInvoice; owner: manual-content.

Original: {c.name}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:638fd711c50f7608a2a4a274

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/CreateInvoice.tsx:201:21; mechanism: typescript-structure; application attribution: invoicing; context: CreateInvoice; owner: manual-content.

Original: {money(total({ items }), currency)}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:6fdcd98e2ff091aff507968d

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/CreateInvoice.tsx:228:19; mechanism: typescript-structure; application attribution: invoicing; context: CreateInvoice; owner: manual-content.

Original: {customers.find((c) =&gt; c.id === customer)?.name}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:f452c219f31ee6379007a4e9

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/CreateInvoice.tsx:228:109; mechanism: typescript-structure; application attribution: invoicing; context: CreateInvoice; owner: manual-content.

Original: {money(total({ items }), currency)}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:a5143595873ed7a28d0ed095

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Customers.tsx:32:19; mechanism: typescript-structure; application attribution: invoicing; context: Customers; owner: manual-content.

Original: {c.name}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:73a3dbbb333c786c68bc36d6

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Customers.tsx:33:18; mechanism: typescript-structure; application attribution: invoicing; context: Customers; owner: manual-content.

Original: {c.email}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:75fcb34b4ca84b10731b3272

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Customers.tsx:51:16; mechanism: typescript-structure; application attribution: invoicing; context: Customers; owner: manual-content.

Original: {c.email}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:7b475e4aab4a97b7eecd4f1d

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Customers.tsx:52:33; mechanism: typescript-structure; application attribution: invoicing; context: Customers; owner: manual-content.

Original: {c.address}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

### RTL.CHART.LABEL_FLOW:caa8a6652446209dc2fc98cf

**SVG geometry with separate flex labels** — MANUAL_REVIEW; Major; Medium confidence.

Source: apps/invoicing/src/pages/Dashboard.tsx:87:13; mechanism: typescript-structure; application attribution: invoicing; context: Dashboard/svg; owner: manual-chart.

Original: &lt;svg               viewBox="0 0 600 215"               role="img"               aria-label={t("Revenue increased from May to October, from 24,000 to 61,000 US dollars")}             &gt;

Rationale: Fixed SVG geometry and separate HTML flex labels can respond differently to document direction.

Treatment: Review chronology, axis gutters, labels/data correspondence and accessible description together.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-02; evidence IDs: 4300319c4ed3b2c0076c2228a365566bc0abc9695017c461bad1a63eee746405, 4a76730854ea0a6c2fa2a44919f073f34242f514a55d293dc2bc1549414e84b7, 6edaff018ac3f0af109099cab50cf46ca4d51e23a4a2579f5811d7fd1e85b33d, 8836248fe0ff21d6599cbf1b4e4133088b157eab84c9dc123a9a1fd8a88b31ce, 917dd11df748e1d451404f4050a1e9165c6f680a3ea4489e54961d1a2d3ddc40; related locations: libs/design-system/src/styles.css:283:3, libs/design-system/src/styles.css:284:3, libs/design-system/src/styles.css:285:3, libs/design-system/src/styles.css:286:3, libs/design-system/src/styles.css:287:3.

### RTL.CSS.PHYSICAL:adebba7d3ad0dda9b7b8d423

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: apps/invoicing/src/pages/Dashboard.tsx:180:23; mechanism: react-inline; application attribution: invoicing; context: Dashboard/span; owner: custom-inline.

Original: marginLeft: 10

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 505d6c9187c23c50da1a2558fc6c9df3feafdedd5ff12f6d041bd971c6de775d; related locations: none.

### RTL.ICON.LITERAL:aa0a8bc3f6ca19eae5b56a82

**Literal directional arrow in rendered-copy call** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Dashboard.tsx:197:47; mechanism: typescript-structure; application attribution: invoicing; context: Dashboard; owner: custom-copy.

Original: "View all invoices →"

Rationale: A literal arrow occurs in a copy/function call; its progression meaning and translated rendering need review.

Treatment: Review copy and navigation semantics rather than replacing every arrow.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-07; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:9f05797020b15bb1031f12fe

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/InvoiceDetails.tsx:38:17; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceDetails; owner: manual-content.

Original: {c.name}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:13dfdcf2817c6da7fa0b7930

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/InvoiceDetails.tsx:41:15; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceDetails; owner: manual-content.

Original: {c.address}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:31882b621bb69ff054bca7a7

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/InvoiceDetails.tsx:43:15; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceDetails; owner: manual-content.

Original: {c.email}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:e7869ece999321c7e9e1d86e

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/invoicing/src/pages/InvoiceDetails.tsx:70:19; mechanism: typescript-structure; application attribution: invoicing; context: InvoiceDetails; owner: manual-content.

Original: {money(total(i), i.currency)}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.CSS.PHYSICAL:01b8d7fcb0e0dd788a73af31

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: apps/invoicing/src/pages/Invoices.tsx:56:43; mechanism: react-inline; application attribution: invoicing; context: Invoices/span; owner: custom-inline.

Original: marginLeft: "auto"

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: eba6dedd2e71ef8009c0b0ed2f6def1b6f026400d7ed49a2ff2508cc573c62ba; related locations: none.

### RTL.RUNTIME.PAGINATION:c2bdfb11861582e5c386e851

**Pagination direction depends on MUI theme** — RUNTIME_CONFIG; Minor; Medium confidence.

Source: apps/invoicing/src/pages/Invoices.tsx:66:11; mechanism: typescript-structure; application attribution: invoicing; context: Invoices/Pagination; owner: mui-generated.

Original: &lt;Pagination             size="small"             getItemAriaLabel={language === "ar" ? (type, number) =&gt; type === "page" ? t("Go to page {page}", { page: number ?? 1 }) : label(\`Go to ${type} page\`) : undefined}             page={page}             count={Math.max(1, Math.ceil(filtered.length / 8))}             onChange={(_, p) =&gt; setPage(p)}           /&gt;

Rationale: MUI supplies directional pagination roles through theme context, independently of HTML flow.

Treatment: Verify synchronized theme/cache/document setup before adding custom icon swaps.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-07; evidence IDs: structural AST evidence; related locations: none.

### RTL.DOCUMENT.INITIAL:e0c891dfa8af31d4d67bfd56

**Initial HTML direction** — INTENTIONAL_LTR; Info; High confidence.

Source: apps/procurement/index.html:2:17; mechanism: html-root; application attribution: procurement; context: html; owner: document-runtime.

Original: dir="ltr"

Rationale: Initial HTML direction is a source fact, not the client runtime direction.

Treatment: Preserve approved default English markup; evaluate runtime direction separately.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 59b53cc4591d0879385030e184cb4886c0453caf7de1da1fee3b419eaf1767c6; related locations: none.

Exception: Phase 2A preserves the approved default English LTR entry markup; opt-in runtime direction is reviewed separately.; original category: INFORMATIONAL.

### RTL.BIDI.ISOLATION:862b107afb21edf9840ac703

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/procurement/src/App.tsx:68:19; mechanism: typescript-structure; application attribution: procurement; context: Orders; owner: manual-content.

Original: {o.id}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:95f0d5216f0155c798f82986

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/procurement/src/App.tsx:84:55; mechanism: typescript-structure; application attribution: procurement; context: Orders; owner: manual-content.

Original: {money(total(o))}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:3267dc7e6b7ff0e147b62518

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/procurement/src/App.tsx:105:15; mechanism: typescript-structure; application attribution: procurement; context: Details; owner: manual-content.

Original: {order.id}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.BIDI.ISOLATION:0ae599d0017719ece2087ae9

**Unisolated token/content text sink** — MANUAL_REVIEW; Minor; Medium confidence.

Source: apps/procurement/src/App.tsx:125:19; mechanism: typescript-structure; application attribution: procurement; context: Details; owner: manual-content.

Original: {money(total(order))}

Rationale: Known-name/token expression is rendered without an explicit bdi/dir ancestor; actual run direction and punctuation remain data-dependent.

Treatment: Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.RUNTIME.MISMATCH:631220ab170fd844366645f4

**RTL document capability with fixed LTR theme** — RUNTIME_CONFIG; Major; High confidence.

Source: libs/design-system/src/index.tsx:40:3; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: theme; owner: mui-generated.

Original: direction: "ltr"

Rationale: Analyzed source assigns document RTL while createTheme direction is fixed LTR. These are separate direction channels.

Treatment: Review reachable provider synchronization; MUI theme alone does not rewrite generated physical styles.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-04, RTL-06, RTL-07; evidence IDs: structural AST evidence; related locations: libs/shared/src/i18n.tsx:34:5.

### RTL.RUNTIME.CACHE:c6803b61cf2818cad26b1416

**No owned Emotion cache found in analyzed provider scope** — RUNTIME_CONFIG; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:75:5; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: Provider/ThemeProvider; owner: mui-generated.

Original: &lt;ThemeProvider theme={theme}&gt;

Rationale: The analyzed provider/import scope contains no CacheProvider despite document RTL capability; transitive cache packages do not establish configured RTL processing.

Treatment: Review compatible LTR/RTL style processing and custom-style ownership; absence is a scoped inference.

Limits: External providers, re-exported cache wrappers and unscanned configuration may invalidate this absence inference.

Related issues: RTL-04; evidence IDs: structural AST evidence; related locations: none.

### RTL.FORM.DIRECTION:c3038155faae0e23f50372db

**Field geometry delegates to runtime styling** — RUNTIME_CONFIG; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:85:3; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: FormField/TextField; owner: mui-generated.

Original: &lt;TextField fullWidth {...props} /&gt;

Rationale: MUI field labels/notches/helpers depend on theme and generated style processing.

Treatment: Verify document/theme/cache coordination and native input behavior; do not patch vendor geometry.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-04; evidence IDs: structural AST evidence; related locations: none.

### RTL.GEOMETRY.EDGE:4a19b0ffbf510d5d3715c64c

**Physical positioned edge** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/index.tsx:150:39; mechanism: mui-sx; application attribution: shared reachability unresolved; context: Modal/IconButton; owner: custom-emotion-review.

Original: right: 12

Rationale: Physical edge is coupled to placement, containing block and clearance; logical replacement alone does not select the correct side.

Treatment: Review anchor, companion gutter, breakpoints and collision clearance as one layout contract.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-05; evidence IDs: 3d1612ea00f52e4e39270d3cc51e17120fa0b3bb67300d8351b86a915461b1ee, d51ae1f4560ed338027deadc477f153b2876a798a1da4a32a96bd78612cf9ea7; related locations: libs/design-system/src/index.tsx:150:17.

### RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677

**Table cell has no explicit alignment policy** — MANUAL_REVIEW; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:191:15; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: DataTable/TableCell; owner: mui-generated.

Original: &lt;TableCell key={c.label}&gt;

Rationale: Generated default alignment and content-specific alignment policy are not declared at this cell.

Treatment: Review text, numeric and token alignment with runtime configuration; absence of align alone is not a bug.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-06; evidence IDs: structural AST evidence; related locations: none.

### RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21

**Table cell has no explicit alignment policy** — MANUAL_REVIEW; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:199:17; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: DataTable/TableCell; owner: mui-generated.

Original: &lt;TableCell key={c.label}&gt;

Rationale: Generated default alignment and content-specific alignment policy are not declared at this cell.

Treatment: Review text, numeric and token alignment with runtime configuration; absence of align alone is not a bug.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-06; evidence IDs: structural AST evidence; related locations: none.

### RTL.GEOMETRY.COUPLED:cd662af13b746b307885c1c6

**Fixed shell width and physical content reservation** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/index.tsx:214:3; mechanism: emotion-template; application attribution: shared reachability unresolved; context: SidebarFrame/; owner: custom-emotion-review.

Original: position: fixed;

Rationale: Fixed region width equals a separate physical content margin; independently flipping either can desynchronize shell geometry.

Treatment: Review anchor, gutter, border, mobile transform and resets together.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 36b143e0bcf478b52462593e98d3324e7db719e411c0b56d0434a228b002249e, 5a8e6abcb9057c34c1dc0fe9ea5ab66e8c3384871b49fc2dc6ae309f0ebc6422, 71215ee9b1bf5eef2c6286963878ca060695206b3d3987c6f9dc6e8372722211, b0118dfd1c2e8ab82bafba9f093c38190ac1412986213528164b6eaf2b6eaace, e6de08afa60bda6aa1b1c02dfc59cccc82e813741464945bc6fe9320158a9105; related locations: libs/design-system/src/index.tsx:215:3, libs/design-system/src/index.tsx:218:3, libs/design-system/src/index.tsx:220:3, libs/design-system/src/styles.css:114:3.

### RTL.GEOMETRY.EDGE:91f8525674eed0701dd95542

**Physical positioned edge** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/index.tsx:215:3; mechanism: emotion-template; application attribution: shared reachability unresolved; context: SidebarFrame/; owner: custom-emotion-review.

Original: left: 0;

Rationale: Physical edge is coupled to placement, containing block and clearance; logical replacement alone does not select the correct side.

Treatment: Review anchor, companion gutter, breakpoints and collision clearance as one layout contract.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 36b143e0bcf478b52462593e98d3324e7db719e411c0b56d0434a228b002249e, e6de08afa60bda6aa1b1c02dfc59cccc82e813741464945bc6fe9320158a9105; related locations: libs/design-system/src/index.tsx:214:3.

### RTL.CSS.PHYSICAL:87c7c8a9a1668b5ed0eb9d9e

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/index.tsx:220:3; mechanism: emotion-template; application attribution: shared reachability unresolved; context: SidebarFrame/; owner: custom-emotion-review.

Original: border-right: 1px solid #e9edf4;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: b0118dfd1c2e8ab82bafba9f093c38190ac1412986213528164b6eaf2b6eaace; related locations: none.

### RTL.GEOMETRY.ORDER:0b23a5f6f4bc3966eb9e0efc

**Directional geometry or explicit order** — MANUAL_REVIEW; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:226:5; mechanism: emotion-template; application attribution: shared reachability unresolved; context: SidebarFrame/@media (max-width: 900px); owner: custom-emotion-review.

Original: transform: translateX(-100%);

Rationale: Transform/axis/order semantics require geometric and reading-order decisions.

Treatment: Review spatial intent, focus order and companion positioning; no numeric sign reversal.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 2a891502e53b5cae3198effbce5549ca8c9f08b5f202cb023b60314ff3754acf; related locations: none.

### RTL.BRAND.ISLAND:b2139ad57eaf0ae87a66743e

**Brand flex composition has no explicit direction island** — MANUAL_REVIEW; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:250:7; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: Sidebar/a; owner: manual-brand.

Original: &lt;a className="brand" href={demoHref("/")}&gt;

Rationale: Reviewed brand role uses inherited flex flow with separate visual children and no local direction contract.

Treatment: Preserve the approved wordmark composition as a reviewed island; do not mirror glyphs.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-09; evidence IDs: f6f44182b4f1f7c9f4dfe3f47a8f5f628381e74aa10ff454061c4df6a09a2c50; related locations: libs/design-system/src/styles.css:16:3.

### RTL.ICON.PROGRESSION:f4c175932dd9a0c9123c55f5

**Directional icon requires semantic review** — MANUAL_REVIEW; Minor; Medium confidence.

Source: libs/design-system/src/index.tsx:295:11; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: Sidebar/ArrowForward; owner: custom-icon.

Original: &lt;ArrowForward sx={{ fontSize: 15, marginLeft: "auto" }} /&gt;

Rationale: Imported directional icon renders in JSX; navigation meaning and appropriate orientation need review.

Treatment: Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-07; evidence IDs: structural AST evidence; related locations: none.

### RTL.CSS.PHYSICAL:a82eeae5e376b962d817b8b2

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/index.tsx:295:45; mechanism: mui-sx; application attribution: shared reachability unresolved; context: Sidebar/ArrowForward; owner: custom-emotion-review.

Original: marginLeft: "auto"

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 84ef9fdd6fd695262ea08f7e56d20956a74645f1682675e2cd7e5131510c2ea2; related locations: none.

### RTL.CSS.PHYSICAL:21623aff840f0d576f06f522

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:21:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.brand; owner: custom-css.

Original: margin-left: 12px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 040f6988daf1465feba68967f3059a5b77424fdbcac21d7591183fb8e0abfedf; related locations: none.

### RTL.CSS.PHYSICAL:ecf95e3ab5ee9d97e51b7b4d

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:32:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.brand-mark; owner: custom-css.

Original: margin-right: 10px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 9e9ef9b0d2106dcb4fa8e01bedbf9448a6665a0aa03cfa8a3a63b71322ecb528; related locations: none.

### RTL.CSS.PHYSICAL:190bcc5a6e2552cc91cd610b

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:49:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.workspace &gt; span; owner: custom-css.

Original: margin-left: auto;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: f00c16d8607abddf50bb08819c5c59dc6c4a628d30cd509aaca174e16a9a8adc; related locations: none.

### RTL.CSS.PHYSICAL:28c2d60d10633572c611bf0c

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:83:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/nav a.active; owner: custom-css.

Original: border-left: 3px solid #4c58d6;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 8b32ae8d4fa1a21e9f14129f815563b8b4babc9073a1f8bb8b495b1af4e00cd2; related locations: none.

### RTL.CSS.PHYSICAL:eef2d882a74a3ca1f4724fc2

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:84:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/nav a.active; owner: custom-css.

Original: padding-left: 11px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 959911cc8e5ad036324c540155914384d9e54277d41256d44cb0051bf2e0e6c1; related locations: none.

### RTL.CSS.PHYSICAL:a73f6f180169335db97e8e52

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:114:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.app-main; owner: custom-css.

Original: margin-left: 238px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 5a8e6abcb9057c34c1dc0fe9ea5ab66e8c3384871b49fc2dc6ae309f0ebc6422; related locations: none.

### RTL.CSS.PHYSICAL:0dfdf26ee014cb3b23ca8b7f

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:143:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.header-divider; owner: custom-css.

Original: border-left: 1px solid #e7eaf1;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: c412113b6776ed4862bb758b0e173cc36ce36dab92703922d156d5a75f3f6324; related locations: none.

### RTL.CSS.PHYSICAL:a750b772938d00bc32351bff

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:144:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.header-divider; owner: custom-css.

Original: margin-left: 6px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 94fbf8e5bab439e7e076b78290386e25b8b1dad36d89d977bef5c2371398a650; related locations: none.

### RTL.GEOMETRY.EDGE:a9ac460392929e44328f29fe

**Physical positioned edge** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:241:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.kpi-icon; owner: custom-css.

Original: right: 20px;

Rationale: Physical edge is coupled to placement, containing block and clearance; logical replacement alone does not select the correct side.

Treatment: Review anchor, companion gutter, breakpoints and collision clearance as one layout contract.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-03; evidence IDs: 6e6105e3c2aef5357688eefd97227e49d06d17b6ddeb0a86701fca0cfe628f38, 8a3e01bf8921994351feaad17075e22e5478351f582cc49c05b94c4ccf76beec; related locations: libs/design-system/src/styles.css:240:3.

### RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:266:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.kpi-note b; owner: custom-css.

Original: margin-right: 5px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 067cc52fe4be31687bf0f701892c9b800103727a92f2e5763aa0c18f49367816; related locations: none.

### RTL.CSS.PHYSICAL:82212e990854fbb975d34448

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:285:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.chart-labels; owner: custom-css.

Original: padding-left: 40px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-02; evidence IDs: 8836248fe0ff21d6599cbf1b4e4133088b157eab84c9dc123a9a1fd8a88b31ce; related locations: none.

### RTL.CSS.PHYSICAL:911c43329429945ea8519fad

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:299:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.chart-legend i; owner: custom-css.

Original: margin-right: 7px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 640d0036e02b0758d2265a535d9f2df01bb196e1474897beca288db43f556634; related locations: none.

### RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:385:3; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/.status-dot; owner: custom-css.

Original: margin-right: 6px;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: 6cbd4d95abc4e542ddba510e6301727a1a1012cb1b8fb3fdd9c524015765b06b; related locations: none.

### RTL.CSS.PHYSICAL:d64ac5113f2d40f44c75d315

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:502:5; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/@media (max-width: 900px)/.app-main; owner: custom-css.

Original: margin-left: 0;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: b6a9fcb613813146b7475b4a236f9a782345ac2398de92ace74ea660e6d2e6bb; related locations: none.

### RTL.CSS.PHYSICAL:5f4d415396df52ea51e0a5d6

**Physical horizontal declaration** — MANUAL_REVIEW; Minor; High confidence.

Source: libs/design-system/src/styles.css:561:5; mechanism: css; application attribution: shared reachability unresolved; context: stylesheet/@media print/.app-main; owner: custom-css.

Original: margin-left: 0;

Rationale: Physical syntax does not establish reading-start/end intent or styling ownership.

Treatment: Review semantics, writing mode, cascade and owner before any conversion.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-01; evidence IDs: 6dd675d196ce2914a18826b777e4b147a5a35af1689780e9851e6765f1b3e767; related locations: none.

### RTL.DOCUMENT.RUNTIME:12875636fcbc0a9be9a7b6f4

**Document-level RTL assignment exists** — INFORMATIONAL; Info; High confidence.

Source: libs/shared/src/i18n.tsx:34:5; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: LocaleProvider; owner: document-runtime.

Original: document.documentElement.dir = language === "ar" ? "rtl" : "ltr"

Rationale: Document root direction can switch to RTL; body-mounted portals inherit root direction unless overridden.

Treatment: Verify portal computed direction independently; do not report a wrapper-only portal failure.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: none; evidence IDs: structural AST evidence; related locations: none.

### RTL.RUNTIME.LOCALE:9356c0da9bea9ff5056b08b3

**Fixed locale formatter** — RUNTIME_CONFIG; Minor; High confidence.

Source: libs/shared/src/index.ts:118:3; mechanism: typescript-structure; application attribution: shared reachability unresolved; context: money; owner: locale-runtime.

Original: new Intl.NumberFormat("en-US", {     style: "currency",     currency,     maximumFractionDigits: 2,   })

Rationale: Formatting uses a fixed display locale; direction and locale formatting are separate contracts.

Treatment: Approve locale display policy separately from canonical currency/date values and bidi isolation.

Limits: Static evidence indicates a risk; rendered behavior is not established by this scan.

Related issues: RTL-08; evidence IDs: structural AST evidence; related locations: none.

## Coverage diagnostics

- apps/invoicing/src/components/InvoiceTable.tsx:32:30 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for bgcolor is dynamic; original retained. Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.
- apps/invoicing/src/components/InvoiceTable.tsx:33:28 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for color is dynamic; original retained. Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.
- apps/invoicing/src/pages/Customers.tsx:29:38 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for bgcolor is dynamic; original retained. Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.
- apps/invoicing/src/pages/Customers.tsx:29:61 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for color is dynamic; original retained. Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.
- apps/invoicing/src/pages/Dashboard.tsx:63:23 UNRESOLVED_SX_OWNER — NONBLOCKING_DYNAMIC, blocking=false: sx owner not resolved to a known MUI import/wrapper. Unknown component owner, but the entire literal sx object contains only non-directional presentation keys.
- apps/invoicing/src/pages/Dashboard.tsx:151:29 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for background is dynamic; original retained. Reviewed source expression changes only angular status color-stop proportions, not reading-direction properties; donut geometry remains a manual visual concern. Source and expression fingerprints match the data-only review exception.
- apps/invoicing/src/pages/Dashboard.tsx:171:43 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for background is dynamic; original retained. Legend color comes from the reviewed local status-color tuple; no directional background-position input. Source and expression fingerprints match the data-only review exception.
- libs/design-system/src/index.tsx:120:21 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for background is dynamic; original retained. Reviewed status-color dictionary contains literal color values only. Source and expression fingerprints match the data-only review exception.
- libs/design-system/src/index.tsx:121:16 DYNAMIC_VALUE — NONBLOCKING_DYNAMIC, blocking=false: Value for color is dynamic; original retained. Dynamic presentation value does not block the current directional rules; expression is retained and not evaluated.

## Source evidence inventory

| Source | Mechanism | Context | Original declaration | Semantics |
| --- | --- | --- | --- | --- |
| apps/invoicing/index.html:2:7 | html-root | html | lang="en" | initial-document-attribute |
| apps/invoicing/index.html:2:17 | html-root | html | dir="ltr" | initial-document-attribute |
| apps/invoicing/src/components/InvoiceTable.tsx:30:21 | mui-sx | InvoiceTable/Avatar | width: 30 | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:31:21 | mui-sx | InvoiceTable/Avatar | height: 30 | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:32:21 | mui-sx | InvoiceTable/Avatar | bgcolor: c.color + "18" | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:33:21 | mui-sx | InvoiceTable/Avatar | color: c.color | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:34:21 | mui-sx | InvoiceTable/Avatar | fontSize: 10 | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:35:21 | mui-sx | InvoiceTable/Avatar | borderRadius: "8px" | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:76:35 | mui-sx | InvoiceTable/ArrowForward | fontSize: 15 | mui-system |
| apps/invoicing/src/components/InvoiceTable.tsx:76:49 | mui-sx | InvoiceTable/ArrowForward | color: "#9aa2b3" | mui-system |
| apps/invoicing/src/pages/CreateInvoice.tsx:205:51 | react-inline | CreateInvoice/div | justifyContent: "flex-end" | react-css |
| apps/invoicing/src/pages/Customers.tsx:22:15 | mui-sx | Customers/FormField | maxWidth: 350 | mui-system |
| apps/invoicing/src/pages/Customers.tsx:22:30 | mui-sx | Customers/FormField | marginBottom: 3 | mui-theme-spacing |
| apps/invoicing/src/pages/Customers.tsx:29:29 | mui-sx | Customers/Avatar | bgcolor: c.color + "20" | mui-system |
| apps/invoicing/src/pages/Customers.tsx:29:54 | mui-sx | Customers/Avatar | color: c.color | mui-system |
| apps/invoicing/src/pages/Dashboard.tsx:27:21 | mui-sx | Dashboard/Button | borderColor: "#e0e5ee" | mui-system |
| apps/invoicing/src/pages/Dashboard.tsx:27:45 | mui-sx | Dashboard/Button | color: "#707a8e" | mui-system |
| apps/invoicing/src/pages/Dashboard.tsx:27:63 | mui-sx | Dashboard/Button | bgcolor: "#fff" | mui-system |
| apps/invoicing/src/pages/Dashboard.tsx:151:17 | react-inline | Dashboard/div | background: \`conic-gradient(#5864dc 0 ${(paid.length / invoices.length) * 100}%,#e8b557 ${(paid.length / invoices.length) * 100}% ${((paid.length + pending.length) / invoices.length) * 100}%,#df838d ${((paid.length + pending.length) / invoices.length) * 100}% ${((paid.length + pending.length + overdue.length) / invoices.length) * 100}%,#cbd0dd 0 100%)\` | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:171:31 | react-inline | Dashboard/i | background: String(color) | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:178:23 | react-inline | Dashboard/span | display: "inline" | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:179:23 | react-inline | Dashboard/span | fontWeight: 400 | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:180:23 | react-inline | Dashboard/span | marginLeft: 10 | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:201:36 | react-inline | Dashboard/p | fontSize: 10 | react-css |
| apps/invoicing/src/pages/Dashboard.tsx:201:50 | react-inline | Dashboard/p | marginTop: 16 | react-css |
| apps/invoicing/src/pages/Invoices.tsx:46:19 | mui-sx | Invoices/FormField | width: 180 | mui-system |
| apps/invoicing/src/pages/Invoices.tsx:56:43 | react-inline | Invoices/span | marginLeft: "auto" | react-css |
| apps/invoicing/src/pages/Settings.tsx:83:43 | mui-sx | Settings/Alert | marginBottom: 2 | mui-theme-spacing |
| apps/procurement/index.html:2:7 | html-root | html | lang="en" | initial-document-attribute |
| apps/procurement/index.html:2:17 | html-root | html | dir="ltr" | initial-document-attribute |
| apps/procurement/src/App.tsx:49:19 | mui-sx | Orders/FormField | width: 200 | mui-system |
| apps/procurement/src/App.tsx:75:34 | react-inline | Orders/strong | fontSize: 12 | react-css |
| libs/design-system/src/index.tsx:56:33 | mui-theme | theme/styleOverrides/root | padding: "10px 18px" | emotion-css |
| libs/design-system/src/index.tsx:61:17 | mui-theme | theme/styleOverrides/root | borderColor: "#edf0f5" | emotion-css |
| libs/design-system/src/index.tsx:61:41 | mui-theme | theme/styleOverrides/root | padding: "17px 20px" | emotion-css |
| libs/design-system/src/index.tsx:63:11 | mui-theme | theme/styleOverrides/head | fontSize: 11 | emotion-css |
| libs/design-system/src/index.tsx:64:11 | mui-theme | theme/styleOverrides/head | fontWeight: 700 | emotion-css |
| libs/design-system/src/index.tsx:65:11 | mui-theme | theme/styleOverrides/head | color: "#80889a" | emotion-css |
| libs/design-system/src/index.tsx:66:11 | mui-theme | theme/styleOverrides/head | letterSpacing: ".6px" | emotion-css |
| libs/design-system/src/index.tsx:67:11 | mui-theme | theme/styleOverrides/head | background: "#fafbfc" | emotion-css |
| libs/design-system/src/index.tsx:120:9 | mui-sx | StatusBadge/Chip | background: colors[status][0] | mui-system |
| libs/design-system/src/index.tsx:121:9 | mui-sx | StatusBadge/Chip | color: colors[status][1] | mui-system |
| libs/design-system/src/index.tsx:122:9 | mui-sx | StatusBadge/Chip | fontWeight: 600 | mui-system |
| libs/design-system/src/index.tsx:123:9 | mui-sx | StatusBadge/Chip | fontSize: 11 | mui-system |
| libs/design-system/src/index.tsx:124:9 | mui-sx | StatusBadge/Chip | height: 26 | mui-system |
| libs/design-system/src/index.tsx:150:17 | mui-sx | Modal/IconButton | position: "absolute" | mui-system |
| libs/design-system/src/index.tsx:150:39 | mui-sx | Modal/IconButton | right: 12 | mui-system |
| libs/design-system/src/index.tsx:150:50 | mui-sx | Modal/IconButton | top: 12 | mui-system |
| libs/design-system/src/index.tsx:156:40 | mui-sx | Modal/DialogActions | padding: 3 | mui-theme-spacing |
| libs/design-system/src/index.tsx:214:3 | emotion-template | SidebarFrame/ | position: fixed; | css |
| libs/design-system/src/index.tsx:215:3 | emotion-template | SidebarFrame/ | left: 0; | css |
| libs/design-system/src/index.tsx:216:3 | emotion-template | SidebarFrame/ | top: 0; | css |
| libs/design-system/src/index.tsx:217:3 | emotion-template | SidebarFrame/ | bottom: 0; | css |
| libs/design-system/src/index.tsx:218:3 | emotion-template | SidebarFrame/ | width: 238px; | css |
| libs/design-system/src/index.tsx:219:3 | emotion-template | SidebarFrame/ | background: #fff; | css |
| libs/design-system/src/index.tsx:220:3 | emotion-template | SidebarFrame/ | border-right: 1px solid #e9edf4; | css |
| libs/design-system/src/index.tsx:221:3 | emotion-template | SidebarFrame/ | padding: 30px 18px; | css |
| libs/design-system/src/index.tsx:222:3 | emotion-template | SidebarFrame/ | z-index: 30; | css |
| libs/design-system/src/index.tsx:223:3 | emotion-template | SidebarFrame/ | display: flex; | css |
| libs/design-system/src/index.tsx:224:3 | emotion-template | SidebarFrame/ | flex-direction: column; | css |
| libs/design-system/src/index.tsx:226:5 | emotion-template | SidebarFrame/@media (max-width: 900px) | transform: translateX(-100%); | css |
| libs/design-system/src/index.tsx:228:7 | emotion-template | SidebarFrame/@media (max-width: 900px)/&amp;.is-open | transform: translateX(0); | css |
| libs/design-system/src/index.tsx:257:13 | mui-sx | Sidebar/Avatar | width: 30 | mui-system |
| libs/design-system/src/index.tsx:258:13 | mui-sx | Sidebar/Avatar | height: 30 | mui-system |
| libs/design-system/src/index.tsx:259:13 | mui-sx | Sidebar/Avatar | bgcolor: "#eceefb" | mui-system |
| libs/design-system/src/index.tsx:260:13 | mui-sx | Sidebar/Avatar | color: "#5d66c6" | mui-system |
| libs/design-system/src/index.tsx:261:13 | mui-sx | Sidebar/Avatar | fontSize: 12 | mui-system |
| libs/design-system/src/index.tsx:295:31 | mui-sx | Sidebar/ArrowForward | fontSize: 15 | mui-system |
| libs/design-system/src/index.tsx:295:45 | mui-sx | Sidebar/ArrowForward | marginLeft: "auto" | mui-theme-spacing |
| libs/design-system/src/index.tsx:305:15 | mui-sx | Sidebar/Avatar | width: 34 | mui-system |
| libs/design-system/src/index.tsx:306:15 | mui-sx | Sidebar/Avatar | height: 34 | mui-system |
| libs/design-system/src/index.tsx:307:15 | mui-sx | Sidebar/Avatar | bgcolor: "#ede5db" | mui-system |
| libs/design-system/src/index.tsx:308:15 | mui-sx | Sidebar/Avatar | color: "#8c7055" | mui-system |
| libs/design-system/src/index.tsx:309:15 | mui-sx | Sidebar/Avatar | fontSize: 12 | mui-system |
| libs/design-system/src/index.tsx:346:23 | mui-sx | Header/Search | fontSize: 20 | mui-system |
| libs/design-system/src/index.tsx:346:37 | mui-sx | Header/Search | color: "#8b92a3" | mui-system |
| libs/design-system/src/index.tsx:359:13 | mui-sx | Header/Avatar | width: 30 | mui-system |
| libs/design-system/src/index.tsx:360:13 | mui-sx | Header/Avatar | height: 30 | mui-system |
| libs/design-system/src/index.tsx:361:13 | mui-sx | Header/Avatar | fontSize: 11 | mui-system |
| libs/design-system/src/index.tsx:362:13 | mui-sx | Header/Avatar | bgcolor: "#ede5db" | mui-system |
| libs/design-system/src/index.tsx:363:13 | mui-sx | Header/Avatar | color: "#8c7055" | mui-system |
| libs/design-system/src/styles.css:2:3 | css | stylesheet/* | box-sizing: border-box; | css |
| libs/design-system/src/styles.css:5:3 | css | stylesheet/body | margin: 0; | css |
| libs/design-system/src/styles.css:8:3 | css | stylesheet/a | color: inherit; | css |
| libs/design-system/src/styles.css:9:3 | css | stylesheet/a | text-decoration: none; | css |
| libs/design-system/src/styles.css:13:3 | css | stylesheet/button, input | font: inherit; | css |
| libs/design-system/src/styles.css:16:3 | css | stylesheet/.brand | display: flex; | css |
| libs/design-system/src/styles.css:17:3 | css | stylesheet/.brand | align-items: center; | css |
| libs/design-system/src/styles.css:18:3 | css | stylesheet/.brand | font-size: 32px; | css |
| libs/design-system/src/styles.css:19:3 | css | stylesheet/.brand | font-weight: 750; | css |
| libs/design-system/src/styles.css:20:3 | css | stylesheet/.brand | letter-spacing: -1.8px; | css |
| libs/design-system/src/styles.css:21:3 | css | stylesheet/.brand | margin-left: 12px; | css |
| libs/design-system/src/styles.css:24:3 | css | stylesheet/.brand-mark | background: #4c58d6; | css |
| libs/design-system/src/styles.css:25:3 | css | stylesheet/.brand-mark | color: white; | css |
| libs/design-system/src/styles.css:26:3 | css | stylesheet/.brand-mark | width: 35px; | css |
| libs/design-system/src/styles.css:27:3 | css | stylesheet/.brand-mark | height: 35px; | css |
| libs/design-system/src/styles.css:28:3 | css | stylesheet/.brand-mark | border-radius: 10px; | css |
| libs/design-system/src/styles.css:29:3 | css | stylesheet/.brand-mark | display: grid; | css |
| libs/design-system/src/styles.css:30:3 | css | stylesheet/.brand-mark | place-items: center; | css |
| libs/design-system/src/styles.css:31:3 | css | stylesheet/.brand-mark | font-size: 32px; | css |
| libs/design-system/src/styles.css:32:3 | css | stylesheet/.brand-mark | margin-right: 10px; | css |
| libs/design-system/src/styles.css:33:3 | css | stylesheet/.brand-mark | line-height: 1; | css |
| libs/design-system/src/styles.css:36:3 | css | stylesheet/.brand-period | color: #5864d9; | css |
| libs/design-system/src/styles.css:39:3 | css | stylesheet/.workspace | display: flex; | css |
| libs/design-system/src/styles.css:40:3 | css | stylesheet/.workspace | align-items: center; | css |
| libs/design-system/src/styles.css:41:3 | css | stylesheet/.workspace | gap: 10px; | css |
| libs/design-system/src/styles.css:42:3 | css | stylesheet/.workspace | margin-top: 34px; | css |
| libs/design-system/src/styles.css:43:3 | css | stylesheet/.workspace | padding: 12px 9px; | css |
| libs/design-system/src/styles.css:44:3 | css | stylesheet/.workspace | border: 1px solid #e8ebf2; | css |
| libs/design-system/src/styles.css:45:3 | css | stylesheet/.workspace | border-radius: 8px; | css |
| libs/design-system/src/styles.css:46:3 | css | stylesheet/.workspace | font-size: 12px; | css |
| libs/design-system/src/styles.css:49:3 | css | stylesheet/.workspace &gt; span | margin-left: auto; | css |
| libs/design-system/src/styles.css:53:3 | css | stylesheet/.workspace small, .profile small | display: block; | css |
| libs/design-system/src/styles.css:54:3 | css | stylesheet/.workspace small, .profile small | font-size: 10px; | css |
| libs/design-system/src/styles.css:55:3 | css | stylesheet/.workspace small, .profile small | color: #8b93a3; | css |
| libs/design-system/src/styles.css:56:3 | css | stylesheet/.workspace small, .profile small | margin-top: 3px; | css |
| libs/design-system/src/styles.css:59:3 | css | stylesheet/.nav-label | font-size: 9px; | css |
| libs/design-system/src/styles.css:60:3 | css | stylesheet/.nav-label | letter-spacing: 1.6px; | css |
| libs/design-system/src/styles.css:61:3 | css | stylesheet/.nav-label | font-weight: 700; | css |
| libs/design-system/src/styles.css:62:3 | css | stylesheet/.nav-label | color: #969cab; | css |
| libs/design-system/src/styles.css:63:3 | css | stylesheet/.nav-label | margin: 30px 14px 12px; | css |
| libs/design-system/src/styles.css:66:3 | css | stylesheet/nav | display: grid; | css |
| libs/design-system/src/styles.css:67:3 | css | stylesheet/nav | gap: 6px; | css |
| libs/design-system/src/styles.css:71:3 | css | stylesheet/nav a, .app-link | display: flex; | css |
| libs/design-system/src/styles.css:72:3 | css | stylesheet/nav a, .app-link | align-items: center; | css |
| libs/design-system/src/styles.css:73:3 | css | stylesheet/nav a, .app-link | gap: 13px; | css |
| libs/design-system/src/styles.css:74:3 | css | stylesheet/nav a, .app-link | padding: 12px 14px; | css |
| libs/design-system/src/styles.css:75:3 | css | stylesheet/nav a, .app-link | border-radius: 7px; | css |
| libs/design-system/src/styles.css:76:3 | css | stylesheet/nav a, .app-link | font-size: 13px; | css |
| libs/design-system/src/styles.css:77:3 | css | stylesheet/nav a, .app-link | color: #777f90; | css |
| libs/design-system/src/styles.css:80:3 | css | stylesheet/nav a.active | background: #edf0ff; | css |
| libs/design-system/src/styles.css:81:3 | css | stylesheet/nav a.active | color: #4c58d6; | css |
| libs/design-system/src/styles.css:82:3 | css | stylesheet/nav a.active | font-weight: 650; | css |
| libs/design-system/src/styles.css:83:3 | css | stylesheet/nav a.active | border-left: 3px solid #4c58d6; | css |
| libs/design-system/src/styles.css:84:3 | css | stylesheet/nav a.active | padding-left: 11px; | css |
| libs/design-system/src/styles.css:87:3 | css | stylesheet/.sidebar-bottom | margin-top: auto; | css |
| libs/design-system/src/styles.css:90:3 | css | stylesheet/.support-card | background: #f7f8fc; | css |
| libs/design-system/src/styles.css:91:3 | css | stylesheet/.support-card | border: 1px solid #edf0f6; | css |
| libs/design-system/src/styles.css:92:3 | css | stylesheet/.support-card | border-radius: 9px; | css |
| libs/design-system/src/styles.css:93:3 | css | stylesheet/.support-card | padding: 16px; | css |
| libs/design-system/src/styles.css:94:3 | css | stylesheet/.support-card | margin: 22px 0; | css |
| libs/design-system/src/styles.css:95:3 | css | stylesheet/.support-card | font-size: 11px; | css |
| libs/design-system/src/styles.css:98:3 | css | stylesheet/.support-card p | color: #9299a7; | css |
| libs/design-system/src/styles.css:99:3 | css | stylesheet/.support-card p | line-height: 1.7; | css |
| libs/design-system/src/styles.css:102:3 | css | stylesheet/.support-card a | font-weight: 600; | css |
| libs/design-system/src/styles.css:103:3 | css | stylesheet/.support-card a | color: #4c58d6; | css |
| libs/design-system/src/styles.css:106:3 | css | stylesheet/.profile | display: flex; | css |
| libs/design-system/src/styles.css:107:3 | css | stylesheet/.profile | gap: 10px; | css |
| libs/design-system/src/styles.css:108:3 | css | stylesheet/.profile | align-items: center; | css |
| libs/design-system/src/styles.css:109:3 | css | stylesheet/.profile | border-top: 1px solid #edf0f5; | css |
| libs/design-system/src/styles.css:110:3 | css | stylesheet/.profile | padding-top: 19px; | css |
| libs/design-system/src/styles.css:111:3 | css | stylesheet/.profile | font-size: 11px; | css |
| libs/design-system/src/styles.css:114:3 | css | stylesheet/.app-main | margin-left: 238px; | css |
| libs/design-system/src/styles.css:117:3 | css | stylesheet/.header | height: 76px; | css |
| libs/design-system/src/styles.css:118:3 | css | stylesheet/.header | background: #fff; | css |
| libs/design-system/src/styles.css:119:3 | css | stylesheet/.header | border-bottom: 1px solid #e9edf4; | css |
| libs/design-system/src/styles.css:120:3 | css | stylesheet/.header | display: flex; | css |
| libs/design-system/src/styles.css:121:3 | css | stylesheet/.header | align-items: center; | css |
| libs/design-system/src/styles.css:122:3 | css | stylesheet/.header | justify-content: space-between; | css |
| libs/design-system/src/styles.css:123:3 | css | stylesheet/.header | padding: 0 36px; | css |
| libs/design-system/src/styles.css:124:3 | css | stylesheet/.header | font-size: 11px; | css |
| libs/design-system/src/styles.css:128:3 | css | stylesheet/.header-title, .header-tools | display: flex; | css |
| libs/design-system/src/styles.css:129:3 | css | stylesheet/.header-title, .header-tools | align-items: center; | css |
| libs/design-system/src/styles.css:130:3 | css | stylesheet/.header-title, .header-tools | gap: 16px; | css |
| libs/design-system/src/styles.css:133:3 | css | stylesheet/.header-title &gt; span:first-of-type | color: #9198a7; | css |
| libs/design-system/src/styles.css:136:3 | css | stylesheet/.breadcrumb-slash | color: #ccd0db; | css |
| libs/design-system/src/styles.css:139:3 | css | stylesheet/.header-search | color: #9097a6; | css |
| libs/design-system/src/styles.css:142:3 | css | stylesheet/.header-divider | height: 20px; | css |
| libs/design-system/src/styles.css:143:3 | css | stylesheet/.header-divider | border-left: 1px solid #e7eaf1; | css |
| libs/design-system/src/styles.css:144:3 | css | stylesheet/.header-divider | margin-left: 6px; | css |
| libs/design-system/src/styles.css:147:3 | css | stylesheet/.mobile-menu.MuiIconButton-root | display: none; | css |
| libs/design-system/src/styles.css:150:3 | css | stylesheet/main | padding: 34px 36px 18px; | css |
| libs/design-system/src/styles.css:151:3 | css | stylesheet/main | max-width: 1600px; | css |
| libs/design-system/src/styles.css:152:3 | css | stylesheet/main | margin: auto; | css |
| libs/design-system/src/styles.css:155:3 | css | stylesheet/footer | padding: 28px 36px; | css |
| libs/design-system/src/styles.css:156:3 | css | stylesheet/footer | display: flex; | css |
| libs/design-system/src/styles.css:157:3 | css | stylesheet/footer | justify-content: space-between; | css |
| libs/design-system/src/styles.css:158:3 | css | stylesheet/footer | font-size: 10px; | css |
| libs/design-system/src/styles.css:159:3 | css | stylesheet/footer | color: #98a0af; | css |
| libs/design-system/src/styles.css:162:3 | css | stylesheet/footer span | display: flex; | css |
| libs/design-system/src/styles.css:163:3 | css | stylesheet/footer span | gap: 7px; | css |
| libs/design-system/src/styles.css:164:3 | css | stylesheet/footer span | align-items: center; | css |
| libs/design-system/src/styles.css:167:3 | css | stylesheet/footer i | background: #65a98e; | css |
| libs/design-system/src/styles.css:168:3 | css | stylesheet/footer i | width: 5px; | css |
| libs/design-system/src/styles.css:169:3 | css | stylesheet/footer i | height: 5px; | css |
| libs/design-system/src/styles.css:170:3 | css | stylesheet/footer i | border-radius: 50%; | css |
| libs/design-system/src/styles.css:173:3 | css | stylesheet/.card | border: 1px solid #e8ecf3 !important; | css |
| libs/design-system/src/styles.css:174:3 | css | stylesheet/.card | border-radius: 11px !important; | css |
| libs/design-system/src/styles.css:175:3 | css | stylesheet/.card | overflow: hidden; | css |
| libs/design-system/src/styles.css:178:3 | css | stylesheet/.card-pad | padding: 24px; | css |
| libs/design-system/src/styles.css:181:3 | css | stylesheet/.page-heading | display: flex; | css |
| libs/design-system/src/styles.css:182:3 | css | stylesheet/.page-heading | align-items: center; | css |
| libs/design-system/src/styles.css:183:3 | css | stylesheet/.page-heading | justify-content: space-between; | css |
| libs/design-system/src/styles.css:184:3 | css | stylesheet/.page-heading | margin-bottom: 28px; | css |
| libs/design-system/src/styles.css:185:3 | css | stylesheet/.page-heading | gap: 18px; | css |
| libs/design-system/src/styles.css:188:3 | css | stylesheet/.eyebrow | font-size: 10px; | css |
| libs/design-system/src/styles.css:189:3 | css | stylesheet/.eyebrow | letter-spacing: 1.8px; | css |
| libs/design-system/src/styles.css:190:3 | css | stylesheet/.eyebrow | color: #949bab; | css |
| libs/design-system/src/styles.css:191:3 | css | stylesheet/.eyebrow | font-weight: 600; | css |
| libs/design-system/src/styles.css:192:3 | css | stylesheet/.eyebrow | margin-bottom: 9px; | css |
| libs/design-system/src/styles.css:195:3 | css | stylesheet/.page-heading h1 | font-size: 28px; | css |
| libs/design-system/src/styles.css:196:3 | css | stylesheet/.page-heading h1 | letter-spacing: -0.8px; | css |
| libs/design-system/src/styles.css:197:3 | css | stylesheet/.page-heading h1 | margin: 0; | css |
| libs/design-system/src/styles.css:198:3 | css | stylesheet/.page-heading h1 | font-weight: 700; | css |
| libs/design-system/src/styles.css:201:3 | css | stylesheet/.page-heading p | font-size: 12px; | css |
| libs/design-system/src/styles.css:202:3 | css | stylesheet/.page-heading p | color: #8b93a4; | css |
| libs/design-system/src/styles.css:203:3 | css | stylesheet/.page-heading p | margin: 9px 0 0; | css |
| libs/design-system/src/styles.css:206:3 | css | stylesheet/.heading-actions | display: flex; | css |
| libs/design-system/src/styles.css:207:3 | css | stylesheet/.heading-actions | gap: 10px; | css |
| libs/design-system/src/styles.css:210:3 | css | stylesheet/.section-title | display: flex; | css |
| libs/design-system/src/styles.css:211:3 | css | stylesheet/.section-title | justify-content: space-between; | css |
| libs/design-system/src/styles.css:212:3 | css | stylesheet/.section-title | align-items: center; | css |
| libs/design-system/src/styles.css:213:3 | css | stylesheet/.section-title | padding: 22px 24px; | css |
| libs/design-system/src/styles.css:216:3 | css | stylesheet/.section-title h2 | margin: 0; | css |
| libs/design-system/src/styles.css:217:3 | css | stylesheet/.section-title h2 | font-size: 14px; | css |
| libs/design-system/src/styles.css:218:3 | css | stylesheet/.section-title h2 | font-weight: 650; | css |
| libs/design-system/src/styles.css:221:3 | css | stylesheet/.section-title p | font-size: 11px; | css |
| libs/design-system/src/styles.css:222:3 | css | stylesheet/.section-title p | color: #9299a8; | css |
| libs/design-system/src/styles.css:223:3 | css | stylesheet/.section-title p | margin: 6px 0 0; | css |
| libs/design-system/src/styles.css:226:3 | css | stylesheet/.section-title a | font-size: 11px; | css |
| libs/design-system/src/styles.css:227:3 | css | stylesheet/.section-title a | color: #5663d4; | css |
| libs/design-system/src/styles.css:230:3 | css | stylesheet/.kpis | display: grid; | css |
| libs/design-system/src/styles.css:231:3 | css | stylesheet/.kpis | grid-template-columns: repeat(4, 1fr); | css |
| libs/design-system/src/styles.css:232:3 | css | stylesheet/.kpis | gap: 18px; | css |
| libs/design-system/src/styles.css:233:3 | css | stylesheet/.kpis | margin-bottom: 24px; | css |
| libs/design-system/src/styles.css:236:3 | css | stylesheet/.kpi | padding: 20px 22px; | css |
| libs/design-system/src/styles.css:237:3 | css | stylesheet/.kpi | position: relative; | css |
| libs/design-system/src/styles.css:240:3 | css | stylesheet/.kpi-icon | position: absolute; | css |
| libs/design-system/src/styles.css:241:3 | css | stylesheet/.kpi-icon | right: 20px; | css |
| libs/design-system/src/styles.css:242:3 | css | stylesheet/.kpi-icon | top: 20px; | css |
| libs/design-system/src/styles.css:243:3 | css | stylesheet/.kpi-icon | background: #f2f3fb; | css |
| libs/design-system/src/styles.css:244:3 | css | stylesheet/.kpi-icon | border-radius: 8px; | css |
| libs/design-system/src/styles.css:245:3 | css | stylesheet/.kpi-icon | padding: 7px; | css |
| libs/design-system/src/styles.css:246:3 | css | stylesheet/.kpi-icon | display: flex; | css |
| libs/design-system/src/styles.css:247:3 | css | stylesheet/.kpi-icon | color: #7480ca; | css |
| libs/design-system/src/styles.css:250:3 | css | stylesheet/.kpi-label | font-size: 11px; | css |
| libs/design-system/src/styles.css:251:3 | css | stylesheet/.kpi-label | color: #818a9c; | css |
| libs/design-system/src/styles.css:252:3 | css | stylesheet/.kpi-label | margin-bottom: 18px; | css |
| libs/design-system/src/styles.css:255:3 | css | stylesheet/.kpi-value | font-size: 26px; | css |
| libs/design-system/src/styles.css:256:3 | css | stylesheet/.kpi-value | font-weight: 700; | css |
| libs/design-system/src/styles.css:257:3 | css | stylesheet/.kpi-value | letter-spacing: -0.7px; | css |
| libs/design-system/src/styles.css:260:3 | css | stylesheet/.kpi-note | font-size: 10px; | css |
| libs/design-system/src/styles.css:261:3 | css | stylesheet/.kpi-note | color: #929bac; | css |
| libs/design-system/src/styles.css:262:3 | css | stylesheet/.kpi-note | margin-top: 10px; | css |
| libs/design-system/src/styles.css:265:3 | css | stylesheet/.kpi-note b | color: #399875; | css |
| libs/design-system/src/styles.css:266:3 | css | stylesheet/.kpi-note b | margin-right: 5px; | css |
| libs/design-system/src/styles.css:269:3 | css | stylesheet/.charts | display: grid; | css |
| libs/design-system/src/styles.css:270:3 | css | stylesheet/.charts | grid-template-columns: 1.9fr 1fr; | css |
| libs/design-system/src/styles.css:271:3 | css | stylesheet/.charts | gap: 24px; | css |
| libs/design-system/src/styles.css:272:3 | css | stylesheet/.charts | margin-bottom: 24px; | css |
| libs/design-system/src/styles.css:275:3 | css | stylesheet/.chart-wrap | padding: 0 24px 18px; | css |
| libs/design-system/src/styles.css:278:3 | css | stylesheet/.chart-wrap svg | width: 100%; | css |
| libs/design-system/src/styles.css:279:3 | css | stylesheet/.chart-wrap svg | height: 215px; | css |
| libs/design-system/src/styles.css:280:3 | css | stylesheet/.chart-wrap svg | overflow: visible; | css |
| libs/design-system/src/styles.css:283:3 | css | stylesheet/.chart-labels | display: flex; | css |
| libs/design-system/src/styles.css:284:3 | css | stylesheet/.chart-labels | justify-content: space-between; | css |
| libs/design-system/src/styles.css:285:3 | css | stylesheet/.chart-labels | padding-left: 40px; | css |
| libs/design-system/src/styles.css:286:3 | css | stylesheet/.chart-labels | font-size: 9px; | css |
| libs/design-system/src/styles.css:287:3 | css | stylesheet/.chart-labels | color: #949cad; | css |
| libs/design-system/src/styles.css:290:3 | css | stylesheet/.chart-legend | font-size: 10px; | css |
| libs/design-system/src/styles.css:291:3 | css | stylesheet/.chart-legend | color: #8b93a4; | css |
| libs/design-system/src/styles.css:294:3 | css | stylesheet/.chart-legend i | display: inline-block; | css |
| libs/design-system/src/styles.css:295:3 | css | stylesheet/.chart-legend i | width: 7px; | css |
| libs/design-system/src/styles.css:296:3 | css | stylesheet/.chart-legend i | height: 7px; | css |
| libs/design-system/src/styles.css:297:3 | css | stylesheet/.chart-legend i | background: #5662dc; | css |
| libs/design-system/src/styles.css:298:3 | css | stylesheet/.chart-legend i | border-radius: 50%; | css |
| libs/design-system/src/styles.css:299:3 | css | stylesheet/.chart-legend i | margin-right: 7px; | css |
| libs/design-system/src/styles.css:302:3 | css | stylesheet/.breakdown | padding: 0 24px 22px; | css |
| libs/design-system/src/styles.css:305:3 | css | stylesheet/.donut | width: 144px; | css |
| libs/design-system/src/styles.css:306:3 | css | stylesheet/.donut | height: 144px; | css |
| libs/design-system/src/styles.css:307:3 | css | stylesheet/.donut | border-radius: 50%; | css |
| libs/design-system/src/styles.css:308:3 | css | stylesheet/.donut | background: conic-gradient(#5864dc 0 62%, #e8b557 62% 87%, #df838d 87% 100%); | css |
| libs/design-system/src/styles.css:309:3 | css | stylesheet/.donut | margin: 6px auto 22px; | css |
| libs/design-system/src/styles.css:310:3 | css | stylesheet/.donut | display: grid; | css |
| libs/design-system/src/styles.css:311:3 | css | stylesheet/.donut | place-items: center; | css |
| libs/design-system/src/styles.css:314:3 | css | stylesheet/.donut-center | background: white; | css |
| libs/design-system/src/styles.css:315:3 | css | stylesheet/.donut-center | width: 116px; | css |
| libs/design-system/src/styles.css:316:3 | css | stylesheet/.donut-center | height: 116px; | css |
| libs/design-system/src/styles.css:317:3 | css | stylesheet/.donut-center | border-radius: 50%; | css |
| libs/design-system/src/styles.css:318:3 | css | stylesheet/.donut-center | display: flex; | css |
| libs/design-system/src/styles.css:319:3 | css | stylesheet/.donut-center | align-items: center; | css |
| libs/design-system/src/styles.css:320:3 | css | stylesheet/.donut-center | justify-content: center; | css |
| libs/design-system/src/styles.css:321:3 | css | stylesheet/.donut-center | flex-direction: column; | css |
| libs/design-system/src/styles.css:324:3 | css | stylesheet/.donut-center strong | font-size: 26px; | css |
| libs/design-system/src/styles.css:327:3 | css | stylesheet/.donut-center small | font-size: 9px; | css |
| libs/design-system/src/styles.css:328:3 | css | stylesheet/.donut-center small | color: #939aa9; | css |
| libs/design-system/src/styles.css:329:3 | css | stylesheet/.donut-center small | margin-top: 5px; | css |
| libs/design-system/src/styles.css:332:3 | css | stylesheet/.breakdown-row | display: flex; | css |
| libs/design-system/src/styles.css:333:3 | css | stylesheet/.breakdown-row | align-items: center; | css |
| libs/design-system/src/styles.css:334:3 | css | stylesheet/.breakdown-row | justify-content: space-between; | css |
| libs/design-system/src/styles.css:335:3 | css | stylesheet/.breakdown-row | font-size: 11px; | css |
| libs/design-system/src/styles.css:336:3 | css | stylesheet/.breakdown-row | margin: 13px 0; | css |
| libs/design-system/src/styles.css:339:3 | css | stylesheet/.breakdown-row span | display: flex; | css |
| libs/design-system/src/styles.css:340:3 | css | stylesheet/.breakdown-row span | align-items: center; | css |
| libs/design-system/src/styles.css:341:3 | css | stylesheet/.breakdown-row span | gap: 8px; | css |
| libs/design-system/src/styles.css:342:3 | css | stylesheet/.breakdown-row span | color: #7c8597; | css |
| libs/design-system/src/styles.css:345:3 | css | stylesheet/.breakdown-row i | width: 7px; | css |
| libs/design-system/src/styles.css:346:3 | css | stylesheet/.breakdown-row i | height: 7px; | css |
| libs/design-system/src/styles.css:347:3 | css | stylesheet/.breakdown-row i | border-radius: 50%; | css |
| libs/design-system/src/styles.css:350:3 | css | stylesheet/.table-scroll | overflow: auto; | css |
| libs/design-system/src/styles.css:353:3 | css | stylesheet/.customer-cell | display: flex; | css |
| libs/design-system/src/styles.css:354:3 | css | stylesheet/.customer-cell | align-items: center; | css |
| libs/design-system/src/styles.css:355:3 | css | stylesheet/.customer-cell | gap: 11px; | css |
| libs/design-system/src/styles.css:356:3 | css | stylesheet/.customer-cell | white-space: nowrap; | css |
| libs/design-system/src/styles.css:359:3 | css | stylesheet/.customer-cell strong | font-size: 11px; | css |
| libs/design-system/src/styles.css:360:3 | css | stylesheet/.customer-cell strong | font-weight: 600; | css |
| libs/design-system/src/styles.css:363:3 | css | stylesheet/.customer-cell small | display: block; | css |
| libs/design-system/src/styles.css:364:3 | css | stylesheet/.customer-cell small | font-size: 9px; | css |
| libs/design-system/src/styles.css:365:3 | css | stylesheet/.customer-cell small | color: #98a0af; | css |
| libs/design-system/src/styles.css:366:3 | css | stylesheet/.customer-cell small | margin-top: 3px; | css |
| libs/design-system/src/styles.css:369:3 | css | stylesheet/.invoice-link | color: #5260cd; | css |
| libs/design-system/src/styles.css:370:3 | css | stylesheet/.invoice-link | font-size: 11px; | css |
| libs/design-system/src/styles.css:371:3 | css | stylesheet/.invoice-link | font-weight: 600; | css |
| libs/design-system/src/styles.css:374:3 | css | stylesheet/.table-date | font-size: 11px; | css |
| libs/design-system/src/styles.css:375:3 | css | stylesheet/.table-date | color: #8a93a4; | css |
| libs/design-system/src/styles.css:376:3 | css | stylesheet/.table-date | white-space: nowrap; | css |
| libs/design-system/src/styles.css:379:3 | css | stylesheet/.amount | font-size: 12px; | css |
| libs/design-system/src/styles.css:380:3 | css | stylesheet/.amount | font-weight: 600; | css |
| libs/design-system/src/styles.css:381:3 | css | stylesheet/.amount | white-space: nowrap; | css |
| libs/design-system/src/styles.css:384:3 | css | stylesheet/.status-dot | font-size: 7px; | css |
| libs/design-system/src/styles.css:385:3 | css | stylesheet/.status-dot | margin-right: 6px; | css |
| libs/design-system/src/styles.css:388:3 | css | stylesheet/.toolbar | padding: 20px 24px; | css |
| libs/design-system/src/styles.css:389:3 | css | stylesheet/.toolbar | display: flex; | css |
| libs/design-system/src/styles.css:390:3 | css | stylesheet/.toolbar | gap: 14px; | css |
| libs/design-system/src/styles.css:391:3 | css | stylesheet/.toolbar | align-items: center; | css |
| libs/design-system/src/styles.css:392:3 | css | stylesheet/.toolbar | border-bottom: 1px solid #edf0f5; | css |
| libs/design-system/src/styles.css:395:3 | css | stylesheet/.toolbar .search | max-width: 320px; | css |
| libs/design-system/src/styles.css:398:3 | css | stylesheet/.pagination | display: flex; | css |
| libs/design-system/src/styles.css:399:3 | css | stylesheet/.pagination | align-items: center; | css |
| libs/design-system/src/styles.css:400:3 | css | stylesheet/.pagination | justify-content: space-between; | css |
| libs/design-system/src/styles.css:401:3 | css | stylesheet/.pagination | padding: 18px 24px; | css |
| libs/design-system/src/styles.css:402:3 | css | stylesheet/.pagination | font-size: 11px; | css |
| libs/design-system/src/styles.css:403:3 | css | stylesheet/.pagination | color: #8e97a6; | css |
| libs/design-system/src/styles.css:406:3 | css | stylesheet/.form-grid | display: grid; | css |
| libs/design-system/src/styles.css:407:3 | css | stylesheet/.form-grid | grid-template-columns: 1fr 1fr; | css |
| libs/design-system/src/styles.css:408:3 | css | stylesheet/.form-grid | gap: 22px; | css |
| libs/design-system/src/styles.css:411:3 | css | stylesheet/.form-section | margin-bottom: 24px; | css |
| libs/design-system/src/styles.css:414:3 | css | stylesheet/.form-section h2 | font-size: 15px; | css |
| libs/design-system/src/styles.css:415:3 | css | stylesheet/.form-section h2 | margin: 0 0 22px; | css |
| libs/design-system/src/styles.css:418:3 | css | stylesheet/.line-item | display: grid; | css |
| libs/design-system/src/styles.css:419:3 | css | stylesheet/.line-item | grid-template-columns: 2fr 0.6fr 0.8fr 40px; | css |
| libs/design-system/src/styles.css:420:3 | css | stylesheet/.line-item | gap: 14px; | css |
| libs/design-system/src/styles.css:421:3 | css | stylesheet/.line-item | margin-bottom: 18px; | css |
| libs/design-system/src/styles.css:424:3 | css | stylesheet/.form-total | display: flex; | css |
| libs/design-system/src/styles.css:425:3 | css | stylesheet/.form-total | justify-content: flex-end; | css |
| libs/design-system/src/styles.css:426:3 | css | stylesheet/.form-total | gap: 40px; | css |
| libs/design-system/src/styles.css:427:3 | css | stylesheet/.form-total | margin-top: 28px; | css |
| libs/design-system/src/styles.css:428:3 | css | stylesheet/.form-total | padding-top: 22px; | css |
| libs/design-system/src/styles.css:429:3 | css | stylesheet/.form-total | border-top: 1px solid #edf0f5; | css |
| libs/design-system/src/styles.css:430:3 | css | stylesheet/.form-total | font-size: 18px; | css |
| libs/design-system/src/styles.css:433:3 | css | stylesheet/.detail-grid | display: grid; | css |
| libs/design-system/src/styles.css:434:3 | css | stylesheet/.detail-grid | grid-template-columns: 1fr 1fr; | css |
| libs/design-system/src/styles.css:435:3 | css | stylesheet/.detail-grid | gap: 25px; | css |
| libs/design-system/src/styles.css:436:3 | css | stylesheet/.detail-grid | margin: 22px 0; | css |
| libs/design-system/src/styles.css:439:3 | css | stylesheet/.detail-grid small | color: #8790a0; | css |
| libs/design-system/src/styles.css:440:3 | css | stylesheet/.detail-grid small | display: block; | css |
| libs/design-system/src/styles.css:441:3 | css | stylesheet/.detail-grid small | margin-bottom: 6px; | css |
| libs/design-system/src/styles.css:444:3 | css | stylesheet/.empty-state | text-align: center; | css |
| libs/design-system/src/styles.css:445:3 | css | stylesheet/.empty-state | padding: 55px 20px; | css |
| libs/design-system/src/styles.css:446:3 | css | stylesheet/.empty-state | color: #8992a4; | css |
| libs/design-system/src/styles.css:449:3 | css | stylesheet/.empty-state h3 | color: #3c465b; | css |
| libs/design-system/src/styles.css:452:3 | css | stylesheet/.customer-grid | display: grid; | css |
| libs/design-system/src/styles.css:453:3 | css | stylesheet/.customer-grid | grid-template-columns: repeat(3, 1fr); | css |
| libs/design-system/src/styles.css:454:3 | css | stylesheet/.customer-grid | gap: 20px; | css |
| libs/design-system/src/styles.css:457:3 | css | stylesheet/.customer-card | padding: 24px; | css |
| libs/design-system/src/styles.css:460:3 | css | stylesheet/.customer-card h3 | font-size: 15px; | css |
| libs/design-system/src/styles.css:463:3 | css | stylesheet/.customer-card p | font-size: 11px; | css |
| libs/design-system/src/styles.css:464:3 | css | stylesheet/.customer-card p | color: #8a93a4; | css |
| libs/design-system/src/styles.css:467:3 | css | stylesheet/.nav-scrim | position: fixed; | css |
| libs/design-system/src/styles.css:468:3 | css | stylesheet/.nav-scrim | inset: 0; | css |
| libs/design-system/src/styles.css:469:3 | css | stylesheet/.nav-scrim | border: 0; | css |
| libs/design-system/src/styles.css:470:3 | css | stylesheet/.nav-scrim | background: #0004; | css |
| libs/design-system/src/styles.css:471:3 | css | stylesheet/.nav-scrim | z-index: 25; | css |
| libs/design-system/src/styles.css:474:3 | css | stylesheet/.inline-error | color: #c25058; | css |
| libs/design-system/src/styles.css:475:3 | css | stylesheet/.inline-error | font-size: 12px; | css |
| libs/design-system/src/styles.css:478:3 | css | stylesheet/.hint | color: #8892a4; | css |
| libs/design-system/src/styles.css:479:3 | css | stylesheet/.hint | font-size: 12px; | css |
| libs/design-system/src/styles.css:482:3 | css | stylesheet/.settings-width | max-width: 850px; | css |
| libs/design-system/src/styles.css:486:5 | css | stylesheet/@media (min-width: 1600px)/main | padding-top: 45px; | css |
| libs/design-system/src/styles.css:491:5 | css | stylesheet/@media (max-width: 1100px)/.kpis | grid-template-columns: repeat(2, 1fr); | css |
| libs/design-system/src/styles.css:494:5 | css | stylesheet/@media (max-width: 1100px)/.customer-grid | grid-template-columns: repeat(2, 1fr); | css |
| libs/design-system/src/styles.css:497:5 | css | stylesheet/@media (max-width: 1100px)/.header-search | display: none; | css |
| libs/design-system/src/styles.css:502:5 | css | stylesheet/@media (max-width: 900px)/.app-main | margin-left: 0; | css |
| libs/design-system/src/styles.css:505:5 | css | stylesheet/@media (max-width: 900px)/.mobile-menu.MuiIconButton-root | display: inline-flex; | css |
| libs/design-system/src/styles.css:508:5 | css | stylesheet/@media (max-width: 900px)/main | padding: 24px 18px; | css |
| libs/design-system/src/styles.css:511:5 | css | stylesheet/@media (max-width: 900px)/.header | padding: 0 18px; | css |
| libs/design-system/src/styles.css:514:5 | css | stylesheet/@media (max-width: 900px)/.charts | grid-template-columns: 1fr; | css |
| libs/design-system/src/styles.css:517:5 | css | stylesheet/@media (max-width: 900px)/.page-heading | align-items: flex-start; | css |
| libs/design-system/src/styles.css:520:5 | css | stylesheet/@media (max-width: 900px)/.heading-actions | flex-wrap: wrap; | css |
| libs/design-system/src/styles.css:528:5 | css | stylesheet/@media (max-width: 600px)/.kpis,   .form-grid,   .customer-grid,   .detail-grid | grid-template-columns: 1fr; | css |
| libs/design-system/src/styles.css:531:5 | css | stylesheet/@media (max-width: 600px)/.page-heading | flex-direction: column; | css |
| libs/design-system/src/styles.css:534:5 | css | stylesheet/@media (max-width: 600px)/.line-item | grid-template-columns: 1fr 1fr; | css |
| libs/design-system/src/styles.css:537:5 | css | stylesheet/@media (max-width: 600px)/.line-item &gt; :first-child | grid-column: 1/-1; | css |
| libs/design-system/src/styles.css:540:5 | css | stylesheet/@media (max-width: 600px)/.toolbar | flex-wrap: wrap; | css |
| libs/design-system/src/styles.css:543:5 | css | stylesheet/@media (max-width: 600px)/.header-tools &gt; svg | display: none; | css |
| libs/design-system/src/styles.css:546:5 | css | stylesheet/@media (max-width: 600px)/footer | padding: 24px 18px; | css |
| libs/design-system/src/styles.css:549:5 | css | stylesheet/@media (max-width: 600px)/.kpi-value | font-size: 24px; | css |
| libs/design-system/src/styles.css:558:5 | css | stylesheet/@media print/aside,   .header,   footer,   .heading-actions,   .page-heading &gt; .MuiButton-root | display: none !important; | css |
| libs/design-system/src/styles.css:561:5 | css | stylesheet/@media print/.app-main | margin-left: 0; | css |
| libs/design-system/src/styles.css:564:5 | css | stylesheet/@media print/body | background: #fff; | css |
| libs/design-system/src/styles.css:567:5 | css | stylesheet/@media print/main | padding: 0; | css |
| libs/design-system/src/styles.css:570:5 | css | stylesheet/@media print/.card | break-inside: avoid; | css |
| libs/design-system/src/styles.css:573:5 | css | stylesheet/@media print/.charts | grid-template-columns: 1.9fr 1fr; | css |
| libs/shared/src/demo.css:3:3 | css | stylesheet/.atlas-demo-controls | position: sticky; | css |
| libs/shared/src/demo.css:4:3 | css | stylesheet/.atlas-demo-controls | top: 0; | css |
| libs/shared/src/demo.css:5:3 | css | stylesheet/.atlas-demo-controls | z-index: 25; | css |
| libs/shared/src/demo.css:6:3 | css | stylesheet/.atlas-demo-controls | display: flex; | css |
| libs/shared/src/demo.css:7:3 | css | stylesheet/.atlas-demo-controls | flex-wrap: wrap; | css |
| libs/shared/src/demo.css:8:3 | css | stylesheet/.atlas-demo-controls | align-items: center; | css |
| libs/shared/src/demo.css:9:3 | css | stylesheet/.atlas-demo-controls | justify-content: space-between; | css |
| libs/shared/src/demo.css:10:3 | css | stylesheet/.atlas-demo-controls | gap: 8px; | css |
| libs/shared/src/demo.css:11:3 | css | stylesheet/.atlas-demo-controls | padding: 10px 16px; | css |
| libs/shared/src/demo.css:12:3 | css | stylesheet/.atlas-demo-controls | background: #fff3d4; | css |
| libs/shared/src/demo.css:13:3 | css | stylesheet/.atlas-demo-controls | color: #594110; | css |
| libs/shared/src/demo.css:14:3 | css | stylesheet/.atlas-demo-controls | border-bottom: 1px solid #d5b665; | css |
| libs/shared/src/demo.css:15:3 | css | stylesheet/.atlas-demo-controls | font-size: 12px; | css |
| libs/shared/src/demo.css:17:30 | css | stylesheet/.atlas-demo-controls label | white-space: nowrap; | css |
| libs/shared/src/demo.css:18:31 | css | stylesheet/.atlas-demo-controls select | font: inherit; | css |
| libs/shared/src/demo.css:18:46 | css | stylesheet/.atlas-demo-controls select | padding: 4px; | css |
