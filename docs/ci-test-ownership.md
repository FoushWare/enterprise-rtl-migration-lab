# CI test ownership and coverage mapping (v0.6.3)

Each required test has one CI owner. Suites that need the wrapper runtime (DashboardSession, the served review dashboard,
the companion-authorized preview) are owned by the wrapper CI job `e2e-overlay`, not silently excluded. The implementation
CI runs what this repository can execute on its own build.

## Implementation CI (`.github/workflows/ci.yml`, this repository)

| Check | Command | Covers |
|---|---|---|
| lint | `npm run lint:ratchet` | ESLint with the unchanged rules; fails on any violation not in `scripts/lint-baseline.json` (331 inherited, see the technical-debt issue) |
| typecheck | `npm run typecheck` | all TypeScript |
| build | `npm run build` | standalone build (`dist/`) |
| unit | `npm test` | unit tests |
| E2E native | `npm run test:e2e:native` (`playwright.native.config.ts`) | `tests/e2e/security-negative.spec.ts`: companion authorization, guards, invalid operations, path and symlink refusal |
| lifecycle | `node --test tests/e2e/workflow-lifecycle.e2e.mjs` | workflow lifecycle through the companion |
| equivalence | `node tests/e2e/runtime-reuse-equivalence.mjs` | runtime reuse equivalence |

## Wrapper CI (`.github/workflows/ci.yml`, rtl-analyzer wrapper)

| Job | Suites | Covers |
|---|---|---|
| `ci` (ubuntu, windows) | `rtl:scan:test`, `rtl:overlay:test` (incl. `security-hardening.test.ts`), `rtl:cli:package:smoke` | overlay unit and security tests, companion-auth mirror, packaged consumer smoke |
| `e2e-overlay` (ubuntu) | `npm run test:e2e:regression` (provenance build and verification first): `apply-rollback-disposable`, `phase5-progress`, `restart-infrastructure`, `stale-lifecycle`, `failed-lifecycle` | Apply, Rollback (SHA-256 exact restoration), automatic rescan, progress, restart recovery, stale and failed lifecycle |
| `e2e-overlay` | `workflow-approved-stale`, `workflow-failed-lifecycle`, `workflow-stale-lifecycle` (workflow-lifecycle config) | approval and stale-state gates |
| `e2e-overlay` | `implementation/tests/e2e/run-review-workflows.mjs` (default `review-workflows-complete.spec.ts`) | Review One-by-One and Apply First through the served dashboard, original and candidate preview, LTR/RTL validation, approval and confirmation, Apply, Rollback after reload, rollback conflict refusal, restart recovery, End Review |
| `e2e-overlay` | `RTL_REVIEW_SPECS=tests/e2e/api-companion-lifecycle.spec.ts node implementation/tests/e2e/run-review-workflows.mjs` | companion API: authorization, Origin and approval gates, unbound finding has no automatic preview, preview contracts |

## Not required by any CI job

These files remain in the repository as diagnostics or earlier-release fixtures. The former `e2e-default-debt` job ran them
through `playwright test` with no environment and was red. It has been removed; nothing in CI claims them. Each needs its own
owner before it counts as release coverage.

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

Their helpers and runners (`*.mjs`, `*.ts` fixtures) are used by the owned suites above or by these diagnostics.

## Verification that moved suites execute

Playwright exits 0 when a path filter matches no file, so a green step alone does not prove a suite ran. The wrapper job prints each step's pass counts in its log; a suite with zero passes is a coverage gap. Check the `e2e-overlay` log for a non-zero pass count per listed command.
