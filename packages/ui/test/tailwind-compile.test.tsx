import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ALERT_TONES } from "@/alert";
import { STORY_SUITES } from "./helpers/story-suites.js";

/**
 * The first REAL Tailwind compile of the emitted stylesheet.
 *
 * The tokens package emits `@theme` blocks and never compiles them; it is a
 * generator, and a generator's output can name a variable nothing reads. This is
 * the consumer that finds out: it runs Tailwind 4 over `dist/tokens.css`, the
 * component stylesheet and the component sources, and reads the DECLARATIONS the
 * role utilities produce - not the class names, the declarations.
 */

// Vitest's root is this repo's root, and `import.meta.url` is not a file URL
// under the jsdom project, so the path is resolved from the root and CHECKED -
// a silently missing fixture would compile an empty string and pass everything.
/**
 * `composeStories` returns a map whose values widen to `unknown` through a
 * namespace import, so the shape a story is USED as is stated once here rather
 * than cast at each call site. No `any`: the two members this file touches are
 * the render function and the optional play.
 */
type PlayableStory = ((props?: Record<string, unknown>) => ReactElement) & {
  play?: (context: { canvasElement: HTMLElement }) => Promise<void> | void;
};

const storiesOf = (module: object): [string, PlayableStory][] =>
  Object.entries(composeStories(module as Parameters<typeof composeStories>[0])) as [
    string,
    PlayableStory,
  ][];

const FIXTURE = resolve(process.cwd(), "packages/ui/test/fixtures/compile.css");
if (!existsSync(FIXTURE)) throw new Error(`compile fixture not found at ${FIXTURE}`);

let css = "";
/** Every class name the compile actually produced, unescaped. */
const compiled = new Set<string>();
/** class name -> the declaration bodies of every rule whose selector uses it. */
const declarations = new Map<string, string[]>();

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
      compiled.add(name);
      declarations.set(name, [...(declarations.get(name) ?? []), body]);
    }
  });
}, 60_000);

/**
 * Every declaration Tailwind emitted for a class, joined.
 *
 * Built by WALKING the parsed stylesheet and unescaping each selector, not by
 * building a regex out of the class name: a name like
 * `transition-[transform,box-shadow]` escapes into a pattern that is not a valid
 * regex at all, and one like `hover:-translate-y-0.5` escapes into one that matches
 * the wrong rule. The walk is the same one that fills `compiled`, so the two cannot
 * disagree about what exists.
 */
function rule(name: string): string {
  return declarations.get(name)?.join(" ") ?? "";
}

describe("the emitted stylesheet compiles", () => {
  it("produces a stylesheet at all", () => {
    // Anchor: every assertion below is a substring check, and they all pass
    // vacuously against a compile that silently produced nothing.
    expect(css.length).toBeGreaterThan(10_000);
    expect(css).toContain("--primary:");
    // NOT @font-face: the faces are their own sheet since a3, and this compile
    // imports only the tokens. `--font-display` is the equivalent anchor.
    expect(css).toContain("--font-display:");
  });

  it("resolves colour roles straight to their :root variable, not to a copy", () => {
    // `@theme inline` is why: a plain `@theme` would emit `--color-primary` into
    // the theme layer and the utility would read THAT, so a preset swapping
    // `--primary` at runtime would move nothing.
    expect(rule("bg-primary")).toContain("var(--primary)");
    expect(rule("text-foreground")).toContain("var(--foreground)");
    expect(rule("text-foreground-2")).toContain("var(--foreground-2)");
    expect(rule("bg-brand")).toContain("var(--brand)");
    expect(rule("border-border-strong")).toContain("var(--border-strong)");
    expect(rule("bg-scrim")).toContain("var(--scrim)");
    expect(rule("text-primary-ink")).toContain("var(--primary-ink)");
  });

  it("resolves the depth roles, including the offset block", () => {
    expect(rule("shadow-lift")).toContain("var(--shadow-lift)");
    expect(rule("shadow-band")).toContain("var(--shadow-band)");
    expect(rule("shadow-lg")).toContain("var(--shadow-lg)");
    // The form that actually ships: nothing writes `shadow-focus-ring` bare, and
    // asserting the bare name only worked while Tailwind was extracting candidates
    // out of this very file.
    expect(rule("focus-visible:shadow-focus-ring")).toContain("var(--shadow-focus-ring)");
    // …and does NOT re-emit them into the theme layer as self-references.
    expect(css).not.toContain("--shadow-lift: var(--shadow-lift)");
  });

  it("resolves the skeleton: the tap floor, the type scale and the tracking", () => {
    expect(rule("min-h-hit")).toContain("var(--hit-min)");
    expect(rule("text-3xs")).toContain("var(--text-3xs)");
    expect(rule("text-2xs")).toContain("var(--text-2xs)");
    expect(rule("tracking-label")).toContain("var(--tracking-label)");
    expect(rule("rounded-md")).toContain("var(--radius-md)");
  });

  it("resolves the three faces", () => {
    expect(rule("font-display")).toContain("var(--font-display)");
    expect(rule("font-mono")).toContain("var(--font-mono)");
    // The literal family name reaches the compile through the TOKEN, not through
    // an `@font-face`: the faces are their own sheet since a3 and this compile
    // imports only the tokens. Loading the file is the consumer's job.
    expect(css).toContain('--font-display: "Boldonse"');
    expect(css).not.toContain("@font-face");
  });

  it("ships the component stylesheet the ribbon imports", () => {
    expect(rule("mq-marquee")).toContain("max-content");
    expect(css).toContain("@keyframes mq-marquee");
    // The duration is per instance, so only the seam for a hand-rolled track.
    expect(rule("mq-marquee")).toContain("--mq-marquee-duration");
  });

  it("can tell a missing utility from a present one", () => {
    // The instrument's own reddening case: a name no `@theme` declares compiles
    // to nothing, and `rule()` returns "" rather than throwing.
    expect(rule("bg-primary")).not.toBe("");
    expect(rule("bg-no-such-role")).toBe("");
  });
});

