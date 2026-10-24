import { test, expect, type Page, type Locator } from "../fixtures/e2e";

const widths = [390, 899, 900, 901, 1100, 1101, 1440];
type Language = "en" | "ar";
const query = (language: Language) => `?demo=unmigrated-rtl&lang=${language}`;
const copy = {
  en: {
    customer: "Customer",
    description: "Description 1",
    quantity: "Quantity 1",
    rate: "Rate 1",
    review: "Review invoice",
    close: "Close dialog",
    view: "View customer",
    search: "Search customers",
    company: "Company name",
    status: /^Status/,
    approved: "Approved",
  },
  ar: {
    customer: "العميل",
    description: "الوصف 1",
    quantity: "الكمية 1",
    rate: "السعر 1",
    review: "مراجعة الفاتورة",
    close: "إغلاق النافذة",
    view: "عرض العميل",
    search: "البحث عن العملاء",
    company: "اسم الشركة",
    status: /^الحالة/,
    approved: "معتمد",
  },
};
async function switchLanguage(
  page: Page,
  language: Language,
  modalOpen = false,
) {
  // MUI makes the background inert. Programmatic selection uses the existing
  // control and React onChange; no provider/state injection or pointer bypass.
  await page
    .locator('select[aria-label="Language / اللغة"]')
    .selectOption(language, { force: modalOpen });
  await expect(page.locator("html")).toHaveAttribute(
    "dir",
    language === "ar" ? "rtl" : "ltr",
  );
}
async function selectGeometry(control: Locator, language: Language) {
  const root = control.locator(
    "xpath=ancestor::*[contains(@class,'MuiFormControl-root')][1]",
  );
  const g = await root.evaluate((n) => {
    const input = n.querySelector('[role="combobox"]')!,
      arrow = n.querySelector(".MuiSelect-icon")!,
      label = n.querySelector("label")!;
    const a = input.getBoundingClientRect(),
      b = arrow.getBoundingClientRect(),
      cs = getComputedStyle(input);
    return {
      direction: cs.direction,
      align: cs.textAlign,
      left: cs.paddingLeft,
      right: cs.paddingRight,
      leftGap: b.left - a.left,
      rightGap: a.right - b.right,
      labelDirection: getComputedStyle(label).direction,
    };
  });
  expect(g.direction).toBe(language === "ar" ? "rtl" : "ltr");
  expect(g.align).toBe("start");
  expect([g.left, g.right]).toEqual(
    language === "ar" ? ["32px", "14px"] : ["14px", "32px"],
  );
  expect(language === "ar" ? g.leftGap : g.rightGap).toBeCloseTo(7, 1);
  expect(g.labelDirection).toBe(g.direction);
}
async function prepareInvoice(page: Page, language: Language) {
  const customer = page.getByRole("combobox", {
    name: new RegExp(`^${copy[language].customer}(?:$| )`),
  });
  await customer.focus();
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("listbox")).toBeVisible();
  expect(
    await page
      .getByRole("listbox")
      .evaluate((n) => getComputedStyle(n).direction),
  ).toBe(language === "ar" ? "rtl" : "ltr");
  await page
    .getByRole("option", { name: "Northstar Studio", exact: true })
    .focus();
  await page.keyboard.press("Enter");
  await expect(customer).toContainText("Northstar Studio");
  await page
    .getByLabel(copy[language].description, { exact: true })
    .fill("ورشة استراتيجية");
  await page.getByLabel(copy[language].quantity, { exact: true }).fill("2");
  await page.getByLabel(copy[language].rate, { exact: true }).fill("1500");
}
async function dialogGeometry(page: Page, language: Language) {
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const g = await dialog.evaluate((n) => {
    const title = n.querySelector("h2")!,
      button = title.querySelector("button")!,
      paper = n.getBoundingClientRect(),
      close = button.getBoundingClientRect();
    const range = document.createRange();
    const text = [...title.childNodes].find(
      (c) => c.nodeType === Node.TEXT_NODE,
    )!;
    range.selectNodeContents(text);
    const glyphs = [...range.getClientRects()].filter((r) => r.width > 0);
    return {
      direction: getComputedStyle(n).direction,
      labelledBy: n.getAttribute("aria-labelledby"),
      titleId: title.id,
      leftGap: close.left - paper.left,
      rightGap: paper.right - close.right,
      overlap: glyphs.some(
        (g) =>
          Math.min(g.right, close.right) > Math.max(g.left, close.left) &&
          Math.min(g.bottom, close.bottom) > Math.max(g.top, close.top),
      ),
      clipped: glyphs.some((g) => g.left < paper.left || g.right > paper.right),
      actions: [...n.querySelectorAll(".MuiDialogActions-root button")].map(
        (b) => ({ text: b.textContent, x: b.getBoundingClientRect().x }),
      ),
    };
  });
  expect(g.direction).toBe(language === "ar" ? "rtl" : "ltr");
  expect(g.labelledBy).toBe(g.titleId);
  expect(g.titleId).toBeTruthy();
  expect(g.overlap).toBe(false);
  expect(g.clipped).toBe(false);
  expect(language === "ar" ? g.leftGap : g.rightGap).toBeCloseTo(12, 1);
  return g;
}
async function tableState(page: Page, language: Language) {
  const scroll = page.locator(".table-scroll").first();
  await expect(scroll.locator("th").first()).toBeVisible();
  const s = await scroll.evaluate((n) => {
    const table = n.querySelector("table")!;
    return {
      direction: getComputedStyle(table).direction,
      headers: [...table.querySelectorAll("th")].map((c) => ({
        text: c.textContent,
        align: getComputedStyle(c).textAlign,
        x: c.getBoundingClientRect().x,
      })),
      cells: [...table.querySelectorAll("tbody tr:first-child td")].map(
        (c) => ({ text: c.textContent, align: getComputedStyle(c).textAlign }),
      ),
      rows: [...table.querySelectorAll("tbody tr")].map((r) =>
        [...r.querySelectorAll("td")].map((c) => c.textContent),
      ),
      overflow: document.documentElement.scrollWidth > innerWidth,
    };
  });
  expect(s.direction).toBe(language === "ar" ? "rtl" : "ltr");
  expect(s.overflow).toBe(false);
  // These pin the current generated defaults, not a new numeric/token policy.
  expect(
    s.headers.every((h) => h.align === (language === "ar" ? "right" : "left")),
  ).toBe(true);
  expect(
    s.cells.every((c) => c.align === (language === "ar" ? "right" : "left")),
  ).toBe(true);
  for (let i = 1; i < s.headers.length; i++)
    expect(
      language === "ar"
        ? s.headers[i].x < s.headers[i - 1].x
        : s.headers[i].x > s.headers[i - 1].x,
    ).toBe(true);
  const range = await scroll.evaluate((n) => {
    n.scrollLeft = -10000;
    const negative = n.scrollLeft;
    n.scrollLeft = 10000;
    const positive = n.scrollLeft;
    const overflow = n.scrollWidth - n.clientWidth;
    n.scrollLeft = 0;
    return { negative, positive, overflow };
  });
  if (range.overflow > 1) {
    expect(language === "ar" ? range.negative : range.positive).not.toBe(0);
    // Browser scroll extents can round a fractional table edge by one pixel.
    expect(
      Math.abs(language === "ar" ? range.positive : range.negative),
    ).toBeLessThanOrEqual(1);
  }
  return s;
}
for (const width of widths) {
  test(`forms retain generated direction and validation at ${width}px`, async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/invoices/new${query("en")}`);
    await page
      .getByRole("button", { name: copy.en.review, exact: true })
      .click();
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["ar", "en"] as const) {
        await switchLanguage(page, language);
        await selectGeometry(
          page.getByRole("combobox", {
            name: new RegExp(`^${copy[language].customer}(?:$| )`),
          }),
          language,
        );
        const helpers = page.locator(".MuiFormHelperText-root.Mui-error");
        await expect(helpers).toHaveCount(3);
        expect(
          await helpers.evaluateAll((ns) =>
            ns.every(
              (n) =>
                getComputedStyle(n).textAlign ===
                (document.documentElement.dir === "rtl" ? "right" : "left"),
            ),
          ),
        ).toBe(true);
        expect(
          await page
            .locator(".MuiFormControl-root")
            .evaluateAll((ns) =>
              ns
                .filter((n) =>
                  n.querySelector(".MuiFormHelperText-root.Mui-error"),
                )
                .every(
                  (n) =>
                    getComputedStyle(n.querySelector("fieldset")!)
                      .borderColor === "rgb(211, 47, 47)",
                ),
            ),
        ).toBe(true);
      }
    await prepareInvoice(page, "en");
    const description = page.getByLabel(copy.en.description, { exact: true });
    await description.focus();
    const root = description.locator(
      "xpath=ancestor::*[contains(@class,'MuiFormControl-root')][1]",
    );
    await expect(root.locator("label")).toHaveAttribute("data-shrink", "true");
    await expect
      .poll(() =>
        root.locator("label").evaluate((n) => getComputedStyle(n).transform),
      )
      .toBe("matrix(0.75, 0, 0, 0.75, 14, -9)");
    expect(
      await root
        .locator("fieldset")
        .evaluate((n) => getComputedStyle(n).borderColor),
    ).toBe("rgb(76, 88, 214)");
    expect(
      await root
        .locator("fieldset")
        .evaluate((n) => getComputedStyle(n).borderWidth),
    ).toBe("2px");
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["ar", "en"] as const) {
        await switchLanguage(page, language);
        await expect(
          page.getByLabel(copy[language].description, { exact: true }),
        ).toHaveValue("ورشة استراتيجية");
        await expect(
          page.getByLabel(copy[language].quantity, { exact: true }),
        ).toHaveValue("2");
        await expect(
          page.getByLabel(copy[language].rate, { exact: true }),
        ).toHaveValue("1500");
        await expect(
          page.getByRole("combobox", {
            name: new RegExp(`^${copy[language].customer}(?:$| )`),
          }),
        ).toContainText("Northstar Studio");
        const input = page.getByLabel(copy[language].description, {
          exact: true,
        });
        await input.focus();
        expect(await input.evaluate((n) => getComputedStyle(n).direction)).toBe(
          language === "ar" ? "rtl" : "ltr",
        );
        expect(await input.evaluate((n) => getComputedStyle(n).textAlign)).toBe(
          "start",
        );
        await expect
          .poll(() =>
            input
              .locator(
                "xpath=ancestor::*[contains(@class,'MuiFormControl-root')][1]",
              )
              .locator("label")
              .evaluate((n) => getComputedStyle(n).transform),
          )
          .toBe(
            `matrix(0.75, 0, 0, 0.75, ${language === "ar" ? -14 : 14}, -9)`,
          );
        expect(new URL(page.url()).pathname).toBe("/invoices/new");
      }
    await page.goto(`/settings${query("en")}`);
    await page
      .getByLabel(copy.en.company, { exact: false })
      .fill("Atlas Cairo");
    const email = await page.locator('input[type="email"]').inputValue();
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["ar", "en"] as const) {
        await switchLanguage(page, language);
        await expect(
          page.getByLabel(copy[language].company, { exact: false }),
        ).toHaveValue("Atlas Cairo");
        await expect(page.locator('input[type="email"]')).toHaveValue(email);
      }
    const procurement = new URL(baseURL!);
    procurement.port = String(Number(procurement.port) + 1);
    await page.goto(`${procurement.origin}/${query("en")}`);
    for (const language of ["en", "ar"] as const) {
      await switchLanguage(page, language);
      const select = page.getByRole("combobox", {
        name: copy[language].status,
      });
      await selectGeometry(select, language);
      await select.focus();
      await page.keyboard.press("ArrowDown");
      await expect(page.getByRole("listbox")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("listbox")).toBeHidden();
    }
  });
  test(`dialogs preserve glyph clearance and focus at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/invoices/new${query("en")}`);
    await prepareInvoice(page, "en");
    const trigger = page.getByRole("button", {
      name: copy.en.review,
      exact: true,
    });
    await trigger.click();
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["ar", "en"] as const) {
        await switchLanguage(page, language, true);
        const g = await dialogGeometry(page, language);
        expect(g.actions.map((a) => a.text)).toEqual(
          language === "ar"
            ? ["متابعة التعديل", "إنشاء فاتورة"]
            : ["Keep editing", "Create invoice"],
        );
        expect(
          language === "ar"
            ? g.actions[0].x > g.actions[1].x
            : g.actions[0].x < g.actions[1].x,
        ).toBe(true);
        await expect(page.getByRole("dialog")).toContainText(
          "Northstar Studio",
        );
        await expect(page.getByRole("dialog")).toContainText("$3,000.00");
        for (let i = 0; i < 5; i++) {
          await page.keyboard.press("Tab");
          expect(
            await page
              .getByRole("dialog")
              .evaluate((n) => n.contains(document.activeElement)),
          ).toBe(true);
        }
      }
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(trigger).toBeFocused();
    await expect(
      page.getByLabel(copy.en.description, { exact: true }),
    ).toHaveValue("ورشة استراتيجية");
    await page.goto(`/customers${query("en")}`);
    for (const language of ["en", "ar"] as const) {
      await switchLanguage(page, language);
      const buttons = page.getByRole("button", {
        name: copy[language].view,
        exact: true,
      });
      await expect(buttons).toHaveCount(6);
      for (let i = 0; i < 6; i++) {
        await buttons.nth(i).click();
        await dialogGeometry(page, language);
        await page.keyboard.press("Escape");
        await expect(page.getByRole("dialog")).toBeHidden();
        await expect(buttons.nth(i)).toBeFocused();
      }
    }
    await page.getByLabel(copy.ar.search, { exact: true }).fill("Northstar");
    const customerTrigger = page.getByRole("button", {
      name: copy.ar.view,
      exact: true,
    });
    await customerTrigger.click();
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["en", "ar"] as const) {
        await switchLanguage(page, language, true);
        await dialogGeometry(page, language);
        await expect(page.getByRole("dialog").locator("h2")).toHaveText(
          "Northstar Studio",
        );
        await expect(
          page.getByLabel(copy[language].search, { exact: true }),
        ).toHaveValue("Northstar");
        expect(new URL(page.url()).pathname).toBe("/customers");
      }
    await page
      .getByRole("button", { name: copy.ar.close, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeHidden();
    await expect(customerTrigger).toBeFocused();
    await expect(page.locator(".customer-card")).toHaveCount(1);
  });
  test(`tables preserve data, pagination and filters at ${width}px`, async ({
    page,
    baseURL,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/invoices${query("en")}`);
    const initial = await tableState(page, "en");
    expect(initial.headers.map((h) => h.text)).toEqual([
      "INVOICE",
      "CUSTOMER",
      "DUE DATE",
      "AMOUNT",
      "STATUS",
      "",
    ]);
    await page
      .getByRole("button", { name: "Go to page 2", exact: true })
      .click();
    const second = await tableState(page, "en");
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["ar", "en"] as const) {
        await switchLanguage(page, language);
        const current = await tableState(page, language);
        expect(current.rows.map((r) => r.slice(0, 4))).toEqual(
          second.rows.map((r) => r.slice(0, 4)),
        );
        await expect(
          page.locator(".MuiPaginationItem-root.Mui-selected"),
        ).toHaveText("2");
        expect(new URL(page.url()).pathname).toBe("/invoices");
      }
    const id = await page.locator("tbody .invoice-link").first().innerText();
    await page.locator("tbody .invoice-link").first().click();
    expect(new URL(page.url()).pathname).toBe(`/invoices/${id}`);
    await expect(page.locator("th")).toHaveCount(4);
    const detail = await tableState(page, "en");
    await switchLanguage(page, "ar");
    expect((await tableState(page, "ar")).rows).toEqual(detail.rows);
    const procurement = new URL(baseURL!);
    procurement.port = String(Number(procurement.port) + 1);
    await page.goto(`${procurement.origin}/${query("en")}`);
    const orders = await tableState(page, "en");
    await switchLanguage(page, "ar");
    expect(
      (await tableState(page, "ar")).rows.map((r) => r.slice(0, 4)),
    ).toEqual(orders.rows.map((r) => r.slice(0, 4)));
    await page.getByRole("combobox", { name: copy.ar.status }).click();
    await page
      .getByRole("option", { name: copy.ar.approved, exact: true })
      .click();
    const approved = await tableState(page, "ar");
    expect(approved.rows).toHaveLength(3);
    for (let cycle = 0; cycle < 5; cycle++)
      for (const language of ["en", "ar"] as const) {
        await switchLanguage(page, language);
        expect(
          (await tableState(page, language)).rows.map((r) => r.slice(0, 4)),
        ).toEqual(approved.rows.map((r) => r.slice(0, 4)));
      }
    const orderId = await page
      .locator("tbody .invoice-link")
      .first()
      .innerText();
    await page.locator("tbody .invoice-link").first().click();
    expect(new URL(page.url()).pathname).toBe(`/orders/${orderId}`);
    await expect(page.locator("th")).toHaveCount(3);
    const orderDetail = await tableState(page, "ar");
    await switchLanguage(page, "en");
    expect((await tableState(page, "en")).rows).toEqual(orderDetail.rows);
  });
}
