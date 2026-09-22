import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss, { type AtRule, type Container, type Document, type Rule } from "postcss";
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
 * WHERE a declaration sits, which is what decides whether forced colors ever
 * applies it.
 *
 * ⚠️ THIS FILE USED TO ASK ONLY WHAT A CLASS DECLARES, AND THAT COULD NOT FAIL
 * (DL18 layer 2, MED-3, proved green in its own worktree). The shared helper
 * files every rule under its class name whatever media query or state selector
 * wraps it, so `hover:border-4`, `print:border-4` and `forced-colors:border-4`
 * all read as "declares a 4px border", `text-primary-foreground` read as a
 * foreground paint, `border-none` beside the fix went unseen - and the clause
 * that looked for `@media (forced-colors: active)` never decided anything,
 * because the flat read had already said yes. Each of those stayed `3 passed`.
 *
 * So every declaration is PLACED here, by walking the emitted css with postcss:
 *
 *   - `unconditional` - a bare `.class` rule under no media query and no state
 *                       selector. It applies in every mode, forced colors too.
 *   - `forced`        - a bare `.class` rule inside `@media (forced-colors:
 *                       active)` and nothing else. The mode's own treatment.
 *   - `conditional`   - anything else: another media query (`print`, `hover`),
 *                       a pseudo on the selector (`:hover`), a nested rule. It
 *                       may never apply while the checked state is on screen.
 *
 * Only the first two can save a revealed element, and the helper stays as it is:
 * its flat view is the right instrument for the geometry every other reader of
 * it measures.
 */
type Placement = "unconditional" | "forced" | "conditional";
type Placed = { property: string; value: string; placement: Placement };

const BARE_CLASS = /^\.((?:\\.|[^\s.,:>+~(){}[\]])+)$/;

function placeAll(css: string): Map<string, Placed[]> {
  const out = new Map<string, Placed[]>();
  postcss.parse(css).walkDecls((decl) => {
    const media: string[] = [];
    let otherAt = false;
    let owner: Rule | null = null;
    let nested = false;
    for (
      let node: Container | Document | undefined = decl.parent;
      node && node.type !== "root" && node.type !== "document";
      node = node.parent
    ) {
      if (node.type === "atrule") {
        const at = node as AtRule;
        if (at.name === "media") media.push(at.params.replace(/\s+/g, " ").trim());
        else if (at.name !== "layer") otherAt = true;
      } else if (node.type === "rule") {
        const rule = node as Rule;
        if (
          owner === null &&
          /\.(?:\\.|[^\s.,:>+~(){}[\]])+/.test(rule.selector) &&
          !rule.selector.includes("&")
        ) {
          owner = rule;
        } else if (owner === null) {
          nested = true;
        }
      }
    }
    if (owner === null) return;
    const bare = BARE_CLASS.exec(owner.selector.trim());
    const placement: Placement =
      bare === null || nested || otherAt
        ? "conditional"
        : media.length === 0
          ? "unconditional"
          : media.length === 1 && media[0] === "(forced-colors: active)"
            ? "forced"
            : "conditional";
    for (const match of owner.selector.matchAll(/\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g)) {
      const name = match[1]!.replace(/\\(.)/g, "$1");
      const placed = out.get(name) ?? [];
      placed.push({ property: decl.prop, value: decl.value.trim(), placement });
      out.set(name, placed);
    }
  });
  return out;
}

/** Geometry, which forced colors does not touch. The Switch's whole mechanism. */
const MOVEMENT = ["translate", "transform", "rotate", "scale"] as const;

