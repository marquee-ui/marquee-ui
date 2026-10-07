import { definePreset, type Preset } from "../roles.js";
import { arcade } from "./arcade.js";
import { light } from "./light.js";

/** Local documentation recipes. Not part of the published preset/export contract. */
const combinations = {
  electric: {
    dark: ["#10111c", "#171925", "#1d2030", "#242638", "#0b0c14"],
    light: ["#f0eff9", "#f8f7ff", "#fcfbff", "#ffffff", "#e8e7f2"],
    brand: "#c4a2ff",
    action: "#7fe7ff",
    hover: "#aaf0ff",
    darkMuted: "#132d3d",
    lightMuted: "#d5f4ff",
    brandInk: "#6034a4",
    actionInk: "#00566e",
  },
  clementine: {
    dark: ["#18110e", "#201813", "#281e18", "#30261f", "#100b08"],
    light: ["#f8eee6", "#fdf6f0", "#fffbf7", "#ffffff", "#eee2d8"],
    brand: "#ffb078",
    action: "#ffdb91",
    hover: "#ffe7b6",
    darkMuted: "#34270d",
    lightMuted: "#fff0cf",
    brandInk: "#874119",
    actionInk: "#754b00",
  },
  tide: {
    dark: ["#0b1519", "#111e24", "#17262c", "#1b2d34", "#070e11"],
    light: ["#eaf3f4", "#f3fafb", "#f9fdfd", "#ffffff", "#dce9eb"],
    brand: "#7febc4",
    action: "#93bcff",
    hover: "#bdd6ff",
    darkMuted: "#142942",
    lightMuted: "#e0ecff",
    brandInk: "#08614d",
    actionInk: "#244e95",
  },
} as const;

export type DemoPalette = "arcade" | keyof typeof combinations;
export type DemoMode = "dark" | "light";

function localPreset(palette: keyof typeof combinations, mode: DemoMode): Preset {
  const base: Preset = mode === "dark" ? arcade : light;
  const skin = combinations[palette];
  const [background, surface, raised, overlay, sunken] = skin[mode];
  const dark = mode === "dark";
  return definePreset<Record<string, string>>({
    ...base,
    name: `docs-${palette}-${mode}`,
    primitives: {
      ...base.primitives,
      "demo-background": background,
      "demo-surface": surface,
      "demo-raised": raised,
      "demo-overlay": overlay,
      "demo-sunken": sunken,
      "demo-foreground": dark ? "#f5f4ff" : "#151522",
      "demo-secondary": dark ? "#c7c9d7" : "#333449",
      "demo-muted": dark ? "#a6a9bb" : "#55556b",
      "demo-faint": dark ? "#72758a" : "#78798e",
      "demo-border": dark ? "#3d4158" : "#c6c7d5",
      "demo-border-strong": dark ? "#595d79" : "#9b9dae",
      "demo-empty": dark ? "#8b91a6" : "#69718a",
      "demo-brand": skin.brand,
      "demo-action": skin.action,
      "demo-hover": skin.hover,
      "demo-brand-ink": dark ? skin.brand : skin.brandInk,
      "demo-action-ink": dark ? skin.action : skin.actionInk,
      "demo-action-muted": dark ? skin.darkMuted : skin.lightMuted,
    },
    color: {
      ...base.color,
      background: "demo-background",
      surface: "demo-surface",
      raised: "demo-raised",
      overlay: "demo-overlay",
      sunken: "demo-sunken",
      foreground: "demo-foreground",
      "foreground-2": "demo-secondary",
      muted: "demo-muted",
      "foreground-faint": "demo-faint",
      border: "demo-border",
      "border-strong": "demo-border-strong",
      "scale-empty": "demo-empty",
      "scale-track": "demo-overlay",
      brand: "demo-brand",
      "brand-ink": "demo-brand-ink",
      primary: "demo-action",
      "primary-ink": "demo-action-ink",
      "primary-hover": "demo-hover",
      "primary-muted": "demo-action-muted",
      "categorical-1": "demo-brand-ink",
    },
  });
}

export const demoThemes: Record<DemoPalette, Record<DemoMode, Preset>> = {
  arcade: { dark: arcade, light },
  electric: { dark: localPreset("electric", "dark"), light: localPreset("electric", "light") },
  clementine: {
    dark: localPreset("clementine", "dark"),
    light: localPreset("clementine", "light"),
  },
  tide: { dark: localPreset("tide", "dark"), light: localPreset("tide", "light") },
};
