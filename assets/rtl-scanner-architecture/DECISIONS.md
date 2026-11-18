# Decisions — Draft – Pending Review

## Source verification

Primary source: local latest worktree at b127325a14ad3bf8e70aede2a2e29b9dae638355. Saved full source snapshots + SHA256s: references/verified-source.json. Read CLI, orchestration, CSS/HTML/TypeScript parsers, rules, model, policy, policy audit, coverage and reporting. Ran the actual CSS parser and detect() on an isolated illustrative fixture. Result: RTL.CSS.PHYSICAL, MANUAL_REVIEW, Minor, High confidence, unknown ownership, suggestion:null. No automatic conversion is presented.

The published Architecture Explorer URL was attempted but unavailable through the web reader. We used verified current local implementation, not assumed website content. No remote changes, workflow dispatch, repository checkout switches or scanner source modifications.

## Corrections to the supplied reference

1. Actual npm script is `npm run rtl:scan`; `npm run rtl scan` is not the registered script. Actual CLI options are --root, --format json|markdown, --fail-on-findings. No invented --src or --out flags.
2. scan.ts is coordinator. It discovers Nx source roots, reads sources, loads policy, dispatches parsers, classifies diagnostics, runs audit detection, audits policy, selects effective policy, runs final detection, computes metrics and assembles Report. CLI serializes afterward.
3. Parsers return Evidence AND Diagnostics. Diagnostics are records; not a separate pipeline stage. detect() also directly analyzes TypeScript AST and can append Diagnostics. A Diagnostic does not inherently create a Finding.
4. An initial detect() pass provides policy-audit risk anchors; it is not the final finding collection. Effect-bearing policy records can be disabled if policy auditing produces blocking uncertainty.
5. coverage.ts classifies uncertainty BEFORE the final detection pass. Final complete is calculated in scan.ts as !coverage.some(d => d.blocking), after detection has added its own diagnostics. Thus the seven scene order is a teaching order, not a literal call trace. Overview connections are a simplified responsibility map.
6. Metrics are findings by category/severity/confidence, unique affected files and reference case IDs. No expected-vs-analyzed denominator, percentage coverage calculation or independent checkCoverage() function exists. 100/80/20 is explicitly hypothetical. No real coverage percentage is shown.
7. Report formats are JSON and Markdown. No HTML report or pretend report screenshot. scan.ts assembles Report; report.ts exposes json()/markdown(); CLI writes stdout and sets exit status. ReportPreview is a schematic schema with placeholders, not an execution artifact.
8. Findings are conservative risks, not proof of visual defects. Physical margin-left alone does not prove start/end semantics or automation eligibility.

## Visual / motion decisions

Clean light architecture cards derive from the reference's color language. Blue CLI, green coordination, amber evidence, coral detection, purple uncertainty, teal reporting. Rebuilt as React components; PNG never used as animated content. Code/identifiers remain LTR; Arabic headings use native browser RTL shaping. Common typography, spacing, connector arrows and draft badges.

Reveals, typed command, growing dispatch tracks, evidence extraction connectors, warning-state change, scene focus fade and overview zoom are deterministic functions of local time. Final timing is intentionally provisional. Both layouts are separately authored: vertical stacks the flow, changes type scale and grid, with top/bottom review-safe space; it is not a crop. Platforms' final overlay positions still need a real-device review before publishing.

## Isolation and preservation

All new files, build output, screenshots and renders are under assets/rtl-scanner-architecture/. Old productions stay in video-assets/ unchanged; they were not literally moved because that would violate preservation. No shared files modified and no new dependencies installed. The previous Python/FFmpeg assets remain reproducible with their original environments. Their MP4 decodability and file hashes are checked separately; this does not claim a full rerun of every old production pipeline.

## Approval and limitations

status.json and every render visibly state Draft – Pending Review. Nothing is final until explicit user approval. No final script, narration, music, fixed episode pacing, upload or publication.

English controls/labels are supported; the educational Arabic wording is provisional. Independent scene rendering is supported by URL/CLI. Stored representative frames are inspected for both layouts; English interactive navigation is checked, but a complete English video is not exported in this pass. Optional external visuals are not required; missing reference PNG cannot break rendering.

This is a reusable React/TypeScript asset with a local deterministic browser renderer, not a Remotion project. Reuse was preferred over installing a second framework. Future Remotion integration can wrap exported components if later explicitly desired; current production does not depend on it.
