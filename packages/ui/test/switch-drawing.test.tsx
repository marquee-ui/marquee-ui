import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cleanup, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { composeStories } from "@storybook/react-vite";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import * as switchStories from "../stories/switch.stories.js";

/**
 * The switch's geometry, in RESOLVED PIXELS, and its state cascade in a real one.
 *
 * ⚠️ WHAT THIS FILE CANNOT DO, STATED FIRST. jsdom lays nothing out: measured on
 * this tree, `getBoundingClientRect()` is `{0,0,0,0}` for an element with a
 * height in the sheet, and `offsetWidth`/`offsetHeight` are 0. So "the thumb's
 * box moved by 20px" is not observable here at all, in any story, and a `play`
 * that claimed it would be asserting zeroes. What IS observable, and is what the
 * two halves below do:
 *
 *   1. the five numbers the travel is made of, read out of the COMPILED
 *      stylesheet - the same instrument `tailwind-compile.test.tsx` measures the
 *      44px floor with - and re-derived rather than pinned, so a track or a thumb
 *      resized without its travel reddens here;
 *   2. the CASCADE: jsdom does apply a stylesheet, so with the compiled sheet in
 *      the document the thumb's `translate` is unset while the control is off and
 *      set to the travel when it goes on. That is the half a class-name assertion
 *      cannot make - a drawing whose trigger were `group-hover:` would carry the
 *      same class names and stay dark on a click.
 *
 * The consuming product measures the MOVE in a browser (`e2e/mobile-390.spec.ts`
 * in the private repo), which is the only place a box can actually move.
 *
 * ⚠️ Every class name below is read off the RENDERED story, never typed here: a
 * utility named in a test file is a utility that file can conjure into existence
 * (`test/fixtures/compile.css` names its sources for exactly this reason), and a
 * geometry test that types its own class names measures its own typing.
 */

const FIXTURE = resolve(process.cwd(), "packages/ui/test/fixtures/compile.css");
if (!existsSync(FIXTURE)) throw new Error(`compile fixture not found at ${FIXTURE}`);

let css = "";
/** class name -> the declaration bodies of every rule whose selector uses it. */
const declarations = new Map<string, string[]>();
/** class name -> every selector it appears in. */
const selectors = new Map<string, string[]>();

beforeAll(async () => {
  const result = await postcss([tailwind()]).process(readFileSync(FIXTURE, "utf8"), {
    from: FIXTURE,
  });
  css = result.css;
  postcss.parse(css).walkRules((node) => {
    const body = node.nodes
      .map((child) => child.toString())
      .join("; ")
      .trim();
    for (const match of node.selector.matchAll(/\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g)) {
      const name = match[1]!.replace(/\\(.)/g, "$1");
      declarations.set(name, [...(declarations.get(name) ?? []), body]);
      selectors.set(name, [...(selectors.get(name) ?? []), node.selector]);
    }
  });
}, 60_000);

const rule = (name: string): string => declarations.get(name)?.join(" ") ?? "";

/** Custom properties declared in the compiled sheet's `:root` blocks. */
function rootVars(): Map<string, string> {
  const vars = new Map<string, string>();
  for (const block of css.matchAll(/:root\s*(?:,[^{]*)?\{([^}]*)\}/g)) {
    for (const line of block[1]!.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)) {
      if (!vars.has(line[1]!)) vars.set(line[1]!, line[2]!.trim());
    }
  }
  return vars;
}

/**
 * A CSS length in px, resolving `var()` against the sheet's own `:root` and the
 * `calc(var(--spacing) * n)` shape Tailwind's spacing scale emits. Null if the
 * value is not a length, so a property nobody declared cannot read as 0.
 */
function lengthPx(value: string, vars: Map<string, string>): number | null {
  const resolved = value
    .replace(/var\((--[a-z0-9-]+)\)/gi, (_, name: string) => vars.get(name) ?? "")
    .trim();
  const plain = /^(-?\d*\.?\d+)(px|rem)$/.exec(resolved);
  if (plain) return Number(plain[1]) * (plain[2] === "rem" ? 16 : 1);
  const scaled = /^calc\(\s*(-?\d*\.?\d+)(px|rem)\s*\*\s*(-?\d*\.?\d+)\s*\)$/.exec(resolved);
  if (!scaled) return null;
  return Number(scaled[1]) * Number(scaled[3]) * (scaled[2] === "rem" ? 16 : 1);
}

