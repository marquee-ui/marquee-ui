import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The preview's `@font-face` block is a COPY, and a copy rots.
 *
 * It exists because Tailwind inlines an `@import` without rebasing the urls
 * inside it, so the generated sheet's `url("./fonts/*.woff2")` would resolve
 * against the bundled stylesheet rather than against the file it was written
 * into. The preview therefore re-declares the three faces at the path
 * `staticDirs` serves them from - and if a preset ever changes a face, or its
 * weight range, the preview would keep rendering the old one with nothing to say
 * so. This reads both files and compares the descriptors.
 */

const root = process.cwd();
const emitted = readFileSync(resolve(root, "packages/tokens/dist/tokens.css"), "utf8");
const preview = readFileSync(resolve(root, ".storybook/preview.css"), "utf8");

type Face = { family: string; style: string; weight: string; display: string; file: string };

function faces(css: string): Face[] {
  const out: Face[] = [];
  for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const body = block[1]!;
    const read = (property: string) =>
      new RegExp(`${property}:\\s*([^;]+);`).exec(body)?.[1]?.trim() ?? "";
    out.push({
      family: read("font-family"),
      style: read("font-style"),
      weight: read("font-weight"),
      display: read("font-display"),
      file: /url\("[^"]*\/([^"/]+\.woff2)"\)/.exec(body)?.[1] ?? "",
    });
  }
  return out.sort((a, b) => a.family.localeCompare(b.family));
}

describe("the Storybook preview loads the faces the presets name", () => {
  it("found @font-face blocks in both files", () => {
    // Anchor: two empty lists are equal, and would prove nothing.
    expect(faces(emitted)).toHaveLength(3);
    expect(faces(preview)).toHaveLength(3);
  });

  it("declares the same three faces, descriptor for descriptor", () => {
    expect(faces(preview)).toEqual(faces(emitted));
  });

  it("serves them from the static directory rather than the bundle", () => {
    expect(preview).toContain('url("/tokens/fonts/');
    // …and pulls the roles themselves from the package, not from a copy.
    expect(preview).toContain('@import "@marquee-ui/tokens/tokens.css"');
    expect(preview).toContain('@source "../packages/ui/src"');
  });
});
