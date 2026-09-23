import { cleanup, render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import postcss, { type AtRule, type Node, type Rule } from "postcss";
import type { ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import { Toggle, toggleClass } from "@/toggle";
import * as toggleStories from "../stories/toggle.stories.js";

/**
 * `Toggle` draws its pressed state from `aria-pressed`, in RESOLVED DECLARATIONS.
 *
 * The drawing is the one two product sites hand-write byte for byte (the like
 * square in a log form and on a game page: a quiet raised slab at rest, the
 * primary fill and the lift shadow when pressed), renamed through the role
 * table. What a part adds over those two ternaries is that the drawing READS the
 * attribute a screen reader reads, so the two cannot disagree - `switch.tsx`'s
 * rule for `aria-checked`.
 *
 * So the claim is a CASCADE claim, and it is evaluated here rather than read off
 * a class name: for each of the four states (rest, hover, pressed, pressed and
 * hovered) every compiled rule the rendered toggle's classes contribute is
 * matched against a real element in that state, and the winner of each drawn
 * property is picked by specificity, then source order - which is what a
 * browser does and what jsdom does not (it lays nothing out and applies no
 * `:hover`). The load-bearing state is the fourth: at rest a hover lifts the
 * border, and a PRESSED toggle must not take that lift.
 *
 * ⚠️ Every class name here is read off a RENDERED story or the part's own
 * export, never typed: `test/fixtures/compile.css` is `source(none)` precisely
 * so a test cannot compile a utility into existence by naming it.
 */

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

afterEach(cleanup);

const toggles = composeStories(toggleStories);

/** The drawn properties. The shadow is read as `--tw-shadow`, the one a `shadow-*` utility sets. */
const DRAWN = ["border-color", "background-color", "color", "--tw-shadow"] as const;
type Drawn = (typeof DRAWN)[number];

const STATES = [
  { name: "rest", story: "Default", hovered: false },
  { name: "hover", story: "Default", hovered: true },
  { name: "pressed", story: "Pressed", hovered: false },
  { name: "pressed and hovered", story: "Pressed", hovered: true },
] as const;
type StateName = (typeof STATES)[number]["name"];

/**
 * The house pressed state, in roles: the like square's two branches
 * (`LogForm.tsx:640-644` and `GameActions.tsx:500-504` at thepile `0592d9af`,
 * identical but for the box size) through `fidelity.test.tsx`'s rename table.
 * `undefined` is "no rule sets it".
 */
const EXPECTED: Record<StateName, Record<Drawn, string | undefined>> = {
  rest: {
    "border-color": "var(--border-strong)",
    "background-color": "var(--raised)",
    color: "var(--foreground-2)",
    "--tw-shadow": undefined,
  },
  hover: {
    "border-color": "var(--muted)",
    "background-color": "var(--raised)",
    color: "var(--foreground)",
    "--tw-shadow": undefined,
  },
  pressed: {
    "border-color": "var(--primary)",
    "background-color": "var(--primary)",
    color: "var(--primary-foreground)",
    "--tw-shadow": "var(--shadow-lift)",
  },
  "pressed and hovered": {
    "border-color": "var(--primary)",
    "background-color": "var(--primary)",
    color: "var(--primary-foreground)",
    "--tw-shadow": "var(--shadow-lift)",
  },
};

const CLASS = /\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g;

/**
 * Selector specificity as `[ids, classes + attributes + pseudo-classes, types]`,
 * for the shapes a utility compiles to. `:not(x)` counts as `x`, and `*` counts
 * nothing (Selectors 4). Escapes are neutralised first so `\:` inside a class
 * name is not read as a pseudo-class.
 */
function specificity(selector: string): [number, number, number] {
  let s = selector.replace(/\\./g, "_");
  const total: [number, number, number] = [0, 0, 0];
  s = s.replace(/:not\(([^()]*)\)/g, (_, inner: string) => {
    const [a, b, c] = specificity(inner);
    total[0] += a;
    total[1] += b;
    total[2] += c;
    return "";
  });
  const attributes = s.match(/\[[^\]]*\]/g) ?? [];
  s = s.replace(/\[[^\]]*\]/g, "");
  total[0] += (s.match(/#[\w-]+/g) ?? []).length;
  total[1] += (s.match(/\.[\w-]+/g) ?? []).length + attributes.length;
  total[1] += (s.match(/(?<!:):[\w-]+/g) ?? []).length;
  total[2] += (s.match(/::[\w-]+/g) ?? []).length;
  total[2] += (s.match(/(?:^|[\s>+~])[a-z][\w-]*/gi) ?? []).length;
  return total;
}

type Candidate = { selector: string; order: number; property: string; value: string };

/**
 * Every declaration the class list contributes, each with its FULL selector (a
 * nested `&` resolved against its parents) and its position in the sheet.
 * Enclosing at-rules other than a layer and `@media (hover: hover)` are refused
 * loudly: a drawn property under any other condition is a state this arm does
 * not model, and an instrument that silently dropped it would read green.
 */
function candidatesFor(classes: readonly string[]): Candidate[] {
  const wanted = new Set(classes);
  const out: Candidate[] = [];
  let order = 0;
  postcss.parse(sheet.css).walkDecls((decl) => {
    order += 1;
    if (!(DRAWN as readonly string[]).includes(decl.prop)) return;
    let selector = "";
    for (let at = decl.parent as Node | undefined; at && at.type !== "root"; at = at.parent) {
      if (at.type === "rule") {
        const own = (at as Rule).selector;
        selector = selector === "" ? own : selector.replace(/&/g, own);
      } else if (at.type === "atrule") {
        const { name, params } = at as AtRule;
        if (name === "layer" || (name === "media" && params === "(hover: hover)")) continue;
        if (name === "property") return;
        const names = [...selector.matchAll(CLASS)].map((m) => m[1]!.replace(/\\(.)/g, "$1"));
        if (names.some((n) => wanted.has(n)))
          throw new Error(`${decl.prop} of ${selector} sits under @${name} ${params}`);
        return;
      }
    }
    const names = [...selector.matchAll(CLASS)].map((m) => m[1]!.replace(/\\(.)/g, "$1"));
    if (!names.some((n) => wanted.has(n))) return;
    out.push({ selector, order, property: decl.prop, value: decl.value });
  });
  return out;
}

/**
 * What wins `property` on `element`, hovered or not: specificity, then order.
 * `byOrder` is true when the two strongest applying rules tie on specificity and
 * DISAGREE, i.e. the value was decided by where Tailwind happened to emit the
 * rules, which is the dependency `not-aria-pressed:hover:` exists to remove.
 */
function resolve(
  candidates: readonly Candidate[],
  element: Element,
  hovered: boolean,
  property: Drawn,
): { value: string | undefined; byOrder: boolean } {
  const applying = candidates.filter((c) => {
    if (c.property !== property) return false;
    return c.selector.split(",").some((one) => {
      const needsHover = /(?<!\\):hover\b/.test(one);
      if (needsHover && !hovered) return false;
      return element.matches(one.replace(/(?<!\\):hover\b/g, "").trim());
    });
  });
  const rank = (x: Candidate, y: Candidate): number => {
    const [a, b] = [specificity(x.selector), specificity(y.selector)];
    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  };
  applying.sort((x, y) => rank(x, y) || x.order - y.order);
  const [top, next] = [applying.at(-1), applying.at(-2)];
  const byOrder = !!top && !!next && rank(top, next) === 0 && top.value !== next.value;
  return { value: top?.value, byOrder };
}

/** The one toggle a story renders, and its classes, left mounted for `matches()`. */
function mount(Story: () => ReactElement): { element: HTMLElement; classes: string[] } {
  const { container } = render(<Story />);
  const found = container.querySelectorAll("button");
  if (found.length !== 1)
    throw new Error(`expected one button, the story rendered ${found.length}`);
  const element = found[0]!;
  const classes = (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  return { element, classes };
}

describe("Toggle: the house pressed state, drawn from aria-pressed", () => {
  it("found the sheet, the story's toggle and a rule for every drawn property (the instrument)", () => {
    expect(specificity(".a"), "a class").toEqual([0, 1, 0]);
    expect(specificity(".a:hover"), "a class and a pseudo-class").toEqual([0, 2, 0]);
    expect(specificity('.a[aria-pressed="true"]'), "a class and an attribute").toEqual([0, 2, 0]);
    expect(
      specificity('.a:not(*[aria-pressed="true"]):hover'),
      ":not() counts its argument",
    ).toEqual([0, 3, 0]);
    const { element, classes } = mount(toggles.Default);
    expect(element.getAttribute("data-slot")).toBe("toggle");
    expect(element.getAttribute("aria-pressed")).toBe("false");
    const candidates = candidatesFor(classes);
    for (const property of DRAWN) {
      expect(
        candidates.filter((c) => c.property === property).length,
        `no compiled rule on the toggle sets ${property}`,
      ).toBeGreaterThan(0);
    }
  });

  it.each(STATES)(
    "draws the $name state, and nothing else decides it",
    ({ name, story, hovered }) => {
      const Story = toggles[story];
      const { element, classes } = mount(Story);
      expect(element.getAttribute("aria-pressed")).toBe(story === "Pressed" ? "true" : "false");
      const candidates = candidatesFor(classes);
      const resolved = DRAWN.map((property) => ({
        property,
        ...resolve(candidates, element, hovered, property),
      }));
      const drawn = Object.fromEntries(resolved.map(({ property, value }) => [property, value]));
      expect(drawn, `the ${name} state`).toEqual(EXPECTED[name]);
      expect(
        resolved.filter(({ byOrder }) => byOrder).map(({ property }) => property),
        `the ${name} state: decided by source order alone, not by the selectors`,
      ).toEqual([]);
    },
  );

  it("hands a plain-join consumer the string it renders: the merge removed nothing", () => {
    const { classes } = mount(toggles.Default);
    expect(classes, "the rendered classes are the exported string").toEqual(
      toggleClass.split(/\s+/).filter(Boolean),
    );
  });

  it("clears the 44px floor on BOTH axes, because a glyph toggle is as narrow as its glyph", () => {
    const { classes } = mount(toggles.Default);
    const hit = sheet.lengthPx(sheet.rootVars().get("--hit-min") ?? "");
    expect(hit, "the skeleton's --hit-min").toBe(44);
    expect(sheet.declared(classes, "min-height"), "min-height").toBe(hit);
    expect(sheet.declared(classes, "min-width"), "min-width").toBe(hit);
  });

  it("carries its slot, is an unpressed button that does not submit, and appends the caller's class last", () => {
    render(<Toggle aria-label="Probe" className="probe-caller" />);
    const control = screen.getByRole("button", { name: "Probe" });
    expect(control.getAttribute("data-slot")).toBe("toggle");
    expect(control).toHaveAttribute("type", "button");
    expect(control).toHaveAttribute("aria-pressed", "false");
    const classes = (control.getAttribute("class") ?? "").split(/\s+/);
    expect(classes.at(-1), "the caller's class, last").toBe("probe-caller");
    expect(classes.slice(0, -1), "the part's own string, intact").toEqual(toggleClass.split(/\s+/));
    cleanup();
    render(<Toggle aria-label="Probe" aria-pressed type="submit" />);
    const pressed = screen.getByRole("button", { name: "Probe", pressed: true });
    expect(pressed).toHaveAttribute("type", "submit");
  });
});
