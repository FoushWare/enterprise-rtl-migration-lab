# Phase 2A proposal — Broken RTL Demonstration

**Status: proposed; awaiting review.** This document authorizes no implementation. It follows the [readiness audit](rtl-readiness-audit.md), distinguishing confirmed source limitations from RTL symptoms that still require observation. Only this plan is added in this preparation step.

## Goal and boundary

Add an opt-in Arabic **Unmigrated RTL** demonstration to both applications. Translate the interface and let the browser apply RTL direction while retaining the legacy styling, fixed LTR MUI theme, existing Emotion configuration, component geometry and icon choices. Capture what actually happens; this is an intermediate migration demonstration, not supported Arabic/RTL operation.

No codemods, logical-property conversion, RTL style plugin, theme-direction correction, portal workaround, component mirroring, baseline replacement or deliberately injected bug belongs in Phase 2A. The eight shots in the audit are investigation candidates, not a promised failure count.

## Decisions proposed for approval

| Topic | Phase 2A behavior | Intended later remediation / product decision |
| --- | --- | --- |
| Sidebar placement | Keep the existing left anchor, left content reservation and left mobile drawer motion. Do not move only the sidebar. Report their behavior under Arabic RTL against the proposed reading-start navigation convention. | Navigation should eventually sit on the right in RTL, with coordinated gutter, border, active indicator and mobile motion changes. |
| Logo | Keep the Latin `atlas.` spelling, symbol, punctuation and existing markup/styles. Translate surrounding workspace copy, not the brand or user/business records. Record any inherited-direction effect without repairing it. | Preserve the logo as an intentional LTR branding island in a later approved phase; never mirror its glyphs. |
| Chart chronology | Keep SVG coordinates, data order and label DOM order. Translate month names and accessible chart description; do not reverse the series or force the label strip back to LTR. Check actual label-to-point correspondence. Growth icons keep their existing meaning. | Retain May → October from physical left to right as an explicit chart convention, independent of UI direction. Later coordinate labels, axes and accessible description; do not mirror the whole SVG. |
| Mixed-direction identifiers | Preserve invoice/order IDs, routes, emails, currency codes and stored values byte-for-byte. Translate surrounding sentences through placeholders, never reverse strings. Retain existing unisolated rendering in the demo; exercise realistic mixed content and check copying. | Known Latin tokens need explicit isolated LTR boundaries; human names/descriptions need appropriate auto-direction/isolation. Only observed punctuation/grouping problems become confirmed issues. |
| Locale formatting | Arabic UI copy uses `ar-EG`; Phase 2A retains the existing `en-US` money formatter, current date display conventions, Western digits and native numeric/date input behavior. Translate the words around values, but do not normalize the legacy formats. Clearly document this as incomplete localization. | Propose `ar-EG-u-ca-gregory-nu-latn` for later localized display: Gregorian calendar, Western digits, currency-specific precision, unchanged ISO storage and numeric arithmetic. Native date UI remains browser-dependent. |
| Direction and portals | Arabic mode sets `html.lang="ar-EG"` and `html.dir="rtl"`; English restores the existing `en`/`ltr` roots. Keep MUI theme `direction: "ltr"` and default Emotion setup. | Body-mounted portals inherit global document direction, so their failure to inherit a local wrapper is **not** expected here. Inspect actual computed direction and geometry; separate DOM inheritance from MUI theme/generated-style limitations. |

These decisions deliberately preserve current behavior during the demonstration. They do not claim every retained LTR convention is a defect: chart chronology and brand direction are intentional target conventions; missing coordination or unwanted rendering must be demonstrated before filing an issue.

## Implementation sequence after approval

