import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss, { type AtRule, type Container, type Document, type Rule } from "postcss";
import ts from "typescript";
import { beforeAll, describe, expect, it } from "vitest";

import { toggleClass } from "@/toggle";
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
 *   - `Checkbox`   the tick is an SVG `stroke`. This file said the mode forces
 *                  it to CanvasText. MEASURED in headless Chromium (DL21) it does
 *                  not: the computed `stroke` stays the author's
 *                  `--primary-foreground`, rgb(10, 11, 7) on the rgb(0, 0, 0)
 *                  Canvas of a dark forced palette. Visible only in a light one.
 *   - `Switch`     the thumb MOVES (`translate`), and geometry is not forced -
 *                  but the thumb paints only a `background-color`, so it moves
 *                  Canvas on Canvas: checked and unchecked were pixel-IDENTICAL
 *                  in both forced palettes, button host and label host (DL21).
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
 * AND A SECOND KIND OF SITE (DL21): a STATE the element HOLDS - `aria-pressed`,
 * `aria-checked`, `:checked`, `data-state`, read off the compiled selector -
 * drawn on it by declarations that are ALL colour or shadow. The mode forces or
 * drops every one of them, so the two states are one picture unless something
 * the mode keeps tells them apart: the element's own `forced-colors:<state>:`
 * treatment changing a kept property (a width, an outline), or a SIBLING in the
 * same part file that changes under the same state in something the mode keeps
 * (it moves, it is revealed) AND paints a foreground the mode keeps. That last
 * clause is the Switch's hole: its thumb moves, and paints nothing. `Toggle`'s
 * pressed square was the site this kind was written for (DL20 decision 13).
 *
 * ⚠️ ONE READING DIFFERS BETWEEN THE TWO KINDS, ON PURPOSE AND ON THE RECORD. The
 * revealed-element arms below count ANY stroke as a paint the mode keeps; the
 * state arms count a stroke only when it is `currentcolor`, which the mode forces
 * through `color`. The measurement above is why; the revealed-element arms' own
 * reading is a behaviour this file's owner did not hold the batch it was measured,
 * so it is REQUESTed, not edited (`docs/as-built.md`, DESIGN-LIB-d-fcstate-dropdown).
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
type Placement = "unconditional" | "forced" | "state" | "forced-state" | "conditional";
/**
 * `state` is the compiled selector's condition after the utility's own class
 * (`[aria-pressed="true"]`, `:is(:where(.group\/switch):has(:checked) *)`) for
 * the two held-state kinds, and null for every other placement.
 */
type Placed = { property: string; value: string; placement: Placement; state: string | null };

const BARE_CLASS = /^\.((?:\\.|[^\s.,:>+~(){}[\]])+)$/;

/**
 * THE TWO HELD-STATE PLACEMENTS (DL21), added beside the three above rather than
 * carved out of them:
 *
 *   - `state`        - `.utility` followed by a HELD STATE and nothing else, under
 *                      no media query. It applies in every mode while the element
 *                      is in that state.
 *   - `forced-state` - the same, inside `@media (forced-colors: active)` and
 *                      nothing else: the mode's own treatment OF THAT STATE
 *                      (`forced-colors:aria-pressed:border-4`).
 *
 * A held state is read off the COMPILED condition, not the variant's spelling:
 * an ARIA state a control selects between (`[aria-pressed]`, `[aria-checked]`,
 * `[aria-selected]`, `[aria-expanded]`, `[aria-current]`), `:checked` (which is
 * how `group-has-checked/…:` arrives), `[data-state]` or `[open]`. NOT a held
 * state: a negation (`not-aria-pressed:` is the REST state), an interaction
 * (`:hover`, `:focus…`, `:active`), a selector list, or a static axis such as
 * `[data-orientation]`. Both kinds are filed under the utility's own class only;
 * every other placement keeps its old filing, so no existing reader moves (the
 * revealed-element arms never read a held-state rule: they were `conditional`).
 */
