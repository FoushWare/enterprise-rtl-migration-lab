# Testing strategy

## Layers

- `npm run lint`: ESLint TypeScript recommended rules across apps, libraries, tests and configs.
- `npm run typecheck`: strict TypeScript checks for both applications and shared libraries.
- `npm run build`: Nx inferred Vite production builds for both applications.
- `npm test`: Vitest + jsdom verifies button callbacks, status/empty-state rendering, modal close behavior, calculation and mock API persistence/duplicate rejection.
- `npm run test:e2e`: Playwright Chromium launches both Vite apps and checks routes, tables, search/filter/pagination, customer modal, settings save, invoice validation/confirmation/persistence, procurement navigation and responsive navigation.
- `npm run test:visual`: English LTR screenshots for overview, invoice list, invoice form, customers, settings and procurement.

Functional tests use isolated browser contexts, so mutations cannot pollute other tests. Screenshot tests use fixed fixtures, 1440×1000 viewport, UTC timezone, en-US locale, light color scheme and disabled animations. The responsive test checks 390×844 and ensures the overall document has no horizontal overflow (table content may scroll within its container).

## Approving visual baselines

1. Install browser binaries using `npx playwright install chromium --no-shell`.
2. Run `npm run test:visual -- --update-snapshots` on the intended recording/CI platform.
3. Inspect all PNGs under `tests/e2e/baseline.spec.ts-snapshots/`. Verify sidebar placement, chart/table layout, labels, clipping and page spacing; baseline generation is not approval.
4. Review failures/differences with `npx playwright show-report`. Attach or commit reviewed images with the intended change.
5. Run `npm run test:e2e` without update mode to verify all functional and screenshot comparisons.

For an already installed Google Chrome, use `PLAYWRIGHT_CHANNEL=chrome npm run test:e2e`. The same override applies when generating snapshots. The final checked-in baselines use the pinned Playwright Chromium build, in the full-browser headless channel. `--no-shell` avoids an additional browser binary that this suite does not use. Use the same browser for generation and comparison.

Playwright filenames include host platform. Use the same browser version, platform, fonts and viewport in CI for repeatable comparisons. Do not treat macOS baselines as Linux baselines or increase tolerances to hide layout regressions. Only English LTR screenshots belong here.

Execution results are recorded in `docs/verification.md`. Tests that have not been run must never be described as passing.
