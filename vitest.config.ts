import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const uiSrc = fileURLToPath(new URL("./packages/ui/src", import.meta.url));

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "tokens",
          include: ["packages/tokens/test/**/*.test.ts"],
          environment: "node",
        },
      },
      {
        // `@/…` is the alias the registry ships components under, so the library
        // resolves it the same way a consumer's tsconfig does.
        resolve: { alias: { "@": uiSrc } },
        plugins: [react()],
        test: {
          name: "ui",
          include: ["packages/ui/test/**/*.test.{ts,tsx}"],
          environment: "jsdom",
          setupFiles: ["packages/ui/test/setup.ts"],
        },
      },
    ],
  },
});
