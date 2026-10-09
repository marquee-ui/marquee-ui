# BATCH-PARITY-4 — DropdownMenu and Slider

Date: 2026-10-08. Base: `c7bdb87cdcc0c0824f085abee74eb43be1199550`.
Corrected source/gated/preview: `f7a9e5e326ea9dec887a4a876102dab559526e0d`.
Later completion commits change records/images only. Public operations remain held.

## Scope and ownership

[DROPDOWN-MENU-1](../slices/DROPDOWN-MENU-1.md) adds sixteen explicit menu parts:
caller-composed Portal, Arrow, indicators and submenus, with checked/radio state and
controlled/uncontrolled lifecycle. [SLIDER-1](../slices/SLIDER-1.md) adds Root, Track,
Range and named Thumb parts; values never generate structure. Primitive props and
asChild pass through; styles use token roles. Actual Slider hosts remain 44×44px,
with smaller circular markers.

The orchestrator owns shared exports/maps, registry, counts, guide and combined proof.
Measured inventory: **29 families / 30 registry items / 181 stories / 151 plays**.
DropdownMenu `^2.1.25` shares the existing overlay generation; Slider uses `^1.5.0`.
New families are unreleased. Controlled Slider callers must accept reset callbacks.
A disabled named Radix Slider alone still serializes: the demonstrated native disabled
fieldset excludes its value. This is a measured workaround, not native-disabled parity.

## Verification

All commands use Node 22.18.0 and pnpm 10.24.0 on 2026-10-08. Scratch root:
`/home/ankit/.marquee-scratch/BATCH-PARITY-4/`.

- Baseline `DOCS_PORT=4182 pnpm verify`: exit 0, 184s; 821 library / 39 docs /
  5 consumer / 174 browser cases, belonging to the starting tree.
- DropdownMenu independent review closed one MEDIUM broken Storybook link and two LOW
  paint-instrument findings (actual surrounding contrast and cumulative focus opacity).
  Named mutations, restored checks and the full table remain in the slice record.
  First gate: 851 / 39 / 5 green, 200 browser passed / 1 failed. The new Preview
  DropdownMenu name also matched a shared navigation query for Menu. All three nav
  queries now require exact names; the exact-build discriminator and corrected full
  gate passed: 851 / 39 / 5 / 201, 216s. The earlier submenu timing observation remains
  **cause-unproved; no fix is claimed**.
- Slider independent review closed one LOW hidden-input naming guard gap. The narrow
  transport exception now resolves actual nonempty names; empty labels and dangling
  labelledby references fail. Existing native Select transport remains supported.
  Initial gate: 848 / 39 / 5 / 189, 214s. After the vertical correction below, its
  required new full gate passed: **848 library / 39 docs / 5 consumer / 192 browser**, 212s.
- Corrected merged `DOCS_PORT=4182 pnpm verify`: **exit 0**, 248s,
  **878 library tests in 51 files / 39 docs / 5 consumer / 219 Chromium browser cases**
  at 390/768/1280. `integration/verify.*` records source, runner and exit sentinel.
- Fresh corrected packed consumer: new npm cache, real UI/tokens tarballs, no workspace
  links; **16 copied files match installed registry and source bytes**, strict TS/Vite
  build green and **45 browser cases passed**, 39.0s. Includes menu
  actions/checked/radio/submenu, existing overlay composition, Slider keyboard/pointer/
  native forms/reset, vertical normal/inverted/range geometry and actual paint outside
  docs CSS in dark/light/forced colors. [Provenance](BATCH-PARITY-4-evidence/consumer-provenance.json).
- [Merged independent review](BATCH-PARITY-4-review.md): the vertical geometry finding
  is closed on the corrected source; no outstanding findings. Separate nested lifecycle,
  nonmodal dismissal, focus/paint and normal/inverted/range geometry checks passed.

Consumer reproduction: `node ~/.marquee-scratch/BATCH-PARITY-4/candidate-proof.mjs
/home/ankit/Code/marquee-ui ~/.marquee-scratch/BATCH-PARITY-4/consumer-new
~/.marquee-scratch/BATCH-PARITY-4/candidate.spec.ts`. Target must be fresh.

## Retained failures and the vertical blind spot

