import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import {
  LATIN_ALNUM,
  PRINTABLE_ASCII,
  measureFace,
  padEm,
  displayPads,
} from "../src/font-metrics.js";

const face = (name: string) => fileURLToPath(new URL(`../fonts/${name}`, import.meta.url));

/**
 * The expected numbers are the font file's, cross-checked against what thepile
 * DOCUMENTED before any of this existed (`apps/web/src/app/globals.css`): "typo
 * ascent 1.52em, descent 0.40em, so the half-leading is -0.46em", "a leading-none
 * line box only reaches 1.06em above the baseline", "glyph yMax 1200 @ 1000 upm",
 * "the top 0.14em of every capital is OUTSIDE the line box". A generated pad that
 * disagrees with those four is a generator bug, not a font surprise.
 */
describe("measureFace (Boldonse, the display face)", () => {
  it("reads the em square and the typographic metrics the browser lays out with", () => {
    const m = measureFace(face("boldonse.woff2"));
    expect(m.unitsPerEm).toBe(1000);
    expect(m.typoAscenderEm).toBeCloseTo(1.52, 5);
    expect(m.typoDescenderEm).toBeCloseTo(-0.4, 5);
  });

  it("puts the leading-none line box 1.06em above and 0.06em ABOVE the baseline", () => {
    const m = measureFace(face("boldonse.woff2"));
    expect(m.lineBoxTopEm).toBeCloseTo(1.06, 5);
    // Negative = the box bottom sits above the baseline, which is why this face
    // clips its own descenders at `leading-none` with no clip box at all.
    expect(m.lineBoxBottomEm).toBeCloseTo(-0.06, 5);
  });

  it("measures cap ink at 1.20em over the alnum set, overflowing the box by 0.14em", () => {
    const m = measureFace(face("boldonse.woff2"), LATIN_ALNUM);
    expect(m.inkTopEm).toBeCloseTo(1.2, 5);
    expect(m.capOverflowEm).toBeCloseTo(0.14, 5);
  });

  it("names the glyph that set each extent, so a pad can be argued with", () => {
    const m = measureFace(face("boldonse.woff2"), PRINTABLE_ASCII);
    expect(m.topGlyph).toBe("$");
    expect(m.bottomGlyph).toBe("g");
    expect(m.inkTopEm).toBeCloseTo(1.299, 3);
    expect(m.inkBottomEm).toBeCloseTo(0.3, 5);
  });

  it("reports the full-font bbox next to the coverage set, because they differ", () => {
    const m = measureFace(face("boldonse.woff2"), PRINTABLE_ASCII);
    // thepile's descender-safe was derived from THIS number (-458), but no
    // printable-ASCII glyph reaches it: the deepest is `g` at -300.
    expect(m.fontBBoxBottomEm).toBeCloseTo(0.458, 5);
    expect(m.inkBottomEm).toBeLessThan(m.fontBBoxBottomEm);
  });

  it("throws naming the file when the face is missing", () => {
    expect(() => measureFace(face("not-a-font.woff2"))).toThrow(/not-a-font\.woff2/);
  });
});

describe("padEm", () => {
  it("reproduces thepile's hardcoded 0.3em cap pad from the alnum overflow", () => {
    // 0.14em geometry + 1px of independent rounding at the 7px floor = 0.283em,
    // rounded up to the 0.05 step. thepile measured 0.3em on a board and typed it;
    // this derives the same number from the file.
    expect(padEm(0.14)).toBeCloseTo(0.3, 10);
  });

  it("rounds UP to the 0.05 step, never down", () => {
    expect(padEm(0)).toBeCloseTo(0.15, 10);
    expect(padEm(0.007)).toBeCloseTo(0.15, 10);
    expect(padEm(0.008)).toBeCloseTo(0.2, 10);
  });

  it("is monotone in the overflow it is given", () => {
    const pads = [0, 0.05, 0.14, 0.24, 0.36, 0.5].map(padEm);
    for (let i = 1; i < pads.length; i++) {
      expect(pads[i]).toBeGreaterThanOrEqual(pads[i - 1]!);
    }
  });

  it("never returns a pad smaller than the ink it has to cover", () => {
    for (const overflow of [0, 0.1, 0.14, 0.239, 0.36, 0.7]) {
      expect(padEm(overflow)).toBeGreaterThanOrEqual(overflow);
    }
  });
});

describe("displayPads", () => {
  it("generates both pads for Boldonse over the printable-ASCII coverage set", () => {
    const pads = displayPads(face("boldonse.woff2"));
    expect(pads.capPadEm).toBeCloseTo(0.4, 10);
    expect(pads.descenderPadEm).toBeCloseTo(0.55, 10);
    expect(pads.extents.topGlyph).toBe("$");
  });

  it("emits em strings a stylesheet can use", () => {
    const pads = displayPads(face("boldonse.woff2"));
    expect(pads.capPad).toBe("0.4em");
    expect(pads.descenderPad).toBe("0.55em");
  });
});
