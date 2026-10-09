# BATCH-PARITY-5 — Combobox and Calendar

Date: 2026-10-08. Base: `b0ec909400aef7891adde096cc5ff415e2634ffb`.
Corrected source/gated/preview: `4123edc5db43e891e207369ad2d52db753bb8b25`.
Later completion commits change records/images only. Public operations remain held.

## Scope and ownership

[COMBOBOX-1](../slices/COMBOBOX-1.md) adds eleven explicit parts around cmdk 1.1.1
and the compatible Radix Popover. It supports a single-select searchable popup;
committed choice, display label and form transport belong to the caller. This is not
current-shadcn Base UI API parity. Editable inline input, chips/multiple selection,
object collections and virtualization remain deferred. cmdk's native root/list/group
asChild path is unsupported and omitted; supported hosts and composed children remain explicit.

[CALENDAR-1](../slices/CALENDAR-1.md) adds typed single/multiple/range selection with
DayPicker 10, caller state and replaceable Root/DayButton/navigation slots. Time selection,
alternate calendars and exhaustive locale/timezone proof remain outside this slice.
DatePicker input/popup API is Batch 6. The default Calendar needs at least **328px** of
host space. Week numbers/custom slots may need more. Mobile docs grant **330px**;
verified overlay callers use Dialog `p-3` and Popover `w-auto p-2` to preserve 44px days.

Two isolated streams own family source/stories/tests/examples/slices. The orchestrator
owns shared registration, dependencies, generated registry, guide, counts and merged proof.
Measured inventory: **31 families / 32 registry items / 196 stories / 166 plays**.
All overlay primitives retain the shared dismissable-layer 1.1.20/focus-scope 1.2.0 generation.

## Verification

Commands use Node 22.18.0/pnpm 10.24.0 on 2026-10-08. Scratch root:
`/home/ankit/.marquee-scratch/BATCH-PARITY-5/`.

- Baseline `DOCS_PORT=4182 pnpm verify`: exit 0, 246s; 878 library / 39 docs /
  5 consumer / 219 browser. It proves the starting tree only.
- Combobox independent review closed a scroll helper that repaired the failure it
  should detect. End-scroll now asserts movement before the helper; no-op mutation
  fails at all widths. First full gate exposed fill-only Separator forced-color loss;
  a border preserves its geometry and survives forced colors. Independent old-source
  guard/browser reds and restored greens are retained. Corrected gate at `2b19857`:
  exit 0, **897 / 39 / 5 / 240**, 264s. Full mutation tables remain in the slice.
- Calendar review closed text-alpha measurement and missing story-consumer entries.
  Its initial gate at `b857e0e` passed **897 / 39 / 5 / 234**, 302s, but missed the
  visual containment defect below. After correction and fresh independent review,
  the required repeat gate at `0dabffb` passed **897 / 39 / 5 / 237**, 296s.
- Final merged `DOCS_PORT=4182 pnpm verify`: **exit 0**, 321s,
  **916 library tests in 54 files / 39 docs / 5 consumer / 258 Chromium browser cases**
  at 390/768/1280. `integration/verify.*` holds source, times, runner and exit sentinel.
- Fresh external npm cache and real UI/tokens tarballs: **18 copied files equal the
  installed registry and source bytes**, strict TypeScript/Vite build green,
  **63 browser cases passed**, 62.428s, no skipped/flaky cases. This includes real
  Calendar Dialog/Popover containment and Saturday hits/selection, Combobox nested
  Escape/focus/form state, Calendar modes/keyboard/limits/range paint, prior overlay
  lifecycle and Slider geometry. Paint is measured outside docs CSS, including
  style/width/alpha, actual exterior contrast and effective ancestor visibility.
  [Packed provenance](BATCH-PARITY-5-evidence/consumer-provenance.json).
- [Merged independent review](BATCH-PARITY-5-review.md): **12/12** independent
  width/theme combinations passed at the same source. Real Dialog/Combobox/Calendar/
  Popover transitions, caller forms, Escape/reopen and cleanup have no open product
  findings. A visual follow-up also passed three below-fold Popover Close checks.
  Mobile Dialog content/root are both 330px and Saturday has nine real hit
  points. Minimum measured effective text contrast is 12.02:1; exterior focus is
  7.066:1 with solid 2px+ outlines. The initial rounded-corner probe error is retained
  in that report and corrected with shape-valid edge points.

Consumer reproduction: `node ~/.marquee-scratch/BATCH-PARITY-5/candidate-proof.mjs
/home/ankit/Code/marquee-ui ~/.marquee-scratch/BATCH-PARITY-5/consumer-new
~/.marquee-scratch/BATCH-PARITY-5/candidate.spec.ts`. Use a fresh target.

