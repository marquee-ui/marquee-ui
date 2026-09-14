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

beforeAll(async () => {
  const result = await postcss([tailwind()]).process(readFileSync(FIXTURE, "utf8"), {
    from: FIXTURE,
  });
  css = result.css;
  postcss.parse(css).walkRules((node) => {
    for (const match of node.selector.matchAll(/\.((?:\\.|[^\s.,:>+~(){}[\]])+)/g)) {
      compiled.add(match[1]!.replace(/\\(.)/g, "$1"));
    }
  });
}, 60_000);

/** The body of the first rule whose selector starts with `.<name>`. */
function rule(name: string): string {
  const escaped = name.replace(/[.:[\]()/,%]/g, (c) => `\\${c}`);
  const match = new RegExp(`\\.${escaped.replace(/[\\^$*+?{}|]/g, "\\$&")}\\s*\\{([^}]*)\\}`).exec(
    css,
  );
  return match?.[1]?.trim() ?? "";
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
    expect(rule("shadow-focus-ring")).toContain("var(--shadow-focus-ring)");
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
