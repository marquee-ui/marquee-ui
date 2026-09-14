import { cpSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { runChecks } from "./checks/index.js";
import type { CheckFailure } from "./checks/index.js";
import { declaredCssVars, emitCss } from "./emit/css.js";
import { declaredJsonVars, emitDtcg } from "./emit/dtcg.js";
import type { DtcgDocument } from "./emit/dtcg.js";
import { displayPads } from "./font-metrics.js";
import type { DisplayPads } from "./font-metrics.js";
import { arcade } from "./presets/arcade.js";
import { light } from "./presets/light.js";
import type { Preset } from "./roles.js";

/**
 * The build: measure the faces, run every check, emit both files. A preset that
 * fails a check does not publish (D8), so this exits 1 and NAMES the failing pair
 * rather than writing output nobody looked at.
 */

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
export const FONTS_DIR = join(packageRoot, "fonts");
export const DIST_DIR = join(packageRoot, "dist");

/** Arcade is the default preset, so it takes the plain filenames. */
export const PRESETS: readonly { preset: Preset; basename: string }[] = [
  { preset: arcade, basename: "tokens" },
  { preset: light, basename: "light" },
];

export interface BuildResult {
  name: string;
  basename: string;
  css: string;
  json: DtcgDocument;
  pads: DisplayPads;
  failures: CheckFailure[];
}

const EMPTY_PADS: DisplayPads = {
  capPadEm: 0,
  descenderPadEm: 0,
  capPad: "0em",
  descenderPad: "0em",
  extents: {
    unitsPerEm: 0,
    typoAscenderEm: 0,
    typoDescenderEm: 0,
    lineBoxTopEm: 0,
    lineBoxBottomEm: 0,
    inkTopEm: 0,
    inkBottomEm: 0,
    topGlyph: "",
    bottomGlyph: "",
    capOverflowEm: 0,
    descenderOverflowEm: 0,
    fontBBoxTopEm: 0,
    fontBBoxBottomEm: 0,
    coverage: "",
  },
};

export function buildPreset(preset: Preset, fontsDir: string = FONTS_DIR): BuildResult {
  const failures: CheckFailure[] = [...runChecks(preset)];

  let pads = EMPTY_PADS;
  try {
    pads = displayPads(join(fontsDir, preset.fonts.display.file));
  } catch (error) {
    failures.push({
      check: "contrast",
      detail: `${preset.name}: display pads could not be generated - ${(error as Error).message}`,
    });
  }

  const css = emitCss(preset, pads);
  const json = emitDtcg(preset, pads);

  // The round trip is a check, not only a test: a hand-added line in either
  // template has to stop the build, not wait for someone to run vitest.
  const cssVars = declaredCssVars(css);
  const jsonVars = declaredJsonVars(json);
  const onlyInCss = cssVars.filter((name) => !jsonVars.includes(name));
  const onlyInJson = jsonVars.filter((name) => !cssVars.includes(name));
  for (const name of onlyInCss) {
    failures.push({
      check: "round-trip",
      detail: `${preset.name}: "${name}" is declared in the stylesheet but absent from the JSON`,
    });
  }
  for (const name of onlyInJson) {
    failures.push({
      check: "round-trip",
      detail: `${preset.name}: "${name}" is in the JSON but not declared in the stylesheet`,
    });
  }

  const basename = PRESETS.find((entry) => entry.preset === preset)?.basename ?? preset.name;
  return { name: preset.name, basename, css, json, pads, failures };
}

export function buildAll(fontsDir: string = FONTS_DIR): BuildResult[] {
  return PRESETS.map(({ preset }) => buildPreset(preset, fontsDir));
}

export function writeResults(results: readonly BuildResult[], outDir: string = DIST_DIR): string[] {
  mkdirSync(join(outDir, "fonts"), { recursive: true });
  const written: string[] = [];
  for (const result of results) {
    const css = join(outDir, `${result.basename}.css`);
    const json = join(outDir, `${result.basename}.json`);
    writeFileSync(css, result.css, "utf8");
    writeFileSync(json, `${JSON.stringify(result.json, null, 2)}\n`, "utf8");
    written.push(css, json);
  }
  // The faces ship beside the stylesheet, because the stylesheet asks for
  // `./fonts/<file>` and a preset that cannot load its face is a preset in name only.
  for (const { preset } of PRESETS) {
    for (const face of Object.values(preset.fonts)) {
      cpSync(join(FONTS_DIR, face.file), join(outDir, "fonts", face.file));
    }
  }
  return written;
}

export function main(): number {
  const results = buildAll();
  const failed = results.filter((result) => result.failures.length > 0);
  if (failed.length > 0) {
    for (const result of failed) {
      for (const failure of result.failures) {
        console.error(`FAIL [${failure.check}] ${failure.detail}`);
      }
    }
    console.error(`\n${failed.length} preset(s) did not publish.`);
    return 1;
  }
  const written = writeResults(results);
  for (const result of results) {
    const { extents } = result.pads;
    console.log(
      `${result.name}: cap-pad ${result.pads.capPad} (ink ${extents.inkTopEm.toFixed(3)}em, ` +
        `glyph "${extents.topGlyph}"), descender-pad ${result.pads.descenderPad} ` +
        `(ink ${extents.inkBottomEm.toFixed(3)}em, glyph "${extents.bottomGlyph}")`,
    );
  }
  console.log(`wrote ${written.length} files to ${DIST_DIR}`);
  return 0;
}

if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  process.exit(main());
}