/**
 * The other half of "a real compile": not that a sample of roles resolve, but
 * that EVERY class this package paints with is a utility Tailwind can build.
 *
 * The candidates are not read out of the source by a regex - they are collected
 * from the rendered DOM of every story, which is exactly the set of strings a
 * consumer's browser will be handed. A class that compiles to nothing looks
 * identical to one that works, in jsdom and in a screenshot of a component that
 * happened not to need it.
 */
describe("every class the parts render is a utility that compiles", () => {
  const rendered = new Set<string>();

  beforeAll(() => {
    const suites = STORY_SUITES;
    for (const module of Object.values(suites)) {
      for (const [, Story] of storiesOf(module)) {
        render(<Story />);
        // The sheet and the toast portal out of the container, so the whole
        // document is walked rather than just the mount point.
        for (const element of document.querySelectorAll<HTMLElement>("[class]")) {
          for (const token of element.getAttribute("class")!.split(/\s+/)) {
            if (token) rendered.add(token);
          }
        }
        cleanup();
      }
    }
  });

  afterAll(cleanup);

  it("collected a real candidate set", () => {
    // Anchor: an empty set would make the assertion below vacuous.
    expect(rendered.size).toBeGreaterThan(60);
    expect(rendered.has("bg-primary")).toBe(true);
    expect(rendered.has("mq-marquee")).toBe(true);
  });

  it("compiles every one of them", () => {
    const missing = [...rendered].filter((token) => !compiled.has(token)).sort();
    expect(missing).toEqual([]);
  });

  it("would notice a class that compiles to nothing", () => {
    // The instrument proved against its own violating sample.
    expect(compiled.has("bg-primary")).toBe(true);
    expect(compiled.has("bg-not-a-role")).toBe(false);
  });
});

/**
 * The 44px tap floor, in RESOLVED PIXELS.
 *
 * `min-h-hit` is a class rail on its own: it cannot say what height it produces, and
 * a variant that lost it looks identical in jsdom. Here both instruments are already
 * in the room, so the check is the real one - take every interactive element the
 * stories render, look up each of its classes in the COMPILED stylesheet, resolve
 * `var(--…)` against the sheet's own `:root`, convert to px, and demand 44.
 *
 * This is also what keeps a workbench story honest: a story is what a consumer
 * copies, so a badge-as-link at 24px in the sidebar is a 24px tap target in someone
 * else's product.
 */
const TAP_FLOOR_PX = 44;

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
 * A CSS length in px. Resolves `var()` against the sheet's own `:root`, and the one
 * `calc()` shape Tailwind's spacing scale emits (`calc(var(--spacing) * 11)`), which
 * is how `h-11` and `min-h-11` are written and therefore how three real controls in
 * this package declare their height. Null if it is not a length at all.
 */
