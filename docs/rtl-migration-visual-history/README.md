# Enterprise RTL Migration Lab — visual history

[Open the gallery](index.html) · [Manifest](manifest.json) · [Before / After](comparisons/README.md) · [Checkpoint review](MAPPING_REVIEW.md) · [Validation](validation.json)

<div dir="rtl">المعرض بيحافظ على ترتيب الـ12 مرحلة بالضبط. الصور الأصلية محفوظة في مكانها، واللقطات المُعاد إنتاجها ومقتطفات التقارير متعلّمة بوضوح. ده توثيق للتاريخ، مش تنفيذ RTL جديد.</div>

## Evidence inventory

- **85 existing PNGs referenced, not duplicated:** six protected English visual goldens, 68 original Phase 2A captures (34 English / 34 Arabic), and 11 original English documentation captures from the baseline commit.
- **60 new recreated application screenshots:** exact isolated commits for Stages 07, 08, 09 and 12. Both apps, both languages, 1440×1000 desktop and 390×844 mobile navigation. Later checkpoints also cover invoice/list/create/customer-dialog/settings and purchase-order detail/settings.
- **14 newly rendered report/source cards:** real Git excerpts or actual terminal output, explicitly not application screenshots. Stages 02/04/05/06/10/11 are audit/tooling/planning/verification evidence, not invented intermediate UI states.
- Nine Before / After issue comparisons map the exact fixing commits to original Phase 2A Before images and a recreated representative Stage 09 After state. A paired image is not a new pixel-diff test.

The roadmap order and all supplied commit mappings are retained. Full SHAs/URLs were confirmed against local Git objects and GitHub's read-only GraphQL API; see [receipt](commit-url-verification.json). Remote main was `b127325a14ad3bf8e70aede2a2e29b9dae638355` when checked.

## Open the gallery

Open `index.html` directly; manifest data is embedded to avoid file-protocol fetch restrictions. Or, from repository root:

```sh
python3 -m http.server 4300 --bind 127.0.0.1
# http://127.0.0.1:4300/docs/rtl-migration-visual-history/
```

This is a repository-local gallery, not a deployed GitHub Pages site. Thumbnails open full-resolution images. Type filters distinguish historical-existing, recreated and report-evidence. All 12 stages remain visible in their original order.

## Capture method

New evidence came from detached, immutable worktrees at the exact specified commits. Each installed its own committed lockfile via `npm ci --ignore-scripts --offline --no-audit --no-fund`, using a pre-existing npm cache; no dependency declaration or lockfile was edited. Lifecycle scripts were skipped for safety; the committed platform binaries successfully started the actual Nx/Vite app scripts. Read-only source excerpts were extracted with `git show`, never modernized or cherry-picked. Presentation-only trailing whitespace is removed from numbered cards/text receipts; source SHA256 always identifies the exact original Git bytes.

The actual historical `npm run dev` and `npm run dev:procurement` scripts started both apps with isolated CLI port overrides. Existing servers on 4200/4201 were left untouched. Ports 4570/4571, 4580/4581, 4590/4591 and 4620/4621 were checked free before launch. Each served `/src/main.tsx` was verified to identify the expected isolated source root before capture; child-process exits abort capture. The first attempted collection used occupied default ports and was discarded/replaced in full after this provenance check. The valid Stage 07 receipts show `css` Emotion keys, while activated runtime Stage 08 uses `atlas-rtl`. Readiness and source identity were checked before Playwright capture. Each screenshot used a fresh ephemeral context, existing seed records, en-US browser locale, UTC, light scheme, fonts ready, disabled screenshot animations, and reduced-motion preference. No save/create mutation or persisted fixture data was used. Opening navigation/customer dialogs is recorded per screenshot. Owned server process groups were stopped in finally blocks. [Capture receipts](capture-receipts.json) record actual Node/npm/browser versions, full source SHAs, routes, runtime document direction, Emotion keys and exact reproduction steps.

The shared legacy `demo=unmigrated-rtl` query/banner remains in later snapshots for compatibility; it does **not** mean those later implementations are Before states. Actual source commit and evidence type determine provenance.

Native date inputs follow machine regional preferences beyond Playwright locale. No OS preference writes, date masking, new fixed business data, visual thresholds or snapshot updates were used. New recreated captures are documentary evidence, not replacements for English goldens. Original baseline browser/date settings are not inferred from commit time.

## Real tool evidence

At exact Stage 06, **59 policy tests** passed, including stale/invalid policy fixtures. This is the affected historical suite, not a claim of 186 current scanner tests rerun here. At exact Stage 10, **24 codemod fixture tests** passed and an actual dry-run returned empty eligible IDs, selected IDs and files. No production apply or rollback was run. Recovery/apply behavior is demonstrated by fixtures/source, not fabricated transformed application screenshots.

Historical final verification numbers in Stage 12 are cited from committed delivery records and the linked GitHub receipts, not claimed as newly rerun application regression gates by this documentation collection.

## Reproduction utilities

`tools/build.py` extracts exact source and generates manifests/stage notes. `tools/gallery.py` builds static HTML. `tools/capture.mjs` runs the four explicitly named historical worktrees and writes **only new collection screenshots**. `tools/render-cards.mjs` renders labeled cards and checks the gallery. Install the checkout's committed dependencies first, provide a compatible browser via `CHROME_EXECUTABLE`, and create the isolated worktrees named in the capture utility. Optional `PLAYWRIGHT_MODULE` can point to a separate installed Playwright module. Never point output at original screenshot directories or run the old historical capture script that overwrites them.

This collection does not rerun on every read; its dated recreated captures and hashes are immutable evidence of this run. Future recaptures should use a separately reviewed output directory or normal documentation change, retaining provenance.

## Limits

- Stage 02 is a risk audit, not implemented or visually tested RTL.
- Stages 04/05/06/10/11 have meaningful report/source evidence rather than new application UI changes.
- Stage 08 activates runtime while deliberately retaining coordinated shell protection; it is not the later fixed sidebar.
- Stage 09 is cumulative; fixing commits are individually identified. Seed screenshots cannot establish every mixed-script punctuation permutation or interaction state.
- Stage 11 is not the final successful source head: the later brand-test race fix and validated delivery are linked in MAPPING_REVIEW.md.
- Final lab delivery is not production-origin deployment certification; static findings are not a count of remaining visual bugs.

No historical screenshots, baselines, archived reports, pinned source, scanner policy, application behavior, or existing user worktree files were edited.
