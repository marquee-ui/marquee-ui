import { cleanup, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import * as accordionStories from "../stories/accordion.stories.js";
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
 * ⚠️ WHY THIS READS THE SHEET AND NOT A COMPUTED STYLE. Measured on this tree:
 * jsdom answers `element.matches(":focus-visible")` with `true` after `.focus()`,
 * but its CSSOM does not APPLY the matching rule - with the flattened sheet in
 * the document the focused root still computes `outline-style: none` and
 * `outline-width: 16px` (jsdom's own default), and `var()` never resolves. So a
 * `getComputedStyle` assertion here would read jsdom's defaults and pass no
 * matter what the part declares. The emitted CSS is the honest instrument in this
 * package, and the browser half is the consuming product's e2e.
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
      expect(selector, `${token} does not compile to a ${VARIANTS[variant]} rule`).toContain(
        VARIANTS[variant],
      );
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
  it("found a sheet and three real hosts to measure", () => {
    // Anchors: every assertion below is a lookup in one of these two, and both
    // can be empty - an empty class list would make every `under()` loop run
    // zero times and every `toContain` below assert nothing.
    expect(sheet.css.length).toBeGreaterThan(10_000);
    expect(HOSTS.length).toBe(3);
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
