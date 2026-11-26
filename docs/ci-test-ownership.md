# CI test ownership and coverage mapping (v0.6.3)

The implementation repository is the canonical source for every review and workflow E2E suite. The wrapper keeps the
packaging, overlay, and provenance checks, and it runs the canonical implementation suites against the provenance-verified
wrapper runtime. There are no independently maintained duplicate E2E specs.

Every E2E step runs through `scripts/e2e-required.mjs`. It fails unless the step discovers and executes at least one test
with no failures and no flaky results, so a path filter that matches nothing cannot produce a false green.

## Commands and what they execute

| Owner | Command | Suites executed (expected count at this revision) |
|---|---|---|
| implementation CI `lint` | `npm run lint:ratchet` | ESLint against the baseline; no new violations |
| implementation CI `verify` | `npm run typecheck`, `npm run build`, `npm test` | typecheck, build, unit tests |
| implementation CI `verify` | `npm run test:e2e:native` | `tests/e2e/security-negative.spec.ts` (19): authorization negatives (401, 403), guards, path and symlink refusal, stale source hash |
| implementation CI `verify` | `npm run test:e2e:lifecycle-node` | `tests/e2e/workflow-lifecycle.e2e.mjs` (3): prepare, accept, validate, apply, restart, rollback; a stale validated change is refused before and after restart; rollback is refused after a later edit |
| implementation CI `verify` | `node tests/e2e/runtime-reuse-equivalence.mjs` | runtime reuse equivalence with authorized companion calls |
| wrapper CI `e2e-overlay` (ubuntu) | `npm run test:e2e:regression` (root; runs the provenance build and verification, then `npm --prefix implementation run test:e2e:regression`) | `apply-rollback-disposable.spec.ts` (2): one-by-one Apply and Rollback with exact SHA-256 restoration; validation persists through reload without changing the original source. `phase5-progress.spec.ts` (2): progress after rescan and after reload. `manual-regression` (20): `security-negative.spec.ts` (19) and `restart-infrastructure.spec.ts` (1, owned companion reconnects) |
| wrapper CI `e2e-overlay` | `npm run test:e2e:workflow-lifecycle` (root; delegates to implementation) | `workflow-approved-stale.spec.ts` (1), `workflow-failed-lifecycle.spec.ts` (1), `workflow-stale-lifecycle.spec.ts` (1) |
| wrapper CI `e2e-overlay` | `npm run test:e2e:lifecycle-node` (root; delegates to implementation) | `workflow-lifecycle.e2e.mjs` (3) |
| wrapper CI `e2e-overlay` | `node tests/e2e/run-review-workflows.mjs` in `implementation/` (default `review-workflows-complete.spec.ts`) | Review One-by-One and Apply First through the served dashboard: approval, validation, Apply, rollback after reload, conflict refusal, restart recovery, End Review |
| wrapper CI `e2e-overlay` | `RTL_REVIEW_SPECS=tests/e2e/api-companion-lifecycle.spec.ts node tests/e2e/run-review-workflows.mjs` in `implementation/` | companion API lifecycle (9): authorization, Origin and approval gates, unbound finding without automatic preview, preview contracts |
| wrapper CI `ci` (ubuntu, windows) | `npm run rtl:overlay:test`, `npm run rtl:cli:package:smoke`, `npm run rtl:scan:test` | overlay unit and security tests (27 in `security-hardening.test.ts`), packaged consumer smoke |

## Retired wrapper duplicates and where their coverage now lives

The wrapper's independently maintained copies were removed after each unique assertion was ported or mapped.

- `apply-rollback-disposable` "persists through reload" used the legacy Codemod panel. It is ported to the canonical
  suite as a workflow test: the recorded validation survives a reload and the original source is unchanged.
- `phase5-progress` "recovers ... after companion restart" read the same progress after a reload, which the canonical
  "recovers ... after a reload of the dashboard" covers. It did not restart the companion, so there is no restart coverage lost.
- `restart-infrastructure` "same records survive an owned companion restart" used the legacy Codemod panel and the legacy
  records endpoints. Its workflow equivalents are the lifecycle restart in `workflow-lifecycle.e2e.mjs` (receipts, history
  and the stale refusal survive a restart) and the restart step in `review-workflows-complete.spec.ts`. The legacy record
  endpoints are still served but are not part of the supported workflow.
- `security-negative` "approved stale source rejects authoritative apply" used the legacy panel. It is covered by
  `workflow-stale-lifecycle.spec.ts` (a stale validated change is blocked on reload and cannot be applied) and by
  `workflow-lifecycle.e2e.mjs` (refused before and after a restart).
- `failed-lifecycle` "persisted rollback conflict projects Failed" is covered by `workflow-failed-lifecycle.spec.ts` and by
  the lifecycle test that refuses rollback after a later source edit.
- `stale-lifecycle` "survives reload and restart" is covered by `workflow-stale-lifecycle.spec.ts` (reload) and by the
  lifecycle test's restart step (restart).
- `portable-fixture.mjs` and `phase5-fixture.mjs`: the implementation copies are canonical.

## Not required by any CI job

These files remain in `tests/e2e` as diagnostics or superseded fixtures. No CI job claims them. The former
`e2e-default-debt` job ran them through a bare `playwright test` and was red, so it is removed. Each needs an owner before
it counts as release coverage.

`automatic-after*.spec.ts`, `batch-theme-review.spec.ts`, `brand-direction.spec.ts`, `chart-direction.spec.ts`,
`contextual-review-preview.spec.ts`, `cross-file-review.spec.ts`, `css-spacing-workflows.spec.ts`,
`dashboard-usability.spec.ts`, `demo.spec.ts`, `directional-expansion-workflows.spec.ts`, `embedded-review-preview.spec.ts`,
`forms-dialogs-tables.spec.ts`, `fullscreen-review-preview.spec.ts`, `guided-operation-flow.spec.ts`,
`independent-expansion.spec.ts`, `independent-onboarding.spec.ts`, `invoice-navigation-arrow.spec.ts`,
`kpi-direction.spec.ts`, `manual-review-after-pane.spec.ts`, `phase13-*.spec.ts`, `phase14-review-state.spec.ts`,
`phase22-navigation.spec.ts`, `phase3-manual.spec.ts`, `phase31-responsive.spec.ts`, `phase32-accessibility.spec.ts`,
`phase4-rescan.spec.ts`, `phase6-full-journey.spec.ts`, `post-apply-context.spec.ts`, `preview-binding.spec.ts`,
`preview-status.spec.ts`, `preview-ui-reproduce.spec.ts`, `preview-ui-state.spec.ts`, `review-mode-entry.spec.ts`,
`review-one-by-one-analysis.spec.ts`, `review-one-by-one-preview.spec.ts`, `review-ui-refinement.spec.ts`,
`review-workspace.spec.ts`, `rollback-review-resumption.spec.ts`, `sidebar-navigation-arrow.spec.ts`, `baseline.spec.ts`.
