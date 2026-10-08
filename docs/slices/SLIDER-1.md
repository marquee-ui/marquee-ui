# SLIDER-1 — composed Slider

Batch: BATCH-PARITY-4. Status: active; unreleased. Stream port 4192; reviewer 4196.

## Scope

Expose Root, Track, Range and Thumb as explicit parts. Caller composes each
thumb and names it; no implicit thumbs from a configuration array. Prove controlled
and uncontrolled single/range values, keyboard Home/End/arrows/page/shift stepping,
min/max/step/minStepsBetweenThumbs, pointer dragging and commit callbacks, disabled,
orientation and direction semantics. Exercise native form serialization and reset
behavior; document any primitive limit truthfully rather than promising native reset
without observing it. Prove real 44px thumb targets without enlarging the visible
track into an unrelated control. Name both range thumbs independently and show
accessible value text where it adds meaning. Do not implement unrelated form APIs.

Sources checked 2026-10-08: [Radix](https://www.radix-ui.com/primitives/docs/components/slider)
and [shadcn](https://ui.shadcn.com/docs/components/radix/slider). Dependency: `@radix-ui/react-slider@^1.5.0`.
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

Own only `packages/ui/src/slider.tsx`, `packages/ui/stories/slider.stories.tsx`,
`packages/ui/test/slider*.test.tsx`, `apps/docs/src/examples/slider.tsx`,
`apps/docs/browser/slider.spec.ts` and this slice record.

## Evidence

Pending test-first implementation and independent review.