function lengthPx(value: string, vars: Map<string, string>): number | null {
  const resolved = value
    .replace(/var\((--[a-z0-9-]+)\)/gi, (_, name: string) => vars.get(name) ?? "")
    .trim();
  const plain = /^(-?\d*\.?\d+)(px|rem)$/.exec(resolved);
  if (plain) return Number(plain[1]) * (plain[2] === "rem" ? 16 : 1);
  const scaled =
    /^calc\(\s*(-?\d*\.?\d+)(px|rem)\s*\*\s*(-?\d*\.?\d+)\s*\)$/.exec(resolved) ??
    /^calc\(\s*(-?\d*\.?\d+)\s*\*\s*(-?\d*\.?\d+)(px|rem)\s*\)$/.exec(resolved);
  if (!scaled) return null;
  const [a, b, c] = [scaled[1]!, scaled[2]!, scaled[3]!];
  return /^\d/.test(b)
    ? Number(a) * Number(b) * (c === "rem" ? 16 : 1)
    : Number(a) * Number(c) * (b === "rem" ? 16 : 1);
}

/**
 * The class list shared by every element a selector matches in one story - and
 * a throw if they disagree, so a read is never "whichever came first". The
 * selector is spelled out rather than built from a slot name because the pager
 * draws two kinds of link and the state must not be able to change a floor.
 */
function slotTokens(module: object, storyName: string, selector: string): string[] {
  const found = storiesOf(module).find(([name]) => name === storyName);
  if (!found) throw new Error(`no story named ${storyName}`);
  const Story = found[1];
  const { container } = render(<Story />);
  const elements = [...container.querySelectorAll(selector)];
  if (elements.length === 0) throw new Error(`${storyName} renders no ${selector}`);
  const lists = elements.map((element) => element.getAttribute("class") ?? "");
  if (new Set(lists).size !== 1) {
    throw new Error(`${storyName}: ${selector} matched elements wearing different classes`);
  }
  cleanup();
  return lists[0]!.split(/\s+/).filter(Boolean);
}

/** Every value the compiled sheet declares for one property across a class list. */
function declaredValues(classes: readonly string[], property: string): string[] {
  const out: string[] = [];
  for (const token of classes) {
    for (const match of rule(token).matchAll(
      new RegExp(`(?:^|[;\\s])${property}\\s*:\\s*([^;]+)`, "g"),
    )) {
      out.push(match[1]!.trim());
    }
  }
  return out;
}

describe("every interactive element clears the 44px tap floor", () => {
  const offenders: string[] = [];
  const checked: string[] = [];

  beforeAll(() => {
    const vars = rootVars();
    const suites = STORY_SUITES;
    for (const module of Object.values(suites)) {
      for (const [, Story] of storiesOf(module)) {
        render(<Story />);
        const interactive = document.querySelectorAll<HTMLElement>(
          'button, a[href], input, select, textarea, [role="button"]',
        );
        for (const element of interactive) {
          const tokens = (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);
          let best = 0;
          for (const token of tokens) {
            const body = rule(token);
            // Anchored: unanchored, `height` also matches inside `line-height:` and
            // `max-height:`, and every one of this package's controls carries a
            // `text-*` utility that emits a line-height (layer 1, LOW-3 - latent
            // rather than active, and this is the fix it named).
            for (const declaration of body.matchAll(
              /(?:^|[;\s])(?:min-height|height)\s*:\s*([^;]+)/g,
            )) {
              const px = lengthPx(declaration[1]!, vars);
              if (px !== null && px > best) best = px;
            }
          }
          const id = `${element.tagName.toLowerCase()}[data-slot=${element.dataset.slot ?? "-"}] "${(element.textContent ?? "").slice(0, 24)}"`;
          checked.push(id);
          if (best < TAP_FLOOR_PX) offenders.push(`${id} -> ${best}px`);
        }
        cleanup();
      }
    }
  });

  it("found interactive elements to measure, and resolved a real variable", () => {
    // Anchor: an empty candidate list, or a resolver that returns null for
    // everything, would make the assertion below vacuous.
    expect(checked.length).toBeGreaterThan(20);
    expect(rootVars().get("--hit-min")).toBe("44px");
    expect(lengthPx("var(--hit-min)", rootVars())).toBe(TAP_FLOOR_PX);
    expect(lengthPx("2.75rem", rootVars())).toBe(TAP_FLOOR_PX);
    // The spelling three real controls here use, via `h-11` / `min-h-11`.
    expect(lengthPx("calc(var(--spacing) * 11)", rootVars())).toBe(TAP_FLOOR_PX);
    expect(lengthPx("auto", rootVars())).toBeNull();
  });

  it("measures every one of them at or above the floor", () => {
    expect(offenders).toEqual([]);
  });
});

