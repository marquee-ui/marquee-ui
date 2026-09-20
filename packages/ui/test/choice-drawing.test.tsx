import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import * as checkboxStories from "../stories/checkbox.stories.js";
import * as radioStories from "../stories/radio-group.stories.js";

/**
 * The two choice families' drawings, in RESOLVED PIXELS and in a real cascade.
 *
 * ⚠️ WHAT THIS FILE CANNOT DO, STATED FIRST. jsdom lays nothing out: a box with a
 * height in the sheet still measures `{0,0,0,0}`. So "the box is 24px on screen"
 * is not observable here in any story. What IS observable, and is what the three
 * halves below do:
 *
 *   1. the numbers, read out of the COMPILED stylesheet - the same instrument the
 *      44px floor guard uses - and COMPARED between the two families rather than
 *      pinned twice, so a change to one that is not a change to the other reddens;
 *   2. the SELECTORS the state triggers produce, which is the only place the
 *      scoping to a named group can be seen at all;
 *   3. the CASCADE: with the compiled sheet in the document, jsdom does apply it,
 *      so the mark is unpainted while the control is off and painted when it is
 *      on. That is the half a class-name assertion cannot make - a drawing whose
 *      trigger were `group-hover:` would carry the same class names and stay dark
 *      on a click.
 *
 * ⚠️ Every class name below is read off the RENDERED story, never typed here: a
 * utility a test file names is a utility that file can conjure into existence,
 * which is why the compile fixture turns Tailwind's source detection off.
 */

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

afterEach(cleanup);

const checkbox = composeStories(checkboxStories);
const radio = composeStories(radioStories);

