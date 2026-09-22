import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";

/**
 * A CONTROL'S CHECKED STATE HAS TO SURVIVE `forced-colors: active`.
 *
 * `focus-outline.test.tsx` derives the same shape of invariant for the focus
 * RING; this is its sibling for STATE, and it exists because the ring guard
 * could not see the hole. Forced colors is not a palette swap: the UA collapses
 * every paint into two buckets, a FOREGROUND (`color`, `stroke`, `border-color`,
 * `outline-color`) forced to `CanvasText` and a BACKGROUND (`background-color`)
 * forced to `Canvas`. Author values in both buckets are discarded, so two
 * elements that differ only in `background-color` become the SAME colour, and
 * one drawn on top of the other disappears.
 *
 * That is why the three choice families in this package pass or fail for three
 * different reasons, and why none of them could be read off a class name:
 *
 *   - `Checkbox`   the tick is an SVG `stroke` -> forced to CanvasText, on a
 *                  Canvas box. Visible.
 *   - `Switch`     the thumb MOVES (`translate`). Geometry is not forced at all.
 *                  Visible.
 *   - `RadioGroup` the dot was `bg-primary-foreground` on a `bg-primary` circle,
 *                  i.e. background on background -> Canvas on Canvas. INVISIBLE,
 *                  and measured as such by the consuming product before this
 *                  guard existed: the checked and unchecked circles hashed
 *                  IDENTICAL, while the native radio they replaced did not.
 *
 * WHAT IS CHECKED, as a rule rather than a list: an element REVEALED by the
 * checked state - `opacity-0` flipped to `opacity-100` under a checked variant -
 * must paint with something the mode keeps as a foreground, or declare its own
 * treatment under a `forced-colors:` variant. A revealed element whose only
 * paint is `background-color` cannot be seen, however many colours it names.
 *
 * ⚠️ IT READS THE COMPILED SHEET, NOT THE CLASS NAMES. `stroke-primary-foreground`
 * and `bg-primary-foreground` are one character apart and declare different
 * properties; only the emitted CSS says which bucket a utility lands in. The
 * fixture compiles with `source(none)` over `src` and `stories`, so a utility a
 * TEST mentions cannot compile itself into existence and pass this file.
 */

/**
 * Properties forced colors keeps as a FOREGROUND, i.e. paints in `CanvasText`
 * where a background lands in `Canvas`. A revealed element needs one of these,
 * or geometry, to be distinguishable from whatever it sits on.
 *
 * `border-color` and `outline-color` are deliberately NOT here on their own: a
 * colour with no width paints nothing, and the width is what this reads. The
 * same cut is why `background-color` cannot appear at all - it is the bucket the
 * problem is made of.
 */
const FOREGROUND_PAINT = ["stroke", "color", "border-width", "outline-width"] as const;

/** Geometry, which forced colors does not touch. The Switch's whole mechanism. */
const MOVEMENT = ["translate", "transform", "rotate", "scale"] as const;

/**
 * A part whose revealed element is knowingly short, with the reason. Empty, and
 * kept empty on purpose: the entry EXPIRES against the arm below, so the next
 * part that must ship short has somewhere honest to say so and cannot leave the
 * excuse behind after the fix. `focus-outline.test.tsx`'s `KNOWN_GAPS` is the
 * same device and fired for real once.
 */
const KNOWN_GAPS: Readonly<Record<string, string>> = {};

type Site = { file: string; tokens: string[] };

