import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { displayPads } from "../src/font-metrics.js";
import { declaredCssVars, emitCss } from "../src/emit/css.js";
import { declaredJsonVars, emitDtcg } from "../src/emit/dtcg.js";
import { fontStack } from "../src/tokens.js";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";

const pads = displayPads(fileURLToPath(new URL("../fonts/boldonse.woff2", import.meta.url)));

describe("round trip: the stylesheet and the JSON name the same tokens", () => {
  for (const preset of [arcade, light]) {
    it(`${preset.name}: every declared custom property is in the JSON, and back`, () => {
      const css = declaredCssVars(emitCss(preset, pads));
      const json = declaredJsonVars(emitDtcg(preset, pads));
      expect(css).toEqual(json);
      // A guard that compared two empty lists would also pass, so anchor it.
      expect(css.length).toBeGreaterThan(80);
      expect(css).toContain("--background");
      expect(css).toContain("--mq-" + preset.color.background);
    });
  }
});

describe("declaredCssVars", () => {
  it("counts a declaration in :root and in a bare @theme", () => {
    const css = ":root {\n  --a: 1px;\n}\n@theme {\n  --b: 2px;\n}\n";
    expect(declaredCssVars(css)).toEqual(["--a", "--b"]);
  });

  it("skips the @theme inline mapping, which aliases rather than declares", () => {
    const css = ":root {\n  --a: 1px;\n}\n@theme inline {\n  --color-a: var(--a);\n}\n";
    expect(declaredCssVars(css)).toEqual(["--a"]);
  });

  it("skips @theme inline reference too, and resumes after it closes", () => {
    const css =
      "@theme inline reference {\n  --shadow-a: var(--shadow-a);\n}\n:root {\n  --b: 2px;\n}\n";
    expect(declaredCssVars(css)).toEqual(["--b"]);
  });

  it("does not count a token that is only mentioned in a comment", () => {
    const css = "/* --ghost: 1px; */\n:root {\n  --a: 1px;\n}\n";
    expect(declaredCssVars(css)).toEqual(["--a"]);
  });
});

describe("the emitted stylesheet", () => {
  const css = emitCss(arcade, pads);

  it("ships a @font-face for every face the preset names", () => {
    for (const face of [arcade.fonts.display, arcade.fonts.body, arcade.fonts.mono]) {
      expect(css).toContain(`url("./fonts/${face.file}") format("woff2")`);
    }
  });

  it("declares thepile's locked values under the D8 role names", () => {
    // The whole point of the package: the names move, the colours do not.
    expect(css).toContain("--mq-olive-950: #0a0b07;");
    expect(css).toContain("--background: var(--mq-olive-950);");
    expect(css).toContain("--brand: var(--mq-lime-500);");
    expect(css).toContain("--scale-5: var(--mq-lime-500);");
  });

  it("resolves a {role} in a depth value to the role's own var", () => {
    expect(css).toContain("--shadow-lift: 3px 3px 0 var(--foreground);");
    expect(css).toContain(
      "--shadow-focus-ring: 0 0 0 2px var(--background), 0 0 0 4px var(--primary);",
    );
  });

  it("carries the generated pads, not a typed pair", () => {
    expect(css).toContain(`--display-cap-pad: ${pads.capPad};`);
    expect(css).toContain(`--display-descender-pad: ${pads.descenderPad};`);
  });

  it("gives the three size-only steps no line-height pair", () => {
    for (const step of ["reading", "2xs", "3xs"]) {
      expect(css).toContain(`--text-${step}:`);
      expect(css).not.toContain(`--text-${step}--line-height`);
    }
    expect(css).toContain("--text-xs--line-height: 1.4;");
  });

  it("sets the colour scheme from the preset", () => {
    expect(emitCss(arcade, pads)).toContain("color-scheme: dark;");
    expect(emitCss(light, pads)).toContain("color-scheme: light;");
  });
});

describe("fontStack", () => {
  it("quotes family NAMES and leaves generic and vendor keywords bare", () => {
    // `"sans-serif"` means a font called that; `sans-serif` means the browser's
    // default. Quoting the keyword breaks the fallback and looks identical.
    //
    // `Menlo` goes the other way and IS quoted: it is a family name, and a quoted
    // name is the safer spelling (an unquoted one that collides with a CSS-wide
    // keyword is invalid). The upstream sheet writes it bare; both select Menlo.
    expect(
      fontStack("Space Grotesk", ["system-ui", "-apple-system", "Segoe UI", "sans-serif"]),
    ).toBe('"Space Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif');
    expect(fontStack("Space Mono", ["ui-monospace", "SF Mono", "Menlo", "monospace"])).toBe(
      '"Space Mono", ui-monospace, "SF Mono", "Menlo", monospace',
    );
  });
});

describe("the emitted JSON", () => {
  const json = emitDtcg(arcade, pads);

  it("keeps the tier link as a DTCG alias", () => {
    const group = json.color;
    expect(typeof group).toBe("object");
    expect((group as Record<string, { $value: string }>)["background"]?.$value).toBe(
      "{primitive.olive-950}",
    );
  });

  it("types a colour as a colour and a duration as a duration", () => {
    const primitive = json.primitive as Record<string, { $type: string; $value: string }>;
    const motion = json.motion as Record<string, { $type: string }>;
    expect(primitive["olive-950"]?.$type).toBe("color");
    expect(primitive["olive-950"]?.$value).toBe("#0a0b07");
    expect(motion["dur-fast"]?.$type).toBe("duration");
    expect(motion["ease-standard"]?.$type).toBe("cubicBezier");
  });
});
