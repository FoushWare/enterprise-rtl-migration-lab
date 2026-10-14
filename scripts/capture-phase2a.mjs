import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { platform, release, arch } from "node:os";
const output = resolve("docs/screenshots/phase-2a");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || "chromium" });
const scenarios = [
  ["overview", 4200, "/"],
  ["invoices", 4200, "/invoices"],
  ["invoice-details", 4200, "/invoices/INV-2026-1048"],
  ["create", 4200, "/invoices/new"],
  ["create-focused", 4200, "/invoices/new"],
  ["create-validation", 4200, "/invoices/new"],
  ["customer-menu", 4200, "/invoices/new"],
  ["confirmation", 4200, "/invoices/new"],
  ["customers", 4200, "/customers"],
  ["customer-dialog", 4200, "/customers"],
  ["settings", 4200, "/settings"],
  ["orders", 4201, "/"],
  ["order-menu", 4201, "/"],
  ["order-details", 4201, "/orders/PO-2026-401"],
  ["procurement-settings", 4201, "/settings"],
];
const manifest = {
  generatedAt: new Date().toISOString(), browser: browser.version(),
  environment: { platform: platform(), release: release(), arch: arch(), locale: "en-US", timezone: "UTC", colorScheme: "light", fonts: "existing system stack; no remote font", animations: "disabled", data: "fresh contexts; original seed records; no business storage writes" },
  captures: [],
};
try {
  for (const width of [1440, 390]) {
    const viewport = { width, height: width === 390 ? 844 : 1000 };
    for (const language of ["en", "ar"]) {
      const extra = width === 390 ? [["invoicing-navigation", 4200, "/"], ["procurement-navigation", 4201, "/"], ["invoices-scroll-end", 4200, "/invoices"], ["orders-scroll-end", 4201, "/"]] : [];
      for (const [state, port, route] of [...scenarios, ...extra]) {
        const context = await browser.newContext({ viewport, locale: "en-US", timezoneId: "UTC", colorScheme: "light" });
        const page = await context.newPage();
        const errors = [];
        page.on("pageerror", (error) => errors.push(error.message));
        const url = `http://127.0.0.1:${port}${route}?demo=unmigrated-rtl&lang=${language}`;
        const word = (english, arabic) => language === "ar" ? arabic : english;
        const steps = ["Open URL in a fresh browser context", "Wait for heading, document fonts and initial render"];
        await page.goto(url);
        await page.getByRole("heading", { level: 1 }).waitFor();
        await page.evaluate(() => document.fonts.ready);
        if (state === "create-focused") {
          await page.getByLabel(word("Description 1", "الوصف 1"), { exact: true }).focus();
          steps.push("Focus Description 1 (empty)");
        }
        if (state === "create-validation") {
          await page.getByRole("button", { name: word("Review invoice", "مراجعة الفاتورة") }).click();
          steps.push("Submit empty form with Review invoice");
        }
        if (state === "customer-menu" || state === "confirmation") {
          await page.getByRole("combobox", { name: word("Customer", "العميل"), exact: true }).click();
          steps.push("Open Customer menu");
          if (state === "confirmation") {
            await page.getByRole("option", { name: "Northstar Studio" }).click();
            await page.getByLabel(word("Description 1", "الوصف 1"), { exact: true }).fill("ورشة استراتيجية");
            await page.getByLabel(word("Quantity 1", "الكمية 1"), { exact: true }).fill("2");
            await page.getByLabel(word("Rate 1", "السعر 1"), { exact: true }).fill("1500");
            await page.getByRole("button", { name: word("Review invoice", "مراجعة الفاتورة") }).click();
            await page.getByRole("dialog").waitFor();
            steps.push("Select Northstar Studio; description=ورشة استراتيجية; quantity=2; rate=1500; dates=2026-10-11/2026-11-10; USD", "Click Review invoice; do not create/save");
          }
        }
        if (state === "order-menu") {
          await page.getByRole("combobox", { name: new RegExp(`^${word("Status", "الحالة")}`) }).click();
          steps.push("Open Status menu");
        }
        if (state === "customer-dialog") {
          await page.getByRole("button", { name: word("View customer", "عرض العميل") }).first().click();
          await page.getByRole("dialog").waitFor();
          steps.push("Open first customer using View customer");
        }
        if (state.endsWith("navigation")) {
          await page.getByRole("button", { name: word("Open navigation", "فتح قائمة التنقل") }).click();
          steps.push("Open mobile navigation");
        }
        if (state.endsWith("scroll-end")) {
          await page.locator(".table-scroll").evaluate((node) => { node.scrollLeft = document.documentElement.dir === "rtl" ? -node.scrollWidth : node.scrollWidth; });
          steps.push("Scroll table to opposite horizontal extreme (RTL negative scrollLeft; LTR positive)");
        }
        // Allow MUI transitions to settle; disables animations in screenshot as well.
        await page.waitForTimeout(350);
        const evidence = await page.evaluate(() => {
          const rect = (node) => { const r = node.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; };
          const inspect = (selector) => [...document.querySelectorAll(selector)].map((node) => ({ text: node.textContent, rect: rect(node), direction: getComputedStyle(node).direction, textAlign: getComputedStyle(node).textAlign, marginLeft: getComputedStyle(node).marginLeft, marginRight: getComputedStyle(node).marginRight }));
          const dialog = document.querySelector('[role="dialog"]');
          const listbox = document.querySelector('[role="listbox"]');
          return {
            root: { lang: document.documentElement.lang, dir: document.documentElement.dir, scrollWidth: document.documentElement.scrollWidth, viewportWidth: innerWidth },
            sidebar: inspect("aside"), brand: inspect(".brand, .brand-mark, .brand-period"),
            kpis: inspect(".kpi-label, .kpi-icon"), months: inspect(".chart-labels span"), endpoint: inspect(".chart-wrap circle"),
            headers: inspect("thead th"), fields: inspect(".MuiInputLabel-root, .MuiFormHelperText-root, .MuiSelect-icon"),
            dialog: inspect('[role="dialog"], .MuiDialogTitle-root, .MuiDialogTitle-root button'),
            portal: { dialogOutsideRoot: dialog ? !document.getElementById("root").contains(dialog) : null, listboxOutsideRoot: listbox ? !document.getElementById("root").contains(listbox) : null, listboxDirection: listbox ? getComputedStyle(listbox).direction : null },
            tables: [...document.querySelectorAll(".table-scroll")].map((node) => ({ scrollLeft: node.scrollLeft, scrollWidth: node.scrollWidth, clientWidth: node.clientWidth })),
            summary: inspect(".page-heading p, .MuiDialogContent-root p"),
          };
        });
        const filename = `${state}-${width === 390 ? "mobile" : "desktop"}-${language}.png`;
        await page.screenshot({ path: resolve(output, filename), fullPage: !state.endsWith("navigation") && !["confirmation", "customer-dialog", "customer-menu", "order-menu"].includes(state), animations: "disabled" });
        manifest.captures.push({ state, application: port === 4200 ? "invoicing" : "procurement", language, viewport, url, filename, steps, errors, evidence });
        await context.close();
        console.log(filename);
      }
    }
  }
} finally { await browser.close(); }
await writeFile(resolve(output, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
const escape = (text) => text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const groups = [...new Set(manifest.captures.map((capture) => capture.state))];
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Atlas Phase 2A screenshot gallery</title><style>body{font:16px system-ui;margin:24px;background:#f3f5f8;color:#243047}nav{display:flex;flex-wrap:wrap;gap:12px}section{margin:32px 0}.frames{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px}figure{margin:0;background:white;padding:12px;border:1px solid #d7dce5}img{width:100%;height:450px;object-fit:contain;object-position:top;background:#eee}figcaption{margin:8px 0}a{color:#3546a0}details{font-size:13px}code{overflow-wrap:anywhere}</style><h1>Phase 2A — Unmigrated RTL</h1><p>Documentary captures, not RTL correctness baselines. Click an image for full resolution. Arabic frames retain the legacy LTR theme, styles and geometry.</p><p>${escape(manifest.browser)} Chromium · en-US browser · UTC · 1440×1000 / 390×844 · ${manifest.generatedAt}</p><p><a href="manifest.json">Reproduction steps and measured evidence (JSON)</a></p><nav>${groups.map((state) => `<a href="#${state}">${state}</a>`).join("")}</nav>${groups.map((state) => `<section id="${state}"><h2>${state}</h2><div class="frames">${manifest.captures.filter((c) => c.state === state).map((c) => `<figure><figcaption>${c.application} · ${c.viewport.width}px · ${c.language === "ar" ? "Arabic — Unmigrated RTL" : "English comparison"}</figcaption><a href="${c.filename}"><img loading="lazy" src="${c.filename}" alt="${state} ${c.language} ${c.viewport.width}px"></a><details><summary>Reproduce</summary><p><a href="${escape(c.url)}">Open application state</a></p><ol>${c.steps.map((step) => `<li>${escape(step)}</li>`).join("")}</ol></details></figure>`).join("")}</div></section>`).join("")}</html>`;
await writeFile(resolve(output, "index.html"), html);
console.log(`Saved ${manifest.captures.length} captures, manifest and gallery to ${output}`);
