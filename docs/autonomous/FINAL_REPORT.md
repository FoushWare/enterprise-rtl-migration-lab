# Enterprise RTL Migration Lab — delivery record

The approved RTL lab implementation is delivered through [PR #4](https://github.com/FoushWare/enterprise-rtl-migration-lab/pull/4), normally merged at `94898ceb0d6ccbdab3fbf1ed7bf4e7a10121abbe`. Its validated source head is `a34f24044afef2724c0a56764eadcc2d3750d5aa`; the merged tree is identical. This separate documentation closure changes no application, dependency, scanner, policy, test logic or protected evidence. Publication requires its own normal green merge; current repository history and GitHub checks are the authoritative final HEAD/merge receipts.

## Delivered roadmap

| Phase | Result |
| --- | --- |
| A — Native date CI | Controlled independent A-D experiment proved AppleLocale=en_EG sufficient to reproduce protected day/month rendering. CI normalizes only an ephemeral hosted-runner preference and restores its original typed value/key presence. PR #3 and subsequently #2 merged only after green checks. |
| B — Directional navigation | Existing invoice/sidebar fixes retained; Arabic Dashboard progression uses the existing translation's left arrow, without editing pinned Dashboard source. Financial/external/disclosure/pagination semantics remain unchanged. |
| C — Bidi boundaries | Measured currency/name/address defects corrected with semantic bdi boundaries and scoped numeric/title CSS. Canonical data, en-US financial formatting and editable-input caret policy remain unchanged. |
| D — Conservative codemods | Exact reviewed plain-CSS plans, read-only default, strict source/commit/policy guards, staged writes, external recovery journal, safe rollback, negative/fixture/idempotency tests. Production approvals/candidates remain zero; no bulk conversion applied. |
| E — Verification and cleanup | Full English/Arabic, both-app, responsive/print/state/accessibility regression suites passed; six original English PNGs zero-diff; consolidated PR merged green; temporary diagnostic workflow removed; current documentation and persistent state maintained. |

Earlier Phase 2A translations/documentary evidence, Phase 3 scanner, strict policy, runtime themes/caches/document ownership, spacing pilots, sidebar geometry, chart chronology, KPI/brand fixes and forms/dialogs/tables coverage are included in the consolidated history. The legacy demo query/banner are retained for compatibility; historical checkpoints/screenshots provide the unmigrated Before state. No new runtime flag or Migration Control Center was introduced.

## Verification receipts

Both final-head runs completed SUCCESS before PR #4 merged:

- [Push 38607850878](https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38607850878).
- [PR 38607858920](https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38607858920).
- [Merged-main 38610207500](https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38610207500) is the additional default-branch receipt; its conclusion is obtained from GitHub, not inferred from branch success.

| Gate | Verified result |
| --- | --- |
| Development Playwright | 108 passed; final PR run 7.1 minutes |
| Built-production Playwright | 108 passed; final PR run 4.5 minutes |
| English screenshots | Six zero-difference comparisons in both suites, maxDiffPixels=0; no updates |
| Scanner tests | 186 passed |
| Codemod fixtures | 24 passed |
| Application unit tests | Nine passed |
| App/scanner typechecks, lint, scanner build | Passed |
| Nx builds | Both apps passed without cache |
| Protected evidence | 78 hashes and exact exception records verified before/after tests |
| CI preference restoration | Passed |
| Security | GitGuardian passed; no new credential findings |

Local full development and production suites also passed 108 each. The dedicated production configuration passed 25 focused checks. Browser coverage includes seven widths (390/899/900/901/1100/1101/1440), both languages/apps, repeated switching, navigation/state preservation, pointer/keyboard/modal focus, glyph-level bidi/clearance, sidebar/chart/KPI/branding and print behavior. Actual production Arabic Dashboard glyph was visually inspected outside tracked directories and points left.

Initial PR run 38604804170 failed one brand activation timing assertion with 107 passes and all six visuals passing; the contemporaneous push run passed both full suites. Exact Chrome 156 instrumentation under CPU throttling proved stale English DOM href activation before React committed Arabic locale. The test now waits for document direction and exact localized href and checks the entire destination URL. Five throttled probes, 42 repeated development branding cases and 14 production cases passed. No runtime or baseline change hid the failure; the repaired head passed both fresh full checks.

## Scanner and policy

Live result: **440 facts, 42 findings, 39 actionable, complete=true, nine nonblocking diagnostics, zero policy warnings**; JSON and Markdown deterministic. Delta from the starting 435/47 inventory: five CSS facts added, no facts removed; seven explicitly unisolated JSX risks removed, two deliberate RTL-alignment manual CSS findings added. Four stale RTL-08 reference bindings were retired after exact source-sink proof. Historical issue meanings/severities and all exception/source-pin records remain unchanged. Retained brand, progression, pagination and chart findings are static review evidence, not claims that measured behavior remains defective. See AUTOMATION_REVIEW.md for the exact inventory and physical declarations.

## Protections and limitations

Six English PNGs, 68 documentary PNGs, two archived reports and two pinned source files retain their hashes. All five exception records remain identical. No new automation approvals, source-pin refresh, screenshot threshold change, force push, admin bypass, red-check merge or production deployment occurred. Original feature remote/checkouts and the pre-existing untracked diagnostic file were preserved; only the tracked temporary workflow on main was removed.

This is verified lab delivery, not production deployment certification. Deployment-origin cross-app navigation needs separately approved hosting. Scanner grammar/coverage uncertainty remains visible; 39 actionable findings are not 39 proven defects. Browser/macOS updates can require new native-input investigation. Codemod replacement is staged with a durable recovery journal, not claimed multi-file crash-atomic. Unknown semantics stay manual. Copilot's automated review quota was exhausted; no independent Copilot approval is claimed.

## Rollback and future changes

Use scoped normal revert PRs with full gates; preserve protected evidence and restore related live policy/test expectations together. Codemod journals restore only exact recorded changes at the same commit and refuse concurrent user edits; no production journal is needed because none was applied. Native CI normalization should be reverted only with a separately reviewed environment/evidence plan, since returning to en_US reproduces the known native date mismatch. No temporary diagnostic workflow or runner preference mutation is left active outside the guarded, restoring permanent CI job. Production deployment, protected evidence migration and new semantic automation approvals require their own explicit authorization.
