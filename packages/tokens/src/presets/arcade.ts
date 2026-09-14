import { definePreset } from "../roles.js";

/**
 * Arcade: the default preset, and the one the upstream app ships.
 *
 * Every literal below was read out of the upstream app's LOCKED token sheet on
 * 2026-09-14, at the commit the README names. The values
 * are the contract: the role NAMES change (D8 gives `--bg` the shadcn name
 * `background`), the colours do not, so a consumer swapping to this package moves no
 * pixel. The mapping from the upstream names to these is in the README.
 *
 * Dark is the default because the house style is dark; `light` is the maintained
 * second preset and the upstream app never enables it: its house rule is dark-only.
 */
export const arcade = definePreset({
  name: "arcade",
  colorScheme: "dark",

  /**
   * Tier 1. Warm-neutral olive base with a green bias, so the acid-yellow accent
   * sits naturally on it. The score ramp is a single-hue luminance ramp in the
   * accent's own hue, floored at `lime-850` so the lowest step stays visible on the
   * darkest ground.
   */
  primitives: {
    "olive-975": "#060703",
    "olive-950": "#0a0b07",
    "olive-925": "#12140c",
    "olive-900": "#191c10",
    "olive-875": "#22261a",
    "olive-850": "#262a17",
    "olive-800": "#3a4023",
    "olive-700": "#5f6642",
    "olive-650": "#6e7846",
    "olive-600": "#888f65", // PALETTE-1 (2026-09-14): was #858c62; +3/channel takes muted-on-overlay from 4.36 to 4.53
    "olive-500": "#a8b088",
    "olive-50": "#f2f5e8",
    "lime-950": "#2a3312",
    "lime-850": "#5c6a2a",
    "lime-800": "#74882d",
    "lime-750": "#93ab31",
    "lime-700": "#b5cf34",
    "lime-600": "#d3f236",
    "lime-500": "#e4ff3a",
    "lime-400": "#eeff6b",
    "teal-400": "#00e5c7",
    "red-500": "#ff5a4d",
    "red-950": "#331512",
    "green-400": "#4ade80",
    "green-950": "#10301f",
    "amber-400": "#ffb454",
    "scrim-72": "rgba(6, 7, 4, 0.72)",
  },

  color: {
    background: "olive-950",
    surface: "olive-925",
    raised: "olive-900",
    overlay: "olive-875",
    sunken: "olive-975",

    border: "olive-850",
    "border-strong": "olive-800",

    foreground: "olive-50",
    "foreground-2": "olive-500",
    muted: "olive-600",
    "foreground-faint": "olive-700",
    "foreground-inverse": "olive-950",

    // On dark, identity and action are the same yellow and the fill and the ink are
    // the same yellow: the split costs Arcade nothing and is what lets `light` exist.
    brand: "lime-500",
    "brand-foreground": "olive-950",
    "brand-ink": "lime-500",

    primary: "lime-500",
    "primary-foreground": "olive-950",
    "primary-ink": "lime-500",
    "primary-hover": "lime-400",
    "primary-muted": "lime-950",

    destructive: "red-500",
    "destructive-muted": "red-950",
    success: "green-400",
    "success-muted": "green-950",
    warning: "amber-400",
    info: "teal-400",

    "scale-0": "lime-850",
    "scale-1": "lime-800",
    "scale-2": "lime-750",
    "scale-3": "lime-700",
    "scale-4": "lime-600",
    "scale-5": "lime-500",
    "scale-track": "olive-875",
    // The unfilled half of a run is the DENOMINATOR of the value, so it is its own
    // role and not `border-strong`: a border colour at 1.82:1 on the background
    // reads as undrawn, and 4/5 then looks identical to 5/5.
    "scale-empty": "olive-650",

    "categorical-1": "lime-500",
    "categorical-2": "teal-400",

    scrim: "scrim-72",
  },

  fonts: {
    display: {
      family: "Boldonse",
      stack: ["Space Grotesk", "sans-serif"],
      file: "boldonse.woff2",
      weight: "400",
      style: "normal",
    },
    body: {
      family: "Space Grotesk",
      stack: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      file: "space-grotesk.woff2",
      weight: "300 700",
      style: "normal",
    },
    mono: {
      family: "Space Mono",
      stack: ["ui-monospace", "SF Mono", "Menlo", "monospace"],
      file: "space-mono.woff2",
      weight: "700",
      style: "normal",
    },
  },

  /** The 3px hard offset and the 2px line are one decision (D8). */
  depth: {
    lift: "3px 3px 0 {foreground}",
    borderWidth: "2px",
    sm: "0 1px 2px rgba(0, 0, 0, 0.45)",
    md: "0 4px 16px rgba(0, 0, 0, 0.5)",
    lg: "0 18px 44px rgba(0, 0, 0, 0.55)",
    focusRing: "0 0 0 2px {background}, 0 0 0 4px {primary}",
  },

  contrastExceptions: [],
});
