# Atlas Invoice — RTL Migration Lab

The lab now includes the approved English baseline, opt-in Arabic runtime migration, static scanner and conservative CSS codemod tooling. Historical Phase 1/2A screenshots remain immutable before-state evidence. Entirely fictional B2B data; no backend or email delivery. React 19, TypeScript, Nx 23, Vite 6, Material UI 7 and Emotion.

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
npm run test:e2e:production  # requires completed builds and free ports 4200/4201
npm run storybook
```

Build output: `dist/apps/invoicing` and `dist/apps/procurement`. Shared libraries are source-consumed, not separately published. The six approved English screenshot baselines are immutable. Run `npm run test:visual` without snapshot updates. See [testing strategy](docs/testing-strategy.md).

## Phase 1: approved English LTR baseline

Overview → Invoices → invoice detail → Create invoice → Customers → Settings. Open Procurement on port 4201. Invoice creation and invoicing settings persist in browser localStorage. Clear site data to restore the fixture state. Invoice dates are fixed around the demo reference date of 11 October 2026. Dashboard trend and growth percentages are illustrative; KPI balances use USD invoice data only; status counts include all currencies. Amounts use the selected currency without foreign-exchange conversion.

The default applications preserve the original English LTR experience and all six approved screenshot baselines. Intentional physical styling is documented in [legacy inventory](docs/legacy-ltr-inventory.md). The opt-in URL below now uses synchronized document, MUI and Emotion direction, with bounded semantic fixes and regression coverage. This is a lab, not a verified production deployment.

See [architecture](docs/architecture.md), [testing](docs/testing-strategy.md), and [recording guide](docs/video-demo-guide.md).

## Arabic opt-in runtime and historical Phase 2A evidence

Arabic demonstration URLs: [invoicing](http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar) and [procurement](http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar). Normal routes remain English LTR; the switcher appears only in demonstration mode. The legacy `demo=unmigrated-rtl` query is retained for URL compatibility; current code contains the migrated runtime. Use historical checkpoints and documentary evidence for the original unmigrated rendering.

See the [observed issue report](docs/phase-2a-observed-issues.md) and [screenshot gallery instructions](docs/phase-2a-screenshots.md). The 68 documentary screenshots are protected historical evidence; do not regenerate them from current code. The six approved English baselines are unchanged. Phase 2A itself included no remediation; later stages are documented separately.

## Scanner, automation and delivery

```sh
npm run rtl:scan:typecheck
npm run rtl:scan:build
npm run rtl:scan:test
npm run rtl:scan
npm run rtl:codemod -- --dry-run
npm run rtl:codemod:test
node scripts/verify-rtl-protections.mjs
```

The scanner exits nonzero for incomplete coverage. Findings remain review evidence; no production declarations are approved for automatic conversion. See [codemod safety](tools/rtl-codemod/README.md), [current inventory](docs/autonomous/AUTOMATION_REVIEW.md) and [delivery report](docs/autonomous/FINAL_REPORT.md). Native HTML date inputs use macOS regional preferences independently of Playwright locale; hosted CI normalizes only ephemeral AppleLocale to the protected baseline's en_EG and restores it. No product input or formatting change conceals that difference.
