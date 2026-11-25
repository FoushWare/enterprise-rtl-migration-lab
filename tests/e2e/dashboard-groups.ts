import type { Page } from '@playwright/test';

// The dashboard keeps finding-level operations in collapsible groups. Specs open the group a reviewer would open, then assert.
// The top-level Operations panel is hidden by the simplified layout and is not opened by any spec (see phase5-progress.spec.ts).
//
// Current layout: the dashboard opens on a workflow chooser ("How would you like to review fixes?") that covers Fix Studio
// until a review mode is chosen. Choosing a mode clears the finding selection, so the reviewer selects it again from the
// findings list. Once a finding is owned by the review workflow, the legacy codemod and controlled-apply panels inside
// "Advanced validation, history & rollback" are hidden (dashboard-review-workflow.ts: .workflow-owned .apply-advanced).
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const openAdvancedValidation = async (page: Page, findingLocation = 'InvoiceTable.tsx:19:15') => {
  await page.getByRole('button', { name: 'Start manual review' }).click();
  await page.getByRole('button', { name: new RegExp(escapeRegExp(findingLocation)) }).first().click();
  await page.locator('summary', { hasText: 'Advanced validation, history & rollback' }).first().click();
};
