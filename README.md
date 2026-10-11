# Atlas Invoice — Phase 1

An English LTR enterprise frontend lab for Coffee Break Web. Entirely fictional B2B data; no backend or email delivery. React 19, TypeScript, Nx 23, Vite 6, Material UI 7 and Emotion.

## Run

Requires Node 22.12+ and npm 10+. From the workspace root:

```sh
npm ci
npm run dev                 # invoicing: http://localhost:4200
npm run dev:procurement     # procurement: http://localhost:4201 (second terminal)
```

Both apps also run with `npx nx dev invoicing` / `npx nx dev procurement`. Vite uses localhost ports 4200 and 4201; sidebar application links assume these defaults. Each application supports client-side routes; production hosting must redirect unknown paths to its own index.html.

## Verify

```sh
npm run lint
npm run typecheck
npm run build
npm test
npx playwright install chromium --no-shell
npm run test:e2e
npm run storybook
```

Build output: `dist/apps/invoicing` and `dist/apps/procurement`. Shared libraries are source-consumed, not separately published. `npm run test:visual -- --update-snapshots` generates proposed English screenshot baselines; review every image before committing approval. See [testing strategy](docs/testing-strategy.md).

## Demo

Overview → Invoices → invoice detail → Create invoice → Customers → Settings. Open Procurement on port 4201. Invoice creation and invoicing settings persist in browser localStorage. Clear site data to restore the fixture state. Invoice dates are fixed around the demo reference date of 11 October 2026. Dashboard trend and growth percentages are illustrative; KPI balances use USD invoice data only; status counts include all currencies. Amounts use the selected currency without foreign-exchange conversion.

Only English LTR is implemented. Intentional physical styling is documented in [legacy inventory](docs/legacy-ltr-inventory.md); no Arabic, direction switch, migration tool, RTL plugin, or RTL baseline is included.

See [architecture](docs/architecture.md), [testing](docs/testing-strategy.md), and [recording guide](docs/video-demo-guide.md).
