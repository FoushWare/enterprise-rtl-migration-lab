# Coffee Break Web recording guide

Run both apps in separate terminals. Use a 1440×1000 or 1440×900 browser at 100% zoom. Close devtools for the product tour. Clear localStorage once before recording to reset invoices and settings; leave it untouched when showing persistence.

1. Open `http://localhost:4200`. Pause on Overview: the shared sidebar, four KPI cards, revenue illustration, payment breakdown and recent invoice table establish the existing polished English product.
2. Open Invoices. Search `Northstar`, filter Pending, clear search and return to All statuses. Show pagination. Open INV-2026-1048 to show customer, dates, line item and total.
3. Click Create invoice. Submit the blank form to demonstrate validation. Select Meridian Labs, add “Platform advisory”, quantity 2, rate 1200. Add another item if desired. Change currency to EUR, choose due date after invoice date and select Review invoice. Pause on confirmation; create and refresh the resulting detail page to demonstrate persistence. Nothing is emailed.
4. Open Customers, inspect a customer's details, then close the accessible dialog.
5. Open Settings, edit company information, toggle the reminder preference and Save changes. The preference is local only; no reminder service exists.
6. Open Procurement via the sidebar app link. Filter Approved and open PO-2026-401. Point out that this separate application consumes the same shell, badges and table library.
7. Optionally narrow the browser to show mobile navigation and table scrolling.
8. Open `libs/design-system/src/styles.css` and `index.tsx` to identify the actual left sidebar reservation, active border, icon positioning and spacing. Consult `docs/legacy-ltr-inventory.md`.

Narration: Atlas serves fictional European and US companies. Middle East expansion motivates a future bilingual migration. This episode's Phase 1 establishes an English LTR baseline and working regression tests. Avoid claiming Arabic, RTL switching or migration tooling is available. The revenue curve and growth comparisons are illustration data, while invoice balances and payment counts derive from the mock workspace.

For a component-focused segment, run `npm run storybook` and show Atlas / StatusBadge / PaymentStates. For a regression segment, show the approved English screenshot PNGs and run tests without snapshot-update mode.
