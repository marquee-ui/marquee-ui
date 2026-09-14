import { definePreset } from "../roles.js";
import { arcade } from "./arcade.js";

/**
 * Light: the maintained second preset (D8). the upstream app never enables it - its dark-only
 * rule is untouched - and it exists so the role contract has to survive a
 * ground inversion, which is the thing a palette swap does NOT reach.
 *
 * What it proves, and the reason the identity/action split exists at all: the acid
 * yellow stays the FILL (`brand`, `primary`), and every place the yellow was used as
 * INK on dark takes a darkened olive here (`brand-ink`, `primary-ink`). #e4ff3a on
 * white is 1.1:1 - unreadable as text and, as a focus ring, below WCAG 1.4.11's 3:1
 * - so the focus ring reaches for `primary-ink` too. The skeleton (type, spacing,
 * radii, motion, the pads) is identical to Arcade by construction: D16 makes a
 * preset a skin, and the fonts are re-exported from Arcade rather than restated.
 *
 * Contrast measured with culori's `wcagContrast` while the palette was chosen:
 * worst pair `muted` on `sunken` at 5.25:1, so this preset ships NO exceptions.
 */
export const light = definePreset({
  name: "light",
  colorScheme: "light",

  primitives: {
    "paper-0": "#ffffff",
    "paper-50": "#fdfef8",
    "paper-100": "#f9fbf1",
    "paper-200": "#f2f5e8",
    "paper-300": "#e6ead6",
    "olive-300": "#d5dbc0",
    "olive-400": "#b3bc94",
    "olive-500": "#838b63",
    "olive-600": "#74804f",
    "olive-700": "#5a6240",
    "olive-800": "#454c2e",
    "olive-950": "#14170c",
    // The identity yellow is NOT a step in the olive ramp: it is the one colour the
    // preset may not move, so it keeps its own name at its own luminance.
    "acid-100": "#f4ffb8",
    "acid-500": "#e4ff3a",
    "acid-600": "#d3f236",
    // The six-step scale, inverted for a light ground: value reads by ink weight
    // rather than by brightness, and it stays single-hue.
    "lime-200": "#c2d182",
    "lime-300": "#a8bb63",
    "lime-400": "#8ea347",
    "lime-500": "#74892f",
    "lime-600": "#5c6f1a",
    "lime-700": "#4a5a00",
    "teal-800": "#00655c",
    "red-100": "#fbe4e2",
    "red-700": "#b3261e",
    "green-100": "#ddf3e6",
    "green-800": "#146c43",
    "amber-800": "#7a4f00",
    "scrim-55": "rgba(20, 23, 12, 0.55)",
  },

  color: {
    background: "paper-200",
    surface: "paper-100",
    raised: "paper-50",
    overlay: "paper-0",
    sunken: "paper-300",

    border: "olive-300",
    "border-strong": "olive-400",

    foreground: "olive-950",
    "foreground-2": "olive-800",
    muted: "olive-700",
    "foreground-faint": "olive-500",
    "foreground-inverse": "paper-0",

    brand: "acid-500",
    "brand-foreground": "olive-950",
    "brand-ink": "lime-700",

    primary: "acid-500",
    "primary-foreground": "olive-950",
    "primary-ink": "lime-700",
    "primary-hover": "acid-600",
    "primary-muted": "acid-100",

    destructive: "red-700",
    "destructive-muted": "red-100",
    success: "green-800",
    "success-muted": "green-100",
    warning: "amber-800",
    info: "teal-800",

    "scale-0": "lime-200",
    "scale-1": "lime-300",
    "scale-2": "lime-400",
    "scale-3": "lime-500",
    "scale-4": "lime-600",
    "scale-5": "lime-700",
    "scale-track": "paper-300",
    // NOT `olive-400`: at 1.62-1.99:1 on these grounds an unfilled glyph reads as
    // undrawn, which is exactly the bug `scale-empty` exists to avoid. `olive-600`
    // measures 3.46 / 3.67 / 3.78 / 3.83 / 3.12, clearing 1.4.11's 3:1 everywhere.
    "scale-empty": "olive-600",

    "categorical-1": "lime-700",
    "categorical-2": "teal-800",

    scrim: "scrim-55",
  },

  fonts: arcade.fonts,

  depth: {
    lift: "3px 3px 0 {foreground}",
    borderWidth: "2px",
    sm: "0 1px 2px rgba(20, 23, 12, 0.12)",
    md: "0 4px 16px rgba(20, 23, 12, 0.14)",
    lg: "0 18px 44px rgba(20, 23, 12, 0.18)",
    // NOT `{primary}`: the acid yellow is 1.1:1 on `overlay`, which is below the 3:1
    // a focus indicator owes under WCAG 1.4.11. The action INK is 7.63:1 there.
    focusRing: "0 0 0 2px {background}, 0 0 0 4px {primary-ink}",
  },

  contrastExceptions: [],
});
