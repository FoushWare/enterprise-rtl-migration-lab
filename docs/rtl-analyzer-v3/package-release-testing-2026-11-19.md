# RTL Analyzer package-release testing — 2026-11-19

CONTINUE. Scope: finalize the existing implementation and test a local package; no feature expansion or visual redesign. Ahmed's manual acceptance remains **[ ]**. No version bump, release tag, npm publish, deployment, reset or rebase is authorized/performed here.

## Inspected checkpoint and implementation

Worktree: `/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/css-migrations-rtl`. Starting/current task branch: `checkpoint/rtl-analyzer-antigravity-20261119-0210`; starting HEAD `de2684fa58d3f857f6e9c754556cc11854394ab3`. `origin` fetch/push is `git@github.com:FoushWare/enterprise-rtl-migration-lab.git`; remote default is `main`, so this task branch is suitable. Before edits, the remote task branch matched HEAD; the index was empty. Inspected all initial tracked changes and both new test files, checkpoint history, remotes and the worktree list (including the two separate latest/study worktrees and prunable historical entries). No other worktree was altered/pruned. Untracked `video-assets/` and ignored local assets were preserved.

Reviewed the prior uncommitted dashboard/client/context/target-identity/details/notes/workflow changes and the existing backend coordinator, accepted-only validation, guarded Apply and rollback. Both modes prepare isolated candidates; Pending is distinct from Accepted; validation recomposes only accepted patches; source Apply remains a separate explicit confirmation. Review actions, explanations, notes/drafts, target restoration, panel/iframe state, direction, fullscreen and history retain the existing scope. The prior browser records remain historical evidence, not Ahmed acceptance.

Concrete finalization corrections:

- npm bin symlinks bypassed the CLI entry-point comparison, silently exiting 0 with no output. Resolve the invocation's real path before comparing; installed-bin smoke now asserts help and real report output.
- Add executable scanner/companion entry points and help, runtime dependencies, package build/prepack, license and a strict file allowlist around the existing TypeScript build. Pin Playwright to the verified repository runtime 1.64.0. No packaging directory restructure or root dependency/lock changes.
- Move the existing origin/method guard before two early manual-change/rescan POST handlers that previously bypassed it. Six installed-package negative requests verify denial before malformed JSON is parsed.
- Preserve **Superseded** for a restarted review instead of falsely labeling it Rolled back; use the authoritative current dashboard digest when the history dialog has no current-review snapshot. Consumer browser assertions cover both histories and avoid undefined hashes.
- Refresh stale validation/pluralization locators in the already affected browser tests; replace broad test mocks with concrete types. Exclude only the new generated package `dist/` from lint. No lint rules or assertions were disabled.

## Package contract and actual contents

Publishable root: [`tools/rtl-scanner`](../../tools/rtl-scanner/package.json), **@atlas/rtl-scanner 0.1.0** (unchanged version). Repository root `atlas-invoice` stays private. ESM bins: `rtl-scanner → dist/cli.js`, `rtl-preview → dist/preview-cli.js`. Engine: **Node >=22.12.0**; verified here on macOS with **Node 22.21.1 / npm 10.9.4**, not a cross-version/platform certification. Runtime dependencies: `@playwright/test` 1.64.0, parse5 7.3.0, postcss 8.5.29, postcss-value-parser 4.2.0, TypeScript ~5.9.0. Target applications supply their own Vite/React/toolchain dependencies.

Scripts: package `build` compiles `tsconfig.json` into its own ignored `dist/`; `prepack` runs it. Root scanner build still writes `dist/tools/rtl-scanner`. All **60** packed runtime modules were byte-compared with that root verification build. No publish/tag/deploy script exists. The only GitHub workflow runs checkout/install/lint/typecheck/build/test/browser checks on pushes/PRs; it contains no publication/deployment step.

