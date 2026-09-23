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
 * every paint into two buckets, a FOREGROUND (`color`, `border-color`,
 * `outline-color`) forced to `CanvasText` and a BACKGROUND (`background-color`)
 * forced to `Canvas`. Author values in both buckets are discarded, so two
 * elements that differ only in `background-color` become the SAME colour, and
 * one drawn on top of the other disappears. (This said `stroke` was in the
 * foreground bucket. The spec lists it; Chromium does not force it - measured,
 * DL21, below - so an author stroke keeps its own colour on the forced ground.)
 *
 * That is why the three choice families in this package pass or fail for three
 * different reasons, and why none of them could be read off a class name:
 *
 *   - `Checkbox`   the tick is an SVG `stroke`. This file said the mode forces
 *                  it to CanvasText. MEASURED in headless Chromium (DL21) it does
 *                  not: the computed `stroke` stayed the author's
 *                  `--primary-foreground`, rgb(10, 11, 7) on the rgb(0, 0, 0)
 *                  Canvas of a dark forced palette. Since 0.1.6 the tick carries
 *                  `forced-colors:stroke-current`, which follows the forced `color`.
 *   - `Switch`     the thumb MOVES (`translate`), and geometry is not forced -
 *                  but the thumb painted only a `background-color`, so it moved
 *                  Canvas on Canvas: checked and unchecked were pixel-IDENTICAL
 *                  in both forced palettes, button host and label host (DL21).
 *                  Since 0.1.6 it carries `forced-colors:border-8`, a solid disc.
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
 * drawn on it by declarations none of which CARRIES a state through the mode
 * (colour, shadow, a cursor: `CARRIES` is the positive list). The mode forces,
 * drops or ignores every one of them, so the two states are one picture unless
 * something the mode keeps tells them apart: the element's own `forced-colors:<state>:`
 * treatment changing a kept property (a width, an outline), or a SIBLING in the
 * same part file that changes under the same state in something the mode keeps
 * (it moves, it is revealed) AND paints a foreground the mode keeps. That last
 * clause is the Switch's hole: its thumb moves, and paints nothing. `Toggle`'s
 * pressed square was the site this kind was written for (DL20 decision 13).
 *
 * ⚠️ BOTH KINDS COUNT A STROKE ONLY WHEN IT IS `currentcolor`, which the mode
 * forces through `color`. The revealed-element arms used to count ANY stroke,
 * which the measurement above falsified, and for one batch (DL21) the two kinds
 * read a stroke differently on the record; 0.1.6 moved the revealed arms to the
 * same reading once the Checkbox's tick carried the stroke that reading asks for.
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
const INTERACTION = /:(?:hover|focus|active)\b/;
const FORCED_MEDIA = "(forced-colors: active)";

/**
 * `text` with every `:not(…)` group removed, parentheses balanced. A held state
 * INSIDE a negation is the other state (`not-aria-pressed:` is the rest), but a
 * held state BESIDE one is still held (`aria-selected:not-disabled:` compiles
 * to `[aria-selected="true"]:not(:disabled)`; r7 P10).
 */
function withoutNegations(text: string): string {
  let out = "";
  for (let i = 0; i < text.length;) {
    if (text.startsWith(":not(", i)) {
      let depth = 0;
      let j = i + 4;
      for (; j < text.length; j++) {
        if (text[j] === "(") depth++;
        else if (text[j] === ")" && --depth === 0) break;
      }
      i = j + 1;
    } else {
      out += text[i];
      i++;
    }
  }
  return out;
}

/** Whether `text` holds a comma OUTSIDE parentheses: a selector list, never one element's state. */
function topLevelComma(text: string): boolean {
  let depth = 0;
  for (const ch of text) {
    if (ch === "(") depth++;
    else if (ch === ")") depth--;
    else if (ch === "," && depth === 0) return true;
  }
  return false;
}

/**
 * The held state a compiled selector puts on its utility, or null. Pure over
 * the selector text, so it is pinned on literal selectors (arm 4), not only on
 * whatever the parts happen to compile. ⚠️ The first edition refused ANY comma
 * and ANY `:not(`, which made Tailwind's own `open:` (`:is([open], :popover-open,
 * :open)`) and a held state scoped away from another axis unreachable (r7 MED-2).
 */
