# Unmigrated RTL study baseline — local review draft

**Status: Draft / Pending Review. No commit, push, PR, or release was created.**

## Scope and exact references

This work is confined to `enterprise-rtl-migration-lab-study`, branch
`study/unmigrated-rtl-ui`, at committed HEAD
`910133cc332af96268d19fc6563608434b2c321c` plus the reviewed local diff.
The migrated release tag remains `v1.0.0-rtl-migrated-reference` at that exact commit.
The original Arabic demo is `61491d7f6dd359033c4a9e80b556d3b3e2446305`;
the original LTR platform is `2fe522fad44bb8f79b3f15190227b8b94b7d9469`.

The local Nx analytics stash was inspected, not applied, popped, changed or deleted:
`808e8b3cb8533c5ced0f27adb6965fb66ce591fa`.
No operations modified `enterprise-rtl-migration-lab-latest`, the original feature
checkout, remote branches, release metadata, or historical evidence.

## Investigation and restoration plan

The complete historical comparison distinguished ten UI migration files from
readability-only changes, tooling, fixtures, tests and documentation. Restore the
actual historical layout/provider/locale behavior in those files, retain modern
formatting where possible, and keep latest dependencies and tools intact. No
whole-directory restore or repository reset was used.

| Changed source file | Restored historical behavior / reason |
| --- | --- |
| `apps/invoicing/src/main.tsx` | LTR provider outside Router and LocaleProvider, matching the original mount order. |
| `apps/procurement/src/main.tsx` | Same original provider order for Procurement. |
| `apps/invoicing/src/components/InvoiceTable.tsx` | Original ArrowForward in both languages; no migrated Arabic ArrowBack selection. |
| `apps/invoicing/src/pages/CreateInvoice.tsx` | Original unisolated customer/amount markup in review and total; all validation, save and business calculations unchanged. |
| `apps/invoicing/src/pages/Customers.tsx` | Original name/contact/email/address markup without added bidi wrappers. |
| `libs/design-system/src/index.tsx` | Original physical left sidebar, right border, and left-side mobile off-canvas behavior. |
| `libs/design-system/src/styles.css` | Exact bytes from the historical demo: physical spacing, original chart flow, logo, KPI and dialog behavior. |
| `libs/design-system/src/runtime.tsx` | Original English theme and LTR-only Provider, retained in the current module boundary. No active RTL cache/theme selection. |
| `libs/shared/src/i18n.tsx` | Historical LocaleProvider sets document language/direction, independent of MUI theme direction. |
| `libs/shared/src/translations.ts` | Original right-pointing Arabic dashboard progression glyph. |

### Compatibility adjustment, not a UI fix

Keep the current exported `rtlTheme` definition **unused** so existing modern tests
and TypeScript imports retain their API. The study Provider never selects it; it
always uses the historical English theme without a migrated Emotion cache. Removing
this public export initially caused a test-import type error; restoring it removed
that genuine compatibility break without activating RTL fixes or editing tests.
The modern runtime module itself did not exist at 61491d7, so this module boundary
is intentionally retained rather than blindly restoring a whole directory.

A normalized TypeScript/esbuild executable comparison confirms all seven restored
application/i18n/translation modules match 61491d7, as do the extracted `theme`,
`Provider`, and `SidebarFrame` declarations. CSS matches byte-for-byte. This
corroborates historical provenance; it is not a formal proof of all runtime behavior.
See [historical equivalence receipt](historical-equivalence.json).

## Preserved assets and functionality

- Scanner, CLI summary, rules, policy, tests and all Codemod implementation/tests:
  no source changes. JSON/Markdown reporting and conservative refusal behavior remain.
- Test bodies, shared diagnostics fixture, browser settings, workflows and visual
  thresholds: unchanged. No assertions were deleted, relaxed or rebaselined.
- `libs/shared/src/index.ts` fixtures, totals, money formatting and mock API: unchanged.
- Invoicing business routes/state and Procurement App: unchanged apart from reviewed
  historical UI entry points/markup. The protected Dashboard source remains exact.
- Package manifests, lockfile, Nx configuration, pinned policy/manifest: unchanged.
- Six English baselines, 68 documentary screenshots, archived reports, final release,
  historical commits and stash: preserved.
- Existing `docs/architecture.md` and all tracked documentation: unchanged.

**Architecture Explorer availability:** no `architecture-explorer.html` is tracked
in this release snapshot. No untracked Explorer was present in the clean study
worktree. Its GitHub Pages deployment was not changed or copied into this baseline.
If an offline Explorer is required, select its exact reviewed source separately;
this task does not invent or silently import one from another worktree.

## Observed UI evidence (new captures, not historical replacements)

Captured with Chrome for Testing 156.0.8078.4, Playwright 1.64.0, macOS
26.6.2/25G83, en-US browser locale, UTC and 1440x1000 (plus a 390x844 mobile view).
No local OS preferences were written. All captures are synthetic fixture data.

| Actual observation | Evidence |
| --- | --- |
| Both Arabic application sidebars remain at x=0, width=238, while the document is RTL. The migrated reading-start position at 1440px would be x=1202. | [Invoicing Arabic](evidence/invoicing-desktop-ar.png), [Procurement Arabic](evidence/procurement-desktop-ar.png) |
| All four Arabic Invoicing KPI labels have text-range glyph overlap with their physical top-right icons; all four English controls have no overlap. | [Arabic overview](evidence/invoicing-desktop-ar.png), [English overview](evidence/invoicing-desktop-en.png), [raw geometry](evidence/observations.json) |
| Arabic month order is reversed relative to the unchanged left-to-right SVG path: May x=1365.27, October x=744.39. | [Arabic chart](evidence/invoicing-desktop-ar.png), [English chart](evidence/invoicing-desktop-en.png) |
| Arabic Procurement label/notch and select icon retain LTR geometry: label left=0 with translateX(14), select icon right=7px, just like English. | [Arabic Procurement](evidence/procurement-desktop-ar.png), [Arabic invoice form](evidence/create-desktop-ar.png) |
| The settled Arabic customer dialog's close glyph overlaps the right-aligned Northstar Studio title; no new alignment override was added. | [Settled customer dialog](evidence/customer-dialog-ar.png) |

