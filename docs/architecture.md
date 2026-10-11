# Architecture

## Workspace boundaries

- `apps/invoicing`: overview, invoice list/detail/create routes, customers and editable settings.
- `apps/procurement`: purchase order list/detail, status filters and policy information.
- `libs/design-system`: MUI/Emotion theme, AppShell, Sidebar, Header, Button, Card, generic DataTable, StatusBadge, FormField, Modal, EmptyState, and working legacy CSS.
- `libs/shared`: typed customer/invoice/item contracts, fixed fixtures, currency formatting, total calculation and asynchronous mock API.

Nx discovers projects via project.json and Vite task inference with @nx/vite/plugin. Each app has its own Vite config, HTML entry point and dependency cache; separate caches prevent outdated optimized-module responses when running both apps concurrently. Ports are strict to keep sidebar application links predictable. TypeScript aliases resolve shared sources; vite-tsconfig-paths handles development and builds. Both applications depend on shared libraries, which do not import application code. Tags document intended scope; lint currently checks TypeScript correctness/style rather than enforcing Nx import boundaries.

Invoicing routes are separated into `src/pages` with local table and heading helpers under `src/components`. React Router handles navigation and route parameters. Material UI provides accessible inputs, dialogs, tables and pagination; Emotion powers both MUI's default styling engine and the legacy SidebarFrame. Components use a consistent light theme, fixed English locale and direction, with responsive navigation under 900px and horizontally scrolling tables.

## State and data

The asynchronous mock API returns fixtures when no saved invoices exist and stores newly created invoices in `atlas-invoices-v1` localStorage. List state belongs to the invoicing application, making newly saved invoices visible immediately. Data persists across reloads, scoped to origin; procurement is on a different port and has a separate origin. Settings live under `atlas-settings`. This is a single-user demonstration store without authentication, network retries, concurrent update control or production validation. Editing seed records, sending invoices and collecting payments are outside Phase 1.

Customer IDs join invoices to customer fixtures. Invoice totals sum quantity × rate; no taxes or exchange rate calculations. Purchase orders are read-only fixtures. Dashboard historical revenue and growth are explicitly illustrative; balances and status counts reflect workspace invoices. Dates are fixed to keep recordings reproducible.

## Future migration seams

Theme and document direction, shared navigation, spacing, positioning, table alignment, icons and formatted content will need analysis in a later phase. This phase intentionally does not change those seams. Consult the actual physical CSS inventory before planning migration.

## Component exploration

Storybook exposes payment status variants in `StatusBadge.stories.tsx`, using the same Provider as the applications. Add further stories as the shared library grows.

## Setup references

Workspace task inference follows the [Nx Vite documentation](https://nx.dev/docs/technologies/build-tools/vite/introduction); component styling follows [Material UI with Emotion](https://mui.com/material-ui/getting-started/installation/).