const classesOf = (element: Element | null): string[] =>
  (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

/** The classes one story actually renders, per slot, read off the DOM. */
function slots(Story: () => React.ReactElement, names: readonly string[]): Map<string, string[]> {
  const { container } = render(<Story />);
  const found = new Map<string, string[]>();
  for (const name of names) {
    const element = container.querySelector(`[data-slot="${name}"]`);
    if (element === null) throw new Error(`the story renders no [data-slot="${name}"]`);
    found.set(name, classesOf(element));
  }
  cleanup();
  return found;
}

/** The ON-state classes of one element: the rules a state trigger switches on. */
const triggered = (classes: readonly string[], trigger: string): string[] =>
  classes.filter((token) => token.startsWith(`${trigger}:`));

const CHECKBOX_SLOTS = ["checkbox", "checkbox-input", "checkbox-box", "checkbox-indicator"];
const RADIO_SLOTS = [
  "radio-group-item",
  "radio-group-input",
  "radio-group-circle",
  "radio-group-indicator",
];
const CHECKED = "group-has-checked/checkbox";
const RADIO_CHECKED = "group-has-checked/radio";

describe("the choice controls' geometry, in resolved pixels", () => {
  it("found a real drawing to measure, and a sheet to measure it in", () => {
    // Anchors: every number below comes from these two, and both can be empty.
    expect(sheet.css.length).toBeGreaterThan(10_000);
    const box = slots(checkbox.Default, CHECKBOX_SLOTS);
    expect(box.get("checkbox-box")!.length).toBeGreaterThan(5);
    expect(sheet.rootVars().get("--hit-min")).toBe("44px");
    expect(sheet.lengthPx("calc(var(--spacing) * 11)")).toBe(44);
    // BOTH operand orders resolve, which is the shape `tailwind-compile.test.tsx`'s
    // own copy of this resolver handles and the module has to keep (layer 1, LOW-3).
    expect(sheet.lengthPx("calc(0.25rem * 6)")).toBe(24);
    expect(sheet.lengthPx("calc(6 * 0.25rem)")).toBe(24);
    expect(sheet.lengthPx("auto")).toBeNull();
  });

  it("puts the tap floor on the INPUT, which is why the box may be 24px", () => {
    // The whole reason the input is an invisible overlay rather than the drawn
    // box (Switch's decision 4): a 24px box as the control is a 24px control.
    // Both numbers are read, and the second is the one that makes the first
    // necessary rather than decorative.
    for (const [name, found] of [
      ["checkbox", slots(checkbox.Default, CHECKBOX_SLOTS)],
      ["radio", slots(radio.Default, RADIO_SLOTS)],
    ] as const) {
      const input = [...found.entries()].find(([slot]) => slot.endsWith("-input"))![1];
      const drawn = [...found.entries()].find(
        ([slot]) => slot.endsWith("-box") || slot.endsWith("-circle"),
      )![1];
      const row = found.get(name === "checkbox" ? "checkbox" : "radio-group-item")!;
      expect(sheet.declared(input, "min-height"), `${name}: the input's floor`).toBe(44);
      expect(sheet.declared(row, "min-height"), `${name}: the row's floor`).toBe(44);
      expect(sheet.declared(drawn, "width"), `${name}: the drawing's width`).toBe(24);
      expect(sheet.declared(drawn, "height"), `${name}: the drawing's height`).toBe(24);
      expect(sheet.declared(drawn, "border-width"), `${name}: the drawing's edge`).toBe(2);
    }
  });

  it("makes the input COVER the row, which is the claim the floor rests on", () => {
    // ⚠️ LAYER 1's HIGH-1, and it is the finding this arm exists for: the floor
    // guard reads `min-height`/`height` and NOTHING else, so an input that keeps
    // `min-h-hit` and loses `inset-0` measures 44px tall and about 13px wide - the
    // UA checkbox's intrinsic size - and every play still passes, because the row
    // is a `<label>` and forwards the click. That is the "hope about label
    // click-forwarding" this family's docblock says it does not rely on. So the
    // covering itself is read, out of the compiled sheet, in both families.
    for (const [name, classes] of [
      ["checkbox", slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox-input")!],
      ["radio", slots(radio.Default, RADIO_SLOTS).get("radio-group-input")!],
    ] as const) {
      expect(sheet.declaredValues(classes, "position"), `${name}: position`).toEqual(["absolute"]);
      // `inset-0` emits the SHORTHAND (`inset: calc(var(--spacing) * 0)`), not four
      // longhands - read rather than assumed, after the first draft of this arm
      // asked for `inset-block-start` and got null from every class.
      const inset = sheet.declaredValues(classes, "inset");
      expect(inset, `${name}: inset`).toHaveLength(1);
      expect(sheet.lengthPx(inset[0]!), `${name}: inset resolves to`).toBe(0);
      // …and invisible rather than absent: `opacity-0`, never `hidden` or
      // `sr-only`, or it stops being focusable or stops being 44px.
      expect(sheet.declaredValues(classes, "opacity"), `${name}: opacity`).toEqual(["0%"]);
      expect(sheet.declaredValues(classes, "display"), `${name}: display`).toEqual([]);
    }
  });

  it("gives both families the SAME overlay input, by declaration and not by name", () => {
    // One decision about one element, so one spelling. Compared by what the
    // classes DECLARE, so a class renamed on one side and not the other is
    // visible here rather than in somebody's screenshot.
    const box = slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox-input")!;
    const dot = slots(radio.Default, RADIO_SLOTS).get("radio-group-input")!;
    expect(box).toEqual(dot);
    expect(box.map((token) => sheet.rule(token)).join(" ")).toContain("opacity: 0%");
  });

  it("draws one control in two shapes: the same box, at a different radius", () => {
    // The claim the family record makes, as an assertion rather than a sentence.
    // Everything the checkbox's box declares, the radio's circle declares too -
    // except the corner.
    const box = slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox-box")!;
    const circle = slots(radio.Default, RADIO_SLOTS).get("radio-group-circle")!;
    const radius = (classes: readonly string[]) => sheet.declaredValues(classes, "border-radius");
    // The square's corner is a TOKEN off the skeleton's radius scale, resolved to
    // real pixels; the circle's is the unbounded value a pill is spelled with.
    // Neither is typed here - both are read, and the point is that they differ.
    expect(radius(box)).toHaveLength(1);
    expect(radius(circle)).toHaveLength(1);
    expect(radius(box)[0]).toMatch(/^var\(--radius-/);
    expect(sheet.lengthPx(radius(box)[0]!)).toBeLessThan(8);
    expect(sheet.lengthPx(radius(box)[0]!)).toBeGreaterThan(0);
    expect(sheet.lengthPx(radius(circle)[0]!)).toBeGreaterThan(1000);
    const withoutRadius = (classes: readonly string[]) =>
      classes
        .filter((token) => radius([token]).length === 0)
        .map((token) => sheet.rule(token))
        .sort();
    expect(withoutRadius(box)).toEqual(withoutRadius(circle));
  });

  it("paints the mark in the ink the fill guarantees", () => {
    // `primary-foreground` ON `primary` is the pair `Button`'s primary variant
    // already stands on, and the presets measure it. A mark in any other ink is
    // a contrast question nobody has answered.
    const mark = slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox-indicator")!;
    const dot = slots(radio.Default, RADIO_SLOTS).get("radio-group-indicator")!;
    expect(sheet.declaredValues(mark, "stroke")).toEqual(["var(--primary-foreground)"]);
    expect(sheet.declaredValues(dot, "background-color")).toEqual(["var(--primary-foreground)"]);
    const fill = (classes: readonly string[]) =>
      sheet.declaredValues(
        triggered(classes, CHECKED).concat(triggered(classes, RADIO_CHECKED)),
        "background-color",
      );
    expect(fill(slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox-box")!)).toEqual([
      "var(--primary)",
    ]);
    expect(fill(slots(radio.Default, RADIO_SLOTS).get("radio-group-circle")!)).toEqual([
      "var(--primary)",
    ]);
  });
});

describe("the state trigger is the platform's, and it is scoped to its own row", () => {
  it("reaches the drawing through a :checked descendant of the row, in both families", () => {
    for (const [name, found, trigger, drawn, mark] of [
      [
        "checkbox",
        slots(checkbox.Default, CHECKBOX_SLOTS),
        CHECKED,
        "checkbox-box",
        "checkbox-indicator",
      ],
      [
        "radio",
        slots(radio.Default, RADIO_SLOTS),
        RADIO_CHECKED,
        "radio-group-circle",
        "radio-group-indicator",
      ],
    ] as const) {
      for (const slot of [drawn, mark]) {
        const on = triggered(found.get(slot)!, trigger);
        // Non-vacuous: there ARE on-state rules on this element. Every loop
        // below iterates them, so without this the test asserts nothing
        // (layer 1 of the Switch, MED-3, the same shape).
        expect(on.length, `${name}: ${slot} has no on-state`).toBeGreaterThan(0);
        for (const token of on) {
          const selector = sheet.selectorsOf(token).join(" ");
          // An ANCESTOR carrying the state, not the element itself: the drawing
          // is inside the row, and the row is what the platform marks.
          expect(selector, token).toContain(":has(:checked)");
          // …and NAMED, so a checkbox inside some other `.group` that happens to
          // contain a checked input is not lit up by it. The unnamed variant is
          // one character shorter and one whole class of bug wider.
          expect(selector, token).toContain(
            `.group\\/${name === "checkbox" ? "checkbox" : "radio"}`,
          );
        }
      }
    }
  });

  it("puts the focus ring and the disabled dimming on the ROW, not on the box", () => {
    // The input is `opacity-0`, so its own ring is invisible: the row is the only
    // element either state has to show on. Read as the SELECTOR each produces,
    // because `has-focus-visible:` and `focus-visible:` are one character apart
    // and only one of them can see a descendant.
    for (const row of [
      slots(checkbox.Default, CHECKBOX_SLOTS).get("checkbox")!,
      slots(radio.Default, RADIO_SLOTS).get("radio-group-item")!,
    ]) {
      const ring = row.filter((token) => token.startsWith("has-focus-visible:"));
      const dim = row.filter((token) => token.startsWith("has-disabled:"));
      expect(ring.length).toBeGreaterThan(0);
      expect(dim.length).toBeGreaterThan(0);
      for (const token of ring)
        expect(sheet.selectorsOf(token).join(" ")).toContain(":focus-visible");
      for (const token of dim)
        expect(sheet.selectorsOf(token).join(" ")).toContain(":has(:disabled)");
      expect(sheet.declaredValues(ring, "--tw-shadow")).toContain("var(--shadow-focus-ring)");
    }
  });
});

describe("the drawing follows the state, in a real cascade", () => {
  /** The compiled sheet in the document, flattened, for one read. */
  function withSheet<T>(read: () => T): T {
    const style = document.createElement("style");
    style.textContent = sheet.flattened();
    document.head.append(style);
    try {
      return read();
    } finally {
      style.remove();
      cleanup();
    }
  }

  const computed = (element: Element, property: string) =>
    window.getComputedStyle(element as HTMLElement).getPropertyValue(property);

  /** What the sheet declares for one utility, with a red that NAMES the utility. */
  const declares = (name: string, property: string) => {
    const match = new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`).exec(sheet.rule(name));
    expect(match, `${name} declares no ${property} in the compiled sheet`).not.toBeNull();
    return match![1]!.trim();
  };

  /**
   * ⚠️ TWO RENDERS, NOT ONE ELEMENT TOGGLED IN PLACE. jsdom 30 supports
   * `:has(:checked)` - what it does not do is invalidate a computed style that
   * was read BEFORE a property-only `.checked` change, which is what made the
   * first measurement of the Switch's file say the opposite of the truth. The
   * click half is proved by the stories' plays instead.
   */
  function drawingState(Story: () => React.ReactElement, drawn: string, mark: string) {
    return withSheet(() => {
      const { container } = render(<Story />);
      // ⚠️ RESOLVED BY IDENTITY, never by position: a radio group's chosen option
      // is not its first one, and reading `querySelector` here measured an
      // unchecked row and called the drawing broken (found by running it).
      const checked = container.querySelector("input:checked");
      const row = checked === null ? container : checked.parentElement!;
      const box = row.querySelector(`[data-slot="${drawn}"]`)!;
      const indicator = row.querySelector(`[data-slot="${mark}"]`)!;
      return {
        fill: computed(box, "background-color"),
        border: computed(box, "border-top-color"),
        mark: computed(indicator, "opacity"),
      };
    });
  }

  it("leaves the checkbox's mark unpainted while the box is empty, and paints it when it is not", () => {
    const off = drawingState(checkbox.Default, "checkbox-box", "checkbox-indicator");
    const on = drawingState(checkbox.Checked, "checkbox-box", "checkbox-indicator");
    // OFF, positively: the empty box IS painted, so a sheet jsdom failed to apply
    // cannot read as "no mark".
    expect(off.fill).toBe(declares("bg-surface", "background-color"));
    expect(off.mark).toBe(declares("opacity-0", "opacity"));
    expect(on.fill).toBe(declares(`${CHECKED}:bg-primary`, "background-color"));
    expect(on.mark).toBe(declares(`${CHECKED}:opacity-100`, "opacity"));
    expect(off.mark).not.toBe(on.mark);
  });

  it("does the same for the radio, from the same trigger", () => {
    const off = drawingState(radio.Default, "radio-group-circle", "radio-group-indicator");
    const on = drawingState(radio.Chosen, "radio-group-circle", "radio-group-indicator");
    expect(off.fill).toBe(declares("bg-surface", "background-color"));
    expect(off.mark).toBe(declares("opacity-0", "opacity"));
    expect(on.fill).toBe(declares(`${RADIO_CHECKED}:bg-primary`, "background-color"));
    expect(on.mark).toBe(declares(`${RADIO_CHECKED}:opacity-100`, "opacity"));
  });

  it("lights a CALLER's own drawing when the item composes no circle at all", () => {
    // The composition the family exists to allow (a real product's avatar
    // picker): no `RadioGroupCircle`, and the selected state is a ring on the
    // caller's tile - painted by the row's own named group, in the cascade.
    const seen = withSheet(() => {
      const { container } = render(<radio.NoDrawing />);
      const checkedTile = container.querySelector('[data-testid="tile-fox"]')!;
      const otherTile = container.querySelector('[data-testid="tile-owl"]')!;
      return {
        circles: container.querySelectorAll('[data-slot="radio-group-circle"]').length,
        checked: computed(checkedTile, "--tw-ring-color"),
        other: computed(otherTile, "--tw-ring-color"),
        checkedWidth: computed(checkedTile, "--tw-ring-shadow"),
      };
    });
    expect(seen.circles).toBe(0);
    // ⚠️ READ OFF A CUSTOM PROPERTY, and that is the environment rather than a
    // preference: `border-primary` emits the `border-color` SHORTHAND, and jsdom
    // drops a shorthand whose value is an unresolved `var()` - so the longhand
    // read comes back as the initial white on BOTH tiles and the assertion would
    // have passed nothing (measured, before this line was written this way).
    // Tailwind's ring is a custom property, which jsdom stores verbatim.
    expect(seen.checked).toBe(declares(`${RADIO_CHECKED}:ring-primary`, "--tw-ring-color"));
    expect(seen.other).toBe("");
    expect(seen.checkedWidth).not.toBe("");
  });
});
