import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

/**
 * `cn`'s theme list, checked against the stylesheet rather than against memory.
 *
 * tailwind-merge knows Tailwind's DEFAULT scales and nothing else, so every name
 * this design system adds to a size-ish namespace silently stops merging. A list
 * maintained by hand rots the first time the tokens package emits a new step - so
 * the names are read back out of `dist/tokens.css` here, and the check is
 * BEHAVIOURAL: for each emitted name, overriding it with a stock utility from the
 * same namespace must leave exactly the override.
 */

const TOKENS_CSS = resolve(process.cwd(), "packages/tokens/dist/tokens.css");
if (!existsSync(TOKENS_CSS)) {
  throw new Error(`tokens are not built: ${TOKENS_CSS} is missing. Run \`pnpm build\` first.`);
}
const css = readFileSync(TOKENS_CSS, "utf8");

/** Every `--<namespace>-<name>` declared in the sheet's `@theme*` blocks. */
function themeNames(namespace: string): string[] {
  const names = new Set<string>();
  for (const match of css.matchAll(new RegExp(`^\\s*--${namespace}-([a-z0-9-]+):`, "gim"))) {
    const name = match[1]!;
    // `--text-sm--line-height` is a modifier of `--text-sm`, not a step.
    if (!name.includes("--")) names.add(name);
  }
  return [...names].sort();
}

/**
 * namespace -> [how a utility is spelled, a stock utility of the same group that
 * must win when it comes second].
 */
const NAMESPACES: Readonly<Record<string, readonly [(name: string) => string, string]>> = {
  text: [(n) => `text-${n}`, "text-base"],
  leading: [(n) => `leading-${n}`, "leading-none"],
  tracking: [(n) => `tracking-${n}`, "tracking-normal"],
  shadow: [(n) => `shadow-${n}`, "shadow-none"],
  font: [(n) => `font-${n}`, "font-sans"],
  radius: [(n) => `rounded-${n}`, "rounded-none"],
  spacing: [(n) => `min-h-${n}`, "min-h-0"],
  container: [(n) => `max-w-${n}`, "max-w-none"],
  ease: [(n) => `ease-${n}`, "ease-linear"],
  color: [(n) => `bg-${n}`, "bg-transparent"],
};

describe("cn merges every name the tokens package emits", () => {
  it("read a real stylesheet with real namespaces in it", () => {
    // Anchor: an empty name list would make every assertion below vacuous.
    expect(css.length).toBeGreaterThan(3_000);
    expect(themeNames("text")).toContain("3xs");
    expect(themeNames("shadow")).toContain("lift");
    expect(themeNames("spacing")).toContain("hit");
    expect(themeNames("color").length).toBeGreaterThan(20);
  });

  for (const [namespace, [utility, stock]] of Object.entries(NAMESPACES)) {
    it(`--${namespace}-*`, () => {
      const names = themeNames(namespace);
      expect(names.length, `no --${namespace}-* names found`).toBeGreaterThan(0);
      const unmerged = names.filter((name) => cn(utility(name), stock) !== stock);
      expect(unmerged, `these --${namespace}-* names are missing from cn's theme list`).toEqual([]);
    });
  }

  it("does NOT merge two utilities that set different properties", () => {
    // The instrument's other edge: a merge list wide enough to eat a colour when a
    // size arrives would pass every assertion above.
    expect(cn("text-foreground", "text-sm")).toBe("text-foreground text-sm");
    expect(cn("text-3xs", "text-muted")).toBe("text-3xs text-muted");
  });
});
