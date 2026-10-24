# 08 — Phase 4D: RTL Runtime

<div dir="rtl">المرحلة 4D: تشغيل RTL — مالك واحد للغة بيزامن اتجاه المستند والثيم وكاش Emotion الثابت؛ هندسة السايدبار لسه مستنية إصلاح ذري.</div>

Locale-owned runtime synchronizes document direction, MUI theme and stable Emotion caches. Shell geometry is deliberately still held pending atomic repair.

Commit: [1098eb782b2d61eb8b17b146e4f01867820b76ff](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/1098eb782b2d61eb8b17b146e4f01867820b76ff)

## Before
First bounded logical-spacing pilot for status markers and chart legends; not a wholesale CSS migration.

## Investigated / changed
- Stable LTR/RTL themes and caches, prefixer/rtlPlugin order, synchronized document lang/dir, state-preserving provider identities.

## Unresolved / limitations
- Sidebar still uses reviewed physical protection; charts/KPI/brand/navigation fixes arrive later.

## Evidence
- [Exact source excerpt: libs/design-system/src/runtime.tsx:65–93](source-01.png) — **report-evidence**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [invoicing: overview, en; recreated from exact historical source](invoicing-overview-en.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [procurement: orders, en; recreated from exact historical source](procurement-orders-en.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [invoicing: mobile-navigation, en; recreated from exact historical source](invoicing-mobile-navigation-en.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [procurement: mobile-navigation, en; recreated from exact historical source](procurement-mobile-navigation-en.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [invoicing: overview, ar; recreated from exact historical source](invoicing-overview-ar.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [procurement: orders, ar; recreated from exact historical source](procurement-orders-ar.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [invoicing: mobile-navigation, ar; recreated from exact historical source](invoicing-mobile-navigation-ar.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
- [procurement: mobile-navigation, ar; recreated from exact historical source](procurement-mobile-navigation-ar.png) — **recreated**, source `1098eb782b2d61eb8b17b146e4f01867820b76ff`
