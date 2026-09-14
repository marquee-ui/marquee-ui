/**
 * The role contract (DESIGN-LIB D8).
 *
 * A PRESET is a complete, typed assignment of every role in this file. Roles are
 * named the way shadcn names them wherever the two overlap, so a component copied
 * out of the registry reads the same here as it does there.
 *
 * Three tiers, and the tier boundary is enforced by the types below:
 *   1. primitives - the only place a colour LITERAL may appear (`--mq-lime-500`).
 *   2. roles      - what the system talks in (`--background`); every value is a
 *                   primitive KEY, so a role can never invent a colour.
 *   3. the Tailwind mapping - emitted, not authored (see `src/emit/css.ts`).
 *
 * What is NOT here, on purpose: the type scale, the spacing grid, the radii, the
 * motion durations and the layout maxima. D16 makes a preset a SKIN over ONE
 * skeleton, so those live in `src/skeleton.ts` and no preset may move them.
 */

/** A colour literal. Only `src/presets/**` may write one (`test/literal-guard.test.ts`). */
export type ColorLiteral = string;

/** A CSS length, duration or easing literal. */
export type Scalar = string;

/**
 * Ground roles: the surfaces ink sits on, darkest-first in a dark preset and
 * lightest-first in a light one. `sunken` is BELOW the page, `raised` and
 * `overlay` are above it.
 */
export interface GroundRoles<K extends string> {
  background: K;
  surface: K;
  raised: K;
  overlay: K;
  sunken: K;
}

/** Line roles: the two weights of border the system draws. */
export interface LineRoles<K extends string> {
  border: K;
  "border-strong": K;
}

/**
 * Ink roles. `foreground-faint` is the disabled/inactive tier and is deliberately
 * NOT in the 4.5:1 set: WCAG 1.4.3 exempts text in an inactive component.
 * `foreground-inverse` is ink for a light-on-dark inversion inside a dark preset.
 */
export interface InkRoles<K extends string> {
  foreground: K;
  "foreground-2": K;
  muted: K;
  "foreground-faint": K;
  "foreground-inverse": K;
}

/**
 * Identity, split from action (D8). `brand` is the wordmark/heading/key-figure
 * colour as a FILL, `brand-ink` is the same identity used as TEXT, and they are
 * separate roles from day one because an accent that passes as a fill can fail
 * as text on a light ground. `brand-foreground` is the ink that sits ON a brand fill.
 */
export interface IdentityRoles<K extends string> {
  brand: K;
  "brand-foreground": K;
  "brand-ink": K;
}

/** Action: buttons and links. Same split, same reason. */
export interface ActionRoles<K extends string> {
  primary: K;
  "primary-foreground": K;
  "primary-ink": K;
  "primary-hover": K;
  "primary-muted": K;
}

/** Status. Each is an ink role: it is read as text before it is read as a fill. */
export interface StatusRoles<K extends string> {
  destructive: K;
  "destructive-muted": K;
  success: K;
  "success-muted": K;
  warning: K;
  info: K;
}

/**
 * Data colour. The six-step scale is a SINGLE-HUE luminance ramp: value reads by
 * luminance, never by hue-morality. `scale-track` is the unfilled bar, `scale-empty`
 * the unfilled glyph in a run (the denominator of the value, so WCAG 1.4.11's 3:1
 * applies to it and not to the steps, which are always paired with a numeral).
 * The categorical set is small on purpose: it holds the series the system actually
 * draws, and grows when a chart needs a third.
 */
export interface DataRoles<K extends string> {
  "scale-0": K;
  "scale-1": K;
  "scale-2": K;
  "scale-3": K;
  "scale-4": K;
  "scale-5": K;
  "scale-track": K;
  "scale-empty": K;
  "categorical-1": K;
  "categorical-2": K;
}

/** Everything else that is a flat colour. */
export interface UtilityColorRoles<K extends string> {
  scrim: K;
}

export type ColorRoles<K extends string> = GroundRoles<K> &
  LineRoles<K> &
  InkRoles<K> &
  IdentityRoles<K> &
  ActionRoles<K> &
  StatusRoles<K> &
  DataRoles<K> &
  UtilityColorRoles<K>;

export type ColorRoleName = keyof ColorRoles<string> & string;

