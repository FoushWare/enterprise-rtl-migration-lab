/**
 * Exercise both Vite applications under fixed browser locale, timezone, and viewport.
 * Visual comparisons deliberately allow zero differing pixels; do not relax this
 * tolerance to conceal direction or native-control rendering differences.
 */
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: "http://127.0.0.1:4200",
    channel: process.env.PLAYWRIGHT_CHANNEL || "chromium",
    viewport: { width: 1440, height: 1000 },
    locale: "en-US",
    timezoneId: "UTC",
    colorScheme: "light",
  },
  expect: { toHaveScreenshot: { maxDiffPixels: 0 } },
  webServer: [
    {
      command: "npx vite --config apps/invoicing/vite.config.ts",
      url: "http://127.0.0.1:4200",
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "npx vite --config apps/procurement/vite.config.ts",
      url: "http://127.0.0.1:4201",
      reuseExistingServer: !process.env.CI,
    },
  ],
});
