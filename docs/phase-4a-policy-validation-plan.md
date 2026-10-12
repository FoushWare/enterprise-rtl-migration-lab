# Stage 4A — Prerequisite policy-validation design

Project: **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Stage 4A planning only, 12 October 2026. Branch `feat/phase-3-rtl-scanner`, approved HEAD `0de6d609cbfb9aae662d1cb7c9589c38592bb21b`. All treatments are proposals; no approval, code/policy/test change, commit or push is granted by these documents.

## Current contract and strict-design proposal

Current loader (tools/rtl-scanner/src/policy.ts:13–19) checks schemaVersion, some arrays and required fields, then trusts a TypeScript cast. It does not comprehensively reject unknown fields, wrong scalar types, malformed owner/role/override shapes, malformed hashes or stale entries. Findings/diagnostics are retained by current exact-match behavior; changing this is future Stage 4B work, not documentation-driven implementation now.

Propose a data-only runtime schema, preferably a reviewed JSON Schema compiled with a mature validator (e.g. Ajv) if a new dependency is explicitly approved; alternatively equivalent strict validators using the existing runtime. Pin any future dependency only in approved Stage 4B. Validate without coercion/default insertion or unknown-field stripping. No executable config, source imports, expression evaluation or automatic policy rewrite. A schema-valid policy still requires semantic approval for transformations.

## Safeguard specification

| Safeguard | Proposed validation / diagnostic | Negative tests / consequence |
| --- | --- | --- |
| Strict schema | Exact top-level field set; schemaVersion literal, arrays/objects/strings/enums, maximum sizes; all present records fully checked | null/arrays as ownership, numeric reviewer, missing fields, excessive payload; invalid config exit 2 before applying entries |
| Invalid category | Exception category restricted to the supported intentional/informational enum, not arbitrary finding reclassification | AUTO_CANDIDATE/MANUAL/typo category rejected; never grant approvals through an exception |
| Unknown fields | additionalProperties:false at every record level; report JSON pointer | top-level typo and nested sourceDigests typo rejected; do not silently ignore |
| Stale entries | Match rule/path/context plus declared fingerprint to current canonical evidence; diagnose unmatched approvals/exceptions/roles/overrides and reviewed bindings separately | deleted selector/file, renamed context, changed declaration; retain original unsuppressed finding, explicit stale-entry diagnostic |
| Source pins | Lowercase 64-hex digests, normalized repository-relative POSIX path, no absolute/traversal/escaping symlink; check source and value digest independently | malformed hash, absent source, value change and unrelated whole-file edit produce pin mismatch; no silent re-pin |
| Finding IDs | Optional future record link must match rule namespace + 24-hex identity and an actual current finding; rule/anchor/source must agree | well-formed but unknown ID, swapped rule/path, truncated/hash collision; do not accept syntactic ID alone |
| Ownership | Allowed owner enum including explicit unknown; precise source-context ownership, overrides fully validated; incompatible custom/generated pipelines rejected for approvals | conflicting owners, duplicate opposing override, impossible mechanism/owner claim; unknown owner keeps manual review |
| Approval semantics | Nonempty reason/reviewer, explicit declaration/value/logical equivalent and owner/source pin; supported writing mode/cascade prerequisites | arbitrary target property, sx spacing/unit ambiguity, geometry target, stale semantic approval; no AUTO admission |
| Duplicates/conflicts | Detect duplicate record keys, overlapping scope, contradictory exceptions/approvals and ambiguous binding matches | last-write-wins must not hide disagreement; reject conflict for enabled policy use |
| Diagnostics and reporting | Versioned stable policy diagnostic code/path/pointer/rationale; retain findings and source diagnostics, no suppression by omission | source nine diagnostics persist; exception entries show original category/reason; no timestamp/machine path |

Current schemaVersion 1 valid Atlas records must remain accepted without rewriting rtl-scanner.config.json. Use optional validated findingId only through an explicit compatible schema addition/version decision; current approvals/exceptions are anchor-based, not silently converted to ID-based records. Separate report-schema changes from policy-schema changes. Preserve all existing finding IDs, ranges, original categories, source digests and deterministic ordering when validated current input is unchanged. Proposed new diagnostic metadata can require a report-version change: decide it explicitly and provide fixtures/adaptor documentation rather than mutating schema v2 invisibly. Keep archived Stage 3 JSON/Markdown as immutable review artifacts; new scans write separate outputs.

## Exit behavior and stale-policy trade-off

Proposed default: detected malformed schema/conflicting active policy/invalid pin or stale effect-bearing approval/exception → exit 2, incomplete policy application, retained unsuppressed risks in a partial report when model generation is possible. Invalid JSON must emit a safe stderr diagnostic and exit 2; do not invent trustworthy findings if parsing fails. Decorative association bindings with no classification effect may be warning-only after explicit schema policy, but remain visible and cannot count as calibrated coverage. Decide this warning/blocking boundary before Stage 4B.

Completed supported analysis exits 0 by default even with review risks; optional explicit findings gate remains exit 1, and incompleteness takes precedence. Unknown owners remain explicit manual-review inputs unless they materially block directional evidence or are used to approve automation. No CI enforcement is enabled. Current loader-detected errors exit 2; these stronger guarantees are future proposals.

## Pin granularity and compatibility

Retain whole-file pins for existing dynamic-background exceptions initially: unrelated edits deliberately invalidate them. An optional future declaration/local-constant dependency fingerprint can reduce maintenance only if dependency closure and fingerprint algorithm/version are proved; the conic expression depends on external totals and local status colors. Never replace whole-file pins with expression-only hashes that miss changed color dictionary inputs. No automatic hash refresh, expiry extension or reused stale reviewer approval. Existing current root-markup exceptions use originalDigest; proposed stale reporting supplements matching, not broad suppression.

## Mandatory gates before use

| Use | Prerequisites |
| --- | --- |
| Automated transformations | All schema/category/unknown-field/path/hash/ID/ownership/conflict/stale/semantic checks; dry-run/determinism/read-only fixtures; explicit exact declaration approvals; reviewed cascade and units; rollback plan. Validator alone authorizes nothing. |
| Policy-driven suppression/reclassification | Strict categories, scope matching and stale/conflict/source/ID checks; original finding retained, reason/reviewer visible, no coverage diagnostic deleted. Existing intentional-English metadata remains preserved and does not prove Arabic runtime readiness. |
| CI enforcement | Above validation/exit/schema-compatibility tests, reproducible supported scope, approved treatment of incomplete analysis/stale entries, reviewed population metrics and explicit human gate authorization. Current optional CLI flag is not CI enablement. |

Stage 4B deliverables proposed: schema/validator, policy diagnostics and negative fixtures, deterministic JSON/Markdown compatibility tests, read-only integration tests, schema migration notes and Atlas baseline comparison. Unit/fixture tests must cover every negative row; integration runs both temp roots and actual Atlas. Preserve application sources, zero semantic approvals and six/68 evidence hashes. Stop for review before pilots or runtime work.
