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

- 2026-10-08: test-first unit run failed on the absent `../src/popover` module;
  implementation then passed 12 behavior tests and five compiled focus/target
  tests. `pnpm exec vitest run --project ui packages/ui/test/stories.test.tsx
-t popover` passed all seven plays plus the story inventory assertion (eight
  passed; 173 unrelated tests filtered). Root-wide lint and typecheck passed.
- Ten exported parts, seven stories/plays. Header/Title/Description are optional
  presentation slots with `asChild`; they do not generate or associate labels.
  Content uses caller-provided ARIA. Portal, Arrow and Close remain explicit.
  Unlike the common bundled shadcn Content recipe, Content injects no Portal.
  Positioning defaults remain Radix defaults; examples opt into offsets and padding.
- Built Chromium probe at 390px: explicit Arrow paints above the scrollable panel.
  Its triangle center is hit by `elementFromPoint` (the SVG polygon); inspected
  screenshot `~/.marquee-scratch/BATCH-PARITY-3/popover/arrow-before.png`.
  No overflow exception or additional scroll slot was needed.
- Initial browser pass: 21 passed / six failed. Two authored instruments needed
  correction: a parent Close is occluded until the nonmodal child dismisses on
  outside focus; Radix includes Arrow height in addition to `sideOffset` in the
  panel-to-anchor gap. Assertions now measure the accessible parent after
  dismissal and the actual 16px gap (8px offset plus 8px Arrow height).
- Focused browser run against `pnpm build` output: 27 passed (22.3s), nine tests
  on 390/768/1280px Chromium. It covers isolated dark/light/accent/forced-colors
  focus, nested Select and Dialog/Sheet, caller save/Cancel, exact highlighted
  copy, Arrow hit/scroll/resize readiness and independent Anchor collision bounds.
  Detached review and one full stream gate pending.

## Consumers

Pre-implementation scan at base `3bc6ba0`, 2026-10-08: `git grep -l -w <name>
3bc6ba0 -- packages apps` returned no consumer for any of these ten exports:
Popover, PopoverPortal, PopoverTrigger, PopoverAnchor, PopoverContent, PopoverClose,
PopoverArrow, PopoverHeader, PopoverTitle, PopoverDescription. No existing family
source or route changed; role and common control-class contracts are preserved.

Commit-point scan, 2026-10-08, from the same ten source exports using `rg` word
matches across package/app TS/TSX (excluding built output and dependencies):

```text
apps/docs/browser/popover.spec.ts
apps/docs/browser/site.spec.ts
apps/docs/src/catalog.ts
apps/docs/src/examples/popover.tsx
packages/ui/src/index.ts
packages/ui/stories/popover.stories.tsx
packages/ui/test/popover-focus.test.tsx
packages/ui/test/popover.test.tsx
```

Shared source/story/focus inventories, registry counters and generated
`packages/ui/r/popover.json` consume the new file; the orchestrator registered
these. `site.spec.ts` consumes the shared family list and was read. The distinctive
available-width/height classes had no existing literal consumer. Existing
Dialog/Select/Sheet tests consume unchanged dialog/button/textbox roles.
Ten names scanned, zero sibling CROSS, zero UNOWNED. Eight new source consumers
are accounted for above; shared registration remains orchestrator-owned.
