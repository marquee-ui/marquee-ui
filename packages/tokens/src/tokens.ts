import type { DisplayPads } from "./font-metrics.js";
import type { ColorRoleName, Preset } from "./roles.js";
import { layout, motion, radius, space, tracking, typeScale, weight } from "./skeleton.js";

/**
 * ONE list, two emitters. `tokens.css` and `tokens.json` are both projections of
 * what `buildTokens` returns, so a token cannot exist in one output and not the
 * other - and `test/round-trip.test.ts` proves that by parsing both back, which is
 * what catches a line hand-added to either template.
 */

export type TokenType =
  | "color"
  | "dimension"
  | "duration"
  | "cubicBezier"
  | "shadow"
  | "fontFamily"
  | "fontWeight"
  | "number";

export interface Token {
  /** The custom property this token is declared as, e.g. `--background`. */
  cssVar: string;
  /** DTCG group path, e.g. `["color", "background"]`. */
  path: readonly [string, string];
  type: TokenType;
  /** The CSS value exactly as emitted. */
  value: string;
  /** DTCG alias path, when the value is a reference to another token. */
  alias?: readonly [string, string];
  /**
   * Where the declaration goes. `primitive` and `role` land in `:root`; `theme`
   * lands in the bare `@theme` block, because those names ARE Tailwind namespaces
   * and a `:root` copy would be a second definition of the same thing.
   */
  tier: "primitive" | "role" | "theme";
}

/** Prefix for tier-1 primitives, so a consumer's own `--olive-500` cannot collide. */
export const PRIMITIVE_PREFIX = "--mq-";

const primitiveVar = (key: string) => `${PRIMITIVE_PREFIX}${key}`;

/** `{role}` in a depth value means "the colour role", resolved to `var(--role)`. */
export function interpolateRoles(value: string, roleNames: ReadonlySet<string>): string {
  return value.replace(/\{([a-z0-9-]+)\}/gi, (_match, name: string) => {
    if (!roleNames.has(name)) {
      throw new Error(`depth value references unknown colour role "${name}": ${value}`);
    }
    return `var(--${name})`;
  });
}

/**
 * CSS generic families and the system keywords. These are KEYWORDS, not names: a
 * browser matches `sans-serif` to its default and `"sans-serif"` to a font actually
 * called that, so quoting one breaks the fallback silently.
 */
const UNQUOTED_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
  "ui-rounded",
  "math",
  "emoji",
  "fangsong",
]);

export function fontStack(family: string, stack: readonly string[]): string {
  // A vendor keyword (`-apple-system`) is also a keyword, never a family name.
  const quote = (name: string) =>
    UNQUOTED_FAMILIES.has(name.toLowerCase()) || name.startsWith("-") ? name : `"${name}"`;
  return [quote(family), ...stack.map(quote)].join(", ");
}