The first combined source `6e5402c3f7626f9b971f8678c8ae656f8d950c4b` passed its
878 / 39 / 5 / 216 gate in 240s. Its consumer initially passed 33 cases and failed nine:
menu behavior and menu paint used the wrong accessible name (six failures), and the
larger composed Popover covered the center of the outside action button (three).
The corrected probes use the live accessible name, prove an exposed click point,
await real focus and retain checked state across paint modes. The full unchanged-source
42-case run passed in 32.6s. All nine original failures/traces and the runner remain
in `consumer-final/proof/initial-results*` and `integration/consumer.log`.
[Intermediate provenance](BATCH-PARITY-4-evidence/consumer-initial-provenance.json).

The fresh corrected package initially passed 42/45 cases, including all vertical cases.
Placing the new vertical fixture before existing controls moved two Dialog targets
outside the viewport and altered the Tooltip Tab/scroll path (three probe failures).
The new section now follows those controls; hit assertions scroll the real target into
view and wait for exposed geometry. The unchanged installed packages then passed all
45 cases. These three original traces are retained in
`consumer-corrected/proof/geometry-fixture-initial-results*`.

Full-canvas screenshot inspection then found a real vertical Slider defect: `h-full`
overrode Radix's opposing offsets, so a 40% range painted 192px and extended 115.1875px
below its track. Horizontal checks and vertical thumb movement had left that paint
unmeasured. `data-[orientation=vertical]:h-auto` restores proportional selected paint.
The original green gate and overflowing images are preserved in
`integration/before-slider-fix/`; they are intermediate evidence, superseded above.

The new geometry regression failed at all three widths on the original build.
The detached reviewer independently replanted the bug: all three new family cases
and nine normal/inverted/range cases failed on the predicted bounds/proportion
assertions, while the older fifteen family cases stayed green. Restored fresh builds
passed **18 family + 9 independent cases**, including low/middle/high values
0/25/50/75/100, true color pixels and no selected hit below the track. A separate packed
negative control also failed all three widths on the prior installed source. These
controls close the measured blind spot without weakening existing behavior checks.

## Responsive inspection and local delivery

All six docs viewport images, complete Slider canvases and the packed light-mode image
were opened and inspected. Corrected vertical fills stay inside the tracks, the adjacent
text is clear, and menu content/arrows/focus remain visible and bounded.

| Width | DropdownMenu                                           | Corrected Slider canvas                                  | Original overflowing canvas                                     |
| ----- | ------------------------------------------------------ | -------------------------------------------------------- | --------------------------------------------------------------- |
| 390   | [Menu](BATCH-PARITY-4-evidence/dropdown-menu-390.png)  | [Slider](BATCH-PARITY-4-evidence/slider-canvas-390.png)  | [Before](BATCH-PARITY-4-evidence/before-slider-canvas-390.png)  |
| 768   | [Menu](BATCH-PARITY-4-evidence/dropdown-menu-768.png)  | [Slider](BATCH-PARITY-4-evidence/slider-canvas-768.png)  | [Before](BATCH-PARITY-4-evidence/before-slider-canvas-768.png)  |
| 1280  | [Menu](BATCH-PARITY-4-evidence/dropdown-menu-1280.png) | [Slider](BATCH-PARITY-4-evidence/slider-canvas-1280.png) | [Before](BATCH-PARITY-4-evidence/before-slider-canvas-1280.png) |

Stable **http://localhost:4174/marquee-ui/** serves the reviewed source from
`/home/ankit/Code/marquee-integration-parity-4/apps/docs/dist`, PID 1897383.
All 109 serving files equal the gate build byte for byte. Served index SHA256:
`8b13189348fe9be001ef4f9f945a4c1b7a143f5752408f468e1555c8e70c4d81`. Actual menu checked/radio/submenu,
Slider keyboard/save/reset, focus return, highlighted examples and vertical geometry
passed without page errors; `integration/preview-4174.json` records the proof.

No main merge, public deployment, Pages activation, npm publication, version bump or
domain operation. UI 0.1.10/main registry do not contain the new families. Draft PR #2
stays unmerged; exact final-head CI and cleanup are recorded in `integration/final-handoff.md`.
Next: BATCH-PARITY-5 — Combobox and Calendar.

## Retro

Actual thumb motion does not prove selected-range geometry. Measure both the changing
value and the visible selected span, in each orientation, and inspect the complete demo
canvas. Wait for live focus/listener/animation readiness and use one persistent pointer
session. Keep the inherited Batch 3 tablet Dialog timing observation and this batch's
submenu timing observation cause-unproved; neither received a demonstrated product fix.
