# Production map

Use this index to find version-specific evidence. Status labels below are what the inspected README currently documents; they are **not a fresh creative approval**. A successful render or QA pass does not imply approval.

## Scene and asset roots

| Root | Documented state / scope | Start with |
|---|---|---|
| `assets/scene-01-opening-v1` | Draft, first 10-second opening | [README](../../assets/scene-01-opening-v1/README.md) |
| `assets/scene-01-opening-v2` | Draft, narration-led first 10 seconds | [README](../../assets/scene-01-opening-v2/README.md), [narration timeline](../../assets/scene-01-opening-v2/timeline/NARRATION_VISUAL_TIMELINE.md) |
| `assets/scene-01-opening-v3` | Draft, geographic journey | [README](../../assets/scene-01-opening-v3/README.md) |
| `assets/scene-01-complete-v4` | Draft 50-second Scene 01; V3 footage reuse plus new edit layers | [README](../../assets/scene-01-complete-v4/README.md), [timeline](../../assets/scene-01-complete-v4/timeline/TIMELINE_AND_PRESENTER.md) |
| `assets/scene-01-v5` | Draft Scene 01 V5 edit | [README](../../assets/scene-01-v5/README.md), [QA](../../assets/scene-01-v5/outputs/Scene-01_V5_QA_Report.md) |
| `assets/rtl-production-v5` | README labels production V5 Draft – Pending Review; Scene 02/Master rendered and Scene 03 preparation only | [README](../../assets/rtl-production-v5/README.md), [QA index](../../assets/rtl-production-v5/RTL-Migration_Production-QA.md) |
| `assets/scene-03-v1` | Draft Scene 03 and Master V2 | [README](../../assets/scene-03-v1/README.md), [QA](../../assets/scene-03-v1/outputs/Scene-03_QA_Report.md) |
| `assets/scene-03-v2` | Draft Scene 03 V2 and Master V3 | [README](../../assets/scene-03-v2/README.md), [timeline](../../assets/scene-03-v2/master/timeline.json), [QA](../../assets/scene-03-v2/outputs/Scene-03_QA_Report.md) |
| `assets/rtl-scanner-architecture` | Draft – Pending Review educational scanner architecture asset | [README](../../assets/rtl-scanner-architecture/README.md), [file manifest](../../assets/rtl-scanner-architecture/outputs/file-manifest.json) |
| `video-assets/` | Legacy/earlier production root visible in this workspace; inspect its own manifests before use. | [Recording guide](../video-demo-guide.md) |

There are multiple scene versions and masters. Do not choose a “latest approved” deliverable by filename or modification time alone. Verify the requested version's README, timeline/manifest, QA report, and explicit approval record.

## Workflow references

- Application capture steps and expected real flows: [recording guide](../video-demo-guide.md)

### Scene 02 — targeted retrieval

**Documented status: Draft – Pending Review.** This status appears in the production README, timeline, and Scene 02 QA report. Existing exports or passing QA do not establish editorial approval; check for an explicit approval record before describing the scene as approved.

#### Production overview

- [RTL Production V5 README](../../assets/rtl-production-v5/README.md) — package status, documented command order, preservation rules, and review boundary.
- [Scene 02 QA report](../../assets/rtl-production-v5/scene02/Scene-02_V5_QA_Report.md) — scene-level summary and reported verification scope.
- [RTL Migration Production QA](../../assets/rtl-production-v5/RTL-Migration_Production-QA.md) — overall reported delivery, coverage, QA, and limitations.
- [RTL breaking inventory](../../assets/rtl-production-v5/RTL-Breaking-Inventory.md) — issue evidence and classification, if investigating what the scene depicts.

#### Evidence and browser automation

- [audit.mjs](../../assets/rtl-production-v5/source/audit.mjs) — isolated-browser screenshots and runtime/DOM evidence.
- [interactions.mjs](../../assets/rtl-production-v5/source/interactions.mjs) — scripted UI interactions and functional checks.
- Existing results, when present: [runtime.json](../../assets/rtl-production-v5/audit/runtime.json), [interactions.json](../../assets/rtl-production-v5/audit/interactions.json), and [evidence screenshots](../../assets/rtl-production-v5/audit/evidence/).

