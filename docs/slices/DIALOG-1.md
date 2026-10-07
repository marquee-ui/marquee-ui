# DIALOG-1 — composed Dialog

Batch: BATCH-PARITY-2. Status: active. Publication remains held in STATUS.md.

## Scope and ownership

Own `packages/ui/src/dialog.tsx`, `packages/ui/stories/dialog.stories.tsx`,
`packages/ui/test/dialog*.test.tsx`, `apps/docs/src/examples/dialog.tsx`,
`apps/docs/browser/dialog.spec.ts`, and this record. Stream port 4191; reviewer
port 4195. The orchestrator alone owns manifests/lock, source/export/story maps,
registry/counters, catalog, global family counts, STATUS and packed-consumer proof.
Request shared wiring when source and stories are ready; do not edit shared files.

Modal default and non-modal behavior; outside click, Escape and explicit Close; nested Select inside Dialog and Dialog inside existing Sheet. Explicit Close must not submit a surrounding form by accident.

References checked 2026-10-08: [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
and [shadcn Dialog](https://ui.shadcn.com/docs/components/radix/dialog).
The npm registry reports AlertDialog 1.1.24 with Dialog 1.2.0 as its dependency,
matching Sheet's existing minimum and Select's shared overlay generation.

## Acceptance

Test first, then implementation and independent detached-worktree review at a committed
source head. Run actual bounded negative controls and read the predicted assertion;
commit before mutation and restore only the probe tree. After review closure run one
full `pnpm verify` on the stream. No Pile commands, database, shots or public operations.

Use current maintained Radix primitives, strict types, role-only styling and composable
parts. Expose supported underlying props, refs and asChild; cva only for visual axes.
Explicit Portal/Overlay/Content composition must avoid injected structural controls.
Provide a default centered panel, accessible title/description, optional Header/Footer
slots and caller-supplied content/actions. New interactive hosts own 44px targets and
painted keyboard focus. Verify actual outline style, width and contrast in isolation
from docs CSS; cover dark/light/accent and forced colors. Tall content must scroll and
remain inside the viewport at 390/768/1280.

Stories and meaningful plays cover controlled/uncontrolled state, keyboard open/close,
focus trap and restoration, title/description association, asChild/ref propagation,
prevented closing and portal behavior. Live docs include a real demo, highlighted exact
copyable source, and honest limits. Existing Sheet and Select must remain interoperable.
The orchestrator proves fresh packed-registry installation/build/browser behavior.

## As built

Ten named parts preserve Radix props, refs and asChild. Content stays centered at
all widths, owns a viewport-bounded scroll region and injects no Portal, Overlay or
Close. Header/Footer are optional layout slots. Trigger, Close and Content own
solid two-pixel focus outlines using primary-ink; Trigger/Close own 44px minimum
height and width. There are no visual variants to configure.

Nine stories each carry a meaningful play. The live controlled form composes the
existing Select, keeps Cancel form-safe and leaves saving/validation to the caller.
The docs name the unreleased status and the explicit Portal/Overlay/Close contract.
The current shadcn Content wrapper injects those structural parts; Marquee exposes
them separately to follow its composition rule. Header/Footer are not sticky.

Test-first evidence: `dialog.test.tsx` was run before source existed and failed on
its missing import (2026-10-08; scratch `test-first.log`). After implementation,
14 focused contract/style tests passed. The stories, compiled targets and focused
files passed 220 tests across four files. Eight browser tests run at the three
configured widths and check behavior, real focus paint, nesting, scroll/hit tests
and exact copied source. The final focused browser run passed 24/24 in 21.3s on 2026-10-08,
using `DOCS_PORT=4191 pnpm --filter @marquee-ui/docs exec playwright test dialog.spec.ts`
against the built docs/Storybook. A five-file focused UI run passed 239 tests.
Dark/light/accent focus and tall mobile screenshots were opened and inspected.

Initial Light focus contrast failures sampled a transition; waiting for the host's
actual animations to finish made the same source meet the outline thresholds.
The nested Sheet test now waits for the parent layer's actual inert pointer state,
then confirms the child overlay is the pointer target before asserting separate
Escape/outside dismissal. This closes an effect-registration timing race without
adding a time delay or weakening the behavior assertions. The nested three-width
focused run and the full 24-test run passed with those state assertions.

No publication is authorized.

## Consumers

Before implementation, `rg -n` over Dialog part names found only the existing
Sheet's private Radix namespace and its fixture extraction, the shared source
inventory, and catalog/parity prose. No Marquee Dialog exports existed; no routes
or role contracts changed. Scan output: `consumers-before.txt` in stream scratch.

At source completion the ten exported names resolve to the following consumers:

```text
Dialog: apps/docs/browser/site.spec.ts, apps/docs/src/catalog.ts, apps/docs/browser/dialog.spec.ts, apps/docs/src/examples/dialog.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/src/dialog.tsx, packages/ui/test/dialog.test.tsx, packages/ui/test/dialog-focus.test.tsx, packages/ui/src/index.ts, packages/ui/src/sheet.tsx
DialogClose: apps/docs/src/examples/dialog.tsx, packages/ui/src/dialog.tsx, packages/ui/test/dialog-focus.test.tsx, packages/ui/src/index.ts, packages/ui/test/dialog.test.tsx, packages/ui/stories/dialog.stories.tsx
DialogContent: apps/docs/src/examples/dialog.tsx, packages/ui/test/dialog.test.tsx, packages/ui/test/dialog-focus.test.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/src/index.ts, packages/ui/src/dialog.tsx
DialogDescription: apps/docs/src/examples/dialog.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/test/dialog.test.tsx, packages/ui/src/dialog.tsx, packages/ui/src/index.ts
DialogFooter: apps/docs/src/examples/dialog.tsx, packages/ui/test/dialog.test.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/src/dialog.tsx, packages/ui/src/index.ts
DialogHeader: apps/docs/src/examples/dialog.tsx, packages/ui/src/dialog.tsx, packages/ui/src/index.ts, packages/ui/test/dialog.test.tsx, packages/ui/stories/dialog.stories.tsx
DialogOverlay: apps/docs/src/examples/dialog.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/src/dialog.tsx, packages/ui/src/index.ts, packages/ui/test/dialog.test.tsx
DialogPortal: apps/docs/src/examples/dialog.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/src/index.ts, packages/ui/test/dialog.test.tsx, packages/ui/src/dialog.tsx
DialogTitle: apps/docs/src/examples/dialog.tsx, packages/ui/src/index.ts, packages/ui/src/dialog.tsx, packages/ui/stories/dialog.stories.tsx, packages/ui/test/dialog.test.tsx, packages/ui/test/dialog-focus.test.tsx
DialogTrigger: packages/ui/src/index.ts, packages/ui/src/dialog.tsx, apps/docs/src/examples/dialog.tsx, packages/ui/test/dialog.test.tsx, packages/ui/test/dialog-focus.test.tsx, packages/ui/stories/dialog.stories.tsx
```

Touched-source tests: `dialog.test.tsx`, `dialog-focus.test.tsx`, the global story
runner, compiled Tailwind/target runner, registry consistency test, source inventory,
client-boundary, token/literal/brand guards and the Dialog browser spec. Existing
Sheet/Select exports are consumed without edits. Shared registration surfaces were
wired by the orchestrator at 9c10cbc. No sibling-owned consumer, changed route,
CROSS or unowned behavior. New part-role selectors are confined to these tests.
Literal-class consumers: generated `r/dialog.json` mirrors source; generic compile
and focus guards read rendered classes rather than pinning this family's strings.
