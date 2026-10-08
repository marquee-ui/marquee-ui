# DROPDOWN-MENU-1 — composed DropdownMenu

Batch: BATCH-PARITY-4. Status: active; unreleased. Stream port 4191; reviewer 4195.

## Scope

Expose Root, Trigger, Portal, Content, Group, Label, Item, CheckboxItem,
RadioGroup, RadioItem, ItemIndicator, Separator, Arrow, Sub, SubTrigger and SubContent.
Optional Shortcut presentation slot is allowed. Parts remain explicit: no injected
portal, indicator, chevron, arrow or nested structure. Any cva axis is visual only.
Prove controlled/uncontrolled and modal/nonmodal operation, disabled items, typeahead,
arrow/Home/End navigation, selection and preventDefault, checkbox/radio state,
submenus with direction-aware keyboard traversal, Escape/outside closing and focus
return. Prove interaction inside existing Dialog/Sheet/Popover composition without
focus/pointer/scroll-lock leakage. Keep menu actions distinct from Select values.
Document deliberately explicit anatomy versus shadcn's bundled recipe.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/dropdown-menu)
and [shadcn](https://ui.shadcn.com/docs/components/radix/dropdown-menu). Dependency: `@radix-ui/react-dropdown-menu@^2.1.25`.
DropdownMenu's Menu 2.1.25 resolves dismissable-layer 1.1.20 and focus-scope 1.2.0,
the current overlay generation. Installed artifacts must prove compatibility too.

## Execution and ownership

Test first, implement, commit, obtain a fresh detached layer-1 review, then one full
stream `pnpm verify` after findings close. Use Node 22.18.0 and pnpm 10.24.0.
The orchestrator owns exports, dependencies/lockfile, registry, source/story/focus
inventories, counts, catalog, guide and STATUS. Request wiring as soon as the
source, stories and example stabilize; report exact exports and story/play counts.
You are not alone: preserve other agents' edits and do not revert their files.
No Pile database, Steam, screenshots pipeline or public operations. Publication held.

Retain strict types, role-only styles, supported primitive props/refs and asChild.
44px real interactive targets, dark/light/accent and forced-colors behavior must be
measured in Chromium at 390/768/1280. Focus checks observe actual style, width and
contrast outside docs CSS; arrow checks observe actual visible paint. Use live nodes
and actual focus/listener/animation/hit readiness, not fixed sleeps. Stories have
meaningful plays; examples are highlighted, exact-copy and use registry aliases.

Run meaningful negative controls only from committed detached copies; verify the
mutation landed and the named assertion is the predicted red, then restore from git.
The independent reviewer runs collapse/no-op controls across every touched test file,
reports surviving green assertions and writes its report to durable scratch. Paste
its mutation table and closure evidence here. Do not broaden into unrelated audits.
The orchestrator handles the merged review, packed consumer and stable preview.

Own only `packages/ui/src/dropdown-menu.tsx`, `packages/ui/stories/dropdown-menu.stories.tsx`,
`packages/ui/test/dropdown-menu*.test.tsx`, `apps/docs/src/examples/dropdown-menu.tsx`,
`apps/docs/browser/dropdown-menu.spec.ts` and this slice record.

## Evidence

Test-first import run failed because the owned source did not exist; implementation
then passed 11 family tests. The compiled focus fixture adds 8 tests; all 10 stories
have meaningful plays. Focus and target measurements use the emitted library CSS
in unit tests and actual computed styles/hit testing in isolated Storybook pages.

The first mobile browser iteration exposed a real submenu overflow: a fixed
192px minimum defeated Radix's available-width max (right edge 407px against a
374px collision bound). The minimum now clamps to the available width; the same
assertion passed on all three projects. No tolerance was widened.

Radix injects inline `outline: none` on Content/SubContent. The wrappers clear that
default while preserving caller styles; the unit suite proves both cases. Normal
keyboard entry roves to the first enabled item, so ContentFocus uses all-disabled actions to measure each content host's
own outline when no enabled item can receive focus. Default menu keyboard
behavior is proved separately. A pre-typecheck rejected `onEntryFocus` as a
non-public prop; that attempt was removed before the committed review point.