1. **Freeze the English reference.** Record the base commit and SHA-256 hashes of all six approved PNGs. Run the untouched English suite before implementation and record actual results. Keep the existing assertions, screenshot tolerance, browser channel and settings intact.
2. **Add minimal localization infrastructure.** Introduce a small shared typed English/Arabic dictionary and React context, without adding a localization dependency. Replace interface text in both apps and shared shell/status/modal/empty-state surfaces with keys or optional translated labels. Preserve every English string, status enum, business-data value, route, calculation and persistence key. Cover headings, navigation, buttons, table labels, validation, dialog copy, accessible names, loading/empty states and pagination labels. Avoid using translated strings for business comparisons or stable keys.
3. **Add an opt-in demonstration entry and switcher.** Proposed entry URL: `?demo=unmigrated-rtl&lang=ar` on either app (ports 4200 and 4201); `lang=en` supplies the English comparison. In this opt-in session show an accessible English/العربية switcher and a persistent, explicitly labeled **Unmigrated RTL — demonstration only** notice in Arabic mode. Do not render the new controls/notice on normal English visits; placing a visible switcher in the default header would invalidate approved screenshots. Preserve the opt-in query through navigation, reloads and cross-app links, retaining each destination's normal route. Do not persist language in business localStorage or contaminate ordinary English visits. No-query routes remain English LTR. The switcher remains reachable at desktop/mobile widths and restores English without clearing user data.
4. **Apply document direction only.** Connect the shared locale context to both bootstraps and the document root. Retain the existing Provider/theme, stylesheet, Emotion templates, inline styles, SVG layout, column definitions, drawer geometry and directional icons. Shared-component edits are limited to translation plumbing and the opt-in controls; no styling edits to make legacy components fail. New demonstration UI may have its own minimal scoped styling, which must not affect existing layout outside the opt-in mode.
5. **Observe and capture.** Add a separate demo Playwright specification/capture command and deterministic fixtures. Keep it separate from the original English spec. Exercise the matrix below in fresh browser contexts; retain only visible, reproducible problems in the confirmed issue report. Save screenshots separately from approved baseline files.
6. **Verify and document.** Run build, lint, typecheck and the original English regression suite, plus the new language/demo checks. Publish a capture gallery and an issue report with evidence, proposed remedies and actual command outcomes. Stop before implementing any remedies.

Proposed source scope: new `libs/shared/src/i18n.tsx` (or a small sibling localization module), both `apps/*/src/main.tsx` bootstraps, application pages/components and text-only integration in `libs/design-system/src/index.tsx`. Existing [styles.css](../libs/design-system/src/styles.css) and shared theme/style declarations remain unchanged. Avoid refactoring the design-system entry point or changing Storybook configuration in this phase.

## Reproducible observation matrix

Use the locked Playwright Chromium build on macOS, UTC, light mode, fixed data/date inputs, no remote fonts, and disabled screenshot animations. Keep browser locale `en-US` for the primary LTR/RTL comparison to isolate application direction and translation changes; separately record native-control behavior if a browser-locale `ar-EG` check is useful. Record browser version, OS/font environment and browser locale with captures.

Primary viewports: **1440×1000 desktop** and **390×844 mobile**. Capture full-page frames plus focused clips where needed. Reset demo business storage in each isolated capture context; use the existing records by default. For mixed-text confirmation use an ordinary Arabic description and existing Latin customer/ID/currency values, entered through real form controls. Do not alter records merely to create visually extreme failures.

