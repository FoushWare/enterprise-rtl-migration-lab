# Scene 01 — Narration-led first10s, Draft V2

Draft — Pending Review. Read `timeline/NARRATION_VISUAL_TIMELINE.md` first. The narration timeline was authored before rendering. All speech timings are ESTIMATED, pending the creator's real recording. No synthetic voice or person, no later shots, no Scene02 changes.

## Deliverables

- `outputs/Scene-01_Opening_10s_Clean_Draft_V2.mp4`: silent, clean H.264 first10seconds.
- `timeline/NARRATION_VISUAL_TIMELINE.md`: full proposed Scene01 shot table, exact Egyptian Arabic script, caption schedule, presenter placeholders, transition plan and52 one-second rows. The52s revision is a proposal only.
- `source/timing.json`: frame-aware shot/phrase/caption scheduling, preview camera and pin animation settings. End frame/time exclusive at30fps.
- `timeline/CAPTIONS_GUIDE.srt`: separate editable0–10 guide captions; not burned into clean master.
- `timeline/FINAL_SUBTITLES_ESTIMATED.srt`: distinct provisional0–10 subtitle scaffold, NOT final subtitles.
- `source/scene.js`, `index.html`, `render.mjs`: actual Three.js3D project and reproducible render pipeline.

Shared textures/vendor reference preserved V1 through relative symlinks. Keep both sibling folders when moving this project; no old asset was moved or changed. Existing root Playwright dependency and Chrome/FFmpeg are reused. Reproduce from repository root: `node assets/scene-01-opening-v2/source/render.mjs`. Renderer refuses to overwrite export; create a new version for subsequent revisions.

Clean MP4 intentionally has no “Expanding to the Middle East” title in0–10: that announcement is spoken only in the next proposed section. Regional arcs foreshadow the network during the Enterprise Platform clause. Guide captions are review overlays for an editor, not displayed as if a real recorded narration already existed.

Opening source uses a slow establishing push, then geographic travel5.1–9.5. HQ begins3.0 with Europe phrase, arcs5.6/6.7/7.8, destination pins6.0/7.1/8.2. All exact frame values and estimated speech onsets are in the timeline. Remaining Scene01 and Scenes02–09 are not rendered; later-scene narration remains pending approval.

See V1 README for Earth texture provenance and Three.js license. See outputs/verification.json for codec/dimensions/frame-count/duration/full-decode checks. A successful render does not constitute creative approval.
