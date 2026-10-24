# E2E failure evidence

The first two tests in CI run 40024323442 timed out during unusually slow initial
setup/navigation. Their DOM snapshots showed the Invoicing shell and a loading
message, but no trace, failure screenshot, or browser errors were retained.
This change captures evidence for the next unexpected failure; it does not claim
to repair or establish the root cause of that historical startup delay.

## What is captured

Both development and production inherit these Playwright settings:

- `trace: "retain-on-failure"`: record the first attempt and retain a trace for a
  failed test. No retry is necessary or added.
- `screenshot: "only-on-failure"`: retain the failed page screenshot. These files
  are test output, not visual baselines, and do not update historical screenshots.

Every existing E2E spec imports `test`, `expect`, and types from the shared
`tests/fixtures/e2e.ts`. Only imports change: test bodies, assertions, timeouts,
workers, locale, viewport, timezone, and zero-pixel visual tolerance remain exact.

The automatic fixture observes all pages in the test's isolated browser context.
It buffers at most 200 events and records a dropped-event count. Unexpected
failures attach `failure-diagnostics` JSON with:

- Browser console errors and uncaught page errors, with bounded message/stack text.
- Local application transport failures and HTTP responses >=400 (separate kinds).
- Page creation, main-frame navigation, DOMContentLoaded, and load timestamps.
- Test status, expected status, worker/parallel indices, and the unchanged timeout.
- Best-effort state of up to three pages: URL, closed status, root/main presence,
  loading-workspace state, headings, document language/direction, browser navigation
  timings and paint entries. The DOM state describes capture time only.

Event elapsed time starts **after context creation**, not at test or browser
launch. Use the HTML report's Before Hooks/fixture durations and the trace to
understand the full startup sequence. Browser navigation/paint values are relative
to the browser time origin. No invented React-ready timestamp, polling assertion,
MutationObserver, init script, request interception, or app-code hook is added.

Renderer inspection is bounded to one second per page. A closed, crashed, or busy
renderer records an unavailable reason instead of blocking collection indefinitely.
This is a collection budget during existing teardown, not a larger test timeout.
The original test still fails. Capture before context setup or after a runner crash
cannot be guaranteed; the HTML report's fixture timing remains important.

Successful tests write no custom diagnostic attachment. Playwright traces incur
recording overhead even though passing traces are discarded. This is the built-in
tradeoff required to retain the first failure, rather than collecting only retries.

## GitHub Actions artifact

The existing `actions/upload-artifact@v4` step continues to run with `always()` and
uploads the `playwright-report` artifact with a requested **seven-day retention**
(subject to repository limits). Its scope is limited to:

```text
playwright-report/                 # Development HTML report + attachments
playwright-production-report/      # Production HTML report + attachments
test-results/                      # Raw development failure output
test-results-production/           # Raw production failure output
```

Production remains skipped if development fails, as before. No new workflow
trigger, permission, CI command, retry, assertion, or application behavior changes.
Missing paths warn rather than failing the upload. Runner loss or hard cancellation
can still prevent the upload; `always()` cannot recover files from a lost machine.

For a failed test, expect `trace.zip`, `test-failed-*.png`, `error-context.md`, and
`failure-diagnostics.json` under its result directory, plus reporter attachment
copies. The JSON is also a clickable `failure-diagnostics` attachment in HTML.
Download/extract the artifact and open the report or trace locally:

```sh
npx playwright show-report <extracted-artifact>/playwright-report
npx playwright show-trace <path-to-failed-test>/trace.zip
```

Only synthetic lab data should be used. URL fields in the custom JSON omit queries
and fragments, but console/error text and built-in traces/screenshots are **not**
fully redacted and may include page content, network data, or source excerpts.
No environment dump, headers, request bodies, or storage dump is added by the
custom logger. Do not use real credentials/data in these lab tests.

## Validation

```sh
npm run lint
npm run typecheck
npm run build
npm run test:e2e -- --workers=2
npm run test:e2e:production -- --workers=2
node scripts/verify-rtl-protections.mjs
git diff --check
```

Local validation uses the CI browser version (Chrome for Testing 156.0.8078.4)
with en-US, UTC, and 1440x1000. Existing developer servers are preserved through an
external test copy/port-routing harness on 4300/4301. Original assertions and the
new shared fixture execute; no baselines are updated.

A separate temporary synthetic probe deliberately fails one assertion after
emitting console/page errors, an aborted application request, and an HTTP 503.
The expected negative run produces a trace, screenshot, context, and JSON file;
its successful control retains none. This intentional failure is not a project
regression or an added failing CI test. Artifact content is inspected to verify
all event kinds, DOM/navigation timing data, and the original 30-second timeout.

Release status: this is a separately reviewed observability change stacked on
`6f0d1c6ffe89363fc1e9ab12f195f713dbe96a6d`. Local validation and artifact capture
support PR review. Do not publish a verified reference based only on opening the
PR; inspect final CI results and obtain explicit release approval. No underlying
historical renderer/host bottleneck is asserted to have been fixed.

## Recorded local results

- Development E2E: 108 passed, including all six untouched English comparisons.
- Production E2E: 108 passed, including all six untouched English comparisons.
- Application/shared unit tests: nine passed.
- Lint, typecheck, application build, protected hashes, unchanged Scanner JSON, and
  `git diff --check`: passed.
- Workflow YAML parsed with the existing YAML dependency; upload paths, `always()`,
  and seven-day retention asserted. No actionlint binary was installed/available.
- Synthetic negative probe: one successful control and one intentionally failed
  test, with all required event kinds and physical trace/PNG/JSON attachments
  verified. HTML report links to all three attachment files also resolve.
- No test timeout, retry count, assertion, or historical artifact changed.

## Exact changed paths

```text
.github/workflows/ci.yml
playwright.config.ts
tests/fixtures/e2e.ts
docs/testing/e2e-failure-observability.md
tests/e2e/baseline.spec.ts
tests/e2e/bidi-boundaries.spec.ts
tests/e2e/brand-direction.spec.ts
tests/e2e/chart-direction.spec.ts
tests/e2e/dashboard-navigation-arrow.spec.ts
tests/e2e/demo.spec.ts
tests/e2e/forms-dialogs-tables.spec.ts
tests/e2e/invoice-navigation-arrow.spec.ts
tests/e2e/kpi-direction.spec.ts
tests/e2e/sidebar-navigation-arrow.spec.ts
```

The ten spec files change only their shared-fixture import. Production configuration
inherits the development `use` settings and is not edited.
