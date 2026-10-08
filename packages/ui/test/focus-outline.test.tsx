import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import postcss, { type AtRule, type Rule } from "postcss";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import * as accordionStories from "../stories/accordion.stories.js";
import * as checkboxStories from "../stories/checkbox.stories.js";
import * as inputStories from "../stories/input.stories.js";
import * as radioStories from "../stories/radio-group.stories.js";
import * as switchStories from "../stories/switch.stories.js";
import * as textareaStories from "../stories/textarea.stories.js";

/**
 * THE FOCUS INDICATOR SURVIVES FORCED-COLORS MODE, ON EVERY KEYBOARD HOST.
 *
 * A `box-shadow` ring is not an indicator: `forced-colors: active` drops shadows
 * outright. Measured in the consuming product (thepile
 * `docs/slices/FOLLOWUPS-3.md` item 3, 2026-09-21, a real browser with
 * `emulateMedia({ forcedColors: "active" })` and transitions disabled): with
 * `focus-visible:outline-none` on the row, the focused Switch read
 * `outline-style: none` and `box-shadow: none` under forced colors - no visible
 * focus indicator AT ALL, in the mode a person uses because they cannot see the
 * default one - while a plain `button` beside it kept its 2px solid outline.
 * `Accordion`'s trigger carried the identical pair. Both are fixed by DROPPING
 * the opt-out and declaring the outline; the shadow ring is KEPT beside it,
 * because it is the dark inner separator that makes the ring readable over art.
 *
 * ⚠️ WHY THIS READS THE SHEET AND NOT A COMPUTED STYLE.
 *
 * The part that holds everywhere: **jsdom does not resolve `var()`**. An applied
 * declaration reads back as its literal text - the control below returns
 * `min-height: var(--hit-min)`, not `44px` - so `outline-style` could never be
 * read as `solid` from a computed style whatever else jsdom did. `solid` lives in
 * an `@property` initial value, which is exactly what the sheet read below
 * resolves.
 *
 * The part that is environment-dependent, and is recorded rather than asserted:
 * on this tree jsdom also does not APPLY the `:focus-visible` rules it parses.
 * Measured at the shipping sha with a control, twice - the flattened sheet
 * injected (303 `cssRules`, 9 of whose selectors mention `focus-visible`,
 * including `.focus-visible\:outline-2:focus-visible`), the story focused,
 * `document.activeElement` the root and `root.matches(":focus-visible")` true -
 * and the focused root still computes `outline-style: none`, `outline-width:
 * 16px` and an EMPTY `box-shadow`, while the unvariant `min-h-hit` on the same
 * element does reach it. ⚠️ Layer 1 (MED-1) read `outline-width: 2px` at the same
 * sha and could not be reproduced here; unreconciled, both commands in
 * `docs/as-built.md`. Either way the sheet is the instrument this package already
 * uses for every other geometry claim, and the browser half - does the outline
 * actually PAINT under forced colors - is owed to the consuming product's e2e and
 * is not claimed here.
 *
 * ⚠️ Every class name below is read off the RENDERED story, never typed:
 * `test/fixtures/compile.css` opens `source(none)` and names `src` and `stories`
 * as its only sources precisely so a utility a TEST mentions cannot compile
 * itself into existence - so a typed class name would be measuring its own typing.
 */

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

afterEach(cleanup);

const switches = composeStories(switchStories);
const accordions = composeStories(accordionStories);
const checkboxes = composeStories(checkboxStories);
const radios = composeStories(radioStories);
const inputs = composeStories(inputStories);
const textareas = composeStories(textareaStories);

