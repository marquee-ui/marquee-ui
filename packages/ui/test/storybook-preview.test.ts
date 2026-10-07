import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const head = () => readFileSync(resolve(root, ".storybook/preview-head.html"), "utf8");
const preview = readFileSync(resolve(root, ".storybook/preview.css"), "utf8");
const settings = readFileSync(resolve(root, ".storybook/preview.ts"), "utf8");

function resolveFromWorkbench(path: string) {
  return new URL(path, "https://example.test/marquee-ui/storybook/iframe.html").pathname;
}

describe("the Storybook preview uses the published font sheet beneath its deployment path", () => {
  it("links the generated font sheet without copying preset descriptors", () => {
    const href = /<link[^>]+href="([^"]+fonts\.css)"/.exec(head())?.[1];
    expect(href, "the preview must link the emitted font sheet").toBeDefined();
    expect(resolveFromWorkbench(href!)).toBe("/marquee-ui/storybook/tokens/fonts.css");
    expect(preview).not.toContain("@font-face");
    expect(preview).toContain('@import "@marquee-ui/tokens/tokens.css"');
    expect(preview).toContain('@source "../packages/ui/src"');
  });

  it("loads the light preset inside the same workbench path", () => {
    const href = /const lightHref = "([^"]+)"/.exec(settings)?.[1];
    expect(href, "the light preset stylesheet must have a URL").toBeDefined();
    expect(resolveFromWorkbench(href!)).toBe("/marquee-ui/storybook/tokens/light.css");
  });
});
