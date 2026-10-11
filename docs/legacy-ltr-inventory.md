# Legacy LTR styling inventory

Every entry below is applied by rendered components. These are valid styling choices for the English baseline, not hidden defects. Review them in a later migration; do not automatically swap every physical property because some placements may be intentionally invariant.

| Source                              | Component / selector                           | Physical styling                                    | Current purpose / later concern                                                     |
| ----------------------------------- | ---------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `libs/design-system/src/index.tsx`  | SidebarFrame                                   | `left:0`, `border-right`, leftward mobile transform | Anchors sidebar on the left; off-canvas movement depends on the same side.          |
| `libs/design-system/src/styles.css` | `.app-main`                                    | `margin-left:238px`                                 | Reserves space for the fixed sidebar. Must coordinate with sidebar placement.       |
| same                                | `.brand`, `.brand-mark`                        | `margin-left`, `margin-right`                       | Positions the wordmark and symbol.                                                  |
| same                                | `nav a.active`                                 | `border-left`, `padding-left`                       | Left edge active route indicator and compensated padding.                           |
| same                                | `.workspace>span`, `.app-link` (inline MUI sx) | `margin-left:auto`                                  | Pushes chevron / app link arrow to the right.                                       |
| same                                | `.header-divider`                              | `border-left`, `margin-left`                        | Separates notification controls.                                                    |
| same                                | `.kpi-icon`                                    | `right:20px`                                        | Aligns indicator at the top right of KPI cards.                                     |
| same                                | `.status-dot`, `.chart-legend i`               | `margin-right`                                      | Separates dot from following English label.                                         |
| same                                | `.chart-labels`                                | `padding-left:40px`                                 | Reserves the chart's left value-axis gutter; chart coordinates also require review. |
| `libs/design-system/src/index.tsx`  | Modal close IconButton                         | `right:12px`                                        | Positions close control in the upper right.                                         |
| `apps/invoicing/src/App.tsx`        | table toolbar count, breakdown percentage      | `marginLeft`                                        | Positions list count at right and spaces payment percentage.                        |

MUI also supplies default left-aligned table cells in the rendered baseline. Audit component defaults alongside custom styles later. Revenue SVG text and chart coordinate system, directional arrow icons, breadcrumb ordering and mobile drawer transform are non-CSS candidates. Locale formatting is deliberately `en-US`; document roots declare `lang="en" dir="ltr"`, and the theme declares `direction:'ltr'`.

No RTL changes or logical-property migration have been made.
