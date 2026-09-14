import { describe, expect, it } from "vitest";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";
import {
  AA_FLOOR,
  GRAPHIC_FLOOR,
  MIN_DELTA_E,
  checkContrast,
  checkDistinctness,
  contrastMatrix,
  runChecks,
} from "../src/checks/index.js";
import {
  acceptedExceptionPreset,
  deadExceptionPreset,
  emptyReasonPreset,
  indistinctPreset,
  lowGraphicContrastPreset,
  outlivedExceptionPreset,
  overstatedExceptionPreset,
  unparseableColorPreset,
  unrecordedShortfallPreset,
  lowContrastOnFillPreset,
  lowContrastPreset,
  staleExceptionPreset,
  understatedExceptionPreset,
} from "./fixtures/failing-presets.js";

const messages = (preset: Parameters<typeof runChecks>[0]) =>
  runChecks(preset).map((f) => f.detail);

describe("the shipped presets", () => {
  it("Arcade passes every check, with no exceptions at all", () => {
    // PALETTE-1 (2026-09-14): `muted` moved #858c62 -> #888f65 and the one shortfall
    // the palette had was FIXED rather than recorded, so Arcade's exception list is
    // empty and the mechanism is proved entirely through the fixtures below.
    expect(arcade.contrastExceptions).toEqual([]);
    expect(runChecks(arcade)).toEqual([]);
  });

  it("clears AA on the ground that used to fall short", () => {
    const pair = contrastMatrix(arcade).find(
      (result) => result.ink === "muted" && result.ground === "overlay",
    );
    expect(pair).toBeDefined();
    expect(pair!.ratio).toBeGreaterThanOrEqual(AA_FLOOR);
    expect(Math.round(pair!.ratio * 100) / 100).toBe(4.53);
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

  it("accepts an exception that is accurate, justified and real", () => {
    // The positive case. Without it, every rule below would also be satisfied by a
    // check that simply refused every exception, and the mechanism would be useless
    // rather than strict.
    expect(checkContrast(acceptedExceptionPreset)).toEqual([]);
    expect(acceptedExceptionPreset.contrastExceptions).toHaveLength(1);
  });

  it("fails the same shortfall when it is NOT recorded", () => {
    // Same palette, same pair, no exception: the floor still bites. This is the pair
    // the mechanism exists for, so it has to fail without one.
    const joined = checkContrast(unrecordedShortfallPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/muted/);
    expect(joined).toMatch(/overlay/);
    expect(joined).toMatch(/4\.36/);
    expect(joined).toMatch(/below the 4\.5:1 floor/);
  });

  it("fails an exception that outlived its fix", () => {
    // PALETTE-1 raised `muted` to #888f65 and the pair now measures 4.53:1. An
    // exception left behind after a fix is the exact case this rule is for, and it is
    // why Arcade carries none.
    const joined = checkContrast(outlivedExceptionPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/muted/);
    expect(joined).toMatch(/overlay/);
    expect(joined).toMatch(/4\.53/);
    expect(joined).toMatch(/stale/);
  });

  it("checks every body ink and every graphic against every ground, not a sample", () => {
    // 9 body inks x 5 grounds + 1 graphic role x 5 grounds + 2 ink-on-fill pairs. A
    // check that silently shrank its own matrix would still return [] for Arcade, so
    // count the comparisons.
    expect(contrastMatrix(arcade)).toHaveLength(52);
  });

  it("gives a meaningful graphic the 3:1 floor, not the 4.5:1 one", () => {
    const graphic = contrastMatrix(arcade).filter((r) => r.kind === "graphic-on-ground");
    expect(graphic).toHaveLength(5);
    expect(graphic.every((r) => r.floor === GRAPHIC_FLOOR)).toBe(true);
    expect(
      contrastMatrix(arcade).every((r) => r.kind === "graphic-on-ground" || r.floor === AA_FLOOR),
    ).toBe(true);
    // Arcade's own unfilled glyph clears 3:1 everywhere, 3.26 at worst.
    expect(Math.min(...graphic.map((r) => r.ratio))).toBeGreaterThanOrEqual(GRAPHIC_FLOOR);
  });

  it("fails an unfilled glyph that reads as undrawn", () => {
    const joined = checkContrast(lowGraphicContrastPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/scale-empty/);
    expect(joined).toMatch(new RegExp(`${GRAPHIC_FLOOR}:1 floor`));
  });

  it("names the preset and both roles when a colour does not parse", () => {
    // culori throws on an unparseable colour, so the alternative is a raw TypeError
    // from inside a colour library, with no preset and no role in the message.
    const joined = checkContrast(unparseableColorPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/muted/);
    expect(joined).toMatch(/not-a-colour/);
    expect(joined).toMatch(/did not parse/);
  });

  it("fails an exception that names a pair the matrix never makes", () => {
    const joined = checkContrast(deadExceptionPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/scrim/);
    expect(joined).toMatch(/never makes/);
  });

  it("fails an exception carrying no reason", () => {
    const joined = checkContrast(emptyReasonPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/muted/);
    expect(joined).toMatch(/no reason/);
  });

  it("fails an exception that records a ratio WORSE than the measured one", () => {
    // The dangerous direction: 1.01 recorded against 4.36 measured would otherwise
    // license every regression down to 1.01 in silence.
    const joined = checkContrast(overstatedExceptionPreset)
      .map((f) => f.detail)
      .join("\n");
    expect(joined).toMatch(/1\.01/);
    expect(joined).toMatch(/better than/);
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
