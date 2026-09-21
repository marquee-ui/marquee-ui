import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import * as entry from "../src/index.js";

/**
 * THE PACKAGE'S PUBLIC ENTRY POINT, WHICH NOTHING OBSERVED (layer 1, HIGH-2).
 *
 * `packages/ui/package.json` declares `"exports": { ".": "./src/index.ts" }`, so
 * `src/index.ts` IS `@marquee-ui/ui`. Deleting two whole families' export blocks
 * from it left `pnpm test` at 25 files / 494 tests and `pnpm typecheck` at exit 0:
 * the registry ships each source file directly and never reads the barrel, and the
 * tokens' source walk only asserts the file exists, is over 100 B and contains the
 * word "export" - three properties an EMPTY barrel also has.
 *
 * The failure it lets through is a consumer's, not ours:
 * `import { Checkbox } from "@marquee-ui/ui"` throws
 * `does not provide an export named 'Checkbox'` in their build, not in this gate.
 *
 * It is a pre-existing hole that the choice slice enlarged by two families, and it
 * is closed for ALL of them at once rather than for the two: the check WALKS
 * `packages/ui/src` on disk - not a list anyone maintains, which is the mistake
 * this repository has made once already - parses each `export function` /
 * `export const` out of every part file, and requires the module to expose each
 * one. A new part cannot leave the barrel quietly, and neither can an old one.
 */

const ROOT = resolve(process.cwd());

/** Every `export function X` / `export const X` in one published source file. */
function exportedNames(relativePath: string): string[] {
  const text = readFileSync(resolve(ROOT, relativePath), "utf8");
  return [...text.matchAll(/^export (?:function|const) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map(
    (match) => match[1]!,
  );
}

/** Every part file on disk, so the check cannot fall behind a list. */
const PARTS = readdirSync(resolve(ROOT, "packages/ui/src"))
  .filter((name) => name.endsWith(".tsx"))
  .sort()
  .map((name) => `packages/ui/src/${name}`);

describe("the package's entry point exposes every published part", () => {
  it("found real sources and real exports to compare", () => {
    // Anchors, both of which an empty walk or an empty module would make vacuous.
    expect(PARTS.length).toBeGreaterThan(15);
    expect(Object.keys(entry).length).toBeGreaterThan(60);
  });

  it("re-exports every value each part file exports, by name", () => {
    const missing: string[] = [];
    let checked = 0;
    for (const path of PARTS) {
      for (const name of exportedNames(path)) {
        checked++;
        if (!(name in entry)) missing.push(`${path}: ${name}`);
      }
    }
    // Non-vacuous: a regex that matched nothing would report no absences.
    expect(checked).toBeGreaterThan(60);
    expect(missing).toEqual([]);
  });

  it("re-exports every TYPE each part file exports, by name", () => {
    // ⚠️ THE OTHER HALF OF THE SAME HOLE (layer 1, LOW-1, proved). The two arms
    // above read `Object.keys(entry)`, and a type is not a runtime key - so
    // deleting `type AvatarProps`, `type AvatarImageProps` and
    // `type AvatarBadgeProps` from the barrel left the suite at 29 files / 528
    // tests AND `pnpm typecheck` at exit 0, while a consumer's
    // `import type { AvatarProps } from "@marquee-ui/ui"` fails in THEIR build.
    // So this arm reads the barrel's SOURCE rather than the module: it is the
    // only instrument that can see a name that exists only at compile time.
    const barrel = readFileSync(resolve(ROOT, "packages/ui/src/index.ts"), "utf8");
    const reexported = new Set<string>();
    for (const block of barrel.matchAll(/export\s*\{([^}]*)\}\s*from/g)) {
      for (const member of block[1]!.split(",")) {
        const token = member.trim().replace(/^type\s+/, "");
        if (token !== "")
          reexported.add(
            token
              .split(/\s+as\s+/)
              .pop()!
              .trim(),
          );
      }
    }
    const declared = PARTS.flatMap((path) => {
      const text = readFileSync(resolve(ROOT, path), "utf8");
      return [...text.matchAll(/^export (?:type|interface) ([A-Za-z_][A-Za-z0-9_]*)/gm)].map(
        (match) => `${path}: ${match[1]!}`,
      );
    });
    // Anchors: an empty barrel parse or an empty type list would make the
    // comparison below vacuous in either direction.
    expect(reexported.size).toBeGreaterThan(60);
    expect(declared.length).toBeGreaterThan(15);
    expect(declared.filter((id) => !reexported.has(id.split(": ")[1]!))).toEqual([]);
  });

  it("exports nothing that no part file declares", () => {
    // The other direction, so a barrel cannot grow a name with no source behind
    // it - a stale re-export survives a deleted part and only fails at a
    // consumer's build.
    const declared = new Set([
      ...PARTS.flatMap(exportedNames),
      ...exportedNames("packages/ui/src/lib/utils.ts"),
    ]);
    expect(Object.keys(entry).filter((name) => !declared.has(name))).toEqual([]);
  });
});
