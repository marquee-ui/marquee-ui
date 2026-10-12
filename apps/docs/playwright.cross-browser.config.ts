import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

// Focused release QA; source-copy checks use Chromium clipboard permissions.
// WebKit here is the Playwright Linux engine, not a real Safari/iOS device run.
export default defineConfig({
  ...base,
  testMatch: [
    "slider.spec.ts",
    "calendar.spec.ts",
    "date-picker.spec.ts",
    "select.spec.ts",
    "combobox.spec.ts",
    "dialog.spec.ts",
    "alert-dialog.spec.ts",
    "theme.spec.ts",
    "touch.spec.ts",
  ],
  grepInvert: /@clipboard/,
  projects: (["firefox", "webkit"] as const).flatMap((browserName) =>
    [
      { name: "mobile", viewport: { width: 390, height: 844 } },
      { name: "tablet", viewport: { width: 768, height: 1024 } },
      { name: "desktop", viewport: { width: 1280, height: 900 } },
    ].map(({ name, viewport }) => ({
      name: `${name}-${browserName}`,
      use: { browserName, viewport },
    })),
  ),
});
