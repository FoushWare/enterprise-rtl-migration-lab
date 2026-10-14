import { test, expect, type Locator, type Page } from "@playwright/test";

const widths = [390, 899, 900, 901, 1100, 1101, 1440];
type Language = "en" | "ar";
const query = (language: Language) => `?demo=unmigrated-rtl&lang=${language}`;
async function measure(action: Locator) {
  await action.scrollIntoViewIfNeeded();
  return action.evaluate(n => {
    const svg = n.querySelector("svg")!, path = svg.querySelector("path")!, s = getComputedStyle(svg);
    const button = n.getBoundingClientRect(), icon = svg.getBoundingClientRect();
    // Sample the rendered path outside the horizontal shaft. The arrowhead's
    // centroid lies on its progression side; screen CTM includes CSS transforms.
    let sumX = 0, sumY = 0, count = 0;
    for (let x = 4; x <= 20; x += .25) for (let y = 4; y <= 20; y += .25) {
      if (y >= 10 && y <= 14) continue;
      if (path.isPointInFill(new DOMPoint(x, y))) { sumX += x; sumY += y; count++; }
    }
    if (!count) throw new Error("Arrowhead geometry could not be measured");
    const matrix = path.getScreenCTM()!, head = new DOMPoint(sumX / count, sumY / count).matrixTransform(matrix), center = new DOMPoint(12, 12).matrixTransform(matrix);
    return { headDeltaX: head.x - center.x, path: path.getAttribute("d"), transform: s.transform, color: s.color,
      iconWidth: icon.width, iconHeight: icon.height, buttonWidth: button.width, buttonHeight: button.height,
      centerOffsetX: (icon.left + icon.right - button.left - button.right) / 2,
      centerOffsetY: (icon.top + icon.bottom - button.top - button.bottom) / 2,
      aria: n.getAttribute("aria-label"), href: n.getAttribute("href"), tag: n.tagName };
  });
}
async function data(page: Page) {
  return page.locator("tbody tr").evaluateAll(rows => rows.map(n => ({ id: n.querySelector(".invoice-link")?.textContent, amount: n.querySelector(".amount")?.textContent, date: n.querySelector(".table-date")?.textContent })));
}
for (const surface of ["recent", "list"] as const) for (const width of widths) {
  test(`${surface} invoice action direction and navigation at ${width}px`, async ({ page }) => {
    const route = surface === "recent" ? "/" : "/invoices";
    await page.setViewportSize({ width, height: 1000 });
    async function load(language: Language) {
      await page.goto(`${route}${query(language)}`);
      if (surface === "list") { await page.getByRole("button", { name: language === "ar" ? "الانتقال إلى الصفحة 2" : "Go to page 2", exact: true }).click(); await expect(page.locator(".MuiPaginationItem-root.Mui-selected")).toHaveText("2"); }
      await expect(page.locator("tbody .invoice-link").first()).toBeVisible();
    }
    await load("en");
    const reference = await measure(page.locator("tbody a[aria-label]").first()), originalData = await data(page);
    expect(reference.headDeltaX).toBeGreaterThan(0); expect(reference.tag).toBe("A");
    expect(reference.iconWidth).toBe(15); expect(reference.iconHeight).toBe(15);
    for (let cycle = 0; cycle < 5; cycle++) for (const language of ["ar", "en"] as const) {
      await page.locator('select[aria-label="Language / اللغة"]').selectOption(language);
      await expect(page.locator("html")).toHaveAttribute("dir", language === "ar" ? "rtl" : "ltr");
      const action = page.locator("tbody a[aria-label]").first(), geometry = await measure(action);
      expect(language === "ar" ? geometry.headDeltaX < 0 : geometry.headDeltaX > 0).toBe(true);
      expect(geometry.transform).toBe("none"); expect(geometry.color).toBe(reference.color);
      for (const key of ["iconWidth", "iconHeight", "buttonWidth", "buttonHeight", "centerOffsetX", "centerOffsetY"] as const) expect(geometry[key]).toBeCloseTo(reference[key], 2);
      expect(geometry.aria).toBe(`${language === "ar" ? "عرض" : "View"} ${originalData[0].id}`);
      expect(geometry.href).toBe(`/invoices/${originalData[0].id}${query(language)}`);
      expect(new URL(page.url()).pathname).toBe(route); expect(await data(page)).toEqual(originalData);
      if (surface === "list") await expect(page.locator(".MuiPaginationItem-root.Mui-selected")).toHaveText("2");
    }
    for (const language of ["en", "ar"] as const) for (const activation of ["pointer", "enter"] as const) {
      await load(language); const action = page.locator("tbody a[aria-label]").first(); await measure(action);
      const id = await page.locator("tbody .invoice-link").first().innerText();
      await expect(action).toHaveAccessibleName(`${language === "ar" ? "عرض" : "View"} ${id}`);
      if (activation === "pointer") await action.click(); else { await action.focus(); await expect(action).toBeFocused(); await page.keyboard.press("Enter"); }
      await expect(page).toHaveURL(new RegExp(`/invoices/${id}\\?demo=unmigrated-rtl&lang=${language}$`));
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(id);
    }
  });
}
