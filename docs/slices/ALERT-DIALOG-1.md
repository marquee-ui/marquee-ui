# ALERT-DIALOG-1 — composed AlertDialog

Batch: BATCH-PARITY-2. Status: complete. Publication remains held in STATUS.md.

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
found the new source, stories, two family tests and live example, plus the
orchestrator's shared index export, docs catalog and `apps/docs/browser/site.spec.ts`.
Layer 1 identified the last path omitted from the initial prose; it was read and
recorded before the gate. The full consumer walk also reaches the shared stories,
Tailwind compile, registry, literal/brand and source-inventory guards. The existing Sheet story name remains a separate
story export. Path consumers are the shared source inventory, story suite map, docs
catalog and registry, all wired by the orchestrator. ARIA consumers are the existing
Sheet story and the new family contract/story/browser assertions. New focus class
literals have no pre-existing tests pinning their byte strings. CROSS: shared
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

## Layer 1 (reviewer, detached worktree of ec2761120803ef4fd086c2bfd1ce53eaf775c5ce; closure at 358739602cceaaced3bb3acd83bec64130f64526, isolated port 4196)

| file                                         | test                                                                                                     | mutation applied                                                                                                 | red / GREEN | what it asserts now                                                                            |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------------------------------- |
| packages/ui/test/alert-dialog.test.tsx       | opens a named and described portal, focuses Cancel and restores the trigger on Escape                    | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | outside pointer interaction cannot dismiss and tab focus stays in the confirmation                       | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | Keep draft closes uncontrolled state                                                                     | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | Remove draft closes uncontrolled state                                                                   | Action calls caller onClick then preventDefault; primitive close is no-op                                        | red         | Action must close uncontrolled state; actual alertdialog remained mounted                      |
| packages/ui/test/alert-dialog.test.tsx       | controlled state reports closing without overriding the caller                                           | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | prevented Action and Escape preserve open state for caller-owned asynchronous work                       | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | passes asChild, refs, native props and custom portal containers to caller hosts                          | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog.test.tsx       | Content renders inline without injecting a portal, overlay, title or controls                            | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Retains the unrelated contract named in this row; not an Action-close assertion                |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=false gives each control its own compiled target and focus paint                         | Remove focus-visible:outline-solid from all three source controls                                                | red         | Compiled self focus must declare solid; received var(--tw-outline-style)                       |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=true gives each control its own compiled target and focus paint                          | Remove focus-visible:outline-solid from all three source controls                                                | red         | Compiled self focus must declare solid; received var(--tw-outline-style)                       |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Default                               | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Story proves its named behavior through other closing paths, not the removed Action close      |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Destructive                           | Action calls caller onClick then preventDefault; primitive close is no-op                                        | red         | Destructive play requires Action click to close; actual alertdialog remained mounted           |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Controlled                            | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Story proves its named behavior through other closing paths, not the removed Action close      |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/PreventedClosing                      | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Story proves its named behavior through other closing paths, not the removed Action close      |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Composition                           | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Story proves its named behavior through other closing paths, not the removed Action close      |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/TallContent                           | Action calls caller onClick then preventDefault; primitive close is no-op                                        | GREEN       | Story proves its named behavior through other closing paths, not the removed Action close      |
| apps/docs/browser/alert-dialog.spec.ts       | AlertDialog names, focuses Cancel, traps focus, blocks outside dismissal and distinguishes actions       | Reviewer-only runtime stylesheet makes all three controls outline-style:none!important; DOM/handlers stay intact | GREEN       | Named semantic/source/geometry contract survives an unrelated focus-paint collapse             |
| apps/docs/browser/alert-dialog.spec.ts       | AlertDialog preserves the caller's asynchronous closing and nested Sheet input recovery                  | Reviewer-only runtime stylesheet makes all three controls outline-style:none!important; DOM/handlers stay intact | GREEN       | Named semantic/source/geometry contract survives an unrelated focus-paint collapse             |
| apps/docs/browser/alert-dialog.spec.ts       | AlertDialog source is highlighted and copies exact registry-alias composition                            | Reviewer-only runtime stylesheet makes all three controls outline-style:none!important; DOM/handlers stay intact | GREEN       | Named semantic/source/geometry contract survives an unrelated focus-paint collapse             |
| apps/docs/browser/alert-dialog.spec.ts       | isolated native and composed AlertDialog controls paint focus through presets, accents and forced colors | Reviewer-only runtime stylesheet makes all three controls outline-style:none!important; DOM/handlers stay intact | red         | Real focus outline required solid; actual none                                                 |
| apps/docs/browser/alert-dialog.spec.ts       | long AlertDialog panels stay centered inside the viewport and scroll to usable actions                   | Reviewer-only runtime stylesheet makes all three controls outline-style:none!important; DOM/handlers stay intact | GREEN       | Named semantic/source/geometry contract survives an unrelated focus-paint collapse             |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=false gives each control its own compiled target and focus paint                         | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=true gives each control its own compiled target and focus paint                          | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | opens a named and described portal, focuses Cancel and restores the trigger on Escape                    | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | outside pointer interaction cannot dismiss and tab focus stays in the confirmation                       | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | Keep draft closes uncontrolled state                                                                     | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | Remove draft closes uncontrolled state                                                                   | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | controlled state reports closing without overriding the caller                                           | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | prevented Action and Escape preserve open state for caller-owned asynchronous work                       | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | passes asChild, refs, native props and custom portal containers to caller hosts                          | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog.test.tsx       | Content renders inline without injecting a portal, overlay, title or controls                            | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Default                               | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Destructive                           | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Controlled                            | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/PreventedClosing                      | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/Composition                           | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/stories.test.tsx            | every story renders, and every play function passes > alert-dialog/TallContent                           | Force actionVariants({ variant: "primary" }); destructive visual axis becomes no-op                              | GREEN       | Existing contract/focus/story assertions survive removed destructive paint                     |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=false gives each control its own compiled target and focus paint                         | At 3587396, force actionVariants({ variant: "primary" }) again                                                   | GREEN       | Independent primary/focus behavior still passes; unrelated to destructive collapse             |
| packages/ui/test/alert-dialog-focus.test.tsx | native/composed=true gives each control its own compiled target and focus paint                          | At 3587396, force actionVariants({ variant: "primary" }) again                                                   | GREEN       | Independent primary/focus behavior still passes; unrelated to destructive collapse             |
| packages/ui/test/alert-dialog-focus.test.tsx | primary Action preserves its compiled visual border, ink and ground                                      | At 3587396, force actionVariants({ variant: "primary" }) again                                                   | GREEN       | Independent primary/focus behavior still passes; unrelated to destructive collapse             |
| packages/ui/test/alert-dialog-focus.test.tsx | destructive Action preserves its compiled visual border, ink and ground                                  | At 3587396, force actionVariants({ variant: "primary" }) again                                                   | red         | New destructive compiled border assertion detects var(--primary) instead of var(--destructive) |

