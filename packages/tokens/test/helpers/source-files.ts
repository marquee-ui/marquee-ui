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
 * Every file under `packages/<pkg>/src`, which is what the package PUBLISHES.
 * `test/` is deliberately outside the scan: a test may name what the package was
 * ported from, a shipped file may not.
 */
export function sourceFiles(): { path: string; rel: string; text: string }[] {
  const packagesDir = join(repoRoot, "packages");
  const files: string[] = [];
  for (const pkg of readdirSync(packagesDir)) {
    const src = join(packagesDir, pkg, "src");
    try {
      if (statSync(src).isDirectory()) walk(src, files);
    } catch {
      continue;
    }
  }
  return files.map((path) => ({
    path,
    rel: relative(repoRoot, path).split(sep).join("/"),
    text: readFileSync(path, "utf8"),
  }));
}

/**
 * Removes block and line comments. The literal guard runs on what the package can
 * PAINT: a colour in prose cannot set a pixel, and the evidence for a threshold has
 * to be allowed to sit next to the threshold.
 */
export function stripComments(text: string): string {
  return text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
}
