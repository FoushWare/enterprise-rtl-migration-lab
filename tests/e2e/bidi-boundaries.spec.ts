import { test, expect, type Locator } from "../fixtures/e2e";

async function glyphs(element: Locator) {
  return element.evaluate((node) => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    const chars: { char: string; x: number; width: number }[] = [];
    let text: Node | null;
    while ((text = walker.nextNode())) {
      for (let i = 0; i < text.textContent!.length; i++) {
        const range = document.createRange();
        range.setStart(text, i);
        range.setEnd(text, i + 1);
        const bounds = range.getBoundingClientRect();
        chars.push({
          char: text.textContent![i],
          x: bounds.x,
          width: bounds.width,
        });
      }
    }
    return { text: node.textContent, chars };
  });
}

for (const width of [390, 899, 900, 901, 1100, 1101, 1440]) {
  test(`Mixed amount, name and address boundaries at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/invoices/new?demo=unmigrated-rtl&lang=ar");
    await page.getByRole("combobox", { name: "العميل", exact: true }).click();
    await page
      .getByRole("option", { name: "Northstar Studio", exact: true })
      .click();
    await page.getByLabel("الوصف 1", { exact: true }).fill("ورشة استراتيجية");
    await page.getByLabel("السعر 1", { exact: true }).fill("1500");
    await page.getByLabel("الكمية 1", { exact: true }).fill("2");
    await page
      .getByRole("button", { name: "مراجعة الفاتورة", exact: true })
      .click();
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const language of ["en", "ar"] as const) {
        // Uses the existing React control while MUI makes the background inert.
        await page
          .locator('select[aria-label="Language / اللغة"]')
          .selectOption(language, { force: true });
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          language === "ar" ? "rtl" : "ltr",
        );
        const amount = page.getByRole("dialog").locator('bdi[dir="ltr"]');
        await expect(amount).toHaveText("$3,000.00");
        const value = await glyphs(amount);
        expect(value.chars[0].char).toBe("$");
        expect(value.chars[0].x).toBeLessThan(value.chars[1].x);
        const selection = await amount.evaluate((node) => {
          const range = document.createRange();
          range.selectNodeContents(node);
          const selection = window.getSelection()!;
          selection.removeAllRanges();
          selection.addRange(range);
          const text = selection.toString();
          selection.removeAllRanges();
          return text;
        });
        expect(selection).toBe("$3,000.00");
        await expect(
          page.getByRole("dialog").locator('bdi[dir="auto"]'),
        ).toHaveText("Northstar Studio");
        expect(new URL(page.url()).pathname).toBe("/invoices/new");
        await expect(page.locator('input[type="date"]').first()).toHaveValue(
          "2026-10-11",
        );
        await expect(page.locator('input[type="date"]').last()).toHaveValue(
          "2026-11-10",
        );
      }
    }
    await page.keyboard.press("Escape");
    await expect(page.getByLabel("الوصف 1", { exact: true })).toHaveValue(
      "ورشة استراتيجية",
    );
    await page.goto("/customers?demo=unmigrated-rtl&lang=ar");
    const company = page
      .locator(".customer-card h3 bdi")
      .filter({ hasText: "Evergreen & Co." });
    const name = await glyphs(company);
    expect(name.text).toBe("Evergreen & Co.");
    expect(name.chars.at(-1)!.char).toBe(".");
    expect(name.chars.at(-1)!.x).toBeGreaterThan(name.chars[0].x);
    await page
      .getByRole("button", { name: "عرض العميل", exact: true })
      .first()
      .click();
    const address = await glyphs(
      page.getByRole("dialog").locator("p.hint bdi"),
    );
    expect(address.text).toBe("24 Alder Street, London, United Kingdom");
    expect(address.chars[0].x).toBeLessThan(address.chars[3].x);
    await page.keyboard.press("Escape");
    await page
      .locator(".customer-card")
      .filter({ hasText: "Evergreen & Co." })
      .getByRole("button")
      .click();
    const title = page.getByRole("dialog").locator("h2");
    const titleText = await title.evaluate((node) => {
      const text = node.firstChild!;
      const value = text.textContent!;
      const range = document.createRange();
      range.setStart(text, 0);
      range.setEnd(text, value.length);
      const bounds = range.getBoundingClientRect();
      const first = document.createRange(),
        last = document.createRange();
      first.setStart(text, 0);
      first.setEnd(text, 1);
      last.setStart(text, value.length - 1);
      last.setEnd(text, value.length);
      const close = node.querySelector("button")!.getBoundingClientRect();
      return {
        first: first.getBoundingClientRect().x,
        last: last.getBoundingClientRect().x,
        clear: bounds.left >= close.right + 8,
      };
    });
    expect(titleText.last).toBeGreaterThan(titleText.first);
    expect(titleText.clear).toBe(true);
    await page.keyboard.press("Escape");
    await page.goto("/?demo=unmigrated-rtl&lang=ar");
    const kpi = await glyphs(page.locator(".kpi-value").first());
    expect(kpi.chars[0].char).toBe("$");
    expect(kpi.chars[0].x).toBeLessThan(kpi.chars[1].x);
    await page.goto("http://127.0.0.1:4201/?demo=unmigrated-rtl&lang=ar");
    const orderAmount = await glyphs(page.locator(".amount").first());
    expect(orderAmount.chars[0].char).toBe("$");
    expect(orderAmount.chars[0].x).toBeLessThan(orderAmount.chars[1].x);
  });
}
