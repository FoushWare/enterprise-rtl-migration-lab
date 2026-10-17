# RTL Scanner — Visual Diagram Collection (Draft)

> **Status: visual drafts, not verified against source.**
>
> The images created in the ChatGPT discussion are **not yet uploaded** to this repository. Some contain invented function names and inaccurate signatures. Do not use them as authoritative code documentation or in a published tutorial without correction.

Historical source baseline: [Stage 04 commit 0de6d609](https://github.com/FoushWare/enterprise-rtl-migration-lab/tree/0de6d609cbfb9aae662d1cb7c9589c38592bb21b/tools/rtl-scanner/src).

## Planned PNG gallery

| Diagram | File | Review status |
| --- | --- | --- |
| Master architecture | `00-master.png` | Needs source verification |
| CLI | `01-cli.png` | Needs source verification |
| Orchestrator | `02-scan.png` | Needs source verification |
| CSS parser | `03-css.png` | Needs source verification |
| HTML parser | `04-html.png` | Needs source verification |
| TypeScript parser | `05-typescript.png` | Needs source verification |
| Data models | `06-model.png` | Needs source verification |
| Policy | `07-policy.png` | Needs source verification |
| Coverage | `08-coverage.png` | Needs source verification |
| Detection rules | `09-rules.png` | Needs source verification |
| Reporting | `10-report.png` | Needs source verification |

## Source verification checklist

1. Pin every diagram to the historical commit, not the current main branch.
2. Check every function name, type, argument and return value against the source.
3. Distinguish CSS/HTML/TypeScript evidence extraction from `rules.ts` finding generation.
4. Confirm the order of policy loading, rules and coverage; do not infer it from visual layout.
5. Replace the draft image only when verified and legible at full resolution.

Related Notion study page: [RTL Scanner — Visual Learning Guide](https://app.notion.com/p/3fcdd0b9a26781f9a418d357108a48a8).
