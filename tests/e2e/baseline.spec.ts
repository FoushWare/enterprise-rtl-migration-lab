import { test, expect } from "../fixtures/e2e";
test("application navigation and invoice table", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Invoices", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Invoices", exact: true }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(8);
  await page.getByRole("link", { name: "INV-2026-1048", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "INV-2026-1048" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Customers", exact: true }).click();
  await page.getByRole("button", { name: "View customer" }).first().click();
  await expect(page.getByRole("dialog")).toContainText("Olivia Bennett");
  await page.getByRole("button", { name: "Close dialog" }).click();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Settings saved")).toBeVisible();
});
test("search, status filter, empty state and pagination", async ({ page }) => {
  await page.goto("/invoices");
  await page.getByLabel("Search invoices").fill("Northstar");
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByRole("combobox", { name: /^Status/ }).click();
  await page.getByRole("option", { name: "Pending", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByLabel("Search invoices").fill("missing");
  await expect(page.getByText("No results found")).toBeVisible();
  await page.getByLabel("Search invoices").fill("");
  await page.getByRole("combobox", { name: /^Status/ }).click();
  await page.getByRole("option", { name: "All statuses" }).click();
  await page.getByRole("button", { name: "Go to page 2" }).click();
  await expect(page.getByText("9–16 of 24")).toBeVisible();
});
test("invoice validation, confirmation, creation and persistence", async ({
  page,
}) => {
  await page.goto("/invoices/new");
  await page.getByRole("button", { name: "Review invoice" }).click();
  await expect(page.getByText("Select a customer")).toBeVisible();
  await expect(page.getByText("Description is required")).toBeVisible();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Customer", { exact: true }).click();
  await page.getByRole("option", { name: "Northstar Studio" }).click();
  await page.getByLabel("Description 1").fill("Strategy workshop");
  await page.getByLabel("Rate 1", { exact: true }).fill("1500");
  await page.getByLabel("Quantity 1").fill("2");
  await page.getByLabel("Due date").fill("2026-10-01");
  await page.getByRole("button", { name: "Review invoice" }).click();
  await expect(
    page.getByText("Due date must be on or after the invoice date"),
  ).toBeVisible();
  await page.getByLabel("Due date").fill("2026-11-10");
  await page.getByRole("button", { name: "Review invoice" }).click();
  await expect(page.getByRole("dialog")).toContainText("$3,000.00");
  await page
    .getByRole("button", { name: "Create invoice", exact: true })
    .click();
  await expect(page.getByRole("heading", { name: /INV-2026-/ })).toBeVisible();
  await page.reload();
  await expect(page.getByText("Strategy workshop")).toBeVisible();
});
test("procurement navigation and status filters", async ({ page }) => {
  await page.goto("http://127.0.0.1:4201");
  await expect(
    page.getByRole("heading", { name: "Purchase orders", exact: true }),
  ).toBeVisible();
  await expect(page.locator("tbody tr")).toHaveCount(9);
  await page.getByRole("combobox", { name: /^Status/ }).click();
  await page.getByRole("option", { name: "Approved", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("link", { name: "PO-2026-401" }).click();
  await expect(
    page.getByRole("heading", { name: "PO-2026-401" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Procurement settings" }),
  ).toBeVisible();
});
test("responsive navigation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page.getByRole("link", { name: "Invoices", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Invoices", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
for (const [name, path] of [
  ["overview", "/"],
  ["invoices", "/invoices"],
  ["create-invoice", "/invoices/new"],
  ["customers", "/customers"],
  ["settings", "/settings"],
]) {
  test(`visual English LTR ${name}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page).toHaveScreenshot(`${name}-ltr.png`, {
      fullPage: true,
      animations: "disabled",
    });
  });
}
test("visual English LTR procurement", async ({ page }) => {
  await page.goto("http://127.0.0.1:4201");
  await expect(
    page.getByRole("heading", { name: "Purchase orders", exact: true }),
  ).toBeVisible();
  await expect(page).toHaveScreenshot("procurement-ltr.png", {
    fullPage: true,
    animations: "disabled",
  });
});
