# Existing published RTL Analyzer: release preparation

Verified 2026-11-19. Approved continuation of implementation checkpoint `8ea82bfbcba1e46bc229121210e0fec79e8cf08b`; no history rewrite, publication, tag or deployment is authorized here. The [earlier testing record](package-release-testing-2026-11-19.md) remains historical scanner-package evidence, not proof of the public wrapper consumer path.

## Verified architecture and candidate

The npm registry returns `rtl-analyzer@0.2.0` (`latest`; versions `0.0.0-stage`, `0.1.0`, `0.2.0`). Its `gitHead` is `253912c85dfadda09abb42361b9a9776dc9916eb`, matching [`FoushWare/rtl-analyzer`](https://github.com/FoushWare/rtl-analyzer/commit/253912c85dfadda09abb42361b9a9776dc9916eb). `packages/rtl-analyzer/package.json` owns publication; the repository root is private. The public bin `rtl-analyzer` executes the bundled `dist/standalone-cli.js`, which calls the bundled scanner/reporting CLI. It is a router/build wrapper, not a network bootstrapper. No consumer install fetches this lab or `@atlas/rtl-scanner`. Registry lookup for `@atlas/rtl-scanner` returned E404; its internal manifest is now explicitly private.

Published 0.2.0 tarball metadata: 31 files, 229,976 unpacked bytes, SHA-1 `a76cc54a7da253eb97f27d7ca897ff62bd9d1b4e`, integrity `sha512-BOGG/FluwKL2f0VQyG8c+7KVnxCu0tcRgeupkJengBzpWTTfwK1jv5sR84qfg0aSqzdz9qmisR5E7oVAhSvYjw==`. No credentials/configuration files were printed.

Proposed release: **`rtl-analyzer@0.3.0`**. 0.2.0 already exists. A pre-1.0 minor fits the added review/preview/source-Apply functionality and report-contract changes. Retain no-argument dashboard, `scan [path]`, root/format/output/gating options, help and version. Add `rtl-analyzer preview` plus `rtl-scanner` / `rtl-preview` aliases. Preserve recursive discovery and published static React/Emotion/MUI/utility/SCSS detection, with explicit project configuration taking precedence. Utility classes remain detection-only and now have one `RTL.UTILITY.PHYSICAL` finding per recognized token; IDs/counts can change. SCSS has no repair/runtime certification. Report directories must already exist outside the target and are never overwritten; earlier README relative `./rtl-report` examples were incorrect.

The release repository uses a pinned `implementation` Git submodule to this lab. Its package build stages that source plus the existing standalone router, compiles once, removes stale generated modules and allowlists runtime JS/docs/license. No duplicated maintained scanner implementation or second public package is introduced. Development requires submodule checkout; npm consumers receive compiled code only. Existing old implementation sources in the release repository are retained as history/reference; the updated release scripts/build use the pinned implementation and its tests.

## Documentation and reproducibility

Ahmed's `/Users/a.fouad/Downloads/RTL_ANALYZER_README.md` was found and read. SHA-256 `b9f1e6eb47477148ac85f43b71474cbf4dcf2fb6836a49697a4882f609748d21`. Its structure, example, review overview and caution about semantic intent are integrated into the public package README. Corrected batch mode to **Prepare all, then review**, made isolated preparation and separately confirmed accepted-only source Apply explicit, and added actual configuration, service, Chromium, report-path and version prerequisites. No unavailable screenshots/video were invented.

The obsolete phase6 test read a deleted `/private/tmp/rtl-apply-dashboard-v5/rtl-report.json` during discovery and assumed fixed IDs/old UI. The test now invokes the existing complete installed-package harness, which generates its own disposable target and external state. `npm run test:e2e:journey` is the serial reproduction command. `npm run test:e2e -- --list` now exits 0 (171 tests / 43 files). This is discovery evidence, not a claim that all 171 tests pass under one configuration; other historical/manual suites still require their documented services/configurations.

## Implementation verification

Executed on macOS arm64, Node v22.21.1, npm 10.9.4. External evidence root: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-release-prep-20261119-lbq2jyjl`.

- `npm run rtl:scan:typecheck`: exit 0.
- `npm run rtl:scan:test`: exit 0, 397 tests / 33 files.
- `npm run rtl:scan:build`: exit 0.
- `npm run typecheck`: exit 0.
- `npm test`: exit 0, 9 tests / 2 files.
- `npm run build`: exit 0, 3 Nx tasks succeeded (2 cached).
- Scoped ESLint on all changed runtime/test/runner files: exit 0.
- `npm run test:e2e:journey`: exit 0, 1 journey running both modes against the separately packed internal scanner. This is **implementation consumer evidence**, not wrapper evidence.
- `npm run test:e2e -- --list`: exit 0, 171 tests / 43 files.
- `npx eslint . -f json`: exit 1, 277 errors / 0 warnings. Full findings in `main-lint.json`; no rules disabled or failures suppressed. The removed obsolete phase6 code accounts for five fewer errors than checkpoint's 282. Existing baseline includes 9 errors in ignored floorplan helpers and 268 tracked errors. Root CI lint remains a blocker to an unqualified all-green release claim.

Wrapper candidate pack/install/runtime evidence, final Git identities, memory validation and exact publication steps are recorded below after their execution. Ahmed's personal acceptance remains unchecked; automated disposable-target decisions do not constitute that acceptance.
