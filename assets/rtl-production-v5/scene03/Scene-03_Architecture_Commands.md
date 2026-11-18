# Scene03 Architecture Commands
**Draft – Pending Review.** Preparation only. Proposed narration/timings require review and final alignment to the presenter recording. No Scene03 footage, scanner execution or fixes produced.


Run from the Study checkout only:
```sh
cd '/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study'
git status --short
git branch --show-current
git rev-parse HEAD
npm run
```
Expected branch `study/unmigrated-rtl-ui`, committed HEAD910133cc; the intentional local patch is part of the lesson. Do not reset it. `npm run` lists scripts, not application execution. These script mappings were inspected in package.json.

## Servers
Both Study Vite processes were already running during this production audit. HTTP200 and process cwd were verified; no restart was performed.
```sh
curl -I http://127.0.0.1:4200/
curl -I http://127.0.0.1:4201/
# Only if the corresponding port is not already running, in separate terminals:
npm run dev
npm run dev:procurement
```
Actual package scripts select `nx run invoicing:dev` and `nx run procurement:dev`. Do not run a second server on occupied strict ports. No dependency installation is needed for this preparation.

## Actual browser demonstration
Open `http://127.0.0.1:4200/?demo=unmigrated-rtl&lang=en`, then use `select[aria-label="Language / اللغة"]` → العربية. Repeat on4201. Plain `/` has no selector. `?lang=ar` alone is not the opt-in mode.
Read-only console observation:
```js
({ language: document.documentElement.lang,
   direction: document.documentElement.dir,
   query: location.search })
```
Expected after switching: ar-EG, rtl, both demo and lang parameters. This does not expose React theme state; inspect Provider code rather than inventing a global theme variable.

## Source inspection
Use VS Code Quick Open for the files listed in ShotList. Go to Definition on Provider, useLocale, AppShell, listInvoices, total and money. No source edits.
```sh
rg -n '@atlas/design-system|@atlas/shared' apps libs
rg -n 'LocaleProvider|ThemeProvider|CacheProvider|direction:' apps libs
```
The rg commands are proposed read-only filming commands; their predicates match inspected source, but no fabricated terminal transcript is provided.

## Nx graph qualification
`nx-cached-graph-evidence.json` reads the existing `.nx/workspace-data/project-graph.json`; no fresh graph generated in this task. Its five workspace nodes have no workspace dependency edges; external npm dependencies exist. Use the separate import-grounded diagram. An optional future `npx nx graph --file=/tmp/rtl-study-graph.html` may generate caches; it has not been run for this preparation and must not be shown as already recorded output.

## Scanner handoff only
The existing CLI is inspected, not executed. Next lesson may review `npm run rtl:scan -- --format summary`, JSON and Markdown contracts and incomplete-scan exit behavior, after checking build provenance. No Codemod application, policy editing, source-pin migration or scanner-result claim in Scene03.