All GREEN rows for the Action-close and focus-collapse probes exercise unrelated
contracts; the named close and focus rows fail. The original force-primary GREEN
rows expose one visual-axis gap, closed by committed primary/destructive compiled
border, ink and ground assertions. The independently repeated mutation at
`358739602cceaaced3bb3acd83bec64130f64526` fails the intended destructive border-role
assertion, then all four compiled tests pass after restoration. Independent closure
baseline: 175 unit/story checks, exit 0. Original source browser baseline: 15 passed,
exit 0. Layer 1 found 0 HIGH, 1 MEDIUM and 1 LOW; both findings are closed. Seven
bounded mutation runs cover every touched test file; the two original force-primary
runs stayed GREEN and the added compiled assertion closes that gap. Reviewer preview
and detached worktree were removed before the full gate.

## Full gate and handoff

The first `DOCS_PORT=4192 pnpm verify` at committed
`0734196138c90e1690ee54384ab23a4bdbc06b87`, 2026-10-08, exited **1** in 22s:
**751 passed / 1 failed (752)** library tests. The build was fresh; later stages
were not reached. The sole failure was the shared focus-site inventory discovering
`alert-dialog.tsx (focus-visible)` while its pinned list still named the old set.
The orchestrator corrected the inventory in `2cda91e811b98c44145520e4aba440d32097785d`
and measured **21 focused tests passed**. The same reviewer confirmed that the
one-line addition acknowledges the discovered source site, weakens no assertion
and adds no exemption. Source and previous review closure remained unchanged.

The orchestrator authorized the necessary fresh full gate at that fixed committed
head. `DOCS_PORT=4192 pnpm verify`, 2026-10-08, exited **0** in **123s**:
**42 library files / 752 passed**, **4 docs files / 39 passed**, **5 consumer checks
passed / 0 failed**, and **99 responsive browser cases passed (1.7m)**. Logs and
exit sentinels for both verdicts are preserved in
`/home/ankit/.marquee-scratch/BATCH-PARITY-2/alert-dialog/verify.*` and
`verify-fixed.*`; the final commit changes this record only.

Retro: shared registration must include dynamically derived focus-site inventory
pins as well as export/source/story/registry/catalog maps. Visual variant coverage
must observe compiled roles; closing alone cannot protect a visual axis. Browser
focus measurements must enter keyboard modality, and assertions must follow the
primitive's documented behavior rather than assume a scrim click retains the
previously focused control. No unresolved review finding or source defect remains.
