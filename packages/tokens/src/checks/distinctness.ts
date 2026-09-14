import { differenceCiede2000 } from "culori";
import { resolveColor } from "../resolve.js";
import { DISTINCT_PAIRS } from "../roles.js";
import type { Preset } from "../roles.js";
import type { CheckFailure } from "./types.js";

/**
 * The CIE ΔE2000 floor for two roles a user must never confuse.
 *
 * Measured while choosing it (culori `differenceCiede2000`, 2026-09-14):
 *   - two shades of the same acid yellow (#e4ff3a / #e8ff50): 1.45, below the ~2.3
 *     "just noticeable difference", i.e. the same colour;
 *   - the closest real pair in the system, yellow against amber
 *     (#e4ff3a / #ffb454): 30.83;
 *   - Arcade's own primary against its destructive (#e4ff3a / #ff5a4d): 63.83;
 *   - light's (#e4ff3a / #b3261e): 71.46.
 *
 * 25 sits an order of magnitude above a JND and below the closest pair the system
 * actually draws, so it rejects "another shade of the accent" without dictating the
 * palette. Confusing the action colour with the destructive one costs a user data,
 * which is why this pair gets a floor at all.
 */
export const MIN_DELTA_E = 25;

const deltaE = differenceCiede2000();
const round2 = (n: number) => Math.round(n * 100) / 100;

export function checkDistinctness(preset: Preset): CheckFailure[] {
  const failures: CheckFailure[] = [];
  for (const [a, b] of DISTINCT_PAIRS) {
    const colorA = resolveColor(preset, a);
    const colorB = resolveColor(preset, b);
    const difference = deltaE(colorA, colorB);
    if (!Number.isFinite(difference) || difference < MIN_DELTA_E) {
      failures.push({
        check: "distinctness",
        detail:
          `${preset.name}: "${a}" (${colorA}) and "${b}" (${colorB}) differ by ` +
          `ΔE2000 ${round2(difference)}, under the ${MIN_DELTA_E} floor`,
      });
    }
  }
  return failures;
}
