import { describe, expect, it } from "vitest";
import {
  PUBLISHED_SOURCE_FILES,
  STORY_FILES,
  repoRoot,
  sourceFiles,
  storyFiles,
  stripComments,
} from "./helpers/source-files.js";

/**
 * The walker the brand and literal guards both stand on. If it returns the wrong SET
 * - short by a directory, or empty - both guards pass while scanning nothing, so its
 * coverage is asserted here rather than anchored on a count.
 */
describe("published source coverage", () => {
  it("walks exactly the published set, by path", () => {
    expect(
      sourceFiles()
        .map((file) => file.rel)
        .sort(),
    ).toEqual([...PUBLISHED_SOURCE_FILES].sort());
  });

  it("walks exactly the declared stories, by path", () => {
    expect(
      storyFiles()
        .map((file) => file.rel)
        .sort(),
    ).toEqual([...STORY_FILES].sort());
  });

  it("reads real content for every one of them", () => {
    // A walk that found the paths but read nothing would scan empty strings clean.
    // 100 bytes, because the smallest published file is `checks/types.ts` at 197.
    for (const file of [...sourceFiles(), ...storyFiles()]) {
      expect(file.text.length, file.rel).toBeGreaterThan(100);
      // A stylesheet has no exports; what it must have is at least one real rule.
      const shape = file.rel.endsWith(".css") ? /\{[^}]*:[^}]*\}/ : /\bexport\b/;
      expect(file.text, file.rel).toMatch(shape);
    }
  });

  it("resolves a repo root that actually contains the packages", () => {
    expect(repoRoot.endsWith("/")).toBe(true);
    expect(sourceFiles()[0]!.path.startsWith(repoRoot)).toBe(true);
  });

  it("stripComments removes comments and keeps code", () => {
    const source = 'const a = 1; /* #ffffff */\n// thepile\nconst b = "#e4ff3a";';
    const stripped = stripComments(source);
    expect(stripped).toContain('const b = "#e4ff3a";');
    expect(stripped).not.toContain("#ffffff");
    expect(stripped).not.toContain("thepile");
  });
});
