# Architecture map

This page points to the existing architecture explanation and source evidence; it does not restate their full detail. **Verified** means checked against the linked docs/source during this memory setup on 2026-10-30. Relationships beyond those stated in project docs are marked **Inferred**.

## Verified boundaries and flow

| Area | Responsibility / relationship | Source references |
|---|---|---|
| Invoicing app | Routes for dashboard, invoice list/detail/create, customers, and settings. `main.tsx` mounts the app; `App.tsx` owns route composition. | [main.tsx](../../apps/invoicing/src/main.tsx), [App.tsx](../../apps/invoicing/src/App.tsx), [architecture overview](../architecture.md) |
| Procurement app | Separate purchase-order application with list/detail routes and filters. | [main.tsx](../../apps/procurement/src/main.tsx), [App.tsx](../../apps/procurement/src/App.tsx), [architecture overview](../architecture.md) |
| Shared design system | MUI/Emotion runtime and reusable shell, navigation, table, form, dialog, badge, and related UI components. Both apps consume shared libraries; the architecture doc says libraries do not import app code. | [design-system runtime](../../libs/design-system/src/runtime.tsx), [design-system exports](../../libs/design-system/src/index.tsx), [design-system styles](../../libs/design-system/src/styles.css), [architecture overview](../architecture.md) |
| Shared data and locale utilities | Typed contracts/fixtures, translations, locale helpers, formatting, totals, and mock API are described in the architecture doc. | [shared library exports](../../libs/shared/src/index.ts), [i18n](../../libs/shared/src/i18n.tsx), [translations](../../libs/shared/src/translations.ts), [architecture overview](../architecture.md) |
| RTL Scanner | Static analysis/reporting tool under `tools/rtl-scanner`; its own README documents usage and capabilities. | [Scanner README](../../tools/rtl-scanner/README.md), [Scanner CLI](../../tools/rtl-scanner/src/cli.ts) |
| Workspace/build | Nx project definitions and per-app Vite configs define build/dev tasks. | [Invoicing project](../../apps/invoicing/project.json), [Procurement project](../../apps/procurement/project.json), [README commands](../../README.md) |

The architecture doc states that TypeScript aliases and `vite-tsconfig-paths` resolve shared sources, the apps use separate Vite configurations/caches, and the default demo uses a browser-local mock store rather than a backend. Consult that doc and current source before relying on those details for a code change.

## Existing diagrams

- [Source import map (Mermaid)](../../assets/rtl-production-v5/scene03/architecture-imports.mmd) and [rendered SVG](../../assets/rtl-production-v5/scene03/architecture-imports.svg)
- [Provider tree (Mermaid)](../../assets/rtl-production-v5/scene03/provider-tree.mmd)
- [Scene 03 architecture evidence](../../assets/rtl-production-v5/scene03/Scene-03_Architecture_Evidence.md)
- [Scene 03 production plan](../../assets/rtl-production-v5/scene03/Scene-03_Architecture_Production-Plan.md)

These are existing production artifacts, not guaranteed to describe later source changes. Revalidate their source receipts or regenerate only with explicit task scope.

## Inferred connections

- **Inferred:** app route/page components consume shared UI and data modules as the user-facing execution path. Confirm each concrete import in source before describing a specific call chain.
- The Mermaid import diagram is the best existing overview; this map does not infer dependencies from folder names alone.
