# RTL Migration — Reproducible Demo Map

Research/recording plan only. No final script, narration, animation or production transformation is authorized by these instructions. Baseline: `b127325a14ad3bf8e70aede2a2e29b9dae638355`, default branch main. [Full research](RTL_MIGRATION_VIDEO_RESEARCH.md) · [Claim index](RTL_MIGRATION_EVIDENCE_INDEX.md).

## Recommended order and recording identity

Keep one connected journey: **business invariant → shared dependency → real static risk → semantic decision → runtime ownership → controlled automation → validation**. Do not follow the architecture diagram as if it were a literal single-pass call stack.

| Order / ID | Chapter | Core question | Suggested time | Transition |
|---|---|---|---|---|
| D0 | Understand system | What must remain unchanged for invoice 1048? | 0:45–1:15 | Both apps share these components; where can one edit spread? |
| D1 | Impact analysis + classification | What did the scanner actually observe, and why is it manual? | 2:00–2:30 | The physical gutter belongs to a business chart, not generic start spacing |
| D2 | Safe implementation / semantics | Should this revenue axis mirror? | 1:30–2:00 | Presentation intent still needs coordinated runtime styling |
| D3 | Architecture + classification | What can theme/cache/document coordination and static uncertainty prove? | 1:45–2:15 | A reviewed risk is still not a code change |
| D4 | Manual vs automated | What guardrails separate a proposed edit from an actual write? | 1:15–1:45 | An exact diff must survive real behavior and old English pixels |
| D5 | Testing / quality gates | How do we validate round trips, data, focus, geometry and LTR? | 1:30–2:00 | Release readiness is multiple contracts, not one scanner count |

Allow architecture/decision explanations and transitions to bring total runtime into 12–15 minutes. This table is editorial guidance, not approved scene timing.

## Preparation and scope

- Use a separate dependency-prepared checkout at the researched SHA. Do not switch the user's existing feature checkout or overwrite their localStorage/browser profile.
- No production source mutation, approval edits, baseline updates or OS preference writes are needed.
- The fresh research compiled scanner output outside the checkout; normal documented build below writes only ignored dist files.
- Current published Explorer embeds older 8041f4c. If shown, visibly label its historical revision; do not use its absence of later features as evidence about current main.
- Installed Node/dependencies/Chrome were used; no npm install or browser download was performed during research. Normal Playwright defaults may require a browser that is not installed; `PLAYWRIGHT_CHANNEL=chrome` uses installed Chrome.
- Existing source/report paths below are repository-relative. Every source link resolves from docs/video-research via `../../`.

## D0 — Business contract before CSS

