# Scene03 V2 — Draft – Pending Review

Isolated cinematic diagram-first animation project. Previous scenes and masters are references only.

- source/index.html + composition.js: editable deterministic Canvas2D motion, icons, colors, captions-independent graphics, separate presenter asset.
- source/render-picture.mjs: Chrome/Playwright frames → FFmpeg H.264, 1920×1080,30fps.
- timeline/shots.json, voiceover.json, guide-AR/EN.ass: editable timing/captions. Scripts and SRT in outputs/.
- audio/stems/: original separate effects; no recorded or generated narration.
- media/: genuine cropped recording excerpts and isolated silhouette. pre-cue-alignment is an intermediate, not the review deliverable.
- outputs/: four final Scene03 V2 files and reports.
- master/: four Master V3 variants, independent-scene EDL and original PCM mix.

Open source/index.html using a local HTTP server rooted at this folder; use ?lang=ar or ?lang=en and window.seekFrame(frame) to scrub. Caption rendering is a separate FFmpeg ASS pass: Preview has removable guides; Clean does not.

Reproduction order: voiceover.py, sound-design.py, render-picture.mjs for both languages, export.py, qa.py, master.py, qa.py, verify-preservation.py. Existing final outputs are intentionally not overwritten by renderer/master. Use a new version directory for revisions. Bundled Python requires Pillow; Node requires existing @playwright/test. No dependencies were installed.

Human voice timing, final presenter footage and creative approval remain pending. Do not continue to hands-on Scanner production without approval.
