# ALERT-DIALOG-1 — composed AlertDialog

Batch: BATCH-PARITY-2. Status: active. Publication remains held in STATUS.md.

## Scope and ownership

Own `packages/ui/src/alert-dialog.tsx`, `packages/ui/stories/alert-dialog.stories.tsx`,
`packages/ui/test/alert-dialog*.test.tsx`, `apps/docs/src/examples/alert-dialog.tsx`,
`apps/docs/browser/alert-dialog.spec.ts`, and this record. Stream port 4192; reviewer
port 4196. The orchestrator alone owns manifests/lock, source/export/story maps,
registry/counters, catalog, global family counts, STATUS and packed-consumer proof.
Request shared wiring when source and stories are ready; do not edit shared files.

Use real @radix-ui/react-alert-dialog, not a relabeled Dialog. Cancel receives initial focus; outside pointer interaction must not dismiss; Escape cancels by default; explicit Cancel and Action close distinctly. Caller may prevent closing for async work. Prove nested Sheet/AlertDialog focus restoration and background input recovery.

References checked 2026-10-08: [Radix AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
and [shadcn AlertDialog](https://ui.shadcn.com/docs/components/radix/alert-dialog).
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

Eleven named parts wrap real Radix AlertDialog 1.1.24: Root, Trigger, Portal,
Overlay, Content, Header, Footer, Title, Description, Action and Cancel. Portal
and overlay are explicit. Content injects no structural controls; its centered
panel is bounded by the viewport and scrolls. Action has primary/destructive visual
variants. Every native and composed control owns 44px targets and a solid 2px
keyboard outline using readable action ink. Header/Footer are optional asChild slots.

Six stories each run a meaningful play: Default, Destructive, Controlled,
PreventedClosing, Composition (existing Sheet) and TallContent. Contract tests cover
controlled/uncontrolled state, Cancel focus, trapped keyboard focus, outside blocking,
Escape/Action prevention, refs, asChild, portal containers and unwrapped inline content.
Browser checks exercise exact highlighted clipboard source, simulated asynchronous
closing, nested Sheet recovery and real isolated focus paint across dark/light,
Violet accent and forced colors at 390/768/1280px. Media and custom layouts remain
caller composition. No publication is authorized.

## Consumers

Before implementation, `rg -n 'AlertDialog|alert-dialog|getByRole\("alertdialog"'
packages apps registry.json` returned:

```text
packages/ui/stories/sheet.stories.tsx:88:export const AlertDialog: Story = {
packages/ui/package.json:24:    "@radix-ui/react-alert-dialog": "^1.1.24",
```

At the source commit, an exact-symbol `rg -l` scan of all eleven exported names
found only the new source, stories, two family tests and live example, plus the
orchestrator's shared index export. The existing Sheet story name remains a separate
story export. Path consumers are the shared source inventory, story suite map, docs
catalog and registry, all wired by the orchestrator. ARIA consumers are the existing
Sheet story and the new family contract/story/browser assertions. New focus class
literals have no pre-existing tests pinning their byte strings. CROSS: four shared
registration surfaces, owned and wired by the orchestrator. No unowned behavior changed.

## Verification notes

2026-10-08: test-first source absence failed import resolution; implementing the
primitive passed eight contract tests. Compiled per-host target/focus tests add two
cases. Full typecheck passed. All 163 composed story tests passed after correcting
Controlled's play to observe its open panel and its status after closing; modal
ARIA hiding correctly makes background status inaccessible while open. The first
focused browser run passed 9/15: two new assertions assumed identical focus after
an outside click and checked keyboard focus paint in pointer modality. The corrected
checks prove the outside point hits the explicit overlay, the alert stays open,
and Tab recovers Cancel inside the trap. Chromium may blur a focused button to
`document.body` when the non-focusable scrim is clicked; Radix does not promise to
retain the previously focused button. Focus paint checks enter keyboard modality
before measuring focus-visible paint. Source behavior did not change to satisfy them.

Final focused browser run: `DOCS_PORT=4192 pnpm --filter @marquee-ui/docs exec
playwright test browser/alert-dialog.spec.ts`, 2026-10-08, **15 passed (24.6s)**.
Native dark and composed light/Violet images at 390px, plus tall scroll panels at
768/1280px, were inspected: controls and focus outlines are visible, panels remain
inside the viewport and bottom actions are reachable. Repo lint and typecheck passed.
