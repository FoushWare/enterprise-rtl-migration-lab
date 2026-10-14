# Migrating Enterprise React Apps to RTL Without Breaking LTR

## Phase 3 Stage 2 — Scanner Foundation review

Implemented on `feat/phase-3-rtl-scanner`, based on approved Phase 2A checkpoint `61491d7f6dd359033c4a9e80b556d3b3e2446305`. Review date: 12 October 2026 (Africa/Cairo). Stage 2 only: source evidence extraction, not RTL detection. No risk classifications, codemods, runtime changes, dashboard or nine-issue coverage claim.

### Files and dependencies

- `tools/rtl-scanner/`: independent private tooling/Nx project; build and source/test typecheck configs, isolated Vitest config, CLI, discovery, evidence model, CSS/TypeScript/HTML adapters, JSON/Markdown serializers, README and fixtures/tests.
- Root `package.json`: scanner build, scan, test and typecheck scripts; pinned parsing development dependencies. `package-lock.json` records those direct dependencies. The approved architecture document remains uncommitted alongside this delivery.
- This review is the only additional project documentation. No application/library source, runtime settings, translations, legacy CSS, business records, original tests or screenshots changed.

Pinned direct dependencies: **PostCSS 8.5.29**, **postcss-value-parser 4.2.0**, **parse5 7.3.0**. Existing direct TypeScript dependency is reused. PostCSS and parse5 already existed transitively; they are now explicit tooling dependencies. PostCSS retains its checkpoint-resolved version. No selector parser was needed for foundation extraction, so none was added. No Babel, runtime RTL plugin or transformer was installed.

### Foundation behavior

Discovery reads the current flat Nx applications/libraries and project sourceRoot metadata as JSON; it does not invoke Nx or execute project files. It inventories supported source files and application entry HTML, sorting repository-relative paths. Stories and non-source/generated inputs are excluded or recorded as skipped. Symlinks are not traversed. Source-size bounds and explicit invalid-input errors protect the read-only boundary.

Adapters retain exact original source snippets with one-based line/column and zero-based half-open UTF-16 offsets. CSS preserves selector/media context and tokenized values. TypeScript extracts imported Emotion templates, MUI sx, createTheme styleOverrides and React inline style objects. Alias normalization preserves original declarations. Responsive values/arrays retain branch context; callbacks are inspected structurally with diagnostics, never invoked. MUI sx spacing, raw Emotion theme overrides and React inline styles have distinct semantic labels. HTML reports initial root lang/dir facts, not runtime correctness.

Report schema v1 exposes stable evidence IDs, digest, files/skipped inputs, source locations/context, semantics and diagnostics. JSON and Markdown derive from one canonical model, with no timestamp, machine identity or absolute checkout paths. An empty `findings` field reserves the later report seam; control-center UI and finding classification remain deferred. IDs are anchored to path/mechanism/context/property/value and duplicate ordinal, not line numbers; arbitrary refactors or duplicate insertion can change identity.

### Actual Atlas inventory

20 supported source files; **419 extracted facts**:

| Mechanism | Facts |
| --- | ---: |
| Plain CSS | 338 |
| Emotion styled templates | 13 |
| MUI sx | 46 |
| Theme styleOverrides | 8 |
| React inline styles | 10 |
| HTML root attributes | 4 |

These counts include nondirectional styles and initial English root attributes. They are not risk counts, confirmed issues or evidence of migration readiness.

**Nine incomplete-coverage diagnostics:** eight dynamic values (color expressions, computed presentation values and shared status colors), plus the unresolved `k.icon` sx owner at Dashboard line 63. Dynamic value evidence retains the expression text rather than fabricating a resolved value. Report `complete:false` and CLI exit 2 are intentional for this inventory; no parser crash or failed test is implied.

