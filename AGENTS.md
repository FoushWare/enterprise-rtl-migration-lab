# Workspace guidance

Start task-scoped discovery at [the project-memory index](docs/project-memory/README.md). Follow only the references relevant to the requested app, tool, scene, or output; avoid repository-wide scans unless the task requires them.

- Prefer existing architecture, production, and QA documentation over rewriting it.
- Make minimal, surgical changes within the requested scope. Do not modify application source or historical video assets as part of documentation or memory maintenance.
- Treat memory as an index and verified summary, not a replacement for source files or detailed reports.
- Update only memory entries affected by the completed task. Before a factual change, verify the linked source and record the verification date. Preserve historical decisions and approval states; if evidence conflicts, report the conflict instead of silently overwriting it. Label uncertain or inferred relationships explicitly, and never promote draft status to approval.
- Keep `HANDOFF.md` concise and task-specific. Do not treat a past handoff as current without checking its sources. Run `python3 docs/project-memory/validate.py` to check memory links and report possible source staleness; review warnings rather than automatically rewriting facts.
- Preserve existing user changes and untracked assets. Do not move, delete, regenerate, or overwrite historical artifacts unless the user explicitly requests it.


## Session Guard

Classify each substantive request before implementation:

- **CONTINUE** — related work within the current task; proceed normally.
- **NEW_SESSION** — an independent feature, unrelated refactor, new production scene, or separate project. Stop before implementation and prepare a ready-to-copy handoff using the `session-handoff` Skill.
- **CLARIFY** — the task boundary is unclear; ask one focused question before dependent work.

Do not interrupt trivial questions or related fixes. A fresh session launched with an explicitly approved handoff treats that approved task as **CONTINUE**; do not create another handoff for it. Do not claim exact remaining context or token usage unless that information is available.
