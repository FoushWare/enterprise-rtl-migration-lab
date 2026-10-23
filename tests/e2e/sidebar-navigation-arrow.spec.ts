import { test, expect, type Page } from "@playwright/test";

const widths = [390, 899, 900, 901, 1100, 1101, 1440];
type Language = "en" | "ar";
const targetSelector = ".app-link > svg:last-child";
async function geometry(page: Page) {
  return page.locator(".app-link").evaluate((n) => {
    const svg = n.querySelector(":scope > svg:last-child") as SVGSVGElement,
      bag = n.querySelector(":scope > svg:first-child")!;
    const s = getComputedStyle(svg),
      r = svg.getBoundingClientRect(),
      link = n.getBoundingClientRect();
    const matrix = svg.getScreenCTM()!,
      tip = new DOMPoint(20, 12).matrixTransform(matrix),
      shaft = new DOMPoint(4, 12).matrixTransform(matrix);
    return {
      displacement: tip.x - shaft.x,
      transform: s.transform,
      width: r.width,
      height: r.height,
      leftGap: r.left - link.left,
      rightGap: link.right - r.right,
      centerFromLeft: (r.left + r.right) / 2 - link.left,
      centerFromRight: link.right - (r.left + r.right) / 2,
      path: svg.querySelector("path")!.getAttribute("d"),
      href: n.getAttribute("href"),
      bagPath: bag.querySelector("path")!.getAttribute("d"),
      bagTransform: getComputedStyle(bag).transform,
      bagWidth: bag.getBoundingClientRect().width,
      bagHeight: bag.getBoundingClientRect().height,
      bagMatches: bag.matches('html[dir="rtl"] .app-link > svg:last-child'),
    };
  });
}
for (const application of ["invoicing", "procurement"] as const)
  for (const width of widths) {
    test(`${application} cross-app arrow geometry and navigation at ${width}px`, async ({
      page,
      baseURL,
    }) => {
      const origin = new URL(baseURL!);
      if (application === "procurement")
        origin.port = String(Number(origin.port) + 1);
      const route = application === "invoicing" ? "/invoices" : "/";
      await page.setViewportSize({ width, height: 1000 });
      await page.goto(`${origin.origin}${route}?demo=unmigrated-rtl&lang=en`);
      if (application === "invoicing") {
        await page
          .getByRole("button", { name: "Go to page 2", exact: true })
          .click();
        await expect(
          page.locator(".MuiPaginationItem-root.Mui-selected"),
        ).toHaveText("2");
      } else {
        await page.getByRole("combobox", { name: /^Status/ }).click();
        await page
          .getByRole("option", { name: "Approved", exact: true })
          .click();
      }
      if (width <= 900)
        await page
          .getByRole("button", { name: "Open navigation", exact: true })
          .click();
      const reference = await geometry(page),
        rows = await page.locator("tbody tr").count();
      expect(reference.displacement).toBeCloseTo(10, 2);
      expect(reference.rightGap).toBeCloseTo(14, 2);
      async function selectLanguage(language: Language) {
        if (
          width <= 900 &&
          (await page
            .locator("aside")
            .evaluate((n) => n.classList.contains("is-open")))
        ) {
          const rtl =
            (await page.locator("html").getAttribute("dir")) === "rtl";
          await page
            .locator(".nav-scrim")
            .click({ position: { x: rtl ? 10 : width - 10, y: 400 } });
        }
        await page
          .locator('select[aria-label="Language / اللغة"]')
          .selectOption(language);
        await expect(page.locator("html")).toHaveAttribute(
          "dir",
          language === "ar" ? "rtl" : "ltr",
        );
        if (width <= 900)
          await page
            .getByRole("button", {
              name: language === "ar" ? "فتح قائمة التنقل" : "Open navigation",
              exact: true,
            })
            .click();
        await expect
          .poll(() =>
            page
              .locator("aside")
              .evaluate((n) => Math.round(n.getBoundingClientRect().x)),
          )
          .toBe(language === "ar" ? width - 238 : 0);
      }
      const name = (language: Language) =>
        application === "invoicing"
          ? language === "ar"
            ? "المشتريات"
            : "Procurement"
          : language === "ar"
            ? "الفواتير"
            : "Invoicing";
      const destination = (language: Language) =>
        `http://localhost:${application === "invoicing" ? 4201 : 4200}/?demo=unmigrated-rtl&lang=${language}`;
      for (let cycle = 0; cycle < 5; cycle++)
        for (const language of ["ar", "en"] as const) {
          await selectLanguage(language);
          await expect(page.locator(targetSelector)).toHaveCount(1);
          await expect(
            page.locator('html[dir="rtl"] ' + targetSelector),
          ).toHaveCount(language === "ar" ? 1 : 0);
          const current = await geometry(page);
          expect(current.displacement).toBeCloseTo(
            language === "ar" ? -10 : 10,
            2,
          );
          expect(current.transform).toBe(
            language === "ar" ? "matrix(-1, 0, 0, 1, 0, 0)" : "none",
          );
          expect([current.width, current.height]).toEqual([15, 15]);
          expect(
            language === "ar" ? current.leftGap : current.rightGap,
          ).toBeCloseTo(reference.rightGap, 2);
          expect(
            language === "ar"
              ? current.centerFromLeft
              : current.centerFromRight,
          ).toBeCloseTo(reference.centerFromRight, 2);
          expect([
            current.path,
            current.bagPath,
            current.bagTransform,
            current.bagWidth,
            current.bagHeight,
          ]).toEqual([
            reference.path,
            reference.bagPath,
            reference.bagTransform,
            reference.bagWidth,
            reference.bagHeight,
          ]);
          expect(current.bagMatches).toBe(false);
          expect(current.href).toBe(destination(language));
          await expect(page.locator(".app-link")).toHaveAccessibleName(
            name(language),
          );
          expect(new URL(page.url()).pathname).toBe(route);
          await expect(page.locator("tbody tr")).toHaveCount(rows);
          if (application === "invoicing")
            await expect(
              page.locator(".MuiPaginationItem-root.Mui-selected"),
            ).toHaveText("2");
          else
            await expect(
              page.getByRole("combobox", {
                name: language === "ar" ? /^الحالة/ : /^Status/,
              }),
            ).toContainText(language === "ar" ? "معتمد" : "Approved");
        }
      // Targets retain their existing hardcoded origins. A production source page
      // does not establish the destination server's build mode or deployment setup.
      for (const language of ["en", "ar"] as const)
        for (const activation of ["pointer", "enter"] as const) {
          await page.goto(
            `${origin.origin}${route}?demo=unmigrated-rtl&lang=${language}`,
          );
          if (width <= 900)
            await page
              .getByRole("button", {
                name:
                  language === "ar" ? "فتح قائمة التنقل" : "Open navigation",
                exact: true,
              })
              .click();
          const link = page.getByRole("link", {
            name: name(language),
            exact: true,
          });
          await expect(link).toHaveAttribute("href", destination(language));
          if (activation === "pointer") await link.click();
          else {
            await link.focus();
            await expect(link).toBeFocused();
            await page.keyboard.press("Enter");
          }
          await expect(page).toHaveURL(destination(language));
          await expect(page.locator("html")).toHaveAttribute(
            "dir",
            language === "ar" ? "rtl" : "ltr",
          );
        }
    });
  }