| Source | Diagnostics |
| --- | --- |
| `apps/invoicing/src/components/InvoiceTable.tsx:32–33` | 2 dynamic values |
| `apps/invoicing/src/pages/Customers.tsx:29` | 2 dynamic values |
| `apps/invoicing/src/pages/Dashboard.tsx:63`, `:151`, `:171` | 1 unresolved sx owner; 2 dynamic values |
| `libs/design-system/src/index.tsx:120–121` | 2 dynamic values |

### Verification

| Check | Actual result |
| --- | --- |
| Scanner tests | 21 passed, including CSS/TSX/HTML file fixtures and negative/dynamic cases |
| Tooling source and test typecheck | Passed |
| Foundation build | Passed |
| Existing lint | Passed |
| Application typecheck | Passed |
| Nx build | 3 tasks succeeded: both applications plus scanner; final combined run used 2 cached tasks; earlier run succeeded with no cache hits |
| Existing unit tests | 4 passed |
| Original English + Arabic demo Playwright | 20 passed in 13.4s: 11 original tests (six visual assertions) and nine demo tests |
| Six approved English SHA-256 checks | All match |
| Checkpoint preservation | Application/library sources, original e2e tests/config-relevant source and all 68 documentary PNGs plus manifest/gallery are byte-identical to Phase 2A |
| Scan determinism | Repeated JSON and Markdown reports byte-identical; temporary-root integration test also checks different checkout paths |
| Scan read-only | Repeated direct CLI scans leave source/documentation/test/tooling files and ignored Nx/build files unchanged in both content and mtime; inventory comparison detects additions/removals too |

Builds/tests can create ignored build/test caches; those commands are separate from scanner execution. Direct CLI scanning imports parser/tooling code only, writes reports solely to stdout and runs no subprocess/network/config functions. Tests create temporary fixtures outside the repository. No repository report is silently written. Browser tests used the already installed Chromium cache and running local applications; no baseline update or capture regeneration command was used. Hosted CI has not run.

### Limits and architecture decisions for review

The foundation uses TypeScript syntax trees and import binding recognition rather than the full no-emit Program/import graph proposed for later semantic attribution. It resolves bounded local const objects and rejects ambiguous repeated names, but does not claim general lexical/type/cross-file symbol resolution. Shared FormField/Button wrappers are recognized explicitly; dynamic/unknown sx owners are diagnosed. Generic wrapper graph attribution is deferred to subsequent approval, not concealed as completed coverage.

Escaped Emotion templates are explicitly diagnosed/skipped rather than implementing cooked/raw segment maps now. Interpolated templates extract only independent complete declarations and retain an incomplete-coverage diagnostic; no evaluation or guessed surrounding selector context. Neither actual Atlas template requires these deferred paths. CSS tokenization does not validate every value grammar or compute shorthand transformations. No selector parser/cascade solver, runtime configuration correlation, icon meaning, bidi analysis, styling ownership policy or risk rules exist yet.

These conservative reductions from the full architecture require review before expanding coverage, particularly cross-file resolution and escaped/interpolated source mapping. The default discovery scope is the current flat Nx layout; nested project layouts and Storybook opt-in configuration are future extensions. The CLI currently offers only `--root` and `--format`, without project filtering, terminal summary or configurable exceptions. Missing/invalid input fails with exit 2; expected dynamic diagnostics emit a useful partial report with the same exit code. CI risk gates are not enabled.

### Run and stop

See [tooling README](../tools/rtl-scanner/README.md). Build separately, then invoke the direct CLI for clean machine-readable stdout:

```sh
npm run rtl:scan:build
node dist/tools/rtl-scanner/cli.js --format json > /tmp/atlas-evidence.json
node dist/tools/rtl-scanner/cli.js --format markdown > /tmp/atlas-evidence.md
```

The current Atlas inventory exits 2 because of the nine declared coverage diagnostics. Reports are extracted facts only; **findings remain empty**. Implementation and documentation remain uncommitted. No push. Stop for foundation approval before Stage 3 conservative RTL rules.
