# Screenshot issue-family mapping

This gallery classifies **visible UI regions and historical issue families**, not a count of independently confirmed defects in every screenshot. The original nine Phase 2A issue definitions and severities remain authoritative. No scanner rule, binding, approval, dynamic exception, application source or image bytes are changed.

## How to use it

- Select an issue number **RTL-01–RTL-09**, an implementation category, or an evidence status above the stages. The number badges under images apply the corresponding global filter.
- Each stage also retains application/language/viewport/original-vs-expanded/search filters and adds local issue/category/status filters.
- Category, issue and status constraints must match **the same issue annotation**. A screenshot whose fields are remediated but whose icons are not is not returned for “forms before remediation”.
- Each card explains the historical problem, where to inspect the image, its checkpoint status, the intended behavior and a link to that checkpoint's source. The expected behavior and source links expand under “المفروض والمصدر”.
- Search includes Arabic/English family titles, categories, descriptions and screenshot state text.
- Global issue/category/status selections can be shared in the URL. Clearing filters restores all 1,677 stage references.

## Categories

| Code | Family | Ownership |
| --- | --- | --- |
| RTL-01 | Sidebar geometry | CSS layout + SidebarFrame |
| RTL-02 | Revenue chronology | CSS label flow + unchanged SVG data frame |
| RTL-03 | KPI icon/label clearance | CSS logical placement; not growth-icon mirroring |
| RTL-04 | Forms | MUI theme/cache runtime |
| RTL-05 | Dialog title/close clearance | Shared Modal + MUI runtime |
| RTL-06 | Tables | MUI table alignment; separate from numeric/token policy |
| RTL-07 | Navigation progression | Semantic icon selection, scoped mirror, translated arrow; pagination separately |
| RTL-08 | Bidirectional context | Bidi boundaries, punctuation, amounts and names; not merely text alignment |
| RTL-09 | Brand composition | Complete LTR brand island within an RTL shell |

## Evidence statuses

- **LTR reference:** English comparison, not proof of an Arabic defect.
- **Before remediation:** the historical cause remains in this exact source checkpoint. This does not constitute a new pixel, overlap or interaction measurement.
- **Partial:** source has some required remedies but not all relevant navigation-arrow remedies. Runtime pagination can be correct while custom arrows remain wrong.
- **Source remediated:** relevant implementation is present in the exact committed bytes. This is not a blanket assertion that every runtime state or viewport is correct.
- **Needs review:** no defensible issue-specific claim from the visible state. No new defect is fabricated.
- **Documentary:** source/report evidence cards are not presented as UI defect screenshots.

## Association boundaries

- Procurement KPI cards do not receive RTL-03; they lack the invoicing decorative-icon collision.
- Revenue chronology applies only to invoicing overview captures.
- Dialog clearance applies only to customer and invoice-confirmation dialogs; ordinary selects are not dialogs.
- Bidi annotations are restricted to customer names/details and invoice-confirmation content covered by the historical issue. IDs, emails, every number and all dates are not automatically labelled defective.
- Sidebar/brand/shared-arrow annotations apply to visible desktop shells and explicitly open mobile navigation, not closed mobile drawers or print views. Modal/menu overlays are not used as proof of the background shell geometry.
- Mobile invoice-row arrows are associated with explicitly opposite-edge-scrolled table captures. The visible overview “view all” arrow has its own context.
- Empty table states do not claim visible table headings or row actions.
- A still image alone cannot establish drawer motion, keyboard behavior, focus trapping, copied text or state preservation.

## Source verification

`issue-catalog.json` records exact checkpoint source digests and the source features used to distinguish before/after: logical sidebar/gutter and KPI properties, revenue/brand direction islands, RTL cache/theme selection, explicit invoice ArrowBack, scoped sidebar transform, translated dashboard arrow and semantic `bdi` boundaries.

The catalog uses the source of each screenshot, not just an assumed stage number. Stages 01/02 share the same English commit. Several later tooling/documentary checkpoints share application source trees, so no extra UI repair is attributed to those phases.

The historical evidence document is linked at its original Phase 2A commit. Existing historical finding IDs, issue bindings and severity definitions are not rewritten or retired by this annotation layer. The per-card descriptions and filter counts are **gallery metadata only**.

All 1,608 PNG files retain their original hashes. There are no screenshot overlays, fabricated bounding boxes, replacement screenshots or changed visual baselines.
