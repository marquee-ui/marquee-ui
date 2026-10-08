# POPOVER-1 — composed Popover

Batch: BATCH-PARITY-3. Status: active; unreleased. Stream port 4191; reviewer 4195.

## Scope

Expose Radix Popover Root, Trigger, Anchor, Portal, Content, Close and Arrow as
Marquee parts, plus optional Header/Title/Description presentation slots if they
fit existing conventions. Explicit composition: Content does not inject portal,
arrow, close or labels. Caller supplies accessible naming with aria attributes.
Nonmodal default and modal option, controlled/uncontrolled state, positioning,
collision bounds, focus restoration, outside/Escape closing and prevented callbacks.
Close must be form-safe. Prove Select inside Popover and Popover inside Dialog/Sheet
without leaked pointer/focus locks. Tooltip cross-family behavior is integration-owned.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/popover)
and [shadcn](https://ui.shadcn.com/docs/components/radix/popover). npm reports Popover
1.2.0 with dismissable-layer1.1.20/focus-scope1.2.0/popper1.3.8, matching existing overlays.
Positioning properties remain primitive-owned; content is bounded and scrollable.

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

Exact owned files: `packages/ui/src/popover.tsx`,
`packages/ui/stories/popover.stories.tsx`, `packages/ui/test/popover*.test.tsx`,
`apps/docs/src/examples/popover.tsx`, `apps/docs/browser/popover.spec.ts`, this doc.

## Evidence

Pending test-first, implementation, detached review and stream gate.
