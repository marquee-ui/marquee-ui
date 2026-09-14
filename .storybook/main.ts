import { fileURLToPath } from "node:url";
import type { StorybookConfig } from "@storybook/react-vite";
import tailwind from "@tailwindcss/vite";

const config: StorybookConfig = {
  stories: ["../packages/*/stories/**/*.stories.tsx"],
  framework: { name: "@storybook/react-vite", options: {} },
  // The whole emitted directory: the faces the presets name, and `light.css`,
  // which the toolbar toggle links in at runtime. Serving the directory rather
  // than importing the file keeps `light.css`'s own `./fonts/*` urls correct.
  staticDirs: [{ from: "../packages/tokens/dist", to: "/tokens" }],
  viteFinal: (config) => ({
    ...config,
    plugins: [...(config.plugins ?? []), tailwind()],
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        "@": fileURLToPath(new URL("../packages/ui/src", import.meta.url)),
      },
    },
  }),
};

export default config;