Actual final `npm pack` artifact: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-finalization-evidence-ef931aqb/atlas-rtl-scanner-0.1.0.tgz` (outside Git, deliberately not committed). Regenerated after the output-cleanup incident with byte-identical SHA-1/SHA-256 to the already independently tested artifact. **63 files**, **175,751 compressed bytes**, **657,939 unpacked bytes**. SHA-256: `1247a7401546661e788c35e90ef8632182f2f52e26abc68ff96b4ba22f95b626`. npm SHA-1: `55b41d499185456d21e86a76fd964bb7beceee6b`. Actual tar headers matched npm's reported file list; no dependencies were bundled. Actual contents follow:

```text
package/LICENSE
package/README.md
package/dist/cli.js
package/dist/codemod.js
package/dist/companion-security.js
package/dist/contextual-preview-bridge.js
package/dist/contextual-preview.js
package/dist/controlled-apply.js
package/dist/coverage.js
package/dist/css-directional.js
package/dist/css-icons.js
package/dist/css-spacing.js
package/dist/css.js
package/dist/dashboard-client.js
package/dist/dashboard-contextual-preview.js
package/dist/dashboard-data.js
package/dist/dashboard-embedded-preview.js
package/dist/dashboard-html.js
package/dist/dashboard-review-details.js
package/dist/dashboard-review-workflow.js
package/dist/directional-properties.js
package/dist/eligibility.js
package/dist/evidence-store.js
package/dist/example-preview-mappings.js
package/dist/html.js
package/dist/manual-change-store.js
package/dist/migration-lifecycle.js
package/dist/model.js
package/dist/original-preview-runtime.js
package/dist/output-path.js
package/dist/policy-audit.js
package/dist/policy-validation.js
package/dist/policy.js
package/dist/presentation-adapter.js
package/dist/preview-cli.js
package/dist/preview-companion.js
package/dist/preview-configuration.js
package/dist/preview-manifest.js
package/dist/preview-runtime.js
package/dist/project-configuration.js
package/dist/project-root.js
package/dist/react-inline.js
package/dist/report-publisher.js
package/dist/report.js
package/dist/review-approval.js
package/dist/review-session.js
package/dist/review-store.js
package/dist/review-workflow.js
package/dist/rules.js
package/dist/runtime-direction.js
package/dist/runtime-process.js
package/dist/scan-history.js
package/dist/scan-manifest-store.js
package/dist/scan.js
package/dist/serialization.js
package/dist/source-context.js
package/dist/source-snippets.js
package/dist/structured-markdown.js
package/dist/transformations.js
package/dist/typescript.js
package/dist/validation.js
package/dist/workflow-validation.js
package/package.json

```

The dashboard's CSS/JavaScript and contextual preview bridge are embedded compiled runtime strings, so no additional HTML/CSS asset copy is needed. README and MIT license are included. The `example-preview-mappings.js` runtime module is required mapping code, not a bundled example project. The actual allowlist/tar check excludes app/example projects, source tests, videos, generated reports/test-results, backups, local review state, credentials, dependencies and development configs. A package-content scan found no machine-specific `/Users/...` path or private-key/token pattern. Example apps and disposable fixture generators stay in GitHub; nothing was removed to exclude them from npm.

## Verification commands and results

Final durable local logs/artifact: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-finalization-evidence-ef931aqb/`, outside the checkout. Initial task logs were under ignored `test-results/package-finalization/` and were removed by the default Playwright cleanup described below. Commands ran from the repository root unless a package-root subshell is shown. Only disposable targets received Apply/rollback writes.

