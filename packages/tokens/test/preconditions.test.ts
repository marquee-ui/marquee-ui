import { describe, expect, it } from "vitest";
import { addToken } from "../src/emit/dtcg.js";
import type { DtcgDocument } from "../src/emit/dtcg.js";
import { interpolateRoles } from "../src/tokens.js";
import type { Token } from "../src/tokens.js";
import { resolveColor } from "../src/resolve.js";
import { arcade } from "../src/presets/arcade.js";
import type { Preset } from "../src/roles.js";

/**
 * The throws that stop a typo shipping as a dead `var(--…)`. Each was implemented and
 * unproved: removing any of them left the whole suite green.
 */
describe("interpolateRoles", () => {
  it("resolves a role reference to that role's variable", () => {
    expect(interpolateRoles("3px 3px 0 {foreground}", new Set(["foreground"]))).toBe(
      "3px 3px 0 var(--foreground)",
    );
  });

  it("throws on a role that does not exist, naming it and the value", () => {
    // `{primar}` would otherwise ship as `var(--primar)`: a shadow that silently
    // paints nothing, on every consumer, with no build or test complaining.
    expect(() => interpolateRoles("0 0 0 4px {primar}", new Set(["primary"]))).toThrow(
      /unknown colour role "primar".*\{primar\}/s,
    );
  });
});

describe("resolveColor", () => {
  it("throws when a role names a primitive the preset does not declare", () => {
    const broken = {
      ...arcade,
      name: "fixture-undeclared-primitive",
      color: { ...arcade.color, background: "no-such-primitive" },
    } as unknown as Preset;
    expect(() => resolveColor(broken, "background")).toThrow(
      /fixture-undeclared-primitive.*background.*no-such-primitive/s,
    );
  });
});

describe("addToken", () => {
  const token = (path: [string, string], cssVar: string): Token => ({
    cssVar,
    path,
    type: "color",
    value: "#000000",
    tier: "role",
  });

  it("places a token in its group", () => {
    const document: DtcgDocument = { $description: "x" };
    addToken(document, token(["color", "background"], "--background"));
    expect(document.color).toEqual({
      background: {
        $type: "color",
        $value: "#000000",
        $extensions: { "gg.marquee.css": "--background" },
      },
    });
  });

  it("throws rather than silently dropping a token to a path already taken", () => {
    // The second write would otherwise win and the JSON would ship one token short,
    // with the round trip blaming the stylesheet for the difference.
    const document: DtcgDocument = { $description: "x" };
    addToken(document, token(["color", "background"], "--background"));
    expect(() => addToken(document, token(["color", "background"], "--other"))).toThrow(
      /duplicate token path: color\.background \(--other\)/,
    );
  });
});
