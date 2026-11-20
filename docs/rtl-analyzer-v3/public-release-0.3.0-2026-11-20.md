# RTL Analyzer public release 0.3.0

Verified 2026-11-20. CONTINUE of the approved release task. The user authorized ordinary commits/push, PR review/merge and GitHub release publication, accepting existing lint debt and deferred broader platform/real-world acceptance. Ahmed manual visual/workflow acceptance **[ ]** remains unchecked.

Public package: **rtl-analyzer 0.3.0**. [PR #11](https://github.com/FoushWare/rtl-analyzer/pull/11) merged normally at `b4c19d3857dd961b5d9e72fe0d36f47f5999cd7f`; [v0.3.0](https://github.com/FoushWare/rtl-analyzer/releases/tag/v0.3.0) points to that exact commit. [Publish run 44674724255](https://github.com/FoushWare/rtl-analyzer/actions/runs/44674724255) passed all mandatory Linux checks and used the existing OIDC workflow. No manual npm publication, force push, policy bypass or second public package.

The initial implementation pin `0a10d65b` descends from preserved checkpoint `8ea82bf` (verified in this full-history checkout). Final pin [`8d3946a40b024a042cf315aa33cfcb560e69dc75`](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/8d3946a40b024a042cf315aa33cfcb560e69dc75) adds only canonical system-temp paths in four scanner test files on `codex/rtl-analyzer-0.3.0-ci-fixtures`. Initial Linux CI exposed 32 macOS-only fixture failures; the correction preserves assertions and runtime guards. All runtime JS bytes are unchanged from `0a10d65b`. This checkout's application/source files were not changed by publication; the release submodule owns that test-only pin. Internal `@atlas/rtl-scanner` stays private.

Root/npm READMEs use the supplied concise product content, corrected to isolated Pending preparation, explicit acceptance, accepted-only validation and separate source Apply. Detailed configuration, Chromium/services, six external state overrides, limits and developer commands remain in the [maintained guide](https://github.com/FoushWare/rtl-analyzer/blob/main/docs/guides/developer-testing.md). Unrelated copied page/account content was excluded; no screenshot/video was fabricated.

The [release publication record](https://github.com/FoushWare/rtl-analyzer/blob/main/docs/releases/rtl-analyzer-0.3.0-publication-2026-11-20.md) owns exact artifact hashes, commands/exits, consumer results, source/CI/tag/registry provenance and limitations. The [November 19 preparation report](published-release-preparation-2026-11-19.md) remains historical; its no-publication authorization state and earlier README-dependent artifact hashes are superseded only by the dated approved release evidence.

Final [PR CI](https://github.com/FoushWare/rtl-analyzer/actions/runs/44674349533): Ubuntu passes strict typecheck/build, 397/397 scanner tests, Chromium and the full installed wrapper journey. Windows fails 54 tests (342 pass, 1 conditional skip), including unsupported POSIX/path behavior; no checks were removed or weakened. Protected Windows operations remain unsupported. Both macOS and Linux journeys exercise both review modes, real RTL/LTR spacing, accepted-only one-patch Apply, one receipt per mode, exact five-file rollback, fresh Pending / Not run state and six unauthorized writes denied. These checks do not constitute personal or existing real-world-project acceptance.

**Registry verification is complete.** `latest: 0.3.0` and `gitHead` match the release commit. The actual downloaded registry tarball's SHA-256 is `bb2cb3ce5cd261c4371df3286f691d9cc4eb27bc5f36068dee1c387ece7b16d8`, exactly matching the Linux publication-gate archive. It contains 67 files / 653,804 unpacked bytes; all member bytes match the local candidate. Signed provenance identifies `refs/tags/v0.3.0`, `.github/workflows/publish.yml`, the same merge SHA and publish run; both attestation subject SHA-512 digests match the archive. `npm audit signatures` exits 0 (13 verified registry signatures, 6 verified attestations).

The existing harness installs this **registry archive** in a new disposable verification target and passes both full modes with six checks, accepted-only Apply, exact rollback/fresh state, six denied writes and no browser page errors. A separate fresh `npm install --save-dev rtl-analyzer@0.3.0`, installed version/help/scan and lockfile integrity comparison also pass. npm's initial processing/cached 404 delay resolved without republishing. Detailed [registry proof](https://github.com/FoushWare/rtl-analyzer/blob/main/docs/releases/rtl-analyzer-0.3.0-registry-verification-2026-11-20.json) and [consumer evidence](https://github.com/FoushWare/rtl-analyzer/blob/main/docs/releases/rtl-analyzer-0.3.0-registry-consumer-2026-11-20.json) remain owned by the release repository.

Developer commands (Node >=22.12), from the frontend project root:

```sh
npm install --save-dev rtl-analyzer@0.3.0
npx --no-install rtl-analyzer --version
npx --no-install rtl-analyzer scan . --format json
npx --no-install rtl-analyzer
```

Live Fix Studio review additionally needs the maintained guide's explicit project/runtime configuration, project dependencies, Chromium, source-enabled external reports, Python server 4320 and companion 4318. No new example project or Nx infrastructure was added.

Accepted debt remains visible: release root lint 339 errors / 0 warnings (268 pinned implementation, 65 legacy, 6 generated duplicate JS), with changed wrapper lint passing. Existing historical memory/asset links remain missing; no source assets, examples, Nx infrastructure, backups or unrelated `video-assets/` were changed. Safari, other package managers, general framework compatibility and real-world acceptance remain deferred.

Memory validation was rerun with `python3 docs/project-memory/validate.py`: exit 1 on the existing **47 required / 6 optional missing historical asset links**. Source-staleness/date advisories were reviewed; unrelated facts and missing assets were not rewritten. This is an existing documentation limitation, not a package/runtime verification pass.
