# Scene03 V2 — Architecture Evidence

Draft – Pending Review. Source inspected on 2026-10-29. No application source, tests, configuration, policies or fixtures changed. No fresh test/CI/scanner success claim.

Study root: /Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study

|Shot|Verified fact|Source and line anchors|Qualification|
|---|---|---|---|
|03-02|Nx workspace, apps/libs/tools grouping|package.json; nx.json; tsconfig.json|Grouping is editorial, not a captured Nx graph. Source imports establish relationships.|
|03-03/04|Independent applications and routes|apps/invoicing/src/App.tsx:18; apps/procurement/src/App.tsx:149|Invoicing owns invoice state; Procurement owns status filtering. No app-to-app imports.|
|03-05|Shared shell and UI capabilities|libs/design-system/src/index.tsx:42,50,110,166,204,385|Both use shell/navigation/cards/fields/tables. Modal usage verified in Invoicing; no claim of Procurement business dialogs.|
|03-06|Shared business and locale capabilities|libs/shared/src/index.ts:95,128,136,154,171,193; libs/shared/src/i18n.tsx:42|LocalStorage API-shaped facade, not a remote backend. Fixtures may be overridden by browser storage.|
|03-07|Document RTL versus theme LTR|libs/shared/src/i18n.tsx:50; libs/design-system/src/runtime.tsx:6,78|Study uses document RTL with fixed MUI LTR. Emotion is used through MUI/styled; no active migrated RTL cache. Five conceptual layers are not a literal call stack.|
|03-08|Static evidence, findings and scan diagnostics|tools/rtl-scanner/src/scan.ts; tools/rtl-scanner/src/cli.ts|No new scan, terminal result or migration success is represented. Findings are potential risks, not proof of runtime bugs.|
|03-08|Constrained transformation tooling|tools/rtl-codemod/codemod.mjs:191,210,214,286|Fresh complete scan, approved plain CSS AUTO_CANDIDATE and exact source/approval checks. Safety gates remain unchanged.|
|03-09|Runtime dependencies vs source analysis|apps/*/src/main.tsx; apps/*/src/App.tsx; libs/design-system/src/index.tsx:1,36|Both applications consume shared libraries. Design System imports Shared; runtime provider is shared. Lines show relationships, not literal network requests. Tooling separated by dashed boundary; no app-to-app link.|
|03-10|INV-2026-1048 / Northstar Studio / USD4800 / Pending|libs/shared/src/index.ts:95,128,136; apps/invoicing/src/components/InvoiceTable.tsx:75; apps/invoicing/src/pages/InvoiceDetails.tsx:17|Real recorded list-to-detail footage plus source fixture. Details resolves existing in-memory collection, no second fetch.|
|03-11|Potential ownership layers|apps/; libs/design-system/; libs/shared/|Conceptual investigation framework. Illumination does not assert a proven cause for a particular defect.|

## Footage provenance
All browser footage is reused from existing genuine recordings, not recaptured during this redesign. Arabic/English editions localize graphics and guides; the authentic source UI remains in its recorded language. No simulated UI.

```json
{
  "invoicing": {
    "original": "/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/study/demo/videos/fullscreen-v4/originals/Invoicing_EN.mov",
    "in": 25
  },
  "procurement": {
    "original": "/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/study/demo/videos/expanded-v1/originals/Procurement_EN.mov",
    "in": 20
  },
  "invoice": {
    "original": "/Users/a.fouad/iCloud Drive (Archive)/Documents/Youtube/enterprise-rtl-migration-lab-study/study/demo/videos/fullscreen-v4/originals/Invoice_1048_Arrow_Action.mov",
    "in": 48
  }
}
```

No code-editor or terminal recording is loaded by this composition. Presenter is an original faceless vector silhouette, not footage of a human or a generated impersonation.

Existing stale locale documentation mentioning migrated support is not treated as evidence: executable Study behavior takes precedence. Cached Nx graph is not presented as a newly computed dependency map.