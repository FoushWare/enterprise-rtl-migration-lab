# Phase 4C.2a — Historical scanner regression test repair

Project: Migrating Enterprise React Apps to RTL Without Breaking LTR. Verification date: 12 October 2026.

Final recommendation: **APPROVE** for this focused test repair. No remaining repair blocker was observed. This does not authorize committing the pilot, expanding CSS scope or starting another stage.

## Preflight and root cause

Branch feat/phase-3-rtl-scanner; HEAD 05138f1c5f68db92bcd94afe11e63fd83322f8cb. Preflight matched the expected state: styles.css contained only the two approved margin-inline-end replacements; docs/phase-4c1-semantic-review.md and docs/phase-4c2-css-pilot-review.md were untracked. Staging was empty. Both reviews were read. Their contents and pilot stylesheet bytes were hashed before this repair and remained unchanged afterward. KPI margin-right:5px remains untouched; ownership is custom-css; no stale policy was present.

The original test, “current Atlas configuration and all five exceptions retain exact archived reports”, coupled a live working-tree scan to an immutable Stage 3 report. After the authorized status-dot and chart-legend conversions, the live scan correctly removes their two physical-property findings. Expecting 58 entries and byte-identical historical output no longer describes live-source correctness. Previous result: 118 passed, one failed, 119 total. The repair does not merely replace the expected count with 56.

## Historical integrity strategy and provenance

During development, existing archived JSON and Markdown were verified byte-for-byte against approved Stage 3 commit 0de6d609cbfb9aae662d1cb7c9589c38592bb21b using read-only Git access. No existing standalone historical source fixture or archived-artifact hash fixture was found. Exact SHA-256 expectations were independently computed from those committed bytes and retained as constants in policy.test.ts:

| Artifact | Trusted committed-content SHA-256 |
| --- | --- |
| docs/phase-3-rtl-findings.json | ba990cf34f1a3e44317549829ef90793a6dabafada36feeb5d19460e7dbd9737 |
| docs/phase-3-rtl-findings.md | e22879500f08c9f73179a778dde7e68ab8b44b1f718cf75afb0e69163d52c2ac |

The normal test suite invokes no Git, checkout, network or historical source tree. The hashes are committed-artifact expectations, not values recalculated from current application output. They independently detect any archived byte change before historical JSON is used as a reference. There is no self-comparison as the sole integrity check.

Historical test verifies hashes, schema/kind/completeness, 419 facts, 58 entries, nine diagnostics, exact category counts, 55 actionable entries, unique finding IDs and the two original candidate IDs/contexts/declarations. Serializing the hash-verified historical model must reproduce the exact immutable JSON and Markdown. This checks historical formatting without asking current source to regenerate the old scan.

No new fixture, duplicate historical artifact or source tree was required. Hash constants and two focused tests live in the existing test file only. Historical full-source scanner reproduction is deliberately not claimed; integrity/formatting and live-source analysis are separate responsibilities.

## Live-source correctness strategy

The new live test loads the current policy through the unchanged strict validator and scans the working tree twice. It requires complete=true, unchanged policy digest, same discovered/skipped file catalog, unchanged extracted fact count and all nine exact existing diagnostics, with no blocking or policy diagnostics. Repeated JSON and Markdown must match.

For each approved selector, extracted CSS evidence must contain exactly one margin-inline-end with its approved value/original declaration and no margin-right. The two original physical finding IDs must be absent. The KPI margin-right:5px must still be present.

The live ordered finding-ID list must equal the hash-verified historical list minus exactly these two IDs:

- RTL.CSS.PHYSICAL:5c1ae10d9ddc0c6daf3c5945
- RTL.CSS.PHYSICAL:911c43329429945ea8519fad

This catches unexpected additions, removals, duplicates and ordering changes independently of aggregate counts. Every remaining nonlocation finding field is compared, including category, severity, confidence, owner, original declaration, evidence IDs, issue associations, rule/version, rationale/treatment and exception metadata. No AUTO_CANDIDATE may appear.

Absolute source ranges are excluded from historical/live semantic comparison because an approved longer property spelling shifts later offsets. Related-location paths remain compared. Live evidence and plain-CSS finding ranges are separately validated by slicing the actual source and requiring the original declaration bytes. This preserves meaningful source anchoring while permitting harmless offsets to move. Existing adapter fixtures continue testing exact line/column/UTF-16/CRLF mappings.

Each dynamic-background record is explicitly checked against current whole-file SHA-256 and a matching source-expression digest/property/path in extracted evidence. Each intentional English-root exception must uniquely match rule/path/context/original digest and retain INTENTIONAL_LTR plus its exact reason. All five records must remain present, approvals empty, CSS owner custom-css and no policy diagnostics. There is no broad suppression or validator change.

