# Phase 2A — final review

**Reviewed:** 11 October 2026, branch `feat/phase-2a-broken-rtl`, against committed checkpoint `8700e9c` (Phase 1 platform/audit plus approved plan). **Disposition:** implementation is within the approved Broken RTL Demonstration scope. English regression checks pass. Recommend the documentation cleanup below before public publication. This review grants no Phase 3 authorization.

## Diff and preservation assessment

Reviewed all 15 modified tracked files and the untracked localization modules, demo CSS/tests, capture script, reports, hash manifest and generated gallery/metadata/images. There are no staged changes. The application changes are UI translations, query-preserving links/navigation, locale context/root attributes and opt-in demonstration controls. The small CreateButton arrow-to-function conversion supports its hook; it is related to localization, not unrelated refactoring.

**No RTL fixes, CSS codemods, deliberately introduced layout faults or unrelated refactoring were found.** The only new CSS targets `.atlas-demo-controls` and its children. Existing shared CSS, every existing React `style`/MUI `sx` declaration, shared theme and SidebarFrame template compare unchanged against HEAD. The fixed LTR MUI theme/default Emotion configuration, physical geometry, directional icons and SVG paths remain intact. Business records, calculations, status values, date storage, persistence keys and route identities remain unchanged; the shared data entry point only adds localization exports.

Normal routes remain English LTR, with no selector or notice. Arabic requires the explicit demo query; the language choice is not persisted into business storage. Default English Pagination accessibility labels retain MUI's original behavior. [Document-level direction](../libs/shared/src/i18n.tsx#L29) is the approved demonstration mechanism, not a complete runtime RTL configuration.

Fresh checks performed during this review:

| Verification | Actual result |
| --- | --- |
| `npm test` | **4/4 passed** |
| `PLAYWRIGHT_BROWSERS_PATH=/private/tmp/atlas-playwright npm run test:e2e -- --workers=2` | **20/20 passed in 14.5s**: original English 11 + demo 9 |
| Original English visual assertions | **6/6 passed**, without snapshot updates or relaxed thresholds |
| `shasum -a 256 -c docs/phase-2a-ltr-baselines.sha256` | **All six hashes match** |
| Baseline PNGs, original English spec, Playwright config, dependency lockfile and legacy stylesheet against HEAD | Unchanged |
| Existing theme, SidebarFrame, `sx` and inline style source comparison | Unchanged |
| `git diff --check` | Passed |

These establish preservation of the covered English workflows and approved screenshot states, not exhaustive equivalence for every possible browser/input. Lint, typecheck and builds passed in Phase 2A; they were not rerun for this report-only review. Hosted CI remains unverified.

## Nine-issue summary

All nine issue entries were reviewed against the current source, screenshots and regenerated capture measurements. Retain the report's severity definitions: **3 Major, 6 Minor, no Critical observed**. A Minor convention mismatch is not a blocked workflow. Treatment below is proposed future work, not authorization to apply it.

