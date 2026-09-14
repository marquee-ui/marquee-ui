import { describe, expect, it } from "vitest";
import { buildPreset } from "../src/build.js";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";
import { indistinctPreset, lowContrastPreset } from "./fixtures/failing-presets.js";

describe("buildPreset", () => {
  it("builds Arcade with no failures and real output", () => {
    const built = buildPreset(arcade);
    expect(built.failures).toEqual([]);
    expect(built.css).toContain("--background: var(--mq-olive-950);");
    expect(Object.keys(built.json)).toContain("color");
  });

  it("publishes MEASURED pads, not the shape of one", () => {
    // A pad that was never assigned leaves the sentinel `0em`, which satisfies any
    // "looks like a length" assertion. So assert the value, and assert it in the
    // stylesheet that actually ships.
    const built = buildPreset(arcade);
    expect(built.pads.capPad).toBe("0.4em");
    expect(built.pads.descenderPad).toBe("0.55em");
    expect(built.css).toContain("--display-cap-pad: 0.4em;");
    expect(built.css).toContain("--display-descender-pad: 0.55em;");
    // And that a real face was opened, rather than a zeroed sentinel carried through.
    expect(built.pads.extents.unitsPerEm).toBe(1000);
    expect(built.pads.extents.topGlyph).toBe("$");
    expect(built.pads.extents.bottomGlyph).toBe("g");
  });

  it("writes the same measured pads for the light preset", () => {
    const built = buildPreset(light);
    expect(built.css).toContain("--display-cap-pad: 0.4em;");
    expect(built.css).toContain("--display-descender-pad: 0.55em;");
  });

  it("builds light with no failures", () => {
    expect(buildPreset(light).failures).toEqual([]);
  });

  it("collects a contrast failure and names the pair", () => {
    const built = buildPreset(lowContrastPreset);
    expect(built.failures.length).toBeGreaterThan(0);
    expect(built.failures.map((f) => f.detail).join("\n")).toMatch(/foreground-2.*background/);
  });

  it("collects a distinctness failure", () => {
    const built = buildPreset(indistinctPreset);
    expect(built.failures.some((f) => f.check === "distinctness")).toBe(true);
  });

  it("reports a missing face as a failure instead of throwing", () => {
    const broken = {
      ...arcade,
      name: "fixture-missing-face",
      fonts: { ...arcade.fonts, display: { ...arcade.fonts.display, file: "no-such.woff2" } },
    };
    const built = buildPreset(broken);
    expect(built.failures.map((f) => f.detail).join("\n")).toMatch(/no-such\.woff2/);
  });

  it("round-trips: what it builds parses back to one set of names", () => {
    const built = buildPreset(arcade);
    expect(built.failures.filter((f) => f.check === "round-trip")).toEqual([]);
  });
});
