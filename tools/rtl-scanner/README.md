# Enterprise RTL Scanner Foundation

For **Migrating Enterprise React Apps to RTL Without Breaking LTR**. Stage 2 extracts source evidence only. `findings` is always empty: no RTL risk rules, classification, nine-issue coverage claim, codemods or dashboard are implemented.

From the repository root:

```sh
npm run rtl:scan:typecheck
npm run rtl:scan:test
npm run rtl:scan:build
npm run rtl:scan -- --format json > /tmp/atlas-evidence.json
npm run rtl:scan -- --format markdown > /tmp/atlas-evidence.md
```

For machine-consumable stdout, bypass npm's script banner:

```sh
node dist/tools/rtl-scanner/cli.js --format json > /tmp/atlas-evidence.json
```

The build writes ignored `dist/tools/rtl-scanner`; **scanning is separate and does not build or write caches**. CLI accepts `--root` and `--format json|markdown`. Exit 0 means extraction completed without coverage diagnostics, 2 means incomplete extraction or invalid input; dynamic diagnostics are expected in Atlas. Partial reports remain useful inventories. No `--fix`, output-file writer, subprocess, network or application execution exists in the scanner.

Discovery reads Nx `apps/*/project.json` and `libs/*/project.json` as data, scans their source roots and application index HTML, and excludes stories/dependencies/generated outputs. Symlinks in source trees are skipped; symlink source roots/HTML are rejected. Missing/invalid metadata fails explicitly. This foundation targets the current flat Nx application/library structure, not arbitrary nested project layouts.

Adapters:

- PostCSS retains plain CSS declaration/selector/media context; value parser retains shorthand tokens/functions without proposing changes.
- TypeScript syntax traversal recognizes imported Emotion styled templates, MUI sx and createTheme styleOverrides, and React inline styles. Local const references are bounded and repeated names are rejected conservatively. Nested objects, responsive branches, arrays and literal callback return objects are inventoried. No callback/interpolation is executed.
- parse5 extracts initial HTML root lang/dir attributes with source spans; malformed HTML emits coverage diagnostics.

Report v1 contains source inventory, content digest, stable fact IDs, exact repository-relative UTF-16 ranges (one-based lines/columns, half-open offsets), mechanism/context, raw declarations and semantic labels. MUI sx spacing is theme-based; theme styleOverrides use raw Emotion CSS semantics, and React inline styles have React CSS semantics. MUI mx/my/px/py are physical horizontal/vertical axes, not logical properties. Original source keys are retained in declaration snippets; normalized aliases are evidence, never transformation instructions. JSON and Markdown derive from the same model and omit time/machine paths.

Limits: no cross-module symbol graph, full TypeScript type checker, runtime lifecycle/provider analysis, computed cascade, icon/bidi risk analysis or findings yet. Import-owned MUI components and the known shared FormField/Button wrappers are recognized; dynamic component `k.icon` is unresolved. Foreign sx owners are diagnosed. Dynamic values preserve their source text with diagnostics. Escaped templates are skipped explicitly; interpolated templates yield only independent semicolon-terminated declarations and incomplete-coverage diagnostics. CSS parsing retains source structure but does not validate every value grammar. A static theme override callback and conditional styles can remain unresolved. HTML attributes describe initial markup, not eventual document direction.

Tests cover source ranges/Unicode/CRLF, CSS tokens, templates/interpolation/escapes, sx aliases/responsive arrays/callbacks, inline differences, theme overrides, malformed syntax, unresolved owners, shadowing and deterministic read-only temporary scans. No application styles or screenshots need changing to extend these fixtures.
