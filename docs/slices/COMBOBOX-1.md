# COMBOBOX-1 — composed searchable popup

Batch: BATCH-PARITY-5. Status: active; unreleased.
Stream port 4191; reviewer 4195.

## Scope

Build a bounded single-select searchable popup with explicit parts, using cmdk
1.1.1 and the existing compatible Radix Popover. Expose caller-composed trigger,
portal/content, search input, list, items, groups and empty state; separate active
navigation from committed selection. Prove controlled and uncontrolled open state,
caller-controlled committed values, search/filtering, keyboard arrows/Home/End/Enter,
disabled choices, empty results, meaningful accessible labels, selected value display,
Escape/outside dismissal/focus return and composition inside Dialog/Sheet. Keep native
form state explicit in the caller example rather than implying an untested form API.

This is NOT drop-in current-shadcn API parity. The current shadcn Combobox page
(including its /radix URL) links Base UI and supports editable/chips/multiple APIs.
This batch deliberately retains the Radix stack and popup single-select recipe;
editable inline input, multiselect/chips, object collections and virtualization are
not included. No new Command family is promised. Use cmdk's plain root, not its Dialog.

Primary sources checked 2026-10-08:
[shadcn Combobox](https://ui.shadcn.com/docs/components/radix/combobox),
[cmdk](https://github.com/dip/cmdk#use-inside-popover) and
[Radix Popover](https://www.radix-ui.com/primitives/docs/components/popover).
`npm view cmdk version dependencies --json`: 1.1.1. Keep compatible overlay ranges.

## Execution and ownership

Test first, implement, commit, obtain a fresh independent detached layer-1 review,
close findings, then run one full stream `pnpm verify`. Node 22.18.0 / pnpm 10.24.0.
No Pile database, Steam or shots commands. Public operations remain held.
The orchestrator owns dependencies/lockfile, exports, source/story/focus inventories,
registry/generated files, counts, catalog, guide and STATUS. Request wiring once
source, stories and example stabilize; include exact exports and story/play counts.
You are not alone in this repository; preserve others' edits and do not revert them.

Keep strict types, role-only styles and meaningful story plays. Measure actual
44px controls, keyboard/pointer outcomes and visible selected/focus paint outside
docs CSS, at 390/768/1280 in dark/light/accent/forced colors. Measure outline style,
width, contrast against the actual exterior surface and effective ancestor visibility.
Use live connected DOM and real focus/listener/animation/hit readiness. Inspect
complete canvases, including controls below the fold. Copyable examples use registry aliases.

The independent reviewer mutates a committed detached copy and runs collapse/no-op
controls across every touched test file; verify each mutation landed and failed at
the predicted assertion, then restore. Copy its table and closures into this record.
Any proposed negative control in this brief is UNVERIFIED until run.

Own only `packages/ui/src/combobox.tsx`, `packages/ui/stories/combobox.stories.tsx`,
`packages/ui/test/combobox*.test.tsx`, `apps/docs/src/examples/combobox.tsx`,
`apps/docs/browser/combobox.spec.ts` and this slice record.

## As built

Parts: Combobox (Radix open state), Trigger, Portal, Content, Command (plain cmdk
root), Input, List, Item, Group, Empty and Separator. The caller supplies every
part and all displayed selection/checkmark content. Commit via Item.onSelect;
Command.value/onValueChange track the active descendant only. The docs example
uses an explicit caller-owned hidden input, not a library form API. Ten stories
and ten plays cover search, keyboard selection, empty/disabled choices, controlled
open/external committed state, custom hosts, form submission, scrolling and
nested Dialog/Sheet. The story Outside action is below the popup's occupied
rectangle so its pointer proof exercises an exposed control.

cmdk 1.1.1 owns Input's aria-labelledby and List's aria-label: label the search
through Command.label and the results through List.label. Input has role combobox;
Trigger is a button opening the labelled Radix dialog. Native asChild on cmdk's
root/list/group is deliberately omitted from the public wrapper types. A real
root asChild section failed with `Cannot use 'in' operator to search for 'render'
in section`; that upstream behavior is retained in the scope decision instead
of introducing an internal compatibility layer. Popover Trigger asChild, Input
asChild and Item asChild are measured with their real hosts/ref/event behavior.
The omitted container properties are checked by TypeScript in the focused test.

## Consumers

Base snapshot scan at `be5a16344c9a178a40183c9ed57250a1b8cc914e`, using
`git grep -l -E 'combobox|Combobox' <base> -- apps packages registry.json`:

```text
apps/docs/browser/dialog.spec.ts
apps/docs/browser/popover.spec.ts
apps/docs/browser/select.spec.ts
packages/ui/stories/dialog.stories.tsx
packages/ui/stories/popover.stories.tsx
packages/ui/stories/select.stories.tsx
packages/ui/test/select.test.tsx
```

These refer to Radix Select's input role; no prior Combobox export, route or family
exists. Those contracts remain Select-owned. The added family uses the existing
Dialog/Sheet/Popover overlay stack, with nested selection/dismissal proof.

Commit-point symbol/path/role/class scan (2026-10-08):

```text
packages/ui/src/index.ts
packages/ui/test/helpers/story-suites.ts
packages/ui/test/focus-outline.test.tsx
packages/ui/test/registry.test.ts
packages/ui/test/stories.test.tsx
packages/ui/test/tailwind-compile.test.tsx
packages/tokens/test/helpers/source-files.ts
apps/docs/src/catalog.ts
apps/docs/test/explorer.test.tsx
apps/docs/browser/site.spec.ts
registry.json
packages/ui/r/combobox.json
```

These shared consumers belong to the orchestrator, which committed their wiring.
The new data slots are combobox-trigger/content/command/input/list/item/group/empty/
separator. The docs example is data-combobox-demo, story entry parts-combobox--default.
There are no new route or href helpers. Fourteen existing test/browser files
resolve combobox/option/listbox/dialog roles; the added family changes none of
their existing controls. The distinctive active-item outline literal appears
only in the generated combobox registry item. Source/stories inventory, global
story/play counters, focus inventory, registry counts and docs catalog/test
inventory are explicitly enumerated consumers and are included in review.

## Validation and retained failures

Test-first import failure is retained in scratch `s1/test-first.log`. Focused
eight-test unit suite passed after implementation (`s1/unit8.log`). The first
focused compiled-style run returned 310 passed / 1 failed: a real native hidden
form input was measured as an interactive 0px target. That exposed the shared
instrument's missing native-hidden-input distinction; the orchestrator owns its
correction and review. No fake geometry was assigned to the transport.

The initial seven-test mobile browser run returned 4 passed / 3 failed
(`s1/browser.log` and retained traces): the empty-state locator matched both
rendered results and highlighted source, the outside control was occluded by
the open popup, and forced-colors changed computed color-scheme to light dark.
The empty-state locator now scopes to the real listbox; the outside control is
placed below the popup; preset readiness is asserted before enabling forced
colors. The isolated paint proof reads actual outline style/width, exterior
background, composited paint contrast and cumulative ancestor visibility/opacity.
It runs across dark, light, accent and forced colors in all three viewports,
without docs CSS. Scroll/hit readiness checks include the final row, and full-page
screenshots capture canvases beyond the fold. Original failures are preserved.

After the three browser instrument/composition corrections, focused browser proof
passed 21/21 across mobile, tablet and desktop (`s1/browser2.log`). Focused root
checks passed 311 tests in five files (`s1/focused2.log`); docs passed 39 tests
(`s1/docs-focused.log`). Build and typecheck passed. Full isolated mobile dark,
accent and forced-color canvases, desktop light and final-row scroll captures
were visually inspected; the complete exterior focus outlines and final-row
geometry remain visible. Measurements and logs are dated 2026-10-08.