const classesOf = (element: Element | null): string[] =>
  (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

/**
 * The two focus variants in play, and the selector each one MUST compile to.
 *
 * The pair exists because the focused element differs by host: the root itself
 * when it is the `button[role=switch]`, and a descendant when the host is a
 * `<label>` wrapping an `opacity-0` input (`switch.tsx`'s two-host docblock). An
 * indicator on only one of them is the same defect on half the callers.
 */
const VARIANTS = {
  "focus-visible": ":focus-visible",
  "has-focus-visible": ":has(:focus-visible)",
} as const;
type Variant = keyof typeof VARIANTS;

/**
 * The classes of one host that fire under one variant - checked against the
 * selector the sheet gave them, so a variant renamed to something that compiles
 * to a different selector cannot pass by its prefix alone.
 */
function under(classes: readonly string[], variant: Variant): string[] {
  const prefixed = classes.filter((token) => token.startsWith(`${variant}:`));
  for (const token of prefixed) {
    const selectors = sheet.selectorsOf(token);
    expect(selectors.length, `${token} compiled to no selector at all`).toBeGreaterThan(0);
    for (const selector of selectors) {
      // ⚠️ ENDS WITH, never `toContain`. `":has(:focus-visible)"` CONTAINS
      // `":focus-visible"`, so a `focus-visible:` utility that compiled to a
      // `:has()` rule - a genuinely different selector, matching on a
      // DESCENDANT's focus rather than the element's own - passed a `toContain`
      // check, and so did weakening the `has-focus-visible` expectation to the
      // plain pseudo. Both were proved green at layer 1 (MED-2). `endsWith`
      // separates them: `":has(:focus-visible)"` ends in `)`.
      expect(
        selector.endsWith(VARIANTS[variant]),
        `${token} compiles to \`${selector}\`, which does not end in ${VARIANTS[variant]}. ` +
          `If the declarations below are still right, this is the COMPILER's selector shape ` +
          `moving rather than the focus indicator: Tailwind 4.3.2 nests the pseudo inside the ` +
          `rule body (\`&:focus-visible\`) where 4.3.3 appends it to the selector, and this ` +
          `walk records only the outer selector (layer 1, LOW-5).`,
      ).toBe(true);
    }
  }
  return prefixed;
}

/**
 * What `--tw-outline-style` resolves to, read from the sheet's OWN `@property`
 * rule rather than assumed.
 *
 * Tailwind v4 emits `outline-2` as `outline-style: var(--tw-outline-style);
 * outline-width: 2px` - measured, not quoted - so the width alone says nothing:
 * a 2px outline whose style resolved to `none` paints exactly as much as no
 * outline. The registered property's `initial-value` is what decides, and it is
 * in the same stylesheet, so this cannot drift from what ships.
 */
function outlineStyleDefault(): string | null {
  const block = /@property\s+--tw-outline-style\s*\{([^}]*)\}/.exec(sheet.css);
  const initial = block && /initial-value\s*:\s*([^;]+)/.exec(block[1]!);
  return initial ? initial[1]!.trim() : null;
}

/**
 * The hosts that take a focus indicator, each named by the STORY it is read off
 * and the slot it sits on. The class lists are resolved inside the tests, never
 * at collection time: `render` before `beforeAll` would measure an unloaded sheet.
 */
const HOSTS = [
  {
    name: "Switch (button host)",
    story: () => <switches.Off />,
    slot: "switch",
    tag: "BUTTON",
    variant: "focus-visible",
  },
  {
    // The focused element here is the `opacity-0` input inside the label, so the
    // row's indicator rides `:has(:focus-visible)`. Same class list, other half.
    name: "Switch (label host, focus lands on the opacity-0 input)",
    story: () => <switches.NativeCheckbox />,
    slot: "switch",
    tag: "LABEL",
    variant: "has-focus-visible",
  },
  {
    name: "AccordionTrigger",
    story: () => <accordions.Single />,
    slot: "accordion-trigger",
    tag: "BUTTON",
    variant: "focus-visible",
  },
  // Both added by HIGH-1's fix; the reason they were missing is in KNOWN_GAPS'
  // docblock. Same construction as the Switch's label host.
  {
    name: "Checkbox row (label host)",
    story: () => <checkboxes.Default />,
    slot: "checkbox",
    tag: "LABEL",
    variant: "has-focus-visible",
  },
  {
    name: "RadioGroupItem row (label host)",
    story: () => <radios.Default />,
    slot: "radio-group-item",
    tag: "LABEL",
    variant: "has-focus-visible",
  },
] as const satisfies readonly {
  name: string;
  story: () => ReactElement;
  slot: string;
  tag: string;
  variant: Variant;
}[];

type Host = (typeof HOSTS)[number];

/** One host's class list, read off the DOM the story actually renders. */
function classesFor(host: Host): string[] {
  const { container } = render(host.story());
  const element = container.querySelector(`[data-slot="${host.slot}"]`);
  expect(element, `${host.name}: the story renders no [data-slot="${host.slot}"]`).not.toBeNull();
  expect(element?.tagName, `${host.name}: the story's host is not a ${host.tag}`).toBe(host.tag);
  const classes = classesOf(element);
  cleanup();
  return classes;
}

