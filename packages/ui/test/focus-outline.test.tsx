import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import * as accordionStories from "../stories/accordion.stories.js";
import * as checkboxStories from "../stories/checkbox.stories.js";
import * as radioStories from "../stories/radio-group.stories.js";
import * as switchStories from "../stories/switch.stories.js";

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
   */
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
        if (mine.some((token) => sheet.declaredValues([token], "box-shadow").length > 0)) {
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
      "checkbox.tsx (has-focus-visible)",
      "radio-group.tsx (has-focus-visible)",
      "switch.tsx (focus-visible)",
      "switch.tsx (has-focus-visible)",
    ]);
  });

  it("gives every focus ring an outline beside it, or names it as a known gap", () => {
    const short: string[] = [];
    for (const site of ringSites()) {
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
