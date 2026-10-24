# Repository readability and documentation review

Status: **Local review draft. No push, PR, or merge performed for this change.**

## Scope and learning order

The baseline is `b127325a14ad3bf8e70aede2a2e29b9dae638355`.
The isolated branch is `codex/repository-readability-docs`.

1. **Applications:** follow each entry point through router, locale provider, shared styling provider, route state, list/detail views, form validation, persistence, and navigation. English JSDoc describes the important components and business-data boundaries.
2. **Libraries:** read the invoice/order fixtures and `total`/`money`/mock API helpers, locale opt-in rules, query-preserving links, shared UI components, then module-scoped Emotion caches and MUI direction ownership. Stored data, formatter locale, provider identities, and plugin order are unchanged.
3. **Tools:** expanded scanner types and control flow show discovery, extraction, uncertainty, policy audit, conservative findings, and report serialization. Codemod documentation explains explicit selection, provenance, exact property edits, external journals, refusal on concurrent changes, and recovery limitations.
4. **Tests/configuration:** readable assertions and comments explain the fixed browser environment, zero-pixel visual threshold, protection verification, and development/production separation. Existing JSON configuration and CSS already laid out readably are not rewritten merely for churn. Fixture source strings, historical generated documentation, images, and archived reports remain reference evidence.

There are no application logic, route, public API, policy scope, scanner rule, transformation, or feature changes. The Terminal Summary Feature is not implemented in this scope.

## Evidence and semantic equivalence

| Measure | Before | After |
| --- | ---: | ---: |
| Evidence | 440 | 440 |
| Findings | 42 | 42 |
| Actionable findings | 39 | 39 |
| Diagnostics | 9 | 9 |
| Blocking diagnostics | 0 | 0 |
| Complete scan | true | true |
| Automatic candidates / approvals | 0 / 0 | 0 / 0 |
| Evidence IDs changed | — | 0 |
| Finding IDs changed | — | 0 |

Categories remain INFORMATIONAL=1, INTENTIONAL_LTR=2, MANUAL_REVIEW=36, RUNTIME_CONFIG=3. Severity remains Info=3, Major=1, Minor=38. Confidence remains High=17, Medium=25. Per-rule counts, every other finding field, references, diagnostic meanings, and policy decisions are checked exactly by the verifier.

`comparison.json` records all 120 metadata-changed records: 80 evidence ranges, 31 finding records, and nine diagnostic ranges. Two finding JSX excerpts have formatting-only spelling changes. Every evidence excerpt and diagnostic expression remains byte-identical; related source spans are checked against their original text. All locations are checked against the associated source text rather than simply omitted from comparison.

`scanner-before.json` and `scanner-after.json` are new review artifacts. Neither replaces an archived report. Input digests are recomputed from the exact sorted source inventory. Policy digests are recomputed from policy JSON.

## Reviewed source-pin migration

Only `sourceDigest` changes in three existing dynamic exceptions: two Dashboard background expressions and one StatusBadge background expression. Their paths, properties, expression hashes, reasons, ownership, and review scope are unchanged. Each expression matches exactly one old evidence anchor and remains byte-identical in the new report.

Only two protected source hashes are refreshed: Dashboard and the design-system entry file. Their mirrored dynamic-exception source hashes are refreshed in the protection manifest. All other manifest fields, document exceptions, issue bindings, approvals, and expression digests remain exact. The original reference commit is retained as historical provenance. No additional automatic edit becomes eligible.

The two scanner test files with explicit current-source coordinates retain exact range/ID/excerpt assertions. Only expected positions, two formatted structural excerpts, and the policy digest migrate. Historical semantic assertions remain; protected historical files are not edited.

## Validation

- Baseline: nine app/shared tests, 186 scanner tests, and 24 codemod tests passed before editing.
- Final: the same 219 tests pass; application/scanner typechecks, lint, build, protection verification, semantic comparison, and diff checks pass.
- Browser: 108 development and 108 production assertions passed using Chrome 155.0.8059.85. Six English visual baselines passed in each suite at zero-pixel tolerance. No screenshots were updated.
- The existing server on 4200 belongs to another worktree. A temporary harness serves this worktree on 4300/4301, preserves browser-visible origins through request routing, and copies tests/snapshots. It changes no assertions. The KPI test's own CSS route also needs its fetch redirected; the first harness attempt failed seven KPI cases until that harness issue was corrected. The subsequent complete suites pass.
- Formatting/comment edits are checked against canonical TypeScript-emitted JavaScript. esbuild normalizes irrelevant layout/quote spelling. This supports the runtime-preservation conclusion alongside tests; it is not a formal proof of every possible runtime interaction.
- The locale JSX banner and two already formatted test files retain their original layout where a stricter emitted-output comparison detected JSX text-node segmentation. Embedded-language formatting is disabled. No local OS preferences are written.
- Prettier 3.6.2 was installed only into an external temporary tooling directory. Repository package manifests and lockfiles are unchanged.

## Reproduce checks

Use an environment with the project's existing dependencies and browser installed:

