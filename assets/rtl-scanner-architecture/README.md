# RTL Scanner — Architecture & Data Flow

**Status: Draft – Pending Review. Not approved for final production.**

This self-contained educational asset contains seven React + TypeScript scenes, shared components, central timing, an interactive Arabic/English preview, authored landscape/vertical layouts, and silent H.264 renders. Everything new stays under this directory. Earlier `video-assets/` productions remain read-only references; nothing was moved out, overwritten, or deleted.

## Local preview

From the repository root (existing node_modules required):

```sh
node assets/rtl-scanner-architecture/scripts/build.mjs
node assets/rtl-scanner-architecture/scripts/server.mjs
```

Open http://127.0.0.1:3037 . Use Play/Pause, Reset, the scene menu, aspect menu, language button and timeline. Individual scenes: `/?scene=parsing&aspect=9:16&lang=ar`. English: `lang=en`. The server serves only this asset and binds to loopback. No external fonts or media are fetched.

## Render

Installed Chrome and FFmpeg are required. No download or paid service is used. Set `CHROME_PATH` if Chrome is installed elsewhere.

```sh
# One independent composition
node assets/rtl-scanner-architecture/scripts/render.mjs --scene parsing --aspect 16:9 --lang ar
# Complete compositions (Arabic default)
node assets/rtl-scanner-architecture/scripts/render.mjs --aspect 16:9
node assets/rtl-scanner-architecture/scripts/render.mjs --aspect 9:16
# English composition
node assets/rtl-scanner-architecture/scripts/render.mjs --scene coverage --aspect 9:16 --lang en
```

IDs: `cli`, `orchestrator`, `parsing`, `detection`, `coverage`, `reporting`, `overview`, or `all`. Every ID works with either aspect/language. H.264, yuv420p, configured 30 FPS, no audio. Landscape 1920×1080; vertical 1080×1920. Individual scene exports are also provided in outputs/. The complete provisional preview is 53.4 seconds; **this is not a final duration**.

## Timing / future voice-over

Edit `config/timing.ts`. Each scene has duration, entrance, transition, hold and pause, in seconds. Render length is duration + hold + pause. Set `fps` centrally. Markers are local scene times: e.g. `parser.evidence.extracted`, `detection.finding.created`, `coverage.incomplete.warning`. Change markers to align major semantic events with future approved speech. Small connector/reveal easing remains presentational and can be adjusted in scenes/components.

Reorder the timing array to reorder the combined composition. Content lives in config/content.ts, not the narration. No narration, music or speech timing has been generated. Replace provisional timing, review mobile legibility and rerun checks before final approval.

## Build / tests

```sh
node_modules/.bin/tsc -p assets/rtl-scanner-architecture/tsconfig.json
node assets/rtl-scanner-architecture/tests/check.mjs
node assets/rtl-scanner-architecture/scripts/verify-source.mjs
node assets/rtl-scanner-architecture/scripts/export-scenes.mjs
node assets/rtl-scanner-architecture/scripts/validate-preservation.mjs
```

verify-source reads the sibling latest worktree by default; override with `SCANNER_ROOT=/absolute/path`. It bundles current scanner TypeScript only into this asset, records source SHA256s and runs the illustrative CSS fixture. It does not edit or execute application code. `references/verified-source.json` is the saved source/provenance record; original source repository unchanged.

## Layout / reuse

- components/: ArchitectureNode, AnimatedConnector, TerminalAnimation, CodeHighlight, EvidenceCard, FindingCard, DiagnosticBadge, CoverageStatus, ReportPreview, Reveal.
- scenes/: independent exported scene functions + sceneComponents registry.
- config/: timing and bilingual educational labels.
- references/: original visual reference, verified source snapshots/fixture result, preservation manifest.
- scripts/: local build, preview server, deterministic frame renderer, fixture verification, validation and scene export.
- outputs/: Draft combined previews, individual scenes, representative frames, validation evidence.

No Remotion project existed. Reusing the repository's React/TypeScript, esbuild and Playwright avoids creating an unrelated package/lockfile or adding a competing framework to the earlier Python/FFmpeg productions. Deterministic React frames feed FFmpeg; animation is time-driven, with no CSS wall-clock animation or random motion. The existing root build/scripts/configuration are untouched.

See DECISIONS.md for corrections to the reference diagram and CONTENT.md for each scene's learning objective. Final review/approval is manual and explicit; neither successful rendering nor a passing test changes Draft status.
