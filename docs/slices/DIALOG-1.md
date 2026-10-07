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

Pending implementation. No publication is authorized.
