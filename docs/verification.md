# Phase 1 verification

Executed locally on macOS arm64, Node 22.21.1, npm 10.9.4, on 11 October 2026.

| Check | Result |
| --- | --- |
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | Passed: 4 shared component/data tests |
| `NX_DAEMON=false NX_ISOLATE_PLUGINS=false npx nx run-many -t build --skip-nx-cache` | Passed: invoicing and procurement, fresh builds |
| `npx storybook build -o /private/tmp/atlas-storybook --disable-telemetry` | Passed |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/atlas-playwright npm run test:e2e -- --workers=2` | Passed: 11 tests on pinned Chromium 156.0.8078.4, including 5 workflows and 6 screenshot comparisons; snapshot updates disabled |
| Screenshot review | All six desktop English LTR screenshots visually inspected for layout, clipping and alignment |
| `npm audit` | Zero reported advisories after updating Vitest/Storybook and overriding Undici to a patched compatible release |
| `npm run dev` / `npm run dev:procurement` through Nx | Both started successfully on ports 4200 and 4201 |

The initial typecheck found a shared Button router-link typing problem and the first browser run found an ambiguous status locator. A later simultaneous Nx preview exposed a shared Vite optimization cache collision, corrected by using separate app caches. All three issues were corrected. Initial dependency advisories were corrected with compatible tool upgrades rather than ignored.

Builds emit non-fatal chunk-size warnings; Storybook also emits ignored dependency `use client` directive warnings in its client-only bundle. Nx required local socket permissions in the execution sandbox. These did not prevent the verified builds.

Hosted CI has not been executed. The checked-in workflow targets macOS to match the baseline platform. Baselines should be regenerated and reviewed when changing platform, browser or fonts. The mock store is local browser state; production backend behavior and email delivery are outside Phase 1.

The browser binaries were installed in `/private/tmp/atlas-playwright` for this sandbox. Standard installations can use the default browser cache: `npx playwright install chromium --no-shell`. The suite explicitly selects the full Chromium headless channel. Installed Chrome was also exercised during development. Final screenshots were generated with pinned Chromium, visually reviewed, then compared without updates and with zero differing pixels allowed.

## Follow-up local verification and screenshots

On 11 October 2026, both local servers returned HTTP 200. A fresh `nx build invoicing --skip-nx-cache` succeeded (1.33 seconds of Vite build time; 548.67 kB JavaScript before gzip, 171.32 kB after gzip). Lint, typecheck, all 4 unit tests and all 11 Chromium Playwright checks passed again without snapshot updates.

Captured 11 full-page screenshots at 1440 × 1000 in `docs/screenshots/`; `docs/screenshots.md` and `docs/screenshots/index.html` provide galleries. Coverage includes dashboard, invoice list/detail, create invoice, validation, confirmation, customer list/detail, settings, purchase orders and order detail. Capture did not save an invoice or change settings. No browser page errors were observed.