describe("a checked state survives forced-colors: active", () => {
  let sheet: CompiledSheet;
  beforeAll(async () => {
    sheet = await loadCompiledSheet();
  });

  /**
   * Every class STRING in the package that REVEALS an element on checked. Only
   * string literals, never a comment: a docblock naming a utility would
   * otherwise invent a site, and Tailwind reads the same literals this does.
   */
  const revealedSites = (): Site[] => {
    const dir = resolve(process.cwd(), "packages/ui/src");
    const sites: Site[] = [];
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".tsx"))) {
      const source = readFileSync(resolve(dir, file), "utf8");
      for (const match of source.matchAll(/"([^"\n]*)"/g)) {
        const tokens = match[1]!.split(/\s+/).filter(Boolean);
        const hidden = tokens.includes("opacity-0");
        const revealed = tokens.some((t) =>
          /^group-has-(?:checked|aria-checked)\/.+:opacity-100$/.test(t),
        );
        if (hidden && revealed) sites.push({ file, tokens });
      }
    }
    return sites;
  };

  /** What a token declares, with its variant prefix stripped for the lookup. */
  const declares = (tokens: readonly string[], property: string): string[] =>
    sheet.declaredValues(tokens, property);

  const paintsAForeground = (tokens: readonly string[]): boolean =>
    FOREGROUND_PAINT.some((property) => declares(tokens, property).length > 0);

  const moves = (tokens: readonly string[]): boolean =>
    MOVEMENT.some((property) => declares(tokens, property).length > 0);

  /**
   * A treatment the mode itself opted into. The rule has to sit inside
   * `@media (forced-colors: active)` in the EMITTED css - a token merely named
   * `forced-colors:…` proves nothing, because the guard would then pass on a
   * class Tailwind never compiled.
   */
  /**
   * The registered default for `--tw-border-style`, read rather than typed.
   * ⚠️ A WIDTH IS NOT A BORDER. Tailwind v4 emits `border-4` as
   * `border-style: var(--tw-border-style); border-width: 4px`, and a 4px border
   * whose style resolved to `none` paints exactly as much as no border at all -
   * which is the same trap `focus-outline.test.tsx` reads the outline property
   * for. So the bucket test below is only worth something while this is `solid`.
   */
  const borderStyleDefault = (): string | null => {
    const block = /@property\s+--tw-border-style\s*\{([^}]*)\}/.exec(sheet.css);
    const initial = block && /initial-value\s*:\s*([^;]+)/.exec(block[1]!);
    return initial ? initial[1]!.trim() : null;
  };

  const declaresUnderForcedColors = (tokens: readonly string[]): boolean =>
    tokens.some((token) => {
      if (!token.startsWith("forced-colors:")) return false;
      const escaped = token.replace(/[.[\]()/\\]/g, "\\$&").replace(/:/g, "\\:");
      const block = new RegExp(
        `@media\\s*\\(forced-colors\\s*:\\s*active\\)[^{]*\\{(?:[^{}]|\\{[^{}]*\\})*\\.${escaped}[\\s,{]`,
      );
      return block.test(sheet.css) && sheet.has(token);
    });

  it("found a sheet and the revealed elements to measure", () => {
    // Anchors first. A walk that returned nothing, or a sheet that compiled
    // nothing, would make every assertion below true of an empty set.
    expect(sheet.css.length, "the compile produced no css").toBeGreaterThan(1000);
    const sites = revealedSites();
    expect(
      sites.length,
      "no part reveals anything on checked: the walk found nothing",
    ).toBeGreaterThanOrEqual(2);
    expect(sites.map((site) => site.file)).toContain("checkbox.tsx");
    expect(sites.map((site) => site.file)).toContain("radio-group.tsx");
    // ...and the walk reads STRINGS, so it must not have picked up the docblock
    // in `radio-group.tsx` that spells `group-has-checked/radio:ring-2` in prose.
    for (const site of sites) {
      expect(site.tokens, `${site.file} site`).not.toContain("on");
    }
  });

  it("tells the two passing mechanisms apart rather than passing everything", () => {
    // Without this the invariant could be satisfied by a predicate that returns
    // true, and the file would certify nothing. Each named part is pinned to the
    // mechanism it actually uses, read from the sheet.
    const tick = revealedSites().find((site) => site.file === "checkbox.tsx")!;
    expect(declares(tick.tokens, "stroke").length, "the tick paints no stroke").toBeGreaterThan(0);
    expect(declares(tick.tokens, "background-color"), "the tick paints a background").toEqual([]);

    // The Switch reveals nothing - it MOVES - so it is not a revealed site at
    // all, and its mechanism is asserted where it lives.
    const thumb = readFileSync(resolve(process.cwd(), "packages/ui/src/switch.tsx"), "utf8");
    const thumbTokens = [...thumb.matchAll(/"([^"\n]*group-has-checked\/switch:[^"\n]*)"/g)]
      .flatMap((match) => match[1]!.split(/\s+/))
      .filter(Boolean);
    expect(moves(thumbTokens), "the switch thumb no longer moves on checked").toBe(true);
    expect(revealedSites().map((site) => site.file)).not.toContain("switch.tsx");

    // ...and a border declared under `forced-colors:` only counts while the
    // registered style default paints. Read from the sheet, never typed.
    expect(borderStyleDefault(), "--tw-border-style has no solid default").toBe("solid");
  });

  it("gives every revealed element a foreground or a forced-colors treatment", () => {
    const short: string[] = [];
    for (const site of revealedSites()) {
      const ok =
        paintsAForeground(site.tokens) ||
        moves(site.tokens) ||
        declaresUnderForcedColors(site.tokens);
      const gap = KNOWN_GAPS[site.file];
      if (gap !== undefined) {
        expect(
          ok,
          `${site.file} now survives forced colors: delete its KNOWN_GAPS entry, the defect it excuses is fixed`,
        ).toBe(false);
        expect(gap.length, `${site.file}'s gap needs a reason`).toBeGreaterThan(80);
        continue;
      }
      if (!ok) {
        const background = declares(site.tokens, "background-color");
        short.push(
          `${site.file}: revealed on checked, paints background-color ${JSON.stringify(background)} and nothing the mode keeps`,
        );
      }
    }
    expect(
      short,
      "a part reveals an element on checked whose only paint is a background, so under forced-colors: active it is Canvas on Canvas and the checked state is INVISIBLE. Give it a border or an outline under a forced-colors: variant, or draw it as an SVG stroke, or declare it in KNOWN_GAPS with a reason",
    ).toEqual([]);
  });
});