const LEADING_CLASS = /^\.((?:\\.|[^\s.,:>+~(){}[\]])+)/;
const HELD_STATE =
  /\[aria-(?:checked|pressed|selected|expanded|current)(?:="[^"]*")?\]|:checked\b|\[data-state(?:="[^"]*")?\]|\[open\]/;
const NOT_HELD = /:not\(|:(?:hover|focus|active)\b|,/;
const FORCED_MEDIA = "(forced-colors: active)";

function heldState(selector: string): { name: string; state: string } | null {
  const lead = LEADING_CLASS.exec(selector);
  if (lead === null) return null;
  const state = selector.slice(lead[0].length);
  if (state === "" || !HELD_STATE.test(state) || NOT_HELD.test(state)) return null;
  return { name: lead[1]!.replace(/\\(.)/g, "$1"), state };
}

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
    const held = nested || otherAt ? null : heldState(owner.selector.trim());
    if (
      held !== null &&
      (media.length === 0 || (media.length === 1 && media[0] === FORCED_MEDIA))
    ) {
      const placed = out.get(held.name) ?? [];
      placed.push({
        property: decl.prop,
        value: decl.value.trim(),
        placement: media.length === 0 ? "state" : "forced-state",
        state: held.state,
      });
      out.set(held.name, placed);
      return;
    }
    const bare = BARE_CLASS.exec(owner.selector.trim());
    const placement: Placement =
      bare === null || nested || otherAt
        ? "conditional"
        : media.length === 0
          ? "unconditional"
          : media.length === 1 && media[0] === FORCED_MEDIA
            ? "forced"
            : "conditional";
    for (const match of owner.selector.matchAll(/\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g)) {
      const name = match[1]!.replace(/\\(.)/g, "$1");
      const placed = out.get(name) ?? [];
      placed.push({ property: decl.prop, value: decl.value.trim(), placement, state: null });
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
 * What forced colors overrides or drops, plus custom properties, which paint
 * nothing by themselves: a state drawn ONLY in these is one picture in the mode.
 * The twin of `toggle-drawing.test.tsx`'s constant of the same name (CSS Color
 * Adjust 1, "properties affected by forced colors mode"); a test module cannot
 * import another's, so the two are spelled alike on purpose.
 */
const FORCED_BY_THE_MODE =
  /^(?:color|background-color|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-color|outline-color|text-decoration-color|column-rule-color|caret-color|accent-color|fill|stroke|box-shadow|text-shadow|scrollbar-color|--.+)$/;

/**
 * Whether a `stroke` value is a paint the mode keeps.
 *
 * ⚠️ `authorStroke` IS THE REVEALED-ELEMENT ARMS' READING, and it is the default
 * so that nothing they assert moves: any stroke that is not `none`. The state
 * arms pass `false`, which counts only `currentcolor` - the mode forces `color`,
 * and a `currentcolor` stroke follows it (measured: rgb(255, 255, 255) on the
 * dark palette's black), where an author colour is left as it was (measured:
 * the Checkbox tick's rgb(10, 11, 7), on black).
 */
const strokePaints = (value: string, authorStroke: boolean): boolean =>
  !NO_STYLE.test(value) && (authorStroke || /^currentcolor$/i.test(value));

/**
 * A part whose revealed element is knowingly short, with the reason. Empty, and
 * kept empty on purpose: the entry EXPIRES against the arm below, so the next
 * part that must ship short has somewhere honest to say so and cannot leave the
 * excuse behind after the fix. `focus-outline.test.tsx`'s `KNOWN_GAPS` is the
 * same device and fired for real once.
 */
const KNOWN_GAPS: Readonly<Record<string, string>> = {};

/**
 * A STATE drawn in colour alone that knowingly ships short, keyed
 * `"<file> <variant>"`, with the reason. The same expiring device as
 * `KNOWN_GAPS`: an entry fails the moment its site survives the mode, and one
 * whose site no longer exists fails too. Every entry here is a PART defect that
 * this test file cannot fix - `packages/ui/src/**` belonged to the 0.1.5 pack
 * point the batch these were measured in - and each is REQUESTed for 0.1.6.
 */
const KNOWN_STATE_GAPS: Readonly<Record<string, string>> = {
  "switch.tsx group-aria-checked/switch":
    "the button host's track draws checked as border-primary + bg-primary, and its thumb carries the state by MOVING - but the thumb paints only a background, Canvas on the track's Canvas: checked and unchecked hashed IDENTICAL in headless Chromium under forced colors, dark palette aee70fc72f4e and light 005e818e4050 (DL21, $BATCH_SCRATCH/s3/fc-probe); a hand-written 8px thumb border separated them. REQUEST for 0.1.6: a forced-colors: treatment on the thumb",
  "switch.tsx group-has-checked/switch":
    "the label host's track, the same drawing as the button host's and the same measurement: pixel-IDENTICAL checked and unchecked in both forced palettes, because the moving thumb is Canvas on Canvas (DL21). REQUEST for 0.1.6, one fix for both hosts since the thumb's string is shared",
  "checkbox.tsx group-has-checked/checkbox":
    "the box draws checked as border-primary + bg-primary, and the revealed tick carries the state with an SVG stroke in the author colour --primary-foreground, which Chromium does NOT force: rgb(10, 11, 7) on the rgb(0, 0, 0) Canvas of a dark forced palette, 45 near-black pixels (DL21); a currentColor stroke under forced colors drew it white. REQUEST for 0.1.6: forced-colors:stroke-current on the tick",
};

type Site = { file: string; tokens: string[] };

/** A held state drawn on one element: the element's string, the compiled condition and its spelling. */
type StateSite = {
  file: string;
  tokens: string[];
  state: string;
  variant: string;
  properties: string[];
};

/** Every `.tsx` in the package's source directory: the parts, and nothing a test wrote. */
const partFiles = (): string[] =>
  readdirSync(resolve(process.cwd(), "packages/ui/src")).filter((name) => name.endsWith(".tsx"));

/**
 * Every STRING LITERAL in a source text, split into tokens - read by the
 * TypeScript scanner, so a comment is never a literal whatever quotes it holds.
 * (Until DL21 this was a regex over double-quoted runs, which read a quoted
 * class in a comment as a site and never read a single-quoted or template one.)
 * The static chunks of a template with substitutions are read too; the dynamic
 * ones generate no CSS, which `switch.tsx` says in its own docblock.
 */
function literalsOf(source: string): string[][] {
  const file = ts.createSourceFile(
    "part.tsx",
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const out: string[][] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node)
    ) {
      const tokens = node.text.split(/\s+/).filter(Boolean);
      if (tokens.length > 0) out.push(tokens);
    }
    ts.forEachChild(node, visit);
  };
  visit(file);
  return out;
}

