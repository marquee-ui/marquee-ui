import { describe, expect, it } from "vitest";
import { sourceFiles, storyFiles } from "./helpers/source-files.js";

/**
 * D7: no product vocabulary in the library.
 *
 * The list is COPIED from the consuming app's single source of truth for brand
 * strings - `apps/web/src/config/brand.ts` in the private repo, read at commit
 * `a60d6801` on 2026-09-14 - because that file cannot be imported from here. If a
 * string is added there, it is added here by hand; that is the cost of the two repos
 * being separate, and it is why the list names its source.
 *
 * `mark.lead` ("the") and `mark.accent` ("pile") are the two halves of the wordmark.
 * "the" is ordinary English and is not scannable; the concatenation and the bare
 * second half are both here.
 */
const BRAND_STRINGS = [
  "thepile",
  "thepile.gg",
  "The player-authentic social game tracker.",
  "Pile Score",
  "Players' Choice",
  "Must-Play",
];

/** `pile` as a standalone word: a class name, a variable, a comment. */
const BRAND_WORD = /\bpile\b/i;

describe("brand guard", () => {
  // Source AND stories: a story is the public workbench and the docs site's
  // source, so it is exactly where a consuming product's noun arrives unnoticed.
  const files = [...sourceFiles(), ...storyFiles()];

  it("has source to scan and an instrument that can see it", () => {
    // Anchor first: a guard whose walker returned nothing would pass in silence.
    expect(files.length).toBeGreaterThanOrEqual(8);
    expect(files.some((f) => f.rel.endsWith("packages/tokens/src/roles.ts"))).toBe(true);
    expect(files.some((f) => f.rel.endsWith("packages/ui/src/button.tsx"))).toBe(true);
    expect(files.some((f) => f.rel.endsWith("packages/ui/stories/button.stories.tsx"))).toBe(true);
    expect(files.filter((f) => f.text.includes("definePreset")).length).toBeGreaterThan(0);
  });

  it("ships no brand string of the consuming app", () => {
    const offenders: string[] = [];
    for (const file of files) {
      const haystack = file.text.toLowerCase();
      for (const brand of BRAND_STRINGS) {
        if (haystack.includes(brand.toLowerCase())) offenders.push(`${file.rel}: "${brand}"`);
      }
      if (BRAND_WORD.test(file.text)) offenders.push(`${file.rel}: the wordmark's second half`);
    }
    expect(offenders).toEqual([]);
  });
});