describe("every keyboard host declares an outline, not only a shadow", () => {
  it("found a sheet and five real hosts to measure", () => {
    // Anchors: every assertion below is a lookup in one of these two, and both
    // can be empty - an empty class list would make every `under()` loop run
    // zero times and every `toContain` below assert nothing.
    expect(sheet.css.length).toBeGreaterThan(10_000);
    expect(HOSTS.length).toBe(5);
    for (const host of HOSTS) {
      const classes = classesFor(host);
      expect(classes.length, `${host.name}: no classes at all`).toBeGreaterThan(5);
      expect(
        under(classes, host.variant).length,
        `${host.name}: nothing under ${host.variant}`,
      ).toBeGreaterThan(0);
    }
    // The registered property is the whole meaning of the width assertion below.
    expect(outlineStyleDefault()).toBe("solid");
  });

  it.each(HOSTS)("$name paints a 2px outline under its focus variant", (host) => {
    const classes = under(classesFor(host), host.variant);

    // The width, resolved to px out of the sheet: `outline-2` emits
    // `outline-width: 2px`, and `declared` returns null if nobody declares it.
    expect(
      sheet.declared(classes, "outline-width"),
      "no class under this variant declares an outline-width",
    ).toBe(2);
    expect(
      sheet.declared(classes, "outline-offset"),
      "no class under this variant declares an outline-offset",
    ).toBe(2);

    // The style. Tailwind spells it as the registered custom property, so the
    // assertion is on what is emitted plus what that property resolves to -
    // never a typed `solid` the sheet does not contain.
    const styles = sheet.declaredValues(classes, "outline-style");
    expect(styles.length, "nothing declares outline-style under this variant").toBeGreaterThan(0);
    expect(styles).toContain("var(--tw-outline-style)");
    expect(outlineStyleDefault()).toBe("solid");

    // …and nothing in the same list turns it back off. This is the defect the
    // file exists for: `outline-none` is a LATER declaration in the same layer,
    // so its presence anywhere in the list wins and the outline never paints.
    expect(styles, "a class under this variant still declares outline-style: none").not.toContain(
      "none",
    );
  });

  it.each(HOSTS)("$name keeps the shadow ring beside the outline", (host) => {
    // The house keeps BOTH: the outline is the half that survives forced
    // colors, the shadow is the dark inner separator that makes the ring
    // readable over cover art. Dropping the shadow is a regression too.
    const shadows = sheet.declaredValues(under(classesFor(host), host.variant), "box-shadow");
    expect(shadows.length, "no box-shadow declared under this variant").toBeGreaterThan(0);
  });
});

/**
 * DECIDED, NOT FORGOTTEN, and it EXPIRES. Parts that draw a focus ring on a row
 * and declare no outline under the same variant, with the reason - the shape
 * `DECLARED_EXCLUSIONS` uses in thepile's `scripts/marquee-drift.test.ts` and
 * that this repo's preset checks use for a knowingly-short contrast pair: the
 * entry asserts the gap is STILL THERE, so closing the gap reddens this file and
 * the excuse dies with the fix rather than outliving it.
 *
 * ⚠️ IT IS EMPTY, AND THAT IS THE POINT. It held `checkbox.tsx` and
 * `radio-group.tsx` for exactly one commit: layer 1 (HIGH-1, batch DL15) found
 * both carrying the Switch's forced-colors hole by a second route, the
 * orchestrator widened the slice's fence to cover them (2026-09-21 ~18:55 IST),
 * and the entries were deleted by the commit that fixed them. That deletion was
 * not a courtesy: applying the fix with the entries still in place reddened this
 * file through the expiry assertion below (`checkbox.tsx now declares an outline
 * under has-focus-visible: … expected 2 to be null`), which is the behaviour the
 * assertion exists to force. Leave the map here - the next part that has to ship
 * short needs somewhere honest to say so.
 */
const KNOWN_GAPS: Readonly<Record<string, { variant: Variant; reason: string }>> = {};

