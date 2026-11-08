# Project memory index

This directory is a concise navigation layer for Codex sessions. Detailed explanations and evidence remain in the existing project docs and versioned production folders. Check each linked source before relying on time-sensitive status.

## Start here

- [Architecture map](ARCHITECTURE-MAP.md) — verified app/library boundaries, entry points, and existing diagrams.
- [Production map](PRODUCTION-MAP.md) — scene/version index and where to find sources, exports, and QA.
- [Decisions](DECISIONS.md) — only evidence-backed project constraints and editorial decisions.
- [Handoff](HANDOFF.md) — a dated snapshot of what this inspection verified and what needs rechecking.

## Retrieval workflow

1. Identify the task's app, tool, scene, and version.
2. Open the relevant map, then follow only the source links for that scope.
3. Treat source code, manifests, and the matching version's README/QA as authority for the task. A prior handoff or report is not proof of current state.
4. Before updating memory, recheck the source and date the update. Keep claims labeled **Verified** or **Inferred**.
5. Update only entries affected by completed work. Preserve historical decisions and approval states; report conflicting evidence for review instead of overwriting it. Keep `HANDOFF.md` short and task-specific.

Run the deterministic, dependency-free link and freshness check with `python3 docs/project-memory/validate.py`. It does not edit memory; stale-source messages are advisory. Missing required local links fail the command. External dependencies such as the Study worktree are reported separately.

## Existing primary references

- [Workspace overview and commands](../../README.md)
- [Application architecture](../architecture.md)
- [Testing strategy](../testing-strategy.md)
- [Verification procedures](../verification.md)
- [Recording guide](../video-demo-guide.md)
- [RTL production V5 index](../../assets/rtl-production-v5/README.md)

No database, semantic index, or project-specific MCP is required for this memory layer.
