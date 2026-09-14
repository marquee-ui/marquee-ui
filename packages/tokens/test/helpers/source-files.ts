import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

/** Repo root, from this file's own location. */
export const repoRoot = fileURLToPath(new URL("../../../../", import.meta.url));

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".css", ".json", ".mjs"];

function walk(dir: string, out: string[]): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (SOURCE_EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(full);
  }
  return out;
}

/**
 * Every file the packages publish, listed rather than counted.
 *
 * A floor ("at least 8 files") cannot tell a complete walk from a walk that silently
 * skipped a directory, and a guard that scans 9 of 15 files passes while a brand
 * string and a hex literal ship in the other 6 - measured, not imagined. So the walk
 * is CHECKED against this list and throws on any difference in either direction.
 * Adding a source file means adding it here, and that edit is the review.
 */
export const PUBLISHED_SOURCE_FILES = [
  "packages/tokens/src/build.ts",
  "packages/tokens/src/checks/contrast.ts",
  "packages/tokens/src/checks/distinctness.ts",
  "packages/tokens/src/checks/index.ts",
  "packages/tokens/src/checks/types.ts",
  "packages/tokens/src/emit/css.ts",
  "packages/tokens/src/emit/dtcg.ts",
  "packages/tokens/src/font-metrics.ts",
  "packages/tokens/src/index.ts",
  "packages/tokens/src/presets/arcade.ts",
  "packages/tokens/src/presets/light.ts",
  "packages/tokens/src/resolve.ts",
  "packages/tokens/src/roles.ts",
  "packages/tokens/src/skeleton.ts",
  "packages/tokens/src/tokens.ts",
  "packages/ui/src/accordion.tsx",
  "packages/ui/src/badge.tsx",
  "packages/ui/src/button.tsx",
  "packages/ui/src/card.tsx",
  "packages/ui/src/index.ts",
  "packages/ui/src/input.tsx",
  "packages/ui/src/label.tsx",
  "packages/ui/src/lib/utils.ts",
  "packages/ui/src/ribbon.css",
  "packages/ui/src/ribbon.tsx",
  "packages/ui/src/separator.tsx",
  "packages/ui/src/sheet.tsx",
  "packages/ui/src/toast.tsx",
] as const;

/**
 * Every story file, listed the same way and for the same reason.
 *
 * Stories are not published, so the literal guard leaves them alone - a story may
 * paint a swatch. The BRAND guard does not: a story is the public workbench and
 * the docs site's source, so it is exactly where a consuming product's noun would
 * arrive without anyone noticing.
 */
export const STORY_FILES = [
  "packages/ui/stories/accordion.stories.tsx",
  "packages/ui/stories/badge.stories.tsx",
  "packages/ui/stories/button.stories.tsx",
  "packages/ui/stories/card.stories.tsx",
  "packages/ui/stories/input.stories.tsx",
  "packages/ui/stories/label.stories.tsx",
  "packages/ui/stories/ribbon.stories.tsx",
  "packages/ui/stories/separator.stories.tsx",
  "packages/ui/stories/sheet.stories.tsx",
  "packages/ui/stories/toast.stories.tsx",
] as const;

/**
 * Every file under `packages/<pkg>/src`, which is what the package PUBLISHES.
 * `test/` is deliberately outside the scan: a test may name what the package was
 * ported from, a shipped file may not.
 *
 * Throws rather than returning a short list, so a walk that lost a directory reddens
 * every guard that depends on it instead of quietly narrowing them.
 */
export type ScannedFile = { path: string; rel: string; text: string };

function walkPackageDir(
  subdir: string,
  expectedList: readonly string[],
  label: string,
): ScannedFile[] {
  const packagesDir = join(repoRoot, "packages");
  const files: string[] = [];
  for (const pkg of readdirSync(packagesDir)) {
    const dir = join(packagesDir, pkg, subdir);
    try {
      if (statSync(dir).isDirectory()) walk(dir, files);
    } catch {
      continue;
    }
  }
  const found = files.map((path) => ({
    path,
    rel: relative(repoRoot, path).split(sep).join("/"),
    text: readFileSync(path, "utf8"),
  }));

  const walked = found.map((file) => file.rel).sort();
  const expected: string[] = [...expectedList].sort();
  const missing = expected.filter((rel) => !walked.includes(rel));
  const unexpected = walked.filter((rel) => !expected.includes(rel));
  if (missing.length > 0 || unexpected.length > 0) {
    throw new Error(
      `${label} walk does not match the declared set (root ${repoRoot}). ` +
        `Missing: [${missing.join(", ")}]. Unexpected: [${unexpected.join(", ")}]. ` +
        `A new ${label} file must be added to its list in test/helpers/source-files.ts.`,
    );
  }
  return found;
}

export function sourceFiles(): ScannedFile[] {
  return walkPackageDir("src", PUBLISHED_SOURCE_FILES, "source");
}

/** Every story file, walked and checked exactly like the published sources. */
export function storyFiles(): ScannedFile[] {
  return walkPackageDir("stories", STORY_FILES, "story");
}

/**
 * Removes block and line comments. The literal guard runs on what the package can
 * PAINT: a colour in prose cannot set a pixel, and the evidence for a threshold has
 * to be allowed to sit next to the threshold.
 */
export function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}