| Exact command | Exit | Result |
| --- | ---: | --- |
| `npm run typecheck` | 0 | Repeated after corrections; strict workspace TypeScript succeeds. |
| `npm run build` | 0 | 3 Nx tasks succeeded, 2 cached; no app source changed after this run. |
| `npm test` | 0 | 9 tests / 2 files. |
| `npm run rtl:scan:typecheck` | 0 | Repeated on final scanner/test code. |
| `npm run rtl:scan:build` | 0 | Final root scanner build. |
| `npm run rtl:scan:test` | 0 | **390 tests / 31 files**; includes new help and existing scanner/runtime failure-gating tests. |
| `npx eslint tests/e2e/package-consumer-smoke.mjs tests/e2e/review-workspace.spec.ts tools/rtl-scanner/tests/contextual-target-identity.test.ts tools/rtl-scanner/src/preview-cli.ts` | 0 | Focused finalization test/bin lint. |
| `npm run lint` / final `npx eslint . -f json` | 1 | Initially 325 errors; final 282 errors / 0 warnings. Remaining failures predate this finalization; see below. |
| `(cd tools/rtl-scanner && npm pack --json --pack-destination ../../test-results/package-finalization)` | 0 | Builds and packs the actual final artifact above. |
| `node tests/e2e/package-consumer-smoke.mjs test-results/package-finalization/atlas-rtl-scanner-0.1.0.tgz` | 0 | Final artifact: 2/2 complete consumer workflows; exact subcommands below. |
| `npm run test:e2e -- --output=/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-finalization-evidence-ef931aqb/repository-e2e-output --reporter=line` | 1 | Discovery blocked by legacy `phase6-full-journey.spec.ts` missing `/private/tmp/rtl-apply-dashboard-v5/rtl-report.json`; no tests executed. |
| `git diff --check` | 0 | Final diff hygiene. |
| `python3 docs/project-memory/validate.py` | 1 | Historical missing-link failures, separate from code/package results; counts below. |

The root lint is **not green**. The initial (now lost locally) `lint-comparison.json` results were inspected in this conversation, and a new external `lint-comparison.json` rechecks every remaining flagged file against its actual HEAD contents via ESLint stdin: HEAD already had 287 errors in those files; the initial worktree added existing test/mock errors and 9 errors in ignored local floorplan helper scripts. Finalization removes the affected test/mock errors (both refined files now pass) and ignores only the newly generated package output. The 282 remaining errors comprise 273 tracked baseline errors and 9 in existing ignored floorplan helpers. Do not infer that all errors originated in this task, or weaken lint to report a pass. Broad lint cleanup was not part of this finalization.

Fresh workspace-browser result: **15/15 PASS**, exit **0**. Exact command: `RTL_WORKSPACE_OUTPUT_PREFIX=/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-finalization-evidence-ef931aqb/workspace node tests/e2e/run-review-workspace.mjs`. Counts: full 11, limited 2, failed project check 1, no configured commands 1. `workspace.log` and per-scenario audit/trace/screenshot directories are retained externally. Both complete workflows, menu/notes/drafts/disclosures, actual panel/iframe/target/direction/fullscreen state, accepted-only writes, history and rollback pass. No failed/skipped cases in this final rerun.

Recent unchanged UI evidence was initially reused from `test-results/final-session-refinement/final.log` (15 passing browser cases), `delivery.log` (3 final-build cases) and desktop/narrow/menu/note screenshots. Those historical local artifacts were later removed by the default runner cleanup; their previous inspected results are conversation evidence, not available local attachments. The fresh 15-case rerun and external consumer evidence replace this task's verification, not the lost historical files. Finalization leaves those panel, explanation, draft, direction, target and fullscreen implementation paths unchanged; the fresh browser and consumer runs verify the changed history/security boundaries. Previous full-workflow project-pass/scanner-or-runtime-failure coverage remains unit-level; no new complete browser proof of that combination is claimed.

## Independent installed consumer

Final successful consumer: `/private/var/folders/fq/64_hc1kd09g0ysrzs_gg6ylh0000gn/T/rtl-package-consumer-WZEChK`. This newly generated React/Vite project, installed dependencies, state, backups, reports, screenshots and `smoke.json` are outside all repository worktrees. The committed [black-box runner](../../tests/e2e/package-consumer-smoke.mjs) has no repository-relative product imports or repository source/dist shortcuts. It installs the actual tarball and invokes its installed binaries; the browser driver comes from that consumer's installed dependency tree. It never imports analyzer internals.