describe("the invariant, over every part rather than a hand-written table", () => {
  /**
   * ⚠️ THIS IS THE ARM THE TABLE ABOVE CANNOT BE. `HOSTS` is three hand-written
   * rows behind a length anchor: the anchor pins it against SHRINKING and
   * nothing pins it against being INCOMPLETE, which is exactly how two parts
   * carrying this defect sat in the same package, in the same release, with the
   * file green (layer 1, MED-3). So the set is DERIVED from the sources: every
   * part that declares a focus ring at all is enumerated, and the invariant is
   * checked against the COMPILED sheet, not against the class name.
   *
   * ⚠️ AND "DECLARES A FOCUS RING" IS A SHADOW **OR** AN OUTLINE (DL15 layer 2,
   * LOW-2). The first edition asked for a `box-shadow` only, which made the
   * sweep blind in exactly the direction it exists to look: a part shipping
   * `focus-visible:outline-none` and NO shadow contributed no site, so the arm
   * below had nothing to find it short on. Run rather than argued, in a detached
   * worktree of `1fd163d`: a scratch part carrying that one class string left
   * this file GREEN at 13 passed, and reddened BOTH arms once the predicate read
   * an `outline-style` too - the exact-set anchor gained
   * `low2-probe.tsx (focus-visible)` and the invariant reported
   * `low2-probe.tsx (focus-visible): outline-width null`. The five shipping sites
   * did not move, which is how the widening was known to be a widening and not a
   * change of subject.
   *
   * ⚠️ `focus:` IS DELIBERATELY NOT A THIRD VARIANT, AND THE COST WAS MEASURED
   * RATHER THAN GUESSED. `input.tsx`'s `inputClass` and `sheet.tsx:67` are the
   * only two `focus:` sites in the package. Admitting the variant takes TWO edits,
   * not one: adding `focus: ":focus"` to `VARIANTS` alone changed NOTHING, because the
   * token walk below only reads a class string that already contains a
   * `focus-visible:` token; with the regex widened as well, the sweep gained
   * exactly `input.tsx (focus)` and `sheet.tsx (focus)` (DL15). The field's ring
   * became 0.1.9's and the sweep still did not move, measured rather than argued
   * (LIB-0.1.9, DECISION 1): with the ring in `input.tsx`, the variant admitted,
   * the regex widened, the Input as a sixth `HOSTS` row and `sheet.tsx` as a
   * `KNOWN_GAPS` entry, this file read 3 failed / 13 passed. The field's ring is
   * not this file's model: it is drawn under `forced-colors: active` ALONE, as
   * the `outline` SHORTHAND inside a media query, so `declared(…,
   * "outline-width")` reads null, and the field keeps no shadow ring beside it.
   * Admitting it here meant a second model inside every arm above. So the field
   * is pinned by its own arms, "the field draws a ring under forced colours, on
   * focus" at the end of this file, and `sheet.tsx`'s `focus:outline-none` stays a decided
   * non-target outside this sweep, as before.
   *
   * ⚠️ A THIRD PART DRAWS `input.tsx`'s RING WITHOUT WRITING IT (DL19): `textarea.tsx`
   * builds its string by interpolating `inputClass`, so a walk of LITERALS will
   * never list it, widened or not. Input's [V] was taken inside `inputClass`
   * (0.1.9), which reaches it for free, and the field's arm reads the textarea off
   * its OWN story, so a textarea that stopped deriving reddens there alone.
   */
  /**
   * What makes a class list a RING SITE, as a function rather than a condition
   * inlined in the walk - which is what lets the arm below observe BOTH of its
   * disjuncts (layer 1, MED-2: deleting either one left the whole suite green,
   * 31 files / 560 tests, because the only thing that had ever exercised the
   * widening was a scratch part in a worktree that no longer exists).
   */
  const declaresARing = (tokens: readonly string[]): boolean =>
    tokens.some(
      (token) =>
        sheet.declaredValues([token], "box-shadow").length > 0 ||
        sheet.declaredValues([token], "outline-style").length > 0,
    );

  const ringSites = (): { file: string; variant: Variant; tokens: string[] }[] => {
    const dir = resolve(process.cwd(), "packages/ui/src");
    const sites: { file: string; variant: Variant; tokens: string[] }[] = [];
    for (const file of readdirSync(dir).filter((name) => name.endsWith(".tsx"))) {
      const source = readFileSync(resolve(dir, file), "utf8");
      // Only class STRINGS, never a comment: a docblock that names a utility
      // would otherwise invent a site. Tailwind reads the same literals.
      const tokens = [...source.matchAll(/"([^"\n]*\b(?:has-)?focus-visible:[^"\n]*)"/g)]
        .flatMap((match) => match[1]!.split(/\s+/))
        .filter(Boolean);
      for (const variant of Object.keys(VARIANTS) as Variant[]) {
        const mine = tokens.filter((token) => token.startsWith(`${variant}:`));
        if (declaresARing(mine)) {
          sites.push({ file, variant, tokens: mine });
        }
      }
    }
    return sites;
  };

  it("finds every part that draws a focus ring, and knows which ones are short", () => {
    const sites = ringSites();
    // Anchors: the walk found sources, and it found the two parts this slice
    // fixed. A walk that returned nothing would make every check below vacuous.
    expect(
      sites.length,
      "no part declares a focus ring at all: the walk found nothing",
    ).toBeGreaterThanOrEqual(4);
    expect(sites.map((site) => site.file)).toContain("switch.tsx");
    expect(sites.map((site) => site.file)).toContain("accordion.tsx");
    // Vacuous while the map is empty, and kept anyway: the moment somebody adds
    // an entry it has to name a real ring site and carry a real reason.
    for (const name of Object.keys(KNOWN_GAPS)) {
      expect(
        sites.map((site) => site.file),
        `${name} is no longer a ring site at all`,
      ).toContain(name);
      expect(KNOWN_GAPS[name]!.reason.length, `${name}'s gap needs a reason`).toBeGreaterThan(80);
    }
    // …so THIS is the live anchor: the exact set of ring sites the walk found.
    // A part that stops declaring a ring, or a new one that starts, moves this
    // list - which is the review the derived sweep exists to force.
    expect(sites.map((site) => `${site.file} (${site.variant})`).sort()).toEqual([
      "accordion.tsx (focus-visible)",
      "alert-dialog.tsx (focus-visible)",
      "calendar.tsx (focus-visible)",
      "checkbox.tsx (has-focus-visible)",
      "dialog.tsx (focus-visible)",
      "dropdown-menu.tsx (focus-visible)",
      "popover.tsx (focus-visible)",
      "radio-group.tsx (has-focus-visible)",
      "select.tsx (focus-visible)",
      "slider.tsx (focus-visible)",
      "switch.tsx (focus-visible)",
      "switch.tsx (has-focus-visible)",
      "tabs.tsx (focus-visible)",
      "tooltip.tsx (focus-visible)",
    ]);
  });

  it("counts a site on its outline ALONE, and on its shadow alone", () => {
    // BOTH disjuncts, live. Deleting either one reddens this arm, which is what
    // the sweep itself cannot do: on the shipping tree every ring site declares
    // both, so the predicate's two halves are indistinguishable from outside.
    //
    // ⚠️ The tokens are READ OFF A RENDERED HOST and then split by what the
    // compiled sheet says each one declares - never typed, per this file's rule.
    const host = HOSTS[0];
    const tokens = under(classesFor(host), host.variant);
    const declares = (token: string, property: string): boolean =>
      sheet.declaredValues([token], property).length > 0;
    const outlineOnly = tokens.filter(
      (token) => declares(token, "outline-style") && !declares(token, "box-shadow"),
    );
    const shadowOnly = tokens.filter(
      (token) => declares(token, "box-shadow") && !declares(token, "outline-style"),
    );
    // The anchors: an empty list would make either claim below vacuous.
    expect(outlineOnly.length, `${host.name}: no outline-only token to test`).toBeGreaterThan(0);
    expect(shadowOnly.length, `${host.name}: no shadow-only token to test`).toBeGreaterThan(0);
    expect(declaresARing(outlineOnly), "the outline half of the predicate is dead").toBe(true);
    expect(declaresARing(shadowOnly), "the shadow half of the predicate is dead").toBe(true);
  });

  it("gives every focus ring an outline beside it, or names it as a known gap", () => {
    const sites = ringSites();
    // The anchor the sibling arm cannot lend this one (layer 1): an empty sweep
    // makes the loop below run zero times and the assertion pass by iterating
    // nothing, which is this repository's most recurrent defect.
    expect(sites.length, "the sweep found no ring site at all").toBeGreaterThanOrEqual(4);
    const short: string[] = [];
    for (const site of sites) {
      const width = sheet.declared(site.tokens, "outline-width");
      const gap = KNOWN_GAPS[site.file];
      if (gap?.variant === site.variant) {
        // The entry EXPIRES: when the gap closes this fails, and the fix's own
        // commit is the one that deletes the entry.
        expect(
          width,
          `${site.file} now declares an outline under ${site.variant}: delete its KNOWN_GAPS entry, the defect it excuses is fixed`,
        ).toBeNull();
        continue;
      }
      if (width !== 2) short.push(`${site.file} (${site.variant}): outline-width ${width}`);
    }
    expect(
      short,
      "a part draws its focus ring with a box-shadow and no outline, so it has NO indicator under forced-colors: active. Add the outline trio under the same variant, or declare it in KNOWN_GAPS with a reason",
    ).toEqual([]);
  });
});

