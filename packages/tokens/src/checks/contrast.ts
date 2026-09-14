import { wcagContrast } from "culori";
import { resolveColor } from "../resolve.js";
import { BODY_INK_ROLES, GRAPHIC_ROLES, GROUND_ROLES, ON_FILL_PAIRS } from "../roles.js";
import type { ColorRoleName, Preset } from "../roles.js";
import type { CheckFailure } from "./types.js";

/** WCAG 1.4.3 AA for body text. Large text gets 3:1; the system does not assume large. */
export const AA_FLOOR = 4.5;

/** WCAG 1.4.11 for a graphic that carries meaning, e.g. the unfilled half of a run. */
export const GRAPHIC_FLOOR = 3;

/** Floating-point slack when comparing a measured ratio to a recorded one. */
const RATIO_EPSILON = 0.005;

export interface ContrastResult {
  ink: ColorRoleName;
  ground: ColorRoleName;
  ratio: number;
  kind: "ink-on-ground" | "ink-on-fill" | "graphic-on-ground";
  /** The floor THIS pair owes: 4.5:1 for text, 3:1 for a meaningful graphic. */
  floor: number;
}

const key = (ink: string, ground: string) => `${ink}|${ground}`;
const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * culori THROWS on a colour it cannot parse rather than returning a number, so an
 * invalid literal in a preset would otherwise crash the build with `Cannot read
 * properties of undefined (reading 'r')` and name neither the preset nor the role.
 * NaN here turns that into a named failure below.
 */
function ratio(a: string, b: string): number {
  try {
    return wcagContrast(a, b);
  } catch {
    return Number.NaN;
  }
}

/**
 * Every comparison the contrast check makes, pass or fail. Exported so a test can
 * count them: a check that quietly shrank its own matrix would still return no
 * failures for a good preset, and would prove nothing.
 */
export function contrastMatrix(preset: Preset): ContrastResult[] {
  const results: ContrastResult[] = [];
  for (const ground of GROUND_ROLES) {
    for (const ink of BODY_INK_ROLES) {
      results.push({
        ink,
        ground,
        ratio: ratio(resolveColor(preset, ink), resolveColor(preset, ground)),
        kind: "ink-on-ground",
        floor: AA_FLOOR,
      });
    }
    for (const graphic of GRAPHIC_ROLES) {
      results.push({
        ink: graphic,
        ground,
        ratio: ratio(resolveColor(preset, graphic), resolveColor(preset, ground)),
        kind: "graphic-on-ground",
        floor: GRAPHIC_FLOOR,
      });
    }
  }
  for (const [ink, fill] of ON_FILL_PAIRS) {
    results.push({
      ink,
      ground: fill,
      ratio: ratio(resolveColor(preset, ink), resolveColor(preset, fill)),
      kind: "ink-on-fill",
      floor: AA_FLOOR,
    });
  }
  return results;
}

/**
 * Every foreground-on-ground pair at or above 4.5:1 (D8), with one escape that is
 * not an escape: a preset may RECORD a pair it knowingly ships short, and the check
 * then fails if that pair passes (the exception is stale and must go) or if it has
 * slipped below the ratio recorded (it is rotting). An exception naming a pair the
 * matrix does not contain fails too, so the list cannot accumulate dead entries.
 */
export function checkContrast(preset: Preset): CheckFailure[] {
  const failures: CheckFailure[] = [];
  const matrix = contrastMatrix(preset);
  const exceptions = new Map(preset.contrastExceptions.map((e) => [key(e.ink, e.ground), e]));
  const seen = new Set<string>();

  for (const result of matrix) {
    const k = key(result.ink, result.ground);
    seen.add(k);
    const exception = exceptions.get(k);

    if (!Number.isFinite(result.ratio)) {
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: "${result.ink}" (${resolveColor(preset, result.ink)}) on ` +
          `"${result.ground}" (${resolveColor(preset, result.ground)}) is not a readable ` +
          `colour pair - one of them did not parse`,
      });
      continue;
    }

    if (result.ratio >= result.floor) {
      if (exception) {
        failures.push({
          check: "contrast",
          detail:
            `${preset.name}: the contrast exception for ink "${result.ink}" on ground ` +
            `"${result.ground}" is stale - the pair now passes at ${round2(result.ratio)}:1. ` +
            `Delete the exception.`,
        });
      }
      continue;
    }

    if (!exception) {
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: ink "${result.ink}" on ground "${result.ground}" is ` +
          `${round2(result.ratio)}:1, below the ${result.floor}:1 floor`,
      });
      continue;
    }

    if (result.ratio < exception.ratio - RATIO_EPSILON) {
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: ink "${result.ink}" on ground "${result.ground}" is ` +
          `${round2(result.ratio)}:1, worse than the ${exception.ratio}:1 its exception records`,
      });
    } else if (result.ratio > exception.ratio + RATIO_EPSILON) {
      // The record is a MEASUREMENT, not a budget. Left unchecked, an exception
      // recorded at 1.01 would license every regression down to 1.01.
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: ink "${result.ink}" on ground "${result.ground}" is ` +
          `${round2(result.ratio)}:1, better than the ${exception.ratio}:1 its exception ` +
          `records - update the recorded ratio`,
      });
    }
  }

  for (const exception of preset.contrastExceptions) {
    if (!seen.has(key(exception.ink, exception.ground))) {
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: the contrast exception for "${exception.ink}" on ` +
          `"${exception.ground}" names a pair this check never makes`,
      });
    }
    if (!exception.reason.trim()) {
      failures.push({
        check: "contrast",
        detail:
          `${preset.name}: the contrast exception for "${exception.ink}" on ` +
          `"${exception.ground}" carries no reason`,
      });
    }
  }

  return failures;
}
