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
Root lint and typecheck also pass. Independent review is closed below; one full
stream gate remains pending.

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

## Layer 1 (reviewer, detached worktree of 26d940d5a96b96691c8dcbe4f72c3006d35fedf0, port 4196)

| file                                                                          | test                                                                                                                                                                   | mutation applied                                                                          | red / GREEN           | what it asserts now                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| packages/ui/test/tooltip.test.tsx                                             | opens on keyboard focus with a supplemental description, closes on blur without trapping focus                                                                         | TooltipContent returns null                                                               | red                   | A keyboard-focused named trigger actually exposes supplemental text and description.                                                                                                                                                                  |
| packages/ui/test/tooltip.test.tsx                                             | Escape closes without moving focus and activating the named trigger still runs its action                                                                              | TooltipContent returns null                                                               | red                   | Initial Tooltip presence is required before dismissal/action checks.                                                                                                                                                                                  |
| packages/ui/test/tooltip.test.tsx                                             | reports controlled requests without changing the caller's state                                                                                                        | TooltipContent returns null                                                               | red                   | Caller-open content must exist; callback-only success is insufficient.                                                                                                                                                                                |
| packages/ui/test/tooltip.test.tsx                                             | uses provider delay and skip delay across roots, and resumes delay after the skip window                                                                               | TooltipContent returns null                                                               | red                   | The elapsed provider timer must produce First hint.                                                                                                                                                                                                   |
| packages/ui/test/tooltip.test.tsx                                             | lets a root override provider timing and hoverable-content behavior                                                                                                    | TooltipContent returns null                                                               | red                   | Root timing must produce actual content.                                                                                                                                                                                                              |
| packages/ui/test/tooltip.test.tsx                                             | ignores touch hover and keeps a touch action independently understandable                                                                                              | TooltipContent returns null                                                               | GREEN                 | The named touch trigger still runs its action while no tooltip opens. Honest trigger/touch scope; Content opening is outside this test.                                                                                                               |
| packages/ui/test/tooltip.test.tsx                                             | forwards refs, asChild, caller styles, content positioning and an explicit arrow                                                                                       | TooltipContent returns null                                                               | red                   | The Content ref must reach the caller's SECTION host.                                                                                                                                                                                                 |
| packages/ui/test/tooltip.test.tsx                                             | does not inject a portal or arrow and respects an explicit custom portal container                                                                                     | TooltipContent returns null                                                               | red                   | Explicit Content must exist in the supplied container.                                                                                                                                                                                                |
| packages/ui/test/tooltip.test.tsx                                             | forwards cancelable Escape and outside-pointer callbacks                                                                                                               | TooltipContent returns null                                                               | red                   | The mounted Content must own its Escape callback.                                                                                                                                                                                                     |
| packages/ui/test/tooltip.test.tsx                                             | passes disabled and prevented focus behavior to its trigger                                                                                                            | TooltipContent returns null                                                               | GREEN                 | Disabled/cancelled-focus trigger behavior remains intact. Honest trigger scope; this fixture has no Content.                                                                                                                                          |
| packages/ui/test/tooltip.test.tsx                                             | uses provider delay and skip delay across roots, and resumes delay after the skip window                                                                               | Provider overrides delayDuration and skipDelayDuration to zero                            | red                   | Exact predicted assertion: provider delay holds the first hint closed at 199ms.                                                                                                                                                                       |
| packages/ui/test/tooltip-focus.test.tsx                                       | owns a compiled solid 2px focus outline independent of docs CSS                                                                                                        | Remove Trigger focus-visible:outline-solid                                                | red                   | Exact predicted assertion: Tooltip trigger paints a solid outline.                                                                                                                                                                                    |
| packages/ui/stories/tooltip.stories.tsx via packages/ui/test/stories.test.tsx | tooltip/Default; tooltip/Keyboard; tooltip/Controlled; tooltip/ProviderDelays; tooltip/HoverableContent; tooltip/ImmediateClose; tooltip/CustomHosts; tooltip/InDialog | TooltipContent returns null                                                               | red (all eight plays) | Every meaningful Tooltip play requires actual Content.                                                                                                                                                                                                |
| packages/ui/test/stories.test.tsx                                             | tooltip: has stories                                                                                                                                                   | TooltipContent returns null                                                               | GREEN                 | Honest module inventory scope; it counts composed stories, not component behavior.                                                                                                                                                                    |
| packages/ui/stories/tooltip.stories.tsx via packages/ui/test/stories.test.tsx | tooltip/Controlled                                                                                                                                                     | Named Save action onClick becomes no-op                                                   | red                   | Saved 1 times; hint closed is required; received Saved 0 times; hint closed.                                                                                                                                                                          |
| packages/ui/stories/tooltip.stories.tsx via packages/ui/test/stories.test.tsx | tooltip/HoverableContent                                                                                                                                               | Set disableHoverableContent:true in that story's args                                     | GREEN                 | Existing static hover calls do not exercise trigger leave across one pointer session. A diagnostic confirmed Content remained mounted; this was NOT a detached-reference result.                                                                      |
| packages/ui/stories/tooltip.stories.tsx via packages/ui/test/stories.test.tsx | tooltip/HoverableContent (diagnostic)                                                                                                                                  | Disabled hoverability plus one userEvent.setup() instance and live Content assertions     | red                   | Content is actually removed on trigger leave; toBeInTheDocument fails at the intended assertion.                                                                                                                                                      |
| apps/docs/browser/tooltip.spec.ts                                             | Explicit custom hosts preserve placement, readable wrapping, collision bounds and a painted arrow (mobile)                                                             | Add Content overflow-hidden; rebuild root                                                 | GREEN                 | Ineffective clipping control: computed overflow is hidden, but actual SVG y=68..74 lies outside Content top=74 and its center still hits polygon. Its absolute wrapper positions against the fixed Popper ancestor. No clipping regression is proved. |
| apps/docs/browser/tooltip.spec.ts                                             | Explicit custom hosts preserve placement, readable wrapping, collision bounds and a painted arrow (mobile)                                                             | Add Arrow opacity-0; rebuild root                                                         | GREEN                 | Visibility and elementFromPoint both accept a completely transparent SVG; paint is not certified.                                                                                                                                                     |
| apps/docs/browser/tooltip.spec.ts                                             | Isolated Tooltip paints visible focus and readable content in dark, light, accent and forced colors (mobile diagnostic)                                                | Set adjacent body background to actual outline ink, leaving original assertions unchanged | GREEN                 | The test measures outline against trigger fill. Actual adjacent contrast becomes 1:1 in all three normal modes while the test passes.                                                                                                                 |

