# BATCH-PARITY-6 — DatePicker and Table

Date: 2026-10-08. Base: `a4be556758fd82807177ddc014a7260227182fc8`.
Corrected product/gated/preview source: `78ef78e3573961418866c2cfd95a5197effdb25f`.
Completion commits change records and evidence only. Public operations remain held.

## Scope and decisions

[DATE-PICKER-1](../slices/DATE-PICKER-1.md) adds explicit namespaced Calendar/Popover
parts. Selection, formatting, closing, hidden form values and reset remain caller-owned.
The standard Calendar needs 328px; custom slots, extra months and week numbers may need
more. The nested recipe uses cancelable `onOpenAutoFocus` to choose the roving day after
the child focus scope mounts. The aliases alone do not promise selected-day autofocus.
Date text parsing, time selection and drop-in shadcn API parity are outside this contract.

[TABLE-1](../slices/TABLE-1.md) adds native table anatomy and a separately composed,
meaningfully named keyboard-scroll container. Captions, header scopes, spans, refs,
slot hosts and cell controls remain native. Sorting, filtering, pagination, data state
and virtualization are not provided; DataTable is Batch 7.

Streams owned family source, stories, focused tests, examples and slice records.
The coordinator owned shared maps/exports/counts/registry/docs and merged proofs.
Measured inventory: **33 families / 34 registry items / 205 stories / 175 plays**;
35 generated source files and 37 registry edges. No dependency or lockfile change.
Calendar/Popover/Radix generation and the existing theme contracts remain in force.

## Verification

Node 22.18.0 / pnpm 10.24.0, 2026-10-08. Scratch root:
`/home/ankit/.marquee-scratch/BATCH-PARITY-6/`.

- Baseline `DOCS_PORT=4182 pnpm verify`: exit 0, 316s; 916 library / 39 docs / 5 consumer / 258 browser.
- DatePicker stream first full gate at `74086b4`: exit 0, 336s; 931 / 39 / 5 / 273.
  Independent review closed an unnecessary client-boundary directive and a stale
  consumer count; nine controls retain predicted red/restore evidence in its slice.
  The later inset-focus repair has its own independent review and corrected gate below.
- Table stream corrected gate at `ad60662f`: exit 0, 336s; 928 / 39 / 5 / 270.
  Twenty independent controls include a host-specific event propagation regression.
  Its first gate failed three shared site inventory cases because the coordinator
  missed the live preview count (31→32); all twelve Table cases passed. An independent
  removed-preview control now fails despite an unchanged count. Original red retained.
- First merged source `b059142`: exit 0, 367s; 943 library / 39 docs / 5 consumer / 285 browser.
  It did not prove the reachable fallback-focus contrast case discovered by layer2.
- Corrected DatePicker full gate: at `11dea0acad9b3ad5667430b6efe89b8dd458b2c2`: exit 0, 349.5s; **933 library / 39 docs / 5 consumer / 273 browser**. Independent old-source tests fail at the predicted offset/contrast assertions and restore green; installed natural fallback proof passes nine mode/width combinations.
- Corrected merged `DOCS_PORT=4182 pnpm verify`: exit 0, 370s; **945 library tests in 58 files / 39 docs / 5 consumer / 285 Chromium browser cases** at 390/768/1280.
- Fresh packed candidate: strict TypeScript/Vite build green, **20 copied files** byte-identical to installed registry and source, **81 browser cases passed**, no skipped/flaky cases. This exercises prior overlay lifecycle,
  Calendar/Slider geometry, DatePicker caller forms/ranges/nesting, Table native keyboard
  scroll before any helper and real last-column actions. The fallback panel focus check
  opens an all-disabled/no-navigation Calendar using Enter, then observes unrepaired
  focus and actual inset paint in dark/light/forced colors at all three widths.
  [Packed provenance](BATCH-PARITY-6-evidence/consumer-provenance.json).
- [Independent merged review](BATCH-PARITY-6-review.md): no unresolved findings; 6/6 independent width/theme compositions, 84 focused-host measurements and 3/3 natural fallback reproductions passed. Actual inset ring contrast is 7.626:1.

Reproduce the fresh candidate with Node 22:
`node ~/.marquee-scratch/BATCH-PARITY-6/candidate-proof.mjs /home/ankit/Code/marquee-ui
~/.marquee-scratch/BATCH-PARITY-6/consumer-new ~/.marquee-scratch/BATCH-PARITY-6/candidate.spec.ts`.
Use a fresh external target. Public UI 0.1.10/tokens 0.1.0 do not contain these additions;
this is packed candidate evidence, not evidence of a public release.

