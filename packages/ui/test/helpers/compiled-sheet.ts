import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

/**
 * The COMPILED stylesheet, as an instrument.
 *
 * Every geometry claim in this package is read out of the real emitted CSS
 * rather than off a class name: `min-h-hit` cannot say what height it produces,
 * and a variant that lost it looks identical in jsdom. The fixture
 * (`test/fixtures/compile.css`) opens `@import "tailwindcss" source(none)` and
 * names `src` and `stories` as its only sources, so a utility a TEST mentions
 * cannot compile itself into existence.
 *
 * ⚠️ It is a MODULE rather than a third copy of the same forty lines.
 * `switch-drawing.test.tsx` and `tailwind-compile.test.tsx` each carried their
 * own, and the package has already paid once for one idea living in two files it
 * could disagree with (the story suites map, layer 1 of the Switch, MED-2). Both
 * were moved onto this module in DL14 (DL13's decision 12, a REQUEST the next
 * library stream was asked to honour), so there is ONE resolver now and the four
 * readers cannot disagree about what a length is.
 */
export interface CompiledSheet {
  /** The emitted CSS, verbatim. */
  css: string;
  /** Every declaration body of every rule whose selector uses this class. */
  rule(name: string): string;
  /** Every selector this class appears in. */
  selectorsOf(name: string): string[];
  /**
   * Whether the compile emitted a rule for this class AT ALL.
   *
   * ⚠️ Not `rule(name) !== ""`, and the difference WOULD be real: a class whose
   * rule body is empty - a variant that declares nothing, a `@media` shell -
   * compiles and would read as absent. It is defensive rather than instrumented,
   * and layer 1 (LOW-2) measured exactly how defensive: reverting this to
   * `rule(name) !== ""` leaves the suite green, and a probe for a class with an
   * empty body in the compiled sheet returns `[]`. So it is written this way
   * because the walk is the honest source, not because anything today can tell
   * the two apart. The set is filled by the same walk that fills the
   * declarations, so the two cannot disagree about what exists.
   */
  has(name: string): boolean;
  /** Custom properties declared in the sheet's own `:root` blocks. */
  rootVars(): Map<string, string>;
  /** A CSS length in px, resolving `var()` and Tailwind's `calc()` spacing shape. */
  lengthPx(value: string): number | null;
  /** The px a set of classes declares for one property, or null if none does. */
  declared(classes: readonly string[], property: string): number | null;
  /** Every value the sheet declares for one property across a class list. */
  declaredValues(classes: readonly string[], property: string): string[];
  /** The sheet with `@layer` blocks unwrapped, which is what jsdom can apply. */
  flattened(): string;
}

export async function loadCompiledSheet(): Promise<CompiledSheet> {
  const fixture = resolve(process.cwd(), "packages/ui/test/fixtures/compile.css");
  if (!existsSync(fixture)) throw new Error(`compile fixture not found at ${fixture}`);
  const result = await postcss([tailwind()]).process(readFileSync(fixture, "utf8"), {
    from: fixture,
  });
  const css = result.css;

  const declarations = new Map<string, string[]>();
  const selectors = new Map<string, string[]>();
  const emitted = new Set<string>();
  postcss.parse(css).walkRules((node) => {
    const body = node.nodes
      .map((child) => child.toString())
      .join("; ")
      .trim();
    for (const match of node.selector.matchAll(/\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g)) {
      const name = match[1]!.replace(/\\(.)/g, "$1");
      emitted.add(name);
      declarations.set(name, [...(declarations.get(name) ?? []), body]);
      selectors.set(name, [...(selectors.get(name) ?? []), node.selector]);
    }
  });

  const rule = (name: string): string => declarations.get(name)?.join(" ") ?? "";

  const rootVars = (): Map<string, string> => {
    const vars = new Map<string, string>();
    for (const block of css.matchAll(/:root\s*(?:,[^{]*)?\{([^}]*)\}/g)) {
      for (const line of block[1]!.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
        if (!vars.has(line[1]!)) vars.set(line[1]!, line[2]!.trim());
      }
    }
    return vars;
  };

  /** Null when the value is not a length, so a property nobody declared cannot read as 0. */
  const lengthPx = (value: string): number | null => {
    const vars = rootVars();
    const resolved = value
      .replace(/var\((--[a-z0-9-]+)\)/gi, (_, name: string) => vars.get(name) ?? "")
      .trim();
    const plain = /^(-?\d*\.?\d+)(px|rem)$/.exec(resolved);
    if (plain) return Number(plain[1]) * (plain[2] === "rem" ? 16 : 1);
    // BOTH operand orders, and this is INSTRUMENTED rather than latent:
    // `choice-drawing.test.tsx:84` pins `lengthPx("calc(6 * 0.25rem)")` at 24
    // explicitly, and deleting the second regex reddens it with
    // `expected null to be 24` (layer 1, LOW-3, run - the comment this replaces
    // said "latent today", which stopped being true the day that arm was added).
    const scaled =
      /^calc\(\s*(-?\d*\.?\d+)(px|rem)\s*\*\s*(-?\d*\.?\d+)\s*\)$/.exec(resolved) ??
      /^calc\(\s*(-?\d*\.?\d+)\s*\*\s*(-?\d*\.?\d+)(px|rem)\s*\)$/.exec(resolved);
    if (!scaled) return null;
    const [a, b, c] = [scaled[1]!, scaled[2]!, scaled[3]!];
    return /^\d/.test(b)
      ? Number(a) * Number(b) * (c === "rem" ? 16 : 1)
      : Number(a) * Number(c) * (b === "rem" ? 16 : 1);
  };

  const declaredValues = (classes: readonly string[], property: string): string[] => {
    const out: string[] = [];
    for (const token of classes) {
      for (const match of rule(token).matchAll(
        new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`, "g"),
      )) {
        out.push(match[1]!.trim());
      }
    }
    return out;
  };

  const declared = (classes: readonly string[], property: string): number | null => {
    for (const value of declaredValues(classes, property)) {
      const px = lengthPx(value);
      if (px !== null) return px;
    }
    return null;
  };

  /**
   * jsdom implements no cascade LAYERS and Tailwind 4 emits every utility inside
   * `@layer utilities`, so an unflattened sheet applies NOTHING: measured on this
   * tree, injecting the compiled sheet as-is left a switch track at
   * `position: static` and `background-color: rgba(0, 0, 0, 0)` - not one rule
   * applied. Unwrapping is the only thing done to it - every selector and every
   * declaration is the compiler's own, so nothing here can conjure a rule the
   * build does not ship - and it is faithful for every rule INSIDE a layer, which
   * is every rule these tests read.
   *
   * It is not faithful in general: after flattening, specificity decides where
   * layer order used to, and this sheet carries two UNLAYERED class rules
   * (`.mq-marquee`) whose precedence it therefore inverts (`switch-drawing`'s
   * layer 1, LOW-1). No class any of the readers measures touches them.
   */
  const flattened = (): string => {
    const root = postcss.parse(css);
    let unwrapped = 0;
    root.walkAtRules("layer", (at) => {
      unwrapped++;
      if (at.nodes && at.nodes.length > 0) at.replaceWith(at.nodes);
      else at.remove();
    });
    if (unwrapped === 0)
      throw new Error("no @layer in the compiled sheet: flattening is measuring nothing");
    return root.toString();
  };

  return {
    css,
    rule,
    selectorsOf: (name) => selectors.get(name) ?? [],
    has: (name) => emitted.has(name),
    rootVars,
    lengthPx,
    declared,
    declaredValues,
    flattened,
  };
}
