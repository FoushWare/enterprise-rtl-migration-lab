import { test, expect, type Page } from "@playwright/test";

const widths = [390, 899, 900, 901, 1100, 1101, 1440];
type Language = "en" | "ar";
async function brandGeometry(page: Page) {
  return page.locator(".brand").evaluate(n => {
    const mark = n.querySelector(".brand-mark")!, period = n.querySelector(".brand-period")!;
    const text = [...n.childNodes].find(x => x.nodeType === Node.TEXT_NODE && x.textContent?.includes("atlas"))!;
    const start = text.textContent!.indexOf("atlas"), range = document.createRange();
    range.setStart(text, start); range.setEnd(text, start + 5);
    const word = range.getBoundingClientRect(), m = mark.getBoundingClientRect(), p = period.getBoundingClientRect();
    const glyphCenters = Array.from({ length: 5 }, (_, i) => { range.setStart(text, start + i); range.setEnd(text, start + i + 1); const r = range.getBoundingClientRect(); return r.x + r.width / 2; });
    const styles = [n, mark, period].map(x => { const s = getComputedStyle(x); return { font: s.font, spacing: s.letterSpacing, width: x.getBoundingClientRect().width, height: x.getBoundingClientRect().height, transform: s.transform }; });
    return { direction: getComputedStyle(n).direction, markX: m.x, wordX: word.x, periodX: p.x, gap: word.left - m.right, periodGap: p.left - word.right, glyphCenters, styles, href: n.getAttribute("href"), text: n.textContent };
  });
}
async function shellGeometry(page: Page, width: number, language: Language) {
  const rtl = language === "ar";
  await expect(page.locator("html")).toHaveAttribute("dir", rtl ? "rtl" : "ltr");
  await expect.poll(() => page.locator("aside").evaluate(n => Math.round(n.getBoundingClientRect().x))).toBe(rtl ? width - 238 : 0);
  expect(await page.locator("aside nav").evaluate(n => getComputedStyle(n).direction)).toBe(rtl ? "rtl" : "ltr");
  expect(await page.locator(".workspace").evaluate(n => getComputedStyle(n).direction)).toBe(rtl ? "rtl" : "ltr");
  const margins = await page.locator(".app-main").evaluate(n => { const s = getComputedStyle(n); return [s.marginLeft, s.marginRight]; });
  expect(margins).toEqual(width <= 900 ? ["0px", "0px"] : rtl ? ["0px", "238px"] : ["238px", "0px"]);
}
for (const application of ["invoicing", "procurement"] as const) for (const width of widths) {
  test(`${application} brand composition and shell isolation at ${width}px`, async ({ page, baseURL }) => {
    const origin = new URL(baseURL!); if (application === "procurement") origin.port = String(Number(origin.port) + 1);
    const route = application === "invoicing" ? "/invoices" : "/";
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${origin.origin}${route}?demo=unmigrated-rtl&lang=en`);
    if (application === "invoicing") await page.getByRole("button", { name: "Go to page 2", exact: true }).click();
    else { await page.getByRole("combobox", { name: /^Status/ }).click(); await page.getByRole("option", { name: "Approved", exact: true }).click(); }
    if (width <= 900) await page.getByRole("button", { name: "Open navigation", exact: true }).click();
    await shellGeometry(page, width, "en");
    const reference = await brandGeometry(page);
    expect(reference.gap).toBeCloseTo(10, 1);
    const rows = await page.locator("tbody tr").count();
    for (let cycle = 0; cycle < 5; cycle++) for (const language of ["ar", "en"] as const) {
      if (width <= 900 && await page.locator("aside").evaluate(n => n.classList.contains("is-open"))) {
        const rtl = await page.locator("html").getAttribute("dir") === "rtl";
        await page.locator(".nav-scrim").click({ position: { x: rtl ? 10 : width - 10, y: 400 } });
      }
      await page.locator('select[aria-label="Language / اللغة"]').selectOption(language);
      if (width <= 900) await page.getByRole("button", { name: language === "ar" ? "فتح قائمة التنقل" : "Open navigation", exact: true }).click();
      await shellGeometry(page, width, language);
      const current = await brandGeometry(page);
      expect(current.direction).toBe("ltr");
      expect(current.markX).toBeLessThan(current.wordX); expect(current.wordX).toBeLessThan(current.periodX);
      for (let i = 1; i < current.glyphCenters.length; i++) expect(current.glyphCenters[i]).toBeGreaterThan(current.glyphCenters[i - 1]);
      expect(current.styles).toEqual(reference.styles); expect(current.styles.every(s => s.transform === "none")).toBe(true);
      expect(current.gap).toBeCloseTo(reference.gap, 2); expect(current.periodGap).toBeCloseTo(reference.periodGap, 2);
      expect(current.text).toBe(reference.text); expect(current.href).toBe(`/?demo=unmigrated-rtl&lang=${language}`);
      expect(new URL(page.url()).pathname).toBe(route); await expect(page.locator("tbody tr")).toHaveCount(rows);
      if (application === "invoicing") await expect(page.locator(".MuiPaginationItem-root.Mui-selected")).toHaveText("2");
      else await expect(page.getByRole("combobox", { name: language === "ar" ? /^الحالة/ : /^Status/ })).toContainText(language === "ar" ? "معتمد" : "Approved");
    }
    // Verify pointer and keyboard activation in the existing reading-direction shell.
    for (const language of ["ar", "en"] as const) {
      if (width <= 900 && await page.locator("aside").evaluate(n => n.classList.contains("is-open"))) {
        const rtl = await page.locator("html").getAttribute("dir") === "rtl";
        await page.locator(".nav-scrim").click({ position: { x: rtl ? 10 : width - 10, y: 400 } });
      }
      await page.locator('select[aria-label="Language / اللغة"]').selectOption(language);
      if (width <= 900) await page.getByRole("button", { name: language === "ar" ? "فتح قائمة التنقل" : "Open navigation", exact: true }).click();
      if (width <= 900 && !await page.locator("aside").evaluate(n => n.classList.contains("is-open"))) await page.getByRole("button", { name: language === "ar" ? "فتح قائمة التنقل" : "Open navigation", exact: true }).click();
      if (language === "ar") await page.locator(".brand").click();
      else { await page.locator(".brand").focus(); await page.keyboard.press("Enter"); }
      await expect.poll(() => new URL(page.url()).pathname).toBe("/");
      expect(new URL(page.url()).searchParams.get("lang")).toBe(language);
      if (width <= 900 && await page.locator("aside").evaluate(n => n.classList.contains("is-open"))) {
        await page.getByRole("button", { name: language === "ar" ? "إغلاق قائمة التنقل" : "Close navigation", exact: true }).click({ position: { x: language === "ar" ? 10 : width - 10, y: 400 } });
        await expect(page.locator("aside")).not.toHaveClass(/is-open/);
      }
    }
    await page.emulateMedia({ media: "print" }); await expect(page.locator("aside")).toBeHidden();
    expect(await page.locator(".app-main").evaluate(n => [getComputedStyle(n).marginLeft, getComputedStyle(n).marginRight])).toEqual(["0px", "0px"]);
  });
}
