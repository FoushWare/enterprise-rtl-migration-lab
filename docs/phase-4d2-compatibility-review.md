# Phase 4D.2 — RTL compatibility proof and scanner contract

Project: **Atlas Invoice — Migrating Enterprise React Apps to RTL Without Breaking LTR**. Coffee Break Web. Date: 12 October 2026.

## Executive summary

**APPROVE WITH CONDITIONS** for this bounded compatibility/scanner stage. The published candidate **@mui/stylis-plugin-rtl@7.3.10** passed direct Stylis and isolated Chromium/Emotion/MUI experiments with the required exact versions. Declaration exclusions preserved the representative physical shell in development and minified production fixtures. No application RTL pipeline was activated.

Scanner support now proves an explicitly bounded same-file configuration and keeps unsupported configurations blocking. Current production report has **zero delta**: 419 facts, 56 findings, complete=true, nine visible nonblocking diagnostics, identical JSON/Markdown bytes and stable IDs/categories. This is not proof that the proposed cross-file production architecture is implemented or already analyzable.

**Remaining activation gate:** decide the single document-direction writer and how its connection to the design-system cache is represented. The current LocaleProvider writer and future design-system provider occupy different files; this scanner does not prove cross-file context flow. Before 4D.3, approve either a consolidated, analyzable runtime writer while LocaleProvider remains the language source, or a separately bounded cross-file analysis prerequisite. Do not activate and suppress the resulting uncertainty. Preserve **4D infrastructure → 4E component fixes → 4F controlled codemods**.

Labels: FACT = inspected source/package metadata; EXPERIMENT = directly executed isolated check; PROPOSAL = future change requiring approval; LIMIT = evidence not established. No semantic approvals are added by this review.

## Baseline and source investigation

FACT: branch `feat/phase-3-rtl-scanner`, HEAD `ffc50d407fe560c46e936f2be0ccb5a1a5101ba0`; initial working tree clean. Read the runtime contract, approved roadmap, Stage 4A implementation plan, scanner architecture/README/policy, runtime rules/tests, root manifests/lockfile, shared Provider/SidebarFrame and locale code. Both main trees remain StrictMode→fixed LTR Provider→Router→LocaleProvider→App. LocaleProvider writes root lang/dir for existing opt-in Arabic query; shared theme remains LTR and no owned cache/plugin exists in app/library source.

Before editing, compiled CLI output was saved outside the repository in both formats for exact after comparison. Current approved categories remain 48 MANUAL_REVIEW, five RUNTIME_CONFIG, two INTENTIONAL_LTR, one INFORMATIONAL and zero AUTO_CANDIDATE (53 actionable, three metadata). Archived Stage 3 reports retain 58 entries and are not regenerated.

## Published candidate and provenance

