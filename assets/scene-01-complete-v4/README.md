# Scene01 — Business Expansion,50s Draft V4

Draft — Pending Review. AR andEN silent H.264 masters,1920×1080/30fps. First20s is original V3 packet-stream reuse; no geographic scene is rebuilt. Remaining30s is real full-frame prerecorded application/developer footage plus clearly separate localized graphics and presenter placeholder.

## Editable layers

1. Base footage: `timeline/edit.json` records exact originals/in/out/crop; `media/base-AR.mp4` and `base-EN.mp4` are new assembled derivatives, not modified originals.
2. Presenter: `layers/presenter-placeholder.svg`, original faceless silhouette, displayed only26–32. No stock clip license was presumed and no photorealistic human or voice generated. `source/presenter.json` sets position/asset/mode independently.
3. Graphics: `layers/graphics.json` localized copy; `source/index.html` editable typography/layout; `source/composition.js` all entrances/exits, effects and background treatment. No permanent caption band. Request copy is educational scenario graphics, not fabricated application UI.
4. Geographic source: original siblingV3 MP4s are referenced, unmodified. Retain that sibling and the Study media sources when moving the project.
5. Timeline: `timeline/TIMELINE_AND_PRESENTER.md` identifies shots, proposed revised Egyptian Arabic VO, presenter insertion and overlay timings. No real or synthetic narration is included.

## Presenter replacement

Record6s for26–32. Put your recording at `layers/presenter-replacement.mp4`, change `source/presenter.json` mode from `silhouette` to `video`, adjust box/style as needed. Clear/key your background externally if desired; this pipeline does not invent camera footage or promise automatic chroma key. The replacement hook is implemented but final-person footage is unavailable and has not been tested with your recording. Silhouette labeling automatically hides in video mode. Re-export to a NEW version folder/output; current renders are preserved.

## Reproduce from repository root

```sh
python3 assets/scene-01-complete-v4/source/build-base.py
node assets/scene-01-complete-v4/source/render-tail.mjs --ar --preview
node assets/scene-01-complete-v4/source/render-tail.mjs --preview
node assets/scene-01-complete-v4/source/render-tail.mjs --ar
node assets/scene-01-complete-v4/source/render-tail.mjs
python3 assets/scene-01-complete-v4/source/assemble-verify.py
```

Existing Playwright/Google Chrome and FFmpeg reused, no app dependency changes. Full tail renders refuse overwrite; base builders skip existing derivatives; assembly verifies existing exports instead of overwriting them. Use a fresh version folder for revisions. Source path is recorded as an absolute path in edit.json and can be updated after relocation. Originals remain read-only inputs.

## Editorial choices / known limits

The updated storyboard's geography0–8 cannot coexist with the explicit requirement to preserve20s V3. Geography stays0–20; products20–26, presenter/request26–32, switching32–38, four-example teaser38–46, question46–48, Scene02 handoff48–50. Products appear sequentially full-screen rather than fictional dual-monitor application screens. No actual client message, synthetic engineer, Arabic UI reconstruction or fabricated bug is used. Existing English UI remains English during product introduction in both localized videos; the labels/request/question/handoff and issue callouts are localized.

The user’s real talking-head shot is intentionally missing, clearly placeholder. Current outputs are silent voiceover-ready drafts; proposed shortened narration needs approval and alignment to actual delivery. No new recording, source-code edit, pin refresh, baseline change, branch operation, commit or push was performed. Scene02 sources and all earlier renders are preserved; verification.json records preservation and decoded-frame checks.
