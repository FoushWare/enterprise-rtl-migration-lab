import { test, expect, type Page } from "@playwright/test";
const widths = [390, 899, 900, 901, 1100, 1101, 1440];
async function kpis(page: Page) {
  await expect(page.locator(".kpi-icon")).toHaveCount(4);
  return page.evaluate(() => {
    const box = (b: DOMRect) => ({ left: b.left, right: b.right, top: b.top, bottom: b.bottom, width: b.width, height: b.height });
    return {
      route: location.pathname, storage: localStorage.getItem("atlas-invoices-v1"),
      cards: [...document.querySelectorAll(".kpi")].map(card => {
        const icon = card.querySelector(".kpi-icon")!, label = card.querySelector(".kpi-label")!, svg = icon.querySelector("svg")!;
        const range = document.createRange(); range.selectNodeContents(label);
        const cs = getComputedStyle(card), is = getComputedStyle(icon);
        return { card: box(card.getBoundingClientRect()), icon: box(icon.getBoundingClientRect()), glyphs: [...range.getClientRects()].filter(r => r.width > 0).map(box),
          borderLeft: parseFloat(cs.borderLeftWidth), borderRight: parseFloat(cs.borderRightWidth), borderTop: parseFloat(cs.borderTopWidth),
          inset: is.insetInlineEnd, top: is.top, background: is.backgroundColor, color: is.color, padding: is.padding,
          paths: [...svg.querySelectorAll("path")].map(n => n.getAttribute("d")), transform: getComputedStyle(svg).transform,
          value: card.querySelector(".kpi-value")!.textContent,
          growth: card.querySelector(".kpi-note b")!.textContent, note: card.querySelector(".kpi-note")!.textContent,
          label: label.textContent, labelHeight: label.getBoundingClientRect().height,
        };
      }),
    };
  });
}
function verify(s: Awaited<ReturnType<typeof kpis>>, lang: "en" | "ar") {
  for (const c of s.cards) {
    expect(c.inset).toBe("20px"); expect(c.top).toBe("20px"); expect(c.icon.width).toBe(32); expect(c.icon.height).toBe(32);
    expect(c.icon.top - c.card.top - c.borderTop).toBeCloseTo(20, 4);
    const offset = lang === "en" ? c.card.right - c.borderRight - c.icon.right : c.icon.left - c.card.left - c.borderLeft;
    expect(offset).toBeCloseTo(20, 4);
    expect(c.transform).toBe("none"); expect(c.padding).toBe("7px"); expect(c.background).toBe("rgb(242, 243, 251)");
    for (const g of c.glyphs) {
      const overlap = Math.min(g.right, c.icon.right) > Math.max(g.left, c.icon.left) && Math.min(g.bottom, c.icon.bottom) > Math.max(g.top, c.icon.top);
      expect(overlap, `${lang}: ${c.label}`).toBe(false);
      expect(g.left).toBeGreaterThanOrEqual(c.card.left); expect(g.right).toBeLessThanOrEqual(c.card.right);
      expect(g.top).toBeGreaterThanOrEqual(c.card.top); expect(g.bottom).toBeLessThanOrEqual(c.card.bottom);
    }
    expect(new Set(c.glyphs.map(g => Math.round(g.top))).size).toBe(1);
  }
}
for (const width of widths) {
  test(`KPI reading-end icon and glyph clearance at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 }); await page.goto("/?demo=unmigrated-rtl&lang=en");
    // Compare each locale with its own pre-migration rendering. Localized
    // note wrapping can already produce different card heights at 1101px.
    const beforePage = await page.context().newPage();
    await beforePage.setViewportSize({ width, height: 1000 });
    let restored = 0;
    await beforePage.route("**/*.css*", async route => {
      const response = await route.fetch(); const body = await response.text();
      if (/inset-inline-end:\s*20px;/.test(body)) {
        restored++; await route.fulfill({ response, body: body.replace(/inset-inline-end:\s*20px;/, "right: 20px;") });
      } else await route.fulfill({ response });
    });
    const before: Partial<Record<"en" | "ar", Awaited<ReturnType<typeof kpis>>>> = {};
    for (const lang of ["en", "ar"] as const) {
      await beforePage.goto(`/?demo=unmigrated-rtl&lang=${lang}`); before[lang] = await kpis(beforePage);
    }
    expect(restored).toBeGreaterThan(0); await beforePage.close();
    const english = await kpis(page); verify(english, "en");
    await page.getByLabel("Language / اللغة").selectOption("ar"); await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const arabic = await kpis(page); verify(arabic, "ar");
    expect(arabic.cards.map(c => c.value)).toEqual(english.cards.map(c => c.value));
    for (const [i, c] of arabic.cards.entries()) {
      const before = english.cards[i]; expect(c.paths).toEqual(before.paths); expect(c.color).toBe(before.color);
      expect(c.card.width).toBeCloseTo(before.card.width, 1);
      expect(c.labelHeight).toBeCloseTo(before.labelHeight, 1); expect(c.growth).toContain("↗");
    }
    for (const [lang, current] of [["en", english], ["ar", arabic]] as const) {
      for (const [i, card] of current.cards.entries()) {
        const prior = before[lang]!.cards[i];
        expect(card.card).toEqual(prior.card); expect(card.labelHeight).toBe(prior.labelHeight);
        expect(card.value).toBe(prior.value); expect(card.note).toBe(prior.note); expect(card.growth).toBe(prior.growth);
        expect(card.paths).toEqual(prior.paths); expect(card.transform).toBe(prior.transform);
      }
    }
    for (let cycle = 0; cycle < 5; cycle++) for (const lang of ["en", "ar"] as const) {
      await page.getByLabel("Language / اللغة").selectOption(lang); await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      const current = await kpis(page); verify(current, lang); const reference = lang === "en" ? english : arabic;
      expect(current.cards).toEqual(reference.cards); expect(current.storage).toBe(english.storage); expect(current.route).toBe(english.route);
    }
    // Use page-like print width; responsive screen widths are covered above.
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const lang of ["en", "ar"] as const) {
      await page.getByLabel("Language / اللغة").selectOption(lang); await expect(page.locator("html")).toHaveAttribute("dir", lang === "ar" ? "rtl" : "ltr");
      await page.emulateMedia({ media: "print" }); verify(await kpis(page), lang); await page.emulateMedia({ media: "screen" });
    }
  });
}
