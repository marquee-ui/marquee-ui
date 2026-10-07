import {
  demoThemes,
  type DemoMode,
  type DemoPalette,
} from "../../../packages/tokens/src/presets/docs-themes";
import { resolveColors } from "../../../packages/tokens/src/resolve";
import { interpolateRoles } from "../../../packages/tokens/src/tokens";

export type ThemeSettings = { mode: DemoMode; palette: DemoPalette; expressive: boolean };
export const DEFAULT_THEME: ThemeSettings = { mode: "dark", palette: "arcade", expressive: true };
export const THEME_STORAGE_KEY = "marquee-demo-theme-v1";
export const PALETTES = [
  { value: "arcade", label: "Arcade acid" },
  { value: "electric", label: "Electric" },
  { value: "clementine", label: "Clementine" },
  { value: "tide", label: "Tide" },
] as const;

export function readTheme(
  storage: () => Pick<Storage, "getItem"> = () => window.localStorage,
): ThemeSettings {
  try {
    const parsed: unknown = JSON.parse(storage().getItem(THEME_STORAGE_KEY) ?? "null");
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_THEME;
    const { mode, palette, expressive } = parsed as Record<string, unknown>;
    if (
      (mode === "dark" || mode === "light") &&
      PALETTES.some((entry) => entry.value === palette) &&
      typeof expressive === "boolean"
    ) {
      return { mode, palette: palette as DemoPalette, expressive };
    }
  } catch {
    /* Browsing still works when preferences are unavailable. */
  }
  return DEFAULT_THEME;
}

export function saveTheme(
  settings: ThemeSettings,
  storage: () => Pick<Storage, "setItem"> = () => window.localStorage,
): void {
  try {
    storage().setItem(THEME_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* A valid in-memory selection does not depend on storage permission. */
  }
}

export const themePreset = (settings: ThemeSettings) => demoThemes[settings.palette][settings.mode];

function themeDeclarations(settings: ThemeSettings): [string, string][] {
  const preset = themePreset(settings);
  const colors = resolveColors(preset);
  const roles = new Set(Object.keys(colors));
  return [
    ...Object.entries(colors).map(([role, value]): [string, string] => [`--${role}`, value]),
    ...(
      [
        ["--shadow-lift", preset.depth.lift],
        ["--border-width", preset.depth.borderWidth],
        ["--shadow-sm", preset.depth.sm],
        ["--shadow-md", preset.depth.md],
        ["--shadow-lg", preset.depth.lg],
        ["--shadow-band", preset.depth.band],
        ["--shadow-focus-ring", preset.depth.focusRing],
      ] as const
    ).map(([role, value]): [string, string] => [role, interpolateRoles(value, roles)]),
  ];
}

export function applyTheme(settings: ThemeSettings): void {
  const root = document.documentElement;
  for (const [role, value] of themeDeclarations(settings)) root.style.setProperty(role, value);
  root.style.colorScheme = settings.mode;
}

export function customizationRecipe(settings: ThemeSettings): string {
  return [
    `/* Local demo customization: ${settings.palette} / ${settings.mode}.`,
    "   These additional recipes are not npm 0.1.0 preset exports.",
    "   Place after your token import. Keep the fonts import if you load no faces yourself. */",
    '@import "@marquee-ui/tokens/tokens.css";',
    '@import "@marquee-ui/tokens/fonts.css";',
    "",
    ":root {",
    `  color-scheme: ${settings.mode};`,
    ...themeDeclarations(settings).map(([role, value]) => `  ${role}: ${value};`),
    "}",
  ].join("\n");
}