function heldState(selector: string): { name: string; state: string } | null {
  const lead = LEADING_CLASS.exec(selector);
  if (lead === null) return null;
  const state = selector.slice(lead[0].length);
  if (state === "" || topLevelComma(selector)) return null;
  const held = withoutNegations(state);
  if (!HELD_STATE.test(held) || INTERACTION.test(held)) return null;
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
 * Which of two declarations of ONE property the element draws, in the state they
 * share: a held state's selector outranks a bare class whatever media query wraps
 * the class (`:is(…)` or `[aria-…]` adds to the specificity, a media query adds
 * nothing), and the mode's own rule is emitted after the drawing's.
 */
const RANK: Readonly<Record<Placement, number>> = {
  conditional: -1,
  unconditional: 0,
  forced: 1,
  state: 2,
  "forced-state": 3,
};

/**
 * What CARRIES a state through forced colors: the geometry the mode leaves an
 * author, and nothing else. A frame's width or style, an outline's; movement;
 * a reveal (`opacity`, `visibility`, `display`). A POSITIVE list, on purpose
 * (r7 MED-1): the first edition counted every property the mode does not force,
 * so a `cursor`, an `outline-offset` with no outline or a `transition` saved a
 * state that the mode draws as one picture. A state whose declarations include
 * none of these is a site; a treatment or a sibling counts only through them.
 */
const CARRIES =
  /^(?:(?:border|outline)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-(?:width|style)|translate|transform|rotate|scale|opacity|visibility|display)$/;

/**
 * Whether a `stroke` value is a paint the mode keeps: `currentcolor` and nothing
 * else. The mode forces `color`, and a `currentcolor` stroke follows it
 * (measured: rgb(255, 255, 255) on the dark palette's black), where an author
 * colour is left as it was (measured: the Checkbox tick's rgb(10, 11, 7), on
 * black). One reading, for every arm. A system colour (`CanvasText`) draws the
 * same pixels in Chromium and is refused ON PURPOSE: `currentcolor` is the one
 * spelling the parts use, and one spelling is one thing to keep true.
 */
const strokePaints = (value: string): boolean => /^currentcolor$/i.test(value);

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
 * whose site no longer exists fails too. EMPTY since 0.1.6, and it fired for real
 * once: it held the Switch's two hosts and the Checkbox from DL21, measured in
 * headless Chromium, until the thumb's `forced-colors:border-8` and the tick's
 * `forced-colors:stroke-current` made each entry fail here and be deleted.
 */
const KNOWN_STATE_GAPS: Readonly<Record<string, string>> = {};

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
    // join the read; without one they are never read, which is the old view the
    // revealed-element arms ask).
    { state }: { state?: string } = {},
  ): boolean => {
    const all = tokens
      .flatMap((token) => placed.get(token) ?? [])
      .filter((d) => d.state === null || d.state === state);
    const applies = all.filter((d) => d.placement !== "conditional");
    const mine = all.filter((d) => kinds.includes(d.placement));

    // The stroke the element DRAWS here is ONE declaration, the highest-ranked (the
    // later of two equal ones, as `cn` keeps the last), and it counts only when its
    // placement is one of `kinds`. Reading "any stroke in `kinds`" let a checked
    // state's author stroke outrank the tick's forced `currentcolor` and stay green
    // (layer 1 r5, MED-1, proved in Chromium: the base defect's own hash).
    const stroke = applies
      .filter((d) => d.property === "stroke")
      .reduce<Placed | undefined>(
        (won, d) => (won === undefined || RANK[d.placement] >= RANK[won.placement] ? d : won),
        undefined,
      );
    if (stroke !== undefined && kinds.includes(stroke.placement) && strokePaints(stroke.value))
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

  /**
   * Saved in every mode: an unconditional foreground paint - a frame, or a
   * `currentcolor` stroke. ⚠️ Until 0.1.6 any stroke counted here, so the
   * Checkbox's author-coloured tick passed while Chromium drew it near-black on
   * the dark palette's black (DL21, measured); the tick is saved under the mode
   * now, by its own `forced-colors:stroke-current`.
   */
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
    // or a media query. (It does NOT count `forced` here - the forced-colors rules
    // in the package are the fixes themselves, and an instrument anchor that failed
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
    expect(
      savedUnderForcedColors(tick.tokens),
      "the tick paints no currentcolor stroke under forced colors",
    ).toBe(true);
    expect(
      savedUnconditionally(tick.tokens),
      "the tick reads as saved in every mode, not by its forced-colors stroke",
    ).toBe(false);
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
    // is only when it is `currentcolor` (Chromium leaves an author stroke unforced,
    // measured in DL21), and `color` alone paints nothing on a box with no text.
    expect(
      savedUnconditionally(["bg-primary-foreground"]),
      "a background counts as a foreground",
    ).toBe(false);
    expect(
      savedUnconditionally(["stroke-primary-foreground"]),
      "an author-coloured stroke counts as a paint the mode keeps",
    ).toBe(false);
    expect(
      savedUnderForcedColors(["forced-colors:stroke-current"]),
      "a currentcolor stroke no longer counts",
    ).toBe(true);
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
        const stroke = declares(site.tokens, "stroke");
        short.push(
          `${site.file}: revealed on checked, paints background-color ${JSON.stringify(background)} and stroke ${JSON.stringify(stroke)}, nothing the mode keeps`,
        );
      }
    }
    expect(
      short,
      "a part reveals an element on checked whose only paint is a background or an author-coloured stroke, so under forced-colors: active it is Canvas on Canvas, or the author's ink left on the forced Canvas, and the checked state is INVISIBLE. Give it a border or an outline under a forced-colors: variant, or draw it as an SVG stroke in currentColor (an author-coloured stroke is not forced), or declare it in KNOWN_GAPS with a reason",
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
   * Every element in the package that draws a HELD STATE in nothing that
   * CARRIES it (colour, shadow, a cursor, …) - the second kind of site. From the part files' string literals
   * (`literals`), each placed through the compiled sheet: what the state
   * declares is the sheet's, never the class name's.
   */
  const colourOnlySites = (): StateSite[] => {
    const sites = new Map<string, StateSite>();
    for (const file of partFiles()) {
      for (const tokens of literals(file)) {
        for (const [state, { variant, decls }] of statesOf(tokens)) {
          if (decls.some((d) => CARRIES.test(d.property))) continue;
          const key = `${file} ${tokens.join(" ")} ${state}`;
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
    // The REST drawing in the mode: a `forced` rule is the mode's own and wins
    // over an unconditional one of the same property.
    const restOf = (property: string): Placed | undefined =>
      all.filter((d) => d.placement === "forced" && d.property === property).at(-1) ??
      all.filter((d) => d.placement === "unconditional" && d.property === property).at(-1);
    const changes = all
      .filter((d) => d.placement === "forced-state" && d.state === state)
      .filter((d) => CARRIES.test(d.property))
      .filter((d) => {
        const before = restOf(d.property);
        return before === undefined || lengthOrValue(before.value) !== lengthOrValue(d.value);
      });
    const paints = paintsIn(tokens, ["unconditional", "forced", "forced-state"], { state });
    return paints ? changes : [];
  };

  type Sibling = { tokens: string[]; changes: string[]; paints: boolean };

  /**
   * What one element does under `state` that the mode can carry: the carrier
   * properties its `state` rules change (it moves; it is revealed), and whether
   * it paints a foreground the mode keeps while in that state. An element that
   * changes and paints carries the state; one that changes and paints nothing is
   * Canvas on Canvas however far it moves (the Switch's thumb).
   */
  const carrierOf = (tokens: readonly string[], state: string): Sibling => {
    const changes = tokens
      .flatMap((token) => placed.get(token) ?? [])
      .filter((d) => d.placement === "state" && d.state === state)
      .map((d) => d.property)
      .filter((property) => CARRIES.test(property));
    const paints = paintsIn(tokens, ["unconditional", "forced", "forced-state"], { state });
    return { tokens: [...tokens], changes: [...new Set(changes)], paints };
  };

  /** Every OTHER string in the site's part file that changes under the same state in a carrier. */
  const siblingsOf = (site: StateSite): Sibling[] =>
    literals(site.file)
      .filter((tokens) => tokens.join(" ") !== site.tokens.join(" "))
      .map((tokens) => carrierOf(tokens, site.state))
      .filter((sibling) => sibling.changes.length > 0);

  const classify = (site: StateSite) => {
    const own = ownTreatment(site.tokens, site.state);
    const siblings = siblingsOf(site);
    return { own, siblings, saved: own.length > 0 || siblings.some((s) => s.paints) };
  };

  /**
   * Runs `run` with hand-written placements under names no utility can have, and
   * removes them after: for a predicate whose separating input no source compiles.
   * What is under test is the PREDICATE, never the sheet.
   */
  const withPlaced = <T,>(entries: Record<string, Placed[]>, run: () => T): T => {
    for (const [name, decls] of Object.entries(entries)) placed.set(name, decls);
    try {
      return run();
    } finally {
      for (const name of Object.keys(entries)) placed.delete(name);
    }
  };

  const siteNamed = (sites: readonly StateSite[], file: string, variant: string): StateSite => {
    const found = sites.filter((s) => s.file === file && s.variant === variant);
    expect(
      found.length,
      `expected exactly one colour-only ${variant} site in ${file}, found ${found.length}`,
    ).toBe(1);
    return found[0]!;
  };

  it("found the states drawn only in colour, from the literals, placed by the sheet", () => {
    // Anchors first, as above: an invariant over an empty set of sites is true.
    // The READER, on a text written here: a comment holding a quoted class is
    // not a literal, whichever quotes it wears; a template's static text is.
    expect(
      literalsOf(
        '// "aria-pressed:bg-primary"\n/* "b:c" */\nconst a = "d e";\nconst t = `f`;\nconst u = `g ${a} h`;',
      ),
      "the literal reader read a comment, or missed a literal",
    ).toEqual([["d", "e"], ["f"], ["g"], ["h"]]);

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
    expect(
      at("data-[state=closed]:opacity-0"),
      "the sheet's data-state is not a held state",
    ).toEqual([["state", '[data-state="closed"]']]);

    // The HELD-STATE READING, pinned on literal selectors: `heldState` is pure
    // over the selector text, so every clause of it is held here and not only
    // by whatever the parts happen to compile (r7 MED-2 and MED-3).
    const held = (selector: string): string | null => heldState(selector)?.state ?? null;
    for (const attr of [
      '[aria-pressed="true"]',
      '[aria-checked="true"]',
      '[aria-selected="true"]',
      '[aria-expanded="true"]',
      '[aria-current="page"]',
      '[data-state="open"]',
    ]) {
      expect(held(`.a${attr}`), `${attr} does not read as a held state`).toBe(attr);
    }
    expect(held(".a:is(:where(.group\\/x):has(:checked) *)"), ":checked in a group").not.toBeNull();
    expect(
      held(".a:is([open], :popover-open, :open)"),
      "Tailwind's own open: does not read as a held state",
    ).toBe(":is([open], :popover-open, :open)");
    expect(
      held('.a[aria-selected="true"]:not(:disabled)'),
      "a held state scoped away from another axis does not read as held",
    ).toBe('[aria-selected="true"]:not(:disabled)');
    expect(held('.a:not([aria-pressed="true"])'), "the rest state reads as held").toBeNull();
    expect(held('.a[aria-pressed="true"]:hover'), "a hover reads as held").toBeNull();
    expect(held('.a[aria-pressed="true"]:focus-visible'), "a focus reads as held").toBeNull();
    expect(held('.a[data-orientation="horizontal"]'), "an orientation reads as held").toBeNull();
    expect(held('.a[aria-pressed="true"], .b'), "a selector list reads as held").toBeNull();
    // ...and the MEDIA GATE, on literal css through the same walk: a held rule
    // under any other media query is conditional, under forced colors it is the
    // mode's treatment of that state, under none it is the state's drawing.
    const walked = placeAll(
      '@media (width >= 40rem) { .p[aria-pressed="true"] { border-width: 4px } }' +
        ' @media (forced-colors: active) { .q[aria-pressed="true"] { border-width: 4px } }' +
        ' .r[aria-pressed="true"] { color: red }',
    );
    const kinds = (name: string) => (walked.get(name) ?? []).map((d) => [d.placement, d.state]);
    expect(kinds("p"), "a held rule under another media query reads as held").toEqual([
      ["conditional", null],
    ]);
    expect(kinds("q"), "a forced held rule is not the state's treatment").toEqual([
      ["forced-state", '[aria-pressed="true"]'],
    ]);
    expect(kinds("r"), "a bare held rule is not the state's drawing").toEqual([
      ["state", '[aria-pressed="true"]'],
    ]);

    // ...and the classifier looked for carriers: the Switch's thumb, found as a
    // sibling that MOVES under the same condition as the track it sits in, and
    // PAINTS while it does (its `forced-colors:border-8`, since 0.1.6).
    for (const track of [button, label]) {
      const thumb = classify(track).siblings;
      expect(thumb.length, `${track.variant}: the thumb was not found as a sibling`).toBe(1);
      expect(thumb[0]!.changes, `${track.variant}: the thumb no longer moves`).toContain(
        "translate",
      );
      expect(
        thumb[0]!.paints,
        `${track.variant}: the moving thumb paints nothing the mode keeps`,
      ).toBe(true);
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
    // `Checkbox`: the tick, revealed the same way and painting a `currentcolor`
    // stroke under the mode (since 0.1.6; an author stroke is not forced).
    const box = classify(siteNamed(sites, "checkbox.tsx", "group-has-checked/checkbox"));
    expect(box.own, "the checkbox box grew a treatment of its own").toEqual([]);
    expect(
      box.siblings.map((s) => [s.changes, s.paints]),
      "checkbox.tsx's checked box is no longer carried by a revealed tick the mode can see",
    ).toEqual([[["opacity"], true]]);

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
    // The PAINT GATE: a changed width whose style resolves to none paints
    // nothing. No source compiles `border-none` today, so its two declarations
    // (DL18's read of the emitted rule) are placed BY HAND under a name no
    // utility can have, and removed after - the predicate is what is under test
    // here, not the sheet. Without this, dropping the gate stayed GREEN (DL21
    // mutation M7).
    withPlaced(
      {
        "probe:border-none": [
          { property: "--tw-border-style", value: "none", placement: "unconditional", state: null },
          { property: "border-style", value: "none", placement: "unconditional", state: null },
        ],
      },
      () =>
        expect(
          ownTreatment(
            ["border-2", "probe:border-none", "forced-colors:aria-pressed:border-4"],
            toggleState,
          ),
          "a frame whose style resolves to none reads as a paint",
        ).toEqual([]),
    );
    // ...and the clauses no compiled token reaches today, each on the smallest
    // input that separates it (r7 MED-3). A treatment of ANOTHER state is not
    // this one's; the mode's own rest frame is the rest; a treatment whose only
    // paint is the state's own rule still paints, and only in that state.
    expect(
      ownTreatment(["border-2", "forced-colors:aria-pressed:border-4"], '[aria-checked="true"]'),
      "a treatment of another state reads as this state's",
    ).toEqual([]);
    expect(
      ownTreatment(
        ["border-2", "forced-colors:border-4", "forced-colors:aria-pressed:border-4"],
        toggleState,
      ),
      "the mode's own 4px rest frame is not read as the rest",
    ).toEqual([]);
    expect(
      ownTreatment(["forced-colors:aria-pressed:border-4"], toggleState).map(
        (d) => `${d.property}: ${d.value}`,
      ),
      "a frame drawn only by the state's own forced rule reads as painting nothing",
    ).toEqual(["border-style: var(--tw-border-style)", "border-width: 4px"]);
    expect(
      paintsIn(
        ["forced-colors:aria-pressed:border-4"],
        ["unconditional", "forced", "forced-state"],
        { state: '[aria-checked="true"]' },
      ),
      "one state's forced rule paints in another state",
    ).toBe(false);
    // The carriers, on the Switch's own strings: the track changes only colours
    // under its state (no carrier), the thumb moves under the SAME state, and
    // under a state neither holds nothing is found.
    const track = siteNamed(sites, "switch.tsx", "group-aria-checked/switch");
    const thumb = classify(track).siblings[0]!.tokens;
    expect(carrierOf(track.tokens, track.state).changes, "a colour change carries").toEqual([]);
    expect(carrierOf(thumb, track.state).changes, "the thumb's movement").toEqual(["translate"]);
    expect(
      siblingsOf({ ...track, state: toggleState }),
      "a sibling that changes under ANOTHER state reads as a carrier",
    ).toEqual([]);
    // ...and the NEGATIVES, on the same real strings with the mode's own tokens
    // taken away. Deleting the DL21 gap entries removed the only other place
    // these two verdicts had to come back false, so `paints: true` or `saved:
    // true` went green over the Switch's own defect (layer 1 r5, MED-2).
    const unforced = (tokens: readonly string[]): string[] =>
      tokens.filter((token) => !token.startsWith("forced-colors:"));
    expect(
      carrierOf(unforced(thumb), track.state).paints,
      "a mover painting only a background reads as painting",
    ).toBe(false);
    const checked = siteNamed(sites, "checkbox.tsx", "group-has-checked/checkbox");
    const tick = classify(checked).siblings[0]!.tokens;
    expect(
      carrierOf(unforced(tick), checked.state).paints,
      "a tick drawn only in its author stroke reads as painting",
    ).toBe(false);
    const square = siteNamed(sites, "toggle.tsx", "aria-pressed");
    expect(
      classify({ ...square, tokens: unforced(square.tokens) }).saved,
      "a pressed square with no forced-colors treatment reads as saved",
    ).toBe(false);
    // ...and the stroke the tick DRAWS, not any stroke it declares (r5 MED-1): a
    // checked-state author stroke outranks the bare forced `currentcolor`, and a
    // later forced `none` replaces it. Hand-placed: no source compiles either.
    withPlaced(
      {
        "probe:checked-author-stroke": [
          {
            property: "stroke",
            value: "var(--primary-foreground)",
            placement: "state",
            state: checked.state,
          },
        ],
        "probe:fc-stroke-none": [
          { property: "stroke", value: "none", placement: "forced", state: null },
        ],
      },
      () => {
        expect(
          carrierOf([...tick, "probe:checked-author-stroke"], checked.state).paints,
          "a checked-state author stroke under the forced currentcolor reads as painting",
        ).toBe(false);
        expect(
          carrierOf([...tick, "probe:fc-stroke-none"], checked.state).paints,
          "a later forced stroke: none reads as painting",
        ).toBe(false);
        expect(
          savedUnderForcedColors([...tick, "probe:fc-stroke-none"]),
          "a revealed tick whose forced stroke is none reads as saved",
        ).toBe(false);
      },
    );
    // Hand-placed, as below: a colour-only treatment of the state, a reveal whose
    // only paint is an author stroke, and a sibling whose frame is its state's
    // forced rule alone.
    const frame = (state: string): Placed[] => [
      {
        property: "border-style",
        value: "var(--tw-border-style)",
        placement: "forced-state",
        state,
      },
      { property: "border-width", value: "4px", placement: "forced-state", state },
    ];
    withPlaced(
      {
        "probe:fc-pressed-highlight": [
          {
            property: "background-color",
            value: "Highlight",
            placement: "forced-state",
            state: toggleState,
          },
        ],
        "probe:fc-pressed-reveal": [
          { property: "opacity", value: "100%", placement: "forced-state", state: toggleState },
        ],
        "probe:fc-switch-frame": frame(track.state),
      },
      () => {
        expect(
          ownTreatment(["border-2", "probe:fc-pressed-highlight"], toggleState),
          "a forced colour reads as the state's treatment",
        ).toEqual([]);
        expect(
          ownTreatment(["stroke-primary-foreground", "probe:fc-pressed-reveal"], toggleState),
          "a reveal painted only by an author stroke reads as a treatment",
        ).toEqual([]);
        expect(
          carrierOf(
            ["group-aria-checked/switch:translate-x-5", "probe:fc-switch-frame"],
            track.state,
          ).paints,
          "a mover framed only by its state's forced rule reads as painting nothing",
        ).toBe(true);
      },
    );
    // The stroke: an author colour is not a paint, currentcolor is, and none is not.
    expect(strokePaints("var(--primary-foreground)"), "an author stroke carries a state").toBe(
      false,
    );
    expect(strokePaints("currentcolor"), "a currentcolor stroke carries nothing").toBe(true);
    expect(strokePaints("none"), "stroke: none reads as a paint").toBe(false);
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
