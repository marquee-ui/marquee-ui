import { describe, expect, it } from "vitest";
import { arcade } from "../../../packages/tokens/src/presets/arcade";
import { resolveColors } from "../../../packages/tokens/src/resolve";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  customizationRecipe,
  readTheme,
  saveTheme,
  themePreset,
} from "../src/theme";

describe("theme preference boundary", () => {
  it("reads a complete saved choice including the expressive composition", () => {
    const saved = {
      mode: "light",
      palette: "electric",
      expressive: false,
      accent: "violet",
    } as const;
    expect(readTheme(() => ({ getItem: () => JSON.stringify(saved) }))).toEqual(saved);
  });

  it("upgrades valid saved choices from before accents to Automatic", () => {
    const legacy = { mode: "light", palette: "tide", expressive: false };
    expect(readTheme(() => ({ getItem: () => JSON.stringify(legacy) }))).toEqual({
      ...legacy,
      accent: "auto",
    });
  });

  it.each([
    null,
    "{",
    "null",
    "[]",
    "42",
    JSON.stringify({ mode: "system", palette: "arcade", expressive: true }),
    JSON.stringify({ mode: "dark", palette: "missing", expressive: true }),
    JSON.stringify({ mode: "dark", palette: "arcade", expressive: "false" }),
    JSON.stringify({ mode: "light", palette: "tide" }),
    JSON.stringify({ mode: "light", palette: "tide", expressive: true, accent: "unknown" }),
    JSON.stringify({ mode: "light", palette: "tide", expressive: true, accent: null }),
  ])("safely defaults malformed/incomplete preferences: %s", (raw) => {
    expect(readTheme(() => ({ getItem: () => raw }))).toEqual(DEFAULT_THEME);
  });

  it("handles blocked storage access and reads", () => {
    expect(
      readTheme(() => {
        throw new Error("blocked getter");
      }),
    ).toEqual(DEFAULT_THEME);
    expect(
      readTheme(() => ({
        getItem: () => {
          throw new Error("blocked read");
        },
      })),
    ).toEqual(DEFAULT_THEME);
  });

  it("writes the whole choice under its versioned key and tolerates blocked writes", () => {
    const entries: [string, string][] = [];
    const saved = { mode: "light", palette: "tide", expressive: false, accent: "violet" } as const;
    saveTheme(saved, () => ({
      setItem: (key, value) => {
        entries.push([key, value]);
      },
    }));
    expect(entries).toEqual([[THEME_STORAGE_KEY, JSON.stringify(saved)]]);
    expect(() =>
      saveTheme(saved, () => {
        throw new Error("blocked getter");
      }),
    ).not.toThrow();
    expect(() =>
      saveTheme(saved, () => ({
        setItem: () => {
          throw new Error("quota");
        },
      })),
    ).not.toThrow();
  });
});

describe("live canonical roles and the copyable recipe", () => {
  it("keeps the default Arcade colors and applies all roles on the root", () => {
    expect(themePreset(DEFAULT_THEME)).toBe(arcade);
    applyTheme(DEFAULT_THEME);
    for (const [role, value] of Object.entries(resolveColors(arcade))) {
      expect(document.documentElement.style.getPropertyValue(`--${role}`), role).toBe(value);
    }
    expect(document.documentElement.style.colorScheme).toBe("dark");
  });

  it("changes action ink and fill independently of surfaces and identity", () => {
    const base = resolveColors(themePreset(DEFAULT_THEME));
    const custom = resolveColors(themePreset({ ...DEFAULT_THEME, accent: "violet" }));
    for (const role of [
      "background",
      "surface",
      "raised",
      "overlay",
      "sunken",
      "brand",
      "brand-ink",
    ] as const)
      expect(custom[role], role).toBe(base[role]);
    for (const role of ["primary", "primary-ink", "primary-hover", "primary-muted"] as const)
      expect(custom[role], role).not.toBe(base[role]);
  });

  it("produces a full CSS override for the exact selected mode and palette", () => {
    const choice = {
      mode: "light",
      palette: "electric",
      expressive: true,
      accent: "blue",
    } as const;
    const preset = themePreset(choice);
    const recipe = customizationRecipe(choice);
    expect(recipe).toContain('@import "@marquee-ui/tokens/tokens.css";');
    expect(recipe).toContain("Local demo customization: electric / light");
    expect(recipe).toContain("color-scheme: light;");
    for (const [role, value] of Object.entries(resolveColors(preset))) {
      expect(recipe, role).toContain(`--${role}: ${value};`);
    }
    expect(recipe).toContain("--shadow-lift:");
    expect(recipe).not.toContain("@marquee-ui/tokens/electric");
    expect(customizationRecipe(DEFAULT_THEME)).not.toBe(recipe);
    applyTheme(choice);
    expect(document.documentElement.style.getPropertyValue("--background")).toBe(
      resolveColors(preset).background,
    );
    expect(document.documentElement.style.colorScheme).toBe("light");
  });
});
