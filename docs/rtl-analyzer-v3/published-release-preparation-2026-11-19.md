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

Wrapper candidate pack/install/runtime evidence and the exact publication procedure are recorded below. Ahmed's personal acceptance remains unchecked; automated disposable-target decisions do not constitute that acceptance.


## Verified public wrapper delivery

Release checkout: `/Users/a.fouad/rtl-analyzer-0.3.0-prep`; branch [`codex/rtl-analyzer-0.3.0-prep`](https://github.com/FoushWare/rtl-analyzer/tree/codex/rtl-analyzer-0.3.0-prep). The existing public package is prepared as **rtl-analyzer 0.3.0**, with implementation pinned to full lab commit `0a10d65bf3bf7a7aa7a9fa287263bde9639ab1db` on [`codex/rtl-analyzer-release-prep-20261119`](https://github.com/FoushWare/enterprise-rtl-migration-lab/tree/codex/rtl-analyzer-release-prep-20261119). Later lab documentation-only commits do not change the pinned runtime.

The release [record](https://github.com/FoushWare/rtl-analyzer/blob/codex/rtl-analyzer-0.3.0-prep/docs/releases/rtl-analyzer-0.3.0.md), [actual file list and sizes](https://github.com/FoushWare/rtl-analyzer/blob/codex/rtl-analyzer-0.3.0-prep/docs/releases/rtl-analyzer-0.3.0-pack.json), and [consumer commands/exits/versions/hashes](https://github.com/FoushWare/rtl-analyzer/blob/codex/rtl-analyzer-0.3.0-prep/docs/releases/rtl-analyzer-0.3.0-consumer.json) own durable evidence.

Final artifact: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-release-prep-20261119-lbq2jyjl/rtl-analyzer-0.3.0.tgz`. **67 files, 175,032 compressed / 662,326 unpacked bytes**. SHA-256 `4d166ea9118fa4acaec703ff0edf4b51b5051b36dd53aa367e049c067986c60e`; SHA-1 `002e6aebb9b7e2737b0d2b2920bfe5a053211780`; integrity `sha512-zInGqBXO7HnIwP6PZhIQOCbnzK0hPS578q/PmUDQgyQEnu0+9vj9GZew2FwPr7Gp4ZjHK4Kmeogo7t+LGLZTcQ==`. A second prepack/build produces identical bytes. The allowlist contains only 64 runtime JS modules, README/LICENSE/metadata. No local checkout paths or common npm/GitHub credential prefixes were found. Examples/videos/reports/state/backups/dependencies remain outside npm.

`npm run rtl:scan:typecheck`, `npm run rtl:scan:test` (397/397 in the release checkout's pinned implementation), `npm run rtl:scan:build`, versioned `npm pack`, changed-wrapper ESLint and the actual `npm run rtl:cli:package:smoke` publication-gate script all exit 0. The latter reruns both wrapper workflows on a fresh consumer. Normal release-checkout `npm ci` also completes. No scanner-only smoke is substituted for this result.

Primary independent wrapper consumer: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-package-consumer-2jwAq6`. Installed tarball version **0.3.0**. `npx --no-install rtl-analyzer` (default static dashboard), help/version, `scan .`/`scan --root`, all four formats, `preview --help`, and the actual installed `rtl-analyzer preview` companion are exercised. Expected invalid-preview/output exit 2 and findings-gate exit 1 are retained. Scan: 5 files, 6 findings, 0 diagnostics, complete. Both one-by-one/apply-first modes pass typecheck/build/test/scanner/runtime-LTR/runtime-RTL checks. Only one accepted CSS change reaches source per Apply (one receipt each), all five source hashes restore exactly, and successor state is fresh Pending / Not run. Six unauthorized writes return 403. No browser page errors. Individual service termination codes were not captured; the harness awaits owned service termination and exits 0. Default browser opening is command-level evidence, not Safari visual acceptance.

Release-repository root ESLint exits 1: **339 errors** = 268 in the pinned implementation + 65 in preserved legacy source/tests + 6 in generated duplicate runtime JS. No ignore/rule change hides them. Main root remains 277 errors (268 tracked + 9 local helpers). The release repository has no memory validator script (attempted direct invocation exits 2); this lab's validator reports 47 missing required / 6 optional historical links and 48 source-staleness advisories at the recorded precommit check. Those assets were reviewed and left untouched.

**Triggers verified before normal pushes:** lab workflow only verifies push/PR. Release repo npm publishing runs only on **GitHub release.published**, not a preparation branch push; it uses OIDC, checks tag/version, verifies build/tests/installed-wrapper smoke and rejects an existing version before `npm publish --access public`. CI uses submodule checkout and installs Chromium; no deployment config/active push hook was found. No tag/GitHub release/npm publish/deployment was performed.

Remaining manual acceptance: Ahmed **[ ]**; resolve or explicitly adjudicate repository lint; review current Windows CI/platform expectations (older Windows reports do not certify this implementation); Linux runtime/Safari/other package managers and existing real-world project acceptance remain unverified. Historical missing-memory assets and the prior lost QA artifacts are not repaired or rewritten.

After separate approval: review/merge the release preparation branch, initialize its pinned submodule, run normal `npm ci`, typecheck/tests and `npx playwright install --with-deps chromium`, then `npm run rtl:cli:package:smoke`; inspect hashes and recheck that `rtl-analyzer@0.3.0` still returns E404. Publish a reviewed GitHub **v0.3.0** release at the exact reviewed merge commit, which triggers the existing OIDC workflow's `npm publish --access public` from `packages/rtl-analyzer`. Do not also publish the internal manifest or run a parallel manual publish. The linked release record gives the exact intended `gh release create` command and registry verification steps; none has been executed.


## Final Git and archive audit

Release preparation commit: [`ffe979b968984cdeb9a1c73ac33a80b8dddf641d`](https://github.com/FoushWare/rtl-analyzer/commit/ffe979b968984cdeb9a1c73ac33a80b8dddf641d), branch `codex/rtl-analyzer-0.3.0-prep`. Implementation source pin: [`0a10d65bf3bf7a7aa7a9fa287263bde9639ab1db`](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/0a10d65bf3bf7a7aa7a9fa287263bde9639ab1db). The later lab evidence commit is documentation-only; Git owns its final identity. Both pushes use ordinary non-force branch updates. Completed checkpoint `8ea82bf` remains an ancestor, and its original branch ref is retained.

Downloaded the actual published 0.2.0 archive through `npm pack rtl-analyzer@0.2.0 --ignore-scripts --json --pack-destination <external published-0.2.0 directory>` (exit 0). SHA-1 matches registry `a76cc54a7da253eb97f27d7ca897ff62bd9d1b4e`; SHA-256 `b716a39f86d48237ea309705c3a81663233300a873544e7e2eef92c98af5705a`. Inspected its real package metadata and `package/dist/standalone-cli.js`: bin routing imports bundled `./cli.js`, preserves default dashboard and positional scan routing, and has no `@atlas/rtl-scanner` dependency. This verifies the architecture against published bytes as well as Git source/registry fields.

Final package build now reads implementation source directly from the pinned Git objects, so untracked/ignored source files cannot enter staging. A post-change prepack again matches the tested 0.3.0 tarball byte-for-byte. Developer `npm run rtl:scan -- --help` and `npm run rtl:preview -- --help` use the newly built runtime and exit 0. No new consumer test is substituted: the tested artifact is unchanged.