export function buildTokens(preset: Preset, pads: DisplayPads): Token[] {
  const tokens: Token[] = [];
  const roleNames = new Set(Object.keys(preset.color));

  for (const [key, literal] of Object.entries(preset.primitives)) {
    tokens.push({
      cssVar: primitiveVar(key),
      path: ["primitive", key],
      type: "color",
      value: literal,
      tier: "primitive",
    });
  }

  for (const role of Object.keys(preset.color) as ColorRoleName[]) {
    const key = preset.color[role];
    tokens.push({
      cssVar: `--${role}`,
      path: ["color", role],
      type: "color",
      value: `var(${primitiveVar(key)})`,
      alias: ["primitive", key],
      tier: "role",
    });
  }

  // Generated, never typed (D8): `cap-safe` and `descender-safe` read these.
  tokens.push(
    {
      cssVar: "--display-cap-pad",
      path: ["font", "display-cap-pad"],
      type: "dimension",
      value: pads.capPad,
      tier: "role",
    },
    {
      cssVar: "--display-descender-pad",
      path: ["font", "display-descender-pad"],
      type: "dimension",
      value: pads.descenderPad,
      tier: "role",
    },
  );

  const depth: readonly (readonly [string, string, TokenType, string])[] = [
    ["--shadow-lift", "lift", "shadow", preset.depth.lift],
    ["--border-width", "border-width", "dimension", preset.depth.borderWidth],
    ["--shadow-sm", "sm", "shadow", preset.depth.sm],
    ["--shadow-md", "md", "shadow", preset.depth.md],
    ["--shadow-lg", "lg", "shadow", preset.depth.lg],
    ["--shadow-focus-ring", "focus-ring", "shadow", preset.depth.focusRing],
  ];
  for (const [cssVar, name, type, raw] of depth) {
    tokens.push({
      cssVar,
      path: ["depth", name],
      type,
      value: interpolateRoles(raw, roleNames),
      tier: "role",
    });
  }

  for (const [name, value] of Object.entries(motion)) {
    tokens.push({
      cssVar: `--${name}`,
      path: ["motion", name],
      type: name.startsWith("dur-") ? "duration" : "cubicBezier",
      value,
      tier: "role",
    });
  }

  for (const [name, value] of Object.entries(layout)) {
    tokens.push({
      cssVar: `--${name}`,
      path: ["layout", name],
      type: "dimension",
      value,
      tier: "role",
    });
  }

  for (const [step, value] of Object.entries(space)) {
    tokens.push({
      cssVar: `--space-${step}`,
      path: ["space", step],
      type: "dimension",
      value,
      tier: "role",
    });
  }

  for (const [name, value] of Object.entries(weight)) {
    tokens.push({
      cssVar: `--weight-${name}`,
      path: ["weight", name],
      type: "fontWeight",
      value,
      tier: "role",
    });
  }

  const fonts = [
    ["display", preset.fonts.display],
    ["body", preset.fonts.body],
    ["mono", preset.fonts.mono],
  ] as const;
  for (const [role, face] of fonts) {
    tokens.push({
      cssVar: `--font-${role}`,
      path: ["font", role],
      type: "fontFamily",
      value: fontStack(face.family, face.stack),
      tier: "theme",
    });
  }

  for (const [step, entry] of Object.entries(typeScale)) {
    tokens.push({
      cssVar: `--text-${step}`,
      path: ["text", step],
      type: "dimension",
      value: entry.size,
      tier: "theme",
    });
    // A step with no pair emits no `line-height`, which is what keeps `reading`,
    // `2xs` and `3xs` identical to the arbitrary values they replaced.
    if ("lineHeight" in entry && entry.lineHeight) {
      tokens.push({
        cssVar: `--text-${step}--line-height`,
        path: ["text", `${step}-line-height`],
        type: "number",
        value: entry.lineHeight,
        tier: "theme",
      });
    }
  }

  for (const [name, value] of Object.entries(tracking)) {
    tokens.push({
      cssVar: `--tracking-${name}`,
      path: ["tracking", name],
      type: "dimension",
      value,
      tier: "theme",
    });
  }

  for (const [name, value] of Object.entries(radius)) {
    tokens.push({
      cssVar: `--radius-${name}`,
      path: ["radius", name],
      type: "dimension",
      value,
      tier: "theme",
    });
  }

  /**
   * Tailwind's own defaults, pointed at the roles. Verified against tailwindcss 4.x
   * `theme.css` (2026-09-14): `--default-font-family` is `--theme(--font-sans,
   * initial)` and preflight reads it, so a package that shipped only `--font-body`
   * would leave a consumer's body text on the system stack. Pointing the default at
   * the role is how the body font arrives without a second name for it.
   * `--default-transition-duration` is the line reduced motion depends on: Tailwind's
   * own default is a hardcoded 150ms that beats a base-layer rule, so `transition-*`
   * utilities keep animating under `prefers-reduced-motion` unless it reads the token.
   */
  tokens.push(
    {
      cssVar: "--default-font-family",
      path: ["tailwind", "default-font-family"],
      type: "fontFamily",
      value: "var(--font-body)",
      alias: ["font", "body"],
      tier: "theme",
    },
    {
      cssVar: "--default-mono-font-family",
      path: ["tailwind", "default-mono-font-family"],
      type: "fontFamily",
      value: "var(--font-mono)",
      alias: ["font", "mono"],
      tier: "theme",
    },
    {
      cssVar: "--default-transition-duration",
      path: ["tailwind", "default-transition-duration"],
      type: "duration",
      value: "var(--dur-fast)",
      alias: ["motion", "dur-fast"],
      tier: "theme",
    },
  );

  return tokens;
}
