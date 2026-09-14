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
