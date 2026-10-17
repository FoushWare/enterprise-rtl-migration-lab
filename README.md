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

## Independent issue comparisons

Issue-card clicks now open the comparison results inside the browse panel, not a historical stage. Global issue/category/status/search controls apply to these comparisons; stage-local controls remain independent. Default results include before-fix and partly addressed Arabic evidence, paired with English captures from the same commit, application, route, state, viewport, media and capture collection. Explicit status selection can inspect other source states. There are 720 exact metadata pairs with no missing counterparts; this is not a claim of 720 independently measured defects. Both images can be opened together in a full-size dialog. Historical screenshots and the manifest remain unchanged.

## Per-stage code and PR evidence

Each stage has a collapsed code/PR explanation with nested file/commit inventories and a bounded verbatim Git excerpt. Associations were verified using GitHub’s commit-associated-PR API: stages 3–11 belong to consolidated PR #4, final delivery to PR #5, and the shared starting commit has no associated PR. A consolidated PR is explicitly distinguished from a stage-specific PR. File inventories use exact checkpoint endpoint diffs; stage two shares stage one’s commit and has no source delta. Code excerpts are preserved verbatim across UI-language changes and link to full GitHub context. See stage-code-history.json for the reviewed metadata.

## Paired stage-image viewer

Stage screenshots with documented counterparts now open the paired viewer too: Arabic and English remain side by side, with independent zoom and the original issue descriptions below both images. Pair navigation follows the current stage’s matching captures. In addition to the 720 recreated pairs, 34 original Phase 2A pairs were matched by commit, app, state, normalized route, viewport and capture type; original bytes remain untouched. Unmatched English-only baseline or report images retain a single-image view with an explicit missing-counterpart notice.

## Grouped captures

Within a stage, captures with the same source commit, application, state, normalized route, viewport and print mode now share a single card. Arabic is the default representative where available; the language and collection filters still select their matching capture. Original and recreated alternatives remain accessible inside a disclosure on that card. Documentary cards stay distinct. Comparison results use the same identity grouping. No manifest records or image files were deleted. The current unfiltered presentation has 869 representative cards across the twelve stages while retaining all 1,677 original stage references.

## Per-issue inspection thumbnails

Each paired-view issue description now includes Arabic and English thumbnails from the same original capture pair. Reviewed 1440px historical layouts use broad CSS-clipped inspection areas for the relevant region; they are not exact measured defect boxes. Unknown layouts, mobile and print views show full context. Selecting a thumbnail focuses that language’s large image on the inspection area. No derivative screenshot files, new captures, annotations on original pixels or historical evidence replacements are created.
