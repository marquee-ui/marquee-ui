import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { displayPads } from "../src/font-metrics.js";
import { declaredCssVars, emitCss } from "../src/emit/css.js";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";
import { blocksNamed } from "./helpers/css-blocks.js";

const pads = displayPads(fileURLToPath(new URL("../fonts/boldonse.woff2", import.meta.url)));
const arcadeCss = emitCss(arcade, pads);
const lightCss = emitCss(light, pads);

/**
 * The emitted surface, asserted as a SET rather than by sampling.
 *
 * The round trip cannot see any of this: both emitters read one token list, so it is
 * symmetric under a collapse, and it skips `@theme inline` blocks by design. Whole
 * token families - every radius, every space step, `--hit-min`, the three Tailwind
 * `--default-*` keys - and whole mapping blocks were droppable in silence. This file
 * is where that stops.
 *
 * This list is the package's CONTRACT. Adding a token means adding it here, and that
 * edit is the review.
 */
const EMITTED_ROLE_AND_THEME_TOKENS = [
  // ground, line, ink
  "--background",
  "--surface",
  "--raised",
  "--overlay",
  "--sunken",
  "--border",
  "--border-strong",
  "--foreground",
  "--foreground-2",
  "--muted",
  "--foreground-faint",
  "--foreground-inverse",
  // identity and action
  "--brand",
  "--brand-foreground",
  "--brand-ink",
  "--primary",
  "--primary-foreground",
  "--primary-ink",
  "--primary-hover",
  "--primary-muted",
  // status
  "--destructive",
  "--destructive-muted",
  "--success",
  "--success-muted",
  "--warning",
  "--info",
  // data
  "--scale-0",
  "--scale-1",
  "--scale-2",
  "--scale-3",
  "--scale-4",
  "--scale-5",
  "--scale-track",
  "--scale-empty",
  "--categorical-1",
  "--categorical-2",
  "--scrim",
  // generated pads
  "--display-cap-pad",
  "--display-descender-pad",
  // depth
  "--shadow-lift",
  "--border-width",
  "--shadow-sm",
  "--shadow-md",
  "--shadow-lg",
  "--shadow-focus-ring",
  // motion
  "--dur-fast",
  "--dur-base",
  "--ease-standard",
  "--ease-emphasis",
  // layout
  "--hit-min",
  "--content-max",
  "--page-max",
  // space
  "--space-1",
  "--space-2",
  "--space-3",
  "--space-4",
  "--space-5",
  "--space-6",
  "--space-8",
  "--space-10",
  "--space-12",
  "--space-16",
  // weight
  "--weight-regular",
  "--weight-medium",
  "--weight-semibold",
  "--weight-bold",
  // fonts
  "--font-display",
  "--font-body",
  "--font-mono",
  // type scale: 12 steps, 9 of them with a line-height pair
  "--text-3xs",
  "--text-2xs",
  "--text-xs",
  "--text-xs--line-height",
  "--text-sm",
  "--text-sm--line-height",
  "--text-reading",
  "--text-base",
  "--text-base--line-height",
  "--text-md",
  "--text-md--line-height",
  "--text-lg",
  "--text-lg--line-height",
  "--text-xl",
  "--text-xl--line-height",
  "--text-2xl",
  "--text-2xl--line-height",
  "--text-3xl",
  "--text-3xl--line-height",
  "--text-display",
  "--text-display--line-height",
  "--tracking-label",
  "--tracking-display",
  "--radius-sm",
  "--radius-md",
  "--radius-lg",
  "--radius-full",
  // Tailwind's own defaults, pointed at the roles
  "--default-font-family",
  "--default-mono-font-family",
  "--default-transition-duration",
] as const;

describe("the emitted token surface", () => {
  it("declares exactly the contract, no more and no less", () => {
    const declared = declaredCssVars(arcadeCss);
    const primitives = declared.filter((name) => name.startsWith("--mq-"));
    const rest = declared.filter((name) => !name.startsWith("--mq-"));
    expect(rest).toEqual([...EMITTED_ROLE_AND_THEME_TOKENS].sort());
    expect(primitives).toEqual(
      Object.keys(arcade.primitives)
        .map((key) => `--mq-${key}`)
        .sort(),
    );
    expect(declared).toHaveLength(126);
  });

  it("gives both presets the identical non-primitive surface", () => {
    // A preset is a SKIN: it may move colours and faces, never the contract.
    const strip = (css: string) => declaredCssVars(css).filter((n) => !n.startsWith("--mq-"));
    expect(strip(lightCss)).toEqual(strip(arcadeCss));
  });
});

