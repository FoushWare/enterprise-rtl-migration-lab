# Scene03 Architecture Storyboard
**Draft – Pending Review.** Preparation only. Proposed narration/timings require review and final alignment to the presenter recording. No Scene03 footage, scanner execution or fixes produced.


Suggested duration132s, one concept at a time. Times are planning estimates, not captured footage. Product badges: blue INVOICING / purple PROCUREMENT. Diagrams neutral navy/slate; actual problems red/white.

|Shot|Estimated time|Concept|Visual and transition|
|---|---|---|---|
|01|0–10s|A cross-cutting business request|Start on the actual broken Arabic dashboard, then the Procurement orders page. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|02|10–24s|Nx organizes the workspace|Open package.json, nx.json, and both project.json files in actual VS Code. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|03|24–36s|Trust imports, not missing graph edges|Open tsconfig.json and actual App/main imports. Show the prepared import-grounded diagram. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|04|36–50s|Separate UI ownership from business data|Open design-system/index.tsx, then shared/index.ts. Reveal one library at a time. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|05|50–66s|Follow the real React provider tree|Open both main.tsx files. Highlight the actual nesting in order. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|06|66–86s|Trace the actual language change|Open i18n.tsx and use the real selector in the browser. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|07|86–106s|Language direction is not the styling engine|Open runtime.tsx, styles.css, and SidebarFrame; return to the actual misaligned field. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|08|106–122s|Follow one real invoice, not a fictional backend|Open seedInvoices/listInvoices/App, then the real INV-2026-1048 detail route. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|
|09|122–132s|Hand off to evidence-based scanning|Show tools folder and CLI/report imports briefly, then pause for the next lesson. Slow highlight/pan; natural cut after explanation. No fabricated terminal output.|

## Diagram animation specification
Use architecture-imports.svg / architecture-imports.mmd as editable conceptual assets. Reveal applications first, then their import edges to libraries; pulse only the currently discussed edge. At shot05 replace dependency view with the provider-tree containment view. At shot06 trace locale actions in order; at shot07 show parallel direction owners, without implying all CSS flips automatically. Diagrams explain source relationships, not captured runtime tracing.

## Verified versus inferred
Verified: project scripts/aliases/imports/provider nesting/localStorage flow and current document direction. Inferred teaching choice: investigate shared ownership first. Unverified: universal causality for every defect, backend infrastructure, production deployment topology or complete Nx graph extraction. None is drawn as verified.

## Approval boundary
Scene03 is prepared, not recorded/rendered or appended to this master. Scanner lesson remains a separate interactive approval checkpoint; no migration fix is applied.