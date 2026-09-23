import { cleanup, render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import postcss, { type AtRule, type Node, type Rule } from "postcss";
import type { ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

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

/**
 * The drawn properties. The shadow is read as `--tw-shadow`, the one a `shadow-*`
 * utility sets; the border's WIDTH is read beside its colour, because a colour
 * on a border preflight has zeroed draws nothing (layer 1, MED-1: `border-2`
 * dropped was GREEN).
 */
const DRAWN = ["border-color", "border-width", "background-color", "color", "--tw-shadow"] as const;
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
    "border-width": "2px",
    "background-color": "var(--raised)",
    color: "var(--foreground-2)",
    "--tw-shadow": undefined,
  },
  hover: {
    "border-color": "var(--muted)",
    "border-width": "2px",
    "background-color": "var(--raised)",
    color: "var(--foreground)",
    "--tw-shadow": undefined,
  },
  pressed: {
    "border-color": "var(--primary)",
    "border-width": "2px",
    "background-color": "var(--primary)",
    color: "var(--primary-foreground)",
    "--tw-shadow": "var(--shadow-lift)",
  },
  "pressed and hovered": {
    "border-color": "var(--primary)",
    "border-width": "2px",
    "background-color": "var(--primary)",
    color: "var(--primary-foreground)",
    "--tw-shadow": "var(--shadow-lift)",
  },
};

const CLASS = /\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g;
const classNames = (selector: string): string[] =>
  [...selector.matchAll(CLASS)].map((m) => m[1]!.replace(/\\(.)/g, "$1"));

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

type Candidate = {
  selector: string;
  order: number;
  property: string;
  value: string;
  /** Declared inside `@media (forced-colors: active)`: it applies only in that mode. */
  forced: boolean;
};

/**
 * Every declaration the class list contributes, each with its FULL selector (a
 * nested `&` resolved against every rule above it) and its position in the
 * sheet.
 *
 * The climb goes all the way up BEFORE anything is decided, because Tailwind
 * nests an at-rule INSIDE a rule as often as around it: an opacity-modified
 * colour is a fallback declaration plus a nested `@supports (color: color-mix(…))`
 * block, and a climb that stopped at that inner at-rule had no selector yet and
 * dropped the value every browser applies (layer 1, HIGH-2: a fully transparent
 * pressed glyph was GREEN). The conditions are then MODELLED, not skipped: a
 * layer is transparent, `@media (hover: hover)` is a pointer device (the hover
 * states are `:hover`'s), `@supports (color: color-mix(…))` is every engine this
 * package targets, and `@media (forced-colors: active)` marks the declaration as
 * that mode's. Any other condition on one of these classes throws: a state this
 * file does not model must not read as green.
 */
function candidatesFor(classes: readonly string[]): Candidate[] {
  const wanted = new Set(classes);
  const out: Candidate[] = [];
  let order = 0;
  postcss.parse(sheet.css).walkDecls((decl) => {
    order += 1;
    let selector = "";
    const conditions: string[] = [];
    for (let at = decl.parent as Node | undefined; at && at.type !== "root"; at = at.parent) {
      if (at.type === "rule") {
        const own = (at as Rule).selector;
        if (selector === "") selector = own;
        else selector = selector.includes("&") ? selector.replace(/&/g, own) : `${own} ${selector}`;
      } else if (at.type === "atrule") {
        const { name, params } = at as AtRule;
        if (name !== "layer") conditions.push(`@${name} ${params}`);
      }
    }
    if (!classNames(selector).some((n) => wanted.has(n))) return;
    let forced = false;
    for (const condition of conditions) {
      if (condition === "@media (hover: hover)") continue;
      if (condition.startsWith("@supports (color: color-mix(")) continue;
      if (condition === "@media (forced-colors: active)") {
        forced = true;
        continue;
      }
      throw new Error(
        `${decl.prop} of ${selector} sits under ${condition}, which this file does not model`,
      );
    }
    out.push({ selector, order, property: decl.prop, value: decl.value, forced });
  });
  return out;
}

/**
 * What wins `property` on `element`: specificity, then order, among the rules
 * that apply in this mode. `byOrder` is true when the two strongest applying
 * declarations come from DIFFERENT rules that tie on specificity and disagree,
 * i.e. the value was decided by where Tailwind happened to emit two rules, which
 * is the dependency `not-aria-pressed:hover:` exists to remove. (One rule's own
 * fallback and its `@supports` override tie by design and are not counted.)
 */
