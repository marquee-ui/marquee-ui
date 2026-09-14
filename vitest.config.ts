import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const uiSrc = fileURLToPath(new URL("./packages/ui/src", import.meta.url));

/**
 * One spelling for every project's include, because the projects split by
 * ENVIRONMENT and a split include is how a test file ends up collected by nobody.
 * Both extensions on purpose: a `.test.tsx` that lands in a `.test.ts`-only project
 * runs green by never running at all.
 * `packages/tokens/test/project-coverage.test.ts` asserts that every package which
 * has a test directory is named by one of the projects below.
 */
export const TEST_GLOB = (pkg: string) => `packages/${pkg}/test/**/*.test.{ts,tsx}`;

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: "tokens",
          include: [TEST_GLOB("tokens")],
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
          include: [TEST_GLOB("ui")],
          environment: "jsdom",
          setupFiles: ["packages/ui/test/setup.ts"],
        },
      },
    ],
  },
});
