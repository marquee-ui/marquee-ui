import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { loadCompiledSheet, type CompiledSheet } from "./helpers/compiled-sheet.js";
import { ALERT_TONES } from "@/alert";
import { inputClass } from "@/input";
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

let sheet: CompiledSheet;
beforeAll(async () => {
  sheet = await loadCompiledSheet();
}, 60_000);

describe("the emitted stylesheet compiles", () => {
  it("produces a stylesheet at all", () => {
    // Anchor: every assertion below is a substring check, and they all pass
    // vacuously against a compile that silently produced nothing.
    expect(sheet.css.length).toBeGreaterThan(10_000);
    expect(sheet.css).toContain("--primary:");
    // NOT @font-face: the faces are their own sheet since a3, and this compile
    // imports only the tokens. `--font-display` is the equivalent anchor.
    expect(sheet.css).toContain("--font-display:");
  });

  it("resolves colour roles straight to their :root variable, not to a copy", () => {
    // `@theme inline` is why: a plain `@theme` would emit `--color-primary` into
    // the theme layer and the utility would read THAT, so a preset swapping
    // `--primary` at runtime would move nothing.
    expect(sheet.rule("bg-primary")).toContain("var(--primary)");
    expect(sheet.rule("text-foreground")).toContain("var(--foreground)");
    expect(sheet.rule("text-foreground-2")).toContain("var(--foreground-2)");
    expect(sheet.rule("bg-brand")).toContain("var(--brand)");
    expect(sheet.rule("border-border-strong")).toContain("var(--border-strong)");
    expect(sheet.rule("bg-scrim")).toContain("var(--scrim)");
    expect(sheet.rule("text-primary-ink")).toContain("var(--primary-ink)");
  });

  it("resolves the depth roles, including the offset block", () => {
    expect(sheet.rule("shadow-lift")).toContain("var(--shadow-lift)");
    expect(sheet.rule("shadow-band")).toContain("var(--shadow-band)");
    expect(sheet.rule("shadow-lg")).toContain("var(--shadow-lg)");
    // The form that actually ships: nothing writes `shadow-focus-ring` bare, and
    // asserting the bare name only worked while Tailwind was extracting candidates
    // out of this very file.
    expect(sheet.rule("focus-visible:shadow-focus-ring")).toContain("var(--shadow-focus-ring)");
    // …and does NOT re-emit them into the theme layer as self-references.
    expect(sheet.css).not.toContain("--shadow-lift: var(--shadow-lift)");
  });

  it("resolves the skeleton: the tap floor, the type scale and the tracking", () => {
    expect(sheet.rule("min-h-hit")).toContain("var(--hit-min)");
    expect(sheet.rule("text-3xs")).toContain("var(--text-3xs)");
    expect(sheet.rule("text-2xs")).toContain("var(--text-2xs)");
    expect(sheet.rule("tracking-label")).toContain("var(--tracking-label)");
    expect(sheet.rule("rounded-md")).toContain("var(--radius-md)");
  });

  it("resolves the three faces", () => {
    expect(sheet.rule("font-display")).toContain("var(--font-display)");
    expect(sheet.rule("font-mono")).toContain("var(--font-mono)");
    // The literal family name reaches the compile through the TOKEN, not through
    // an `@font-face`: the faces are their own sheet since a3 and this compile
    // imports only the tokens. Loading the file is the consumer's job.
    expect(sheet.css).toContain('--font-display: "Boldonse"');
    expect(sheet.css).not.toContain("@font-face");
  });

  it("ships the component stylesheet the ribbon imports", () => {
    expect(sheet.rule("mq-marquee")).toContain("max-content");
    expect(sheet.css).toContain("@keyframes mq-marquee");
    // The duration is per instance, so only the seam for a hand-rolled track.
    expect(sheet.rule("mq-marquee")).toContain("--mq-marquee-duration");
  });

  it("can tell a missing utility from a present one", () => {
    // The instrument's own reddening case: a name no `@theme` declares compiles
    // to nothing, and `sheet.rule()` returns "" rather than throwing.
    expect(sheet.rule("bg-primary")).not.toBe("");
    expect(sheet.rule("bg-no-such-role")).toBe("");
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
    const missing = [...rendered].filter((token) => !sheet.has(token)).sort();
    expect(missing).toEqual([]);
  });

  it("would notice a class that compiles to nothing", () => {
    // The instrument proved against its own violating sample.
    expect(sheet.has("bg-primary")).toBe(true);
    expect(sheet.has("bg-not-a-role")).toBe(false);
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

describe("every interactive element clears the 44px tap floor", () => {
  const offenders: string[] = [];
  const checked: string[] = [];

  beforeAll(() => {
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
            const body = sheet.rule(token);
            // Anchored: unanchored, `height` also matches inside `line-height:` and
            // `max-height:`, and every one of this package's controls carries a
            // `text-*` utility that emits a line-height (layer 1, LOW-3 - latent
            // rather than active, and this is the fix it named).
            for (const declaration of body.matchAll(
              /(?:^|[;\s])(?:min-height|height)\s*:\s*([^;]+)/g,
            )) {
              const px = sheet.lengthPx(declaration[1]!);
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
    expect(sheet.rootVars().get("--hit-min")).toBe("44px");
    expect(sheet.lengthPx("var(--hit-min)")).toBe(TAP_FLOOR_PX);
    expect(sheet.lengthPx("2.75rem")).toBe(TAP_FLOOR_PX);
    // The spelling three real controls here use, via `h-11` / `min-h-11`.
    expect(sheet.lengthPx("calc(var(--spacing) * 11)")).toBe(TAP_FLOOR_PX);
    expect(sheet.lengthPx("auto")).toBeNull();
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
    expect(sheet.declaredValues(item, "flex-shrink")).not.toEqual([]);
    expect(sheet.declaredValues(item, "border-collapse")).toEqual([]);
  });

  it("lets only the step you are standing on give way", () => {
    const item = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-item"]');
    const pageItem = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-page-item"]');
    // The linked steps: pinned at their own width, so a 44px tap band can never
    // end up over a neighbour's visible text.
    expect(sheet.declaredValues(item, "flex-shrink")).toEqual(["0"]);
    expect(sheet.declaredValues(item, "min-width")).toEqual([]);
    // The current step: allowed to shrink, and below its content, which is what
    // the truncation needs. A flex item's automatic minimum size is its content,
    // so `min-width: 0` is the whole difference between truncating and overflowing.
    expect(sheet.declaredValues(pageItem, "flex-shrink")).toEqual([]);
    expect(
      sheet.declaredValues(pageItem, "min-width").map((value) => sheet.lengthPx(value)),
    ).toEqual([0]);
  });

  it("truncates the current step rather than wrapping the trail", () => {
    const page = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-page"]');
    expect(sheet.declaredValues(page, "overflow")).toEqual(["hidden"]);
    expect(sheet.declaredValues(page, "text-overflow")).toEqual(["ellipsis"]);
    expect(sheet.declaredValues(page, "white-space")).toEqual(["nowrap"]);
  });

  it("gives every tappable step of the trail the floor, in pixels", () => {
    const link = slotTokens(crumb(), "Trail", '[data-slot="breadcrumb-link"]');
    const heights = sheet.declaredValues(link, "min-height").map((value) => sheet.lengthPx(value));
    expect(heights).toEqual([TAP_FLOOR_PX]);
  });

  it("gives the pager's cells the floor on BOTH axes, which no other guard reads", () => {
    // Both kinds of cell, because the page you are on is drawn from a different
    // string and a floor that moved with the state would be a floor nobody has.
    for (const [what, selector] of [
      ["the page you are on", '[data-slot="pagination-link"][aria-current="page"]'],
      ["every other page", '[data-slot="pagination-link"]:not([aria-current])'],
    ] as const) {
      const link = slotTokens(pager(), "Window", selector);
      expect(
        sheet.declaredValues(link, "min-height").map((value) => sheet.lengthPx(value)),
        `${what}: min-height`,
      ).toEqual([TAP_FLOOR_PX]);
      expect(
        sheet.declaredValues(link, "min-width").map((value) => sheet.lengthPx(value)),
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
    expect(sheet.declaredValues(classes, "border-color")).not.toEqual([]);
    expect(sheet.declaredValues(classes, "border-collapse")).toEqual([]);
    // …and the table below is not a hand-typed list that tolerates zero rows:
    // emptying it left this file byte-identically green, and a SIXTH tone in the
    // part reached neither of this family's two tables (layer 1, MED-2, HIGH-2).
    // Both are now read off `ALERT_TONES`, so a new tone needs a STORY here.
    expect(TONES.map(([story]) => story.toLowerCase())).toEqual(Object.keys(ALERT_TONES));
  });

  it("resolves every tone's line AND ink to the role's own variable", () => {
    for (const [story, line, ink] of TONES) {
      const classes = box(story);
      expect(sheet.declaredValues(classes, "border-color"), `${story}: line`).toEqual([
        `var(${line})`,
      ]);
      expect(sheet.declaredValues(classes, "color"), `${story}: ink`).toEqual([`var(${ink})`]);
    }
  });

  it("draws the house line weight and the house radius, in pixels", () => {
    const classes = box("Default");
    expect(sheet.declaredValues(classes, "border-width").map((v) => sheet.lengthPx(v))).toEqual([
      2,
    ]);
    expect(sheet.declaredValues(classes, "padding").map((v) => sheet.lengthPx(v))).toEqual([12]);
    expect(sheet.declaredValues(classes, "border-radius")).toEqual(["var(--radius-md)"]);
  });

  it("lets the tone reach the prose AND the headline: neither declares an ink", () => {
    const description = slotTokens(alert(), "Default", '[data-slot="alert-description"]');
    // The box HAS an ink (asserted above), and this element does not - which is
    // what makes a destructive notice destructive all the way down.
    expect(sheet.declaredValues(box("Default"), "color")).toEqual(["var(--foreground-2)"]);
    expect(sheet.declaredValues(description, "color")).toEqual([]);
    // The headline is a weight, never a second colour that could disagree.
    const title = slotTokens(alert(), "Default", '[data-slot="alert-title"]');
    expect(sheet.declaredValues(title, "color")).toEqual([]);
    expect(sheet.declaredValues(title, "font-weight")).not.toEqual([]);
  });

  it("is the flex column both docblocks say it is", () => {
    // Load-bearing, not decoration: the column is the reason there is no
    // `AlertAction` part (a control inside a notice stacks under the prose by
    // being a child) and the owner of the gutter between the parts. Deleting
    // `flex flex-col gap-2` left the WHOLE suite green - jsdom lays nothing out,
    // so nothing else here can see it (layer 1, MED-3).
    const classes = box("Default");
    expect(sheet.declaredValues(classes, "display")).toEqual(["flex"]);
    expect(sheet.declaredValues(classes, "flex-direction")).toEqual(["column"]);
    expect(sheet.declaredValues(classes, "gap").map((v) => sheet.lengthPx(v))).toEqual([8]);
  });

  it("decides no width, no outer margin and no tap floor", () => {
    // A notice is not a control, so it carries no floor - and the moment one holds
    // a control, that control owes the floor, which the package's own floor guard
    // measures through the WithAction story. It caps no width and sets no outer
    // margin either: both are the page's (decision 6).
    //
    // ⚠️ THIS WAS A BLACKLIST OF EIGHTEEN PROPERTIES AND IT SAID "Every SPELLING",
    // AND IT WAS NOT. It grew a spelling at a time - `margin-inline` after
    // `mx-auto` went through a list naming only `margin` and `margin-top` (Alert
    // layer 1, MED-1) - which is the shape of a list that is one unlucky utility
    // behind, permanently. The `Form` family copied it and layer 1 proved the
    // hole with four utilities in one pass: `px-3`, `py-2`, `border-t-2` and
    // `max-h-40` all left the arm GREEN (DL10, MED-3), because `padding-inline`,
    // `padding-block`, `border-top-width` and `max-height` were not names anyone
    // had thought to add.
    //
    // So it is a WHITELIST now: every property the box's classes declare, as a
    // SET. A blacklist can only refuse what someone predicted; a whitelist
    // refuses everything nobody authorised, which is the actual claim - "the
    // notice decides nothing about its place in the page".
    const declared = new Set<string>();
    for (const token of box("Default")) {
      for (const match of sheet.rule(token).matchAll(/(?:^|[;\s])([a-z-]+)\s*:/g)) {
        declared.add(match[1]!);
      }
    }
    // The anchor: read off a real compiled stylesheet, so an empty set would mean
    // the instrument found nothing rather than that the box declares nothing.
    expect(declared.size).toBeGreaterThan(8);
    // Eleven, and every one is the box's own string: `flex` -> display,
    // `flex-col` -> flex-direction, `gap-2` -> gap, `rounded-md` -> border-radius,
    // `border-2` -> border-width AND the border-style Tailwind emits with it,
    // `p-3` -> padding, `text-sm` -> font-size and line-height, and the default
    // tone's `border-border` / `text-foreground-2` -> border-color and color.
    expect([...declared].sort()).toEqual([
      "border-color",
      "border-radius",
      "border-style",
      "border-width",
      "color",
      "display",
      "flex-direction",
      "font-size",
      "gap",
      "line-height",
      "padding",
    ]);
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
    expect(sheet.declaredValues(classes, "display")).not.toEqual([]);
    expect(sheet.declaredValues(classes, "border-collapse")).toEqual([]);
  });

  it("is the 4px-grid column the docblock says it is", () => {
    // `gap-1` and not the consuming product's `gap-1.5`: 6px is off the house's
    // 4px spacing grid, which AGENTS.md names as skeleton. In pixels, so a
    // silent move to another step is a number that changes rather than a class
    // name that still reads plausibly.
    const classes = item("Default");
    expect(sheet.declaredValues(classes, "display")).toEqual(["flex"]);
    expect(sheet.declaredValues(classes, "flex-direction")).toEqual(["column"]);
    expect(sheet.declaredValues(classes, "gap").map((v) => sheet.lengthPx(v))).toEqual([4]);
  });

  it("owns the type size, and the control overrides it with the 16px floor", () => {
    // The item carries the size once, for the label, the description and the
    // message together - `Alert`'s arrangement with the two axes swapped.
    expect(
      sheet.declaredValues(item("Default"), "font-size").map((v) => sheet.lengthPx(v)),
    ).toEqual([14]);
    // …and the control must NOT inherit it: anything under 16px makes iOS Safari
    // zoom the viewport on focus and never zoom back, which is why `Input`
    // declares `text-base` on itself. Read off the rendered control, not typed.
    const control = slotTokens(form(), "Default", "input");
    expect(sheet.declaredValues(control, "font-size").map((v) => sheet.lengthPx(v))).toEqual([16]);
  });

  it("resolves the description's and the message's ink to the role's own variable", () => {
    const description = slotTokens(form(), "Described", '[data-slot="form-description"]');
    expect(sheet.declaredValues(description, "color")).toEqual(["var(--muted)"]);
    const message = slotTokens(form(), "Invalid", '[data-slot="form-message"]');
    expect(sheet.declaredValues(message, "color")).toEqual(["var(--destructive)"]);
    // Neither declares a size of its own: the item owns that (the arm above).
    expect(sheet.declaredValues(description, "font-size")).toEqual([]);
    expect(sheet.declaredValues(message, "font-size")).toEqual([]);
  });

  it("puts no drawing at all on the control slot", () => {
    // `FormControl` is a pure `Slot`: it renders the caller's element and adds
    // attributes to it. If it ever grew a class, every control taken by the slot
    // would start wearing a box it did not ask for.
    //
    // ⚠️ THE OBVIOUS SPELLING OF THIS CANNOT FAIL. `Slot` MERGES its className
    // into the child's and its `data-slot` replaces the child's, so the slot and
    // the control are ONE element and `[data-slot="form-control"]` and `input`
    // select it twice - comparing them is a tautology, and it stayed green with
    // `className="rounded-md border-2"` added to the slot (mutation 12, run).
    // What can fail is the list being exactly `Input`'s own.
    const control = slotTokens(form(), "Default", '[data-slot="form-control"]');
    expect(control).toEqual(inputClass.split(" "));
    // The positive anchor: this really is the drawn control, so the equality
    // above is a statement about a rendered element and not about two empties.
    expect(sheet.declaredValues(control, "border-width").length).toBeGreaterThan(0);
  });

  it("declares exactly the properties the stack needs, and nothing else", () => {
    // ⚠️ A BLACKLIST OF PROPERTIES CANNOT BE COMPLETE, and this arm was one.
    // It named twenty - every width, every margin spelling, `padding`,
    // `border-width` - and `px-3`, `py-2`, `border-t-2` and `max-h-40` all went
    // straight through it, each one run (layer 1, MED-3). `Alert`'s equivalent
    // arm has the same hole and was where the list was copied from.
    //
    // So it is a WHITELIST: every property the item's classes declare, as a
    // SET, compared to the set the stack needs. A field is a column in someone
    // else's layout (the nav families' decision 4, `Alert`'s decision 6) and
    // the 44px floor is the CONTROL's, so anything else the item started
    // declaring - a box, a width, a margin, a height - reddens here without
    // anyone having had to think of its spelling first.
    const declared = new Set<string>();
    for (const token of item("Default")) {
      for (const match of sheet.rule(token).matchAll(/(?:^|[;\s])([a-z-]+)\s*:/g)) {
        declared.add(match[1]!);
      }
    }
    // The anchor: the set is read off a real compiled stylesheet, so an empty
    // one would mean the instrument found nothing rather than that the item
    // declares nothing.
    expect(declared.size).toBeGreaterThan(3);
    // Five, not four: `flex` -> display, `flex-col` -> flex-direction,
    // `gap-1` -> gap, and `text-sm` emits BOTH `font-size` and `line-height`,
    // which is Tailwind's type scale carrying its own leading.
    expect([...declared].sort()).toEqual([
      "display",
      "flex-direction",
      "font-size",
      "gap",
      "line-height",
    ]);
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

/**
 * The description list's four parts, in RESOLVED declarations.
 *
 * Each part is read off the story where the CALLER adds no class of its own, so
 * what the set contains is the part's own contribution and nothing else. Two of
 * the four contribute nothing at all, and that is an assertion here rather than a
 * sentence in a docblock.
 *
 * Every arm is a WHITELIST - the set of properties the part's classes declare,
 * equal to the set the drawing needs - and not a blacklist of properties it must
 * avoid. A blacklist refuses only what someone predicted; layer 1 of the `Form`
 * family proved the predicted list incomplete four ways in one sitting.
 */
describe("the description list's parts, in resolved declarations", () => {
  const dl = () => STORY_SUITES["description-list"];
  const declaredProperties = (classes: readonly string[]): string[] => {
    const found = new Set<string>();
    for (const token of classes) {
      for (const match of sheet.rule(token).matchAll(/(?:^|[;\s])([a-z-]+)\s*:/g))
        found.add(match[1]!);
    }
    return [...found].sort();
  };

  it("found the classes to measure, and a sheet that can answer about them", () => {
    // Anchors, positive and negative: a story that compiled to nothing and a
    // property nothing declares read the same without both of these.
    const term = slotTokens(dl(), "Default", '[data-slot="description-term"]');
    expect(term.length).toBeGreaterThan(3);
    expect(sheet.declaredValues(term, "color")).not.toEqual([]);
    expect(sheet.declaredValues(term, "border-collapse")).toEqual([]);
  });

  it("the list contributes nothing: every class on the dl is the caller's", () => {
    // Eight product sites, eight layouts, so there is no axis to name.
    //
    // ⚠️ READ OFF `Prose`, NOT `Live`, AND THAT IS LAYER 1's MED-6. `Live`'s caller
    // string is `grid grid-cols-2 gap-3`, so the mutation this arm exists to catch -
    // injecting a plausible default layout on the `dl` - was absorbed: the library's
    // `cn` merged the duplicate `grid grid-cols-2` away and the arm stayed GREEN
    // while the structure file's own arm reddened. `Prose` is a flex column, so an
    // injected grid cannot hide inside it.
    const list = slotTokens(dl(), "Prose", '[data-slot="description-list"]');
    expect(list).toEqual(["flex", "flex-col", "gap-4"]);
  });

  it("the detail contributes nothing either: the figure inside it is what varies", () => {
    // `LinkedFigure`'s details pass no className, so an empty class list IS the
    // part's whole drawing. The `dd`'s UA indent is Tailwind's preflight, the
    // same bet `BreadcrumbList` makes about a list's bullets.
    const details = slotTokens(dl(), "LinkedFigure", '[data-slot="description-details"]');
    expect(details).toEqual([]);
    expect(declaredProperties(details)).toEqual([]);
  });

  it("the term is the house micro-label, in resolved values", () => {
    const term = slotTokens(dl(), "Default", '[data-slot="description-term"]');
    // The NAMED tracking token, not one of the four literals the product spells:
    // `--tracking-label` exists for exactly this treatment.
    expect(sheet.declaredValues(term, "letter-spacing")).toEqual(["var(--tracking-label)"]);
    expect(sheet.rootVars().get("--tracking-label")).toBe("0.12em");
    // The ink resolves to the ROLE's own variable, never to a copy of its value.
    expect(sheet.declaredValues(term, "color")).toEqual(["var(--muted)"]);
    expect(sheet.declaredValues(term, "font-family")).toEqual(["var(--font-mono)"]);
    expect(sheet.declaredValues(term, "text-transform")).toEqual(["uppercase"]);
    // In pixels, so a silent move to another step is a number that changes rather
    // than a class name that still reads plausibly.
    expect(sheet.declaredValues(term, "font-size").map((v) => sheet.lengthPx(v))).toEqual([9.6]);
  });

  it("declares exactly the properties the term needs, and nothing else", () => {
    const term = slotTokens(dl(), "Default", '[data-slot="description-term"]');
    // Six, not five, and the extra one is Tailwind's rather than the drawing's:
    // `tracking-*` sets `--tw-tracking` beside `letter-spacing`, exactly as
    // `leading-*` sets `--tw-leading` (the consumer-contract arm below records
    // the same twin). And `text-3xs` emits font-size ALONE, where `text-sm` emits
    // a line-height with it: the house's three extra steps declare no paired
    // leading, so the type scale carries one only where Tailwind's own does.
    expect(declaredProperties(term)).toEqual([
      "--tw-tracking",
      "color",
      "font-family",
      "font-size",
      "letter-spacing",
      "text-transform",
    ]);
  });

  it("plain really is empty, so the two tones are a real axis", () => {
    // The negative half of the pair: `Prose`'s terms wear only what the caller
    // passed, which is what lets a site with one `text-*` of its own have nothing
    // to fight in a consumer whose `cn` is a join rather than a merge.
    const plain = slotTokens(dl(), "Prose", '[data-slot="description-term"]');
    expect(plain).toEqual(["font-semibold", "text-foreground"]);
    expect(sheet.declaredValues(plain, "text-transform")).toEqual([]);
    expect(sheet.declaredValues(plain, "font-family")).toEqual([]);
  });

  it("the group's two layouts are two different resolved drawings", () => {
    // `Prose` and `Inline` both pass no className on the item, so each set is the
    // variant's own contribution. The pair is the instrument: two values that
    // resolved the same would make every layout claim vacuous.
    const stack = slotTokens(dl(), "Prose", '[data-slot="description-item"]');
    const inline = slotTokens(dl(), "Inline", '[data-slot="description-item"]');
    expect(sheet.declaredValues(stack, "flex-direction")).toEqual(["column"]);
    expect(sheet.declaredValues(inline, "flex-direction")).toEqual([]);
    expect(sheet.declaredValues(inline, "align-items")).toEqual(["baseline"]);
    expect(sheet.declaredValues(stack, "align-items")).toEqual([]);
    // The 4px grid, in pixels: 4 stacked, 8 inline. Both on the grid AGENTS.md
    // names as skeleton, which is what broke both ties in the derivation.
    expect(sheet.declaredValues(stack, "gap").map((v) => sheet.lengthPx(v))).toEqual([4]);
    expect(sheet.declaredValues(inline, "gap").map((v) => sheet.lengthPx(v))).toEqual([8]);
  });

  it("declares exactly the properties each layout needs, and nothing else", () => {
    expect(declaredProperties(slotTokens(dl(), "Prose", '[data-slot="description-item"]'))).toEqual(
      ["display", "flex-direction", "gap"],
    );
    expect(
      declaredProperties(slotTokens(dl(), "Inline", '[data-slot="description-item"]')),
    ).toEqual(["align-items", "display", "flex-wrap", "gap"]);
  });
});