/**
 * THE TWO NAVIGATION FAMILIES' LOAD-BEARING GEOMETRY, IN RESOLVED DECLARATIONS.
 *
 * Both of these are invariants a class name cannot state and jsdom cannot see:
 *
 *   1. the trail is ONE LINE, and it is the tap-target rule rather than a look -
 *      the linked steps may not shrink, and the step you are standing on is the
 *      only item that may. `className.toContain("shrink-0")` is the rail the
 *      consuming product's own unit test is stuck with; here the pair is read as
 *      `flex-shrink: 0` on one item and NOT declared on the other, out of the
 *      compiled stylesheet;
 *   2. the pager's cells are 44px on BOTH axes. The package's floor guard above
 *      reads `min-height` and `height` only, so `min-w-11` - the axis a 1-digit
 *      page number actually needs - is measured nowhere else.
 *
 * ⚠️ Every class name here is read off a RENDERED STORY, never typed: a utility
 * named in a test file is a utility the test can conjure into existence, which is
 * why `fixtures/compile.css` names its sources.
 */
describe("the trail's one line and the pager's two axes, in resolved declarations", () => {
  const crumb = () => STORY_SUITES.breadcrumb;
  const pager = () => STORY_SUITES.pagination;

  it("found the classes to measure, and a sheet that can answer about them", () => {
    // Anchors: both helpers can return nothing, and everything below would then
    // pass vacuously. One positive read and one negative, in the same shapes.
    const item = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-item"]');
    expect(item.length).toBeGreaterThan(2);
    expect(declaredValues(item, "flex-shrink")).not.toEqual([]);
    expect(declaredValues(item, "border-collapse")).toEqual([]);
  });

  it("lets only the step you are standing on give way", () => {
    const item = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-item"]');
    const pageItem = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-page-item"]');
    // The linked steps: pinned at their own width, so a 44px tap band can never
    // end up over a neighbour's visible text.
    expect(declaredValues(item, "flex-shrink")).toEqual(["0"]);
    expect(declaredValues(item, "min-width")).toEqual([]);
    // The current step: allowed to shrink, and below its content, which is what
    // the truncation needs. A flex item's automatic minimum size is its content,
    // so `min-width: 0` is the whole difference between truncating and overflowing.
    expect(declaredValues(pageItem, "flex-shrink")).toEqual([]);
    expect(
      declaredValues(pageItem, "min-width").map((value) => lengthPx(value, rootVars())),
    ).toEqual([0]);
  });

  it("truncates the current step rather than wrapping the trail", () => {
    const page = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-page"]');
    expect(declaredValues(page, "overflow")).toEqual(["hidden"]);
    expect(declaredValues(page, "text-overflow")).toEqual(["ellipsis"]);
    expect(declaredValues(page, "white-space")).toEqual(["nowrap"]);
  });

  it("gives every tappable step of the trail the floor, in pixels", () => {
    const link = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-link"]');
    const heights = declaredValues(link, "min-height").map((value) => lengthPx(value, rootVars()));
    expect(heights).toEqual([TAP_FLOOR_PX]);
  });

  it("gives the pager's cells the floor on BOTH axes, which no other guard reads", () => {
    const vars = rootVars();
    // Both kinds of cell, because the page you are on is drawn from a different
    // string and a floor that moved with the state would be a floor nobody has.
    for (const [what, selector] of [
      ["the page you are on", '[data-slot="pagination-link"][aria-current="page"]'],
      ["every other page", '[data-slot="pagination-link"]:not([aria-current])'],
    ] as const) {
      const link = slotTokens(pager(), "Window", selector);
      expect(
        declaredValues(link, "min-height").map((value) => lengthPx(value, vars)),
        `${what}: min-height`,
      ).toEqual([TAP_FLOOR_PX]);
      expect(
        declaredValues(link, "min-width").map((value) => lengthPx(value, vars)),
        `${what}: min-width`,
      ).toEqual([TAP_FLOOR_PX]);
    }
  });
});

