# Pending status: wait for completed MUI Grow before a mouse click

## Scope and provenance

This test-only change is stacked on PR #11's reviewed commit
`0d2353dc85c7ba3d88755fb81917c6e40693d141`. It addresses a strongly supported
interaction-race hypothesis from failed CI run
[40128952848](https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/40128952848),
not a proven general application defect.

Only the Pending selection in `tests/e2e/demo.spec.ts` receives a readiness
assertion. No shared fixture, application, RTL implementation, Scanner, Codemod,
workflow, timeout, retry, screenshot threshold, or existing assertion changes.

## Why this condition distinguishes entering from entered

The installed MUI Material 7.3.11 `Grow` implementation uses
`scale(1, 1)` while entering and `transform: none` after entering. Its initial
scale is `(0.75, 0.5625)`. The Select opens a Menu/Popover whose paper is the
listbox's immediate parent. The test waits on that paper's **computed** transform:

```ts
await expect(page.getByRole("listbox").locator("..")).toHaveCSS(
  "transform",
  "none",
);
```

This uses the existing default 5-second assertion budget within the unchanged
30-second total test budget. It does not assert the inline target style
`scale(1, 1)`, which can already be present while computed geometry is still
scaled. It does not accept a merely unchanged rectangle over two frames: an
initial scale can persist across multiple frames before interpolation starts.

The immediate parent relationship is verified against the current MUI DOM. A
future implementation change may require reviewing this test dependency. No
hashed Emotion class selector, hard-coded animation duration, forced click,
dispatched event, disabled animation, or arbitrary delay is used.

## Observed before/after evidence

In the failed CI trace, the Pending locator resolved the correct
`li[data-value="Pending"]`. Playwright accepted it as stable and aimed at
`(717, 256.12)` while its box was 135 by 20.25px. The fully expanded option is
180 by 36px with center Y=299. The final screenshot/DOM still had All statuses
selected, the menu open, and eight rows. The assertion expected four rows.
No console/page error or failed request was recorded. Native mouse event targets
were not recorded by that historical trace; the exact event-delivery path remains
unproven.

A separate **observation-only** production probe, outside the repository, sampled
real menu geometry through animation frames/mutations and captured native mouse
handlers without replacing application handlers:

| Observation | Computed transform | Option width | Option center Y |
| --- | --- | ---: | ---: |
| Initial frame | `matrix(0.75, 0, 0, 0.5625, 0, 0)` | 135px | 256.125px |
| Readiness reached | `none` | 180px | 299px |
| Pending mousedown | `none` | 180px | 299px |
| Pending mouseup | `none` | 180px | 299px |
| Pending click | `none` | 180px | 299px |

The inline transform was already `scale(1, 1)` during the initial computed matrix.
The probe asserted it observed an intermediate smaller geometry, then verified
all three mouse events targeted Pending after readiness, the menu closed, the
selected label became Pending, and four rows remained. The probe passed. It is
supporting instrumentation, not a replacement for the uninstrumented E2E suite.

The unchanged original test passed 20/20 local repetitions before the change.
The improved test passed 30/30 repetitions. Consequently these counts **do not**
prove a statistically measured reduction of historical failures or definitively
establish the historical root cause. The new readiness condition demonstrably
waits beyond the observed risky state while preserving mouse interaction.

## Coverage and environment

Removing only the six added readiness lines produces the original test file
byte-for-byte. Pending selection, four-row filtering, empty state, Procurement
Approved selection, three-row filtering, canonical order detail and Arabic route
assertions remain exact. All other specs, seven viewport widths, five language
round trips, focus checks, and original screenshots remain unchanged.

Validation uses the actual production build and Chrome for Testing
156.0.8078.4 / Playwright 1.64.0 on macOS 26.6.2 (25G83), arm64. Browser settings
remain en-US, UTC, light mode, 1440x1000, no reduced motion override, zero retries,
and two workers. A separate local port-routing harness forwards browser requests
to 4300/4301 while preserving the expected visible 4200/4201 origins, so other
workspace servers remain untouched. This is not identical to hosted runner load
or the complete CI scheduling environment.

## Reproduce after installing the project's existing dependencies/browser

```sh
npm run build -- --skip-nx-cache
npm run test:e2e:production -- tests/e2e/demo.spec.ts \
  --grep 'Arabic filters and pagination keep canonical values and routes' \
  --repeat-each=30 --workers=2
npm run test:e2e -- --workers=2
npm run test:e2e:production -- --workers=2
npm run lint
npm run typecheck
npm run rtl:verify:protected
git diff --check
```

Repeated cases are independent runs, not Playwright retries. Existing assertions
still fail if the intended status/filter behavior does not occur. Visual checks
require the established compatible browser/macOS regional environment; no local
preference writes or snapshot updates were performed.

## Review boundary

No merge, tag, or release is part of this change. Keep the PR in Draft pending
review and hosted CI. Local readiness observations and green reruns support this
small test synchronization change; they do not prove every possible rendering
race or certify application interaction performance.

## Final local validation receipt

| Suite | Result | Total duration | Affected test | Slowest test |
| --- | --- | ---: | ---: | ---: |
| Development | 115/115 | 487.59s | 5.587s | 15.156s |
| Production | 115/115 | 323.84s | 3.573s | 10.707s |

The affected production scenario passed 30/30 repetitions (1.5 minutes total),
and the observation-only readiness probe passed 1/1. No full-suite test reached
24 seconds (80% of the unchanged 30-second budget). All runs used zero retries.
Lint, typecheck, uncached application/tool build, diff checks, and verification of
all 78 protected hashes passed. Scanner JSON is byte-identical to the existing
readability after-reference. None of the protected evidence was rewritten.

Next action: review this Draft PR against PR #11's branch and inspect hosted CI.
Do not interpret these local results as authorization to merge or publish.
