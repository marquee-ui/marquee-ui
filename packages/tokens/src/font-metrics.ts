import { existsSync } from "node:fs";
import * as fontkit from "fontkit";
import type { Font } from "fontkit";
import { PAD_ROUNDING_ALLOWANCE_PX, PAD_SMALLEST_TEXT_PX, PAD_STEP_EM } from "./skeleton.js";

/**
 * The display pads, GENERATED from the woff2 and never typed (D8).
 *
 * What a pad is for: a clip box (`truncate`, `line-clamp-*`, a bare
 * `overflow-hidden`) clips at the PADDING edge of the line box, and a display face
 * whose ink leaves that box gets sliced - flat-topped capitals, tails off every g,
 * j, p, q and y. The pad hands the ink room back and a cancelling negative margin
 * hands the room back to the layout, so the rescue costs no vertical space.
 *
 * The worst case, and so the case measured: `line-height: 1`. Any larger
 * line-height makes the box taller and the overflow smaller.
 */

/** U+0020 - U+007E: the coverage set the pads are generated for. */
export const PRINTABLE_ASCII = Array.from({ length: 0x7e - 0x20 + 1 }, (_, i) =>
  String.fromCharCode(0x20 + i),
).join("");

/** Capitals, lowercase and digits only - the narrower set the upstream pads assumed. */
export const LATIN_ALNUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export interface FaceInkExtents {
  unitsPerEm: number;
  typoAscenderEm: number;
  typoDescenderEm: number;
  /** Top of a `line-height: 1` line box, em ABOVE the baseline. */
  lineBoxTopEm: number;
  /** Bottom of a `line-height: 1` line box, em BELOW the baseline; negative when it sits above. */
  lineBoxBottomEm: number;
  /** Highest ink in the coverage set, em above the baseline. */
  inkTopEm: number;
  /** Deepest ink in the coverage set, em below the baseline. */
  inkBottomEm: number;
  topGlyph: string;
  bottomGlyph: string;
  /** Ink above the line box. */
  capOverflowEm: number;
  /** Ink below the line box. */
  descenderOverflowEm: number;
  /** The whole font's bbox, which reaches further than any coverage set can. */
  fontBBoxTopEm: number;
  fontBBoxBottomEm: number;
  coverage: string;
}

/**
 * The precondition of the whole pad formula, extracted so it can be tested without
 * fabricating a font: a browser lays a face out from its OS/2 TYPO metrics only when
 * `fsSelection` bit 7 is set. A face without it is laid out from win/hhea metrics
 * instead, so a pad computed from typo metrics would not match what is drawn.
 */
export function assertUsesTypoMetrics(usesTypoMetrics: boolean, file: string): void {
  if (usesTypoMetrics) return;
  throw new Error(
    `${file}: OS/2 fsSelection bit 7 (USE_TYPO_METRICS) is unset, so a browser lays this ` +
      `face out from win/hhea metrics and the generated pads would not match what it draws`,
  );
}

function openFace(file: string): Font {
  if (!existsSync(file)) throw new Error(`font file not found: ${file}`);
  const opened = fontkit.openSync(file);
  if (!("unitsPerEm" in opened)) {
    throw new Error(`font file is a collection, not a single face: ${file}`);
  }
  return opened;
}

/**
 * Measures the ink a face actually draws against the line box a browser lays out.
 *
 * Uses the OS/2 TYPO metrics, which is what a browser uses when the face sets
 * `fsSelection` bit 7 (USE_TYPO_METRICS). A face that does not set it is laid out
 * from hhea/win metrics instead, so the formula below would be quietly wrong - hence
 * the throw rather than a silent pad.
 */
export function measureFace(file: string, coverage: string = PRINTABLE_ASCII): FaceInkExtents {
  const font = openFace(file);
  const os2 = font["OS/2"];
  assertUsesTypoMetrics(os2.fsSelection.useTypoMetrics, file);
  const upm = font.unitsPerEm;
  const ascender = os2.typoAscender / upm;
  const descender = os2.typoDescender / upm;
  // `line-height: 1` gives the line box exactly 1em; the difference against the
  // font's content area is split evenly above and below, and goes NEGATIVE for a
  // face whose typo metrics are taller than its em square.
  const halfLeading = (1 - (ascender - descender)) / 2;

  let inkTop = -Infinity;
  let inkBottom = -Infinity;
  let topGlyph = "";
  let bottomGlyph = "";
  for (const ch of coverage) {
    const glyph = font.layout(ch).glyphs[0];
    if (!glyph) continue;
    const { minY, maxY } = glyph.bbox;
    if (Number.isFinite(maxY) && maxY / upm > inkTop) {
      inkTop = maxY / upm;
      topGlyph = ch;
    }
    if (Number.isFinite(minY) && -minY / upm > inkBottom) {
      inkBottom = -minY / upm;
      bottomGlyph = ch;
    }
  }
  if (!topGlyph || !bottomGlyph) {
    throw new Error(`${file}: no glyph in the coverage set had measurable ink`);
  }

  const lineBoxTopEm = ascender + halfLeading;
  // Signed bottom edge is `descender - halfLeading` (positive = above the baseline);
  // this is that edge expressed as "em below the baseline".
  const lineBoxBottomEm = -(descender - halfLeading);
  return {
    unitsPerEm: upm,
    typoAscenderEm: ascender,
    typoDescenderEm: descender,
    lineBoxTopEm,
    lineBoxBottomEm,
    inkTopEm: inkTop,
    inkBottomEm: inkBottom,
    topGlyph,
    bottomGlyph,
    capOverflowEm: inkTop - lineBoxTopEm,
    descenderOverflowEm: inkBottom - lineBoxBottomEm,
    fontBBoxTopEm: font.bbox.maxY / upm,
    fontBBoxBottomEm: -font.bbox.minY / upm,
    coverage,
  };
}

/**
 * Turns a measured overflow into a pad: add the rounding allowance, round UP to the
 * step. Never returns less than the overflow, and never less than one step, because
 * a face whose ink sits inside the box at one size can still lose a pixel to
 * rounding at another.
 */
export function padEm(overflowEm: number): number {
  const allowance = PAD_ROUNDING_ALLOWANCE_PX / PAD_SMALLEST_TEXT_PX;
  const needed = Math.max(overflowEm, 0) + allowance;
  const steps = Math.ceil(needed / PAD_STEP_EM - 1e-9);
  return Math.round(steps * PAD_STEP_EM * 1000) / 1000;
}

export interface DisplayPads {
  capPadEm: number;
  descenderPadEm: number;
  capPad: string;
  descenderPad: string;
  extents: FaceInkExtents;
}

export function displayPads(file: string, coverage: string = PRINTABLE_ASCII): DisplayPads {
  const extents = measureFace(file, coverage);
  const capPadEm = padEm(extents.capOverflowEm);
  const descenderPadEm = padEm(extents.descenderOverflowEm);
  return {
    capPadEm,
    descenderPadEm,
    capPad: `${capPadEm}em`,
    descenderPad: `${descenderPadEm}em`,
    extents,
  };
}
