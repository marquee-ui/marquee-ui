/**
 * The skeleton: everything a preset may NOT move (D16 - a preset is a skin over one
 * opinionated skeleton, so layout, density, spacing and the type scale stay fixed).
 *
 * Every value here was read out of the upstream app's locked token sheet on
 * 2026-09-14 (the provenance table is in the package README). Nothing in this file
 * was typed from memory, and the three size-only steps and the two trackings are the
 * ones the upstream rename named.
 */

/** A step in the type scale. `lineHeight` is absent where the step is size-only. */
export interface TypeStep {
  size: string;
  lineHeight?: string;
}

/**
 * Mobile-first type scale. `reading`, `2xs` and `3xs` carry NO line-height on
 * purpose: they replaced arbitrary values that set none, and giving them one would
 * move type that the rename did not.
 */
export const typeScale = {
  "3xs": { size: "0.6rem" },
  "2xs": { size: "0.6875rem" },
  xs: { size: "0.75rem", lineHeight: "1.4" },
  sm: { size: "0.875rem", lineHeight: "1.45" },
  reading: { size: "0.9375rem" },
  base: { size: "1rem", lineHeight: "1.55" },
  md: { size: "1.125rem", lineHeight: "1.5" },
  lg: { size: "1.375rem", lineHeight: "1.35" },
  xl: { size: "1.75rem", lineHeight: "1.2" },
  "2xl": { size: "2.25rem", lineHeight: "1.1" },
  "3xl": { size: "2.75rem", lineHeight: "1.1" },
  /**
   * ONE continuous clamp, not a second clamp behind a media query: the two-clamp
   * form jumped ~12% at exactly 1280. 44px @390 - 57px @768 - 74px @1280, capped
   * at 76px. The display face's cap ink is taller than its em box, so the pair
   * cannot go below ~1.1 without lines colliding.
   */
  display: { size: "clamp(2.5rem, 1.93rem + 3.37vw, 4.75rem)", lineHeight: "1.12" },
} as const satisfies Record<string, TypeStep>;

export type TypeStepName = keyof typeof typeScale;

/**
 * Line-heights with a ROLE, as opposed to the pair that rides on a size step.
 *
 * `display-wrap` exists because the display face's ink leaves its em box, so a
 * heading that WRAPS collides with itself at the step's own line-height: every
 * `--text-*--line-height` above `lg` is between 1.1 and 1.2, which is right for one
 * line and wrong for two. The consuming app measured Boldonse's worst case at
 * 1.5357em on the 28px step and chose 1.6; this package carries that number rather
 * than re-deriving it, because the measurement was taken on a device.
 *
 * It is skeleton, not preset: D8 fixes the type scale, and a preset that could move
 * this could make wrapped headings collide again by changing nothing else.
 *
 * The name is load-bearing in one more way: it emits `--leading-display-wrap`, so
 * the utility is exactly `leading-display-wrap` and a consumer replacing its own
 * `@theme` block with this sheet keeps every call site it already has.
 */
export const leading = {
  "display-wrap": "1.6",
} as const;

/** The two letter-spacings with a role. 0.1em is Tailwind's own `widest`. */
export const tracking = {
  label: "0.12em",
  display: "-0.01em",
} as const;

export const weight = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

/** Strict 4px grid. Tailwind's default `--spacing` scale already equals this. */
export const space = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
} as const;

export const radius = {
  sm: "6px",
  md: "10px",
  lg: "16px",
  full: "9999px",
} as const;

export const motion = {
  "dur-fast": "150ms",
  "dur-base": "250ms",
  "ease-standard": "cubic-bezier(0.2, 0, 0, 1)",
  "ease-emphasis": "cubic-bezier(0.3, 0, 0, 1)",
} as const;

/**
 * Layout maxima and the tap-target floor. 44px is the accessibility rule, not a
 * taste call, which is why it is skeleton and not skin.
 */
export const layout = {
  "hit-min": "44px",
  "content-max": "720px",
  "page-max": "1280px",
} as const;

/**
 * The pad generator's two constants, and the only numbers in the font pipeline that
 * a font file cannot supply.
 *
 * ROUNDING_ALLOWANCE_PX: a browser rounds ascent, descent and the ink box to whole
 * pixels INDEPENDENTLY, so the real cut is up to ~1px larger than the geometry
 * predicts. That error is absolute, so in `em` it grows as the text shrinks.
 * Measured on a built board (Pixel 7, chromium, upstream): a 2.6px cut
 * at 12.8px text where the geometry predicted 1.8px.
 *
 * SMALLEST_TEXT_PX: the size the allowance is sized for. the upstream app picked ~6.7px by
 * the same reasoning ("0.3em covers every size down to about 6.7px"); 7px is that
 * floor, and the scale's own smallest step (`3xs`, 0.6rem = 9.6px) sits above it.
 */
export const PAD_ROUNDING_ALLOWANCE_PX = 1;
export const PAD_SMALLEST_TEXT_PX = 7;
/** Pads are rounded UP to this step, so a pad is always a readable number. */
export const PAD_STEP_EM = 0.05;