describe("the Tailwind mapping blocks", () => {
  it("maps every colour role into the colour namespace", () => {
    // Without this block `bg-surface` and `text-foreground` do not compile and the
    // package is inert; `declaredCssVars` skips inline blocks, so nothing else sees it.
    const [mapping] = blocksNamed(arcadeCss, "@theme inline {");
    expect(mapping).toBeDefined();
    const roleNames = Object.keys(arcade.color).sort();
    const mapped = Object.keys(mapping!)
      .filter((name) => name.startsWith("--color-"))
      .map((name) => name.slice("--color-".length))
      .sort();
    expect(mapped).toEqual(roleNames);
    for (const role of roleNames) {
      expect(mapping![`--color-${role}`]).toBe(`var(--${role})`);
    }
  });

  it("maps the layout tokens Tailwind reaches under other namespaces", () => {
    const [mapping] = blocksNamed(arcadeCss, "@theme inline {");
    expect(mapping!["--spacing-hit"]).toBe("var(--hit-min)");
    expect(mapping!["--container-content"]).toBe("var(--content-max)");
    expect(mapping!["--container-page"]).toBe("var(--page-max)");
  });

  it("compiles the shadow and easing utilities without re-emitting the variables", () => {
    const [reference] = blocksNamed(arcadeCss, "@theme inline reference");
    expect(reference).toEqual({
      "--shadow-sm": "var(--shadow-sm)",
      "--shadow-md": "var(--shadow-md)",
      "--shadow-lg": "var(--shadow-lg)",
      "--shadow-lift": "var(--shadow-lift)",
      "--shadow-focus-ring": "var(--shadow-focus-ring)",
      "--ease-standard": "var(--ease-standard)",
      "--ease-emphasis": "var(--ease-emphasis)",
    });
  });

  it("zeroes both durations under prefers-reduced-motion", () => {
    const [reduced] = blocksNamed(arcadeCss, "@media (prefers-reduced-motion");
    expect(reduced).toEqual({ "--dur-fast": "0ms", "--dur-base": "0ms" });
  });
});

describe("the emitted @font-face rules", () => {
  it("ships every descriptor for every face, not just the src", () => {
    const blocks = blocksNamed(arcadeCss, "@font-face");
    expect(blocks).toHaveLength(3);
    const faces = [arcade.fonts.display, arcade.fonts.body, arcade.fonts.mono];
    for (const [index, face] of faces.entries()) {
      expect(blocks[index]).toEqual({
        "font-family": `"${face.family}"`,
        "font-style": face.style,
        // Load-bearing for the variable body face: a single weight would flatten it.
        "font-weight": face.weight,
        "font-display": "swap",
        src: `url("./fonts/${face.file}") format("woff2")`,
      });
    }
    expect(blocks[1]!["font-weight"]).toBe("300 700");
  });
});

describe("blocksNamed", () => {
  it("reads a block's declarations, including nested ones", () => {
    const css = "@media (x) {\n  :root {\n    --a: 1px;\n  }\n}\n:root {\n  --b: 2px;\n}\n";
    expect(blocksNamed(css, "@media (x)")).toEqual([{ "--a": "1px" }]);
  });

  it("does not confuse `@theme inline` with `@theme inline reference`", () => {
    const css = "@theme inline {\n  --a: 1px;\n}\n@theme inline reference {\n  --b: 2px;\n}\n";
    expect(blocksNamed(css, "@theme inline {")).toEqual([{ "--a": "1px" }]);
    expect(blocksNamed(css, "@theme inline reference")).toEqual([{ "--b": "2px" }]);
  });

  it("returns nothing for a prelude that is not there", () => {
    expect(blocksNamed(":root {\n  --a: 1px;\n}\n", "@supports")).toEqual([]);
  });
});