FACT: registry metadata was obtained with npm view against the published release, not master. Source: [npm registry version record](https://registry.npmjs.org/@mui%2fstylis-plugin-rtl/7.3.10); [published tarball](https://registry.npmjs.org/@mui/stylis-plugin-rtl/-/stylis-plugin-rtl-7.3.10.tgz).

| Item | Verified value |
| --- | --- |
| Version / publisher identity | 7.3.10; package author MUI Team, repository mui/material-ui |
| Published time | 2026-04-08T07:08:05.486Z in registry time record |
| Stylis peer | 4.x; tested 4.2.0 satisfies this major range |
| Node engine | >=14.0.0; experiment Node v22.21.1 |
| Dependencies | cssjanus ^2.3.0 and @babel/runtime ^7.28.6; isolated resolved 2.3.1 and 7.29.10 |
| SHA-1 | 38b8bbf57e5966588651d7ff2def8e7c5fbb6cc8 |
| SRI | sha512-hHxWzB3Ad+cMW+0CtpXOTBB94etCS8SB23skYilq7+iK/Vz2MVKzh9ioTYZVLab/5dG+3uGWDYJgMHIYjRcFNw== |
| Tarball proof | Independently downloaded bytes matched both SHA-1 and SHA-512 SRI |
| Signature / provenance | Registry contains signature and SLSA provenance-attestation metadata; signature/attestation cryptographic verification was **not** performed |

The published package exports root `require` to index.js/index.d.ts and default ESM to esm/index.js/index.d.ts; package.json is exported, direct ./esm is null. EXPERIMENT: require(root).default and ESM import of the published ESM entry both yielded callable plugins; browser bundling also resolved the package entry successfully. Type declarations were inspected as export targets, not compiled in a new application project.

[MUI v7 RTL guidance](https://v7.mui.com/material-ui/customization/right-to-left/) supports this plugin family and the prefixer-before-RTL setup with declaration noflip comments. [Emotion cache documentation](https://emotion.sh/docs/@emotion/cache) explains custom plugin lists and distinct cache keys. The selected package has no MUI peer requirement; compatibility with MUI 7.3.11 is supported by the executed fixture and official version-specific guide, not version-number similarity alone. Registry release history shows continued upstream releases through October 2026; that is maintenance evidence, not a future-support guarantee. Newer major releases were not selected or installed in the project.

## Exact isolated environment

All new dependencies were installed **outside the repository**, under a temporary proof directory, using exact versions and npm --ignore-scripts/--no-audit/--no-fund. npm cache, metadata, lockfile, bundles and results also stayed outside the repository. Root package.json/package-lock.json and node_modules were not modified by these isolated installations. Installed package versions and exports were checked directly.

| Package | Final tested version | Evidence |
| --- | --- | --- |
| @mui/material | 7.3.11 | Installed package metadata; MUI peers accept Emotion 11 and React 19; engine >=14 |
| @emotion/react | 11.14.0 | Conditional browser/development/ESM/CJS exports; React peer >=16.8 |
| @emotion/cache | 11.14.0 | Default createCache conditional exports; custom plugin pipeline executed |
| @emotion/styled | 11.14.1 | Matches actual root lockfile; template comments tested |
| stylis | 4.2.0 | Named compile/serialize/middleware/prefixer/stringify imports executed |
| @mui/stylis-plugin-rtl | 7.3.10 | Published tarball verified independently |
| react / react-dom | 19.3.0 / 19.3.0 | Matches actual root lockfile; final browser fixture executed with these versions |
| esbuild | 0.25.12 | Isolated browser bundler, compatible with installed Vite's ^0.25.0 bundler family; no Vite application build claimed |
| jsdom | 26.0.0 | Initially installed but not used for proof; real Chromium used instead |
| @emotion/serialize / @emotion/sheet | 1.3.3 / 1.4.0 | Isolated versions match current root lockfile |

Core packages' published SRI values are recorded in the temporary installation lockfile/results; npm verifies installed package integrity. Independent tarball hashing was performed specifically for the selected RTL plugin. The retained runner asserts exact installed runtime versions before testing and excludes extraneous lockfile records when reporting versions. An initial exploratory run used React 19.1.0; it was superseded by final matching 19.3.0 runs and is not the final compatibility claim.

Two reproducible source fixtures are retained under tools/rtl-scanner/tests/experiments. They are manual experiments, excluded from normal *.test.ts Vitest discovery. They neither install packages nor start servers. The runner rejects an output directory inside the repository, reuses the existing project Playwright driver, and writes only to the external directory. The fixture is loaded by page.setContent/addScriptTag, without mounting production apps.

Reproduction recipe, from repository root, with an existing Playwright Chromium installation:

```sh
RTL_PROOF_DIR=$(mktemp -d /private/tmp/atlas-rtl-proof.XXXXXX)
npm install --prefix "$RTL_PROOF_DIR" --save-exact --ignore-scripts --no-audit --no-fund \
  @mui/material@7.3.11 @emotion/react@11.14.0 @emotion/cache@11.14.0 \
  @emotion/styled@11.14.1 stylis@4.2.0 @mui/stylis-plugin-rtl@7.3.10 \
  react@19.3.0 react-dom@19.3.0 esbuild@0.25.12
npm view @mui/stylis-plugin-rtl@7.3.10 version dist peerDependencies engines exports dependencies time \
  --json > "$RTL_PROOF_DIR/plugin-metadata.json"
node tools/rtl-scanner/tests/experiments/compatibility-proof.mjs "$RTL_PROOF_DIR"
```

Executed environment used an existing temporary Chromium cache via PLAYWRIGHT_BROWSERS_PATH=/private/tmp/atlas-playwright. Default cache lookup failed because it lacked the binary; reusing the already installed cache succeeded, with **Chromium 156.0.8078.4**. Initial restricted registry access failed; permitted isolated network execution succeeded. No browsers were installed and no failure is described as a passing experiment.

## Stylis processing and shell exclusions

EXPERIMENT: five direct CSS cases, each processed with prefixer-only and prefixer+RTL, with assertions retained in the runner:

| Case | LTR output / RTL output | Result |
| --- | --- | --- |
| Physical edges/border/motion | left:0→right:0; right:2px→left:2px; border-right→border-left; translateX(-100%)→translateX(100%) | Expected physical processing verified; demonstrates partial-shell risk |
| Logical declarations | margin-inline-end:6px, padding-inline-start:7px and inset-inline-start:0 | Byte-identical directional outputs, including prefixer-generated logical aliases |
| Excluded edges/border/motion | Separate noflip comment before left, border-right and transform | Byte-identical LTR/RTL output, including prefixed transforms |
| Nested/media rules | Unexcluded outer left flips; annotated max-width:900px negative transform and nested .is-open transform remain | Exclusion is scoped, not a whole-selector disable |
| Prefixer behavior | Flex/user-select vendor output retained in both directions | Explicit prefixer confirmed |

Representative excluded output:

```css
left: 0;
border-right: 1px solid red;
-webkit-transform: translateX(-100%);
-moz-transform: translateX(-100%);
-ms-transform: translateX(-100%);
transform: translateX(-100%);
```

Browser fixture derives the actual SidebarFrame structure: fixed edges, 238px width, border-right, flex-column, max-width 900px closed negative transform/open zero transform. Proposed declaration comments are added only to this isolated fixture; production SidebarFrame is untouched. Plain CSS reserves/resets the left gutter and print hides aside as in the app. Esbuild development and minified production bundles preserve the template's exclusion meaning.

**Shell-preservation feasibility: PASS within these representative fixtures, not a full application acceptance.** RTL desktop anchor x=0 and 1px right/0px left border remain. At widths 899/900, closed x=-238 and open x=0, gutter=0; at 901, x=0 and gutter=238. Print hides aside and resets gutter. No selector-wide plugin opt-out is assumed. Production Vite assembly, real sidebar descendants/content, English screenshot parity, full drawer interactions and additional widths remain 4D.3 gates. A future failed shell gate must block activation, not justify an unapproved atomic migration.

## Cache lifecycle and browser results

EXPERIMENT: literal module-lifetime LTR/RTL caches (keys css / atlas-rtl), prefixer-only / prefixer+plugin, paired themes, CssBaseline, explicit Global style, TextField state probe, portal Dialog and excluded shell. Root direction updates in a layout effect; a useTheme probe records the actual active MUI direction. Fixture renders the same component tree with changing props under StrictMode.

| Observation | Development | Minified production |
| --- | --- | --- |
| Five en→ar→en cycles after warmup | Passed | Passed |
| State probe initial effect mounts | Two from StrictMode replay | One |
| Additional mounts during switching | Zero | Zero |
| Input node identity and entered value | Preserved | Preserved |
| Root/theme/class-prefix direction | Matched each step | Matched each step |
| Dialog portal computed direction | Matched each step | Matched each step |
| Identical-state warmed/final Emotion tags | Five / five | Five / five |
| Identical-state warmed/final CSSOM rules | 101 / 101, all unique | 101 / 101, all unique |
| RTL Global border then return to LTR | Correct active side, no stale global effect | Correct active side, no stale global effect |
| Console/page errors | Zero | Zero |
| Global sheets removed on root unmount | Passed | Passed |

CSSOM was read rather than assuming style.textContent represents production speedy insertion. Inactive component sheets can remain; unchanged final inventories and unique rules establish bounded reuse for this fixture. Global sheets can be replaced during switches; zero style-tag churn was not required. Disposal tests establish Global cleanup, not full registry/HMR/multiple-root cleanup. Imported cache instances are stable module constants; a dynamically recreated cache/factory was not tested or blessed.

LIMITS: no real application routes, business save workflow, actual shell scroll/focus semantics, local LTR widget portal island, first-paint video, SSR, CSP, HMR or other browser proof. No screenshots were taken. No actual Vite production build of either application was changed or executed for this proof. Isolated behavior must be revalidated in 4D.3, not substituted for six English visual checks.

## Scanner implementation and supported contract

Separation into runtime-direction.ts is justified by lexical/configuration/topology analysis rather than expanding generic physical-CSS rules. rules.ts delegates cache proof and only exempts theme mismatch anchors proven as selected or genuinely unused in a closed same-file case. Other detection rules, model/schema/CLI/extraction/policy files remain unchanged.

Supported grammar:

- Direct default @emotion/cache factory, named @emotion/react CacheProvider, named MUI ThemeProvider/createTheme and imported Stylis prefixer/plugin. Direct named import aliases preserve identity.
- Unexported module-const cache definitions with unique literal keys and options containing only key/stylisPlugins. LTR requires explicit [prefixer]; RTL requires exactly [prefixer, rtlPlugin] from the published plugin family. No runtime package execution occurs in scanning.
- Literal module themes and a single direct ThemeProvider child beneath CacheProvider. No provider spreads or ambiguous duplicate values.
- Fixed matching document/theme/cache direction, or identical same-binding strict equality predicates selecting RTL then LTR. Local immutable ternary aliases and a single immutable destructured locale binding can be traced structurally.
- Corresponding document writer in the **same file**. Same-spelled identifiers in different lexical scopes are not treated as the same source.

Negative cases remain blocking: absent/reversed/duplicate/unknown plugins, missing prefixer/processor, duplicate/invalid keys, dynamic arrays/spreads/options, unknown factories, render-local/mutable/escaping/exported caches, import shadows/duplicates/type-only imports, aliases/namespaces/re-exports/wrappers that cannot be resolved, untraced provider factory uses, additional theme topology, document/cache/theme mismatch, unresolved/reassigned selectors and cross-file flow. Each rejected candidate retains CACHE_CONFIGURATION_UNRESOLVED, directional unsupported impact, source span, reasons and RUNTIME_CONFIG review finding. LTR-only uncertain cache candidates also block; there is no dependence on finding an RTL literal before checking them.

Valid bounded cache structure produces no unverified-cache risk. An unused unexported literal LTR theme does not create a mismatch if the analyzed topology is otherwise proved; an extra untraced consumer still blocks. This is structural analysis, not a lifecycle, package-integrity, shell-exclusion or semantic-transformation certificate. The scanner does not grant AUTO_CANDIDATE or semantic approval.

LIMIT: arbitrary opaque external provider internals/import graphs cannot be exhaustively detected/certified. Known wrapper/cache binding escape stays blocking; unknown package internals remain part of existing bounded coverage, not a claimed complete graph. Cross-file caches, registries/factories, context flow, insertion options, local widget islands and broader theme option composition remain unsupported. Do not rename a provider to bypass coverage. Existing parser/extraction diagnostics continue to govern completeness independently of a successful runtime pattern proof.

Schema v2 and rule ID catalog are preserved. Diagnostics use existing fields; no new policy exception, approval or schema mechanism. Complete means no relevant blocking uncertainty, not zero review risks. Exit 2 for blocking source/configuration uncertainty retains precedence over the optional findings gate.

## Tests, deterministic output and protected evidence

| Actual verification | Result |
| --- | --- |
| npm run rtl:scan:test | 163 passed: 120 existing + 43 focused runtime tests, five test files |
| npm run rtl:scan:typecheck | Passed |
| npm run rtl:scan:build | Passed; only ignored tooling dist output |
| npm run lint | Passed |
| npm test | Four existing application unit tests passed |
| Isolated proof runner | Five Stylis cases plus two real-browser build modes, five switch cycles per mode, breakpoint/print/global cleanup assertions passed |
| Existing full application Playwright/build | Not rerun; no application server started. Historical success is not reported as a fresh result |
| Repeated direct scan read-only check | Hashes and nanosecond mtimes of 112 protected tracked files unchanged |
| Current JSON/Markdown before/after | Exact byte equality, zero finding ID/category/source/policy/diagnostic delta |
| Six English baseline hashes | All six manifest entries match; PNGs byte-identical to Phase 2A checkpoint |
| Phase 2A documentary PNGs | All 68 byte-identical to Phase 2A checkpoint |
| Archived Stage 3 reports | Both byte-identical to HEAD and independently pinned tests |
| Root manifests / policy | Byte-identical to HEAD; all five exceptions/pins preserved, approval lists unchanged |
| Diff whitespace / scope | git diff --check passed; edits restricted to approved tooling paths and this review |

Focused tests cover valid fixed/paired configurations, plugin/key/factory/options/topology negatives, exact locations, import/lexical bindings, unused themes, source mutation/escape, incomplete exit behavior, deterministic serialization and temporary Nx positive/negative scans. Original tests were not changed or weakened. Current 419/56 results are observed, not artificially forced by updating expected counts.

## Phase 4D.3 boundary and required human decisions

PROPOSAL: authorize a narrow **shared runtime activation with proved shell preservation**, only after resolving the writer/analysis representation gate. Preserve existing query semantics and compare historical Before on a separate approved revision; no new flag. Retain locale as language source; stable paired themes/caches under Router→LocaleProvider→shared Provider→CacheProvider→ThemeProvider→App. Keep business subtree unkeyed and default-English styling/insertion behavior.

Choose explicitly:

1. Consolidate document synchronization with the cache/theme selector in the shared runtime owner, remove the previous document writer and preserve its exact lang/query contract; this amends the 4D.1 writer-placement proposal and needs approval. Existing language context remains source of truth. The analyzer supports same-binding literal ternaries; a runtime registry/imported factory would still need another proof.
2. Or retain LocaleProvider as document writer and separately approve bounded cross-file context/provider evidence before activation. The present scanner intentionally does not infer this relationship from shared variable names or a diagram.

Expected future paths: both app main.tsx; libs/design-system/src/index.tsx and a reviewed runtime provider module containing supported definitions; libs/shared/src/i18n.tsx only for the approved writer/API decision; root manifests for direct exact cache/Stylis/plugin pins; scoped runtime tests/new Arabic evidence; explicit source-pin/live expected-delta review. No styles.css migrations, chart/icon/bidi/brand remediations or archived report updates in that slice. Index edits invalidate its whole-file background pin: review actual source before explicit pin refresh. Dashboard pins remain unchanged if Dashboard is untouched. Runtime anchor changes require precise live test/report deltas, not historical rewrites.

Required acceptance: all original checks and six English zero-difference visuals; real app deep links/root/theme/cache agreement; five switching cycles with actual forms/dialogs/menus; preserved 6px/7px logical gaps; full shell/print consistency; no uncontrolled insertion growth; scanner complete with no hidden diagnostics and reviewed valid pins. Separately approve component semantics in 4E and codemods in 4F. If processor comments fail in actual Vite output, block activation or seek separately approved atomic shell scope. Dependency approval must name candidate 7.3.10 and exact direct cache/Stylis versions; no upgrade is implied.

Stop on unexplained English differences, state loss, partial shell flip, invalid pins, unsupported selection, schema expansion or out-of-scope files. Roll back a future activation by reverting its coherent provider/dependency/pin/expected-delta patch after review, never discarding unrelated work. No runtime rollback is needed for this stage because production behavior is unchanged.

## Exact changed-file inventory and final scope

1. tools/rtl-scanner/src/rules.ts — bounded runtime delegation; proven theme-anchor handling; visible uncertainty diagnostics.
2. tools/rtl-scanner/src/runtime-direction.ts — new syntax-only configuration/topology/selection proof.
3. tools/rtl-scanner/tests/runtime-direction.test.ts — 43 focused tests and temporary Nx integration checks.
4. tools/rtl-scanner/tests/fixtures/runtime/paired.tsx — representative statically supported paired configuration, not production code.
5. tools/rtl-scanner/tests/experiments/runtime-fixture.jsx — isolated Emotion/MUI/browser lifecycle and shell fixture.
6. tools/rtl-scanner/tests/experiments/compatibility-proof.mjs — manual external-directory integrity/processing/browser runner.
7. tools/rtl-scanner/README.md — supported grammar, fail-closed boundaries and compatibility reproduction reference.
8. docs/phase-4d2-compatibility-review.md — this evidence/review document.

No application/library source, production Provider/theme/cache, CSS, root dependencies/lockfile, scanner extraction/model/schema/CLI/policy logic/configuration, original tests, protected screenshots or archived findings changed. No semantic approvals, codemods or CI gate. No application RTL activation, commit or push. Temporary dependencies/bundles/results are external investigation artifacts and must not be committed. Stop here for human review; conditions above are not implementation authorization.
