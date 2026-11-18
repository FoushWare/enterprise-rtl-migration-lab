# Scene 03 — Review with ChatGPT

Draft — Pending Review. Discovery date 2026-10-27. No recording or implementation approved by this document.

## Context to preserve

Study: enterprise-rtl-migration-lab-study, branch study/unmigrated-rtl-ui, HEAD 910133cc332af96268d19fc6563608434b2c321c plus pre-existing local historical UI restoration. Local migrated-reference tag peels to that HEAD. The directory named latest is actually at 6f0d1c6 on rtl-migration-study, not this final reference. No source files, policies, tests, baselines or historical evidence were edited during discovery.

## Top 10 verified findings

1. Nx discovers five projects; apps are Invoicing and Procurement, libraries design-system/shared, plus rtl-scanner.
2. Both apps consume shared presentation and business/locale code, verified through imports.
3. Actual exported Nx graph currently has empty dependency arrays; do not invent graph edges.
4. Startup scripts target inferred Vite tasks; strict local ports are 4200 and 4201, both returned HTTP 200 now.
5. Study root order is StrictMode → LTR Provider → BrowserRouter → LocaleProvider → App.
6. Locale comes from demo/lang query parameters; selector navigation updates URL, document lang/dir and translated labels.
7. Study keeps MUI LTR with no active migrated RTL cache, despite document RTL. Reference HEAD has stable direction-specific caches/themes.
8. Invoicing App owns invoices hydrated from localStorage or 24 fixtures. INV-2026-1048 joins c1, Pending, USD, total 4800 → $4,800.00.
9. Procurement uses nine read-only fixtures; status filtering and detail route reuse total/money/DataTable. No create-order business flow is implemented.
10. Current protections fail closed: 427 evidence,58 findings,10 diagnostics,4 blocking,zero AUTO_CANDIDATE; Codemod dry-run refuses incomplete report.

## Top 5 risks

- Document/theme/cache direction mismatch affects multiple MUI components.
- Shared physical layout, icon directions and table defaults affect both apps; English/mobile regressions are possible.
- Fixed chart geometry with flow-sensitive month labels can misrepresent chronology.
- Mixed Latin/Arabic data, brand composition and popup close/title geometry need semantic review, not universal mirroring.
- Historical source pins intentionally do not match restored Study UI; silently refreshing them would obscure the safety boundary.

## Actual fresh verification

Lint, typecheck and scanner build: pass. Root tests: 6 pass,3 fail of9 (migrated runtime expectations). Scanner tests:189 pass,6 fail of195 (live inventory/policy/summary/exit expectations against incomplete Study). Protection: fails on design-system/index.tsx. Scanner summary/JSON: exit2 INCOMPLETE. Codemod dry-run: exit2 refusal. Full E2E/app build not rerun. Node24.6.0 differs from CI Node22. Existing browser accessibility tree confirms the real Arabic dashboard and invoice, not exhaustive visual correctness.

Stale dynamic exception at rtl-scanner.config.json:121 causes fail-closed policy handling; three dynamic background diagnostics also become blocking. That is analysis uncertainty, not proof of new runtime background defects. No failure was hidden or “fixed.”

## Important architecture decisions

Keep business records canonical; localize presentation and direction separately. Keep total/money contracts unchanged. Runtime owns generated styling direction; legacy CSS and deliberate LTR islands need separate treatment. Share UI deliberately and verify both consumers. Static findings are risks, not confirmed bugs or automation approvals. Existing protection and zero-diff visual baselines remain intact.

## Unresolved questions

Why does Nx graph omit source import edges? Which reviewed process should make a future Study assessment meaningful without rewriting historical policy/source pins? Which browser/origin/storage state will be used for the next recording? What precise runtime acceptance scope is approved before implementation? Full current E2E and production behavior remain unverified in this task.

## Recommendation and soundness

The controlled historical-UI/latest-tools approach is sound for learning, with explicit failing gates and a preserved reference. It is not currently an accepted migrated build. Next: review one story around INV-2026-1048 and the locale/runtime boundary, then approve the Scene 03 script. Do not start fixing UI, changing pins or filming yet. Read the full report for per-risk confidence, file/line anchors and command receipts. Prior Scene02 evidence supports some risks; it does not replace fresh verification of every route or viewport.
