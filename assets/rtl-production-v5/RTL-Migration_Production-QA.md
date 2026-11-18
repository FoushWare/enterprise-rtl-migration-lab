# RTL Migration Production QA

**Draft – Pending Review** ·2026-10-28. Actual delivery, not a plan-only completion. No commits/pushes, no production edits or RTL repairs.

## Delivered media

|File|Duration|Frames|Format|Decode|
|---|---|---|---|---|
|[Scene-02_Broken-RTL_EN_V5_Clean.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_EN_V5_Clean.mp4)|134.000000s|4020|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[Scene-02_Broken-RTL_EN_V5_Preview.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_EN_V5_Preview.mp4)|134.000000s|4020|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[Scene-02_Broken-RTL_AR_V5_Clean.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_AR_V5_Clean.mp4)|134.000000s|4020|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[Scene-02_Broken-RTL_AR_V5_Preview.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/scene02/outputs/Scene-02_Broken-RTL_AR_V5_Preview.mp4)|134.000000s|4020|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/master/outputs/CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Clean.mp4)|184.021333s|5520|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[CoffeeBreakWeb_RTL-Migration_EN_Master_V1_Clean.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/master/outputs/CoffeeBreakWeb_RTL-Migration_EN_Master_V1_Clean.mp4)|184.021333s|5520|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[CoffeeBreakWeb_RTL-Migration_EN_Master_V1_Preview.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/master/outputs/CoffeeBreakWeb_RTL-Migration_EN_Master_V1_Preview.mp4)|184.021333s|5520|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|
|[CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Preview.mp4](/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5/master/outputs/CoffeeBreakWeb_RTL-Migration_AR_Master_V1_Preview.mp4)|184.021333s|5520|1920×1080 /30FPS /H.264 +AAC48k stereo|PASS|

Video duration is134.000s for Scene02 and184.000s of picture/5520frames for Master. Master container duration184.021333s includes normal AAC packet padding; this is not an additional scene.

## Real evidence and coverage
- Fresh isolated Chrome156 audit: 48 actual UI PNGs, routes/DOM geometry in audit/runtime.json, supplemental functional interactions in audit/interactions.json. Existing native Brave session was not controlled or changed.
- Eleven confirmed visible problem entries, including shared symptom families; screen list and limits in RTL-Breaking-Inventory.md. Static risks and suspected icon spacing are not presented as proven bugs.
- Real moving footage comes from approved V4 original native recordings; today’s screenshots re-verify the current runtime. No fake browser/IDE or screenshot slideshow substituted for footage.
- All confirmed meaningful issue families have timestamped Scene02 clips and anchored localized red/white labels. Shared field/table issues recur in both apps; this is not eleven independent root causes. Mobile-left drawer belongs to sidebar family; card punctuation belongs to bidi family.
- Canonical data/behavior checks remain correct in tested paths: Pending4invoice/3order rows, actual route navigation, search empty state, settings save in isolated storage and modal focus/Escape. No invoice persisted.

## Visual QA
- Encoded Preview sample from each of20 shots in each language reviewed in scene02/qa/contact-* and individual AR/EN-00…19.jpg. Full-resolution Arabic form frame also inspected for shaping and mixed text.
- Real UI/VS Code fills1920×1080 with proportion-preserving crop/scale. No added presentation background, floating screenshots or permanent caption band. Small native recorded window edges may remain at plain-view source boundaries; these are not inserted letterboxing.
- Original V4 attached annotation graphics and source geometry reused. The same camera transform moves border, label and footage together. Plain UI appears before1s zoom, border/label fade enters at1.65s, holds through duration−0.9s, then returns before cut.
- Blue INVOICING /purple PROCUREMENT badges are independent editorial layers. They do not represent application features. Labels describe actual visible differences, including the logo’s actual reversal rather than falsely saying it stays LTR.
- Guide captions are separate ASS/SRT/JSON; only Preview includes them. Clean retains defect labels/SFX. Arabic uses bidi isolation for mixed English tokens; no voice generated. Timing is estimated pending the presenter recording.
- Chart/pagination guides are placed near top rather than covering their lower issue labels. Other guides use compact bottom boxes, with no permanent band. Final exact-word timing needs real VO.

## Audio QA
- Original procedural non-speech SFX only, separate camera/highlight/switch/transition stems. sound-cues.json records exact frame-snapped entrances. No licensed music, generated voice or sampled narration.
- Final decoded AAC peaks≈−18.81dBFS, no clipping, voiceover headroom. Full decode PASS for all8 files. Clean/Preview/AR/EN decoded audio identical within each scene/master group.
- The first render exposed fractional packet durations in raw-derived clips. Final scene picture resets PTS by frame index, ensuring4020 frames and exact134s; stale attempts remain only under initial-timing. pre-level-match preserves intermediate quieter audio attempts. Neither directory is a delivery source.
- Master uses individual Scene01/Scene02 exports with stream-copy assembly, not any previous master. Scene order0–50 then50–184; boundary/end frames inspected under master/qa. Existing SFX tails decay before cuts. Brief Scene01 issue teasers and contextual Scene02 language switches are intentional; do not claim there is zero repeated UI content.

## Editable sources
- source/render-scene02.py + scene02/timeline.json: original recording paths, source offsets/crops, timings, issues and camera motion.
- Original V4 graphics remain referenced in place, not overwritten; edit a copied layer under a new version for revisions. source/voiceover.py + guide-*.ass + SRT/voiceover.json: independent narration guides. source/sound-design.py + audio/stems: separate sound tracks.
- source/assemble-master.py + master/timeline.json + Master-Video-Scene-Manifest.md: reproducible non-destructive scene order/variants. Scene01 editable sources remain assets/scene-01-v5; its presenter placeholder remains replaceable.

## Scene03 readiness
All seven requested preparation documents exist in scene03, plus proposed shot timings, actual source hashes, import-grounded SVG/PNG/Mermaid and provider-tree Mermaid. Existing Nx cache has5workspace nodes with no workspace edges; external npm edges exist. No fake Nx dependency was added. Scene03 has not been recorded/rendered or appended. Scanner hands-on has not started.

## Safety verification
- Study branch/HEAD/status/staged+unstaged patch identical before/after. SHA256 of 248 tracked files unchanged.
- 14 selected source/Scene01 media hashes unchanged; old Scene02/Scene01 outputs were never written. All task outputs are under /Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl/assets/rtl-production-v5.
- No source/test/config/protected-fixture changes, Codemod, scanner policy changes, branch switches, commits or pushes. Existing untracked Study files were not written; they were not individually snapshotted before the audit, so this report does not claim a full before/after untracked hash inventory.

## Remaining limitations
- No exhaustive device/browser/accessibility certification: LTR mobile baseline, every record, print, every native date picker and long user-entered text remain untested. See inventory.
- Two route-audit console404 messages have unknown URL provenance; no page exception was observed. Supplemental interaction response log is empty. No confirmed business-data defect inferred.
- Browser audit is separate automated Chrome; moving footage is genuine historical native Brave, not a newly captured desktop session. No new OBS recording is required for the confirmed issue families shown. Scene03 genuine VS Code recording remains future work.
- Existing Scene01 presenter is a silhouette placeholder; scripts remain guides and no final human VO exists. Both master and scenes await explicit editorial approval.

Audio cue check: all 28 planned SFX windows contain nonzero PCM; frame/time receipts in scene02/audio-cue-verification.json. Verification uses complete decoding and representative encoded-frame inspection, not a claim that all eight videos were watched continuously in a GUI player.