/**
 * THE FIELD'S RING: DRAWN UNDER FORCED COLOURS, ON FOCUS, AND NOWHERE ELSE (0.1.9).
 *
 * `Input` (and `Textarea`, which derives its string) shows focus as a border
 * COLOUR, `focus:border-primary`, and opts out of the outline. Under
 * `forced-colors: active` an author border colour is reverted, so that change is
 * gone. What the mode leaves is the browser's own recolour of a focused
 * control's border, measured in headless Chromium 149 (marquee-ui's
 * `docs/as-built.md`, "LIB-0.1.9"): visible on the dark forced palette, and on the
 * light one black to a dark navy, 20 of the field's pixels moving half the
 * channel range or more. 0.1.9 swaps `focus:outline-none` for
 * `focus:outline-hidden`, which Tailwind 4.3.3 compiles to `outline-none`'s own
 * two declarations plus, inside `@media (forced-colors: active)` ALONE,
 * `outline: 2px solid transparent; outline-offset: 2px`: a ring the mode draws in
 * its focus colour, 2px clear of the border. Normal colours draw what they drew.
 *
 * So the arms read the WINNING outline per mode and per state, not a class name:
 * every declaration the compiled sheet applies to the field AT REST (its bare
 * utilities) or FOCUSED (those and the ones under `:focus` or `:focus-visible`,
 * which a text field matches on every focus, measured), ranked the way the
 * cascade ranks them for rules of one class and at most one pseudo-class in one
 * layer: `!important` first, then the pseudo-class over the bare class, then sheet
 * order; the `outline` shorthand expanded; and a `var(--tw-outline-style)`
 * resolved against the field's OWN declarations before the registered initial
 * value. That last step is not decoration: beside `focus:outline-none`, which sets
 * `--tw-outline-style: none`, the 0.1.6 scoped form `forced-colors:focus:outline-2`
 * resolves to `none` and draws the base's pictures hash for hash (measured), so an
 * arm that read the initial value would pass a ring that paints nothing. REST is
 * read because a ring drawn at rest as well (`outline-hidden` without its variant)
 * is no focus cue: on the light forced palette it put rest against focused back to
 * the base's 20 pixels (layer 1, MED-1, measured). And `forced-color-adjust: none`
 * is read, because it leaves the `transparent` colour transparent.
 *
 * ⚠️ THE CEILING: this is the sheet, not the paint. jsdom paints nothing, so what
 * the ring DRAWS is the probe's record, and the served field is the consuming
 * product's e2e. The ranking is the cascade for these rules only: an ancestor, a
 * second layer or a selector with two pseudo-classes is outside it (none applies
 * to the field; the walk asserts one layer).
 */