/**
 * One font face the preset ships. The `@font-face` rule is emitted WITH the preset
 * (D8) so a face is always loaded: a preset that names a family it does not ship is
 * a preset that renders as a fallback.
 */
export interface FontRole {
  /** CSS `font-family` name, e.g. `Boldonse`. */
  family: string;
  /** Fallbacks appended after `family`, in order. */
  stack: readonly string[];
  /** woff2 filename inside the package's `fonts/` directory. */
  file: string;
  /** `font-weight` descriptor: a single weight (`400`) or a variable range (`300 700`). */
  weight: string;
  style: "normal" | "italic";
}

/**
 * Type roles. The display face carries two generated pads (D8): `cap-safe` and
 * `descender-safe` READ them instead of hardcoding one font's metrics, and the
 * build computes them from the woff2 with an OpenType parser. They are NOT
 * declared here for that reason - a typed pad is a pad that rots.
 */
export interface FontRoles {
  display: FontRole;
  body: FontRole;
  mono: FontRole;
}

/**
 * Depth, as two decisions rather than five values (D8): the hard offset block and
 * the line weight are one house-style call, and the three soft shadows are the
 * elevation ramp under it. `lift` and `focusRing` may interpolate a colour ROLE as
 * `{role-name}`; the emitter resolves it to `var(--role-name)`.
 */
export interface DepthRoles {
  lift: Scalar;
  borderWidth: Scalar;
  sm: Scalar;
  md: Scalar;
  lg: Scalar;
  focusRing: Scalar;
}

/**
 * A contrast pair this preset knowingly ships below the floor, with the ratio it
 * measured at and why. It is not an escape hatch: the check fails if the pair now
 * PASSES (a stale exception) or if it has got worse than the recorded ratio, so an
 * exception dies the moment the colour is fixed and cannot silently rot further.
 */
export interface ContrastException {
  ink: ColorRoleName;
  ground: ColorRoleName;
  /** The ratio measured when the exception was written. */
  ratio: number;
  reason: string;
}

export interface Preset<K extends string = string> {
  /** Preset id; becomes the emitted filename and the `$description` in the JSON. */
  name: string;
  colorScheme: "dark" | "light";
  /** The ONLY colour literals in the package. Keys are primitive names, unprefixed. */
  primitives: Readonly<Record<K, ColorLiteral>>;
  color: ColorRoles<K>;
  fonts: FontRoles;
  depth: DepthRoles;
  contrastExceptions: readonly ContrastException[];
}

/**
 * Declares a preset and pins `K` to its own primitive keys, so `color.background`
 * can only name a primitive this preset actually declares. A typo is a type error,
 * not a `var(--mq-undefined)` in the shipped CSS.
 */
export function definePreset<const P extends Record<string, ColorLiteral>>(
  preset: Omit<Preset<Extract<keyof P, string>>, "primitives"> & { primitives: P },
): Preset<Extract<keyof P, string>> {
  return preset;
}

/** The grounds every ink role is checked against. */
export const GROUND_ROLES = [
  "background",
  "surface",
  "raised",
  "overlay",
  "sunken",
] as const satisfies readonly ColorRoleName[];

/**
 * The ink roles that carry body text, and so must clear WCAG 1.4.3 AA (4.5:1) on
 * every ground. `foreground-faint` is absent by 1.4.3's inactive-component
 * exemption; the data roles are absent because they are graphics paired with a
 * numeral, not text.
 */
export const BODY_INK_ROLES = [
  "foreground",
  "foreground-2",
  "muted",
  "brand-ink",
  "primary-ink",
  "destructive",
  "success",
  "warning",
  "info",
] as const satisfies readonly ColorRoleName[];

/** Ink-on-fill pairs: [ink, fill]. */
export const ON_FILL_PAIRS = [
  ["brand-foreground", "brand"],
  ["primary-foreground", "primary"],
] as const satisfies readonly (readonly [ColorRoleName, ColorRoleName])[];

/**
 * Pairs that must stay perceptually distinct. The action colour and the destructive
 * colour are the one pair where confusing two roles costs a user data.
 */
export const DISTINCT_PAIRS = [["primary", "destructive"]] as const satisfies readonly (readonly [
  ColorRoleName,
  ColorRoleName,
])[];
