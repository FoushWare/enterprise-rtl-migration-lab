# Focused dialog scenarios without weaker RTL coverage

## Problem addressed

At commit `1988454256d37b9aaac40bb3067d9e83df9ebc51`, CI run 40090622058
exhausted the 30-second **total** budget in the long 899px dialog scenario.
There was no failing RTL geometry assertion or observed application/network error.
Run 40090626241 passed the identical test in 20.636s (development) and 9.413s
(production). The underlying same-commit latency variation remains unexplained.
This change separates unrelated workflows; it does not raise the budget or claim
to fix runner performance.

## Dependency analysis before the edit

The original test has three consecutive phases:

1. Prepare an invoice without saving, open review, perform five Arabic→English
   round trips in the same open dialog, then Escape and verify restored focus and
   retained Arabic form text.
2. Navigate to Customers with explicit English demo query. Open/close all six
   customer dialogs in English, then all six in Arabic; verify geometry and focus
   return for every trigger.
3. Starting from the Arabic state produced by phase 2, filter Northstar, open its
   dialog, perform five English→Arabic round trips, then close using the Arabic
   close action and verify restored focus and the retained one-card filter.

The boundary **between phases 1 and 2** is safe:

- Review opens the confirmation modal; it never invokes the create/save action.
  `CreateInvoice` stores form/confirmation state in React state. The only API write
  is in `save()`, which this scenario does not call.
- The existing full-document `page.goto('/customers?...lang=en')` already discards
  that form and reinitializes runtime modules. It checks no cross-route transfer.
- Locale is URL-derived, not persisted; the customer route query explicitly starts
  English. Customers reads the static six-customer fixtures and owns only local
  selection/search state. It does not depend on invoice-review state.
- No shared storage, server mutation, saved invoice, or retained modal instance is
  required across this boundary. Each new test receives an isolated context.

The boundary **between phases 2 and 3 is not used**: the original sequence ends
phase 2 in Arabic, and phase 3 intentionally consumes that state. Both phases stay
in one customer test in their original order, without a reset.

## New structure

| Test per viewport | Original work retained |
| --- | --- |
| `invoice dialog preserves glyph clearance and focus` | All of phase 1 |
| `customer dialogs preserve glyph clearance, focus and filter` | All of phases 2 and 3, together |

Both tests use the same seven widths: 390, 899, 900, 901, 1100, 1101, 1440px,
and 1000px height. A viewport setup is repeated for the newly independent customer
test. No assertion, loop body, helper, browser setting, timeout, retry, threshold,
application code, or tooling logic is changed. The suite grows from 108 to 115
cases, rather than deleting work.

## What all five iterations mean

There is no special reduced check in any cycle. Cycles 1, 2, 3, 4, and 5 each
perform the complete round trip and the same invariants. Cycles retain the open
modal and prior state; they are not split into isolated tests.

**Invoice: Arabic then English in every cycle (ten transitions total).**
Each transition verifies document direction, visible dialog, computed dialog
direction, valid aria-labelledby/title association, nonempty title ID, no title
text/close-glyph overlap or clipping, and the 12px reading-end close-button gap.
It also verifies translated action labels and ordering, unchanged Northstar and
$3,000.00 content, and five Tab presses with focus remaining inside the dialog
(50 checks across the ten transitions). After cycle five, Escape, hidden state,
trigger focus return, and the Arabic description value are verified.

**Customer: English then Arabic in every cycle (ten transitions total).**
The same shared geometry/direction/accessibility checks run on every transition,
plus the exact Northstar title, retained search under its localized accessible
label, and unchanged `/customers` route. After cycle five, the Arabic close action,
hidden state, original trigger focus, and one-card filtered result are verified.
The preceding six-customers × two-languages open/Escape/focus sequence is retained.

## Coverage proof

An AST comparison against PR #10's exact head checked that:

- The invoice body equals the original statement prefix, byte-for-byte per AST
  statement, through its final form-value assertion.
