import { test, expect } from "../fixtures/e2e";

for (const width of [390, 899, 900, 901, 1100, 1101, 1440]) {
  test(`Dashboard progression glyph preserves navigation at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?demo=unmigrated-rtl&lang=en");
    const originalRows = await page.locator("tbody tr").allTextContents();
    const link = page.locator('.section-title a[href^="/invoices"]');
    for (let cycle = 0; cycle < 5; cycle++) {
      for (const language of ["ar", "en"] as const) {
        await page
          .locator('select[aria-label="Language / اللغة"]')
          .selectOption(language);
        const expected =
          language === "ar" ? "عرض جميع الفواتير ←" : "View all invoices →";
        await expect(link).toHaveText(expected);
        await expect(link).toHaveAccessibleName(expected);
        await link.scrollIntoViewIfNeeded();
        const geometry = await link.evaluate((element) => {
          const text = element.firstChild!;
          const value = text.textContent!;
          const range = document.createRange();
          range.setStart(text, value.length - 1);
          range.setEnd(text, value.length);
          const glyph = range.getBoundingClientRect();
          const bounds = element.getBoundingClientRect();
          return {
            glyph: glyph.toJSON(),
            bounds: bounds.toJSON(),
            transform: getComputedStyle(element).transform,
          };
        });
        expect(geometry.glyph.width).toBeGreaterThan(0);
        expect(geometry.glyph.height).toBeGreaterThan(0);
        expect(geometry.glyph.left).toBeGreaterThanOrEqual(
          geometry.bounds.left - 1,
        );
        expect(geometry.glyph.right).toBeLessThanOrEqual(
          geometry.bounds.right + 1,
        );
        expect(geometry.transform).toBe("none");
        await expect(link).toHaveAttribute(
          "href",
          `/invoices?demo=unmigrated-rtl&lang=${language}`,
        );
        expect(new URL(page.url()).pathname).toBe("/");
        if (language === "en")
          expect(await page.locator("tbody tr").allTextContents()).toEqual(
            originalRows,
          );
        // Growth and external-link indicators retain their established semantics.
        await expect(page.locator(".kpi-note").first()).toContainText("↗");
      }
    }
    await link.click();
    await expect(page).toHaveURL(/\/invoices\?demo=unmigrated-rtl&lang=en$/);
    await page.goto("/?demo=unmigrated-rtl&lang=ar");
    await link.focus();
    await expect(link).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/invoices\?demo=unmigrated-rtl&lang=ar$/);
  });
}
