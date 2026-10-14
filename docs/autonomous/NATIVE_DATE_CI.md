# Native date CI environment contract

The six protected English screenshots retain native date inputs in day/month order. Application values are fixed ISO date-only strings. Playwright remains en-US / UTC / 1440x1000 with zero allowed differing pixels. No application formatter, input type, test dates, screenshot threshold or protected baseline is changed by this repair.

The causal experiment https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38597366727 ran four independent hosted macOS jobs on the same image 20260907.0351.1, macOS 26.6.2/25G83 arm64, Chrome for Testing 156.0.8078.4 and dependency lock digest 27005f217428a86b5744da0ddbbfbb1b3fc464a085717b882ff477aed068cc72. All preference readback, unrelated preference digest, restoration and clean-checkout gates passed. Readable screenshots and browser native segments agreed:

| Case | Changed factor | Invoice/due presentation |
| --- | --- | --- |
| A | none | 10/11/2026; 11/10/2026 |
| B | AppleLocale=en_EG only | 11/10/2026; 10/11/2026 |
| C | AppleLanguages=[en-EG, ar-EG] only | month/day, unchanged |
| D | shell locale family=C.UTF-8 only | month/day, unchanged |

AppleLocale was sufficient to change actual widget presentation under this measured configuration. This is not a universal claim across browser/OS versions. Foundation helper evidence is not direct renderer-memory inspection. Exact Chromium 156 source uses macOS currentLocale for a matching English language and derives its short-date pattern through Foundation, consistent with the experiment.

The English baseline job now changes only AppleLocale to en_EG on a disposable GitHub-hosted macOS runner immediately before browser tests. Original typed value/key presence is saved outside the repository and restored/readback-verified with always(), including when tests fail. No developer-machine preferences are written; the guard rejects local and self-hosted execution. AppleLanguages and shell/browser locale stay unchanged. This aligns the native visual-test environment with the approved recording region rather than hiding native fields or changing financial/product localization.

Acceptance requires the full existing CI workflow to pass with all six original images unmodified; isolated fixture success is insufficient. Any new mismatch fails at the existing zero tolerance. Browser/runner updates can require a fresh investigation. Rollback is a normal reviewed revert of this workflow/documentation change, preserving all source and protected evidence. Temporary diagnostic workflow cleanup is a separate reviewed step after green verification.

Verified: both full application CI runs 38598212535 and 38598345336 passed before normal merge of PR #3. No merge exemption was used for red checks. The final delivery PR removes temporary diagnostics after preserving causal evidence, while retaining the permanent CI-only region safeguard.
