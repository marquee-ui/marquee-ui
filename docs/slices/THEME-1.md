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
checks all eight local preset values. Independent enumeration additionally named `brand-guard.test.ts` and
`project-coverage.test.ts` as consumers of the source-list helper; both were read
and retain their existing contracts. New symbols outside the theme fence: zero;
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

Targeted commands: `pnpm exec vitest run packages/tokens/test/docs-themes.test.ts
packages/tokens/test/source-coverage.test.ts packages/tokens/test/literal-guard.test.ts`;
`pnpm --filter @marquee-ui/docs test test/theme.test.ts`; rebuilt docs followed by
`DOCS_PORT=4195 pnpm --filter @marquee-ui/docs exec playwright test browser/theme.spec.ts`.

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

Full gate on 2026-10-08: `DOCS_PORT=4195 pnpm verify`, sentinel exit 0,
42 seconds wall, source head `6598c9f`. Runner summaries: library 37 files /
652 tests passed; docs 4 files / 21 tests passed; consumer 5 passed / 0 failed;
browser 39 passed in 20.7s. Lint, repository typecheck, token/registry/Storybook/docs
builds all passed. Gate artifact and logs: batch scratch `s1/verify.sha`,
`verify.log`, `verify.exit`. Subsequent changes are this formatted slice record
only; source/tests remain exactly the reviewed and gated head.
Publication/merge/deploy remain on hold.

## Layer 1

No new theme finding. Complementary/unchanged GREEN survivors are scoped below;
no additional legacy hardening was added. Source remained frozen at `6598c9f`
after review. Full gate runs against that source head; this closure is metadata.

## Compact Layer 1 (6598c9f, detached Marquee review, r5 / browser 4196)

| file / test names                                                                                                                                                                                                                                                                                                              | mutation applied                          | runner outcome           | scoped assertion / surviving GREEN cases                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/docs/test/theme.test.ts`: “keeps the default Arcade colors and applies all roles on the root”; “produces a full CSS override for the exact selected mode and palette”                                                                                                                                                    | `applyTheme` no-op                        | Exit 1: 2 red / 12 GREEN | Both role-application cases reject empty root colors; storage cases are unrelated.                                                                                                                                                                                               |
| `apps/docs/test/theme.test.ts`: “reads a complete saved choice including the expressive composition”                                                                                                                                                                                                                           | `readTheme` always returns default        | Exit 1: 1 red / 13 GREEN | Valid saved choice rejected; malformed/blocked inputs correctly still default, remaining cases are unrelated.                                                                                                                                                                    |
| `apps/docs/test/theme.test.ts`: “writes the whole choice under its versioned key and tolerates blocked writes”                                                                                                                                                                                                                 | `saveTheme` no-op                         | Exit 1: 1 red / 13 GREEN | Versioned write rejected as empty entries; read/role/recipe cases are unrelated.                                                                                                                                                                                                 |
| `packages/tokens/test/docs-themes.test.ts`: “offers four bounded combinations with both independent modes”; all eight “{palette}/{mode} passes the full role matrix, focus and hovered action fills” cases                                                                                                                     | All new palettes use Electric             | Exit 0: 9 GREEN          | Shape/contrast remain valid. Complementary browser palette test rejects this same mutation below; no uncovered new-theme behavior.                                                                                                                                               |
| `packages/tokens/test/docs-themes.test.ts`: “{palette}/{mode} passes the full role matrix, focus and hovered action fills”, Electric/Clementine/Tide × dark/light                                                                                                                                                              | New presets map `muted` to background     | Exit 1: 6 red / 3 GREEN  | Six new-preset contrast cases reject unreadable ink; Arcade and shape cases are unaffected.                                                                                                                                                                                      |
| `packages/tokens/test/literal-guard.test.ts`: “finds no literal colour, font name or shadow outside src/presets/**”; “finds no preset VALUE copied out of its preset”                                                                                                                                                          | Remove both source scan loops             | Exit 0: 5 GREEN          | PROVED preexisting scan weakness: both empty-offender checks survive; scope/sample self-checks do not observe scan execution. Loops are unchanged by this stream, outside bounded new-theme work.                                                                                |
| `packages/tokens/test/source-coverage.test.ts`: “walks exactly the published set, by path”; “reads real content for every one of them”; “resolves a repo root that actually contains the packages”                                                                                                                             | Undeclare `docs-themes.ts` in source list | Exit 1: 3 red / 2 GREEN  | Exact walk reports `Unexpected: [packages/tokens/src/presets/docs-themes.ts]`; story/comment checks are unrelated.                                                                                                                                                               |
| `apps/docs/browser/theme.spec.ts`: “expressive changes the composition's depth and identity, beyond its switch”                                                                                                                                                                                                                | Freeze expressive class                   | Exit 1: 1 red / 8 GREEN  | Computed-shadow red: “switch must change card depth”; remaining cases do not claim this composition change.                                                                                                                                                                      |
| `apps/docs/browser/theme.spec.ts`: “every mode/palette repaints the page and actual previews with readable roles”                                                                                                                                                                                                              | All new palettes use Electric             | Exit 1: 1 red / 8 GREEN  | Rendered palette red: “eight visibly distinct ground styles”, expected 8 / received 4; other mode/storage/composition checks remain valid.                                                                                                                                       |
| `apps/docs/browser/theme.spec.ts`: “persists palette, mode and composition across refresh and copies the selected CSS”                                                                                                                                                                                                         | `saveTheme` no-op                         | Exit 1: 1 red / 8 GREEN  | Refresh restores default instead of selected Light; live-state and independently seeded-storage cases do not depend on saving.                                                                                                                                                   |
| `apps/docs/browser/theme.spec.ts`: “every mode/palette repaints…”; all three “invalid preference safely restores the default and remains interactive” cases; “blocked storage still allows live themes and keyboard controls under reduced motion”; “boots with a valid saved choice and remains interactive when writes fail” | `applyTheme` no-op                        | Exit 1: 6 red / 3 GREEN  | Matrix/keyboard cases reject unchanged mode; all three invalid-input cases and valid-saved case reject identical rendered ground. Expressive/default structure are independent; persistence's before/after equality alone survives but the complementary rendering cases reject. |

No bounded new-theme findings. Baselines: theme unit 14 passed, targeted token suites 19 passed, mobile browser 9 passed; all exit 0. Browser mutations used 390×844 on isolated port 4196. Every mutation was confirmed landed and restored; server stopped and detached tree removed. Full per-test survivor names, classifications, diffs and runner logs: `/home/ankit/.marquee-scratch/RELEASE-1-UX/r5/report.md` and adjacent evidence. This compact section is metadata derived from those completed probes; no checks were rerun.
