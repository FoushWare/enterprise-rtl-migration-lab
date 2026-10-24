import { test, expect, type Page } from "../fixtures/e2e";
const months = {
  en: ["May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  ar: ["مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر"],
};
const line =
  "M45 145 C80 145 100 110 145 115 S215 150 255 104 S325 85 365 96 S435 50 475 60 S545 50 590 25";
async function chart(page: Page) {
  await expect(page.locator(".chart-labels span")).toHaveCount(6);
  return page.evaluate(() => {
    const wrapper = document.querySelector(".chart-wrap")!,
      svg = wrapper.querySelector("svg")!,
      labels = wrapper.querySelector(".chart-labels")!;
    const box = (n: Element) => {
      const b = n.getBoundingClientRect();
      return {
        left: b.left,
        right: b.right,
        width: b.width,
        center: (b.left + b.right) / 2,
      };
    };
    const attrs = (selector: string, names: string[]) =>
      [...svg.querySelectorAll(selector)].map((n) =>
        Object.fromEntries(names.map((k) => [k, n.getAttribute(k)])),
      );
    const matrix = svg.getScreenCTM()!;
    const rows = [...document.querySelectorAll(".breakdown-row")];
    return {
      wrapperDirection: getComputedStyle(wrapper).direction,
      labelDirection: getComputedStyle(labels).direction,
      gutter: getComputedStyle(labels).paddingLeft,
      bounds: box(wrapper),
      months: [...labels.children].map((n) => ({
        text: n.textContent,
        ...box(n),
        direction: getComputedStyle(n).direction,
        bidi: getComputedStyle(n).unicodeBidi,
      })),
      geometry: {
        viewBox: svg.getAttribute("viewBox"),
        paths: attrs("path", ["d", "fill", "stroke", "stroke-width"]),
        lines: attrs("line", ["x1", "x2", "y1", "y2"]),
        endpoint: attrs("circle", ["cx", "cy", "r"]),
        gradient: attrs("linearGradient", ["id", "x1", "y1", "x2", "y2"]),
        stops: attrs("stop", ["offset", "stop-color", "stop-opacity"]),
      },
      ticks: [...svg.querySelectorAll("text")].map((n) => ({
        text: n.textContent?.trim(),
        x: n.getAttribute("x"),
        y: n.getAttribute("y"),
        anchor: getComputedStyle(n).textAnchor,
        direction: getComputedStyle(n).direction,
        glyphX: n.getBBox().x,
        glyphWidth: n.getBBox().width,
      })),
      svgTransform: getComputedStyle(svg).transform,
      matrixA: matrix.a,
      donut: {
        background: getComputedStyle(document.querySelector(".donut")!)
          .backgroundImage,
        transform: getComputedStyle(document.querySelector(".donut")!)
          .transform,
        total: document.querySelector(".donut-center strong")!.textContent,
        values: rows.map((n) => n.querySelector("strong")!.textContent?.trim()),
        colors: rows.map(
          (n) => getComputedStyle(n.querySelector("i")!).backgroundColor,
        ),
      },
      legend: {
        text: document.querySelector(".chart-legend")!.textContent,
        spacing: getComputedStyle(document.querySelector(".chart-legend i")!)
          .marginInlineEnd,
      },
      categories: rows.map((n) =>
        n.querySelector(":scope > span")!.textContent?.trim(),
      ),
      columns: getComputedStyle(
        document.querySelector(".charts")!,
      ).gridTemplateColumns.split(" ").length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      storage: localStorage.getItem("atlas-invoices-v1"),
    };
  });
}
function verify(s: Awaited<ReturnType<typeof chart>>, lang: "en" | "ar") {
  expect(s.wrapperDirection).toBe("ltr");
  expect(s.labelDirection).toBe("ltr");
  expect(s.gutter).toBe("40px");
  expect(s.months.map((m) => m.text)).toEqual(months[lang]);
  for (const [i, m] of s.months.entries()) {
    expect(m.left).toBeGreaterThanOrEqual(s.bounds.left);
    expect(m.right).toBeLessThanOrEqual(s.bounds.right);
    if (i) {
      expect(m.center).toBeGreaterThan(s.months[i - 1].center);
      expect(m.left).toBeGreaterThanOrEqual(s.months[i - 1].right);
    }
    if (lang === "ar") {
      expect(m.direction).toBe("rtl");
      expect(m.bidi).toBe("isolate");
    }
  }
  expect(s.geometry.viewBox).toBe("0 0 600 215");
  expect(s.geometry.paths.map((p) => p.d)).toEqual([
    line + " L590 190 L45 190Z",
    line,
  ]);
  expect(s.geometry.lines).toEqual(
    [30, 75, 120, 165].map((y) => ({
      x1: "45",
      x2: "590",
      y1: String(y),
      y2: String(y),
    })),
  );
  expect(s.geometry.endpoint).toEqual([{ cx: "590", cy: "25", r: "4" }]);
  expect(s.geometry.gradient).toEqual([
    { id: "revenue-fill", x1: "0", y1: "0", x2: "0", y2: "1" },
  ]);
  expect(s.geometry.stops).toEqual([
    { offset: "0%", "stop-color": "#6671e0", "stop-opacity": ".18" },
    { offset: "100%", "stop-color": "#6671e0", "stop-opacity": "0" },
  ]);
  expect(s.legend.text).toBe(
    lang === "en" ? "Revenue · USD" : "الإيرادات · USD",
  );
  expect(s.legend.spacing).toBe("7px");
  expect(s.donut.transform).toBe("none");
  expect(s.ticks.map((t) => t.text)).toEqual(["$60k", "$45k", "$30k", "$15k"]);
  for (const tick of s.ticks) {
    expect(tick.direction).toBe("ltr");
    expect(tick.anchor).toBe("start");
    expect(tick.x).toBe("0");
    expect(Math.abs(tick.glyphX)).toBeLessThan(0.1);
  }
  expect(s.svgTransform).toBe("none");
  expect(s.matrixA).toBeGreaterThan(0);
  expect(s.overflow).toBe(false);
}
for (const width of [1440, 390]) {
  test(`revenue chart Arabic initial load preserves chronology at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?demo=unmigrated-rtl&lang=ar");
    verify(await chart(page), "ar");
  });
  test(`revenue chart switching preserves geometry and donut at ${width}px`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/?demo=unmigrated-rtl&lang=en");
    const baseline = await chart(page);
    verify(baseline, "en");
    for (let cycle = 0; cycle < 5; cycle++)
      for (const lang of ["ar", "en"] as const) {
        await page.getByLabel("Language / اللغة").selectOption(lang);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          lang === "ar" ? "rtl" : "ltr",
        );
        const s = await chart(page);
        verify(s, lang);
        expect(s.geometry).toEqual(baseline.geometry);
        expect(s.donut).toEqual(baseline.donut);
        expect(s.storage).toBe(baseline.storage);
        expect(new URL(page.url()).pathname).toBe("/");
        expect(s.categories).toEqual(
          lang === "en"
            ? ["Paid", "Pending", "Overdue", "Draft"]
            : ["مدفوعة", "قيد الانتظار", "متأخرة", "مسودة"],
        );
        for (const [i, tick] of s.ticks.entries()) {
          expect(tick.glyphX).toBeCloseTo(baseline.ticks[i].glyphX, 1);
          expect(tick.glyphWidth).toBeCloseTo(baseline.ticks[i].glyphWidth, 1);
        }
      }
    for (const breakpoint of [899, 900, 901]) {
      await page.setViewportSize({ width: breakpoint, height: 1000 });
      verify(await chart(page), "en");
      expect((await chart(page)).columns).toBe(breakpoint <= 900 ? 1 : 2);
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    for (const lang of ["en", "ar"] as const) {
      await page.getByLabel("Language / اللغة").selectOption(lang);
      await expect(page.locator("html")).toHaveAttribute(
        "dir",
        lang === "ar" ? "rtl" : "ltr",
      );
      await page.emulateMedia({ media: "print" });
      const s = await chart(page);
      verify(s, lang);
      expect(s.geometry).toEqual(baseline.geometry);
      expect(s.donut).toEqual(baseline.donut);
      expect(s.columns).toBe(2);
      await page.emulateMedia({ media: "screen" });
    }
    expect(errors).toEqual([]);
  });
}
