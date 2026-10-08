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

Pending test-first implementation and independent review.
