# CONTROLS-1 — visual theme controls and independent action accents

Implements the RELEASE-1-CONTROLS contract: compact sun/moon pressed buttons,
visual settings composed from existing Sheet/RadioGroup parts, four base palettes
and Automatic plus seven independent action accents. Library exports and versions
remain unchanged. Color literals stay in the existing local preset file.

## Consumers

Before: `git grep -n -E 'demoThemes|DemoMode|DemoPalette|ThemeSettings|themePreset|ThemeStudio|readTheme|customizationRecipe' -- apps packages`
found theme studio/state, App/main, docs theme unit tests, token docs-theme tests
and the literal guard. No CROSS or unowned consumer. Native Palette combobox
locators occur only in `apps/docs/browser/theme.spec.ts`; those now use the visual
trigger and named radios.

Commit point: the same scan plus `DEMO_ACCENTS|DemoAccent|withDemoAccent|ACCENTS`
adds only the local preset/state imports and the two owned token tests. Changed
file/class/ARIA scans found no additional consumers outside the owned theme tests.
The public token index and registry are unchanged. No route contract moves.

## As built

Chromium baseline at 390: Dark/Light x72/122 with widths50/55, gap0px, native select1.
The new toolbar is74px tall, with4px mode separation,44px targets, sun/moon icons,
pressed state, borders, hard depth and keyboard outlines. The selected trigger is
horizontal; its Sheet keeps choices in a scroll region above Done.

Bases retain all five grounds and brand roles; accents change primary fill, ink,
hover, muted fill and on-fill ink. Automatic returns the original preset. Syntax
already consumes primary ink, so it repaints through existing roles. Legacy valid
preferences acquire Automatic; invalid accent values and blocked storage fail
safely. The root and copied recipe share one declaration resolver.

Tests first: the browser probe reddened on gap>=4 (actual0) and missing visual
trigger. Theme unit tests reddened on accent persistence, legacy auto upgrade,
invalid accents and unchanged primary. The complete64-combination role matrix is
green. New browser checks cover seven distinct accent fills in both modes,
unchanged base surfaces/identity, focus/link/syntax ink, root/recipe correspondence,
keyboard choices/close/focus return and44px panel targets. At390×664, keyboard focus
scrolls Amber fully above Done (row529.98–582.20, Done602; centre hit=true).

Early ordinary screenshots and red logs live in
`/home/ankit/.marquee-scratch/RELEASE-1-CONTROLS/s1/`. Preview:4214. Existing4174 is
untouched. Parent approved the rendered direction; final integration owns capture.

A post-commit focused-row probe exposed the light panel's inherited bright-fill
outline (Lime1.125:1 on overlay). The local composed row now paints its outline
with primary ink; the browser checks its actual contrast in both modes for every
curated accent. This leaves the public RadioGroup API untouched.

## Layer 1 (reviewer, detached worktree of 435759bc92962488a7b5bf3a3a0c073db200cc00, slot r5)

| file                                       | test                                                                                                                                                                              | mutation applied                                                                     | red / GREEN               | what it asserts now                                                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apps/docs/test/theme.test.ts               | keeps the default Arcade colors and applies all roles on the root; produces a full CSS override for the exact selected mode and palette                                           | `applyTheme` body replaced with `void settings`                                      | red: 2 failed / 16 passed | Actual root writes: `background: expected '' to be '#0a0b07'` and selected background `expected '' to be '#f0eff9'`.                                                                   |
| apps/docs/test/theme.test.ts               | changes action ink and fill independently of surfaces and identity                                                                                                                | `themePreset` always returns `demoThemes.arcade.dark`                                | red: 1 failed / 17 passed | An explicit accent must change primary roles: `primary: expected '#e4ff3a' not to be '#e4ff3a'`.                                                                                       |
| apps/docs/test/theme.test.ts               | produces a full CSS override for the exact selected mode and palette                                                                                                              | same constant-preset mutation                                                        | GREEN                     | Asserts declaration correspondence and mode metadata; expected colors derive from the same preset resolver. Browser distinctness below independently covers selection effects.         |
| apps/docs/test/theme.test.ts               | safely defaults malformed/incomplete preferences: unknown and null accent cases                                                                                                   | accent validation condition replaced with `true`                                     | red: 2 failed / 16 passed | Invalid accents restore the complete default. The failure diff reports accepted light/Tide choices instead of dark/Arcade.                                                             |
| apps/docs/browser/theme.spec.ts            | every mode/palette repaints the page and actual previews with readable roles                                                                                                      | constant `themePreset`, followed by a successful docs rebuild                        | red                       | `eight visibly distinct ground styles`: expected 8, received 1.                                                                                                                        |
| apps/docs/browser/theme.spec.ts            | dark curated accents repaint actions, links, focus and syntax independently of the base; light curated accents repaint actions, links, focus and syntax independently of the base | same rebuilt constant preset                                                         | red: both                 | `seven visibly distinct action families`: expected 7, received 1. Selected run: `3 failed`, exit 1.                                                                                    |
| packages/tokens/test/docs-themes.test.ts   | offers four bounded combinations with both independent modes; all 64 named base/mode/accent matrix cases                                                                          | `withDemoAccent` returns its unchanged base                                          | GREEN: 65 passed          | Contrast, preserved base roles, fonts and mode remain valid. This instrument does not assert accent distinctness; the browser and docs unit instruments above do.                      |
| packages/tokens/test/docs-themes.test.ts   | all 56 non-Automatic base/mode/accent matrix cases                                                                                                                                | `accent-on-fill` set equal to accent fill                                            | red: 56 failed / 9 passed | Full role checks reject unreadable action text: `ink "primary-foreground" on ground "primary" is 1:1, below the 4.5:1 floor`. Automatic and enumeration cases legitimately stay green. |
| packages/tokens/test/literal-guard.test.ts | finds no literal colour, font name or shadow outside src/presets/**; finds no preset VALUE copied out of its preset                                                               | copied new Pink ink `#7e285b` into existing published `packages/tokens/src/index.ts` | red: 2 failed / 3 passed  | Both generic and preset-value scans name `packages/tokens/src/index.ts` and `#7e285b`.                                                                                                 |

Every mutation was applied to committed source in the reviewer checkout, its changed line was confirmed with `rg`, the runner's exit/summary and predicted assertion were read, and its source restored from the committed SHA before the next mutation. No `node_modules` edits. Exact names of **every** surviving test for each unit mutation are in `mutation-survivors.md`; they are mostly tests of unrelated preference, matrix-enumeration, or regex-sample properties. No additional claim is inferred from their green results.

Both MEDIUM findings are fixed at source commit
`1debecb3a16cf6fe0808a8128af2c58f1ebf4307`: visible Light row focus improved
from1.125:1 to7.626:1, and all12 tick opacities match the native checked state.
The reviewer independently rebuilt both the broken intermediate and corrected
commit. Final focused mobile browser run:3 passed (7.0s), exit0.

GREEN rows retain their intended boundaries: recipe correspondence checks exact
declarations, and the matrix checks role readability. No change is needed to
make these also test selection distinctness; the complementary docs unit and
actual browser tests demonstrably redden that collapse. Full survivor names and
probes remain in the reviewer scratch directory.

## Full gate

The one full stream gate runs against frozen source commit1debecb, with
`DOCS_PORT=4215 pnpm verify`, Node22.18.0/pnpm10.24.0, on2026-10-08.
Its real exit sentinel and runner log are in the s1 scratch directory. Result pending.