Review findings: one MEDIUM Arrow paint instrument gap and two LOW instrument gaps
(pointer session and contrast ground). Corrections are committed at
`60a202a3ae7594c70f5e957773b402f0a8533fa4`: Arrow paint now checks cumulative
ancestor opacity and the SVG polygon fill opacity; HoverableContent uses one
`userEvent.setup()` pointer session plus live connected/visible assertions; focus
contrast measures the actual adjacent body background. No product-source defect
was found. The three honest Content-collapse survivors above test trigger/touch
or module-inventory scope and require no behavioral change. The overflow-hidden
GREEN control is ineffective because the Arrow positions against the fixed Popper
ancestor outside the static Content box; it is not evidence of a missed clipping
regression. The named corrected controls close all three findings, as recorded below. The full
gate remains pending.

## Closure at committed 60a202a3ae7594c70f5e957773b402f0a8533fa4

Author committed test-only corrections. The detached reviewer switched to that exact SHA and inspected its two-file diff. All three original findings are CLOSED by the following named controls; no implementation-source fix was needed.

| file                                                                          | test                                                                                                         | mutation applied                                                                             | red / GREEN | what it asserts now                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| packages/ui/stories/tooltip.stories.tsx via packages/ui/test/stories.test.tsx | tooltip/HoverableContent                                                                                     | Set disableHoverableContent:true in corrected story args; mutation confirmed landed          | red         | One userEvent.setup() pointer session moves from trigger into Content; live Content membership fails with element could not be found in the document. Runner: Tests 1 failed, 181 skipped (182). |
| apps/docs/browser/tooltip.spec.ts                                             | Explicit custom hosts preserve placement, readable wrapping, collision bounds and a painted arrow (mobile)   | Source Arrow opacity-0; mutation confirmed landed; root rebuild exit 0                       | red         | Exact predicted assertion the explicit Arrow paints at full opacity: Expected 1, Received 0. Runner: 1 failed.                                                                                   |
| apps/docs/browser/tooltip.spec.ts                                             | Isolated Tooltip paints visible focus and readable content in dark, light, accent and forced colors (mobile) | Diagnostic changes adjacent body background to actual outline ink; mutation confirmed landed | red         | Exact predicted dark isolated focus outline contrast: Expected >=3, Received 1. Runner: 1 failed.                                                                                                |

The corrected ground control uses the preceding root build; only the test's runtime background fixture changes between the two browser controls, while focus source is unchanged. Author supplied positive corrected checks before requesting these controls; the reviewer deliberately ran no new viewport matrix or full gate. All mutations restored to 60a202a. Reviewer source tree is clean and reviewer port 4196 is free. The initial report's pending sentence is superseded by this closure. Worktree cleanup follows the report relay; durable logs/report remain in scratch.

Cleanup completed: `git worktree remove /home/ankit/Code/marquee-tooltip-reviewer-1` exited 0. No author/sibling worktree changed by reviewer probes.