| Issue ID and title | Severity | Affected application/component | Root cause / source | Treatment | Screenshot reference | Video value |
| --- | --- | --- | --- | --- | --- | --- |
| RTL-01 — Navigation remains on physical left | Minor | Both apps; Sidebar/AppShell/mobile drawer | Fixed left anchor and transform [index.tsx:215](../libs/design-system/src/index.tsx#L215), left gutter [styles.css:114](../libs/design-system/src/styles.css#L114), left active edge [styles.css:83](../libs/design-system/src/styles.css#L83) | **Manual** shell geometry; paired active-edge spacing is an **automation candidate after the convention is approved** | [Desktop](screenshots/phase-2a/orders-desktop-ar.png), [mobile](screenshots/phase-2a/invoicing-navigation-mobile-ar.png) | High |
| RTL-02 — Revenue months disagree with chronology | Major | Invoicing; dashboard SVG/month strip | RTL flex label order [styles.css:282](../libs/design-system/src/styles.css#L282) disagrees with fixed SVG endpoint [Dashboard.tsx:123](../apps/invoicing/src/pages/Dashboard.tsx#L123) | **Manual** chart semantics/axis-label coordination | [Desktop](screenshots/phase-2a/overview-desktop-ar.png), [mobile](screenshots/phase-2a/overview-mobile-ar.png) | High |
| RTL-03 — KPI icons obscure Arabic labels | Major | Invoicing; dashboard KPI cards | Absolute top-right icon [styles.css:241](../libs/design-system/src/styles.css#L241) overlaps right-starting label without clearance | **Manual** icon placement and label-space review; no blanket property substitution | [Desktop](screenshots/phase-2a/overview-desktop-ar.png), [mobile](screenshots/phase-2a/overview-mobile-ar.png) | High |
| RTL-04 — Fields retain LTR geometry | Minor | Both apps; FormField/search/create/settings/status selects | Fixed LTR theme [index.tsx:40](../libs/design-system/src/index.tsx#L40) and unchanged generated Emotion styles in [FormField:84](../libs/design-system/src/index.tsx#L84) | **Runtime configuration**: document/theme/cache coordination | [Form](screenshots/phase-2a/create-desktop-ar.png), [procurement menu](screenshots/phase-2a/order-menu-mobile-ar.png) | High |
| RTL-05 — Dialog close button collides with title | Major | Invoicing; shared Modal, confirmation/customer dialog | Physical `right:12` [index.tsx:150](../libs/design-system/src/index.tsx#L150) conflicts with RTL title alignment | **Manual**, coordinated with **runtime configuration** to avoid double flipping | [Confirmation](screenshots/phase-2a/confirmation-desktop-ar.png), [mobile customer](screenshots/phase-2a/customer-dialog-mobile-ar.png) | High |
| RTL-06 — Arabic table headings stay left aligned | Minor | Both apps; DataTable/list/detail tables | MUI physical alignment retained in [TableCell:191](../libs/design-system/src/index.tsx#L191); no column alignment contract | **Runtime configuration**, then **manual** text/numeric/token alignment policy | [Invoice table](screenshots/phase-2a/invoices-desktop-ar.png), [order table](screenshots/phase-2a/orders-desktop-ar.png) | Medium |
| RTL-07 — Arrows retain LTR progression | Minor | Both sidebars; invoicing row/view-all actions and Pagination | Existing ArrowForward [InvoiceTable.tsx:76](../apps/invoicing/src/components/InvoiceTable.tsx#L76), literal arrow [Dashboard.tsx:197](../apps/invoicing/src/pages/Dashboard.tsx#L197), LTR-theme pagination | **Manual** icon semantics; **runtime configuration** for MUI pagination | [Rows](screenshots/phase-2a/invoices-desktop-ar.png), [mobile pagination](screenshots/phase-2a/invoices-mobile-ar.png) | Medium |
| RTL-08 — Unisolated mixed tokens change presentation | Minor | Invoicing; confirmation/customer name/address | Unisolated mixed sentence/amount [CreateInvoice.tsx:228](../apps/invoicing/src/pages/CreateInvoice.tsx#L228), direct address [Customers.tsx:52](../apps/invoicing/src/pages/Customers.tsx#L52) | **Manual** bidi isolation and content policy, separate from formatting | [Amount](screenshots/phase-2a/confirmation-desktop-ar.png), [address](screenshots/phase-2a/customer-dialog-mobile-ar.png) | Medium |
| RTL-09 — Latin brand composition reordered | Minor | Both apps; sidebar brand | Inherited RTL flex order [styles.css:15](../libs/design-system/src/styles.css#L15) affects separate symbol/wordmark/period children [index.tsx:250](../libs/design-system/src/index.tsx#L250) | **Manual** intentional LTR brand island | [Desktop](screenshots/phase-2a/overview-desktop-ar.png), [mobile](screenshots/phase-2a/invoicing-navigation-mobile-ar.png) | High |

No complete issue is a safe unattended automation task. Bounded physical-spacing candidates can be automated later only after semantic decisions/runtime ownership are settled. All listed future remedies remain unapplied.

Evidence qualifications in the [detailed report](phase-2a-observed-issues.md) are sound: portals inherit global RTL correctly; the drawer still functions on the left; mobile table extremes are accessible; complete identifiers/emails are not wholesale reversed; growth/external-link glyphs need separate semantic decisions. The dollar sign/address/punctuation presentation in RTL-08 is distinct from changed stored amounts. Native date rendering, typography, other browsers, print and exhaustive caret/focus coverage remain limitations.

## Best three before/after video demonstrations

1. **RTL-02 — Chart chronology:** zoom into the Arabic months and the unchanged high right-hand endpoint. Show why translating text and changing HTML direction can make a chart misleading. A future approved after-shot should preserve May-to-October physical left-to-right chronology while making labels and plotted data agree.
2. **RTL-05 — Dialog collision:** use the documented Northstar Studio confirmation workflow or first customer dialog; the close glyph visibly cuts into the title. This explains the difference between correct portal direction inheritance and correct component geometry. A future after-shot should show title clearance on desktop and mobile.
3. **RTL-03 — KPI obstruction:** zoom into the same overview before/after; the icon covers the beginning of Arabic labels. This offers an immediate visual demonstration of physical positioning and reserved space without needing a complex interaction.

Use the existing opt-in English comparison as context, then the current labeled Arabic frame as the migration **before**. The approved English LTR baseline is not the future Arabic **after**. No fixed-RTL after-shot exists yet. All three recommended shots are real Major findings; sidebar/brand is a useful brief opening shot, and RTL-04 is a good supplementary framework explanation.

## Screenshot reproducibility and baseline distinction

Re-executed the capture script into a **temporary output directory**, with only its output destination changed in a temporary copy. Repository code, existing evidence PNGs, manifest and gallery were not overwritten. Both local applications ran from this checkout.

**Result:** all 68 scenarios completed, Chromium 156.0.8078.4, macOS arm64/Darwin 25.6.0, browser en-US, UTC, light mode, 1440×1000 and 390×844. Zero JavaScript page errors. Capture metadata/measurements matched the original manifest exactly; only the generation timestamp differed.

- **67/68 PNGs were byte-identical.** `create-mobile-ar.png` retained its 390×1224 full-page size but differed at **8 pixels**, maximum channel difference **5/255**, within x=231–345/y=958–961 near a button outline. No geometry discrepancy was measured; the precise rasterization cause was not established. The pipeline reproduces the states strongly, but does not guarantee bit-perfect images across every run/environment.
- Inventory is 30 desktop images (15 states × 2 languages), 38 mobile images (19 states × 2 languages), covering 48 invoicing and 20 procurement frames. The gallery has matching per-image URLs/steps and relative image links. Its capture directory is approximately 5.4 MiB.
- The 68 files in `docs/screenshots/phase-2a/` are **documentary evidence**, generated by [capture-phase2a.mjs](../scripts/capture-phase2a.mjs#L103), not screenshot assertions and not desired RTL behavior locked into tests.
- The six files under `tests/e2e/baseline.spec.ts-snapshots/` are the **approved default-English regression baselines**, asserted by the unchanged original spec. Opt-in English gallery images contain demo controls and must not replace these baselines.
- The script uses isolated contexts, seed data, fixed form inputs, font readiness, a 350ms transition wait and disabled screenshot animations. It neither saves invoices nor modifies a user's existing browser storage. Portal/drawer captures use the viewport; normal pages use full-page mode. Browser/OS fonts and transition/rasterization timing remain environmental dependencies.

Normal regeneration command, **after review**, with both apps running:

```sh
PLAYWRIGHT_BROWSERS_PATH=/private/tmp/atlas-playwright node scripts/capture-phase2a.mjs
```

That command writes repository documentary images; it was **not** used directly during this review. A fresh installation can use `npx playwright install chromium --no-shell` and the default browser cache. Preserve the six asserted baselines independently of documentary regeneration.

## Public-repository hygiene and follow-ups

| Finding / location | Review recommendation |
| --- | --- |
| Personal checkout path in [docs/phase-2a-screenshots.md:12](phase-2a-screenshots.md#L12), inside the Vite `@fs` URL | **Remove or generalize before public publication.** It reveals the local username/folder layout and breaks on other checkouts. Keep the existing relative gallery link; document generic local serving separately. Do not copy the actual home path into public-facing release text. |
| Workstation browser-cache paths in [phase-2a-screenshots.md:28](phase-2a-screenshots.md#L28), plan/audit/earlier verification | Not secrets, but not portable defaults. Keep historical verification context clearly labeled; prefer the already supplied fresh-machine/default-cache commands for public instructions. Never commit browser binaries or temporary replay files. |
| README Phase 1 statement at [README.md:35](../README.md#L35) says no Arabic or direction switch, contradicting its Phase 2A section | Label the statement as historical Phase 1 scope or rewrite it after approval. This is a documentation correction, not evidence of an implementation scope violation. |
| `docs/screenshots/phase-2a/*.png`, `manifest.json`, `index.html` | Generated **intentionally useful** evidence; reasonable to commit with the capture script. Manifest timestamps/OS/browser details support reproduction and are not credentials. PNGs contain only IHDR/IDAT/IEND chunks, with no embedded text/EXIF metadata. Fixture names/emails are synthetic `.example` records. |
| Present ignored `.nx/`, `dist/`, `node_modules/`, `playwright-report/`, `test-results/`, `.DS_Store` files | Keep excluded. No build/cache/browser/test-run output needs to be force-added. No unnecessary nonignored artifact was found outside the intended source/tests/docs/evidence additions. |
| Secret-shaped content and candidate credentials | Scanned tracked and nonignored candidate text files for private-key headers and common GitHub/AWS/API token shapes; **no matches**, `.env`, key/PEM files or credential candidates found. This is a scoped local review, not a guarantee covering unknown Git history or every secret format. |
| Translated save-error text is stored in component state at [CreateInvoice.tsx:73](../apps/invoicing/src/pages/CreateInvoice.tsx#L73) and rendered directly at [CreateInvoice.tsx:204](../apps/invoicing/src/pages/CreateInvoice.tsx#L204) | Minor source-review follow-up: switching language after a failed save can retain the prior error language. This failure-path case was not runtime-tested here and is not one of the nine confirmed visual issues. Consider rendering an error key through the active locale later; do not change code during this review. |

At the time of this review, the privacy/portability and README corrections had not been applied. Following approval, finalization generalized the gallery instructions, clarified README phase boundaries, and recorded the save-error persistence limitation in the observed-issues report. Implementation behavior and screenshot files were not changed.

**Stop point:** this report is the only new repository artifact from the review. All pre-existing tracked and nonignored files, including uncommitted Phase 2A changes and documentary screenshots, were protected by before/after hashes. Wait for user approval on publication cleanup and any subsequent phase.

## Approved finalization verification

Following final-review approval, only documentation was adjusted during cleanup: the personal gallery URL was replaced with a repository-relative preview command, README distinguishes the preserved Phase 1 baseline from Phase 2A, and save-error language persistence is recorded as an intentionally unfixed known limitation. No implementation behavior, documentary screenshots or regression baselines changed during cleanup.

Final checks passed: lint, TypeScript, both application builds (2/2 Nx cache hits), 4/4 unit tests and 20/20 Playwright tests in 19.4s (11 original English tests including six screenshot comparisons, plus nine demo tests). All six SHA-256 baseline checks passed and baseline bytes equal the pre-finalization HEAD.

Reviewed the complete staged scope: 94 files, including 68 intentional documentary PNGs. No personal home paths, common credential patterns, generated caches, unrelated files or original baseline files were staged. Ignored dependency/build/test outputs remain excluded. Historical temporary browser-cache commands elsewhere in the audit/plan describe the verification environment; they are not secrets or committed binaries. No push or Phase 3 work is authorized by this finalization.