- The customer body equals the original suffix in full, with only the repeated
  viewport setup inserted before it.
- All five shared helper function bodies, the other two test templates (forms and
  tables), and the viewport list are unchanged.
- The original 17 inline assertion sites become 8 + 9; both five-cycle loops remain.

The successful original CI HTML report executes **401 assertions per viewport**.
The affected-test run of the new code executes **176 invoice + 225 customer = 401**
for every viewport: **2,807 checks before and after** across seven widths. Shared
helper assertions are included in these runtime totals. This verifies actual
execution as well as source preservation. No new assertions are used to replace
old assertions and no checks are weakened.

## Validation environment and interpretation

The tests run with CI Chrome for Testing 156.0.8078.4, en-US, UTC, light mode,
1440x1000 default viewport (overridden by the same seven case widths), two workers,
the unchanged 30-second default, zero retries, and retained failure diagnostics.
An external port-routing harness preserves the developer server already on 4200;
it routes the test copy to this worktree's isolated 4300/4301 servers. Test bodies,
assertions, and the shared diagnostic fixture execute unchanged.

The affected run covers all fourteen split cases. The full development and
production suites cover all 115 cases each, including the six untouched English
visual baselines. Per-case measured durations are recorded below after validation.
Local timings establish measured local headroom, not guaranteed hosted-runner
performance or a controlled speed comparison against an earlier CI machine.

Future slowdowns must remain visible through the existing trace/error diagnostics.
No timeout increase, retry, skipping, reduced iteration count, or screenshot
threshold change is part of this change. Release approval still requires final CI
results and explicit review; no automatic merge or release is authorized.

## Measured validation results

Both final full-suite runs passed with no retries, skipped tests, or unexpected
failures: development **115/115** (193.49s total), production **115/115**
(161.37s total). The affected-only run passed **14/14** (35.5s total).
Both full HTML reports independently confirm all 2,807 original dialog assertions.

| Width | Invoice dev | Customers dev | Invoice production | Customers production |
| --- | ---: | ---: | ---: | ---: |
| 390px | 2.533s | 5.847s | 2.287s | 5.603s |
| 899px | 2.452s | 5.758s | 2.353s | 5.578s |
| 900px | 2.511s | 5.801s | 2.311s | 5.675s |
| 901px | 2.404s | 5.814s | 2.267s | 5.628s |
| 1100px | 2.583s | 5.816s | 2.415s | 5.658s |
| 1101px | 2.444s | 5.794s | 2.210s | 5.535s |
| 1440px | 2.562s | 5.832s | 2.415s | 5.573s |

Across the entire suites, no test reached 24s (80% of the unchanged 30s
budget). The slowest development test was `forms retain generated direction and validation at 390px` (7.639s); the slowest production test was `forms retain generated direction and validation at 390px` (6.861s).

Additional checks passed: repository lint, TypeScript typecheck, application build,
`git diff --check`, and protected-hash verification for 78 files. The scanner JSON
remains byte-identical to the existing readability reference. No source pin or
historical baseline was updated.

An earlier full development attempt had 114 passes and one external-harness
transport error: `route.fetch()` raised `ECONNRESET` while re-fetching a CSS asset
for the unchanged 1100px forms test. This was not an RTL assertion failure. Its
failure artifacts were preserved outside the repository. The external harness
was corrected to forward the original browser request with `route.continue()`;
a separate routing check verified that page URL/origin remain unchanged. The
1100px test then passed, followed by both complete suites above. No retry was
added to Playwright, and repository test infrastructure was not changed.

For normal manual verification with the CI browser installed and ports available:

```sh
npm run test:e2e -- tests/e2e/forms-dialogs-tables.spec.ts --grep 'invoice dialog|customer dialogs'
npm run test:e2e
npm run test:e2e:production
```

The change is ready for review, not release approval. Hosted CI results remain
necessary; latency variation on GitHub runners has not been independently fixed
or explained by these local measurements.
