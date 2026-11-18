# Scene03 Recording Shot List

**Draft – Pending Review**. Twelve shots retained. Browser clips are authentic prior recordings; current runtime was re-verified. Missing native editor shots are documented, not fabricated.

|Shot|Time|Produced content / next OBS take|
|---|---|---|
|03-01|0–10s|Replaceable presenter|
|03-02|10–20s|Nx workspace folders|
|03-03|20–35s|Real applications|
|03-04|35–45s|Actual App source|
|03-05|45–55s|Design-system responsibilities|
|03-06|55–65s|Shared data and locale|
|03-07|65–75s|Runtime direction layers|
|03-08|75–85s|Scanner/Codemod concept|
|03-09|85–100s|Verified import map|
|03-10|100–115s|Real invoice navigation|
|03-11|115–125s|Cross-layer ownership|
|03-12|125–130s|Scanner handoff|

## Exact OBS replacements for unavailable editor navigation
Record the Study VS Code window only,1920×1080 target,30FPS, editor font24–28px,2s handles before/after each action. Do not save files or run fixes. Never show credentials or unrelated windows.
1. Workspace take: open package.json scripts, nx.json Vite plugin and both project.json names. Optional `npm run` only lists real scripts; do not replace with a fake terminal.10s.
2. Main/source take: open apps/invoicing/src/main.tsx:8, then App.tsx:18 and routes:40. Open Procurement main/App in a separate take.10–15s.
3. Design-system take: libs/design-system/src/index.tsx:166 DataTable, then:50 FormField,:110 Modal,:385 AppShell. Record slow actual Go to Definition navigation,10–15s.
4. Shared take: libs/shared/src/index.ts:95 seedInvoices, then:128 total,:136 money,:155 listInvoices.10–15s.
5. Runtime take: libs/shared/src/i18n.tsx:50 beside libs/design-system/src/runtime.tsx:78. Observe html.dir via read-only console; inspect theme.direction at:7. Do not alter them.10–15s.
6. Tooling take: show CLI filenames/imports only. Do not execute a scan or applying Codemod in this introductory shot.
7. Invoice take: isolated browser4200/invoices?demo=unmigrated-rtl&lang=en → click INV-2026-1048 → confirm Northstar/Pending/USD4800. Record real click, preserve IDs and values. Existing authentic Arabic action already supplies this cut.

## Reproduction commands
From the Study root, `npm run dev` selects invoicing:dev; `npm run dev:procurement` selects procurement:dev. Existing processes were running, so do not start duplicates. No pnpm commands were assumed. Detailed scanner command walkthrough is a later scene.

## Editable presenter
source/presenter.json controls silhouette/video mode, independent media path and box. Replace only its media layer with real presenter footage. No voice or lip sync is embedded.

## Narration-first cue map
See timeline/voiceover.json and Scene-03_Voiceover_AR/EN.md: exact sentences, start/end, estimated natural speaking time. SRT/ASS are separate. At each scene reveal, animate nodes individually; import paths draw only after connected nodes are visible. Real narration will establish final word timings.