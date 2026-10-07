# THEME-1 — live theme studio and meaningful expressive styling

Own the theme surface listed in RELEASE-1-UX. Reproduce the current inert expressive
switch and missing controls in a real browser; write behavior-first checks. Ship compact
accessible controls for separate dark/light mode and several curated identity/action
palettes, persistent across refresh with safe malformed/unavailable-storage fallbacks.
Choices visibly repaint page and previews, remain reachable from getting-started, and
honor 44px targets, keyboard focus, reduced motion and contrast in every supported pair.
Make the expressive switch visibly change its composition beyond the thumb, with truthful
copy. Provide a copyable recipe reflecting selected mode/palette; identify additional
palettes as local demo customizations rather than published presets.

Read existing preset/role/contrast architecture. Color literals stay in presets; preserve
published package versions and exports. Coordinate code syntax roles/CopyCode language
with CODE-1. Commit before independent review/negative controls; one full gate afterward.

## Consumers

Before implementation (base `037bd22`, 2026-10-08): inspected `App` → `main.tsx`,
`StudioCard` → `App`; `CopyCode` → `app.tsx`, `explorer.tsx`, `markdown-guide.tsx`
and copy/markdown tests. CROSS: `CopyCode` optional language (CODE-1): agreed CSS
consumer; consumed its interface commit `38df40c` as `c831ed0`, without editing the
sibling's source or tests. The original docs browser suite consumes primary action
contrast, self-hosted faces, the switch role, anchors and all family previews.
Preset-path search found existing token tests, the source list and literal guard;
the published Arcade/Light values, emitters and exports stay unchanged.

Commit-point scan: `demoThemes` → `theme.ts`, `docs-themes.test.ts`, literal guard;
`DemoMode`/`DemoPalette` → `theme.ts`; `ThemeSettings`, `DEFAULT_THEME`,
`THEME_STORAGE_KEY`, `PALETTES`, `readTheme`, `saveTheme`, `themePreset`,
`applyTheme`, `customizationRecipe` → theme studio, App, main and theme tests;
`ThemeStudio` → App. New anchor literals `#theme-studio` and `#theme-recipe` are
consumed only by App/studio and the theme browser spec. New class literals
`studio-card is-expressive`/`is-restrained` have no preexisting pinned registry or
unit consumer. Existing `Make it expressive` remains a switch; no role changes.
The new preset source is declared in the exact source list, and the literal guard
checks all eight local preset values. New symbols outside the theme fence: zero;
UNOWNED contracts: zero. CODE's semantic syntax classes consume the same existing
readable role names; integration must check its actual colored output.

## As built

The sticky studio supplies independent Dark/Light buttons and Arcade acid,
Electric, Clementine and Tide choices. All page and preview colors come from
canonical root roles. Settings are validated as a complete mode/palette/boolean
choice, applied before React renders, persisted safely and held in memory when
storage is blocked. The expressive card uses display type, identity ink/frame
and hard depth; its restrained composition uses body type, quiet frame and soft
depth. The selected CSS recipe contains the complete color/depth assignments and
explicitly identifies the additional palettes as local demo customizations rather
than npm 0.1.0 exports. No package version, export or component API changed.

Tests-first browser reproduction against the built base: 2 failed, specifically
unchanged card shadow after the expressive switch and missing Theme studio.
The original shadow was identical before/after (`3px 3px` hard depth). Saved
traces: `s1/red-browser` in the batch scratch directory.

Targeted checks on 2026-10-08: token matrix/source/literal guards 3 files / 19
passed; docs theme unit 1 file / 14 passed; rebuilt docs browser theme spec 27
passed in 14.6s at 390/768/1280. The browser checks eight distinct page and live
preview grounds/heading inks, four distinct action/identity fills, body/code-role
contrast on all five grounds, actual primary and brand fill contrast, actual
focus outline contrast, preserved real fonts, refresh/copy bytes, invalid and
blocked storage, 44px controls, keyboard input and reduced motion. Earlier
targeted test failures came from loading a startup hash before React had mounted
the target and programmatic focus after pointer input; the corrected instruments
click the real Start building link and enter keyboard modality before measuring
`:focus-visible`. This does not claim initial hash arrival or add a navigation fix.

Preview: `http://localhost:4194/marquee-ui/`. Clean viewport evidence in
`s1/theme-mobile-top.png`, `theme-mobile-card-focus.png`,
`theme-mobile-getting-started.png`; focused expressive switch at y456–500, toolbar
bottom78, positive `elementFromPoint` hit. Earlier tall element screenshot placed
the sticky toolbar inside its crop and must not be used as viewport evidence.
Desktop dark/light/expressive views are in `s1/theme-dark-1280.png`,
`theme-electric-light-1280.png` and `theme-restrained-1280.png`.

Full gate follows independent layer 1. Publication/merge/deploy remain on hold.

## Layer 1

Pending.
