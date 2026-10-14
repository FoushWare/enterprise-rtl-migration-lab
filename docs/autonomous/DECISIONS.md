# Decision log

## 2026-10-14 — execution boundary
Preserve both original checkouts and user work. Create codex/autonomous-rtl-delivery from verified feature HEAD for remaining application/tooling/docs work; use independent main-based CI fixes. Never merge failing PR #2 merely because main is unprotected.

## 2026-10-14 — unblock diagnostics without a red merge
GitHub permits --ref branch dispatch when the workflow is already registered on the default branch. Execute reviewed A-D branch version directly, record exact run and head, and leave PR #2 unmerged until applicable checks pass. This replaces the prior assumed merge-before-experiment dependency; no branch rules are bypassed. Reference: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow .

## Protected source pins
Treat existing pinned source bytes/digests as immutable under this mission unless separately authorized. Prefer unpinned semantic boundaries; do not hide stale-policy warnings or silently refresh pins. Retain original finding/binding meanings until an evidence-backed live policy disposition is documented.

## 2026-10-14 — smallest proved date-CI fix
Run 38597366727 isolated AppleLocale causally: B alone changed native widget order; C/D did not. Normalize only AppleLocale on ephemeral CI runner before browser creation, record original typed preference presence/value, and restore in always cleanup. Keep browser context en-US/UTC, application/date values and screenshots untouched. Validate full existing English baseline workflow, not the fixture alone.

## Bidi and progression boundaries
Change only the existing Arabic View all invoices translation glyph to left-facing; retain English key/text and protected Dashboard bytes. Confirmed currency/name/address defects use bdi ltr for canonical amounts/emails and auto for human text; known numeric CSS surfaces use explicit LTR isolation without changing input caret/locale formatting. Arabic DialogTitle plaintext needs explicit right alignment to preserve reading-start geometry. This avoids the protected shared string-only title API and its source pin. Two new physical RTL-alignment findings remain visible MANUAL_REVIEW, not suppressed or reclassified. Four stale reference bindings are retired only after their original seven source sinks disappeared through explicit isolation; original issue definitions/severity and all five exceptions stay intact.

## Hosted brand-link transition race
PR #4's first PR run 38604804170 failed one brand activation assertion (107 passed, all six English visuals passed), while push 38604705938 passed full dev/production. Exact Chrome 156 with CPU throttling reproduced the boundary: browser URL had ar but old DOM anchor href en and html dir ltr were activated before React committed the locale transition. Synchronize only the activation test on both document direction and exact localized href; strengthen the destination assertion to complete URL. No product link, state/provider, CSS or snapshot changes. Five equivalent throttled probes then preserved ar, and all 14 branding cases repeated three times passed. CI uses bounded two workers, already exercised locally, without dropping cases, increasing retries or relaxing tolerance.