const classesOf = (element: Element | null): string[] =>
  (element?.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

/**
 * The px value a set of classes declares for one property: every class is looked
 * up in the compiled sheet and the property read out of it. Null when no class
 * declares it, which is the difference between "0px" and "nobody said".
 */
function declared(classes: string[], property: string): number | null {
  const vars = rootVars();
  for (const token of classes) {
    for (const match of rule(token).matchAll(
      new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`, "g"),
    )) {
      const px = lengthPx(match[1]!, vars);
      if (px !== null) return px;
    }
  }
  return null;
}

const stories = composeStories(switchStories);

interface Drawing {
  root: string[];
  track: string[];
  thumb: string[];
}

/** The classes the BUTTON host actually renders, read off the DOM. */
function drawing(): Drawing {
  const { container } = render(<stories.Off />);
  const found = {
    root: classesOf(container.querySelector('[data-slot="switch"]')),
    track: classesOf(container.querySelector('[data-slot="switch-track"]')),
    thumb: classesOf(container.querySelector('[data-slot="switch-thumb"]')),
  };
  cleanup();
  return found;
}

/** The ON-state classes of one element: the rules a state trigger switches on. */
const triggered = (classes: string[], trigger: string): string[] =>
  classes.filter((token) => token.startsWith(`${trigger}:`));

afterEach(cleanup);

describe("the switch's drawing, in resolved pixels", () => {
  it("found a real drawing to measure, and a sheet to measure it in", () => {
    // Anchors: every number below comes from these two, and both can be empty.
    expect(css.length).toBeGreaterThan(10_000);
    const parts = drawing();
    expect(parts.track.length).toBeGreaterThan(5);
    expect(parts.thumb.length).toBeGreaterThan(5);
    expect(rootVars().get("--hit-min")).toBe("44px");
    expect(lengthPx("calc(var(--spacing) * 11)", rootVars())).toBe(44);
    expect(lengthPx("auto", rootVars())).toBeNull();
  });

  it("draws a 44x24 track with a 2px edge and a 16px thumb", () => {
    const parts = drawing();
    expect(declared(parts.track, "width")).toBe(44);
    expect(declared(parts.track, "height")).toBe(24);
    expect(declared(parts.track, "border-width")).toBe(2);
    expect(declared(parts.thumb, "width")).toBe(16);
    expect(declared(parts.thumb, "height")).toBe(16);
  });

  it("insets the thumb equally on both axes, inside the track's padding box", () => {
    // The thumb is positioned against the track's PADDING box, so the border is
    // already excluded: 24 - 2*2 - 16 = 4, which is 2px of air above and below.
    const parts = drawing();
    const left = declared(parts.thumb, "left");
    const top = declared(parts.thumb, "top");
    expect(left).toBe(2);
    expect(top).toBe(left);
    const trackH = declared(parts.track, "height")!;
    const border = declared(parts.track, "border-width")!;
    expect(trackH - 2 * border - 2 * top!).toBe(declared(parts.thumb, "height"));
  });

  it("travels exactly the width the track leaves it", () => {
    // 44 - 2*2 (the border) - 2*2 (the inset) - 16 (the thumb) = 20. Re-derived,
    // not pinned: pinning all five numbers and then re-deriving one of them is a
    // line that cannot fail.
    const parts = drawing();
    const travel = declared(
      triggered(parts.thumb, "group-aria-checked/switch"),
      "--tw-translate-x",
    );
    const trackW = declared(parts.track, "width")!;
    const border = declared(parts.track, "border-width")!;
    const inset = declared(parts.thumb, "left")!;
    const thumbW = declared(parts.thumb, "width")!;
    expect(travel).toBe(trackW - 2 * border - 2 * inset - thumbW);
    expect(travel).toBeGreaterThan(0);
  });

  it("puts the tap floor on the row, where the person is pointing", () => {
    // The track is 24px tall, so the track can never be the control. Both hosts'
    // controls declare the floor: the button root, and the native overlay input.
    const parts = drawing();
    expect(declared(parts.root, "min-height")).toBe(44);
    const { container } = render(<stories.NativeCheckbox />);
    const input = container.querySelector('[data-slot="switch-input"]');
    expect(input?.tagName).toBe("INPUT");
    expect(declared(classesOf(input), "min-height")).toBe(44);
    cleanup();
  });
});

describe("one drawing, two hosts", () => {
  const ARIA = "group-aria-checked/switch";
  const HAS = "group-has-checked/switch";

  it("changes the same properties by the same amounts, whichever host drives it", () => {
    const parts = drawing();
    for (const [name, classes] of [
      ["track", parts.track],
      ["thumb", parts.thumb],
    ] as const) {
      const aria = triggered(classes, ARIA);
      const has = triggered(classes, HAS);
      // Non-vacuous: there ARE on-state rules, on both triggers, and the same
      // number of them.
      expect(aria.length, `${name}: no aria-driven on-state`).toBeGreaterThan(0);
      expect(has.length, `${name}: no :checked-driven on-state`).toBe(aria.length);
      // Compared by the DECLARATIONS they produce, not by their names: a colour
      // changed on one host and not the other reddens here rather than in a
      // screenshot somebody notices.
      expect(has.map((token) => rule(token)).sort()).toEqual(
        aria.map((token) => rule(token)).sort(),
      );
    }
  });

  it("gives each trigger a selector only its own host can satisfy", () => {
    const parts = drawing();
    for (const token of triggered(parts.track, ARIA)) {
      // An ancestor carrying the state, not the element itself: the drawing is
      // inside the control, and the control is what the platform marks.
      expect(selectors.get(token)?.join(" ")).toContain('[aria-checked="true"]');
    }
    for (const token of triggered(parts.track, HAS)) {
      expect(selectors.get(token)?.join(" ")).toContain(":has(:checked)");
    }
    // …and both are scoped to this part's own named group, so a switch inside
    // some other `.group` that contains a checked box is not lit up by it.
    for (const token of [...triggered(parts.track, ARIA), ...triggered(parts.thumb, HAS)]) {
      expect(selectors.get(token)?.join(" ")).toContain(".group\\/switch");
    }
  });

  it("dims the whole row when either host is disabled, by the same amount", () => {
    // The consumer contract's own requirement, and the reason it is on the ROOT:
    // the native host's input has no chrome left to dim (`opacity-0`), and the
    // button host's drawing is inside the button, so dimming the row dims the
    // track with it. Both spellings are read off the rendered root and compared
    // by what they DECLARE - a treatment added to one host and not the other
    // reddens here rather than on somebody's screen.
    const parts = drawing();
    const self = parts.root.filter((token) => token.startsWith("disabled:"));
    const host = parts.root.filter((token) => token.startsWith("has-disabled:"));
    expect(self.length, "the root has no disabled treatment of its own").toBeGreaterThan(0);
    expect(host.length, "the root has no disabled treatment for a disabled descendant").toBe(
      self.length,
    );
    expect(host.map((token) => rule(token)).sort()).toEqual(
      self.map((token) => rule(token)).sort(),
    );
    // …and the descendant spelling really is the `:has()` one, so it can reach a
    // control the root is not.
    for (const token of host) expect(selectors.get(token)?.join(" ")).toContain(":has(:disabled)");
  });
});

describe("the drawing follows the state, in a real cascade", () => {
  /**
   * jsdom implements no cascade LAYERS, and Tailwind 4 emits every utility
   * inside `@layer utilities`: measured on this tree, injecting the compiled
   * sheet as-is left the track at `position: static` and
   * `background-color: rgba(0, 0, 0, 0)` - not one rule applied. Unwrapping the
   * layer blocks is the closest faithful model of a browser that has them, and it
   * is the ONLY thing done to the sheet: every selector and every declaration is
   * the compiler's own, so nothing here can conjure a rule that the build does
   * not ship.
   */
  function flattenLayers(source: string): string {
    const root = postcss.parse(source);
    let unwrapped = 0;
    root.walkAtRules("layer", (at) => {
      unwrapped++;
      if (at.nodes && at.nodes.length > 0) at.replaceWith(at.nodes);
      else at.remove();
    });
    if (unwrapped === 0)
      throw new Error("no @layer in the compiled sheet: flattening is measuring nothing");
    return root.toString();
  }

  it("sets the travel only while the control is on", async () => {
    // The one place in this package where the STATE and the DRAWING are observed
    // together. A trigger that did not follow the state - `group-hover:`, or a
    // React prop - would carry the same class names and never reach the `on`
    // branch below.
    const style = document.createElement("style");
    style.textContent = flattenLayers(css);
    document.head.append(style);
    try {
      const { container } = render(<stories.Off />);
      const control = container.querySelector('[data-slot="switch"]')! as HTMLElement;
      const thumb = container.querySelector('[data-slot="switch-thumb"]')! as HTMLElement;
      const track = container.querySelector('[data-slot="switch-track"]')! as HTMLElement;
      const computed = (element: HTMLElement, property: string) =>
        window.getComputedStyle(element).getPropertyValue(property);
      /** jsdom re-serialises a value it stores (`calc(var(--spacing)*5)`), so
       *  the two sides are compared with whitespace collapsed. */
      const same = (a: string, b: string) =>
        expect(a.replace(/\s+/g, "")).toBe(b.replace(/\s+/g, ""));
      /** What the compiled sheet declares for one utility. Says WHICH utility
       *  vanished: without this the red is a type complaint about `null`, which
       *  names nothing and proves nothing (found by running the mutation). */
      const declares = (name: string, property: string) => {
        const match = new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`).exec(rule(name));
        expect(match, `${name} declares no ${property} in the compiled sheet`).not.toBeNull();
        return match![1]!.trim();
      };

      // OFF, and positively: the off fill IS painted, so a sheet jsdom failed to
      // apply cannot read as "no travel".
      expect(control.getAttribute("aria-checked")).toBe("false");
      same(computed(track, "background-color"), declares("bg-overlay", "background-color"));
      expect(computed(thumb, "translate")).toBe("none");

      await userEvent.click(control);
      expect(control.getAttribute("aria-checked")).toBe("true");
      same(
        computed(track, "background-color"),
        declares("group-aria-checked/switch:bg-primary", "background-color"),
      );
      // The travel the stylesheet declares for this class, not a number retyped
      // here.
      same(
        computed(thumb, "--tw-translate-x"),
        declares("group-aria-checked/switch:translate-x-5", "--tw-translate-x"),
      );
      same(
        computed(thumb, "translate"),
        declares("group-aria-checked/switch:translate-x-5", "translate"),
      );
    } finally {
      style.remove();
    }
  });
});
