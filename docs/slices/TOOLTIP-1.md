# TOOLTIP-1 — composed Tooltip

Batch: BATCH-PARITY-3. Status: active; unreleased. Stream port 4192; reviewer 4196.

## Scope

Expose Provider, Root, Trigger, Portal, Content and Arrow as explicit Marquee parts.
Provider owns configurable delay/skip delay and hoverable-content behavior. Preserve
controlled/uncontrolled state, keyboard focus/blur, hover, Escape, positioning,
collision bounds, custom containers and asChild/ref forwarding. Tooltip content is
supplemental noninteractive text: never the only accessible name or an essential
touch-only instruction; explain that contract in stories and live docs. No injected
portal or arrow. Prove composition on a Dialog control and touch does not trap focus
or require a tooltip to understand an action. Popover composition is integration-owned.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/tooltip)
and [shadcn](https://ui.shadcn.com/docs/components/radix/tooltip). npm reports Tooltip
1.3.0 with dismissable-layer1.1.20/popper1.3.8, matching existing overlays.

## Execution and ownership

Test first, then implement; commit source before independent reviewer mutations in a
detached copy. Read the intended assertion from each actual bounded negative control.
One full stream `pnpm verify` follows review closure. Node 22.18.0, pnpm 10.24.0.
No Pile database, Steam, screenshot pipeline or public operations. Publication is held.

Own the family source, story module, family-named UI tests, docs example, docs browser
spec and this record. The orchestrator alone wires exports, manifests/lock, registry,
source/story/focus inventories, counts, catalog, guide and STATUS. Request wiring as
soon as source/stories/demo stabilize, including exports, counts and catalog copy.
You are not alone: preserve other agents' edits and do not revert their files.

Retain strict types, role-only styles, supported primitive props/refs and asChild.
44px targets, dark/light/accent and forced-colors readability must be measured in
real Chromium at 390/768/1280. Prove focus outline style AND width AND contrast
without docs CSS (Storybook/installed copies). Use actual animation/listener/hit-target
readiness, not fixed sleeps. Stories carry meaningful plays; demos include exact
highlighted copyable examples. Orchestrator handles fresh packed-consumer acceptance.
Document deliberate API differences and unreleased status. Stay within this slice.

Exact owned files: `packages/ui/src/tooltip.tsx`,
`packages/ui/stories/tooltip.stories.tsx`, `packages/ui/test/tooltip*.test.tsx`,
`apps/docs/src/examples/tooltip.tsx`, `apps/docs/browser/tooltip.spec.ts`, this doc.

## Evidence

Pending test-first, implementation, detached review and stream gate.
