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

## Independent review and gate

Pending the committed implementation review, then one full stream gate.
