# 09 — Phase 4E: UI Repairs

<div dir="rtl">المرحلة 4E: إصلاحات الواجهة — نقطة تراكمية بعد إصلاح السايدبار والرسم وKPI والبراند والأسهم وحدود النص؛ النماذج والحوارات والجداول اتراجعت قبل أي تعديل افتراضي.</div>

Representative cumulative checkpoint after sidebar, chart, KPI, brand, navigation and bidi slices. Forms/dialogs/tables were verified before speculative overrides.

Commit: [767e70f525dac6e3a12aa6eb827fdcc73e498da7](https://github.com/FoushWare/enterprise-rtl-migration-lab/commit/767e70f525dac6e3a12aa6eb827fdcc73e498da7)

## Before
Locale-owned runtime synchronizes document direction, MUI theme and stable Emotion caches. Shell geometry is deliberately still held pending atomic repair.

## Investigated / changed
- Independent semantic fixes accumulated; canonical data and en-US financial formatting retained.

## Unresolved / limitations
- Representative commit aggregates earlier repairs; each fixing commit is listed separately. Seed screenshots do not exercise every mixed-script permutation.

## Evidence
- [Exact source excerpt: docs/autonomous/TEST_EVIDENCE.md:1–17](source-01.png) — **report-evidence**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: overview, en; recreated from exact historical source](invoicing-overview-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: orders, en; recreated from exact historical source](procurement-orders-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: invoices, en; recreated from exact historical source](invoicing-invoices-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: invoice-detail, en; recreated from exact historical source](invoicing-invoice-detail-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: create, en; recreated from exact historical source](invoicing-create-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: customer-dialog, en; recreated from exact historical source](invoicing-customer-dialog-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: settings, en; recreated from exact historical source](invoicing-settings-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: order-detail, en; recreated from exact historical source](procurement-order-detail-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: procurement-settings, en; recreated from exact historical source](procurement-procurement-settings-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: mobile-navigation, en; recreated from exact historical source](invoicing-mobile-navigation-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: mobile-navigation, en; recreated from exact historical source](procurement-mobile-navigation-en.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: overview, ar; recreated from exact historical source](invoicing-overview-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: orders, ar; recreated from exact historical source](procurement-orders-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: invoices, ar; recreated from exact historical source](invoicing-invoices-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: invoice-detail, ar; recreated from exact historical source](invoicing-invoice-detail-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: create, ar; recreated from exact historical source](invoicing-create-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: customer-dialog, ar; recreated from exact historical source](invoicing-customer-dialog-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: settings, ar; recreated from exact historical source](invoicing-settings-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: order-detail, ar; recreated from exact historical source](procurement-order-detail-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: procurement-settings, ar; recreated from exact historical source](procurement-procurement-settings-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [invoicing: mobile-navigation, ar; recreated from exact historical source](invoicing-mobile-navigation-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
- [procurement: mobile-navigation, ar; recreated from exact historical source](procurement-mobile-navigation-ar.png) — **recreated**, source `767e70f525dac6e3a12aa6eb827fdcc73e498da7`