## Original assertion and safeguard preservation

| Original assertion/property | Retained or replacement coverage |
| --- | --- |
| Three dynamic and two English-root exceptions | Live test retains counts and adds exact source/expression/finding-pin checks for each |
| Empty approvals | Live test retains assertion; no AUTO_CANDIDATE permitted |
| 419 facts | Historical exact count; live same inventory size plus actual migrated declaration evidence |
| 58 findings | Historical exact count; live exact historical ID set/order minus two approved removals, full nonlocation semantics |
| Nine diagnostics | Historical count; live exact diagnostics equality and explicit nonblocking/no-policy checks |
| complete=true | Both historical and live assertions |
| JSON byte equality | Historical serializer equals independently hash-pinned artifact; live repeated serialization equals live repeat |
| Markdown byte equality | Historical serializer equals independently hash-pinned artifact; live repeated serialization equals live repeat |
| Two intentional exception categories | Live exact exception categories/reasons/anchors plus original category-list assertion |
| Schema/unknown-field/type/path/digest validation | All existing focused policy tests unchanged; loading actual policy still validates it |
| Ownership conflicts, stale records and fail-closed behavior | All existing policy/detection negative tests unchanged |
| Changed background source/expression invalidation | Existing fixtures unchanged; live pins now individually asserted |

No skip/only, mock, policy relaxation, report regeneration or broad new snapshot was introduced. One former test was replaced by two independent tests, increasing the total from 119 to 120.

## Actual report comparison

| Metric | Historical Stage 3 | Current approved CSS pilot |
| --- | ---: | ---: |
| Facts | 419 | 419 |
| Report entries | 58 | 56 |
| Actionable findings | 55 | 53 |
| MANUAL_REVIEW | 50 | 48 |
| RUNTIME_CONFIG | 5 | 5 |
| INTENTIONAL_LTR | 2 | 2 |
| INFORMATIONAL | 1 | 1 |
| AUTO_CANDIDATE | 0 | 0 |
| Coverage diagnostics | 9 | 9 |
| Complete | true | true |

Counts describe observed output, not the only live correctness criterion. Exactly the two approved IDs disappear. All remaining IDs/classifications persist; two subsequent stylesheet finding ranges shift as previously documented. No stale/conflicting policy record appears and all nine source diagnostics remain nonblocking. Direct CLI JSON and Markdown repeated runs are deterministic. Historical artifacts remain unchanged.

## Verification results

| Check | Actual outcome |
| --- | --- |
| npm run rtl:scan:test | 120 passed across four files |
| npm run rtl:scan:typecheck | Passed |
| npm run rtl:scan:build | Passed |
| npm test | Four application unit tests passed |
| npm run lint | Passed |
| npm run typecheck | Passed |
| npm run build | Three Nx tasks succeeded, two cached; daemon/plugin isolation disabled for environment |
| Existing Playwright suite | 20 passed in 11.4 seconds |
| Six English screenshot regressions | Passed with original maxDiffPixels:0, no snapshot update |
| Baseline SHA-256 manifest | All six matched |
| Phase 2A protected evidence | All tracked screenshot/gallery/manifest files unchanged; all 68 documentary PNGs preserved |
| Archived JSON/Markdown | Byte-identical to approved historical artifacts |
| Pilot and pre-existing reviews | Byte-identical to pre-repair hashes |
| git diff --check | Passed |

Production scanner modules, rules, serializers, policy implementation/configuration, application files other than the preserved existing pilot, original application tests, dependencies and archived evidence were compared against HEAD and remain unchanged. No new semantic approvals, runtime RTL changes or CI gates exist.

## Changed-file inventory and limitations

New changes in this repair only:

- tools/rtl-scanner/tests/policy.test.ts — separate historical/live assertions and pinned expectations.
- docs/phase-4c2a-test-repair-review.md — this review.

Pre-existing work retained without edits:

- libs/design-system/src/styles.css — exactly the two approved pilot conversions.
- docs/phase-4c1-semantic-review.md — untracked semantic review.
- docs/phase-4c2-css-pilot-review.md — untracked pilot review documenting its historical one-test failure; intentionally not rewritten by this repair.

The live allowlist intentionally describes this precise pilot checkpoint. A later independently approved migration must explicitly review its expected finding delta rather than silently accepting arbitrary changes. Historical hashes need no refresh for live migrations; altering historical evidence is outside scope. Tests rely on local tracked archived artifacts and source files, not mutable Git history or network access during execution. Offset-insensitive comparison does not prove runtime behavior or complete consumer reachability; those limitations remain documented by the scanner and pilot reviews.

No repair blocker remains. Final recommendation **APPROVE**. No commit, push, additional CSS migration, production scanner refactor or Stage 4C.3 work occurred. Stop for human review before closure or another stage.