**Open:** [shared index.ts:87–137](../../libs/shared/src/index.ts#L87-L137), [invoicing App:12–48](../../apps/invoicing/src/App.tsx#L12-L48), [InvoiceTable](../../apps/invoicing/src/components/InvoiceTable.tsx), [InvoiceDetails:12–70](../../apps/invoicing/src/pages/InvoiceDetails.tsx#L12-L70), [both app roots](../../apps/invoicing/src/main.tsx#L7-L15).

**Actual code/behavior:** `seedInvoices` index zero produces INV-2026-1048 / c1 / Pending / USD / quantity1 × 4800. `mockApi.listInvoices` uses saved browser data first. App stores invoices and passes them into pages; details finds the route ID; `total()` computes arithmetic and `money()` formats en-US currency. No real financial API is being called.

**Commands:**

```sh
npm run dev
# Separate terminal, if demonstrating shared procurement:
npm run dev:procurement
```

**Browser:** fresh profile/context; `http://127.0.0.1:4200/invoices`, open INV-2026-1048, then Arabic query `?demo=unmigrated-rtl&lang=ar`. Expected amount `$4,800.00`, canonical ID/status/currency/dates unchanged. Demo-only Arabic labels are not a data migration. Reload to illustrate persistence, but do not erase an existing user's storage to force fixtures.

**Capture worth recording:** 1048 list→detail; fixture generation; App effect/state; total/money; provider nesting; cross-app shared Sidebar. Screenshots would document labels/data but were not regenerated for this research.

**Verified:** source and app unit suite; navigation/browser tests exist. **Limit:** this exact interactive manual recording was not conducted now; saved storage can change observed data. [E02–E07, E45](RTL_MIGRATION_EVIDENCE_INDEX.md#e02)

## D1 — Real declaration → parser → evidence → reviewed Finding

**Open in order:**

1. [styles.css:278–296](../../libs/design-system/src/styles.css#L278-L296): `.chart-wrap` and `padding-left:40px`.
2. [scan.ts:11–34](../../tools/rtl-scanner/src/scan.ts#L11-L34): sourceRoot discovery, parser dispatch, fact IDs.
3. [css.ts:4–15](../../tools/rtl-scanner/src/css.ts#L4-L15): `postcss.parse`, `walkDecls`, `fact`.
4. [model.ts:5–15](../../tools/rtl-scanner/src/model.ts#L5-L15): contracts, range/fact/hash.
5. [rules.ts:27–31](../../tools/rtl-scanner/src/rules.ts#L27-L31): approval and admission predicate.
6. [policy:3–11](../../rtl-scanner.config.json#L3-L11): owner known, approvals empty; [RTL-02 binding](../../rtl-scanner.config.json#L39-L49).
7. [scan.ts:35–48](../../tools/rtl-scanner/src/scan.ts#L35-L48): policy audit and final detect, diagnostics, complete.
8. [report.ts](../../tools/rtl-scanner/src/report.ts): JSON/Markdown presentation.

**Run:**

```sh
npm run rtl:scan:build
npm run --silent rtl:scan -- --format json > /tmp/rtl-demo.json
npm run --silent rtl:scan -- --format markdown > /tmp/rtl-demo.md
node --input-type=module - <<'JS'
import fs from 'node:fs';
const r=JSON.parse(fs.readFileSync('/tmp/rtl-demo.json','utf8'));
const e=r.evidence.find(x=>x.path==='libs/design-system/src/styles.css' &&
  x.context==='stylesheet/.chart-labels' && x.property==='padding-left');
const f=r.findings.find(x=>x.ruleId==='RTL.CSS.PHYSICAL' && x.evidenceIds.includes(e.id));
console.log(JSON.stringify({evidence:e,finding:f,complete:r.complete},null,2));
JS
```

**Note:** the `--silent` npm commands above suppress npm banners and were verified to produce valid JSON. Plain `npm run` may include banners. The underlying CLI is another JSON-only route:

```sh
node dist/tools/rtl-scanner/cli.js --format json > /tmp/rtl-demo.json
node dist/tools/rtl-scanner/cli.js --format markdown > /tmp/rtl-demo.md
```

Use the silent npm commands or the direct commands for the selector above; do not treat a banner-containing file as valid JSON. Fresh research used the underlying CLI and verified repeat output bytes.

**Expected at pinned baseline:** 440 facts / 42 Findings / nine nonblocking Diagnostics / complete true. Selected Evidence ID begins `8836248f…`; full ID and Finding object are embedded in research §4. Finding ID `RTL.CSS.PHYSICAL:82212e990854fbb975d34448`, MANUAL_REVIEW, Minor, High, custom-css, suggestion null, issue RTL-02, applications []. That last field does not mean no consumers.

**What to show:** source line and actual record side by side; cursor follow into extractor and safe predicate; expand rationale/treatment/limitation; label report selector as a post-processing helper, not native CLI formatting.

**Do not claim:** every physical property is a defect, known ownership implies automation, or this source produced a blocking diagnostic. Use D3 for actual uncertainty. [E12–E27](RTL_MIGRATION_EVIDENCE_INDEX.md#e12)

## D2 — Revenue chronology is a business decision

**Open:** [Dashboard.tsx:76–137](../../apps/invoicing/src/pages/Dashboard.tsx#L76-L137), [illustrative notice:201](../../apps/invoicing/src/pages/Dashboard.tsx#L201), [chart CSS](../../libs/design-system/src/styles.css#L278-L296), [chart test:27–65](../../tests/e2e/chart-direction.spec.ts#L27-L65).

**Reproduce:** navigate `/?demo=unmigrated-rtl&lang=en`, switch Arabic, switch back; repeat at widths 1440 and 390. Expected May→October positions stay left-to-right, Arabic month glyphs are locally RTL/isolated, 40px gutter and SVG path/endpoint unchanged, translated legend and stable donut. The SVG trend itself is illustrative; do not connect it to mockApi revenue calculations.

**Existing automated command:**

```sh
PLAYWRIGHT_CHANNEL=chrome npx playwright test tests/e2e/chart-direction.spec.ts --workers=1 --reporter=list
```

**Fresh results:** four passed, including switching/geometry/donut checks at 1440 and 390, breakpoint and print assertions inside those tests. Original research attempt with no server reuse stopped because port4200 was already occupied; no server was killed. An external config used port4300, installed Chrome, original tests/assertions, no changed repository config. A reusable equivalent is supplied in the isolated-port recipe below.

**Capture:** Arabic chart with October endpoint, then source month array and matching SVG, then assertion evidence; split-view English/Arabic. A hypothetical incorrect mirror must be labelled conceptual, not presented as current application output. There are no real implemented tooltips to demonstrate. [E08, E09, E33](RTL_MIGRATION_EVIDENCE_INDEX.md#e33)

## D3 — Runtime coordination and a separate uncertainty fixture

**Open:** [runtime.tsx:80–92](../../libs/design-system/src/runtime.tsx#L80-L92); [i18n.tsx:25–49](../../libs/shared/src/i18n.tsx#L25-L49); [runtime tests](../../tests/runtime-foundation.test.tsx#L23-L76); [existing dynamic-theme test](../../tools/rtl-scanner/tests/detection.test.ts#L35); [rules.ts:52](../../tools/rtl-scanner/src/rules.ts#L52); [runtime proof](../../tools/rtl-scanner/src/runtime-direction.ts#L113-L188).

**Explain with actual code:** two stable caches, prefixer first, RTL plugin only in RTL cache, distinct cache keys; same language predicate selects document.dir/theme/cache. Plain CSS and inline styles are different owners. Body portals inherit root direction unless locally overridden; never invent a wrapper-only portal failure.

**Run:**

```sh
npx vitest run --config vitest.config.ts tests/runtime-foundation.test.tsx
npx vitest run --config tools/rtl-scanner/vitest.config.ts tools/rtl-scanner/tests/detection.test.ts -t 'dynamic theme configuration remains blocking'
```

A test pass is not the same as printing its full record. To show actual records without changing source, after scanner build run:

```sh
node --input-type=module - <<'JS'
import {extractTypescript} from './dist/tools/rtl-scanner/typescript.js';
import {detect} from './dist/tools/rtl-scanner/rules.js';
import {emptyPolicy} from './dist/tools/rtl-scanner/policy.js';
const source='import {createTheme} from "@mui/material";createTheme({direction:getDirection()});';
const parsed=extractTypescript('a.tsx',source);
console.log('Parser return:',JSON.stringify(parsed));
const findings=detect(parsed.evidence,new Map([['a.tsx',source]]),emptyPolicy,parsed.diagnostics);
console.log(JSON.stringify({diagnostics:parsed.diagnostics,findings},null,2));
JS
```

**Expected actual fixture:** parser initially empty arrays; then one blocking RUNTIME_DIRECTION_UNKNOWN Diagnostic and one RTL.RUNTIME.DIRECTION_UNKNOWN Finding, RUNTIME_CONFIG/Minor/Low, evidenceIds empty, suggestion null. The call expression is not executed. Do not describe this fixture as an existing fault in current Provider; current Provider's paired configuration passes scoped tests. [E11, E26, E28, E37](RTL_MIGRATION_EVIDENCE_INDEX.md#e26)

**Capture:** actual test source; condition on initializer kind; explicit diagnostics.push and separate add call; live output; then return to the implemented runtime Provider and distinguish static proof from browser switching.

## D4 — Automation is real, but production plan is a no-op

**Open:** [prepare:82–121](../../tools/rtl-codemod/codemod.mjs#L82-L121), [apply:175–193](../../tools/rtl-codemod/codemod.mjs#L175-L193), [rollback:196–211](../../tools/rtl-codemod/codemod.mjs#L196-L211), [positive tests:35–58](../../tools/rtl-codemod/codemod.test.mjs#L35-L58), [failure recovery tests](../../tools/rtl-codemod/codemod.test.mjs#L123-L173).

**Read-only production command:**

```sh
npm run rtl:scan:build
npm run rtl:codemod -- --dry-run
```

**Expected:** eligibleIds [], selectedIds [], files [] at this baseline. No production approval is invented. Existing exact scanner approvals are prerequisites, not generated by codemod prepare.

**Mutation behavior may be demonstrated only through the existing temporary-fixture suite:**

```sh
npx vitest run --config tools/rtl-codemod/vitest.config.ts
```

Fresh result: 24 passed. Positive fixture starts `.sample { margin-left: 8px; padding-right: 4px; }`, records explicit source-bound approvals and a clean fixture Git commit, applies to margin-inline-start/padding-inline-end, consumes selected approvals, and rolls back exact source/policy bytes. Negative cases reject dirty/stale/concurrent/colliding sources and malformed plans. This is not a new application migration.

**Capture:** current no-op plan → exact test fixture setup → prepare/apply guard source → before/after assertion → external journal and rollback assertions. Explain that scanner AUTO_CANDIDATE and codemod admission are different filters. The tool supports plain CSS, not broad JSX/Emotion/MUI/axis/icon transformations.

**Do not run on real apps for filming:** `--apply` or `--rollback`. A future independently approved fixture recording can show actual writes in a disposable copy. Multi-file replacement is not crash-atomic; the journal assists recovery and refuses concurrent user changes. [E29–E32](RTL_MIGRATION_EVIDENCE_INDEX.md#e29)

## D5 — Validation and release confidence

**Open:** [baseline visual cases](../../tests/e2e/baseline.spec.ts#L99), [Playwright settings](../../playwright.config.ts#L6-L14), [forms/dialog keyboard focus](../../tests/e2e/forms-dialogs-tables.spec.ts#L107-L126), [glyph measurement](../../tests/e2e/bidi-boundaries.spec.ts#L3-L17), [CI](../../.github/workflows/ci.yml#L12-L85), [production preview config](../../playwright.production.config.ts).

**Commands, with prepared dependencies/browser/build:**

```sh
npm test
npm run rtl:scan:test
npm run rtl:codemod:test
npm run rtl:verify:protected
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e -- tests/e2e/demo.spec.ts tests/e2e/forms-dialogs-tables.spec.ts --workers=1
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e -- --grep 'visual English LTR' --workers=1
# Requires production app builds first; not a deployed-origin test:
npm run build -- --skip-nx-cache
PLAYWRIGHT_CHANNEL=chrome npm run test:e2e:production -- --workers=2
```

The full browser/screenshot/build set above is a recommended later recording/verification run, not all rerun by this research. Fresh tests are explicitly listed in the research execution log. Never add --update-snapshots, increase thresholds or write local macOS preferences to turn a failure green. Native date widgets depend on environment beyond Playwright locale; current CI's hosted-only region setup/restoration is evidence-specific.

**Capture:** entered Arabic/English mixed value survives language switching, dialog focus remains contained and returns on Escape, chart contract stays stable, zero-diff English assertion remains strict. Existing Arabic screenshots are documentary evidence, not blanket passing visual baselines.

**Expected gate:** ordinary complete scan exits0 even with review findings; gated complete scan exits1 for actionable findings; incomplete exits2. CI currently uses non-gated scan plus other checks. A zero-finding line does not establish completeness, accessibility or deployment readiness. [E21, E33–E43, E47](RTL_MIGRATION_EVIDENCE_INDEX.md#e21)

## Isolated-port recipe used for the focused chart run

This writes only a temporary test config and temporary test results. It does not change project config, source, baselines or OS preferences. If the chosen port is occupied, choose another unused port; do not kill an unknown existing server. Run from repository root:

```sh
node --input-type=module - <<'JS'
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const base=JSON.stringify(path.join(root,'playwright.config.ts'));
fs.writeFileSync('/tmp/rtl-research-chart.config.mts',`import base from ${base};
export default {...base,
  testDir:${JSON.stringify(path.join(root,'tests/e2e'))},reporter:[['list']],
  outputDir:'/tmp/rtl-research-chart-results',
  use:{...base.use,channel:'chrome',baseURL:'http://127.0.0.1:4300'},
  webServer:[{command:'node_modules/.bin/vite --config apps/invoicing/vite.config.ts --port 4300 --strictPort',
    cwd:${JSON.stringify(root)},url:'http://127.0.0.1:4300',reuseExistingServer:false}]
};`);
JS
node_modules/.bin/playwright test --config=/tmp/rtl-research-chart.config.mts chart-direction.spec.ts --workers=1
```

Research ran this architecture of temporary configuration successfully: four tests passed in 7.1 seconds. Only chart assertions were selected; their tests use relative URLs, so the port override does not misroute a hard-coded procurement origin. Do not assume the same override is sufficient for every other test.

## Recording checklist and blockers

- Show revision and whether a screen is current source, historical Explorer, actual execution output or conceptual illustration.
- Keep code LTR; translated explanation and labels may be RTL. Do not turn screenshots of fabricated code cards into “real IDE footage.”
- Use real source lines and actual output; keep original source/fixtures unchanged.
- D1 has a real manual-review record; D3 adds the uncertainty lesson; D4 supplies fixture-only automation. Do not force one example to falsely produce every record type.
- Claims/rankings/timing are recommendations. Final narration, video pacing, product locale/chart decisions and real deployment-origin behavior remain unapproved/unverified.
- No interactive chart tooltips, universal automated migration, percentage coverage metric or HTML scanner report should appear as implemented features.
- Historical full-suite receipts and current small research checks are separate. Passing fixture tests is not proof of production migrations.
- Outstanding environment limitation: port4200 belongs to an existing process; preserve it. Browser/region/font differences can affect future English baseline reproduction.

## Handoff to final narrative design

Ready: file opening order, tested scanner and fixture results, observed no-op production automation plan, focused chart runtime evidence, exact source index and recommended connecting questions. Still needs human review: final story emphasis, final Egyptian Arabic wording, locale/axis policy, approved recording environment and duration. No script or voice-over has been written here.
