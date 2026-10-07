import { defineConfig } from "@playwright/test";

const port = Number(process.env.DOCS_PORT ?? 4177);
export default defineConfig({
  testDir: "./browser",
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  reporter: "list",
  outputDir: process.env.DOCS_BROWSER_OUTPUT ?? "../../.docs-browser-results",
  use: { baseURL: `http://localhost:${port}/marquee-ui/`, trace: "retain-on-failure" },
  projects: [
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 } } },
    { name: "tablet", use: { browserName: "chromium", viewport: { width: 768, height: 1024 } } },
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
  ],
  webServer: {
    command: `pnpm exec vite preview --host 127.0.0.1 --port ${port} --strictPort`,
    url: `http://localhost:${port}/marquee-ui/`,
    reuseExistingServer: false,
  },
});