## Retained failures and containment correction

Full-canvas inspection found Saturday spilling beyond Calendar's own border after
its original green gate. At 390px the docs canvas was 306px, the grid 308px, and the
frame's padded content only 286px; the last column extended 12px outside its frame.
Viewport-only bounds stayed green. Calendar now preserves its intrinsic minimum,
and its mobile docs caller grants enough space instead of clipping or shrinking days.
The new regression measures root/grid/canvas bounds and real Saturday hit points.

The fresh detached reviewer separately removed the minimum (306 < 328), restored
old padding (canvas 306 < 328), displaced Saturday (392 > 350.5) and shrank its target
(20 < 44). Each failed its predicted assertion. Component collapse failed all fifteen
behavior cases; the three surviving source-copy cases failed a separate clipboard no-op.
Restored fresh build passed **18 family + 3 independent browser cases / 53 focused tests**.
The exact eleven-row supplemental table, original red traces and old green gate remain
in the slice and `r6/geometry/`.

The first packed run passed 56 and failed seven. Three asserted aria-disabled where
DayPicker correctly uses a native disabled button; they now assert disabled semantics.
Three measured a real 1:1 focus boundary because the new caller form placed its primary
Submit button flush beside the Combobox trigger. Explicit caller spacing fixes that
fixture while retaining the same exterior-contrast assertion and package bytes.
One existing phone Tooltip check closed during keyboard entry; a same-build repeat
also failed, while instrumented original and centered flows passed. The probe now
centers and settles before keyboard entry; the full 63-case run is green. Its precise
cause remains **unproved; no component fix is claimed**. Initial reports/traces, the
same-build discriminator and diagnostic events remain in `consumer-final/proof/`.

The shared focus-outline inventory still aggregates hosts per file; independent per-host
paint controls supplement that known limitation. Earlier Batch 3 tablet Dialog and Batch 4
submenu timing observations also remain cause-unproved. Disabled named Slider alone
still serializes; the documented disabled-fieldset workaround remains in force.

## Responsive inspection and local delivery

All six viewport images, both complete family canvases at all widths, nine separate
Calendar frames and the two packed light-mode images were opened and inspected.
The sticky Theme Studio overlays part of tall canvas captures, so the separate frames
provide unobscured views of every date row. Frames/grids/host bounds and live Saturday
hit/selection pass at all widths; no day target shrank below 44px.

| Width | Combobox                                           | Calendar canvas                                            | Calendar range frame                                       |
| ----- | -------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| 390   | [Popup](BATCH-PARITY-5-evidence/combobox-390.png)  | [Canvas](BATCH-PARITY-5-evidence/calendar-canvas-390.png)  | [Frame](BATCH-PARITY-5-evidence/calendar-frame-390-2.png)  |
| 768   | [Popup](BATCH-PARITY-5-evidence/combobox-768.png)  | [Canvas](BATCH-PARITY-5-evidence/calendar-canvas-768.png)  | [Frame](BATCH-PARITY-5-evidence/calendar-frame-768-2.png)  |
| 1280  | [Popup](BATCH-PARITY-5-evidence/combobox-1280.png) | [Canvas](BATCH-PARITY-5-evidence/calendar-canvas-1280.png) | [Frame](BATCH-PARITY-5-evidence/calendar-frame-1280-2.png) |

[Original overflowing Calendar](BATCH-PARITY-5-evidence/before-calendar-390.png).
Stable **http://localhost:4174/marquee-ui/** is refreshed, PID **2248094**. Its snapshot
is `/home/ankit/Code/marquee-integration-parity-5/apps/docs/dist`; all **112** files served
on both review and stable ports equal the gate build byte for byte. Live search/commit/form state,
Calendar single/multiple/range/reset, focus return, source highlighting and geometry
passed at all widths without page errors. Served index SHA256:
`4fda33c0258cefe2d77720883f87d3f035f32c9946a85b32a25676b92e919c64`.

No main merge, public deployment, Pages activation, npm publication, version bump or
domain operation. UI 0.1.10/main registry do not contain the new families. Draft PR #2
stays unmerged. Exact final-head CI and cleanup belong to `integration/final-handoff.md`.
Next: BATCH-PARITY-6 — DatePicker and Table.

## Retro

A viewport bound does not prove containment within a component's painted frame. Test
root, grid and caller content bounds separately, preserve intrinsic dimensions, and
inspect entire canvases plus unobscured frames. A helper must not repair scrolling
before asserting it. Native disabled semantics and meaningful ARIA names take precedence
over an assumed attribute shape. Keep failed probes and actual product failures distinct.