function resolve(
  candidates: readonly Candidate[],
  element: Element,
  mode: { hovered: boolean; forced: boolean },
  property: string,
): { value: string | undefined; byOrder: boolean } {
  const applying = candidates.filter((c) => {
    if (c.property !== property) return false;
    if (c.forced && !mode.forced) return false;
    return c.selector.split(",").some((one) => {
      const needsHover = /(?<!\\):hover\b/.test(one);
      if (needsHover && !mode.hovered) return false;
      return element.matches(one.replace(/(?<!\\):hover\b/g, "").trim());
    });
  });
  const rank = (x: Candidate, y: Candidate): number => {
    const [a, b] = [specificity(x.selector), specificity(y.selector)];
    return a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
  };
  applying.sort((x, y) => rank(x, y) || x.order - y.order);
  const [top, next] = [applying.at(-1), applying.at(-2)];
  const byOrder =
    !!top &&
    !!next &&
    rank(top, next) === 0 &&
    top.selector !== next.selector &&
    top.value !== next.value;
  return { value: top?.value, byOrder };
}

/**
 * What forced colors overrides or drops (CSS Color Adjust 1, "properties affected
 * by forced colors mode"), plus custom properties, which paint nothing by
 * themselves. Whatever is left is what the mode lets an author draw with.
 */