Consumer subcommands from its `project/` directory (absolute arguments are recorded in `smoke.json`):

| Command | Exit / outcome |
| --- | --- |
| `npm install --save-dev --ignore-scripts --no-audit --no-fund <absolute final tarball>` | 0; fresh local installation with the fixture's declared React/Vite dependencies. |
| `npx --no-install rtl-scanner --help` | 0; real usage text asserted. |
| `npx --no-install rtl-preview --help` | 0; real usage text asserted without starting services. |
| `npx --no-install rtl-preview --unknown` | 2, expected. |
| `npx --no-install rtl-scanner --root <consumer project> --format json` | 0; complete, 5 files, 6 findings, 0 diagnostics. |
| Same JSON command plus `--fail-on-findings` | 1, expected actionable-findings gate. |
| `npx --no-install rtl-scanner --root <consumer project> --format dashboard --embed-source-snippets --output-dir <external reports>` | 0; JSON 12,487 bytes, Markdown 5,453, structured Markdown 7,286, HTML 257,914. |
| `npx --no-install playwright install chromium` | 0; installed package's pinned browser contract, existing OS cache reused. |

Services: installed `node_modules/.bin/rtl-preview` with `RTL_PROJECT_ROOT=<consumer project>` and all six documented disposable store/backup overrides; Python 3 HTTP server bound to 127.0.0.1:4320. Companion 4318, original Vite 4215, candidates 4202–4212. Explicit `rtl-project.config.json` defines scan/copy scope and npm typecheck/build/test checks; `rtl-preview.config.json` maps actual CSS rules/selectors to `/people?direction=ltr|rtl`. Project dependencies are installed independently. All consumer-owned services stop in the runner's `finally` block; source/history/evidence remain available offline.

Both **one-by-one** and **apply-first** complete from installed HTML/API/runtime code. Real document direction and logical margin placement are asserted in both frames. Fresh decisions are Pending and original hashes stay unchanged through preparation/validation. Each mode passes **six checks** (typecheck, build, test, scanner, runtime LTR, runtime RTL). Approving just one finding recomposes a one-patch candidate; original Apply changes exactly that margin declaration, leaving all other proposals untouched. Each Apply records one receipt. Scoped rollback restores all five scanned-file hashes and starts a fresh Pending / Not run successor. Superseded and Rolled back badges stay distinct; history Technical text contains a current hash. Six foreign-origin/originless POST requests to manual-change, rescan and workflow handlers return 403 before malformed-body parsing. No browser page errors were observed.

Earlier failed attempts were recorded and inspected, but their in-repository logs were removed by default runner cleanup; external consumer directories still retain their `smoke.json`/command/service logs: the first tarball exposed the silent npm-symlink CLI bug; the next selected an unpinned newer Playwright download that stalled and was stopped before browser checks (pinned to verified 1.64.0); another run used incorrect disposable store filenames and failed the existing store guard. The documentation/harness now specify the required basenames. These runs are not counted as passing. Two subsequent consumer runs passed, including the exact final artifact.

## Memory, ownership and remaining release gates

Memory validation before this task and after implementation: **47 missing required historical links, 6 missing optional, 45 staleness advisories, 1 undated index**. These are historical assets/reports outside this task, not new package/runtime failures. Warnings were reviewed, not automatically rewritten. After documentation updates: 158 checked links, the same 47 required/6 optional missing, 47 staleness advisories and 1 undated index before staging. The two extra staleness advisories refer to newly documented modified sources. Missing historical links are not repaired or hidden; post-checkpoint counts are reported separately.

