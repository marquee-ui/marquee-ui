import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import * as fontkit from "fontkit";
import { arcade } from "../src/presets/arcade.js";
import { light } from "../src/presets/light.js";

const fontsDir = fileURLToPath(new URL("../fonts", import.meta.url));
const faces = [...Object.values(arcade.fonts), ...Object.values(light.fonts)].filter(
  (face, index, all) => all.findIndex((f) => f.file === face.file) === index,
);

/**
 * Every face ships with its own licence, and the pairing is CHECKED rather than
 * assumed: an OFL text is per-family, and the copyright line at the top of it has to
 * be the one the font file itself declares. A licence file next to the wrong binary
 * is worse than none, because it reads as diligence.
 */
describe("shipped faces", () => {
  it("has faces to check", () => {
    expect(faces.length).toBe(3);
  });

  for (const face of faces) {
    describe(face.file, () => {
      it("is present and opens as a single face", () => {
        const path = join(fontsDir, face.file);
        expect(existsSync(path)).toBe(true);
        const font = fontkit.openSync(path);
        expect("unitsPerEm" in font).toBe(true);
      });

      it("declares the family the preset names", () => {
        const font = fontkit.openSync(join(fontsDir, face.file));
        if (!("familyName" in font)) throw new Error("not a single face");
        // Space Grotesk's variable file names its default instance ("Space Grotesk
        // Light"), so an exact match is not always available - but a bare prefix is
        // not enough either: `family: "Bold"` would pass against "Boldonse" and the
        // emitted CSS would then name a family no font has. The subfamily has to be
        // a WHOLE word after the family name.
        expect(
          font.familyName === face.family || font.familyName.startsWith(`${face.family} `),
        ).toBe(true);
      });

      it("ships an OFL text whose copyright is this font's own", () => {
        const ofl = join(fontsDir, face.file.replace(/\.woff2$/, ".OFL.txt"));
        expect(existsSync(ofl)).toBe(true);
        const text = readFileSync(ofl, "utf8");
        const font = fontkit.openSync(join(fontsDir, face.file));
        if (!("copyright" in font)) throw new Error("not a single face");
        expect(text.split("\n")[0]?.trim()).toBe(font.copyright);
        expect(text).toContain("SIL OPEN FONT LICENSE Version 1.1");
      });
    });
  }
});
