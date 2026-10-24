# Checkpoint mapping review — original order retained

Every supplied abbreviation resolves to a unique commit and was confirmed by GitHub. No stage was reordered or silently substituted.

| Stage | Disposition |
| --- | --- |
| 01 / 02 — 2fe522fa | Correct shared checkpoint: the original English app and readiness audit coexist. Stage 02 is source analysis, not an RTL implementation. |
| 03 — 61491d7f | Correct Phase 2A source and original 68-image evidence checkpoint. |
| 04 — 0de6d609 | Correct scanner detection/adjudication closure; archived findings belong here, not current final metrics. |
| 05 — 9c2df15f | Correct planning-only closure; do not illustrate it as an application fix. |
| 06 — 05138f1c | Correct strict policy/staleness validation checkpoint. |
| 07 — 85f4dde0 | Correct bounded status-dot/legend spacing pilot, not a broad logical CSS migration. |
| 08 — 1098eb78 | Correct activated runtime. Not the foundation-only e472d34f; shell protection is still intentional here. |
| 09 — 767e70f5 | Good cumulative UI checkpoint after earlier sidebar/chart/KPI/brand/arrows and the new bidi boundaries. It is the specific bidi fix, not the sole commit implementing every UI repair. Individual fixing commits are listed in comparisons/manifest.json. Forms/dialogs/tables include verification-only coverage at 14c217761c574a65e8b409909bc5dad4b31f0f66, not an invented custom remediation commit. |
| 10 — 0f8f4c44 | Correct conservative codemod implementation; zero production eligible candidates and zero bulk conversions. |
| 11 — de7f7676 | Accurate for installing final CI/regression gates and retiring diagnostics, but premature as a final-green checkpoint. a4a1894 repaired a brand test locale-commit race; a34f24044afef2724c0a56764eadcc2d3750d5aa is the documented validated source head, normally merged at 94898ceb0d6ccbdab3fbf1ed7bf4e7a10121abbe. Recommend a34f2404 for a separate “all gates green” annotation, while retaining the requested Stage 11 SHA. |
| 12 — b127325a | Correct final delivery documentation merge. The application implementation was already merged through PR #4; this checkpoint adds closure evidence, not another runtime change. |

Use source/terminal cards for nonvisual stages. No unavailable historical app state was invented. The original Phase 2A issues keep their historical meanings/severities even where later runtime/tests show correct behavior.