/** A border or outline style that paints nothing. */
const NO_STYLE = /^(?:none|hidden)$/;

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
  let placed: Map<string, Placed[]>;
  beforeAll(async () => {
    sheet = await loadCompiledSheet();
    placed = placeAll(sheet.css);
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

  /** What a token declares, flat - kept for the reads that are about a CLASS, not a mode. */
  const declares = (tokens: readonly string[], property: string): string[] =>
    sheet.declaredValues(tokens, property);

  /** The registered default of a `--tw-*` style property, read rather than typed. */
  const propertyInitial = (name: string): string | null => {
    const block = new RegExp(`@property\\s+${name}\\s*\\{([^}]*)\\}`).exec(sheet.css);
    const initial = block && /initial-value\s*:\s*([^;]+)/.exec(block[1]!);
    return initial ? initial[1]!.trim() : null;
  };

  /**
   * Whether a set of tokens PAINTS a foreground, counting only declarations whose
   * placement is one of `kinds`. The style half reads everything that applies in
   * forced mode (unconditional or forced), because a `border-none` anywhere on the
   * element kills a border declared anywhere else on it.
   *
   * ⚠️ THREE WAYS TO LOOK LIKE A PAINT AND NOT BE ONE, each a hole this file had:
   *   - a WIDTH OF ZERO (`border-0`): resolved through the sheet's length reader;
   *   - a width whose STYLE resolves to none (`border-none` beside it, or a
   *     `--tw-border-style` of none): Tailwind v4 writes the style through that
   *     variable, so it is resolved against the element's own tokens first and
   *     the registered initial value second;
   *   - `color` ON ITS OWN: it paints text and `currentColor`, and a dot has
   *     neither, so it is not in the set at all.
   */
  const paintsIn = (tokens: readonly string[], kinds: readonly Placement[]): boolean => {
    const all = tokens.flatMap((token) => placed.get(token) ?? []);
    const applies = all.filter((d) => d.placement !== "conditional");
    const mine = all.filter((d) => kinds.includes(d.placement));

    if (mine.some((d) => d.property === "stroke" && !NO_STYLE.test(d.value))) return true;

    for (const edge of ["border", "outline"] as const) {
      const variable = `--tw-${edge}-style`;
      const overrides = applies.filter((d) => d.property === variable).map((d) => d.value);
      const resolvedVar = overrides.some((v) => NO_STYLE.test(v))
        ? "none"
        : (overrides[0] ?? propertyInitial(variable) ?? "none");
      const isStyle = (d: Placed) => new RegExp(`^${edge}(?:-[a-z]+)*-style$`).test(d.property);
      const styles = applies
        .filter(isStyle)
        .map((d) => (d.value === `var(${variable})` ? resolvedVar : d.value));
      if (styles.length === 0 || styles.some((v) => NO_STYLE.test(v))) continue;
      const widths = mine.filter((d) => new RegExp(`^${edge}(?:-[a-z]+)*-width$`).test(d.property));
      if (widths.some((d) => (sheet.lengthPx(d.value) ?? 0) > 0)) return true;
    }
    return false;
  };

  /** Saved by the mode's own treatment: the paint sits inside `@media (forced-colors: active)`. */
  const savedUnderForcedColors = (tokens: readonly string[]): boolean =>
    paintsIn(tokens, ["forced"]);

  /** Saved in every mode: an unconditional foreground paint, which is `Checkbox`'s SVG stroke. */
  const savedUnconditionally = (tokens: readonly string[]): boolean =>
    paintsIn(tokens, ["unconditional"]);

  const moves = (tokens: readonly string[]): boolean =>
    MOVEMENT.some((property) => declares(tokens, property).length > 0);

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
    // ...and the placement walk CLASSIFIES, independent of any one fix: most of
    // the package is bare top-level utilities and a good share is behind a state
    // or a media query. (It does NOT count `forced` here - the only forced-colors
    // rule in the package is the fix itself, and an instrument anchor that failed
    // whenever a defect came back would report the defect as a broken reader.)
    const kinds = [...placed.values()].flat().map((d) => d.placement);
    expect(
      kinds.filter((k) => k === "unconditional").length,
      "the walk placed nothing unconditional",
    ).toBeGreaterThan(100);
    expect(
      kinds.filter((k) => k === "conditional").length,
      "the walk placed nothing conditional",
    ).toBeGreaterThan(10);
  });

  it("tells the mechanisms apart rather than passing everything", () => {
    // Without this the invariant could be satisfied by a predicate that returns
    // true, and the file would certify nothing. Each named part is pinned to the
    // mechanism it actually uses, read from the sheet.
    const tick = revealedSites().find((site) => site.file === "checkbox.tsx")!;
    expect(savedUnconditionally(tick.tokens), "the tick paints no unconditional stroke").toBe(true);
    expect(declares(tick.tokens, "background-color"), "the tick paints a background").toEqual([]);

    // The Switch reveals nothing - it MOVES - so it is not a revealed site at
    // all, and its mechanism is asserted where it lives. Movement does not save
    // a REVEALED element (an invisible thing that moves is still invisible), so
    // `moves` is not part of the invariant below.
    const thumb = readFileSync(resolve(process.cwd(), "packages/ui/src/switch.tsx"), "utf8");
    const thumbTokens = [...thumb.matchAll(/"([^"\n]*group-has-checked\/switch:[^"\n]*)"/g)]
      .flatMap((match) => match[1]!.split(/\s+/))
      .filter(Boolean);
    expect(moves(thumbTokens), "the switch thumb no longer moves on checked").toBe(true);
    expect(revealedSites().map((site) => site.file)).not.toContain("switch.tsx");

    // A border only counts while the registered style default paints.
    expect(propertyInitial("--tw-border-style"), "--tw-border-style has no solid default").toBe(
      "solid",
    );

    // ⚠️ THE BUCKET CUT, anchored on the PREDICATE'S behaviour rather than a
    // table asserted against itself: a background is not a foreground, a stroke
    // is, and `color` alone paints nothing on a box with no text.
    expect(
      savedUnconditionally(["bg-primary-foreground"]),
      "a background counts as a foreground",
    ).toBe(false);
    expect(savedUnconditionally(["stroke-primary-foreground"]), "a stroke no longer counts").toBe(
      true,
    );
    expect(savedUnconditionally(["text-primary-foreground"]), "color alone counts as a paint").toBe(
      false,
    );

    // ⚠️ AND THE PLACEMENT, which is MED-3 itself. Fix-independent first: a
    // `hover:` utility the package really ships (`button.tsx`) is placed behind
    // its state and is NOT unconditional - the exact shape that used to pass.
    const hover = placed.get("hover:border-border-strong") ?? [];
    expect(hover.length, "hover:border-border-strong did not compile").toBeGreaterThan(0);
    expect(
      hover.map((d) => d.placement),
      "a hover: rule reads as unconditional",
    ).not.toContain("unconditional");
    // Then the fix: it must read as the mode's own treatment and NOT as an
    // unconditional paint. This pin names TODAY'S mechanism; if `RadioGroup`
    // moves to another one (an SVG stroke, say), rewrite this pair, don't drop it.
    expect(
      savedUnderForcedColors(["forced-colors:border-4"]),
      "the fix is not placed under forced colors",
    ).toBe(true);
    expect(
      savedUnconditionally(["forced-colors:border-4"]),
      "a forced-colors rule reads as unconditional",
    ).toBe(false);
  });

  it("gives every revealed element a foreground or a forced-colors treatment", () => {
    const short: string[] = [];
    for (const site of revealedSites()) {
      const ok = savedUnderForcedColors(site.tokens) || savedUnconditionally(site.tokens);
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
