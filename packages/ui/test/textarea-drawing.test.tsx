import { cleanup, render, screen } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import postcss, { type AtRule, type Node, type Rule } from "postcss";
import type { ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import { Textarea, textareaClass } from "@/textarea";
import * as inputStories from "../stories/input.stories.js";
import * as textareaStories from "../stories/textarea.stories.js";

/**
 * `Textarea` is `Input`'s field plus the pad a multi-line field owes, in
 * RESOLVED DECLARATIONS rather than class names.
 *
 * Three claims, each read out of the compiled stylesheet:
 *
 *   1. the textarea declares EXACTLY the field's declarations - each one keyed by
 *      the state it applies under (at rest, `:focus`, `::placeholder`), so a
 *      focus colour moved to rest or to `:hover` is a difference - plus
 *      `padding-block` and nothing else, so it cannot grow a face, a resize or a
 *      ring the field does not have;
 *   2. its first line starts where an `Input` puts its text: the input centres
 *      one line in its 44px box, and the textarea's `padding-block` is the
 *      spacing-grid step nearest that inset - derived here from the sheet's own
 *      numbers, never typed;
 *   3. the pad is in the string a PLAIN-JOIN consumer is handed, exactly once.
 *      This package's `cn` is a real tailwind-merge, so a leftover `p-3` beside
 *      `py-2` is resolved before anything renders and the rendered element looks
 *      perfect; a consumer whose `cn` joins gets both classes and the sheet's
 *      order picks. So claim 3 reads the exported string UNMERGED - the lesson
 *      `avatar-drawing.test.tsx` paid for (DESIGN-LIB-d-command, "as first
 *      written both arms were blind").
 *
 * ⚠️ jsdom lays nothing out, so "where the first line sits" is arithmetic over
 * declared values, not a measured box. The browser half is the consumer's.
 *
 * ⚠️ Every class name here is read off a RENDERED story or the part's own
 * export, never typed: `test/fixtures/compile.css` is `source(none)` precisely so
 * a test cannot compile a utility into existence by naming it.
 */

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

afterEach(cleanup);

const inputs = composeStories(inputStories);
const textareas = composeStories(textareaStories);

/** The classes on the one element a story renders for `selector`, off the DOM. */
function drawn(Story: () => ReactElement, selector: string): string[] {
  const { container } = render(<Story />);
  const found = container.querySelectorAll(selector);
  if (found.length !== 1)
    throw new Error(`expected one ${selector}, the story rendered ${found.length}`);
  const classes = (found[0]!.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
  cleanup();
  return classes;
}

/** Every property a class list declares, custom properties included. */
function propertiesOf(classes: readonly string[]): string[] {
  const out = new Set<string>();
  for (const token of classes) {
    for (const match of sheet.rule(token).matchAll(/(?:^|[;\s])(-{0,2}[a-z][a-z-]*)\s*:/g)) {
      out.add(match[1]!);
    }
  }
  return [...out].sort();
}

const px = (values: readonly string[]): (number | null)[] => values.map((v) => sheet.lengthPx(v));

const CLASS = /\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g;

/**
 * Every declaration a class list makes, as `<state> { <property>: <value> }`,
 * where the state is the rule's selector with the class itself written as `&`
 * (so `&`, `&:focus`, `&::placeholder`) plus any enclosing at-rule other than a
 * layer. `sheet.declaredValues` pools a property's values across every
 * selector, which cannot tell a focus colour from a resting one (layer 1,
 * MED-1: rest and focus borders swapped was GREEN); this keys on the state.
 */
function declarationsOf(classes: readonly string[]): string[] {
  const wanted = new Set(classes);
  const out: string[] = [];
  /** The at-rules and rules strictly between `from` and `to`, outermost first, layers dropped. */
  const between = (from: Node, to: Node | undefined): string => {
    const parts: string[] = [];
    for (
      let at = from.parent as Node | undefined;
      at && at !== to;
      at = at.parent as Node | undefined
    ) {
      if (at.type === "atrule" && (at as AtRule).name !== "layer") {
        parts.unshift(`@${(at as AtRule).name} ${(at as AtRule).params}`);
      } else if (at.type === "rule") {
        parts.unshift((at as Rule).selector);
      }
    }
    return parts.join(" ");
  };
  postcss.parse(sheet.css).walkRules((rule) => {
    for (const match of rule.selector.matchAll(CLASS)) {
      if (!wanted.has(match[1]!.replace(/\\(.)/g, "$1"))) continue;
      // An enclosing `@media` belongs to the state as much as a pseudo-class does.
      const state = [between(rule, undefined), rule.selector.replace(match[0], "&")]
        .filter(Boolean)
        .join(" ");
      rule.walkDecls((decl) => {
        const inner = between(decl, rule);
        out.push(`${state}${inner ? ` ${inner}` : ""} { ${decl.prop}: ${decl.value} }`);
      });
    }
  });
  return out.sort();
}

const propertyOf = (declaration: string): string => /\{ ([^:]+):/.exec(declaration)![1]!;

/**
 * The line box of a `text-*` utility in px. Tailwind 4 declares it as
 * `var(--tw-leading, var(--text-<step>--line-height))`, a unitless ratio the
 * `leading-*` utilities override; the field carries none, so the fallback is
 * the value.
 */
function lineHeightPx(classes: readonly string[], fontPx: number): number {
  const declared = sheet.declaredValues(classes, "line-height");
  if (declared.length !== 1)
    throw new Error(`expected one line-height, got ${declared.join(" | ")}`);
  const fallback = /^var\(--tw-leading,\s*var\((--[a-z0-9-]+)\)\)$/.exec(declared[0]!);
  if (!fallback) throw new Error(`unexpected line-height shape: ${declared[0]}`);
  const raw = sheet.rootVars().get(fallback[1]!);
  if (raw === undefined) throw new Error(`${fallback[1]} is not declared in :root`);
  const asLength = sheet.lengthPx(raw);
  return asLength ?? Number(raw) * fontPx;
}

describe("Textarea: Input's field, plus the pad a multi-line field owes", () => {
  it("found both fields rendered, and a sheet that can answer about them", () => {
    // Anchors: every arm below compares two class lists, and two empty lists
    // agree about everything.
    const input = drawn(inputs.Default, "input");
    const textarea = drawn(textareas.Default, "textarea");
    expect(input.length).toBeGreaterThan(5);
    expect(textarea.length).toBeGreaterThan(5);
    // Two DIFFERENT elements' lists (layer 1, LOW-4: a reader that returned the
    // input's list for both left this arm and the next one green).
    expect(textarea, "the textarea's classes are the input's").not.toEqual(input);
    // A positive read through `declaredValues`, which the negative premise below
    // relies on: a blind reader would pass the premise for nothing.
    expect(sheet.declaredValues(input, "min-height")).toHaveLength(1);
    expect(propertiesOf(input)).toEqual(
      expect.arrayContaining(["min-height", "border-width", "padding-inline", "font-size"]),
    );
    // The premise of the inset arithmetic: the input centres its line in the
    // whole box because it declares no vertical padding of its own.
    expect(sheet.declaredValues(input, "padding-block")).toEqual([]);
    expect(sheet.declaredValues(input, "padding")).toEqual([]);
  });

  it("declares exactly the field's declarations in every state, plus the pad and nothing else", () => {
    const input = drawn(inputs.Default, "input");
    const textarea = drawn(textareas.Default, "textarea");
    const field = declarationsOf(input);
    const own = declarationsOf(textarea);
    // Anchors: a real field with states, and a list that is not the field's own.
    expect(field.length).toBeGreaterThan(8);
    expect(field.some((d) => d.startsWith("&:focus "))).toBe(true);
    expect(field.some((d) => d.startsWith("&::placeholder "))).toBe(true);
    expect(
      field.filter((d) => !own.includes(d)),
      "a field declaration the textarea lacks, or makes in another state",
    ).toEqual([]);
    // BOTH directions (layer 1, MED-2: a one-way check let `font-mono
    // resize-none` through). What the textarea adds is one property; its VALUE
    // is the next arm's.
    expect(
      own.filter((d) => !field.includes(d)).map(propertyOf),
      "what the textarea declares beyond the field",
    ).toEqual(["padding-block"]);
  });

  it("starts its first line where an Input puts its text: the grid step nearest that inset", () => {
    const input = drawn(inputs.Default, "input");
    const textarea = drawn(textareas.Default, "textarea");
    const box = sheet.declared(input, "min-height");
    const edge = sheet.declared(input, "border-width");
    const font = sheet.declared(input, "font-size");
    const grid = sheet.lengthPx(sheet.rootVars().get("--spacing") ?? "");
    expect([box, edge, font, grid]).not.toContain(null);
    const inset = (box! - 2 * edge! - lineHeightPx(input, font!)) / 2;
    // Anchor: a real inset, strictly inside the box.
    expect(inset).toBeGreaterThan(0);
    const nearest = Math.round(inset / grid!) * grid!;
    expect(px(sheet.declaredValues(textarea, "padding-block")), "the rendered pad").toEqual([
      nearest,
    ]);
    expect(sheet.declaredValues(textarea, "padding")).toEqual([]);
  });

  it("carries that pad exactly once in the string a plain-join consumer is handed", () => {
    const handed = textareaClass.split(/\s+/).filter(Boolean);
    const rendered = drawn(textareas.Default, "textarea");
    expect(handed.length).toBeGreaterThan(5);
    expect(px(sheet.declaredValues(handed, "padding-block")), "the handed pad").toEqual(
      px(sheet.declaredValues(rendered, "padding-block")),
    );
    expect(
      sheet.declaredValues(handed, "padding-block"),
      "padding-block declarations",
    ).toHaveLength(1);
    for (const property of ["padding", "padding-top", "padding-bottom"]) {
      expect(sheet.declaredValues(handed, property), `a second ${property}`).toEqual([]);
    }
  });

  it("carries its slot, and appends the caller's class after the field's rather than replacing it", () => {
    // layer 1, MED-4 and LOW-1: dropping `className` from the `cn` call, or
    // renaming the slot, was GREEN. Four of the five product sites pass their
    // extras (`mt-1`, a taller `min-h-*`) through `className`.
    render(<Textarea aria-label="Notes" className="probe-caller" rows={2} />);
    const field = screen.getByRole("textbox", { name: "Notes" });
    expect(field.getAttribute("data-slot")).toBe("textarea");
    const classes = (field.getAttribute("class") ?? "").split(/\s+/);
    expect(classes.at(-1), "the caller's class, last").toBe("probe-caller");
    expect(classes.slice(0, -1), "the field's own string, intact").toEqual(
      textareaClass.split(/\s+/),
    );
    expect(field).toHaveAttribute("rows", "2");
  });
});