/**
 * THE NOTICE'S TONE, AND THE THREE THINGS IT DELIBERATELY DOES NOT DECIDE.
 *
 * A tone is the whole design of this family, and `className.toContain("border-destructive")`
 * cannot see any of it: the utility could compile to nothing, it could resolve to a
 * variable no preset declares, and jsdom would render the same DOM either way. What
 * follows reads the DECLARATIONS out of the compiled sheet, tone by tone, off
 * RENDERED stories - so a name typed into this file can never conjure the rule it
 * then asserts.
 *
 * The negative half matters as much: the part caps no width, sets no outer margin
 * and carries no tap floor, and every one of those is a thing a well-meaning edit
 * adds without noticing that it has taken a layout decision away from the page.
 */
describe("the notice's tone, in resolved declarations", () => {
  const alert = () => STORY_SUITES.alert;
  const box = (story: string) => slotTokens(alert(), story, '[data-slot="alert"]');

  /** Story -> the role its line and its ink must both resolve to. */
  const TONES: readonly [story: string, line: string, ink: string][] = [
    ["Default", "--border", "--foreground-2"],
    ["Destructive", "--destructive", "--destructive"],
    ["Success", "--success", "--success"],
    ["Warning", "--warning", "--warning"],
    ["Info", "--info", "--info"],
  ];

  it("measures every tone the part ships, and can answer about them", () => {
    // Anchors, positive and negative in the same shapes as the claims: a tone that
    // compiled to nothing and a property nothing declares are indistinguishable
    // from each other without these two.
    const classes = box("Default");
    expect(classes.length).toBeGreaterThan(4);
    expect(declaredValues(classes, "border-color")).not.toEqual([]);
    expect(declaredValues(classes, "border-collapse")).toEqual([]);
    // …and the table below is not a hand-typed list that tolerates zero rows:
    // emptying it left this file byte-identically green, and a SIXTH tone in the
    // part reached neither of this family's two tables (layer 1, MED-2, HIGH-2).
    // Both are now read off `ALERT_TONES`, so a new tone needs a STORY here.
    expect(TONES.map(([story]) => story.toLowerCase())).toEqual(Object.keys(ALERT_TONES));
  });

  it("resolves every tone's line AND ink to the role's own variable", () => {
    for (const [story, line, ink] of TONES) {
      const classes = box(story);
      expect(declaredValues(classes, "border-color"), `${story}: line`).toEqual([`var(${line})`]);
      expect(declaredValues(classes, "color"), `${story}: ink`).toEqual([`var(${ink})`]);
    }
  });

  it("draws the house line weight and the house radius, in pixels", () => {
    const vars = rootVars();
    const classes = box("Default");
    expect(declaredValues(classes, "border-width").map((v) => lengthPx(v, vars))).toEqual([2]);
    expect(declaredValues(classes, "padding").map((v) => lengthPx(v, vars))).toEqual([12]);
    expect(declaredValues(classes, "border-radius")).toEqual(["var(--radius-md)"]);
  });

  it("lets the tone reach the prose AND the headline: neither declares an ink", () => {
    const description = slotTokens(alert(), "Default", '[data-slot="alert-description"]');
    // The box HAS an ink (asserted above), and this element does not - which is
    // what makes a destructive notice destructive all the way down.
    expect(declaredValues(box("Default"), "color")).toEqual(["var(--foreground-2)"]);
    expect(declaredValues(description, "color")).toEqual([]);
    // The headline is a weight, never a second colour that could disagree.
    const title = slotTokens(alert(), "Default", '[data-slot="alert-title"]');
    expect(declaredValues(title, "color")).toEqual([]);
    expect(declaredValues(title, "font-weight")).not.toEqual([]);
  });

  it("is the flex column both docblocks say it is", () => {
    // Load-bearing, not decoration: the column is the reason there is no
    // `AlertAction` part (a control inside a notice stacks under the prose by
    // being a child) and the owner of the gutter between the parts. Deleting
    // `flex flex-col gap-2` left the WHOLE suite green - jsdom lays nothing out,
    // so nothing else here can see it (layer 1, MED-3).
    const vars = rootVars();
    const classes = box("Default");
    expect(declaredValues(classes, "display")).toEqual(["flex"]);
    expect(declaredValues(classes, "flex-direction")).toEqual(["column"]);
    expect(declaredValues(classes, "gap").map((v) => lengthPx(v, vars))).toEqual([8]);
  });

  it("decides no width, no outer margin and no tap floor", () => {
    const classes = box("Default");
    // A notice is not a control, so it carries no floor - and the moment one holds
    // a control, that control owes the floor, which the package's own floor guard
    // measures through the WithAction story.
    //
    // Every SPELLING, not two of them: `declaredValues` anchors its property name,
    // so `margin: 0` and `margin-inline: auto` are different reads and `mx-auto` -
    // the single most likely accidental addition to a notice box - went straight
    // through a list that named only `margin` and `margin-top` (layer 1, MED-1).
    const LAYOUT = [
      "min-height",
      "height",
      "width",
      "min-width",
      "max-width",
      "inline-size",
      "max-inline-size",
      "margin",
      "margin-top",
      "margin-bottom",
      "margin-left",
      "margin-right",
      "margin-inline",
      "margin-inline-start",
      "margin-inline-end",
      "margin-block",
      "margin-block-start",
      "margin-block-end",
    ];
    for (const property of LAYOUT) {
      expect(declaredValues(classes, property), property).toEqual([]);
    }
    // The instrument's own positive, in the same shape: it CAN see a property the
    // box really declares, so the empty reads above are a fact and not a spelling
    // nothing looks for.
    expect(declaredValues(classes, "padding")).not.toEqual([]);
  });
});

