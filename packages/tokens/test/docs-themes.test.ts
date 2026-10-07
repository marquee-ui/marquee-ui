import { describe, expect, it } from "vitest";
import { wcagContrast } from "culori";
import { demoThemes } from "../src/presets/docs-themes.js";
import { runChecks } from "../src/checks/index.js";
import { resolveColor } from "../src/resolve.js";
import { GROUND_ROLES } from "../src/roles.js";
import { arcade } from "../src/presets/arcade.js";

describe("the local documentation recipe matrix", () => {
  it("offers four bounded combinations with both independent modes", () => {
    expect(Object.keys(demoThemes)).toEqual(["arcade", "electric", "clementine", "tide"]);
    expect(demoThemes.arcade.dark).toBe(arcade);
    for (const themes of Object.values(demoThemes))
      expect(Object.keys(themes)).toEqual(["dark", "light"]);
  });
  for (const [palette, themes] of Object.entries(demoThemes)) {
    for (const [mode, preset] of Object.entries(themes)) {
      it(`${palette}/${mode} passes the full role matrix, focus and hovered action fills`, () => {
        expect(preset.colorScheme).toBe(mode);
        expect(runChecks(preset)).toEqual([]);
        expect(preset.fonts).toBe(arcade.fonts);
        for (const ground of GROUND_ROLES) {
          expect(
            wcagContrast(resolveColor(preset, "primary-ink"), resolveColor(preset, ground)),
            `focus on ${ground}`,
          ).toBeGreaterThanOrEqual(3);
        }
        expect(
          wcagContrast(
            resolveColor(preset, "primary-foreground"),
            resolveColor(preset, "primary-hover"),
          ),
        ).toBeGreaterThanOrEqual(4.5);
        if (palette !== "arcade")
          expect(resolveColor(preset, "brand")).not.toBe(resolveColor(preset, "primary"));
      });
    }
  }
});
