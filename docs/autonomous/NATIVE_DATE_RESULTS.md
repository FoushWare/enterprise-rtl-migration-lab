# Native date regional experiment

[Run 38597366727](https://github.com/FoushWare/enterprise-rtl-migration-lab/actions/runs/38597366727) completed successfully with four independent GitHub-hosted macOS jobs, exact Chrome for Testing 156.0.8078.4, macOS 26.6.2 / 25G83 arm64, context en-US, UTC, viewport 1440×1000 and ISO dates 2026-10-11 / 2026-11-10. Native segments and visually inspected nonblank screenshots agreed.

| Case | Only intervention | Displayed dates |
| --- | --- | --- |
| A | None; AppleLocale en_US | 10/11/2026; 11/10/2026 |
| B | AppleLocale en_EG | 11/10/2026; 10/11/2026 |
| C | AppleLanguages en-EG, ar-EG | 10/11/2026; 11/10/2026 |
| D | Shell locale family C.UTF-8 | 10/11/2026; 11/10/2026 |

Browser, inputs, geometry and other material preferences were controlled. All typed preference restoration checks passed. B proves AppleLocale is sufficient to change native date ordering in this recorded environment; C/D alone do not. Local Chrome 155 and 156 under the same en_EG region both displayed day/month, so a version-only cause is unsupported. No persistent developer preferences were written.

PR #3 normalized only the ephemeral hosted runner AppleLocale before browser launch and restored it with always cleanup. Both application CI runs 38598212535 / 38598345336 passed, including all six original English baselines; normal merge a3e4b8ca37bc828b8a943f77a9a81f57ad4ea70e. PR #2 subsequently merged only after runs 38599527312 / 38599535009 passed. No screenshot replacement, masking, tolerance increase or product input change was made. GitHub diagnostic artifacts expire after three days; this text preserves the measured outcome and run provenance, not a claim of indefinite artifact retention.
