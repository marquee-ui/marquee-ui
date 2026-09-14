import type { DisplayPads } from "../font-metrics.js";
import type { Preset } from "../roles.js";
import { buildTokens } from "../tokens.js";
import type { Token } from "../tokens.js";

/**
 * The same tokens in W3C DTCG shape, which is what Figma and Style Dictionary read.
 *
 * `$value` is a STRING for every type. The 2024 editor's draft models a dimension as
 * `{ value, unit }`, which cannot express `clamp(2.5rem, 1.93rem + 3.37vw, 4.75rem)`
 * at all - and that clamp is a real token here. String values are what the importers
 * in use accept, so the format is stated rather than half-migrated.
 *
 * Aliases keep the tier link: a role's `$value` is `{primitive.olive-950}`, so a
 * Figma variable collection inherits the two tiers instead of flattening them.
 */

export interface DtcgLeaf {
  $type: Token["type"];
  $value: string;
  $extensions: { "gg.marquee.css": string };
}

export type DtcgGroup = Record<string, DtcgLeaf>;

export interface DtcgDocument {
  $description: string;
  [group: string]: DtcgGroup | string;
}

export function emitDtcg(preset: Preset, pads: DisplayPads): DtcgDocument {
  const document: DtcgDocument = {
    $description:
      `Marquee UI tokens, preset "${preset.name}" (${preset.colorScheme}). ` +
      `Generated from the preset; display pads measured from ${preset.fonts.display.file}.`,
  };

  for (const token of buildTokens(preset, pads)) {
    const [group, name] = token.path;
    const existing = document[group];
    const bucket: DtcgGroup = typeof existing === "object" ? existing : {};
    if (bucket[name]) {
      throw new Error(`duplicate token path: ${group}.${name}`);
    }
    bucket[name] = {
      $type: token.type,
      $value: token.alias ? `{${token.alias[0]}.${token.alias[1]}}` : token.value,
      $extensions: { "gg.marquee.css": token.cssVar },
    };
    document[group] = bucket;
  }

  return document;
}

/** Every custom property the JSON claims, for the round-trip guard. */
export function declaredJsonVars(document: DtcgDocument): string[] {
  const names = new Set<string>();
  for (const [key, group] of Object.entries(document)) {
    if (key.startsWith("$") || typeof group !== "object") continue;
    for (const leaf of Object.values(group)) {
      names.add(leaf.$extensions["gg.marquee.css"]);
    }
  }
  return [...names].sort();
}
