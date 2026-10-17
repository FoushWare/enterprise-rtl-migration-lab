# RTL Scanner — Visual Diagram Collection (Draft)

> **Status: 14 PNGs received and packaged, but not yet uploaded to this GitHub branch.** These illustrations are learning aids, **not source-verified architecture**. Do not present the code snippets or function signatures as historical source without checking them.

Historical reference: [Stage 04 scanner commit `0de6d609`](https://github.com/FoushWare/enterprise-rtl-migration-lab/tree/0de6d609cbfb9aae662d1cb7c9589c38592bb21b/tools/rtl-scanner/src).

## Files in the prepared archive

The downloadable archive in the ChatGPT conversation contains these exact PNG paths:

| Area | Filename | Review |
| --- | --- | --- |
| Architecture overview | `00-architecture-overview.png` | Unverified |
| Architecture flowchart | `00-architecture-flowchart.png` | Unverified |
| Scan orchestrator | `02-scan.png` | Unverified |
| CSS parser detailed | `03-css-parser-detail.png` | Unverified |
| CSS parser flowchart | `03-css-parser.png` | Unverified |
| HTML parser | `04-html-parser.png` | Unverified |
| TS/TSX parser | `05-typescript-parser.png` | Unverified |
| Data model | `06-model.png` | Unverified |
| Policy | `07-policy.png` | Unverified |
| Coverage | `08-coverage.png` | Unverified |
| Rules | `09-rules.png` | Unverified |
| Report | `10-report.png` | Unverified |
| Stage 3 detailed | `11-stage3-detail.png` | Unverified |
| Stage 3 summary | `12-stage3-summary.png` | Unverified |

The archive also includes `STATUS.txt`. PNGs remain **pending upload**; this README is a manifest only.

## Review before publishing

1. Pin diagrams to the historical commit rather than current `main`.
2. Confirm function names, signatures, types, and imports against actual source.
3. Separate parser evidence extraction (`Evidence[]`) from rule-based findings (`Finding[]`).
4. Check policy/coverage/report ordering from the implementation, not diagram arrows.
5. Correct inaccurate drawings and only then publish them as verified.

[Notion study page](https://app.notion.com/p/3fcdd0b9a26781f9a418d357108a48a8).
