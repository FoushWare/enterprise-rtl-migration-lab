# Educational content — Draft, not an approved narration script

| Scene | What / why | Actual input → output | If missing |
|---|---|---|---|
| 01 CLI Entry | الأمر بيبدأ الشغل من واجهة ثابتة. Parse supported options and invoke scan(root). | argv → root/format/gate, Report serialization and exit status | No supported command entry / gate semantics. |
| 02 Orchestrator | scan.ts بيوزّع المسؤوليات ويجمع البيانات. Show real ordering including policy audit and final detection. | Nx metadata + sources + policy → aggregated Report | Parsers/rules lack coordinated discovery, policy and aggregation. |
| 03 Parsing | نفصل المعلومة الخام عن الحكم. Illustrative button.css is executed using actual extractCss(). | text/path → Evidence + Diagnostics; margin-left:20px at line 2 column 3 | Rules lose bounded source facts and source locations. |
| 04 Detection + Policy | القاعدة تفسّر المخاطر بتحفّظ، والـPolicy تؤثّر على التصنيف والمعالجة. | Evidence + Sources + Policy + Diagnostics → Findings, possible appended Diagnostics | Facts alone cannot classify RTL risks or audit reviewed decisions. |
| 05 Coverage / Completeness | صفر Findings مش دليل إن مفيش مشكلة. Distinguish risk count, uncertainty records, completeness and source coverage. | classified/appended blocking diagnostics → final complete flag in scan.ts | A quiet but incomplete scan could appear trustworthy. 100/80/20 is hypothetical only, not calculated metrics. |
| 06 Reporting | نعرض النتيجة وحدودها بوضوح. | Report assembled by scan.ts → JSON/Markdown strings via report.ts → stdout via CLI | Results are not presented consistently or machine-readably. |
| 07 Complete Architecture | خريطة مسؤوليات مبسّطة، مش call trace حرفي. Coordinator boundary remains visible. | All responsibilities + record relationships → overview for reuse | Learners may confuse parsing, classification, uncertainty and formatting. |

Evidence describes extracted facts. Finding describes a risk requiring judgment or treatment. Diagnostic records analysis failure/uncertainty. Completeness says whether blocking uncertainty remains; source coverage asks what was actually followed. These concepts are distinct. Coverage percentage is not supported by the current scanner.

The attached diagram is visual inspiration only. Unsupported commands, HTML reporting, automatic margin replacement and invented percentage metrics were deliberately corrected, not reproduced.
