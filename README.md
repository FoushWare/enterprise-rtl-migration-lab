# RTL migration visual gallery

Static GitHub Pages gallery of twelve exact historical checkpoints.

1,608 PNG files, including 1,449 newly recreated screenshots; 1,677 stage references.

Each stage initially shows twelve images. Show more, show all and show less controls keep every image available without an overwhelming initial scroll. Application, language and viewport filters search the complete stage inventory.

Original screenshot bytes are unchanged. Newly recreated views use each checkpoint’s exact source and lockfile in development mode with current Chrome. Stages 01/02 share one English commit. Print views emulate print CSS. Route templates and representative meaningful states are covered, rather than every possible record or workflow.

See manifest.json, COVERAGE_REPORT.json, expanded-capture-receipts.json and validation reports for provenance.

This branch contains only gallery assets. It does not alter application source, scanner rules, policies or protected baseline files on application branches.

## Issue explanations and filters

Every screenshot now has an Arabic explanation of its relevant historical issue families, with numbered RTL-01–RTL-09 badges, category, checkpoint status, inspection location and source/evidence links. Use the global or stage-local filters for CSS, icons, charts/SVG, MUI/runtime, Bidi, branding and documentary evidence. A category/status/issue combination must match the same issue, not unrelated defects in one screenshot.

See [mapping method and limits](ISSUE_MAPPING_REVIEW.md) and [issue catalog](issue-catalog.json). A source-remediated label is not a new visual-test result, and English reference screenshots are not counted as confirmed RTL defects.

## Arabic browsing and progressive detail

Friendly Arabic names lead; RTL-01–RTL-09 remain secondary references. Each card has a compact summary and an “اعرف أكتر” disclosure with problem, inspection location, expected behavior and evidence. Original technical titles and historical narratives remain available in deeper details.

The twelve-stage navigation provides destination tooltips on hover/focus, keyboard navigation, a current-stage marker and a compact mobile rail. Motion respects reduced-motion preferences. The accessible image viewer includes all matching stage images, focus return and Escape dismissal.

Current UX validation is recorded in UX_STATIC_VALIDATION.json and UX_BROWSER_VALIDATION.json. There are 1,677 gallery cards; twelve redundant stage hero previews were removed without removing any screenshot. Earlier validation reports describe earlier presentation checkpoints.

## Arabic / English switch

The header language buttons translate the gallery interface, stage descriptions, issue explanations, filters, image captions, accessibility labels and viewer controls. The page changes between RTL and LTR. Selection is remembered locally and can be shared with `?ui=en` or `?ui=ar`. Screenshot language filters remain independent. Historical image pixels, source metadata and issue definitions are unchanged. English search includes translated titles and original English capture descriptions. The gallery remains self-contained and works offline without a translation service.

See BILINGUAL_VALIDATION.json for bilingual and responsive checks.
