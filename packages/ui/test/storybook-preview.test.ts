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

/** A face as its complete, normalised declaration list - not a chosen five. */
type Face = { family: string; declarations: string[] };

function faces(css: string): Face[] {
  const out: Face[] = [];
  for (const block of css.matchAll(/@font-face\s*\{([^}]*)\}/g)) {
    const declarations: string[] = [];
    let family = "";
    for (const line of block[1]!.matchAll(/([a-z-]+)\s*:\s*([^;]+);/gi)) {
      const property = line[1]!.trim().toLowerCase();
      // The two sheets serve the same files from different paths on purpose (the
      // generated sheet is written next to `fonts/`, the preview is served from a
      // static directory), so the url is compared by FILENAME. Everything else -
      // including a descriptor neither file carries today, like `size-adjust` or
      // `ascent-override` - is compared as written.
      const value =
        property === "src"
          ? (/url\("[^"]*\/([^"/]+)"\)(.*)$/.exec(line[2]!.trim())?.slice(1).join(" ") ??
            line[2]!.trim())
          : line[2]!.trim().replace(/\s+/g, " ");
      if (property === "font-family") family = value;
      declarations.push(`${property}: ${value}`);
    }
    out.push({ family, declarations: declarations.sort() });
  }
  return out.sort((a, b) => a.family.localeCompare(b.family));
}

describe("the Storybook preview loads the faces the presets name", () => {
  it("found @font-face blocks in both files", () => {
    // Anchor: two empty lists are equal, and would prove nothing.
    expect(faces(emitted)).toHaveLength(3);
    expect(faces(preview)).toHaveLength(3);
  });

  it("declares the same three faces, every descriptor of each", () => {
    expect(faces(preview)).toEqual(faces(emitted));
  });

  it("would see a descriptor that exists on one side only", () => {
    // The instrument against its own violating sample: a five-name comparison was
    // blind to `size-adjust` and `ascent-override`, which change how the face renders.
    const withExtra = emitted.replace(
      "font-display: swap;",
      "font-display: swap;\n  size-adjust: 105%;",
    );
    expect(faces(withExtra)).not.toEqual(faces(emitted));
  });

  it("serves them from the static directory rather than the bundle", () => {
    expect(preview).toContain('url("/tokens/fonts/');
    // …and pulls the roles themselves from the package, not from a copy.
    expect(preview).toContain('@import "@marquee-ui/tokens/tokens.css"');
    expect(preview).toContain('@source "../packages/ui/src"');
  });
});
