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

/**
 * Arcade as it stood BEFORE PALETTE-1: `muted` at #858c62, which measured 4.36:1 on
 * `overlay` and cleared every other ground (5.57 / 5.24 / 4.88 / 5.70).
 *
 * The exception fixtures are built on this rather than on Arcade, which now clears AA
 * everywhere. A fixture that spreads a PASSING preset and bolts an exception onto it
 * can only ever prove the stale-exception rule: every other rule needs a pair that
 * genuinely falls short, and this is the real one the mechanism was built for. It
 * fails on exactly ONE ground, so a message about it names one pair and not five.
 */
const preShortfall: Preset = {
  ...arcade,
  primitives: { ...arcade.primitives, "olive-600-pre-palette-1": "#858c62" },
  color: { ...arcade.color, muted: "olive-600-pre-palette-1" },
};

const shortfallReason =
  "the palette as it stood before PALETTE-1: 0.14 short of AA on the one ground, " +
  "and clearing it on the other four.";

/**
 * The POSITIVE case, and the one that stops every rule below from being satisfied by
 * a check that simply rejects all exceptions: accurate ratio, real reason, real
 * shortfall. This must produce no failures at all.
 */
export const acceptedExceptionPreset: Preset = {
  ...preShortfall,
  name: "fixture-accepted-exception",
  contrastExceptions: [{ ink: "muted", ground: "overlay", ratio: 4.36, reason: shortfallReason }],
};

/** The same shortfall, unrecorded: it must fail on the floor. */
export const unrecordedShortfallPreset: Preset = {
  ...preShortfall,
  name: "fixture-unrecorded-shortfall",
  contrastExceptions: [],
};

/** An exception for a pair that comfortably passes (17.86:1): a stale excuse. */
export const staleExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-stale-exception",
  contrastExceptions: [
    { ink: "foreground", ground: "background", ratio: 4.0, reason: "not a real shortfall" },
  ],
};

/**
 * An exception that outlived its fix. This is what Arcade's own exception became the
 * moment PALETTE-1 landed: the pair now measures 4.53:1 and the record says 4.36.
 */
export const outlivedExceptionPreset: Preset = {
  ...arcade,
  name: "fixture-outlived-exception",
  contrastExceptions: [{ ink: "muted", ground: "overlay", ratio: 4.36, reason: shortfallReason }],
};

/** A real shortfall recorded as better than it is: the pair has got worse since. */
export const understatedExceptionPreset: Preset = {
  ...preShortfall,
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
  ...preShortfall,
  name: "fixture-empty-reason",
  contrastExceptions: [{ ink: "muted", ground: "overlay", ratio: 4.36, reason: "   " }],
};

/**
 * A real shortfall recorded as far worse than it is. Left unchecked this is the
 * dangerous direction: a pair recorded at 1.01 licenses every future regression down
 * to 1.01 without a single failure.
 */
export const overstatedExceptionPreset: Preset = {
  ...preShortfall,
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