The dialog capture waits for its fade opacity to reach 1; a transient faded image
was replaced only within these newly created study captures. Historical screenshots
were never overwritten. The new [mobile overview](evidence/invoicing-mobile-ar.png)
is supporting evidence; no claim of exhaustively validating all nine historical
issues or all seven viewport widths is made.

## Validation: results and meaningful failures

Before editing, the clean study worktree passed 195 Scanner tests, 24 Codemod tests,
nine app/shared tests, protection verification, and a complete scan (440 evidence,
42 findings, nine nonblocking diagnostics).

| Check after final changes | Actual result |
| --- | --- |
| Application TypeScript typecheck | PASS |
| Scanner typecheck | PASS |
| Lint | PASS |
| Uncached application/tool builds | PASS |
| Existing development baseline + demo specs | 20 passed, including six unchanged zero-pixel English comparisons |
| Existing production baseline + demo specs | 20 passed, including the same six English comparisons |
| Observation-only browser capture | 1 passed |
| Codemod fixture tests | 24 passed |
| Scanner tests | 189 passed / 6 failed |
| App/shared tests | 6 passed / 3 failed |
| Selected migrated RTL geometry tests at 1440px | 5 failed (two brand/shell, two chart, one KPI) |
| Protected-source verifier | FAIL: `libs/design-system/src/index.tsx` fingerprint changed |
| Real application Scanner JSON/summary | Available; exit 2, INCOMPLETE |
| Real application Codemod dry run | Refused with exit 2 because Scanner coverage/policy is incomplete |
| Git diff whitespace check | PASS |

The 20-case browser suites exercise English and Arabic navigation, search, status
filters, pagination, empty states, invoice validation/creation/persistence, customers,
settings and Procurement detail routes. They are the selected relevant suites, not
all 115 migrated UI E2E scenarios. Modern geometry checks were run unchanged as
negative controls, not rewritten to accept broken RTL.

The Scanner failures are existing assertions bound to the migrated application's
inventory, policy completeness, exact report counts, and expected CLI exit 0/1.
The three app test failures require activated migrated cache/direction ownership.
The brand/chart negative failures assert migrated sidebar x=1202 and chart direction
LTR; the observed original values are x=0 and RTL. The KPI test's migrated-CSS
mutation precondition is absent in the restored original stylesheet; independent
text-range measurements, not that failure alone, prove actual KPI glyph overlap.
These failures do not mean the Scanner/Codemod implementations were rewritten.

### Important tooling/policy blocker: do not hide it

Changing the actual shared UI necessarily invalidates its migrated whole-file
source pin. All production policy, exact exceptions, source pins and protection
manifest records remain untouched. Only this one protected **source** fingerprint
is mismatched; historical evidence hashes remain exact.

The final actual study scan reports **427 evidence / 58 findings / 10 diagnostics**,
with **four blocking**, six nonblocking, **zero AUTO_CANDIDATE**, and
**complete=false**. One blocking diagnostic explicitly reports
`POLICY_STALE_DYNAMIC_EXCEPTION` for `/dynamicExceptions/2`. The three dynamic
background uncertainties are blocking while that policy cannot validate.
These static findings are not 58 verified runtime bugs.

Consequently the result meets the historical UI/working English objective, but is
**not an all-green, automation-ready policy baseline**. Codemod refusing to edit
under stale provenance is the correct safety behavior. Do not refresh hashes,
remove diagnostics, alter tests or approve transformations merely to turn it green.
A separately reviewed study-specific policy/provenance strategy is required before
claiming complete application scan or production Codemod readiness. No such policy
migration was performed automatically.

## Run only the study worktree

From this worktree, with canonical ports free, use separate terminals:

```sh
npm run dev
npm run dev:procurement
```

```text
http://127.0.0.1:4200/
http://127.0.0.1:4201/
http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=ar
http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar
```

Do not stop another worktree's server automatically. For isolated manual viewing:

```sh
./node_modules/.bin/vite --config apps/invoicing/vite.config.ts --host 127.0.0.1 --port 4400 --strictPort
./node_modules/.bin/vite --config apps/procurement/vite.config.ts --host 127.0.0.1 --port 4401 --strictPort
```

Open the same paths/queries on 4400/4401. Existing cross-application links still use
canonical 4200/4201; on offset ports navigate explicitly to the study URLs rather
than following a link into another worktree. Validation used an external copied-test
routing harness to preserve browser-visible canonical origins while forwarding to
4400/4401. No test assertions were changed by the harness.

## Review, remaining risks and next step

Review the complete local diff and the evidence before accepting this baseline.
Keep it as **Draft / Pending Review**. The inactive public `rtlTheme` export is the
only deliberate current-module compatibility accommodation. Some retained protected
source comments describe the migrated reference; historical behavior is established
by the comparison and browser evidence rather than those comments alone.

Next action is human review of: (1) historical UI correctness, (2) acceptance of
expected migrated-test failures, (3) a separately authorized policy/pin strategy,
and (4) whether an exact Architecture Explorer source should be brought into the
study workspace. Do not commit or push until approved.

To abandon the experiment later, review and restore only the ten listed source
files to this worktree's unchanged HEAD and remove only the new study review files.
Do not reset other worktrees, clear the stash, alter tags, or delete user files.