Installed `@radix-ui/react-menu@2.1.25/package.json` records dismissable-layer
1.1.20 and focus-scope 1.2.0. Nested Dialog/Sheet/Popover interaction proves
selection and Escape close the child only, restore parent focus, preserve parent
locks, then release them when the parent closes.

Focused command on 2026-10-08:
`pnpm exec vitest run --project ui packages/ui/test/dropdown-menu.test.tsx packages/ui/test/dropdown-menu-focus.test.tsx packages/ui/test/stories.test.tsx`:
3 files / 220 tests passed. Focused browser commands used `DOCS_PORT=4191`
and scratch outputs under `/home/ankit/.marquee-scratch/BATCH-PARITY-4/dropdown-menu/`:
`pnpm --filter @marquee-ui/docs exec playwright test browser/dropdown-menu.spec.ts`
proved 24 cases; the docs-demo follow-up (`-g 'demo owns'`) proved the remaining
3 after using `includeHidden` to observe the status Radix intentionally hides
while the modal menu is open. The source-copy assertion still compares exact bytes.

After the all-disabled ContentFocus story replaced the unsupported callback
attempt, the isolated focus case passed mobile/tablet and failed once on desktop:
the submenu disappeared before `toBeFocused` (`focus-browser-2.log`). The final
instrument parks the mouse outside the controls and waits for actual target size,
center hit and focused SubTrigger before sending its directional key. The same
three-project command (`-g 'isolated DropdownMenu'`) then passed 3 cases in 15.2s
(`focus-browser-3.log`). This is instrument setup; the disappearing submenu's cause
remains unproved and no product fix is claimed. The original trace is retained.

Browser checks measure 44px heights/widths and center hits; real solid outlines
at least 2px and contrast at least 3:1; text at least 4.5:1 in dark/light/accent;
forced-colors boundaries and focus; Arrow fill, opacity and actual center hit.
Mobile docs and all three isolated focus screenshots are retained in scratch.
Full lint and typecheck passed before the review commit. The reviewer proved an
instrument blind spot: making the Storybook body background equal to primary-ink
left all three isolated focus cases green because exterior outlines compared
against their own fill. The browser checks now measure Trigger, Content and
SubContent exterior outlines against the page body; inset item outlines keep the
actual highlighted item background. The same body-background collapse then failed on all three viewports at
`Dark Trigger outline contrast` (expected at least 3; received 1). Its restored
positive focus cases passed.

The reviewer also found a cross-consumer story identity defect: the catalog's
workbench URL normalizes `dropdown-menu` to `parts-dropdownmenu--default`, while
our initial `Parts/Dropdown Menu` title emitted `parts-dropdown-menu--default`.
The shared site family sweep failed at every width with `missing Storybook story
parts-dropdownmenu--default`. The owned title is now `Parts/DropdownMenu` and
owned iframe test URLs use that identity; the explorer's shared URL contract is
preserved. The initial wiring request's story ID is withdrawn. The reviewer also collapsed Trigger to `opacity-0`; the old focus checks stayed
green on a same-built-artifact discriminator despite the invisible trigger. The
browser focus helper now checks element and ancestor opacity with a named focus
paint assertion, in addition to style, width and adjacent-ground contrast. That
control's first unrelated missing-Share red is retained as cause-unproved rather
than counted as paint proof. The identical Trigger opacity collapse now fails all three projects exactly at
`Dark Trigger focus paint opacity` (expected 1; received 0). The restored reviewer
build passes the three focus cases in 15.6s. The rebuilt shared site family sweep
also passes all three widths (with focus: 6 cases / 21.2s). All findings are closed;
the full stream gate follows.

## Consumers

