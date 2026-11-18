# Coffee Break Web — Scene03 V1

**Draft – Pending Review** ·130s scene ·314s MasterV2.

Start with [Arabic Scene03 Preview](</Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/scene-03-v1/outputs/Scene-03_Architecture_AR_V1_Preview.mp4>).

All exact video paths/stream results: [QA report](outputs/Scene-03_QA_Report.md).

## Editing
source/index.html and composition.js: independent scene graphics, colors, diagram nodes/paths and genuine base-video layer. timeline/shots.json:12shot timings. source/excerpts.json: actual source with line numbers/hashes. source/presenter.json: replaceable silhouette/video layer. media/base.mp4: self-contained real-footage base; timeline/base.json references raw originals for rebuilding.

Voiceover scripts/SRT are under outputs, ASS/phrase timing under timeline. Audio mix/stems are under audio, original synthesis/cues editable in source/sound-design.py and timeline/sound-cues.json. No narration is generated.

## Reproduce into a new version
Use installed Node/Chrome, bundled Python3.12 (Pillow for QA), FFmpeg/libx264/libass and system Arial. No dependency installation performed. Rendering requires local-loopback/browser permission. Preserve original receipts before rerunning any preparation.

Order: build-base.py → render-picture.mjs --ar / defaultEN → sound-design.py + voiceover.py → export.py → qa.py (scene check) → master.py → qa.py (all8) → final-report.py. Current AR output received a separate runtime wording refinement using render-runtime.mjs and patch-runtime.py; a fresh full render from the final source incorporates it directly. Never overwrite previous scene/master media.

## Limits
The Mac locked and native navigation capture remained stationary. Only the real App view is claimed as newly recorded IDE footage. Labeled source graphics cover missing native takes; optional OBS replacement list is provided. Existing genuine browser recordings were reused and re-verified, not presented as newly recorded today.

## Review
Record the real presenter and narration after review. Detailed Scanner hands-on has not started. No source edits, fixes, application test runs, commits or pushes occurred.