# 07 — Phase 4C: CSS Pilot

<div dir="rtl">المرحلة 4C: تجربة CSS محدودة — تجربة محدودة للمسافات المنطقية في علامة الحالة ومفتاح الرسم، مش ترحيل CSS شامل.</div>

First bounded logical-spacing pilot for status markers and chart legends; not a wholesale CSS migration.

Commit: [85f4dde02142f305b434c815a39015a4c5eaafec](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/85f4dde02142f305b434c815a39015a4c5eaafec)

## Before
Strict policy validation, pinned evidence and stale-result rejection prevent unknown configurations from being silently approved.

## Investigated / changed
- Only approved status-dot and legend physical margins become logical properties.

## Unresolved / limitations
- Runtime/theme and shell remain unresolved at this checkpoint.

## Evidence
- [Exact source excerpt: docs/phase-4c2-css-pilot-review.md:1–38](source-01.png) — **report-evidence**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [invoicing: overview, en; recreated from exact historical source](invoicing-overview-en.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [procurement: orders, en; recreated from exact historical source](procurement-orders-en.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [invoicing: mobile-navigation, en; recreated from exact historical source](invoicing-mobile-navigation-en.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [procurement: mobile-navigation, en; recreated from exact historical source](procurement-mobile-navigation-en.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [invoicing: overview, ar; recreated from exact historical source](invoicing-overview-ar.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [procurement: orders, ar; recreated from exact historical source](procurement-orders-ar.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [invoicing: mobile-navigation, ar; recreated from exact historical source](invoicing-mobile-navigation-ar.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [procurement: mobile-navigation, ar; recreated from exact historical source](procurement-mobile-navigation-ar.png) — **recreated**, source `85f4dde02142f305b434c815a39015a4c5eaafec`
- [Exact approved CSS pilot diff](approved-css.diff) — git-diff
