import { arcade } from "../../src/presets/arcade.js";
import type { Preset } from "../../src/roles.js";

/**
 * Presets built to FAIL one check each. Every check in this package is proved
 * against one of these, because a check nobody has watched fail is a check that
 * might not be able to.
 */

/** `foreground-2` dropped to the disabled-tier olive: 3.26:1 on `background`. */
export const lowContrastPreset: Preset = {
  ...arcade,
  name: "fixture-low-contrast",
  color: { ...arcade.color, "foreground-2": "olive-700" },
};

/** Ink on a fill, broken: white-on-yellow instead of near-black-on-yellow. */
export const lowContrastOnFillPreset: Preset = {
  ...arcade,
  name: "fixture-low-contrast-on-fill",
  color: { ...arcade.color, "primary-foreground": "olive-50" },
};

/** An exception for a pair that comfortably passes (17.86:1): a stale excuse. */
export const staleExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-stale-exception",
  contrastExceptions: [
    { ink: "foreground", ground: "background", ratio: 4.0, reason: "not a real shortfall" },
  ],
};

/** A real shortfall recorded as better than it is: the pair has got worse since. */
export const understatedExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-understated-exception",
  contrastExceptions: [
    { ink: "muted", ground: "overlay", ratio: 4.49, reason: "records a ratio it does not have" },
  ],
};

/** The destructive colour moved into the primary's own hue at the same luminance. */
export const indistinctPreset: Preset = {
  ...arcade,
  name: "fixture-indistinct",
  color: { ...arcade.color, destructive: "lime-600" },
};

/** An exception naming a pair the contrast matrix never makes. */
export const deadExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-dead-exception",
  contrastExceptions: [
    { ink: "scrim", ground: "background", ratio: 2, reason: "names a pair nothing checks" },
  ],
};

/** A real shortfall with no reason given: an exception nobody has to justify. */
export const emptyReasonPreset: Preset = {
  ...arcade,
  name: "fixture-empty-reason",
  contrastExceptions: [{ ink: "muted", ground: "overlay", ratio: 4.36, reason: "   " }],
};

/**
 * A real shortfall recorded as far worse than it is. Left unchecked this is the
 * dangerous direction: a pair recorded at 1.01 licenses every future regression down
 * to 1.01 without a single failure.
 */
export const overstatedExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-overstated-exception",
  contrastExceptions: [
    { ink: "muted", ground: "overlay", ratio: 1.01, reason: "records a floor, not a measurement" },
  ],
};

/** The unfilled half of a run dropped to a border colour: reads as undrawn. */
export const lowGraphicContrastPreset: Preset = {
  ...arcade,
  name: "fixture-low-graphic-contrast",
  color: { ...arcade.color, "scale-empty": "olive-800" },
};

/**
 * A primitive that is not a colour at all. culori throws rather than returning a
 * number, so without a guard this crashes the build with a TypeError naming neither
 * the preset nor the role.
 */
export const unparseableColorPreset: Preset = {
  ...arcade,
  name: "fixture-unparseable-colour",
  primitives: { ...arcade.primitives, "olive-600": "not-a-colour" },
};