Before implementation (base `62dc9d4`), exported-symbol, route, touched-path,
role/ARIA and literal-class diff scans were empty: the owned files did not exist.
`git grep -n -E 'DropdownMenu|dropdown-menu|menuitemcheckbox|menuitemradio' -- packages apps`
printed only `packages/ui/package.json:26` (the coordinator's dependency).
No existing DropdownMenu source or consumers were present.

At the commit point, `rg -l` over each of the 16 source exports found only the new
family source, stories, family tests, docs example, browser spec, shared index,
catalog and site spec. Export names:

```text
DropdownMenu DropdownMenuPortal DropdownMenuSub DropdownMenuTrigger
DropdownMenuContent DropdownMenuGroup DropdownMenuLabel DropdownMenuItem
DropdownMenuCheckboxItem DropdownMenuRadioGroup DropdownMenuRadioItem
DropdownMenuItemIndicator DropdownMenuSeparator DropdownMenuArrow
DropdownMenuSubTrigger DropdownMenuSubContent
```

Named-path / role / family test consumers:

```text
apps/docs/browser/dropdown-menu.spec.ts
packages/ui/test/dropdown-menu-focus.test.tsx
packages/ui/test/focus-outline.test.tsx
packages/ui/test/dropdown-menu.test.tsx
packages/ui/test/registry.test.ts
apps/docs/browser/site.spec.ts
```

Class-fragment scan output:

```text
data-[highlighted]:outline-solid: packages/ui/r/select.json, packages/ui/r/dropdown-menu.json
min-w-[min(12rem,var(--radix-dropdown-menu-content-available-width))]: packages/ui/r/dropdown-menu.json
fill-overlay: packages/ui/r/tooltip.json, packages/ui/r/dropdown-menu.json, packages/ui/r/select.json, packages/ui/r/popover.json
```

Routes: none. ARIA menu roles belong to Radix; existing Select/RadioGroup consumer
contracts are untouched. CROSS consumers owned by the coordinator: exports,
catalog, source/story maps, registry and count/focus inventories. Wiring was
requested with the exact 16 exports and 10 stories/10 plays and completed in
`98a6a75` and `b488fa8`. No sibling-owned consumer or unowned behavior was changed. The independent
scan added the shared workbench URL builder `apps/docs/src/explorer.tsx`, which
was read and preserved, plus dynamically walked consumers:

```text
packages/ui/test/entry-point.test.ts
packages/ui/test/client-boundary.test.ts
packages/tokens/test/brand-guard.test.ts
packages/tokens/test/literal-guard.test.ts
packages/tokens/test/source-coverage.test.ts
packages/tokens/test/project-coverage.test.ts
```

These were read. The reviewer ran entry/client checks (2 files / 17 tests) and
token brand/literal/source/project guards (4 files / 16 tests), all green.

## Decisions

1. Keep Radix's default modal behavior; nonmodal is an explicit caller choice.
2. Expose exactly 16 primitive parts. No Shortcut helper or injected glyphs.
3. Highlighted actions paint a role-based solid inset outline; content/trigger
   focus paints a solid outline outside their border.
4. Clamp minimum width to Radix available width so narrow submenus fit the viewport.
5. Compared with shadcn's bundled presentation recipe, portals, indicators,
   submenu chevrons and arrows remain caller-owned anatomy. Select remains the
   form-value primitive.

## Layer 1 (reviewer, detached worktree of 209cbc3a18b15d6ae16d9ebadc27240953d23267, slot 5)

Original base 62dc9d48c8691b8ef1935bb34ddb2f8acbed5f3e. Closure rows explicitly name their later sha. Port 4195; no product operations,publication remains HOLD.

| file                                          | test                                                                                               | mutation applied                                                                           | red / GREEN | what it asserts now                                                                                                  |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------------------------------------- |
| packages/ui/test/dropdown-menu.test.tsx       | opens an uncontrolled portal menu, skips disabled actions and restores focus after selection       | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | reports controlled open changes without replacing caller state                                     | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | preserves disabled triggers and cancelable action selection                                        | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | checkbox indeterminate state and controlled radio choices notify once and show explicit indicators | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | uses Home, End, arrows and typeahead over enabled items                                            | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | opens and returns from a ltr submenu with directional keys                                         | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | opens and returns from a rtl submenu with directional keys                                         | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | forwards refs, custom hosts and portal container with explicit part anatomy                        | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | injects no portal, indicator, arrow or submenu glyph                                               | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | preserves cancelable Escape, outside interactions and close autofocus                              | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/dropdown-menu.test.tsx       | forwards checked, group and submenu refs with caller styles and custom hosts                       | Root ignores caller opening and remains open=false (m01)                                   | red         | An actual menu is required before state, refs, keyboard and composition assertions run.                              |
| packages/ui/test/stories.test.tsx             | dropdown-menu/Default                                                                              | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/Controlled                                                                           | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/Checkable                                                                            | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/Submenu                                                                              | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/RightToLeft                                                                          | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/Nonmodal                                                                             | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/PreventDismiss                                                                       | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/NestedOverlays                                                                       | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/CustomHosts                                                                          | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/stories.test.tsx             | dropdown-menu/ContentFocus                                                                         | Root ignores caller opening and remains open=false (m02)                                   | red         | The shared runner executes this story play and it requires the actual menu.                                          |
| packages/ui/test/dropdown-menu-focus.test.tsx | trigger compiles solid focus ink without a primitive inline override                               | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | content compiles solid focus ink without a primitive inline override                               | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | sub-content compiles solid focus ink without a primitive inline override                           | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | item compiles highlighted focus ink and a 44px target                                              | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | checkbox-item compiles highlighted focus ink and a 44px target                                     | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | radio-item compiles highlighted focus ink and a 44px target                                        | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | sub-trigger compiles highlighted focus ink and a 44px target                                       | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | Trigger compiles a 44px height and width                                                           | Remove hit minimums; set focus and highlighted outline widths to 0 (m03)                   | red         | Trigger/Content/SubContent outline width; item/Trigger target height.                                                |
| packages/ui/test/dropdown-menu-focus.test.tsx | item compiles highlighted focus ink and a 44px target                                              | Set highlighted outline widths to 0; preserve target size (m09)                            | red         | Highlighted item/checkbox/radio/subtrigger outline width fails by name.                                              |
| packages/ui/test/dropdown-menu-focus.test.tsx | checkbox-item compiles highlighted focus ink and a 44px target                                     | Set highlighted outline widths to 0; preserve target size (m09)                            | red         | Highlighted item/checkbox/radio/subtrigger outline width fails by name.                                              |
| packages/ui/test/dropdown-menu-focus.test.tsx | radio-item compiles highlighted focus ink and a 44px target                                        | Set highlighted outline widths to 0; preserve target size (m09)                            | red         | Highlighted item/checkbox/radio/subtrigger outline width fails by name.                                              |
| packages/ui/test/dropdown-menu-focus.test.tsx | sub-trigger compiles highlighted focus ink and a 44px target                                       | Set highlighted outline widths to 0; preserve target size (m09)                            | red         | Highlighted item/checkbox/radio/subtrigger outline width fails by name.                                              |
| packages/ui/test/focus-outline.test.tsx       | gives every focus ring an outline beside it, or names it as a known gap                            | Set only DropdownMenu focus-visible outline widths to 0 (m04)                              | red         | The source-derived invariant names dropdown-menu.tsx outline-width 0.                                                |
| packages/ui/test/focus-outline.test.tsx       | finds every part that draws a focus ring, and knows which ones are short                           | Remove all DropdownMenu focus-visible tokens (m05)                                         | red         | The exact inventory cannot silently lose this new ring site.                                                         |
| packages/ui/test/stories.test.tsx             | covers all twenty-seven part families, with every story counted                                    | Remove dropdown-menu from STORY_SUITES (m06)                                               | red         | The disk-derived family inventory and141-play counter detect missing 10 plays.                                       |
| packages/ui/test/stories.test.tsx             | runs all 141 play functions, and knows if one stopped running                                      | Remove dropdown-menu from STORY_SUITES (m06)                                               | red         | The disk-derived family inventory and141-play counter detect missing 10 plays.                                       |
| packages/ui/test/registry.test.ts             | declares the twenty-eight part families plus the one shared lib                                    | Remove dropdown-menu item from registry.json (m07)                                         | red         | Registry family/source inventory and dependency count/derivation reject the absent item.                             |
| packages/ui/test/registry.test.ts             | registers every component source exactly once                                                      | Remove dropdown-menu item from registry.json (m07)                                         | red         | Registry family/source inventory and dependency count/derivation reject the absent item.                             |
| packages/ui/test/registry.test.ts             | resolves every registry dependency inside this registry                                            | Remove dropdown-menu item from registry.json (m07)                                         | red         | Registry family/source inventory and dependency count/derivation reject the absent item.                             |
| packages/ui/test/registry.test.ts             | declares exactly the registry dependencies its sources import                                      | Remove dropdown-menu item from registry.json (m07)                                         | red         | Registry family/source inventory and dependency count/derivation reject the absent item.                             |
| packages/ui/test/registry.test.ts             | carries the CURRENT bytes of every source it ships                                                 | Set own committed r/dropdown-menu.json source content to empty; no node_modules edit (m14) | red         | The shipped item is compared with current source bytes and names dropdown-menu.                                      |
| test/explorer.test.tsx                        | keeps every family discoverable and resets preview state when switching                            | Remove dropdown-menu row from catalog (m08)                                                | red         | The explorer must expose 28 family controls; received 27.                                                            |
| apps/docs/browser/dropdown-menu.spec.ts       | DropdownMenu demo owns checked and radio state, selects a submenu action and returns focus         | Arrow adds opacity-0; rebuilt docs and Storybook (m10,all 3 projects)                      | red         | Arrow paint opacity expected > 0, received 0; geometry alone does not certify paint.                                 |
| apps/docs/browser/dropdown-menu.spec.ts       | isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors          | Arrow adds opacity-0; rebuilt docs and Storybook (m10,all 3 projects)                      | red         | Arrow paint opacity expected > 0, received 0; geometry alone does not certify paint.                                 |
| apps/docs/browser/dropdown-menu.spec.ts       | isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors          | Body background becomes --primary-ink; rebuilt Storybook at 209cbc3 (m11,all 3 projects)   | GREEN       | Self-ground misses an external outline matching its adjacent body background. LOW-1,closed below.                    |
| apps/docs/browser/dropdown-menu.spec.ts       | isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors          | Same body collapse at 070ea36 closure (m13,all 3 projects)                                 | red         | Dark Trigger outline contrast expected>=3,received 1; external hosts now use body ground.                            |
| apps/docs/browser/site.spec.ts                | renders every family and sends each workbench link to a real story                                 | DropdownMenu catalog Preview becomes ()=>null; rebuilt docs (m12,all 3 projects)           | red         | DropdownMenu must render its actual parts; absent trigger is rejected independently of catalog count.                |
| apps/docs/browser/dropdown-menu.spec.ts       | isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors          | Trigger source adds opacity-0; rebuilt Storybook at 070ea36; same artifact rerun (m15)     | GREEN       | Computed focus style/contrast and target hit testing ignore fully transparent Trigger paint; LOW-2 requires closure. |
| apps/docs/browser/dropdown-menu.spec.ts       | isolated DropdownMenu hosts paint readable focus in dark, light, accent and forced colors          | Same Trigger opacity-0 source collapse at d862748; rebuilt Storybook (m16,all 3 projects)  | red         | Dark Trigger focus paint opacity expected 1,received 0; the corrected instrument observes effective paint.           |

Closure summary: MEDIUM workbench identity closed at `5190e0f`; LOW outer-ground
contrast closed at `070ea36`; LOW focus opacity closed at `d862748`. Reviewer
ran 16 controls across all 9 test-bearing files. Both relevant GREEN instrument
rows were corrected and the identical mutations now fail at the named assertions.
The 188 GREEN survivors from removing the new story suite are unrelated existing
families; the new-family inventory and play anchors fail, so no unrelated tests
changed. The old twenty-seven label in the original-sha table was corrected by
the coordinator in `af0e028`; its assertion was already 28. The table's
`test/explorer.test.tsx` path is relative to `apps/docs`.

Complete durable logs and report:
`/home/ankit/.marquee-scratch/BATCH-PARITY-4/r5/report.md`.

## Full stream gate

On 2026-10-08, `DOCS_PORT=4191 pnpm verify` at `7ef0640145020c0091091395cc860a143265219b`
exited 1 after 219s: library 851 tests / 50 files, docs 39 / 4, consumer 5,
browser 200 passed / 1 failed (3.2m). The mobile navigation test's partial
`Menu` accessible-name locator also matched the new `Preview DropdownMenu`
catalog button. This was a cross-consumer name collision introduced by the
new family. The coordinator corrected all three navigation locators to exact
names in `fa37b8551640882889f0c50fe588fee6ccffbc39`, preserving the click and
both expanded-state assertions. The failed mobile case then passed against the
gate's unchanged built site: 1 passed (1.8s), exit 0. Logs and sentinels are
`dropdown-menu/verify.*` and `dropdown-menu/menu-discriminator.*` under the batch
scratch directory. The coordinator authorized a full gate rerun after this
discriminator; its result is pending. The independent reviewer inspected the
three-locator correction without a build or rerun and confirmed that all navigation
actions and assertions remain intact, then removed its clean detached checkout.
