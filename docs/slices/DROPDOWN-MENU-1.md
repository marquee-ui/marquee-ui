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
than counted as paint proof. Closure controls and full gate follow.

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