| Scenario | Reproduction / evidence to inspect | Existing source anchor |
| --- | --- | --- |
| Both app shells | Open overview and purchase orders, switch Arabic, inspect sidebar anchor, content reservation, active edge, brand and cross-app arrow; on mobile open/close navigation. | [SidebarFrame:211](../libs/design-system/src/index.tsx#L211), [mobile transform:222](../libs/design-system/src/index.tsx#L222), [content gutter:114](../libs/design-system/src/styles.css#L114), [active edge:83](../libs/design-system/src/styles.css#L83) |
| Dashboard | Inspect KPI label/icon clearance, translated months against SVG endpoints, legend spacing and recent-invoice arrows. | [KPI icon:241](../libs/design-system/src/styles.css#L241), [SVG:103](../apps/invoicing/src/pages/Dashboard.tsx#L103), [months:135](../apps/invoicing/src/pages/Dashboard.tsx#L135), [literal arrow:199](../apps/invoicing/src/pages/Dashboard.tsx#L199) |
| Invoice and order lists/details | Check table headers/cells, amount alignment, pagination arrow roles, count ranges, detail action and mixed ID/date/supplier text. On mobile inspect initial horizontal scroll and both extreme columns. | [DataTable:172](../libs/design-system/src/index.tsx#L172), [pagination:65](../apps/invoicing/src/pages/Invoices.tsx#L65), [order sentence:104](../apps/procurement/src/App.tsx#L104) |
| Invoice form | Capture empty, focused and error states; open customer/currency/status menus where present; inspect notch, label, helper, grid, date/number entry and caret behavior. | [FormField:83](../libs/design-system/src/index.tsx#L83), [form fields:94](../apps/invoicing/src/pages/CreateInvoice.tsx#L94), [line items:151](../apps/invoicing/src/pages/CreateInvoice.tsx#L151) |
| Confirmation and customer dialogs | Open through real workflows. Capture title/close clearance, actions and Arabic sentence with customer/amount. Record portal placement, computed direction and MUI configuration; inspect focus and token copying. | [Modal:141](../libs/design-system/src/index.tsx#L141), [close:147](../libs/design-system/src/index.tsx#L147), [confirmation:231](../apps/invoicing/src/pages/CreateInvoice.tsx#L231), [customer dialog:43](../apps/invoicing/src/pages/Customers.tsx#L43) |
| Settings | Inspect translated labels, email/amount/date conventions and mobile fit in both apps. | [invoicing settings:33](../apps/invoicing/src/pages/Settings.tsx#L33), [procurement settings:146](../apps/procurement/src/App.tsx#L146) |

Capture each scenario at both widths where available; do not invent a procurement dialog that the real app does not render. Source anchors above describe the current commit; update final issue references to exact implemented lines.

**Do not reproduce the audit's hypothetical partial-sidebar move or wrapper-only portal failure.** Neither is part of this mode. A left drawer remaining on the left is a convention mismatch, not proof that it malfunctions. Report a suspected issue as unconfirmed if the rendering is correct or evidence is ambiguous.

## Deliverables and issue format

- `docs/phase-2a-observed-issues.md`: confirmed findings and a separate table of investigated candidates that did not reproduce.
- `docs/screenshots/phase-2a/`: separately named desktop/mobile captures, including matching opt-in English reference frames and clear Arabic-mode labeling.
- `docs/phase-2a-screenshots.md`: gallery, route/state manifest and exact capture command.
- Separate demo tests: translation/switch/reload/cross-app behavior, root attributes, unchanged stored identifiers, and portal computed-direction evidence. Broken-layout images are documentary evidence, **not approved RTL correctness baselines**. Do not encode accidental bad pixels as the target of future migration tests.

Each confirmed issue includes: stable ID, application/route, viewport, exact starting URL and interaction steps, fixture/input values, screenshot links, observed vs proposed behavior, current source path/line, root cause and classification (automation/manual/runtime), proposed later remediation, and any browser-specific limitation. Distinguish physical CSS, inline styles, MUI theme, Emotion processing, native browser UI and bidirectional text causes. Do not attribute every portal symptom to inheritance or every Latin identifier to reversal.

## English regression gate and reporting

Keep all six existing `tests/e2e/baseline.spec.ts-snapshots/*-ltr-darwin.png` files byte-identical: overview, invoices, create-invoice, customers, settings and procurement. Do not use `--update-snapshots`, relax assertions, hide/mask new default-English UI or loosen image thresholds to force a pass. Hash-check the images before and after implementation.

Run these commands after approval, both before and after implementation for the original regression tests:

```sh
npm test
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/atlas-playwright npm run test:e2e -- tests/e2e/baseline.spec.ts --workers=2
```

Post-implementation also run:

```sh
npm run lint
npm run typecheck
NX_DAEMON=false NX_ISOLATE_PLUGINS=false npm run build
```

The browser path is this workstation's existing cache; other machines must install the locked Chromium build and use their configured path. The original audit recorded **4 unit tests and 11 Playwright tests passing**, including six screenshot comparisons. Those are historical results, not a fresh Phase 2A run. **No tests or captures have been run for this plan-only step.** After implementation report actual counts, failures, baseline hash comparison, warnings and unresolved issues; never replace a failed check with the earlier audit result. If a gate fails, preserve the evidence and fix implementation regressions without updating approved baselines.

## Review checkpoint

Approval is requested for the decisions above, including the opt-in switcher (rather than a default-English visual change), global document direction, retained legacy formatting and the intentional absence of RTL fixes. After review, implementation may proceed within this scope. This preparation ends with this document; no code, dependencies, tests, configuration, screenshots or baseline files are modified.
