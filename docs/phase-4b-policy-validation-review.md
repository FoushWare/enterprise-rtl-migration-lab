# Stage 4B — Policy validation review

Project: Migrating Enterprise React Apps to RTL Without Breaking LTR.

Recommendation: **APPROVE** for the bounded Stage 4B safeguards. This recommendation is not approval for transformations, semantic pilots, suppression expansion, CI enforcement or Stage 4C. Stage 4B remains uncommitted for review.

## Repository baseline and Stage 4A closure

Before implementation, branch `feat/phase-3-rtl-scanner` was at approved Stage 3 commit `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`. Tracked files were clean; the only untracked files were the nine approved Stage 4A planning documents. Those nine documents alone were committed as `9c2df15f1df50ea101150b48f6d31249678a9b0f`, with message `docs(rtl): complete phase 4a migration planning`. The working tree was clean after that commit. Nothing was pushed.

## Implementation and validation rules

An explicit validator checks external JSON before returning a Policy. It reuses the existing TypeScript JSON AST for duplicate JSON members, JSON-pointer record locations and exact UTF-16 offsets. No dependencies were added. Validation rejects unknown fields, unsupported schema versions/rule IDs, missing required fields, invalid enums, wrong primitive/container shapes, incompatible mechanism ownership, duplicate records and contradictory owner/exception declarations. It does not coerce values.

Policy schema version remains 1. Required top-level fields remain schemaVersion, generatedStyleOwner, ownership, approvals, exceptions, issueBindings, dynamicExceptions and roles; ownerOverrides remains optional. Paths must be normalized repository-relative POSIX paths without parent traversal, absolute/drive paths or backslashes. Unicode paths remain supported. Pins require lowercase 64-character SHA-256 digests. Resource bounds are one million policy characters, ten thousand array entries and 4,096 characters per validated string. Malformed JSON and existing symlink config files fail explicitly; absent config retains the previous empty-policy behavior.

Supported owners and mechanism mappings are checked. Generated ownership remains separate from authored CSS/inline/Emotion ownership. Unknown ownership does not establish automation eligibility. Overrides must resolve to a compatible extracted context. Conflicting approvals and exceptions on the same declaration block. Semantic approvals require an exact unique declaration, whole-file source pin, matching owner and supported logical equivalent; applicability also reuses the unchanged conservative detector's admission safeguards. This does not establish semantic intent independently or grant transformation authorization. The actual approval list remains empty.

Dynamic exceptions remain restricted to the reviewed background-property catalog. Their source digest, expression digest and applicable extracted dynamic diagnostic must match. They cannot become broad directional suppression. The two English HTML-root exceptions match their existing exact finding anchors and declaration hashes.

## Stale policy, coverage and exits

Auditing uses the unsuppressed source catalog. Records cannot validate themselves against an already suppressed result. Diagnostics point to the existing repository-relative policy filename and the record's JSON source span, including its pointer in the message.

| Record or condition | Diagnostic treatment |
| --- | --- |
| Stale semantic approval | BLOCKING, POLICY_STALE_APPROVAL |
| Stale ownership override | BLOCKING, POLICY_STALE_OVERRIDE |
| Stale intentional/directional exception | BLOCKING, POLICY_STALE_EXCEPTION |
| Changed/unmatched dynamic-background pin | BLOCKING, POLICY_STALE_DYNAMIC_EXCEPTION |
| Stale reference binding or brand association | WARNING, POLICY_STALE_INFORMATIONAL |
| Stale metadata-only INFORMATIONAL document exception | WARNING, POLICY_STALE_INFORMATIONAL |
| INFORMATIONAL exception on a directional rule | Remains a directional suppression; stale record blocks |
| Unsupported source coverage for effect-bearing record | BLOCKING, POLICY_UNSUPPORTED; source coverage diagnostic also retained |
| Incompatible/contradictory owner or approval | BLOCKING, POLICY_CONFLICT |
| Invalid generated finding identity | BLOCKING, POLICY_FINDING_ID_INVALID |
| Invalid schema/input or duplicate record | Rejected before scanning; source-located POLICY_INVALID/POLICY_DUPLICATE or specific invalid-path/JSON code |
| Unsupported policy version/rule | Rejected before scanning, POLICY_UNSUPPORTED |

A blocking policy audit disables effect-bearing approvals, exceptions, dynamic exceptions and ownership overrides in the partial report; source evidence and unsuppressed risks remain available. Metadata associations do not authorize transformations. No records are refreshed or removed automatically.

CLI exit behavior preserves precedence: invalid policy errors emit stderr and exit 2 without a successful JSON report; blocking audit/source coverage emits an incomplete partial report and exits 2. Warning-only stale metadata allows complete=true and default exit 0. An explicit --fail-on-findings returns 1 for actionable findings only when analysis is complete; exit 2 always wins. Complete still means no blocking coverage/analysis uncertainty, not zero risks or zero warnings. No CI gate was enabled.

## Compatibility and actual Atlas output

Report schema remains version 2. No canonical fields, category meanings, severity enums, finding IDs or rule implementations changed. New diagnostics use the existing diagnostic path/range/code/message/blocking/rationale contract. Blocking policy uncertainty uses the existing impact category; warning-only policy diagnostics omit the already optional impact field, with Markdown displaying POLICY. No new report schema is required.

