import type { Preset } from "../roles.js";
import { checkContrast } from "./contrast.js";
import { checkDistinctness } from "./distinctness.js";
import type { CheckFailure } from "./types.js";

export { AA_FLOOR, GRAPHIC_FLOOR, checkContrast, contrastMatrix } from "./contrast.js";
export type { ContrastResult } from "./contrast.js";
export { MIN_DELTA_E, checkDistinctness } from "./distinctness.js";
export type { CheckFailure } from "./types.js";

/** Every check a preset must pass before it publishes (D8). */
export function runChecks(preset: Preset): CheckFailure[] {
  return [...checkContrast(preset), ...checkDistinctness(preset)];
}