const FORCED_BY_THE_MODE =
  /^(?:color|background-color|border(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?-color|outline-color|text-decoration-color|column-rule-color|caret-color|accent-color|fill|stroke|box-shadow|text-shadow|scrollbar-color|--.+)$/;

const NORMAL = { hovered: false, forced: false } as const;
const HOVERED = { hovered: true, forced: false } as const;
const FORCED = { hovered: false, forced: true } as const;

/**
 * THE MOVE IS A RENAME. The like square as the product wears it, copied from
 * `LogForm.tsx:640-644` at thepile `0592d9af` (`GameActions.tsx:500-504` differs
 * only in the box, `h-[46px] w-[46px]`), and the entries of
 * `fidelity.test.tsx`'s `RENAME` table (`:58-75`) that it uses, each spelled
 * exactly as that table spells it.
 */
const UPSTREAM = {
  base: "grid h-11 w-11 place-items-center border-2 text-base transition-colors",
  pressed: "border-accent bg-accent text-on-accent shadow-hard",
  rest: "border-line-strong bg-raised text-text-secondary hover:border-text-muted hover:text-text",
} as const;
const RENAME: Readonly<Record<string, string>> = {
  "bg-accent": "bg-primary",
  "border-accent": "border-primary",
  "text-on-accent": "text-primary-foreground",
  "shadow-hard": "shadow-lift",
  "border-line-strong": "border-border-strong",
  "text-text": "text-foreground",
  "text-text-secondary": "text-foreground-2",
  "border-text-muted": "border-muted",
};
/**
 * What the part changes on the way, each with its reason. The base tokens it
 * REPLACES must exist upstream (checked below), so a departure that no longer
 * applies is as loud as a missing one.
 */
const REPLACED: Readonly<Record<string, string[]>> = {
  // A part may sit in an inline context; inside the product's two flex parents
  // both blockify to the same grid.
  grid: ["inline-grid"],
  // The box is the caller's (44 in the log sheet, 46 on the game page); the part
  // keeps only the 44px floor, on both axes.
  "h-11": ["min-h-hit"],
  "w-11": ["min-w-hit"],
};
const ADDED = [
  // The house disabled pair (`Button`, `Switch`): neither product site disables.
  "disabled:cursor-not-allowed",
  "disabled:opacity-50",
  // The pressed state's one paint that survives forced colors (layer 1, HIGH-1).
  "forced-colors:aria-pressed:border-4",
];
const renamed = (token: string): string => {
  const at = token.lastIndexOf(":");
  const [variant, utility] = [token.slice(0, at + 1), token.slice(at + 1)];
  return variant + (RENAME[utility] ?? utility);
};

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
        ...resolve(candidates, element, { hovered, forced: false }, property),
      }));
      for (const { property, value } of resolved) {
        expect(value, `the ${name} state's ${property}`).toBe(EXPECTED[name][property]);
      }
      expect(
        resolved.filter(({ byOrder }) => byOrder).map(({ property }) => property),
        `the ${name} state: decided by source order alone, not by the selectors`,
      ).toEqual([]);
    },
  );

  it("draws a disabled toggle at half strength with a refusing cursor, and an enabled one at neither", () => {
    // A toggle that cannot be pressed has to look it: the house disabled pair,
    // `Button`'s and `Switch`'s. Read on the Disabled story's element, where
    // `:disabled` matches, against the Default story's, where it must not.
    const disabled = mount(toggles.Disabled);
    expect(disabled.element).toBeDisabled();
    const off = candidatesFor(disabled.classes);
    expect(resolve(off, disabled.element, NORMAL, "opacity").value, "disabled opacity").toBe("50%");
    expect(resolve(off, disabled.element, NORMAL, "cursor").value, "disabled cursor").toBe(
      "not-allowed",
    );
    cleanup();
    const enabled = mount(toggles.Default);
    const on = candidatesFor(enabled.classes);
    expect(
      resolve(on, enabled.element, HOVERED, "opacity").value,
      "enabled opacity",
    ).toBeUndefined();
    expect(resolve(on, enabled.element, HOVERED, "cursor").value, "enabled cursor").toBeUndefined();
  });

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
    // The caller's handler reaches the button: the state is the caller's, so a
    // part that swallowed `onClick` could never be pressed (layer 1, S2: only the
    // Default play's body said so).
    const onClick = vi.fn();
    render(<Toggle aria-label="Probe" aria-pressed type="submit" onClick={onClick} />);
    const pressed = screen.getByRole("button", { name: "Probe", pressed: true });
    expect(pressed).toHaveAttribute("type", "submit");
    pressed.click();
    expect(onClick, "the caller's onClick").toHaveBeenCalledTimes(1);
  });

  it("lets a caller's conflicting class win over the part's, and leaves the pressed rules alone", () => {
    // `cn` MERGES (D11): a caller's ground replaces the rest ground, it is not
    // appended beside it. A plain join here was GREEN (layer 1, LOW-1).
    render(<Toggle aria-label="Probe" className="bg-surface" />);
    const classes = (screen.getByRole("button", { name: "Probe" }).getAttribute("class") ?? "")
      .split(/\s+/)
      .filter(Boolean);
    expect(classes, "the caller's ground").toContain("bg-surface");
    expect(classes, "the part's rest ground, merged away").not.toContain("bg-raised");
    expect(classes, "the pressed ground, a different group").toContain("aria-pressed:bg-primary");
  });

  it('draws "mixed" as not pressed, and keeps the attribute', () => {
    // The docblock's claim, held (layer 1, LOW-2): the pressed rules select
    // `[aria-pressed="true"]`, and a part that coerced the value would announce
    // AND draw a mixed state as pressed.
    render(<Toggle aria-label="Probe" aria-pressed="mixed" />);
    const control = screen.getByRole("button", { name: "Probe" });
    expect(control).toHaveAttribute("aria-pressed", "mixed");
    const classes = (control.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
    const candidates = candidatesFor(classes);
    for (const property of DRAWN) {
      expect(resolve(candidates, control, NORMAL, property).value, `mixed ${property}`).toBe(
        EXPECTED.rest[property],
      );
    }
  });

  it("keeps the pressed state visible under forced colors, where every colour and the shadow are the mode's", () => {
    // Forced colors sends colours to two system colours and drops shadows, so
    // the pressed state has to differ in something the mode KEEPS. Without the
    // `forced-colors:` border the two states were byte-identical in headless
    // Chromium (layer 1, HIGH-1); jsdom cannot emulate the mode, so this reads
    // what the mode leaves an author to draw with, out of the sheet.
    const kept = (story: () => ReactElement): Record<string, string | undefined> => {
      const { element, classes } = mount(story);
      const candidates = candidatesFor(classes);
      const properties = [...new Set(candidates.map((c) => c.property))]
        .filter((property) => !FORCED_BY_THE_MODE.test(property))
        .sort();
      const out = Object.fromEntries(
        properties.map((property) => [
          property,
          resolve(candidates, element, FORCED, property).value,
        ]),
      );
      cleanup();
      return out;
    };
    const rest = kept(toggles.Default);
    const pressed = kept(toggles.Pressed);
    // Anchor: the mode leaves real geometry to compare, the border's width among it.
    expect(rest["border-width"], "the rest border under forced colors").toBe("2px");
    const differing = [...new Set([...Object.keys(rest), ...Object.keys(pressed)])].filter(
      (property) => rest[property] !== pressed[property],
    );
    expect(differing, "what forced colors keeps that tells pressed from rest").not.toEqual([]);
  });

  it("is the like square renamed, with every departure named and every upstream token accounted for", () => {
    // The four state arms read four properties; this reads the whole string, so
    // the box, the centring, the glyph size and the transition cannot go quietly
    // (layer 1, MED-1: each of them dropped was GREEN).
    const base = UPSTREAM.base.split(" ");
    for (const token of Object.keys(REPLACED)) {
      expect(base, `the departure for ${token} no longer applies`).toContain(token);
    }
    const expected = [
      ...base.flatMap((token) => REPLACED[token] ?? [renamed(token)]),
      ...UPSTREAM.rest
        .split(" ")
        .map(renamed)
        .map((token) => (token.startsWith("hover:") ? `not-aria-pressed:${token}` : token)),
      ...UPSTREAM.pressed.split(" ").map((token) => `aria-pressed:${renamed(token)}`),
      ...ADDED,
    ].sort();
    expect(
      toggleClass.split(/\s+/).filter(Boolean).sort(),
      "toggleClass against the like square renamed, with its departures",
    ).toEqual(expected);
  });
});