/**
 * THE FIELD'S DRAWING, IN RESOLVED DECLARATIONS.
 *
 * This family is the WIRING, so its four classes are the half no `play` can see:
 * jsdom lays nothing out, and `className.toContain("gap-1")` cannot say what a
 * gutter is in pixels or whether an ink is the role's own variable or a copy of
 * it. The wiring itself is asserted by the stories, which resolve every id the
 * control names back to the element carrying it.
 */
describe("the field's stack and its two inks, in resolved declarations", () => {
  const form = () => STORY_SUITES.form;
  const item = (story: string) => slotTokens(form(), story, '[data-slot="form-item"]');

  it("found the classes to measure, and a sheet that can answer about them", () => {
    // Anchors, positive and negative: a story that compiled to nothing and a
    // property nothing declares read the same without both of these.
    const classes = item("Default");
    expect(classes.length).toBeGreaterThan(2);
    expect(declaredValues(classes, "display")).not.toEqual([]);
    expect(declaredValues(classes, "border-collapse")).toEqual([]);
  });

  it("is the 4px-grid column the docblock says it is", () => {
    // `gap-1` and not the consuming product's `gap-1.5`: 6px is off the house's
    // 4px spacing grid, which AGENTS.md names as skeleton. In pixels, so a
    // silent move to another step is a number that changes rather than a class
    // name that still reads plausibly.
    const vars = rootVars();
    const classes = item("Default");
    expect(declaredValues(classes, "display")).toEqual(["flex"]);
    expect(declaredValues(classes, "flex-direction")).toEqual(["column"]);
    expect(declaredValues(classes, "gap").map((v) => lengthPx(v, vars))).toEqual([4]);
  });

  it("owns the type size, and the control overrides it with the 16px floor", () => {
    const vars = rootVars();
    // The item carries the size once, for the label, the description and the
    // message together - `Alert`'s arrangement with the two axes swapped.
    expect(declaredValues(item("Default"), "font-size").map((v) => lengthPx(v, vars))).toEqual([
      14,
    ]);
    // …and the control must NOT inherit it: anything under 16px makes iOS Safari
    // zoom the viewport on focus and never zoom back, which is why `Input`
    // declares `text-base` on itself. Read off the rendered control, not typed.
    const control = slotTokens(form(), "Default", "input");
    expect(declaredValues(control, "font-size").map((v) => lengthPx(v, vars))).toEqual([16]);
  });

  it("resolves the description's and the message's ink to the role's own variable", () => {
    const description = slotTokens(form(), "Described", '[data-slot="form-description"]');
    expect(declaredValues(description, "color")).toEqual(["var(--muted)"]);
    const message = slotTokens(form(), "Invalid", '[data-slot="form-message"]');
    expect(declaredValues(message, "color")).toEqual(["var(--destructive)"]);
    // Neither declares a size of its own: the item owns that (the arm above).
    expect(declaredValues(description, "font-size")).toEqual([]);
    expect(declaredValues(message, "font-size")).toEqual([]);
  });

  it("puts no drawing at all on the control slot", () => {
    // `FormControl` is a pure `Slot`: it renders the caller's element and adds
    // attributes. If it ever grew a class, the caller's own control would start
    // wearing a box it did not ask for - and the SAME element carries both class
    // lists, so this reads the rendered input's `data-slot` to prove the slot
    // really is the control before asserting about it.
    const control = slotTokens(form(), "Default", '[data-slot="form-control"]');
    expect(control).toEqual(slotTokens(form(), "Default", "input"));
    expect(declaredValues(control, "border-width").length).toBeGreaterThan(0);
  });

  it("decides no width, no outer margin and no tap floor", () => {
    // The field is a stack in someone else's column (the nav families' decision
    // 4, `Alert`'s decision 6), and the 44px floor is the CONTROL's - `Input`
    // carries it, and the package's own floor guard measures it through these
    // stories. Every spelling, because `declaredValues` anchors its property
    // name and `mx-auto` went straight through a shorter list (Alert layer 1).
    const classes = item("Default");
    const LAYOUT = [
      "min-height",
      "height",
      "width",
      "min-width",
      "max-width",
      "inline-size",
      "max-inline-size",
      "margin",
      "margin-top",
      "margin-bottom",
      "margin-left",
      "margin-right",
      "margin-inline",
      "margin-inline-start",
      "margin-inline-end",
      "margin-block",
      "margin-block-start",
      "margin-block-end",
      "padding",
      "border-width",
    ];
    for (const property of LAYOUT) {
      expect(declaredValues(classes, property), property).toEqual([]);
    }
    // The instrument's own positive, in the same shape.
    expect(declaredValues(classes, "gap")).not.toEqual([]);
  });
});

