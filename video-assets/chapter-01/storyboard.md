# Chapter 01 — Nx Monorepo: three independent prototypes

Experimental assets, not final YouTube delivery. Target 1920×1080, 30 fps, H.264 MP4, no audio.
Source: latest worktree at b127325a14ad3bf8e70aede2a2e29b9dae638355.

## A — Real developer screencast — planned 36 s, BLOCKED

- 0–5 s: Actual VS Code displaying the latest repository; establish context.
- 5–12 s: Real Explorer opens apps; show invoicing and procurement.
- 12–19 s: Real Explorer opens libs; show design-system and shared.
- 19–26 s: Open actual nx.json and one project.json. Explain inferred Vite tasks.
- 26–36 s: Integrated terminal runs `npx --no-install nx show projects --json` with daemon/interactive UI disabled; pause on actual output.
- Gentle post-production zoom only; never redraw or fabricate editor/terminal output.
- Use the real capture in raw-recordings/vscode-desktop-original.mov after permission/control is restored. Review in/out points before using the supplied edit script.

## B — Animated architecture — PRODUCED, 36 s

- 0–3 s: One workspace / two applications.
- 3–11 s: Reveal Invoicing, then Procurement.
- 11–18 s: Reveal shared UI and shared business/locale library.
- 18–28 s: Animate four verified app-to-library import relationships.
- 28–32 s: Animate design-system → shared (locale and types).
- 32–36 s: Hold complete architecture; “A shared change can affect both applications.”
- Arrows mean source dependencies, not HTTP requests or a runtime call trace.
- This view focuses on apps/libraries. `rtl-scanner` is a fifth Nx project, intentionally outside this diagram.

## C — Hybrid — planned 41 s, BLOCKED

- 0–12 s: Real VS Code context and folders.
- 11.5–29.5 s: Dissolve into the full B architecture animation, compressed to 18 s.
- 29–41 s: Dissolve back to real configuration/terminal footage.
- Source footage is shared with A, but deliverables remain separate and scripts are editable.

All holds are silent spaces for a later Arabic voice-over; no music, speech, or synthesized IDE footage.