```sh
npm run rtl:scan:build
npm run typecheck
npm run rtl:scan:typecheck
npm run lint
npm run test
npm run rtl:scan:test
npm run rtl:codemod:test
npm run build
node scripts/verify-rtl-protections.mjs
node docs/readability/verify-equivalence.mjs
node docs/readability/run-browser-checks.mjs development
node docs/readability/run-browser-checks.mjs production
git diff --check
```

The comparison script reads sources at the recorded baseline commit, executes the current scanner, and verifies the stored after report. Scanner tests formatted after the metadata commit compare their executable test code against that commit: their source-coordinate expectations intentionally differ from the initial baseline. No comparison script migrates pins or rewrites evidence. The optional browser harness retains its temporary result directory for inspection and refuses snapshot-update arguments.

## Commit boundaries and review

- `e7b62e8`: formatting and English educational comments across applications, libraries, tooling, and relevant configuration/tests.
- `317996b`: source metadata, protection source fingerprints, and exact current-source test expectations only.
- A separate review-evidence/test-formatting commit contains this report, verifier, before/after artifacts, and formatting of the remaining scanner tests. It adds no product feature.

The formatting commit alone intentionally has stale source pins; review it with the separate metadata migration. The combined result is validated. Do not merge an intermediate commit as a standalone change.

Review the complete diff before any publication/merge decision. No automatic merge is authorized. Original workspaces, their pre-existing changes, historical reports, screenshots, and snapshots are preserved.

## Rollback

For an unmerged local branch, retain the base and leave or archive this isolated worktree after review. Do not reset the original checkouts. If later published/merged with approval, revert the readability, metadata, and evidence commits together in reverse order; reverting only formatting or only pins would invalidate source fingerprints. Run protection, scanner, unit, and browser checks again. No business-data migration is needed.

## Complete changed-file inventory

- `apps/invoicing/src/App.tsx`
- `apps/invoicing/src/components/InvoiceTable.tsx`
- `apps/invoicing/src/components/InvoiceUi.tsx`
- `apps/invoicing/src/main.tsx`
- `apps/invoicing/src/pages/CreateInvoice.tsx`
- `apps/invoicing/src/pages/Customers.tsx`
- `apps/invoicing/src/pages/Dashboard.tsx`
- `apps/invoicing/src/pages/InvoiceDetails.tsx`
- `apps/invoicing/src/pages/Invoices.tsx`
- `apps/invoicing/src/pages/Settings.tsx`
- `apps/procurement/src/App.tsx`
- `apps/procurement/src/main.tsx`
- `docs/autonomous/protected-evidence.json`
- `docs/readability/README.md`
- `docs/readability/comparison.json`
- `docs/readability/format-equivalence.json`
- `docs/readability/run-browser-checks.mjs`
- `docs/readability/scanner-after.json`
- `docs/readability/scanner-before.json`
- `docs/readability/source-pin-migration.json`
- `docs/readability/validation.json`
- `docs/readability/verify-equivalence.mjs`
- `eslint.config.mjs`
- `libs/design-system/src/index.tsx`
- `libs/design-system/src/runtime.tsx`
- `libs/shared/src/i18n.tsx`
- `libs/shared/src/index.ts`
- `libs/shared/src/translations.ts`
- `playwright.config.ts`
- `playwright.production.config.ts`
- `rtl-scanner.config.json`
- `scripts/capture-phase2a.mjs`
- `scripts/verify-rtl-protections.mjs`
- `tests/e2e/bidi-boundaries.spec.ts`
- `tests/e2e/brand-direction.spec.ts`
- `tests/e2e/chart-direction.spec.ts`
- `tests/e2e/dashboard-navigation-arrow.spec.ts`
- `tests/e2e/demo.spec.ts`
- `tests/e2e/forms-dialogs-tables.spec.ts`
- `tests/e2e/kpi-direction.spec.ts`
- `tests/e2e/sidebar-navigation-arrow.spec.ts`
- `tools/rtl-codemod/cli.mjs`
- `tools/rtl-codemod/codemod.mjs`
- `tools/rtl-codemod/codemod.test.mjs`
- `tools/rtl-codemod/vitest.config.ts`
- `tools/rtl-scanner/src/cli.ts`
- `tools/rtl-scanner/src/coverage.ts`
- `tools/rtl-scanner/src/css.ts`
- `tools/rtl-scanner/src/html.ts`
- `tools/rtl-scanner/src/model.ts`
- `tools/rtl-scanner/src/policy-audit.ts`
- `tools/rtl-scanner/src/policy-validation.ts`
- `tools/rtl-scanner/src/policy.ts`
- `tools/rtl-scanner/src/report.ts`
- `tools/rtl-scanner/src/rules.ts`
- `tools/rtl-scanner/src/runtime-direction.ts`
- `tools/rtl-scanner/src/scan.ts`
- `tools/rtl-scanner/src/typescript.ts`
- `tools/rtl-scanner/tests/detection.test.ts`
- `tools/rtl-scanner/tests/foundation.test.ts`
- `tools/rtl-scanner/tests/integration.test.ts`
- `tools/rtl-scanner/tests/policy.test.ts`
- `tools/rtl-scanner/tests/runtime-direction.test.ts`
- `tools/rtl-scanner/vitest.config.ts`
- `vitest.config.ts`