These scripts automate browser inspection and interactions. They are not screen-recording tools; the footage sources are separately listed in the timeline.

#### Timeline and recording sources

- [Scene 02 timeline.json](../../assets/rtl-production-v5/scene02/timeline.json) — shot order, timings, source paths, crop/overlay data, and the documented Draft status.
- [prepare.py](../../assets/rtl-production-v5/source/prepare.py) — prepares the scene timeline and issue inventory from the existing Study video timeline. It writes production files; inspect before running and do not rerun just to discover sources.
- The timeline points to original recordings in the sibling `enterprise-rtl-migration-lab-study` worktree, under `study/demo/videos/` (including `originals/`, `fullscreen-v3/originals/`, `fullscreen-v4/originals/`, and `expanded-v1/originals/`). The recorded paths were present when checked on 2026-10-30; they are machine-specific and may not exist on another machine.
- **Before any production run, validate every source and overlay path referenced by the selected timeline. Do not copy the recordings into this repository or assume the sibling Study worktree is available elsewhere.** If paths are missing, stop and resolve source availability without substituting footage.

#### Rendering and audio

- [render-scene02.py](../../assets/rtl-production-v5/source/render-scene02.py) — renders shot segments and concatenated picture with FFmpeg from timeline sources and overlays.
- [voiceover.py](../../assets/rtl-production-v5/source/voiceover.py) — produces editable narration timing guides/captions; it does not generate spoken voice.
- [sound-design.py](../../assets/rtl-production-v5/source/sound-design.py) — generates separate procedural non-speech sound-effect stems and mix.
- Optional cue reference: [Sound-Design-CueSheet.md](../../assets/rtl-production-v5/scene02/Sound-Design-CueSheet.md).

#### Export and QA

- [export-scene02.py](../../assets/rtl-production-v5/source/export-scene02.py) — muxes audio and creates Clean/Preview exports; Preview includes guide captions.
- [qa-scene02.py](../../assets/rtl-production-v5/source/qa-scene02.py) — checks encoded media metadata/full decode and creates representative contact sheets.
- Optional recorded receipts: [scene02/verification.json](../../assets/rtl-production-v5/scene02/verification.json) and [audio-cue-verification.json](../../assets/rtl-production-v5/scene02/audio-cue-verification.json).
- Deliverable directory: [scene02/outputs](../../assets/rtl-production-v5/scene02/outputs/).

#### Read only what the task needs

| Task | Read first | Optional follow-up | Verify source when… |
|---|---|---|---|
| Establish documented status or review boundary | Production README + Scene 02 QA report | Overall production QA | Approval or present-day status matters. |
| Understand a depicted issue | Issue inventory | Audit/interactions results and matching timeline shot | Confirming a symptom, selector, or behavior claim. |
| Locate footage or edit timing | Scene 02 timeline | `prepare.py` to understand timeline provenance | Before recording, rendering, moving the project, or changing a source path. |
| Understand browser evidence | `audit.mjs` or `interactions.mjs`, chosen by question | Their saved JSON and screenshots | Claiming a runtime observation or functional result. |
| Understand rendering/audio/export | Relevant renderer/audio/export script only | Cue sheet and timeline | Reproducing or changing a render. |
| Assess media QA | Scene 02 QA report | `qa-scene02.py`, verification JSON, and overall QA | Claiming a current pass; rerun only when authorized. |

`prepare.py`, render/export scripts, and QA scripts can write files. Reading them is sufficient for workflow discovery; do not execute them during a read-only investigation.

### Other scene references

- Scene 03 editable diagrams: [import map](../../assets/rtl-production-v5/scene03/architecture-imports.mmd), [provider tree](../../assets/rtl-production-v5/scene03/provider-tree.mmd), and [Scene 03 production plan](../../assets/rtl-production-v5/scene03/Scene-03_Architecture_Production-Plan.md).

The documented pipeline distinguishes automated browser interaction/evidence, deterministic graphics rendering, FFmpeg assembly, and human review. Do not describe a browser audit as screen recording. Verify whether a requested real screen recording exists before claiming it.
