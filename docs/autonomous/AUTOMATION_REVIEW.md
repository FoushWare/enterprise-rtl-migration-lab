# Current automation inventory

Measured after semantic remediation: 440 facts, 42 findings, 39 actionable, complete=true, nine nonblocking diagnostics and no policy warnings. There are zero automation candidates and zero approvals. No production codemod was applied.

| Finding | Owner/source | Category | Review disposition |
| --- | --- | --- | --- |
| RTL.DOCUMENT.INITIAL:3321a4fa4f1dd561e3b7fee5 | `apps/invoicing/index.html` / html | INTENTIONAL_LTR | Preserve approved default English markup; evaluate runtime direction separately. |
| RTL.BIDI.ISOLATION:741d2ce2aec3a86cf2db37ea | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:ee65b3a5436494c134055362 | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:c37e1290384b5b026d3550c4 | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:af648a829cee9b32c0bd2fb8 | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.ICON.PROGRESSION:237172da962fe4d0605ddd83 | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable/ArrowBack | MANUAL_REVIEW | Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring. |
| RTL.ICON.PROGRESSION:07d33024c457dfcdc175bd85 | `apps/invoicing/src/components/InvoiceTable.tsx` / InvoiceTable/ArrowForward | MANUAL_REVIEW | Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring. |
| RTL.BIDI.ISOLATION:20d0455279e243edca7d306d | `apps/invoicing/src/pages/CreateInvoice.tsx` / CreateInvoice | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.CHART.LABEL_FLOW:caa8a6652446209dc2fc98cf | `apps/invoicing/src/pages/Dashboard.tsx` / Dashboard/svg | MANUAL_REVIEW | Review chronology, axis gutters, labels/data correspondence and accessible description together. |
| RTL.CSS.PHYSICAL:adebba7d3ad0dda9b7b8d423 | `apps/invoicing/src/pages/Dashboard.tsx` / Dashboard/span | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.ICON.LITERAL:aa0a8bc3f6ca19eae5b56a82 | `apps/invoicing/src/pages/Dashboard.tsx` / Dashboard | MANUAL_REVIEW | Review copy and navigation semantics rather than replacing every arrow. |
| RTL.BIDI.ISOLATION:9f05797020b15bb1031f12fe | `apps/invoicing/src/pages/InvoiceDetails.tsx` / InvoiceDetails | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:13dfdcf2817c6da7fa0b7930 | `apps/invoicing/src/pages/InvoiceDetails.tsx` / InvoiceDetails | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:31882b621bb69ff054bca7a7 | `apps/invoicing/src/pages/InvoiceDetails.tsx` / InvoiceDetails | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:e7869ece999321c7e9e1d86e | `apps/invoicing/src/pages/InvoiceDetails.tsx` / InvoiceDetails | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.CSS.PHYSICAL:01b8d7fcb0e0dd788a73af31 | `apps/invoicing/src/pages/Invoices.tsx` / Invoices/span | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.RUNTIME.PAGINATION:c2bdfb11861582e5c386e851 | `apps/invoicing/src/pages/Invoices.tsx` / Invoices/Pagination | RUNTIME_CONFIG | Verify synchronized theme/cache/document setup before adding custom icon swaps. |
| RTL.DOCUMENT.INITIAL:e0c891dfa8af31d4d67bfd56 | `apps/procurement/index.html` / html | INTENTIONAL_LTR | Preserve approved default English markup; evaluate runtime direction separately. |
| RTL.BIDI.ISOLATION:862b107afb21edf9840ac703 | `apps/procurement/src/App.tsx` / Orders | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:95f0d5216f0155c798f82986 | `apps/procurement/src/App.tsx` / Orders | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:3267dc7e6b7ff0e147b62518 | `apps/procurement/src/App.tsx` / Details | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.BIDI.ISOLATION:0ae599d0017719ece2087ae9 | `apps/procurement/src/App.tsx` / Details | MANUAL_REVIEW | Review opposite-direction token isolation or auto-direction for human text; preserve canonical storage and copying. |
| RTL.FORM.DIRECTION:c3038155faae0e23f50372db | `libs/design-system/src/index.tsx` / FormField/TextField | RUNTIME_CONFIG | Verify document/theme/cache coordination and native input behavior; do not patch vendor geometry. |
| RTL.GEOMETRY.EDGE:4a19b0ffbf510d5d3715c64c | `libs/design-system/src/index.tsx` / Modal/IconButton | MANUAL_REVIEW | Review anchor, companion gutter, breakpoints and collision clearance as one layout contract. |
| RTL.TABLE.ALIGNMENT:9e76dea095ca377d5e42c677 | `libs/design-system/src/index.tsx` / DataTable/TableCell | MANUAL_REVIEW | Review text, numeric and token alignment with runtime configuration; absence of align alone is not a bug. |
| RTL.TABLE.ALIGNMENT:11f232d9438044cfba290f21 | `libs/design-system/src/index.tsx` / DataTable/TableCell | MANUAL_REVIEW | Review text, numeric and token alignment with runtime configuration; absence of align alone is not a bug. |
| RTL.GEOMETRY.ORDER:0b23a5f6f4bc3966eb9e0efc | `libs/design-system/src/index.tsx` / SidebarFrame/@media (max-width: 900px) | MANUAL_REVIEW | Review spatial intent, focus order and companion positioning; no numeric sign reversal. |
| RTL.GEOMETRY.ORDER:1226abd54e967deed14a4a6c | `libs/design-system/src/index.tsx` / SidebarFrame/@media (max-width: 900px)/html[dir="rtl"] &:not(.is-open) | MANUAL_REVIEW | Review spatial intent, focus order and companion positioning; no numeric sign reversal. |
| RTL.BRAND.ISLAND:b2139ad57eaf0ae87a66743e | `libs/design-system/src/index.tsx` / Sidebar/a | MANUAL_REVIEW | Preserve the approved wordmark composition as a reviewed island; do not mirror glyphs. |
| RTL.ICON.PROGRESSION:f4c175932dd9a0c9123c55f5 | `libs/design-system/src/index.tsx` / Sidebar/ArrowForward | MANUAL_REVIEW | Distinguish progression from trends/external-link conventions; coordinate MUI-owned roles before mirroring. |
| RTL.CSS.PHYSICAL:a82eeae5e376b962d817b8b2 | `libs/design-system/src/index.tsx` / Sidebar/ArrowForward | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.DOCUMENT.RUNTIME:1f3bd0fab5211f473ef82db4 | `libs/design-system/src/runtime.tsx` / Provider | INFORMATIONAL | Verify portal computed direction independently; do not report a wrapper-only portal failure. |
| RTL.CSS.PHYSICAL:21623aff840f0d576f06f522 | `libs/design-system/src/styles.css` / stylesheet/.brand | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:ecf95e3ab5ee9d97e51b7b4d | `libs/design-system/src/styles.css` / stylesheet/.brand-mark | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:190bcc5a6e2552cc91cd610b | `libs/design-system/src/styles.css` / stylesheet/.workspace > span | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:0dfdf26ee014cb3b23ca8b7f | `libs/design-system/src/styles.css` / stylesheet/.header-divider | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:a750b772938d00bc32351bff | `libs/design-system/src/styles.css` / stylesheet/.header-divider | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:b25c21f026c69d421df65fa6 | `libs/design-system/src/styles.css` / stylesheet/.kpi-note b | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:82212e990854fbb975d34448 | `libs/design-system/src/styles.css` / stylesheet/.chart-labels | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:0031e17b6a889ff32cbf3adc | `libs/design-system/src/styles.css` / stylesheet/html[dir="rtl"] .MuiDialogTitle-root | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.CSS.PHYSICAL:5a0239345a9e743d6571ae0d | `libs/design-system/src/styles.css` / stylesheet/html[dir="rtl"] .kpi-value | MANUAL_REVIEW | Review semantics, writing mode, cascade and owner before any conversion. |
| RTL.RUNTIME.LOCALE:9356c0da9bea9ff5056b08b3 | `libs/shared/src/index.ts` / money | RUNTIME_CONFIG | Approve locale display policy separately from canonical currency/date values and bidi isolation. |

Static findings are risk evidence, not a defect count. The unresolved diagnostics remain visible; full browser coverage cannot prove every future content/hosting state. Physical chart axis and right-aligned RTL text are intentional measured behavior. No finding was invented or suppressed for automation.

## Verified boundaries

Custom bidi fixes add explicit grouping for canonical en-US financial display and known customer tokens. Input caret policy and formatting are unchanged. The four retired RTL-08 bindings matched removed unisolated JSX source expressions; their historical issue definitions/severities remain in Phase 2A evidence. Two alignment declarations remain manual findings. Dashboard direction is resolved through the existing Arabic translation, preserving pinned source bytes.