describe("the field draws a ring under forced colours, on focus, and nothing new in normal colours", () => {
  const FIELDS = [
    { name: "Input", story: () => <inputs.Default />, slot: "input", tag: "INPUT" },
    // Read off its OWN story, never assumed from `inputClass`: a textarea that
    // stopped deriving the field's string would keep the old token.
    { name: "Textarea", story: () => <textareas.Default />, slot: "textarea", tag: "TEXTAREA" },
  ] as const;

  type Mode = "normal" | "forced";
  type State = "rest" | "focused";
  type Declaration = {
    modes: readonly Mode[];
    prop: string;
    value: string;
    /** 1 under `:focus` / `:focus-visible`, 0 on the bare class: one pseudo-class of specificity. */
    pseudo: 0 | 1;
    important: boolean;
    layer: string;
  };
  const FORCED = /^\(forced-colors:\s*active\)$/;
  const LINE_STYLES = new Set([
    "none",
    "hidden",
    "auto",
    "dotted",
    "dashed",
    "solid",
    "double",
    "groove",
    "ridge",
    "inset",
    "outset",
  ]);
  const REMAINDERS: Readonly<Record<State, readonly string[]>> = {
    rest: [""],
    focused: ["", ":focus", ":focus-visible"],
  };

  /** What a selector adds to its leading class, which decides the state it applies in. */
  const remainder = (selector: string): string =>
    selector.replace(/^\.(?:\\.|[^\s.,:>+~(){}[\]])+/, "");

  /** The modes a declaration applies in, from its enclosing at-rules (`@layer` aside). */
  const modesOf = (media: readonly string[]): Mode[] =>
    media.length === 0
      ? ["normal", "forced"]
      : media.every((m) => FORCED.test(m))
        ? ["forced"]
        : [];

  /** The rendered field's class list, off the story. */
  const fieldClasses = (field: (typeof FIELDS)[number]): string[] => {
    const { container } = render(field.story());
    const element = container.querySelector(`[data-slot="${field.slot}"]`);
    expect(element?.tagName, `${field.name}: the story renders no ${field.tag}`).toBe(field.tag);
    const classes = classesOf(element);
    cleanup();
    return classes;
  };

  /** Every declaration the sheet applies to an element wearing these classes in one state, in sheet order. */
  const declarationsIn = (classes: readonly string[], state: State): Declaration[] => {
    const applying = new Set(
      classes.flatMap((token) =>
        sheet
          .selectorsOf(token)
          .filter((selector) => REMAINDERS[state].includes(remainder(selector))),
      ),
    );
    const out: Declaration[] = [];
    postcss.parse(sheet.css).walkDecls((decl) => {
      const media: string[] = [];
      const layers: string[] = [];
      let rule: Rule | undefined;
      for (let node = decl.parent; node && node.type !== "root"; node = node.parent) {
        if (node.type === "rule" && rule === undefined) rule = node as Rule;
        if (node.type === "atrule") {
          const at = node as AtRule;
          if (at.name === "layer") layers.push(at.params);
          else media.push(at.name === "media" ? at.params : `@${at.name} ${at.params}`);
        }
      }
      if (rule === undefined || !applying.has(rule.selector)) return;
      out.push({
        modes: modesOf(media),
        prop: decl.prop,
        value: decl.value.trim(),
        pseudo: remainder(rule.selector) === "" ? 0 : 1,
        important: decl.important === true,
        layer: layers.join(" > "),
      });
    });
    return out;
  };

  /** The `outline` shorthand's three longhands; an omitted one is its initial value. */
  const shorthand = (value: string): Record<"style" | "width" | "color", string> => {
    const parts = value.match(/[^\s(]+(?:\([^)]*\))?/g) ?? [];
    const style = parts.find((part) => LINE_STYLES.has(part));
    const width = parts.find(
      (part) =>
        part !== style && (sheet.lengthPx(part) !== null || /^(thin|medium|thick)$/.test(part)),
    );
    const color = parts.find((part) => part !== style && part !== width);
    return { style: style ?? "none", width: width ?? "medium", color: color ?? "currentcolor" };
  };

  type Slot = "style" | "width" | "color" | "var" | "adjust";
  /** The outline that WINS in one mode, ranked as the cascade ranks these rules, its style's custom property resolved on the element first. */
  const outlineIn = (declarations: readonly Declaration[], mode: Mode) => {
    const won = new Map<Slot, { value: string; rank: number }>();
    const offer = (slot: Slot, value: string, d: Declaration) => {
      const rank = (d.important ? 2 : 0) + d.pseudo;
      const held = won.get(slot);
      if (held === undefined || rank >= held.rank) won.set(slot, { value, rank });
    };
    for (const d of declarations) {
      if (!d.modes.includes(mode)) continue;
      if (d.prop === "outline") {
        const { style, width, color } = shorthand(d.value);
        offer("style", style, d);
        offer("width", width, d);
        offer("color", color, d);
      } else if (d.prop === "outline-style") offer("style", d.value, d);
      else if (d.prop === "outline-width") offer("width", d.value, d);
      else if (d.prop === "outline-color") offer("color", d.value, d);
      else if (d.prop === "--tw-outline-style") offer("var", d.value, d);
      else if (d.prop === "forced-color-adjust") offer("adjust", d.value, d);
    }
    const raw = won.get("style")?.value;
    const style =
      raw === "var(--tw-outline-style)" ? (won.get("var")?.value ?? outlineStyleDefault()) : raw;
    return {
      style,
      width: won.get("width")?.value,
      color: won.get("color")?.value,
      adjust: won.get("adjust")?.value,
    };
  };

  it.each(FIELDS)("$name: a 2px solid ring under forced-colors: active, on focus", (field) => {
    const declarations = declarationsIn(fieldClasses(field), "focused");
    // Anchors: the walk read the field's own rules at all, and its FOCUS rules
    // among them; an empty walk would make every read below `undefined`. And the
    // ranking holds within ONE layer, so the walk says it found one.
    expect(declarations.length, `${field.name}: the walk found no rule`).toBeGreaterThan(5);
    expect(
      declarations.some((d) => d.prop === "border-color" && d.value === "var(--primary)"),
      `${field.name}: the walk did not reach the field's :focus rules (its border colour)`,
    ).toBe(true);
    expect(new Set(declarations.map((d) => d.layer))).toEqual(new Set(["utilities"]));

    const forced = outlineIn(declarations, "forced");
    expect(
      forced.style,
      `${field.name}: under forced-colors: active the focused field's winning outline-style is ${forced.style}, not the solid ring this field draws` +
        (forced.style === "none" || forced.style === undefined
          ? ": the mode draws no ring, and the only cue left is the browser's border recolour"
          : ""),
    ).toBe("solid");
    expect(sheet.lengthPx(forced.width ?? ""), `${field.name}: the forced ring's width`).toBe(2);
    expect(
      (forced.color ?? "").toLowerCase(),
      `${field.name}: a system colour is kept as written under the mode, and Canvas is the ground`,
    ).not.toBe("canvas");
    expect(
      forced.adjust,
      `${field.name}: forced-color-adjust: none keeps the ring's author colour, transparent`,
    ).not.toBe("none");
  });

  it.each(FIELDS)("$name: no outline at REST, in either mode", (field) => {
    // A ring that is always on is not a focus cue: rest against focused would be
    // the browser's border recolour alone again. No author outline at rest leaves
    // the browser's own initial `none` (an unfocused field draws no outline).
    const rest = declarationsIn(fieldClasses(field), "rest");
    expect(rest.length, `${field.name}: the walk found no rule at rest`).toBeGreaterThan(5);
    for (const mode of ["normal", "forced"] as const) {
      expect(
        outlineIn(rest, mode).style ?? "none",
        `${field.name}: the field's outline-style at rest (${mode})`,
      ).toBe("none");
    }
  });

  it.each(FIELDS)("$name: no outline at all in normal colours, on focus", (field) => {
    // The other half of the claim: in normal colours the field draws focus as its
    // border colour and nothing else, so the pixels are 0.1.8's. A ring declared
    // outside the media query is DL15's every-mode form, which moves every field's
    // keyboard-focused drawing and is not this package's call to make.
    const normal = outlineIn(declarationsIn(fieldClasses(field), "focused"), "normal");
    expect(normal.style, `${field.name}: the focused field's outline-style in normal colours`).toBe(
      "none",
    );
  });

  it("reads each branch of its own instrument (layer 1, LOW-4)", () => {
    // On the shipping field every branch below agrees with a constant, so each is
    // pinned on a literal input instead: a selector, a media list, a shorthand, a
    // ranking. None of these is a class name, so nothing here can conjure a rule.
    expect(remainder(".focus\\:outline-hidden:focus")).toBe(":focus");
    expect(remainder(".w-full")).toBe("");
    expect(REMAINDERS.focused.includes(remainder(".disabled\\:outline-2:disabled"))).toBe(false);
    expect(REMAINDERS.rest.includes(remainder(".focus\\:outline-hidden:focus"))).toBe(false);

    expect(modesOf([])).toEqual(["normal", "forced"]);
    expect(modesOf(["(forced-colors: active)"])).toEqual(["forced"]);
    expect(modesOf(["print"])).toEqual([]);
    expect(modesOf(["(forced-colors: active)", "print"])).toEqual([]);

    expect(shorthand("2px solid transparent")).toEqual({
      style: "solid",
      width: "2px",
      color: "transparent",
    });
    expect(shorthand("1px dashed rgb(0, 0, 0)")).toEqual({
      style: "dashed",
      width: "1px",
      color: "rgb(0, 0, 0)",
    });
    expect(shorthand("thick")).toEqual({ style: "none", width: "thick", color: "currentcolor" });

    const at = (prop: string, value: string, more: Partial<Declaration> = {}): Declaration => ({
      modes: ["normal", "forced"],
      prop,
      value,
      pseudo: 1,
      important: false,
      layer: "utilities",
      ...more,
    });
    // Sheet order, then the pseudo-class over a LATER bare class, then importance.
    expect(
      outlineIn([at("outline-style", "none"), at("outline-style", "solid")], "forced").style,
    ).toBe("solid");
    expect(
      outlineIn(
        [at("outline-style", "none"), at("outline-style", "solid", { pseudo: 0 })],
        "forced",
      ).style,
    ).toBe("none");
    expect(
      outlineIn(
        [at("outline-style", "none", { important: true }), at("outline-style", "solid")],
        "forced",
      ).style,
    ).toBe("none");
    // A declaration outside the mode is not read in it.
    expect(
      outlineIn([at("outline", "2px solid transparent", { modes: ["forced"] })], "normal").style,
    ).toBeUndefined();
    // The custom property, resolved on the element before the registered initial value.
    expect(
      outlineIn(
        [at("--tw-outline-style", "none"), at("outline-style", "var(--tw-outline-style)")],
        "forced",
      ).style,
    ).toBe("none");
    expect(outlineIn([at("outline-style", "var(--tw-outline-style)")], "forced").style).toBe(
      outlineStyleDefault(),
    );
  });
});
