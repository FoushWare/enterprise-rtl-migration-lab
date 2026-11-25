import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    environment: "node",
    include: ["tools/rtl-scanner/tests/**/*.test.ts"],
    // Isolates temporary candidate workspaces per run (see tests/support/temp-root.ts).
    globalSetup: ["tools/rtl-scanner/tests/support/temp-root.ts"],
  },
});
