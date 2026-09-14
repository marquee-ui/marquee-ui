import type { ColorRoleName, Preset } from "./roles.js";

/**
 * Tier 2 -> tier 1: a role's colour is the literal of the primitive it names.
 * Every check, every emitted value and every JSON token goes through here, so a
 * role can never be measured against one colour and shipped as another.
 */
export function resolveColor(preset: Preset, role: ColorRoleName): string {
  const key = preset.color[role];
  const literal = preset.primitives[key];
  if (literal === undefined) {
    throw new Error(`preset "${preset.name}": role "${role}" names undeclared primitive "${key}"`);
  }
  return literal;
}

export function resolveColors(preset: Preset): Record<string, string> {
  const out: Record<string, string> = {};
  for (const role of Object.keys(preset.color) as ColorRoleName[]) {
    out[role] = resolveColor(preset, role);
  }
  return out;
}
