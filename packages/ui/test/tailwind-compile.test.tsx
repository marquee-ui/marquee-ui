import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { cleanup, render } from "@testing-library/react";
import { composeStories } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import * as accordion from "../stories/accordion.stories.js";
import * as badge from "../stories/badge.stories.js";
import * as button from "../stories/button.stories.js";
import * as card from "../stories/card.stories.js";
import * as input from "../stories/input.stories.js";
import * as label from "../stories/label.stories.js";
import * as ribbon from "../stories/ribbon.stories.js";
import * as separator from "../stories/separator.stories.js";
import * as sheet from "../stories/sheet.stories.js";
import * as toast from "../stories/toast.stories.js";

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
    expect(css).toContain("@font-face");
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
    expect(css).toContain('font-family: "Boldonse"');
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
    const suites = {
      accordion,
      badge,
      button,
      card,
      input,
      label,
      ribbon,
      separator,
      sheet,
      toast,
    };
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

describe("every interactive element clears the 44px tap floor", () => {
  const offenders: string[] = [];
  const checked: string[] = [];

  beforeAll(() => {
    const vars = rootVars();
    const suites = {
      accordion,
      badge,
      button,
      card,
      input,
      label,
      ribbon,
      separator,
      sheet,
      toast,
    };
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
            for (const declaration of body.matchAll(/(?:min-height|height)\s*:\s*([^;]+)/g)) {
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
