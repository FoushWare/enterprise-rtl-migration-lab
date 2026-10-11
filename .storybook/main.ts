import type { StorybookConfig } from "@storybook/react-vite";
import { resolve } from "node:path";
const config: StorybookConfig = {
  stories: ["../libs/design-system/src/**/*.stories.tsx"],
  framework: "@storybook/react-vite",
  async viteFinal(config) {
    config.resolve = {
      ...config.resolve,
      alias: { "@atlas/shared": resolve("libs/shared/src/index.ts") },
    };
    return config;
  },
};
export default config;