Two repeated direct CLI runs in each format were byte-identical to one another and to the archived Stage 3 JSON and Markdown. The current valid policy produces no additional policy diagnostics:

| Inventory/category | Count |
| --- | ---: |
| Extracted facts | 419 |
| Report entries | 58 |
| Actionable candidates | 55 |
| Metadata entries | 3 |
| MANUAL_REVIEW | 50 |
| RUNTIME_CONFIG | 5 |
| INTENTIONAL_LTR | 2 |
| INFORMATIONAL | 1 |
| AUTO_CANDIDATE | 0 |

All nine existing nonblocking coverage diagnostics remain visible; complete=true retains its previous meaning. All three source/expression-pinned background exceptions and both English-root exceptions retain their behavior. Changed source/expression pins, missing applicability and stale blocking records are tested. Archived reports and current configuration were not edited.

## Verification results

Verification on 2026-10-12, without snapshot updates:

| Check | Actual result |
| --- | --- |
| npm run rtl:scan:test | 119 passed: 60 original and 59 focused policy tests, four files |
| npm run rtl:scan:typecheck | Passed |
| npm run rtl:scan:build | Passed |
| npm test | Four application unit tests passed |
| npm run lint | Passed |
| npm run typecheck | Passed |
| npm run build | Three Nx tasks succeeded, two cached; daemon/plugin isolation disabled for this environment |
| Existing Playwright suite | 20 passed in 11.8 seconds, including six original English visual tests |
| Six English SHA-256 manifest entries | All six matched |
| Phase 2A protected files | 120 tracked application/library/test/screenshot/config files byte-identical to Phase 2A checkpoint 61491d7f6dd359033c4a9e80b556d3b3e2446305 |
| Documentary screenshots | All 68 PNGs unchanged, included in protected-file comparison |
| Determinism | JSON and Markdown repeated outputs exactly match archived Stage 3 reports |
| Read-only direct scan | Inventory, bytes and modification timestamps unchanged for 265 repository files, including ignored build/cache files; excluded .git, node_modules and test-result/report directories |
| Diff whitespace | git diff --check passed |

The focused tests cover malformed/unknown JSON, enums/shapes/types, paths/digests, duplicates/conflicts, stale approvals/overrides/informational records, exact pins, UTF-16/CRLF/Unicode locations, deterministic diagnostics, exit precedence, unchanged five exceptions, and rejection of unsafe approval contexts. Negative fixtures are isolated scanner fixtures. Manual temporary-root CLI checks also verified invalid-input exit 2, incomplete stale-policy exit 2 taking precedence over the findings switch, warning-only default 0/explicit findings 1, and distinct parser-coverage failure reporting.

Applications, styling, translations, business data, runtime providers, original tests, rules/model/coverage/CLI, configuration, dependencies, protected evidence and archived findings remain unchanged. No CSS conversion, runtime fix, codemod, semantic approval, CI enforcement or Stage 4C work occurred.

## Changed files

- tools/rtl-scanner/src/policy-validation.ts — closed runtime schema and source locations.
- tools/rtl-scanner/src/policy-audit.ts — applicability, conflict and stale-record diagnostics.
- tools/rtl-scanner/src/policy.ts — strict loading and preservation of original policy text for locations.
- tools/rtl-scanner/src/scan.ts — audit integration and blocking-policy fallback.
- tools/rtl-scanner/src/report.ts — readable fallback for policy warnings without source impact.
- tools/rtl-scanner/tests/policy.test.ts — 59 focused tests.
- tools/rtl-scanner/tests/fixtures/policy-unknown-field.json — invalid-field fixture.
- tools/rtl-scanner/tests/fixtures/policy-conflicting-owners.json — ownership conflict fixture.
- tools/rtl-scanner/README.md — safeguard behavior and limitations.
- docs/phase-4b-policy-validation-review.md — this review.

## Remaining limitations and review decisions

Policy v1 has no per-record findingId, expiry or separate ownership-exception structure. Unknown fields are rejected rather than inventing those mechanisms. Generated finding IDs are validated for supported shape, rule agreement and uniqueness; existing policy applicability remains anchored by source/context/property/digests. Ownership exceptions use the existing override and directional exception structures. A future ID-binding/expiry contract needs separate approval.

Whole-file pins intentionally invalidate after unrelated edits. Validation cannot prove arbitrary cascade, computed runtime ownership, portal behavior, complete consumer reachability or semantic intent. Reference bindings remain metadata associations rather than runtime defect proof. Existing 18 evidence-dependent candidates and nine-case calibration limits remain unchanged. Runtime validators make records structurally reliable and fail closed on stale applicable records; they do not make all physical properties safe to transform.

Additional unexcepted detection and per-approval admission checks add work; actual policy has zero approvals. No performance benchmark is claimed. Future policy/rule catalogs require coordinated validator updates and tests. The read-only scan check is separate from build/test commands, which may create ignored build/cache/test artifacts.

No unresolved Stage 4B blocker was observed. Reviewer decisions: approve this uncommitted safeguard scope, and separately authorize any subsequent commit. Stage 4C still requires explicit pilot semantic and implementation approval; this review grants neither.