Verified and stopped the prior owned supervisor 32975 / companion 33000 / HTTP 33031 before testing; its disposable target/history were preserved. Its old dashboard URL is no longer advertised as live. Fresh runners stop only their own services. `video-assets/` remains untracked and untouched. Application source and root package lock remain unchanged. Do not claim the entire worktree is clean.

- **[ ] Ahmed manual visual/workflow acceptance**: retained checklist in the completion plan. Automated browser decisions on disposable targets do not mark his acceptance complete.
- **[ ] Integrate Ahmed's external `RTL_ANALYZER_README.md`** when supplied. It was unavailable in task-scoped sources; the package README was updated from verified code rather than guessed external contents.
- Root lint still fails as above. The default root browser runner also exits 1 during discovery on the missing legacy `/private/tmp/rtl-apply-dashboard-v5/rtl-report.json` fixture, before running tests. Resolve or explicitly adjudicate the preexisting repository lint gate before a release claim. Historical memory-link failures remain separate.
- Chromium/macOS/npm and a new standalone integration target were exercised. Safari, other Node/platform/package-manager combinations, Windows report publication and an existing real-world consumer application are not certified. Report publication currently supports the macOS/Linux trusted POSIX filesystem profile; no Windows claim. No general Next.js/mocking/automatic routing support.
- Scoped local stores are single-process coordination, trusted project/config/script boundaries remain, and test change coverage remains Unknown. Post-Apply immutable historical Before has no retained app runtime.

Proposed next version: **0.2.0**, subject to maintainer approval. The 0.1.0 private/detection-only manifest/README becomes an installable CLI with review/Apply workflows and changed CLI labels/operational configuration; a pre-1.0 minor is more appropriate than a patch. No version is changed here. Verify registry ownership/name/access and release policy, complete manual/documentation/lint gates, rerun the consumer smoke against the versioned pack, then separately authorize publication. No tag/publish/deploy occurs in this task.

## Output cleanup incident and finalization status

**Finalization status: Blocked for an unqualified release-ready claim.** Local package build/install/runtime workflows work, and the scoped commit/push checkpoint is authorized, but repository lint and default browser discovery remain failing. Ahmed acceptance and the external README integration remain pending.

During final verification, `npm run test:e2e` used Playwright's default `test-results/` output directory and automatically cleared its contents. This removed preexisting ignored QA artifacts as well as this task's initial logs/tarball, and interrupted the last unconfigured-check scenario by removing its active audit directory. I should have supplied a separate output directory. Tracked files, application source, untracked `video-assets/`, other worktrees, external consumer records and original disposable targets/history were unaffected. Deleted historical local QA artifacts were not recoverable from Git and were **not** reconstructed or silently claimed preserved. Any original copies/backups must supply those historical artifacts if required; this is an unresolved limitation.

Mitigation: stop only the two verified orphaned runtimes owned by the interrupted scenario; preserve external consumer evidence; regenerate only the current task's tarball with identical bytes; rerun checks and the 15-case suite into a fresh external evidence directory. A one-line `playwright.config.ts` output directory now confines future default-runner cleanup to `test-results/app-e2e`, leaving other analyzer evidence outside that cleanup root. A safe default-runner rerun with explicit external `--output` and `--reporter=line` reproduces exit 1 on the existing legacy phase6 fixture dependency; it does not turn that runner green. No historical video/source assets were regenerated or overwritten.

## Checkpoint delivery

The scoped 43-file staged diff was inspected, including the prior implementation/tests and all finalization documentation; `git diff --cached --check` passes. No preexisting staged work existed. No video-assets, dependencies, generated reports, tarballs, backups or local workflow state are staged. The current non-default task branch is retained and the intended origin/default/task refs were verified. Local commit/push hooks are absent/inactive; the sole remote workflow runs verification only. The checkpoint uses a normal push without force. Use `git rev-parse HEAD` and the GitHub task branch for the resulting commit; the final delivery records the verified remote SHA.
