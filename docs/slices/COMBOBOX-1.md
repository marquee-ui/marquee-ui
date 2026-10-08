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
