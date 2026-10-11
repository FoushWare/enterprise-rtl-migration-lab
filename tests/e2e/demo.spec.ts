import { test, expect } from "@playwright/test";
const query = "?demo=unmigrated-rtl&lang=ar";
const notice = "Unmigrated RTL — demonstration only";
for (const app of ["invoicing", "procurement"] as const) {
  const origin = `http://127.0.0.1:${app === "invoicing" ? 4200 : 4201}`;
  const title = app === "invoicing" ? "نظرة عامة" : "أوامر الشراء";
  test(`${app}: Arabic alone does not opt in`, async ({ page }) => {
    await page.goto(`${origin}/?lang=ar`);
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByLabel("Language / اللغة")).toHaveCount(0);
    await expect(page.getByText(notice, { exact: false })).toHaveCount(0);
  });
  for (const width of [1440, 390]) {
    test(`${app}: switch, navigation, reload and cross-app link at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
      await page.goto(`${origin}/${query}`);
      await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await expect(page.locator("html")).toHaveAttribute("lang", "ar-EG");
      await expect(page.getByText(notice, { exact: false })).toBeVisible();
      await page.getByLabel("Language / اللغة").selectOption("en");
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page.getByText(notice, { exact: false })).toHaveCount(0);
      await page.getByLabel("Language / اللغة").selectOption("ar");
      if (width === 390) await page.getByRole("button", { name: "فتح قائمة التنقل" }).click();
      await page.getByRole("link", { name: "الإعدادات", exact: true }).click();
      await expect(page).toHaveURL(/settings\?demo=unmigrated-rtl&lang=ar/);
      await page.reload();
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      if (width === 390) await page.getByRole("button", { name: "فتح قائمة التنقل" }).click();
      const other = app === "invoicing" ? "المشتريات" : "الفواتير";
      await page.getByRole("link", { name: other, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`localhost:${app === "invoicing" ? 4201 : 4200}/\\?demo=unmigrated-rtl&lang=ar`));
      await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
      await page.goto(`${origin}/`);
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page.getByLabel("Language / اللغة")).toHaveCount(0);
    });
  }
}

test("Arabic invoice validation, menu/dialog direction and unchanged persisted values", async ({ page }) => {
  await page.goto(`/invoices/new${query}`);
  await page.getByRole("button", { name: "مراجعة الفاتورة" }).click();
  await expect(page.getByText("اختر عميلًا", { exact: true })).toBeVisible();
  await expect(page.getByText("الوصف مطلوب")).toBeVisible();
  await page.getByRole("combobox", { name: "العميل", exact: true }).click();
  const menu = page.getByRole("listbox");
  expect(await menu.evaluate((node) => getComputedStyle(node).direction)).toBe("rtl");
  expect(await menu.evaluate((node) => document.getElementById("root")!.contains(node))).toBe(false);
  await page.getByRole("option", { name: "Northstar Studio" }).click();
  await page.getByLabel("الوصف 1", { exact: true }).fill("ورشة استراتيجية");
  await page.getByLabel("الكمية 1", { exact: true }).fill("2");
  await page.getByLabel("السعر 1", { exact: true }).fill("1500");
  // Switching must not remount the form or lose entered business data.
  await page.getByLabel("Language / اللغة").selectOption("en");
  await expect(page.getByLabel("Description 1")).toHaveValue("ورشة استراتيجية");
  await page.getByLabel("Language / اللغة").selectOption("ar");
  await page.getByRole("button", { name: "مراجعة الفاتورة" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Northstar Studio");
  await expect(dialog).toContainText("$3,000.00");
  expect(await dialog.evaluate((node) => getComputedStyle(node).direction)).toBe("rtl");
  expect(await dialog.evaluate((node) => document.getElementById("root")!.contains(node))).toBe(false);
  await page.getByRole("button", { name: "إنشاء فاتورة", exact: true }).click();
  await expect(page.getByRole("heading", { name: /INV-2026-/ })).toBeVisible();
  const id = await page.getByRole("heading", { level: 1 }).innerText();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("atlas-invoices-v1")!)[0]);
  expect(stored).toMatchObject({ id, status: "Pending", currency: "USD", date: "2026-10-11", due: "2026-11-10", items: [{ description: "ورشة استراتيجية", quantity: 2, rate: 1500 }] });
  expect(new URL(page.url()).searchParams.get("lang")).toBe("ar");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(id);
  await page.getByLabel("Language / اللغة").selectOption("en");
  await expect(page.getByText("ورشة استراتيجية")).toBeVisible();
});

test("Arabic filters and pagination keep canonical values and routes", async ({ page }) => {
  await page.goto(`/invoices${query}`);
  await page.getByRole("button", { name: "الانتقال إلى الصفحة 2" }).click();
  await expect(page.getByText("9–16 من 24")).toBeVisible();
  await page.getByRole("combobox", { name: /^الحالة/ }).click();
  await page.getByRole("option", { name: "قيد الانتظار", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(4);
  await page.getByLabel("البحث عن الفواتير").fill("missing");
  await expect(page.getByText("لا توجد نتائج")).toBeVisible();
  await page.goto(`http://127.0.0.1:4201/${query}`);
  await page.getByRole("combobox", { name: /^الحالة/ }).click();
  await page.getByRole("option", { name: "معتمد", exact: true }).click();
  await expect(page.locator("tbody tr")).toHaveCount(3);
  await page.getByRole("link", { name: "PO-2026-401", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("PO-2026-401");
  await expect(page).toHaveURL(/orders\/PO-2026-401\?demo=unmigrated-rtl&lang=ar/);
});

test("Arabic settings save retains user data; customer portal inherits root direction", async ({ page }) => {
  await page.goto(`/settings${query}`);
  await page.getByLabel("اسم الشركة", { exact: false }).fill("Atlas Cairo");
  await page.getByRole("button", { name: "حفظ التغييرات" }).click();
  await expect(page.getByText("تم حفظ الإعدادات")).toBeVisible();
  await page.getByLabel("Language / اللغة").selectOption("en");
  await expect(page.getByLabel("Company name", { exact: false })).toHaveValue("Atlas Cairo");
  await page.goto(`/customers${query}`);
  await page.getByRole("button", { name: "عرض العميل" }).first().click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("finance@northstar.example");
  expect(await dialog.evaluate((node) => getComputedStyle(node).direction)).toBe("rtl");
  await page.getByRole("button", { name: "إغلاق النافذة" }).click();
  await expect(dialog).toHaveCount(0);
});
