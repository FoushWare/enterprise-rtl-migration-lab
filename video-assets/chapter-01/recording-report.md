# Recording report — 22 October 2026

## Actual delivery status

| Requested prototype | Status | Validation |
|---|---|---|
| 01-developer-screencast.mp4 | NOT PRODUCED — native UI-control session blocked | No placeholder or simulated footage created |
| 02-animated-architecture.mp4 | PRODUCED | 36.000 s, 1920×1080, 30/1 fps, H.264/yuv420p, no audio; complete decode passed |
| 03-hybrid-screencast.mp4 | NOT PRODUCED — depends on authentic A footage | No still-image substitute created |

This is a partial result: one playable prototype, not three completed prototypes.

## Architecture verification

Source workspace: enterprise-rtl-migration-lab-latest, commit b127325a14ad3bf8e70aede2a2e29b9dae638355.

- Both applications import @atlas/design-system and @atlas/shared.
- design-system imports shared locale and types.
- Shared libraries do not import application code in the inspected source.
- Nx uses @nx/vite/plugin with buildTargetName=build and devTargetName=dev.
- Four application/library nodes are shown. `rtl-scanner` is a fifth discovered Nx project, deliberately outside this application-focused diagram.
- Real command `./node_modules/.bin/nx show projects --json` exited 0. Actual output is saved in raw-recordings/nx-command-verification.txt. It was executed outside the IDE, so it is not presented as recorded integrated-terminal evidence.
- Available package scripts include `npm run dev`, `npm run dev:procurement`, `npm run build`; equivalent targeted development commands are `npx nx dev invoicing` and `npx nx dev procurement`.
- Exact source paths and hashes are in scripts/architecture-evidence.json.

## Tools and permissions

- Existing FFmpeg, ffprobe, VS Code, Nx 23.3.0, clang and bundled Python/Pillow were used. No dependencies were installed.
- Initial sandbox-only permission probe reported false/false and display=0×0. This did not establish host permissions. Host-level probe then established Screen Recording=true, Accessibility=false.
- After the user enabled access, host probe established Screen Recording=true and Accessibility=true, display=1440×900.
- Native app automation was retried after permission changes, reconnect, session reset and the user bringing VS Code to the current desktop.
- VS Code accessibility tree and real window screenshots could be read. However, keyboard/file-navigation actions did not yield stable intended results; coordinate actions returned noWindowsAvailable, with additional stale-element/session errors. A terminal menu could be opened, but an integrated Nx execution could not be verified.
- No authentic screencast was claimed or generated from static screenshots. No macOS privacy settings were changed by production scripts.
- A Swift probe initially failed because the local compiler and SDK/module-cache setup did not match. A read-only Objective-C permission probe compiled with existing clang instead.

## Visual QA and editorial boundaries

B was inspected at six staged PNG previews, including the complete dependency diagram. It uses progressive reveals, animated directed dependency lines, high-contrast readable labels, and silent holds for later Arabic narration. There is no voice-over or music. The source/relationships are verified; animation timing and captions are editorial.

A/C cannot be compared as finished videos. Their storyboard and edit pipeline are prepared, but actual capture/control remains the blocker. Do not present scripts as completed footage.

## File safety

All production scripts/assets are in the original checkout's separate video-assets/chapter-01 directory; application code is read from the latest worktree.

The latest worktree already had a modified nx.json (analytics=false plus formatting) at task entry. It was preserved. Tracked-file SHA256 snapshots for both checkouts were compared before and after; results are in scripts/source-integrity-result.json. No application/configuration/business logic, baselines, scanner rules or GitHub Pages files were edited. No commit, push or branch switch occurred.

## Reproduction and next action

- B: run the existing bundled Python with scripts/render-architecture.py; it renders the deterministic editable 36-second MP4.
- Recheck host permissions with the compiled scripts/check-permissions.m helper when necessary.
- For authentic A: resolve the native UI-control session or perform the storyboard manually while scripts/record-screen.sh captures the actual screen. Device index must be checked at capture time, not assumed.
- Inspect raw footage for unrelated/private content before editing; preserve the original take. No camera/microphone device is used (`screenDevice:none`, -an).
- scripts/edit-screencasts.sh refuses missing real footage and does not overwrite existing outputs. Review/edit in/out points for the actual take before running it.
- scripts/validate-videos.py checks presence, metadata, duration, no-audio and full decoding of every completed MP4. Missing A/C are reported as NOT_PRODUCED, not PASS.

Recommended review first: 02-animated-architecture.mp4. Hybrid remains the likely final storytelling direction, pending a genuine A/C comparison.
