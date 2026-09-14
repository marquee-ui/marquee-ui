import { describe, expect, it } from "vitest";
import { sourceFiles, stripComments } from "./helpers/source-files.js";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";

/**
 * D8: "a lint rule fails on any literal colour, font name or shadow in library
 * source". A colour that is written anywhere but a preset is a colour no preset can
 * swap, which is the one thing the role contract exists to prevent.
 *
 * Two halves, and the second is the load-bearing one: a generic pattern
 * (`#rrggbb`, `rgb(`, an offset pair) catches a NEW literal, and the presets'
 * own values catch a COPIED one - the case a pattern misses when someone writes the
 * accent as `color-mix(...)` or pastes a family name.
 */
const PRESETS = [arcade, light];

const isPreset = (rel: string) => rel.includes("/src/presets/");

const GENERIC_PATTERNS: readonly (readonly [string, RegExp])[] = [
  ["a hex colour", /#[0-9a-f]{3,8}\b/i],
  ["an rgb()/rgba() colour", /\brgba?\(/i],
  ["an hsl()/hsla() colour", /\bhsla?\(/i],
  // Not `var(--font-display)`, and not a `${...}` interpolation: those ARE the
  // role reaching for its own value.
  ["a literal font-family", /font-family:\s*(?!var\(|["']?\$\{)["']?[a-z]/i],
  ["a shadow offset pair", /\b\d+px\s+\d+px\b/],
];

describe("literal guard", () => {
  const files = sourceFiles().map((f) => ({ ...f, code: stripComments(f.text) }));

  it("has the presets in scope and the rest of the source out of it", () => {
    expect(files.some((f) => isPreset(f.rel))).toBe(true);
    expect(files.some((f) => !isPreset(f.rel))).toBe(true);
    // The instrument must be able to see a literal where one is allowed.
    const presetText = files
      .filter((f) => isPreset(f.rel))
      .map((f) => f.code)
      .join("");
    expect(GENERIC_PATTERNS.some(([, pattern]) => pattern.test(presetText))).toBe(true);
  });

  it("finds no literal colour, font name or shadow outside src/presets/**", () => {
    const offenders: string[] = [];
    for (const file of files) {
      if (isPreset(file.rel)) continue;
      for (const [label, pattern] of GENERIC_PATTERNS) {
        const hit = pattern.exec(file.code);
        if (hit) offenders.push(`${file.rel}: ${label} (${hit[0]})`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("every pattern fires on a sample that violates it", () => {
    // Each rule proved against its own violating fixture: a pattern nobody has
    // watched match is a pattern that might match nothing.
    const samples: Record<string, string> = {
      "a hex colour": 'const c = "#e4ff3a";',
      "an rgb()/rgba() colour": 'const c = "rgba(0, 0, 0, 0.45)";',
      "an hsl()/hsla() colour": 'const c = "hsl(72 100% 61%)";',
      "a literal font-family": "css += 'font-family: \"Boldonse\", sans-serif;';",
      "a shadow offset pair": 'const s = "3px 3px 0 var(--foreground)";',
    };
    for (const [label, pattern] of GENERIC_PATTERNS) {
      expect(pattern.test(samples[label]!), `${label} did not fire`).toBe(true);
    }
  });

  it("passes the forms that are NOT literals", () => {
    const allowed = [
      'css += `font-family: "${face.family}";`;',
      'css += "font-family: var(--font-display);";',
      'const w = "44px";',
    ];
    for (const line of allowed) {
      for (const [label, pattern] of GENERIC_PATTERNS) {
        expect(pattern.test(line), `${label} fired on ${line}`).toBe(false);
      }
    }
  });

  it("finds no preset VALUE copied out of its preset", () => {
    const values = new Set<string>();
    for (const preset of PRESETS) {
      for (const literal of Object.values(preset.primitives)) values.add(literal);
      for (const face of Object.values(preset.fonts)) values.add(face.family);
      for (const shadow of [preset.depth.lift, preset.depth.sm, preset.depth.focusRing]) {
        values.add(shadow);
      }
    }
    const offenders: string[] = [];
    for (const file of files) {
      if (isPreset(file.rel)) continue;
      for (const value of values) {
        if (file.code.includes(value)) offenders.push(`${file.rel}: "${value}"`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
