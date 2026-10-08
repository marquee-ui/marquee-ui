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

Implemented six explicit parts over Radix Tooltip 1.3.0. Provider and Root retain
primitive defaults and controlled state. Content adds role styles and defaults of
8px side offset/collision padding; all supported primitive props and refs pass through.
Portal and Arrow are never injected. Deliberate difference from shadcn's convenience
Content: callers compose those parts themselves. Tooltips support short supplemental
noninteractive text. Essential instructions and touch actions stay available without
a tooltip; interactive content belongs in Popover. Content wraps within the available
width without clipping its text or explicit Arrow.

Tests-first: on 2026-10-08, the initial two family test files failed with the expected
missing `../src/tooltip` import before implementation. Focused tests now pass
11/11, and all eight story plays pass through the shared story runner. Eight browser
cases cover the demo, provider delay/skip window, hoverable text and opt-out,
asChild/collision/Arrow, Dialog composition, isolated paint, touch and exact copying.

First browser iteration against a fresh `pnpm build`: exit 1, 18 passed/6 failed
(50.4s), saved at `~/.marquee-scratch/BATCH-PARITY-3/tooltip/browser.log`. The two
failures repeated at each width were instrument errors: story readiness looked for
an inner Tooltip trigger before opening Dialog, and a single pointer move stopped
at the event that creates Radix's grace area. Readiness now waits for rendered
Storybook content; exit movement continues through eight real pointer events beyond
the grace area. The six corrected cases pass (5.4s). No fixed sleeps or weaker
expectations were introduced. `embed=true` disables Storybook's autoplay in the
installed runtime, so these browser checks own their interactions.

The first run already proved Arrow paint with `elementFromPoint`, collision bounds,
wrapped text without clipping, 44px targets, touch activation, and isolated dark,
light, accent and forced-color focus/contrast at 390/768/1280. Inspected the dark
390, light 768, accent 1280 and collision 390 screenshots: focus and supplemental
text are visible, and the link's wrapped hint stays inside the viewport. The
Content's former clipping was removed before these measurements.

Final focused browser run on 2026-10-08 after rebuilding the final source: exit 0,
24 passed (20.1s), all three viewport projects. Logs and demo/isolated/collision
screenshots are under `~/.marquee-scratch/BATCH-PARITY-3/tooltip/browser-final/`.
Root lint and typecheck also pass. Detached review and one full stream gate remain
pending.

## Consumers

Before source work, `git grep` for Tooltip symbols and tooltip roles returned no
existing family consumers; the only hit was the newly admitted dependency manifest.
The focus-outline exact source inventory was discovered before implementation and
requested from the orchestrator. The exact focus utility fragment had existing
registry Dialog/AlertDialog copies as consumers; neither is changed by this family.

At the commit point, `rg` over six exported names in `packages` and `apps` found:

```text
apps/docs/browser/tooltip.spec.ts
apps/docs/src/examples/tooltip.tsx
apps/docs/src/catalog.ts
apps/docs/browser/site.spec.ts
packages/ui/r/registry.json
packages/ui/r/tooltip.json
packages/ui/src/index.ts
packages/ui/src/tooltip.tsx
packages/ui/test/tooltip-focus.test.tsx
packages/ui/test/tooltip.test.tsx
packages/ui/stories/tooltip.stories.tsx
```

Shared CROSS consumers (orchestrator-owned) are catalog, site browser smoke,
index exports, registry source/output, the source/story lists and counts, and the
focus-outline inventory. They were wired by the orchestrator before review. Read
the smoke's Tooltip selector: `[data-slot=tooltip-trigger]`, matching the demo.
No route contract changes, sibling-owned consumers or unowned behaviors were found.
The family role is `tooltip`; `aria-describedby` is primitive-owned and verified
against a trigger whose accessible name stays independent. Six names scanned,
zero unowned consumers; shared registration only.
