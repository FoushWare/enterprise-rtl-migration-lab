# Testing strategy

## Layers

- `npm run lint`: ESLint TypeScript recommended rules across apps, libraries, tests and configs.
- `npm run typecheck`: strict TypeScript checks for both applications and shared libraries.
- `npm run build`: Nx inferred Vite production builds for both applications.
- `npm test`: Vitest + jsdom verifies button callbacks, status/empty-state rendering, modal close behavior, calculation and mock API persistence/duplicate rejection.
- `npm run test:e2e`: Playwright Chromium launches both Vite apps and checks routes, tables, search/filter/pagination, customer modal, settings save, invoice validation/confirmation/persistence, procurement navigation and responsive navigation.
- `npm run test:visual`: English LTR screenshots for overview, invoice list, invoice form, customers, settings and procurement.

Functional tests use isolated browser contexts, so mutations cannot pollute other tests. Screenshot tests use fixed fixtures, 1440×1000 viewport, UTC timezone, en-US locale, light color scheme and disabled animations. The responsive test checks 390×844 and ensures the overall document has no horizontal overflow (table content may scroll within its container).

## Protected visual evidence and environment

The six English PNGs, 68 Phase 2A documentary PNGs, archived scanner reports and dynamic exception records/source pins are immutable. Do not run snapshot updates, regenerate documentary evidence or change maxDiffPixels=0. Run `npm run rtl:verify:protected` to compare the committed protection manifest. Any evidence migration requires separate explicit authorization.

Playwright uses en-US / UTC / light color scheme / fixed fixtures. Native HTML date presentation also depends on macOS AppleLocale. A controlled A-D experiment established en_EG as the protected recording region; CI changes only that preference on a guarded disposable hosted runner and restores its original typed value/key presence with always cleanup. Browser-context locale alone does not control this native widget. See [causal results](autonomous/NATIVE_DATE_RESULTS.md). Darwin screenshots require macOS; no Linux filename substitution or tolerance increase is used.

`PLAYWRIGHT_CHANNEL=chrome npm run test:e2e` can exercise installed Chrome. Full development coverage has 108 cases; `npm run test:e2e:production` starts strict independent Vite preview servers against previously built assets and exercises the same cases. Ports 4200/4201 must be free for the production command. Tests cover both languages/apps, seven boundary widths, print, glyph-level clearance/bidi, pointer/keyboard/modal focus, repeated locale switching and state preservation.

## Scanner and codemod gates

Run scanner typecheck/build and all 186 scanner tests. Live inventory assertions remain precise while archived inventories stay immutable. Current static review evidence is documented separately from verified UI behavior. Default scanner exit semantics fail incomplete analysis, not every manual finding. Deterministic JSON/Markdown and zero policy warnings are required.

The 24 codemod fixture tests cover exact approved edits, idempotency, clean/stale/dirty guards, collision/symlink/path rejection, durable journal recovery and rollback preserving concurrent user edits. Production dry run is empty; no semantic approval is inferred from a physical property. App unit suite has nine tests. CI executes all these gates plus lint/typechecks, uncached Nx builds, development/production E2E and protected hashes.

Historical Phase 1 results remain in `docs/verification.md`; current delivery evidence is in `docs/autonomous/TEST_EVIDENCE.md` and `docs/autonomous/FINAL_REPORT.md`. Tests that have not been run must never be described as passing.
