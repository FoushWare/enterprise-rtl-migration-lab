# Project handoff

**Snapshot checked:** 2026-10-30. This is a record of the files inspected for Project Memory Phase 1, not proof of current production approval or active work status.

## Verified in this inspection

- Root docs describe the Nx workspace, Invoicing and Procurement apps, shared libraries, English LTR baseline, and opt-in Phase 2A RTL demonstration. See [README](../../README.md) and [architecture](../architecture.md).
- Production knowledge is versioned across multiple `assets/` roots and `video-assets/`; the [production map](PRODUCTION-MAP.md) links the inspected roots and evidence.
- The inspected RTL Production V5 README labels that package **Draft – Pending Review** and says Scene 02/Master are rendered while Scene 03 is preparation only. This label is copied from that document; recheck before treating it as current.
- Existing source maps and scene QA reports are linked rather than copied into memory.

## Needs verification before the next production task

1. Identify the explicitly requested scene/version and inspect its README, manifest/timeline, source media, QA report, and approval record.
2. Check live app/server availability separately; documentation does not prove a server is running.
3. Confirm current Git/worktree status before any change. At this snapshot, `assets/` and `video-assets/` appeared as untracked paths; preserve them and recheck their contents/status before acting.
4. Confirm the relevant app source/commands and output path before recording or rendering.

## Suggested next step

For a new task, begin at [the memory index](README.md), follow only the map for the requested scope, then verify the linked source. Update this handoff only after establishing a new, task-specific state.
