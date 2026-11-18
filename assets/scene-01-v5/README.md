# Scene01 V5 — Cinematic edit, sound and voiceover preparation

**Draft – Pending Review.** Enhancement of V4, not a new globe/scene production. Four50s H.2641080p30 exports: AR/EN Preview with temporary guide captions, AR/EN Clean with permanent visual labels and original SFX only. No generated narration or presenter likeness.

## Independent editable layers

- Actual footage/retimed geography: timeline/edit.json identifies unchanged original paths, crop/in/out/speed. media/ contains only new derivatives. Existing V3 geography20s is retimed to8s; no3D render or country repositioning.
- Presenter: layers/presenter-placeholder.svg and source/presenter.json; original clearly faceless silhouette during17–29. For creator footage set mode=video and provide layers/presenter-replacement.mp4. Box is620×900 at(160,100). Real replacement footage is unavailable; no actual-person lip sync. Hook is implemented but not validated against the creator's future recording.
- Motion/visual labels: source/index.html, composition.js and layers/graphics.json derive from V4's editable composition. Blue INVOICING, purple PROCUREMENT, contrasting business task badge/headline, cyan language-direction labels, red issue annotations from authentic Scene02 footage.
- Voiceover guide: timeline/voiceover.json, editable SRT+Markdown in outputs/, and separate ASS presentation files. Preview burns the guide for review; Clean has none. Guide SRTs remain logical text verbatim; ASS adds Unicode bidi controls for English technical tokens within Arabic. Native libass/Arial fallback handles connected Arabic glyphs; actual exported frames must be visually reviewed.
- Sound: audio/stems/{geography,products,requirement,switch,teaser,question}.wav plus SFX-Mix.wav. Original deterministic non-speech synthesis in source/sound-design.py; no licensing uncertainty from outside stock. Stems50s stereo48kHz PCM16. Final mux AAC192kbps. No original source audio copied, no synthetic voice. Editorial UI-click is a sound-design cue, not claimed captured browser audio.

## Reproduce in a fresh version folder

```sh
python3 assets/scene-01-v5/source/build-base.py
python3 assets/scene-01-v5/source/sound-design.py
node assets/scene-01-v5/source/render-picture.mjs --preview --ar
node assets/scene-01-v5/source/render-picture.mjs --preview
node assets/scene-01-v5/source/render-picture.mjs --ar
node assets/scene-01-v5/source/render-picture.mjs
python3 assets/scene-01-v5/source/export.py
python3 assets/scene-01-v5/source/verify.py
```

Use existing Node/Playwright/Chrome and FFmpeg/libass; no dependency install or app source change. Full picture renderer refuses overwrite. Builders/exporters reuse existing derivatives; create a fresh version rather than treating rerun as a change-aware incremental build. Keep source external paths or update EDL after relocation. Review-only initial crop derivatives were retained with initial-crop-reference suffix and are not final edit inputs.

## Editorial boundaries

Products are sequential full-screen genuine recordings, not fake dual-monitor screens. Only one active app is shown at a time, so an inactive app is not invented or artificially floated next to it. Peripheral UI is dimmed slightly during emphasis. Actual English UI is retained for both language versions during product introduction; permanent product names remain explicit English identifiers as requested. AR business/question copy localizes. Language switching is real archived footage, not recreated behavior; document direction change is visible in rendered UI, not separately instrumented during this edit.

Approved Scene02 source only supplies a6s three-example teaser (sidebar, chart chronology, detail arrow). It does not exhaustively explain all issues or equate scanner risks to bugs. All customers/IDs/amounts shown are existing synthetic fixtures. Task request graphics are fictional educational context, not a real client engagement.

50s exact matches target slots. Speech timing is ESTIMATED; real reading can require retiming. Short temporary guide captions begin at scheduled phrase onsets and move to upper safe area during chart/arrow teaser. They are not publication subtitles. The presenter remains replaceable; no real licensed human clip is asserted. Later scenes are not produced. No historical assets, application code/policies/tests, Scene02 or old previews changed; no commits/pushes.

See outputs/Scene-01_Editing-Timeline.md, Scene-01_Sound-Design_CueSheet.md and Scene-01_V5_QA_Report.md.