## Retained failures and bounded corrections

Layer2 proved a reachable focus defect: a disabled Calendar with hidden navigation
and no Close leaves no enabled focus candidate, so Radix focuses DatePickerContent.
Over a parent Dialog's light-theme scrim, the inherited outward ring painted at only
**1.23–1.59:1** against actual screenshot pixels. DatePickerContent now places its
solid ring inside its opaque panel with a -4px offset; caller class overrides remain
available. Popover itself was not changed. Original natural-focus screenshots, pixel
samples, independent old-source red and corrected proof are retained by the review.

The original packed run was 77/78: its desktop cross-composition helper compared host
and Calendar rectangles from different frames during native table scroll. A same-build
20-frame diagnostic at each width proved atomic containment during movement. Desktop
scroll 68→180 moved both host and root left 811→699 together, with same-frame delta 0.
The helper now observes settlement and reads host/root/grid/viewport in one evaluation,
without scrolling or weakening any bound. The corrected same-build run passed 78/78;
its original log, failed result, trace events and screenshots remain in
`consumer-final/proof/initial-failure`. The later product focus fix required a fresh pack. Its first 81-case run passed 78 and failed the three new cases because the probe incorrectly required outline alpha 1 in forced colors (actual 0.8). The final probe requires visible alpha and keeps actual alpha-composited contrast ≥3, solid 2px paint and inset placement. The complete 81-case rerun passed; all original traces remain in `consumer-final-corrected/proof/initial-alpha-assertion`.

Earlier cause-unproved Dialog/submenu/Tooltip timing observations remain in prior batch
records; no fix for them is claimed here. The shared focus inventory still aggregates
hosts per source, so independent per-host browser paint supplements it.

## Responsive inspection and localhost

All 36 final docs captures were checked: 33 were byte-identical to already inspected originals; the 3 changed images were opened again. Six packed light captures were byte-identical to inspected originals, and nine new fallback-focus captures were opened in dark/light/forced colors. Screenshots include complete family canvases, all date rows, range
state, wide table actions/empty state, the final explanatory prose and nested Close
controls reached by real wheel input. Horizontal frame/grid/host containment and
44px last-column Saturday hits pass; tall panels intentionally scroll vertically.

| Width | DatePicker                                            | Below-fold Close                                            | Table actions                                             |
| ----- | ----------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- |
| 390   | [Popup](BATCH-PARITY-6-evidence/date-picker-390.png)  | [Close](BATCH-PARITY-6-evidence/date-picker-close-390.png)  | [Actions](BATCH-PARITY-6-evidence/table-actions-390.png)  |
| 768   | [Popup](BATCH-PARITY-6-evidence/date-picker-768.png)  | [Close](BATCH-PARITY-6-evidence/date-picker-close-768.png)  | [Actions](BATCH-PARITY-6-evidence/table-actions-768.png)  |
| 1280  | [Popup](BATCH-PARITY-6-evidence/date-picker-1280.png) | [Close](BATCH-PARITY-6-evidence/date-picker-close-1280.png) | [Actions](BATCH-PARITY-6-evidence/table-actions-1280.png) |

Stable **http://localhost:4174/marquee-ui/** serves the immutable corrected snapshot
`/home/ankit/Code/marquee-integration-parity-6/apps/docs/dist`, PID **2606137**.
All **115** served files equal the gate build and snapshot byte for byte.
Live DatePicker/Table flows and source highlighting pass at 390/768/1280 with zero
page errors. Index SHA256: `bee24a0575f930708f2d9263c9b964d947f356d63f1f1f43a3e563b00c8d8bcc`.

No main merge, public deploy, Pages activation, npm publication, version bump or domain
operation occurred. Draft PR #2 stays open and unmerged. Exact final-head CI and cleanup:
`integration/final-handoff.md`. Next: **BATCH-PARITY-7 — DataTable and Chart**.

## Retro

Inspect the runtime family-count assertion together with catalog/unit inventories before
launching stream gates. Use separate parent/child event spies so bubbling cannot hide a
lost prop. Measure moving portal geometry atomically. Include naturally reachable panel
fallback focus, since testing only enabled day buttons misses an inherited ring boundary.
Keep original reds and distinguish proof-instrument corrections from product repairs.