const literals = (file: string): string[][] =>
  literalsOf(readFileSync(resolve(process.cwd(), "packages/ui/src", file), "utf8"));

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
    const sites: Site[] = [];
    for (const file of partFiles()) {
      for (const tokens of literals(file)) {
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
  const paintsIn = (
    tokens: readonly string[],
    kinds: readonly Placement[],
    // DL21: the held state the element is IN (its `state`/`forced-state` rules
    // join the read; without one they are never read, which is the old view),
    // and the stroke reading (`strokePaints`). Both default to what the
    // revealed-element arms have always asked.
    { state, authorStroke = true }: { state?: string; authorStroke?: boolean } = {},
  ): boolean => {
    const all = tokens
      .flatMap((token) => placed.get(token) ?? [])
      .filter((d) => d.state === null || d.state === state);
    const applies = all.filter((d) => d.placement !== "conditional");
    const mine = all.filter((d) => kinds.includes(d.placement));

    if (mine.some((d) => d.property === "stroke" && strokePaints(d.value, authorStroke)))
      return true;

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

  /** The held states one element's own tokens draw, each with its declarations and its spelling. */
  const statesOf = (
    tokens: readonly string[],
  ): Map<string, { variant: string; decls: Placed[] }> => {
    const out = new Map<string, { variant: string; decls: Placed[] }>();
    for (const token of tokens) {
      for (const d of placed.get(token) ?? []) {
        if (d.placement !== "state" || d.state === null) continue;
        const entry = out.get(d.state) ?? {
          variant: token.slice(0, token.lastIndexOf(":")),
          decls: [],
        };
        entry.decls.push(d);
        out.set(d.state, entry);
      }
    }
    return out;
  };

  /**
   * Every element in the package that draws a HELD STATE in colour or shadow
   * alone - the second kind of site. From the part files' string literals
   * (`literals`), each placed through the compiled sheet: what the state
   * declares is the sheet's, never the class name's.
   */
  const colourOnlySites = (): StateSite[] => {
    const sites = new Map<string, StateSite>();
    for (const file of partFiles()) {
      for (const tokens of literals(file)) {
        for (const [state, { variant, decls }] of statesOf(tokens)) {
          if (!decls.every((d) => FORCED_BY_THE_MODE.test(d.property))) continue;
          const key = `${file} ${tokens.join(" ")} ${state}`;
          if (sites.has(key)) continue;
          const properties = [...new Set(decls.map((d) => d.property))];
          sites.set(key, { file, tokens: [...tokens], state, variant, properties });
        }
      }
    }
    return [...sites.values()];
  };

  const lengthOrValue = (value: string): number | string => sheet.lengthPx(value) ?? value;

  /**
   * The element's OWN treatment of the state: a `forced-colors:<state>:`
   * declaration of something the mode keeps that CHANGES it from the element's
   * rest drawing - a 4px frame over a 2px one - on an element that, in that
   * state, still paints a foreground the mode keeps. A treatment equal to the
   * rest (`border-2` over `border-2`) tells the two states apart by nothing.
   */
  const ownTreatment = (tokens: readonly string[], state: string): Placed[] => {
    const all = tokens.flatMap((token) => placed.get(token) ?? []);
    const rest = all.filter((d) => d.placement === "unconditional" || d.placement === "forced");
    const changes = all
      .filter((d) => d.placement === "forced-state" && d.state === state)
      .filter((d) => !FORCED_BY_THE_MODE.test(d.property))
      .filter((d) => {
        const before = rest.filter((r) => r.property === d.property).at(-1);
        return before === undefined || lengthOrValue(before.value) !== lengthOrValue(d.value);
      });
    const paints = paintsIn(tokens, ["unconditional", "forced", "forced-state"], {
      state,
      authorStroke: false,
    });
    return paints ? changes : [];
  };

  type Sibling = { tokens: string[]; changes: string[]; paints: boolean };

  /**
   * Every OTHER element in the same part file that changes under the same state
   * in something the mode keeps (it moves; it is revealed), and whether it
   * paints a foreground the mode keeps. A sibling that changes and paints
   * carries the state; one that changes and paints nothing is Canvas on Canvas
   * however far it moves (the Switch's thumb).
   */
  const siblingsOf = (site: StateSite): Sibling[] =>
    literals(site.file)
      .filter((tokens) => tokens.join(" ") !== site.tokens.join(" "))
      .flatMap((tokens) => {
        const changes = tokens
          .flatMap((token) => placed.get(token) ?? [])
          .filter((d) => d.placement === "state" && d.state === site.state)
          .map((d) => d.property)
          .filter((property) => !FORCED_BY_THE_MODE.test(property));
        if (changes.length === 0) return [];
        const paints = paintsIn(tokens, ["unconditional", "forced", "forced-state"], {
          state: site.state,
          authorStroke: false,
        });
        return [{ tokens, changes: [...new Set(changes)], paints }];
      });

  const classify = (site: StateSite) => {
    const own = ownTreatment(site.tokens, site.state);
    const siblings = siblingsOf(site);
    return { own, siblings, saved: own.length > 0 || siblings.some((s) => s.paints) };
  };

  const siteNamed = (sites: readonly StateSite[], file: string, variant: string): StateSite => {
    const found = sites.filter((s) => s.file === file && s.variant === variant);
    expect(found.length, `the walk found no colour-only ${variant} site in ${file}`).toBe(1);
    return found[0]!;
  };

  it("found the states drawn only in colour, from the literals, placed by the sheet", () => {
    // Anchors first, as above: an invariant over an empty set of sites is true.
    // The READER, on a text written here: a comment holding a quoted class is
    // not a literal, whichever quotes it wears; a template's static text is.
    expect(
      literalsOf('// "aria-pressed:bg-primary"\n/* "b:c" */\nconst a = "d e";\nconst t = `f`;'),
      "the literal reader read a comment, or missed a literal",
    ).toEqual([["d", "e"], ["f"]]);

    const sites = colourOnlySites();
    expect(
      sites.length,
      "no part draws a held state in colour: the walk found nothing",
    ).toBeGreaterThanOrEqual(4);
    // The site this kind exists for, read WHOLE from its literal: the part's own string.
    const pressed = siteNamed(sites, "toggle.tsx", "aria-pressed");
    expect(pressed.tokens, "toggle.tsx's site is not toggleClass").toEqual(
      toggleClass.split(/\s+/),
    );
    expect(pressed.state).toBe('[aria-pressed="true"]');
    expect([...pressed.properties].sort(), "what the pressed state draws").toEqual(
      ["background-color", "border-color", "box-shadow", "color", "--tw-shadow"].sort(),
    );
    // ...and the Switch's track, once per host, under two different conditions.
    const button = siteNamed(sites, "switch.tsx", "group-aria-checked/switch");
    const label = siteNamed(sites, "switch.tsx", "group-has-checked/switch");
    expect(button.tokens).toEqual(label.tokens);
    expect(button.state).not.toBe(label.state);

    // The PLACEMENT, fix-independent: a held state is `state`, the rest state
    // under hover is not, and a static axis is not a state at all.
    const at = (token: string) => (placed.get(token) ?? []).map((d) => [d.placement, d.state]);
    expect(
      at("aria-pressed:bg-primary"),
      "aria-pressed:bg-primary is not placed as a held state",
    ).toEqual([["state", '[aria-pressed="true"]']]);
    expect(
      at("not-aria-pressed:hover:border-muted").map(([placement]) => placement),
      "the unpressed hover reads as a held state",
    ).toEqual(["conditional"]);
    expect(
      at("data-[orientation=horizontal]:w-full").map(([placement]) => placement),
      "an orientation reads as a held state",
    ).toEqual(["conditional"]);

    // ...and the classifier looked for carriers: the Switch's thumb, found as a
    // sibling that MOVES under the same condition as the track it sits in.
    for (const track of [button, label]) {
      const thumb = classify(track).siblings;
      expect(thumb.length, `${track.variant}: the thumb was not found as a sibling`).toBe(1);
      expect(thumb[0]!.changes, `${track.variant}: the thumb no longer moves`).toContain(
        "translate",
      );
    }
  });

  it("tells the carriers apart rather than passing everything", () => {
    const sites = colourOnlySites();
    const toggleState = '[aria-pressed="true"]';
    // Each named part is pinned to the mechanism it uses today, read from the
    // sheet (the second arm's device: if a part moves to another mechanism,
    // rewrite its pin, don't drop it).
    //
    // `Toggle`: its OWN treatment, a 4px frame over the 2px rest.
    const pressed = classify(siteNamed(sites, "toggle.tsx", "aria-pressed"));
    expect(
      pressed.own.map((d) => `${d.property}: ${d.value}`),
      "toggle.tsx's aria-pressed state is no longer told apart by its own forced-colors treatment",
    ).toEqual(["border-width: 4px"]);
    // `RadioGroup`: the dot, a SIBLING revealed under the same state that paints
    // a forced border - the circle's own fill is colour alone.
    const circle = classify(siteNamed(sites, "radio-group.tsx", "group-has-checked/radio"));
    expect(circle.own, "the radio circle grew a treatment of its own").toEqual([]);
    expect(
      circle.siblings.map((s) => [s.changes, s.paints]),
      "radio-group.tsx's checked circle is no longer carried by a revealed dot the mode can see",
    ).toEqual([[["opacity"], true]]);
    // `Checkbox`: the tick is revealed the same way, and found - the verdict on
    // its stroke is `KNOWN_STATE_GAPS`', which expires when the tick is fixed.
    const box = classify(siteNamed(sites, "checkbox.tsx", "group-has-checked/checkbox"));
    expect(
      box.siblings.map((s) => s.changes),
      "the checkbox tick is no longer revealed on checked",
    ).toEqual([["opacity"]]);

    // The PREDICATES, anchored on their behaviour. A treatment equal to the rest
    // is no treatment; one not scoped to the state is both states' at once.
    expect(
      ownTreatment(["border-2", "forced-colors:aria-pressed:border-4"], toggleState).length,
      "a 4px frame over a 2px rest reads as no change",
    ).toBe(1);
    expect(
      ownTreatment(["border-4", "forced-colors:aria-pressed:border-4"], toggleState),
      "a 4px frame over a 4px rest reads as a change",
    ).toEqual([]);
    expect(
      ownTreatment(["border-2", "forced-colors:border-4"], toggleState),
      "a forced-colors rule that is not the state's reads as the state's treatment",
    ).toEqual([]);
    // (A frame whose style resolves to none is `paintsIn`'s style half, which
    // `border-none` reddened in DL18; no source compiles `border-none` today, so
    // there is no real token to anchor it on here.)
    // The stroke: an author colour is not a paint for a carrier, currentcolor is,
    // and the revealed-element arms' default reading is untouched.
    expect(
      strokePaints("var(--primary-foreground)", false),
      "an author stroke carries a state",
    ).toBe(false);
    expect(strokePaints("currentcolor", false), "a currentcolor stroke carries nothing").toBe(true);
    expect(strokePaints("none", false), "stroke: none carries a state").toBe(false);
    expect(
      strokePaints("var(--primary-foreground)", true),
      "the revealed arms' reading moved",
    ).toBe(true);
  });

  it("gives every state drawn only in colour a forced-colors treatment, or a sibling that carries it", () => {
    const short: string[] = [];
    const found = new Set<string>();
    for (const site of colourOnlySites()) {
      const key = `${site.file} ${site.variant}`;
      found.add(key);
      const verdict = classify(site);
      const gap = KNOWN_STATE_GAPS[key];
      if (gap !== undefined) {
        expect(
          verdict.saved,
          `${key} now survives forced colors: delete its KNOWN_STATE_GAPS entry, the defect it excuses is fixed`,
        ).toBe(false);
        expect(gap.length, `${key}'s gap needs a reason`).toBeGreaterThan(80);
        continue;
      }
      if (!verdict.saved) {
        const carriers = verdict.siblings.map(
          (s) =>
            `a sibling that changes ${JSON.stringify(s.changes)} and paints nothing the mode keeps`,
        );
        short.push(
          `${site.file}: the ${site.variant} state (${site.state}) is drawn in ${JSON.stringify(site.properties)} alone; no forced-colors:${site.variant}: treatment changes a kept property${carriers.length > 0 ? `, and ${carriers.join(", ")}` : ", and no sibling moves or is revealed under it"}`,
        );
      }
    }
    expect(
      Object.keys(KNOWN_STATE_GAPS).filter((key) => !found.has(key)),
      "a KNOWN_STATE_GAPS entry names a site that no longer exists: delete it",
    ).toEqual([]);
    expect(
      short,
      "a part draws a held STATE in colour or shadow alone, so under forced-colors: active the two states are ONE PICTURE. Give the element a width or an outline under a forced-colors:<state>: variant, or give a sibling that moves or is revealed under the same state a paint the mode keeps, or declare it in KNOWN_STATE_GAPS with a reason",
    ).toEqual([]);
  });
});
