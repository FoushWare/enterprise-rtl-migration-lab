/**
 * Reuse the browser assertions against built application previews. Separate output
 * directories distinguish production evidence from development-server results.
 */
import { defineConfig } from "@playwright/test";
import development from "./playwright.config";

export default defineConfig({
  ...development,
  outputDir: "test-results-production",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-production-report" }],
  ],
  webServer: [
    {
      command:
        "npx vite preview --config apps/invoicing/vite.config.ts --host 127.0.0.1 --port 4200 --strictPort",
      url: "http://127.0.0.1:4200",
      reuseExistingServer: false,
    },
    {
      command:
        "npx vite preview --config apps/procurement/vite.config.ts --host 127.0.0.1 --port 4201 --strictPort",
      url: "http://127.0.0.1:4201",
      reuseExistingServer: false,
    },
  ],
});
