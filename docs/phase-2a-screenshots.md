# Phase 2A screenshot gallery and reproduction

Open the [browsable gallery](screenshots/phase-2a/index.html) for **68 captures**: 15 states × two languages × two widths, plus eight mobile navigation/scroll-edge frames. Every Arabic capture is labeled **Unmigrated RTL — demonstration only** in the real application. English frames use the opt-in switcher for comparison; the six original regression baselines remain separate and unchanged.

## Local viewing URLs

- [Arabic invoicing demonstration](http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar)
- [Arabic procurement demonstration](http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar)
- [English opt-in comparison](http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en)
- [Default English invoicing](http://127.0.0.1:4200/)
- [Default English procurement](http://127.0.0.1:4201/)
- [Screenshot gallery](http://127.0.0.1:4300/) (after starting the preview server below)

From the repository root, serve the gallery with a portable local preview command:

```sh
python3 -m http.server 4300 --bind 127.0.0.1 --directory docs/screenshots/phase-2a
```

The HTML also opens directly from disk. The gallery contains 68 image entries. Clicking a thumbnail opens the full-resolution PNG; each frame has its application URL and ordered reproduction steps.

## Run and capture

From the repository root, run the apps in separate terminals:

```sh
NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run dev
NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run dev:procurement
```

Install dependencies and the locked full Chromium build, then capture:

```sh
npm ci
npx playwright install chromium --no-shell
node scripts/capture-phase2a.mjs
```

The script requires both apps to be running. It creates fresh browser contexts, uses en-US browser locale, UTC, light mode, desktop 1440×1000 and mobile 390×844, waits for initial content/fonts/transitions, disables screenshot animations and never saves fixture invoices or changes existing browser storage. It records the Chromium version and OS in [manifest.json](screenshots/phase-2a/manifest.json). Ordinary pages are full-page captures; portal overlays and mobile drawers are viewport captures. Native browser rendering/system fonts can vary across environments. The generated timestamp identifies the run rather than business data.

## Captured states

| Application | State / starting route | Actions beyond opening the URL |
| --- | --- | --- |
| Invoicing | Overview `/` | Inspect shell, KPI, revenue chart and recent invoices |
| Invoicing | Invoices `/invoices` | Initial table and pagination; mobile also captures opposite horizontal edge |
| Invoicing | Invoice detail `/invoices/INV-2026-1048` | Existing original record |
| Invoicing | Create `/invoices/new` | Empty form |
| Invoicing | Focused create | Focus Description 1 while empty |
| Invoicing | Validation | Click Review invoice on the empty form |
| Invoicing | Customer menu | Open Customer select |
| Invoicing | Confirmation | Northstar Studio; description ورشة استراتيجية; quantity 2; rate 1500; USD; dates 2026-10-11 and 2026-11-10; click Review invoice, do not save |
| Invoicing | Customers `/customers` | Existing six customers |
| Invoicing | Customer dialog | Open first customer using View customer |
| Invoicing | Settings `/settings` | Original persisted-data defaults in a fresh context |
| Procurement | Purchase orders `/` | Original nine orders |
| Procurement | Status menu | Open Status select |
| Procurement | Order detail `/orders/PO-2026-401` | Existing original order |
| Procurement | Settings `/settings` | Existing policy/configuration display |
| Both | Mobile navigation | Click Open navigation at 390×844 |

Each starting route appends `?demo=unmigrated-rtl&lang=en` or `?demo=unmigrated-rtl&lang=ar`. The manifest includes exact language-dependent labels, URLs, input values, measured element rectangles/directions and scroll positions. Translation affects UI labels only; customer/supplier names, IDs and business descriptions are preserved.

Read [observed issues](phase-2a-observed-issues.md) for severities, source locations, confirmed root causes, proposed future remedies and cases that did not reproduce. This gallery demonstrates an intentionally unmigrated state; its PNGs must not replace approved LTR or future RTL correctness baselines.

## Regression commands

```sh
npm run lint
npm run typecheck
NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run build
npm test
npm run test:e2e -- tests/e2e/baseline.spec.ts --workers=2
npm run test:e2e -- tests/e2e/demo.spec.ts --workers=2
shasum -a 256 -c docs/phase-2a-ltr-baselines.sha256
```

No snapshot updates or threshold changes are part of these commands. Actual results are recorded in the issue report.
