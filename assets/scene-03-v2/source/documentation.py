"""Create provenance, editable timing and review notes; never write into Study."""
from pathlib import Path
import json,hashlib,subprocess
r=Path(__file__).resolve().parents[1];s=r.parents[2]/'enterprise-rtl-migration-lab-study'
shots=json.loads((r/'timeline/shots.json').read_text());vo=json.loads((r/'timeline/voiceover.json').read_text())
facts=[
('03-02','Nx workspace, apps/libs/tools grouping','package.json; nx.json; tsconfig.json','Grouping is editorial, not a captured Nx graph. Source imports establish relationships.'),
('03-03/04','Independent applications and routes','apps/invoicing/src/App.tsx:18; apps/procurement/src/App.tsx:149','Invoicing owns invoice state; Procurement owns status filtering. No app-to-app imports.'),
('03-05','Shared shell and UI capabilities','libs/design-system/src/index.tsx:42,50,110,166,204,385','Both use shell/navigation/cards/fields/tables. Modal usage verified in Invoicing; no claim of Procurement business dialogs.'),
('03-06','Shared business and locale capabilities','libs/shared/src/index.ts:95,128,136,154,171,193; libs/shared/src/i18n.tsx:42','LocalStorage API-shaped facade, not a remote backend. Fixtures may be overridden by browser storage.'),
('03-07','Document RTL versus theme LTR','libs/shared/src/i18n.tsx:50; libs/design-system/src/runtime.tsx:6,78','Study uses document RTL with fixed MUI LTR. Emotion is used through MUI/styled; no active migrated RTL cache. Five conceptual layers are not a literal call stack.'),
('03-08','Static evidence, findings and scan diagnostics','tools/rtl-scanner/src/scan.ts; tools/rtl-scanner/src/cli.ts','No new scan, terminal result or migration success is represented. Findings are potential risks, not proof of runtime bugs.'),
('03-08','Constrained transformation tooling','tools/rtl-codemod/codemod.mjs:191,210,214,286','Fresh complete scan, approved plain CSS AUTO_CANDIDATE and exact source/approval checks. Safety gates remain unchanged.'),
('03-09','Runtime dependencies vs source analysis','apps/*/src/main.tsx; apps/*/src/App.tsx; libs/design-system/src/index.tsx:1,36','Both applications consume shared libraries. Design System imports Shared; runtime provider is shared. Lines show relationships, not literal network requests. Tooling separated by dashed boundary; no app-to-app link.'),
('03-10','INV-2026-1048 / Northstar Studio / USD4800 / Pending','libs/shared/src/index.ts:95,128,136; apps/invoicing/src/components/InvoiceTable.tsx:75; apps/invoicing/src/pages/InvoiceDetails.tsx:17','Real recorded list-to-detail footage plus source fixture. Details resolves existing in-memory collection, no second fetch.'),
('03-11','Potential ownership layers','apps/; libs/design-system/; libs/shared/','Conceptual investigation framework. Illumination does not assert a proven cause for a particular defect.')]
md=['# Scene03 V2 — Architecture Evidence','\nDraft – Pending Review. Source inspected on 2026-10-29. No application source, tests, configuration, policies or fixtures changed. No fresh test/CI/scanner success claim.','\nStudy root: '+str(s),'\n|Shot|Verified fact|Source and line anchors|Qualification|','|---|---|---|---|']
for f in facts:md.append('|'+ '|'.join(f)+'|')
md+=['\n## Footage provenance','All browser footage is reused from existing genuine recordings, not recaptured during this redesign. Arabic/English editions localize graphics and guides; the authentic source UI remains in its recorded language. No simulated UI.','\n```json',json.dumps(json.loads((r/'timeline/footage.json').read_text()),indent=2),'```','\nNo code-editor or terminal recording is loaded by this composition. Presenter is an original faceless vector silhouette, not footage of a human or a generated impersonation.','\nExisting stale locale documentation mentioning migrated support is not treated as evidence: executable Study behavior takes precedence. Cached Nx graph is not presented as a newly computed dependency map.']
(r/'outputs/Scene-03_Architecture_Evidence.md').write_text('\n'.join(md))
visuals=['Replaceable silhouette, animated navy field, headline; no code background.','Workspace hub splits into three groups; staggered icon entrances at10.65/11.30/11.95s.','Invoicing real footage20–27.5; Procurement real footage27.5–35, blue/teal identity.','Two independent ownership columns; connector pulses and screen/route/behavior labels.','Component capabilities fan out; shared consumers; separate Invoicing-only dialog qualification.','Shared capability spokes: business types, fixtures, utilities, locale, local storage.','Five conceptual layers at65.55/66.20/66.85/67.50/68.15; Study RTL document and LTR theme.','Separate scan beam/evidence lane and transformation/safety lane; no successful execution claim.','Import-grounded relationship map; tooling outside runtime boundary.','Animated List → Selected → Details; authentic recording100–115, source time48–63.','Five possible ownership layers illuminate; investigation prompt, no root-cause assertion.','Radar icon and final question; fade out during final0.35s.']
rows=['# Narration-to-Visual Timeline','\n30fps; all guide times are estimated, pending real voice recording. Clean exports have no voiceover captions. No synthetic narration. Speech estimates use2.5AR/2.7EN words per second and are not measured word timings.','\n|Shot|Frames inclusive|Time|Visual action / transition|','|---|---|---|---|']
for sh,v in zip(shots,visuals):rows.append(f'|{sh["id"]}|{sh["start"]*30}–{sh["end"]*30-1}|{sh["start"]}–{sh["end"]}s|{v} Each shot uses0.35s entrance/exit ease.|')
rows+=['\n## Exact guide captions and appearance times','Full sentences and estimated speaking durations are in the AR/EN voiceover scripts. Phrase boundaries below are editable captions, never subtitles of a recorded speaker.']
for lang in ['AR','EN']:
 rows += ['\n### '+lang,'|Shot|Start–End|Caption / estimated spoken phrase|','|---|---|---|']
 for e in vo[lang]:rows.append(f'|{e["shot"]}|{e["start"]:.2f}–{e["end"]:.2f}|{e["text"]}|')
rows+=['\nThe suggested long Arabic closing sentence was shortened to fit5s naturally: «إزاي نكتشف مخاطر الـRTL في المشروع؟». Later scene scripts remain pending approval.']
(r/'outputs/Scene-03_Synchronization-Timeline.md').write_text('\n'.join(rows))
cues=json.loads((r/'timeline/sound-cues.json').read_text());lines=['# Sound Design Cue Sheet','\nOriginal procedural non-speech effects. Stereo48kHz; peak '+str(round(cues['mix_peak_dbfs'],2))+'dBFS. Separate editable stems under audio/stems/. No music or synthetic voice.','\n|Frame|Time|Duration|Stem|Visual cue|','|---|---|---|---|---|']
for e in cues['events']:lines.append(f'|{e["frame"]}|{e["time"]:.3f}|{e["duration"]}|{e["track"]}|{e["description"]}|')
(r/'outputs/Scene-03_Sound-Design_CueSheet.md').write_text('\n'.join(lines))
(r/'source/presenter.json').write_text(json.dumps({'status':'Replaceable placeholder, not final presenter','timeline':[0,10],'asset':'media/presenter-placeholder.svg','bounds':[110,180,600,800],'replacement':'Replace the isolated SVG asset, or add a real presenter video element and draw it at these bounds in source/composition.js; do not change the navy background or other scenes.'},indent=2))
(r/'README.md').write_text('''# Scene03 V2 — Draft – Pending Review

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
''')
print('Evidence, synchronization timeline, cue sheet and editable project guide written.')