/**
 * The utilities a CONSUMER calls that no part in this package renders.
 *
 * A design system's contract is not only what its own components use. The consuming
 * app replaces its `@theme` block with this sheet, so any utility it already calls
 * has to survive that swap - and a utility that stops existing compiles to NOTHING,
 * with no rule, no warning and no failing build. It simply stops applying, and the
 * element falls back to whatever else it carries.
 *
 * `leading-display-wrap` is the first of these, and it is here because exactly that
 * nearly happened: the display face's ink leaves its em box, so a WRAPPED heading
 * collides with itself at the step's own line-height (1.1-1.2 above `lg`), and the
 * consuming app fixed 16 headings with a `--leading-display-wrap: 1.6` of its own.
 * Nothing in this package uses it, so nothing here would have noticed it missing.
 */
describe("the utilities a consumer calls survive the swap", () => {
  let contract = "";

  beforeAll(async () => {
    const fixture = resolve(process.cwd(), "packages/ui/test/fixtures/consumer-contract.css");
    if (!existsSync(fixture)) throw new Error(`contract fixture not found at ${fixture}`);
    const result = await postcss([tailwind()]).process(readFileSync(fixture, "utf8"), {
      from: fixture,
    });
    contract = result.css;
  }, 60_000);

  it("compiled something", () => {
    // Anchor: `toContain` on an empty string fails, but say so here rather than
    // three assertions later.
    expect(contract.length).toBeGreaterThan(1_000);
  });

  it("compiles leading-display-wrap to the role, not to a step's pair", () => {
    const match = /\.leading-display-wrap\s*\{([^}]*)\}/.exec(contract);
    // Say WHICH utility vanished. Without this the red is a chai type complaint
    // about `undefined`, which names nothing and proves nothing.
    expect(match, "`leading-display-wrap` compiled to no rule at all").not.toBeNull();
    // Measured, not predicted: Tailwind 4 sets its own `--tw-leading` alongside the
    // property, exactly as it does for `--tw-shadow`.
    expect(match?.[1]).toContain("line-height: var(--leading-display-wrap)");
    expect(match?.[1]).toContain("--tw-leading: var(--leading-display-wrap)");
    // …and the ROLE carries the measured value, rather than a size step's pair.
    expect(contract).toContain("--leading-display-wrap: 1.6;");
  });

  it("would notice a utility that compiles to nothing", () => {
    // The instrument's own reddening case, in the same shape as the claim.
    expect(/\.leading-no-such-role\s*\{/.test(contract)).toBe(false);
  });
});
