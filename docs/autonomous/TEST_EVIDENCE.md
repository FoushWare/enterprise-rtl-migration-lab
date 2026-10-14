# Test evidence

## Verified starting references
Feature commit 8041f4c9c4411adb0247c3061727086c9d0735b7 historically passed 186 scanner tests, nine application tests and English/Arabic focused regressions. Current scanner checkpoint: 435 facts / 47 findings / 44 actionable / complete / 9 nonblocking diagnostics / no policy warnings. These are prior verified results; rerun before delivery.

Original CI run 38528647102 and diagnostic PR runs reproduce byte-identical expected/actual/diff date images. No Sidebar pixel change. Successful run 38559532287 observed macOS 26.6.2/25G83 arm64, Chrome 156.0.8078.4, en_US AppleLocale, [en-US] AppleLanguages, en_US.UTF-8 shell, en-US context/UTC and month/day dates. Local exact Chrome 156 under en_EG rendered day/month. No individual causation claimed.

New experiment run: https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38597366727 , head 80f1bae611f38af4e7731b22f2fb73c652e9535e, A-D only. Results pending.

Protected inventory hashes captured outside repository at /private/tmp/atlas-autonomous-protected.json; six English image hashes also have existing committed docs/phase-2a-ltr-baselines.sha256. Verify the 68 documentary images and both Stage 3 report hashes before every applicable closure. No screenshot updates permitted.

## Regional causal experiment 38597366727 — SUCCESS
All A-D jobs succeeded; same macOS/image/browser/lock/page configuration, unrelated preference digests unchanged, all preference restoration and checkout checks passed. Readable screenshots and native segments agree: A default => 10/11/2026,11/10/2026; B AppleLocale=en_EG only => 11/10/2026,10/11/2026; C languages only => month/day; D shell locale family only => month/day. Foundation patterns M/d/yy vs dd/MM/y corroborate observed widget output. AppleLocale intervention is sufficient in this exact configuration; no universal claim or direct renderer-memory introspection is made. Artifact source: https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38597366727 .
