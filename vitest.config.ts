import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@atlas/design-system": resolve("libs/design-system/src/index.tsx"),
      "@atlas/shared": resolve("libs/shared/src/index.ts"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.test.tsx"],
    setupFiles: ["tests/setup.ts"],
  },
});
