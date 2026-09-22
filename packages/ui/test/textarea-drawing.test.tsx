import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import { textareaClass } from "@/textarea";
import * as inputStories from "../stories/input.stories.js";
import * as textareaStories from "../stories/textarea.stories.js";

/**
 * `Textarea` is `Input`'s field plus the pad a multi-line field owes, in
 * RESOLVED DECLARATIONS rather than class names.
 *
 * Three claims, each read out of the compiled stylesheet:
 *
 *   1. in every property `Input`'s field declares - box, line, ground, ink,
 *      placeholder, both focus declarations - the textarea declares the same
 *      values, so the two are one field and not two that happen to agree today;
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
    expect(propertiesOf(input)).toEqual(
      expect.arrayContaining(["min-height", "border-width", "padding-inline", "font-size"]),
    );
    // The premise of the inset arithmetic: the input centres its line in the
    // whole box because it declares no vertical padding of its own.
    expect(sheet.declaredValues(input, "padding-block")).toEqual([]);
    expect(sheet.declaredValues(input, "padding")).toEqual([]);
  });

  it("declares every property Input's field declares, with the same values", () => {
    const input = drawn(inputs.Default, "input");
    const textarea = drawn(textareas.Default, "textarea");
    const properties = propertiesOf(input);
    expect(properties.length).toBeGreaterThan(8);
    for (const property of properties) {
      expect(
        [...sheet.declaredValues(textarea, property)].sort(),
        `the textarea's ${property} is not the field's`,
      ).toEqual([...sheet.declaredValues(input, property)].sort());
    }
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
    expect(sheet.declaredValues(handed, "padding-block")).toHaveLength(1);
    for (const property of ["padding", "padding-top", "padding-bottom"]) {
      expect(sheet.declaredValues(handed, property), `a second ${property}`).toEqual([]);
    }
  });
});
