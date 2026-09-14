import { describe, expect, it } from "vitest";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";
import {
  AA_FLOOR,
  MIN_DELTA_E,
  checkContrast,
  checkDistinctness,
  contrastMatrix,
  runChecks,
} from "../src/checks/index.js";
import {
  indistinctPreset,
  lowContrastOnFillPreset,
  lowContrastPreset,
  staleExceptionPreset,
  understatedExceptionPreset,
} from "./fixtures/failing-presets.js";

const messages = (preset: Parameters<typeof runChecks>[0]) =>
  runChecks(preset).map((f) => f.detail);

describe("the shipped presets", () => {
  it("Arcade passes every check", () => {
    expect(runChecks(arcade)).toEqual([]);
  });

  it("light passes every check, with no exceptions at all", () => {
    expect(light.contrastExceptions).toEqual([]);
    expect(runChecks(light)).toEqual([]);
  });
});

describe("checkContrast", () => {
  it("fails an ink that drops below AA on a ground, naming BOTH sides and the ratio", () => {
    const failures = checkContrast(lowContrastPreset);
    expect(failures.length).toBeGreaterThan(0);
    const joined = failures.map((f) => f.detail).join("\n");
    expect(joined).toMatch(/foreground-2/);
    expect(joined).toMatch(/background/);
    expect(joined).toMatch(/3\.2\d/);
    expect(joined).toMatch(new RegExp(String(AA_FLOOR)));
  });

  it("fails ink that cannot be read on its own fill", () => {
    const joined = messages(lowContrastOnFillPreset).join("\n");
    expect(joined).toMatch(/primary-foreground/);
    expect(joined).toMatch(/primary/);
  });

  it("fails a stale exception: the pair it excuses now passes", () => {
    const joined = checkContrast(staleExceptionPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/foreground.*background/);
    expect(joined).toMatch(/stale|passes/i);
  });

  it("fails an exception whose recorded ratio is better than the measured one", () => {
    const joined = checkContrast(understatedExceptionPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/muted/);
    expect(joined).toMatch(/overlay/);
    expect(joined).toMatch(/4\.49/);
  });

  it("accepts Arcade's one recorded shortfall and reports nothing for it", () => {
    expect(checkContrast(arcade)).toEqual([]);
    expect(arcade.contrastExceptions).toHaveLength(1);
  });

  it("checks every body ink against every ground, not a sample", () => {
    // 9 body inks x 5 grounds + 2 ink-on-fill pairs. A check that silently shrank
    // its own matrix would still return [] for Arcade, so count the comparisons.
    expect(contrastMatrix(arcade)).toHaveLength(47);
  });
});

describe("checkDistinctness", () => {
  it("fails when the destructive colour moves into the primary's hue", () => {
    const joined = checkDistinctness(indistinctPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/primary/);
    expect(joined).toMatch(/destructive/);
    expect(joined).toMatch(new RegExp(String(MIN_DELTA_E)));
  });

  it("passes Arcade, whose pair is far apart", () => {
    expect(checkDistinctness(arcade)).toEqual([]);
  });
});
