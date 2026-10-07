import { cpSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const root = new URL("../../../", import.meta.url);
const workbench = new URL("storybook-static/", root);
const destination = new URL("apps/docs/dist/storybook/", root);
if (!existsSync(new URL("index.html", workbench))) {
  throw new Error("Build Storybook before assembling the documentation site.");
}
cpSync(fileURLToPath(workbench), fileURLToPath(destination), { recursive: true });
// Preserve the OFL notices alongside every distributed copy of the font files.
const fonts = new URL("packages/tokens/fonts/", root);
for (const target of ["apps/docs/dist/fonts/", "apps/docs/dist/storybook/tokens/fonts/"]) {
  cpSync(fileURLToPath(fonts), fileURLToPath(new URL(target, root)), { recursive: true });
}
